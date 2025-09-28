@echo off
echo ========================================
echo   CryptoEarn Pro - GitHub Deployment
echo ========================================
echo.

echo 1. Checking Git status...
git status

echo.
echo 2. Adding all files to Git...
git add .

echo.
echo 3. Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Deploy CryptoEarn Pro with automatic deposit system

git commit -m "%commit_message%"

echo.
echo 4. Setting up GitHub repository...
echo Using your repository: PUBG-HACK3R/CryptoEarnPro
echo.

set github_url=git@github.com:PUBG-HACK3R/CryptoEarnPro.git

echo.
echo 5. Adding remote origin...
git remote remove origin 2>nul
git remote add origin %github_url%

echo.
echo 6. Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   GitHub Upload Complete!
echo ========================================
echo.
echo Your repository is now available at:
echo %github_url%
echo.
echo Next steps:
echo 1. Go to vercel.com
echo 2. Click "New Project"
echo 3. Import from GitHub: CryptoEarnPro
echo 4. Set project name to: cryptoearnpro
echo 5. Add environment variables
echo 6. Deploy!
echo.
echo Your app will be available at:
echo https://cryptoearnpro.vercel.app
echo.
pause
