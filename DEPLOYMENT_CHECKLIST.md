# Deployment Checklist

## Environment Variables Required

Before deploying, ensure these environment variables are set:

### Required for all environments:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)

### Optional:
- `NEXTAUTH_SECRET` - Random secret for NextAuth (if using)
- `NEXTAUTH_URL` - Your app URL (production URL for deployment)

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run the database schema from `database-schema.sql`
3. Set up Row Level Security (RLS) policies
4. Get your project URL and keys from Settings > API

## Deployment Steps

### For Vercel:
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

### For Netlify:
1. Connect your GitHub repository
2. Set environment variables in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `.next`

## Post-Deployment

1. Test user registration and login
2. Test admin panel functionality
3. Verify database connections
4. Check all API routes are working

## Database Schema

Make sure to run these SQL files in your Supabase SQL editor:
- `database-schema.sql` - Main schema
- `setup-admin.sql` - Create admin user (optional)
