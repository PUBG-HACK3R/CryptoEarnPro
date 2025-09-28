# Quick Setup Guide

## Step 1: Install Dependencies

Run this command to install all required dependencies:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react lucide-react recharts class-variance-authority clsx tailwind-merge
```

## Step 2: Environment Setup

1. Copy `env-template.txt` to `.env.local`
2. Fill in your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the required keys to `.env.local`

## Step 3: Database Setup

1. Go to your Supabase project
2. Open the SQL Editor
3. Copy and run the entire `database-schema.sql` file
4. This will create all tables, policies, and sample data

## Step 4: Test the Application

```bash
npm run dev
```

Visit http://localhost:3000 and:
1. Register a new account
2. Login to see the dashboard
3. Check that the UI loads properly

## Step 5: Create Admin User (Optional)

To create an admin user:
1. Register normally through the UI
2. Go to Supabase > Table Editor > profiles
3. Find your user and change `role` from 'user' to 'admin'
4. Refresh the app to see admin features

## Troubleshooting

### Missing Dependencies Error
If you see import errors, run:
```bash
npm install lucide-react class-variance-authority
```

### Supabase Connection Error
- Check your environment variables in `.env.local`
- Ensure your Supabase project is active
- Verify the database schema was created successfully

### Build Errors
- Make sure all dependencies are installed
- Check that TypeScript types are properly configured
- Ensure all import paths are correct

## Next Steps

After setup, you can:
1. Customize the investment plans in the database
2. Update the crypto addresses in `src/lib/utils.ts`
3. Modify the UI theme in `src/app/globals.css`
4. Add more features as needed
