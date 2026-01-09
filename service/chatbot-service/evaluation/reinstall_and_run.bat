@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo    [REINSTALL] Cai dat lai dependencies va chay evaluation
echo ============================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%.."

echo [1/4] Kich hoat virtual environment...
if not exist ".venv\" (
    echo [ERROR] Virtual environment not found!
    echo Please create it first with: python -m venv .venv
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

echo [2/4] Cai dat lai tat ca dependencies tu requirements.txt...
pip install -r requirements.txt --upgrade
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [3/4] Kiem tra setup...
python evaluation\check_setup.py
if errorlevel 1 (
    echo [ERROR] Setup check failed
    pause
    exit /b 1
)
echo.

echo [4/4] Chay evaluation...
echo ============================================================
python evaluation\evaluate_graphrag.py

set EXIT_CODE=%errorlevel%

echo.
echo ============================================================

if %EXIT_CODE% equ 0 (
    echo    [OK] Evaluation completed successfully!
) else (
    echo    [ERROR] Evaluation failed with error code: %EXIT_CODE%
)

echo ============================================================
echo.

call deactivate
pause
