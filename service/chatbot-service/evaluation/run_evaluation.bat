@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo    🧪 GraphRAG Evaluation with Ragas
echo ============================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%.."

echo 📂 Current directory: %CD%
echo.

REM Check if .venv exists
if not exist ".venv\" (
    echo ❌ Virtual environment not found!
    echo Please create it first with: python -m venv .venv
    pause
    exit /b 1
)

echo ✅ Virtual environment found: .venv
echo.

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)

echo ✅ Virtual environment activated
echo.

REM Install evaluation dependencies if needed
echo 📦 Checking evaluation dependencies...
pip show ragas >nul 2>&1
if errorlevel 1 (
    echo 📥 Installing Ragas and dependencies...
    pip install ragas datasets pandas
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Ragas already installed
)
echo.

REM Check if test dataset exists
if not exist "evaluation\test_dataset.json" (
    echo ❌ Test dataset not found: evaluation\test_dataset.json
    echo Please create the test dataset first!
    pause
    exit /b 1
)

echo ✅ Test dataset found
echo.

REM Run evaluation
echo ============================================================
echo    🚀 Starting Evaluation...
echo ============================================================
echo.

python evaluation\evaluate_graphrag.py

set EXIT_CODE=%errorlevel%

echo.
echo ============================================================

if %EXIT_CODE% equ 0 (
    echo    ✅ Evaluation completed successfully!
) else (
    echo    ❌ Evaluation failed with error code: %EXIT_CODE%
)

echo ============================================================
echo.

REM Deactivate virtual environment
call deactivate

echo Press any key to exit...
pause >nul
