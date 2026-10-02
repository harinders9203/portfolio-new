@echo off
echo ========================================
echo   PURPLE TEAM PORTFOLIO - Image Setup
echo ========================================
echo.

REM Copy hero background
copy "C:\Users\cc\.gemini\antigravity-cli\brain\5c87dbcb-b3c3-49a3-9055-cb9253478099\hero_bg_1790920079915.jpg" "C:\Users\cc\Desktop\Web-training\portfolio n\images\hero_bg.jpg"
if %errorlevel%==0 (echo [OK] Hero background copied) else (echo [SKIP] Hero background not found)

REM Copy cyber logo
copy "C:\Users\cc\.gemini\antigravity-cli\brain\5c87dbcb-b3c3-49a3-9055-cb9253478099\cyber_logo_1790920098426.jpg" "C:\Users\cc\Desktop\Web-training\portfolio n\images\cyber_logo.jpg"
if %errorlevel%==0 (echo [OK] Cyber logo copied) else (echo [SKIP] Cyber logo not found)

echo.
echo ========================================
echo   RESUME SETUP
echo ========================================
echo.
echo Make sure your resume PDF is at:
echo   images\pdf\updated_resume.pdf
echo.
echo If your current resume is at a different name,
echo copy or rename it to updated_resume.pdf
echo.
echo ========================================
echo   DONE! Open index.html in your browser.
echo ========================================
pause
