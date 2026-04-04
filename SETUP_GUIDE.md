# Depression Severity Prediction API - Environment Setup Guide

## Prerequisites
- Python 3.10 or 3.11 installed
- pip package manager available
- PowerShell (Windows) or bash/zsh (Mac/Linux)

---

## WINDOWS SETUP (PowerShell)

### Step 1: Navigate to Project Directory
```powershell
cd c:\depression-predictor\backend
```

### Step 2: Create Virtual Environment
```powershell
# Creates a virtual environment named 'venv' in the current directory
python -m venv venv
```

### Step 3: Activate Virtual Environment
```powershell
# Activate venv on Windows (PowerShell)
# If you get an execution policy error, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1
```

**Expected output:** Your terminal prompt should now show `(venv)` prefix

### Step 4: Upgrade pip
```powershell
# Ensure you have the latest pip version
python -m pip install --upgrade pip
```

### Step 5: Install PyTorch CPU Version
```powershell
# Install CPU-only PyTorch (smaller download, sufficient for inference)
# This uses PyTorch's official index for CPU wheels
pip install torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu
```

**Why CPU?** Your model is pre-trained and used for inference only. CPU is efficient for prediction tasks.

### Step 6: Install All Dependencies
```powershell
# Install all packages from requirements.txt
pip install -r requirements.txt
```

### Step 7: Verify Installation
```powershell
# Verify PyTorch installation
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}')"

# Verify Transformers installation
python -c "import transformers; print(f'Transformers version: {transformers.__version__}')"

# Verify FastAPI installation
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"

# Verify model loading capability
python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; print('Model loading modules available ✓')"
```

### Step 8: Deactivate Virtual Environment (when done)
```powershell
deactivate
```

---

## MAC/LINUX SETUP (bash/zsh)

### Step 1-2: Navigate and Create Virtual Environment
```bash
cd ~/path-to/depression-predictor/backend
python3 -m venv venv
```

### Step 3: Activate Virtual Environment
```bash
source venv/bin/activate
```

### Step 4-6: Upgrade pip and Install Dependencies
```bash
python -m pip install --upgrade pip
pip install torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

### Step 7: Verify Installation (same as Windows)
```bash
python -c "import torch; print(f'PyTorch version: {torch.__version__}')"
python -c "import transformers; print(f'Transformers version: {transformers.__version__}')"
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"
```

---

## COMPLETE SETUP SCRIPT (Windows PowerShell - One Command)

Copy and paste this entire block into PowerShell:

```powershell
# Complete setup in one go
cd c:\depression-predictor\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install torch==2.2.0 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
Write-Host "✓ Setup complete! Verifying installation..."
python -c "import torch, transformers, fastapi; print('✓ All core packages installed successfully')"
```

---

## Troubleshooting

### Issue: "ExecutionPolicy" error when activating venv
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then try: .\venv\Scripts\Activate.ps1
```

### Issue: PyTorch installation takes too long or fails
**Solution:** Direct CPU wheel installation:
```powershell
pip install torch==2.2.0 torchvision==0.17.0 torchaudio==2.2.0 --index-url https://download.pytorch.org/whl/cpu
```

### Issue: "No module named 'torch'" after installation
**Solution:** Verify virtual environment is activated (look for `(venv)` in prompt)

### Issue: ModuleNotFoundError for transformers, safetensors, etc.
**Solution:** Reinstall requirements in activated venv:
```powershell
pip install -r requirements.txt --force-reinstall
```

---

## Running the API

Once environment is set up:

```powershell
# Make sure venv is activated
.\venv\Scripts\Activate.ps1

# Run the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API documentation at: `http://localhost:8000/docs`

---

## Package Versions Summary

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.104.1 | Web framework |
| uvicorn[standard] | 0.24.0 | ASGI server |
| torch | 2.2.0 (CPU) | Deep learning engine |
| transformers | 4.36.2 | RoBERTa model loading |
| safetensors | 0.4.1 | Model format support |
| pydantic | 2.5.0 | Data validation |
| aiosqlite | 0.19.0 | Async SQLite |
| python-dotenv | 1.0.0 | Environment variables |
| python-multipart | 0.0.6 | Form data parsing |

