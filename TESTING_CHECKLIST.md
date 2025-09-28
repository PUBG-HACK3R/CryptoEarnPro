# 🧪 Local Testing Checklist

## Pre-Testing Setup

### 1. Environment Setup
- [ ] Create `.env.local` file from `env-template.txt`
- [ ] Add Supabase project URL
- [ ] Add Supabase anon key
- [ ] Add Supabase service role key

### 2. Database Setup
- [ ] Open Supabase SQL Editor
- [ ] Run complete `database-schema.sql` script
- [ ] Verify tables created in Table Editor
- [ ] Check sample investment plans exist

### 3. Verify Setup
```bash
npm run test-setup
```
- [ ] All files exist ✅
- [ ] All dependencies installed ✅
- [ ] Environment variables set ✅

## Start Application

```bash
npm run dev
```

**Expected:** Application starts on http://localhost:3000

## Core Testing Flow

### Authentication Testing
- [ ] **Home Page** - Should redirect to `/auth/login`
- [ ] **Registration** - Create new account at `/auth/register`
  - [ ] Form validation works
  - [ ] Success message appears
  - [ ] Redirects to login
- [ ] **Login** - Sign in at `/auth/login`
  - [ ] Form validation works
  - [ ] Successful login redirects to dashboard
  - [ ] Error handling for wrong credentials

### User Dashboard Testing
- [ ] **Dashboard Access** - `/dashboard` loads after login
- [ ] **User Info** - Email and user ID display correctly
- [ ] **Metrics Cards** - Show placeholder data (zeros initially)
- [ ] **Navigation** - All menu items accessible
- [ ] **Responsive Design** - Works on mobile/tablet

### Investment Plans Testing
- [ ] **Plans Page** - `/plans` displays investment options
- [ ] **Plan Cards** - Show rates, durations, ROI calculations
- [ ] **Responsive Grid** - Plans display properly on all screens
- [ ] **Investment Button** - Clicking shows console log (not implemented yet)

### Wallet Testing
- [ ] **Wallet Page** - `/wallet` loads with tabs
- [ ] **Deposit Tab** - 
  - [ ] Crypto selection works (BTC, ETH, USDT)
  - [ ] QR code displays for selected crypto
  - [ ] Form validation works
  - [ ] Submit creates pending transaction
- [ ] **Withdraw Tab** -
  - [ ] Form validation works
  - [ ] Balance check prevents over-withdrawal
  - [ ] Submit creates withdrawal request
- [ ] **History Tab** - Shows transaction list (empty initially)

### Profile Testing
- [ ] **Profile Page** - `/profile` shows user information
- [ ] **Account Info** - Displays email, user ID, role
- [ ] **Investment Summary** - Shows totals (zeros initially)
- [ ] **Password Change** - Form works (test carefully)
- [ ] **Sign Out** - Confirmation and logout works

### Admin Testing
- [ ] **Create Admin User**:
  1. Register normal user
  2. Go to Supabase → profiles table
  3. Change role from 'user' to 'admin'
  4. Refresh application
- [ ] **Admin Menu** - Admin option appears in navigation
- [ ] **Admin Dashboard** - `/admin` shows statistics
- [ ] **Admin Stats** - Displays user counts, totals
- [ ] **Quick Actions** - Admin buttons present (pages not implemented)

## Error Testing

### Expected Errors (OK to ignore)
- [ ] Admin CRUD pages (404 - not implemented yet)
- [ ] Some TypeScript warnings in console
- [ ] Missing real transaction data

### Critical Errors (Must Fix)
- [ ] Application won't start
- [ ] Authentication completely broken
- [ ] Database connection fails
- [ ] Pages crash with errors

## Performance Testing
- [ ] **Page Load Speed** - Pages load quickly
- [ ] **Navigation** - Smooth transitions between pages
- [ ] **Responsive** - Works on different screen sizes
- [ ] **Console Errors** - Minimal errors in browser console

## Data Flow Testing
- [ ] **User Registration** - Creates profile in database
- [ ] **Deposit Submission** - Creates transaction record
- [ ] **Withdrawal Request** - Creates withdrawal record
- [ ] **Admin Role** - Properly restricts access

## Browser Testing
- [ ] **Chrome** - Full functionality
- [ ] **Firefox** - Full functionality  
- [ ] **Edge** - Full functionality
- [ ] **Mobile Browser** - Responsive design works

## Security Testing
- [ ] **Protected Routes** - Can't access dashboard without login
- [ ] **Admin Routes** - Can't access admin without admin role
- [ ] **User Data** - Users only see their own data
- [ ] **Form Validation** - Prevents invalid submissions

## Issues Found

### Critical Issues (Must Fix Before Deploy)
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

### Minor Issues (Can Fix Later)
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

### Enhancement Opportunities
- [ ] Improvement 1: ________________________________
- [ ] Improvement 2: ________________________________
- [ ] Improvement 3: ________________________________

## Final Verification

- [ ] **All core features work** as expected
- [ ] **No critical errors** preventing usage
- [ ] **Authentication flow** complete
- [ ] **Database integration** working
- [ ] **Admin access** functional
- [ ] **Ready for deployment** or needs fixes

## Next Steps

### If Testing Passes ✅
- [ ] Complete remaining admin features
- [ ] Implement earning calculations
- [ ] Deploy to Vercel
- [ ] Set up production database

### If Issues Found ❌
- [ ] Document all issues found
- [ ] Prioritize critical vs minor issues
- [ ] Fix critical issues first
- [ ] Re-test after fixes

---

**Testing Complete!** 
Date: ________________
Tester: _______________
Status: ✅ Pass / ❌ Fail / ⚠️ Issues Found
