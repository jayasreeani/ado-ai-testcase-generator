@echo off
REM Run this AFTER creating the GitHub repo at:
REM https://github.com/new  (name: ado-ai-testcase-generator, Private, no README)

cd /d "%~dp0"
git push -u origin main
if %ERRORLEVEL% EQU 0 (
  echo.
  echo Success! Next steps:
  echo 1. Open https://github.com/jayasreeani/ado-ai-testcase-generator/actions
  echo 2. Click "Build ADO Extension VSIX" -^> "Run workflow"
  echo 3. Download the VSIX artifact when the build completes
) else (
  echo.
  echo Push failed. Make sure you:
  echo - Created the repo at github.com/new named ado-ai-testcase-generator
  echo - Signed in with a Personal Access Token if prompted
)
pause
