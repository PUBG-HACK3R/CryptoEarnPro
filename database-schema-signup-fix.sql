-- SIGNUP FIX - Run this to fix the user registration issue
-- This addresses the RLS policy conflict with the trigger function

-- First, let's fix the handle_new_user function to properly bypass RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles with proper security context
  -- Using SECURITY DEFINER allows this function to bypass RLS
  INSERT INTO public.profiles (id, email, role, total_invested, account_balance)
  VALUES (NEW.id, NEW.email, 'user', 0, 0);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Re-raise the exception so we know something went wrong
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add a policy to allow the service role to insert profiles
-- This ensures the trigger can always create profiles
CREATE POLICY "Service role can insert profiles" ON profiles 
FOR INSERT WITH CHECK (true);

-- Also add a policy to allow authenticated users to insert their own profile
-- This is a backup in case the trigger fails
CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;

-- Ensure the profiles table has the right permissions
GRANT INSERT ON profiles TO service_role;
GRANT INSERT ON profiles TO authenticated;

-- Test the function works by checking if it can be called
-- (This is just a validation, not an actual test)
SELECT 'handle_new_user function is ready' as status;
