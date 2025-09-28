-- ADMIN SETUP SCRIPT
-- Run this in Supabase SQL Editor to create your first admin user

-- Method 1: If you already have a user account, promote it to admin
-- Replace 'your-email@example.com' with your actual email address
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Method 2: Check current users and their roles
SELECT id, email, role, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Method 3: If you need to create a new admin user manually
-- (Only use this if you don't have an account yet)
-- INSERT INTO profiles (id, email, role, total_invested, account_balance)
-- VALUES (
--   'your-user-id-from-auth-users', 
--   'admin@example.com', 
--   'admin', 
--   0, 
--   0
-- );

-- Verify the admin user was created/updated
SELECT email, role 
FROM profiles 
WHERE role = 'admin';
