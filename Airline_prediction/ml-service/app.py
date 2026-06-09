import os
import sys
import subprocess

# Auto-detect and use virtual environment if available
def ensure_venv():
    # Use absolute path for venv detection
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_dir = os.path.join(base_dir, 'venv')
    venv_python = os.path.join(venv_dir, 'Scripts', 'python.exe')
    
    # Robust check: Normalize paths to handle case sensitivity and different separators
    current_exe = os.path.normcase(os.path.abspath(sys.executable))
    expected_exe = os.path.normcase(os.path.abspath(venv_python))
    
    # Strictly check if we are using the SPECIFIC venv python
    is_correct_venv = current_exe == expected_exe
    
    if not is_correct_venv and os.path.exists(venv_python):
        print(f"Switching to the correct virtual environment for ML Service: {venv_dir}")
        os.environ['VENV_AUTO_SWITCHED'] = '1'
        subprocess.call([venv_python] + sys.argv)
        sys.exit(0)

ensure_venv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the Express backend/React frontend

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'flight_price_model.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'label_encoders.pkl')
STATS_PATH = os.path.join(BASE_DIR, 'model_stats.pkl')

# Load the trained model and encoders at startup to avoid re-loading on every request
print("Loading model and encoders...")
try:
    model = joblib.load(MODEL_PATH)
    label_encoders = joblib.load(ENCODER_PATH)
    stats = joblib.load(STATS_PATH)
    print("Model, encoders, and stats loaded successfully.")
except Exception as e:
    print(f"Error loading model/encoders: {e}")
    # In a real app we might want to exit, but for dev we can let it run until the files are ready
    model, label_encoders, stats = None, None, None


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


@app.route('/predict', methods=['POST'])
def predict():
    if not model or not label_encoders:
        return jsonify({'error': 'Model not loaded. Ensure train.py has been run successfully.'}), 503

    try:
        data = request.json
        print(f"Received prediction request: {data}")
        
        # Convert the incoming JSON into a DataFrame
        # The frontend/backend should send an array of objects or a single flat object
        # Example: {"airline": "Vistara", "source_city": "Delhi", ...}
        df = pd.DataFrame([data])
        
        # Process categorical features using the saved label encoders
        for col, le in label_encoders.items():
            if col in df.columns:
                # Handle unseen labels by mapping them to an existing label or raising an error
                # For simplicity here we assume the label exists in the training set
                try:
                    df[col] = le.transform(df[col].astype(str))
                except ValueError as ve:
                     return jsonify({'error': f"Unknown value in column {col}: {df[col].values[0]}"}), 400
                     
        # Ensure all columns required by the model are present in the correct order
        # We can use the 'features' key from the stats
        expected_cols = stats.get('features', df.columns.tolist()) if stats else df.columns.tolist()
        
        # Fill missing numeric columns with 0
        for col in expected_cols:
             if col not in df.columns:
                  # This happens if user didn't provide it
                  df[col] = 0
                  
        # Reorder to match training
        df = df[expected_cols]

        # Predict
        prediction = model.predict(df)
        
        # Return result
        return jsonify({
            'price_predicted': float(prediction[0]),
            'currency': 'INR' # Dataset is in rupees usually based on context
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/admin/stats', methods=['GET'])
def admin_stats():
    """Returns dataset features, available categorical options, and model accuracy."""
    if not stats:
        return jsonify({'error': 'Stats not loaded.'}), 503
        
    return jsonify(stats)


if __name__ == '__main__':
    # Run Flask directly (Development mode)
    # The Express backend will call http://localhost:5000/predict
    print("Starting Flask ML Service on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
