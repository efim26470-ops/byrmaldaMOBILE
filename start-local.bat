@echo off
cd /d "%~dp0"
echo Starting CS2 Case Lab v7 from: %cd%
echo Open: http://localhost:8000/index.html
echo Stop server: Ctrl+C
python -m http.server 8000
pause
