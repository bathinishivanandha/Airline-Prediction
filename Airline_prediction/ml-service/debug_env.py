import os
import sys
import subprocess

def ensure_venv():
    # Use absolute path for venv detection
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_dir = os.path.join(base_dir, 'venv')
    venv_python = os.path.join(venv_dir, 'Scripts', 'python.exe')
    
    print(f"DEBUG: sys.prefix: {sys.prefix}")
    print(f"DEBUG: venv_dir: {venv_dir}")
    print(f"DEBUG: current exe: {sys.executable}")
    
    # Robust check: Normalize paths to handle case sensitivity and different separators
    current_exe = os.path.normcase(os.path.abspath(sys.executable))
    expected_exe = os.path.normcase(os.path.abspath(venv_python))
    
    # Strictly check if we are using the SPECIFIC venv python
    is_correct_venv = current_exe == expected_exe
    
    if not is_correct_venv and os.path.exists(venv_python):
        print(f"DEBUG: Switching to the correct virtual environment: {venv_dir}")
        subprocess.call([venv_python] + sys.argv)
        sys.exit(0)

ensure_venv()
print("Successfully running in venv!")
try:
    import sklearn
    print(f"sklearn version: {sklearn.__version__}")
except ImportError:
    print("sklearn NOT found!")
