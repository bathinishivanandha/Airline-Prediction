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

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

print("Loading dataset...")
# Load the dataset
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.normpath(os.path.join(BASE_DIR, '..', 'Clean_Dataset.csv'))
if not os.path.exists(csv_path):
    print(f"Error: Dataset not found at {csv_path}")
    sys.exit(1)

df = pd.read_csv(csv_path)
print(f"Dataset loaded with shape: {df.shape}")

# Drop Unnamed column if it exists
if 'Unnamed: 0' in df.columns:
    df.drop('Unnamed: 0', axis=1, inplace=True)
if 'flight' in df.columns:
    df.drop('flight', axis=1, inplace=True) # Drop flight code as it's too specific and numerous

# Get feature columns and the target
X = df.drop('price', axis=1)
y = df['price']

print("Encoding categorical features...")
# Handle categorical columns
categorical_cols = X.select_dtypes(include=['object']).columns

# Store label encoders for later inference use
label_encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    # Fit and transform
    X[col] = le.fit_transform(X[col].astype(str))
    label_encoders[col] = le

# Map back the required classes so we know what parameters exist
print("Saving label encoders...")
joblib.dump(label_encoders, os.path.join(BASE_DIR, 'label_encoders.pkl'))

print("Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest Regressor (This might take a few minutes)...")
# We use fewer estimators for faster training during development, but can be scaled up
rf_model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1, max_depth=15)
rf_model.fit(X_train, y_train)

print("Evaluating model...")
y_pred = rf_model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:.2f}")
print(f"R2 Score: {r2:.4f}")

print("Saving model...")
joblib.dump(rf_model, os.path.join(BASE_DIR, 'flight_price_model.pkl'))
print("Model training complete. Saved to flight_price_model.pkl")

# Generate statistics for the Admin panel payload
stats = {
    'total_records': len(df),
    'r2_score': r2,
    'mae': mae,
    'features': list(X.columns)
}
for col in categorical_cols:
    stats[col + '_classes'] = list(label_encoders[col].classes_)
joblib.dump(stats, os.path.join(BASE_DIR, 'model_stats.pkl'))
print("Saved model stats.")
