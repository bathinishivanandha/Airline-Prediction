import sys
import os

def check_dependencies():
    packages = ['flask', 'flask_cors', 'pandas', 'joblib', 'sklearn']
    missing = []
    
    print(f"Checking environment: {sys.prefix}")
    print("-" * 30)
    
    for package in packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"[OK] {package} is installed.")
        except ImportError:
            print(f"[ERROR] {package} is NOT found.")
            missing.append(package)
            
    print("-" * 30)
    if not missing:
        print("All dependencies are correctly installed in this environment!")
    else:
        print(f"Missing dependencies: {', '.join(missing)}")
        print("Please run: pip install -r requirements.txt")

if __name__ == "__main__":
    check_dependencies()
