# Local Testing Guide

## Step 1: Install Dependencies

Run the installation script:
```bash
# On Windows
./install-deps.bat

# Or manually run:
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react lucide-react recharts class-variance-authority clsx tailwind-merge
```

## Step 2: Environment Setup

1. **Copy environment template**:
   ```bash
   copy env-template.txt .env.local
   ```

2. **Get Supabase credentials**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or use existing one
   - Go to Settings > API
   - Copy the following values:

3. **Update .env.local**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 3: Database Setup

1. **Go to your Supabase project**
2. **Open SQL Editor**
3. **Copy and paste the entire content from `database-schema.sql`**
4. **Run the SQL script**
5. **Verify tables are created** in Table Editor

## Step 4: Start Development Server

```bash
npm run dev
```

The application should be available at: http://localhost:3000

## Step 5: Test Core Functionality

### Test Authentication
1. **Register a new account** at `/auth/register`
2. **Login** at `/auth/login`
3. **Check dashboard** loads properly

### Test User Features
1. **Dashboard** - Verify metrics display
2. **Plans** - Check investment plans load
3. **Wallet** - Test deposit/withdrawal forms
4. **Profile** - Verify user information

### Create Admin User
1. **Register normally through UI**
2. **Go to Supabase > Table Editor > profiles**
3. **Find your user and change `role` from 'user' to 'admin'**
4. **Refresh the app to see admin menu**

### Test Admin Features
1. **Access `/admin`** - Should show admin dashboard
2. **Check statistics** display properly
3. **Verify admin navigation** appears

## Common Issues & Solutions

### Import Errors
If you see "Cannot find module" errors:
```bash
npm install lucide-react class-variance-authority
```

### Supabase Connection Error
- Check environment variables are correct
- Ensure Supabase project is active
- Verify database schema was created

### Build Errors
```bash
npm run build
```
Fix any TypeScript errors that appear.

### CSS Issues
If styles don't load properly:
```bash
npm run dev
```
Check browser console for errors.

## Expected Behavior

✅ **Working Features**:
- User registration/login
- Dashboard with placeholder data
- Investment plans display
- Wallet deposit/withdrawal forms
- Profile settings
- Admin dashboard (for admin users)

⚠️ **Known Limitations**:
- Admin CRUD pages not yet implemented
- Earning calculations not automated
- Real-time updates not active
- Email notifications not configured

## Next Steps After Local Testing

1. **Fix any issues found during testing**
2. **Complete remaining admin features**
3. **Test all user flows thoroughly**
4. **Prepare for deployment**

## Troubleshooting

If you encounter issues:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure environment variables are set
4. Check Supabase connection
5. Review database schema creation

Contact me with any specific errors you encounter!
