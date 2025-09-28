@echo off
echo Testing CryptoEarn Pro Application...
echo.

echo 1. Checking TypeScript...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript check failed
    pause
    exit /b 1
)
echo ✅ TypeScript check passed

echo.
echo 2. Starting development server...
echo ✅ Open http://localhost:3000 in your browser
echo ✅ Test user registration and login
echo ✅ Check admin panel at /admin
echo.
call npm run dev
