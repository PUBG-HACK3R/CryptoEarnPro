# User Signup Database Error Fix

## Problem
The "Database error saving new user" occurs because the database trigger that should automatically create a user profile when someone signs up is being blocked by Row Level Security (RLS) policies.

## Root Cause
1. The `handle_new_user()` trigger function tries to insert into the `profiles` table
2. RLS policies prevent this insertion because the trigger doesn't run with proper user context
3. The function needs special permissions to bypass RLS during user creation

## Solution (Choose ONE of these approaches)

### Option 1: Fix the Database Trigger (Recommended)

1. **Run the SQL fix script:**
   ```bash
   # In your Supabase SQL editor, run:
   ```
   ```sql
   -- Copy and paste the contents of database-schema-signup-fix.sql
   ```

2. **This will:**
   - Fix the `handle_new_user()` function with proper error handling
   - Add policies to allow profile insertion during signup
   - Grant necessary permissions

### Option 2: Use API-Based Profile Creation (Backup)

1. **Set up environment variables:**
   - Copy `env.example` to `.env.local`
   - Add your Supabase service role key to `SUPABASE_SERVICE_ROLE_KEY`
   - **⚠️ IMPORTANT:** Keep the service role key secret - never commit it to git

2. **The system will:**
   - Create user via Supabase Auth
   - Call API route to create profile using service role permissions
   - Handle any errors gracefully

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Testing the Fix

1. Try signing up with a new email address
2. Check the browser console for any errors
3. Verify the user profile is created in the `profiles` table
4. Confirm the user can log in successfully

## Files Modified/Created

- `database-schema-signup-fix.sql` - SQL fix for the trigger
- `src/lib/auth-helpers.ts` - Helper functions for profile creation
- `src/app/api/auth/create-profile/route.ts` - API route for profile creation
- `src/contexts/AuthContext.tsx` - Updated signup logic
- `env.example` - Environment variables template

## Debugging

If you still get errors:

1. Check Supabase logs in your dashboard
2. Look at browser console for detailed error messages
3. Verify your environment variables are set correctly
4. Ensure your service role key has the right permissions

## Security Notes

- The service role key has admin privileges - keep it secure
- Only use it on the server-side (API routes, not client-side)
- The trigger approach is more secure as it doesn't expose the service key
