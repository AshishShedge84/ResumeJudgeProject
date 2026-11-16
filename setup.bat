@echo off
cd /d "%~dp0"
python -m pip install -r requirements.txt
if errorlevel 1 exit /b 1
echo Done. Run run.bat and open http://127.0.0.1:5000/ui/
pause
