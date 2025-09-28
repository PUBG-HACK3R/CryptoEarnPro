# 🚀 Quick Start Guide

## Prerequisites Check ✅
All dependencies are already installed in package.json:
- ✅ @supabase/supabase-js
- ✅ @supabase/auth-helpers-nextjs  
- ✅ @supabase/auth-helpers-react
- ✅ lucide-react
- ✅ recharts
- ✅ class-variance-authority
- ✅ clsx
- ✅ tailwind-merge

## Step 1: Environment Setup

**Create `.env.local` file** in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**To get these values:**
1. Go to [supabase.com](https://supabase.com)
2. Create/open your project
3. Go to Settings → API
4. Copy Project URL and API keys

## Step 2: Database Setup

1. **Open Supabase SQL Editor**
2. **Copy entire content from `database-schema.sql`**
3. **Run the SQL script**
4. **Verify tables created in Table Editor**

## Step 3: Start Application

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Turbopack:    enabled
```

## Step 4: Test Basic Flow

1. **Open http://localhost:3000**
2. **Should redirect to `/auth/login`**
3. **Click "Create Account"**
4. **Register with email/password**
5. **Login and access dashboard**

## Step 5: Create Admin User

1. **Register normally first**
2. **Go to Supabase → Table Editor → profiles**
3. **Change your user's `role` from 'user' to 'admin'**
4. **Refresh app - you'll see Admin menu**

## Expected Results

### ✅ Should Work:
- Authentication (login/register)
- Dashboard display
- Investment plans page
- Wallet page (forms)
- Profile settings
- Admin dashboard (for admin users)

### ⚠️ Known Issues to Ignore:
- Some admin pages not implemented yet
- Earning calculations not automated
- Real-time updates not active

## Common Issues & Quick Fixes

### Issue: "Cannot find module" errors
**Solution:** All deps are installed, but if issues persist:
```bash
npm install
```

### Issue: Supabase connection error
**Solution:** Check `.env.local` file exists and has correct values

### Issue: Database errors
**Solution:** Ensure `database-schema.sql` was run completely

### Issue: Build errors
**Solution:** Run build to see specific errors:
```bash
npm run build
```

## Testing Checklist

- [ ] App starts without errors
- [ ] Can register new user
- [ ] Can login successfully  
- [ ] Dashboard loads with user data
- [ ] Plans page displays investment options
- [ ] Wallet page shows forms
- [ ] Profile page shows user info
- [ ] Admin panel accessible (after role change)

## Next Steps After Testing

1. **Report any errors you encounter**
2. **Test all user flows**
3. **Complete remaining admin features**
4. **Deploy to production**

## Need Help?

If you encounter any issues:
1. Check browser console (F12)
2. Check terminal for error messages
3. Verify environment variables
4. Ensure database schema is created

**The application should run smoothly with just the environment setup!**
