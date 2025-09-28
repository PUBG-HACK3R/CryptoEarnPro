# 🚨 URGENT FIX - Infinite Recursion Error

## The Problem
The RLS (Row Level Security) policies in the database are causing infinite recursion when trying to access the profiles table during signup.

## Quick Fix Steps

### Step 1: Fix Database Policies
1. **Go to Supabase → SQL Editor**
2. **Copy and run the entire `database-schema-fixed.sql` script**
3. **This will fix the infinite recursion in RLS policies**

### Step 2: Clear Browser Cache
1. **Open browser DevTools (F12)**
2. **Right-click refresh button → "Empty Cache and Hard Reload"**
3. **Or use Ctrl+Shift+R**

### Step 3: Restart Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test Signup Again
1. **Go to http://localhost:3000/auth/register**
2. **Try creating a new account**
3. **Should work without "failed to fetch" error**

## What Was Wrong?

The original RLS policies had this problematic pattern:
```sql
-- This causes infinite recursion:
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Problem:** The policy checks the `profiles` table to determine if a user can access the `profiles` table - this creates infinite recursion!

## The Fix

**New approach:**
1. **Simplified policies** that don't reference the same table
2. **Service role access** for admin operations
3. **Direct auth.uid() checks** without subqueries

## Test After Fix

### Expected Results:
- ✅ User registration works
- ✅ Login works  
- ✅ Dashboard loads
- ✅ No "infinite recursion" errors
- ✅ No "failed to fetch" errors

### If Still Not Working:
1. **Check Supabase logs** (Supabase Dashboard → Logs)
2. **Verify the fixed SQL ran successfully**
3. **Try creating a completely new user**
4. **Check browser network tab for specific errors**

## Admin Access Note

With the new simplified policies, admin access will work through:
1. **Service role key** (for backend operations)
2. **Manual role assignment** in the database
3. **Future enhancement:** Custom admin authentication flow

The core user functionality (signup, login, dashboard) should work perfectly now!
