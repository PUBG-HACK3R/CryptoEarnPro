@echo off
echo Installing required dependencies for CryptoEarn Pro...
echo.

echo Installing Supabase packages...
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

echo Installing UI and utility packages...
npm install lucide-react recharts class-variance-authority clsx tailwind-merge

echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Copy env-template.txt to .env.local
echo 2. Add your Supabase credentials to .env.local
echo 3. Run: npm run dev
echo.
pause
