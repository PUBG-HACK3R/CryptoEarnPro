-- FIXED DATABASE SCHEMA - Run this to fix the infinite recursion issue

-- First, drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Recreate profiles policies without recursion
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Simple admin policies without subqueries that could cause recursion
CREATE POLICY "Service role can manage profiles" ON profiles 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Alternative admin access (you'll need to manually set admin role in database)
-- CREATE POLICY "Admin users can view all profiles" ON profiles 
-- FOR SELECT USING (
--   auth.uid() IN (
--     SELECT id FROM auth.users WHERE raw_user_meta_data ->> 'role' = 'admin'
--   )
-- );

-- Fix other policies that might have similar issues
DROP POLICY IF EXISTS "Admins can view all user plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can update all user plans" ON user_plans;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update all withdrawal requests" ON withdrawal_requests;

-- Recreate admin policies for other tables (simpler approach)
CREATE POLICY "Service role can manage user_plans" ON user_plans 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage transactions" ON transactions 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage withdrawal_requests" ON withdrawal_requests 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- For now, let's also allow authenticated users to read plans (no admin check needed)
DROP POLICY IF EXISTS "Admins can manage plans" ON plans;
CREATE POLICY "Authenticated users can read plans" ON plans 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage plans" ON plans 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
