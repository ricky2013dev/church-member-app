# Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Choose your organization
5. Set project name: "Church Member Management"
6. Set database password (save this!)
7. Choose region closest to you
8. Click "Create new project"

## Step 2: Get Database Credentials
1. In your Supabase dashboard, go to **Settings** > **Database**
2. Copy the connection details:
   - Host: `your-project-ref.supabase.co`
   - Database name: `postgres`
   - Port: `5432`
   - User: `postgres`
   - Password: (the one you set when creating the project)

## Step 3: Get API Keys
1. Go to **Settings** > **API**
2. Copy:
   - Project URL: `https://your-project-ref.supabase.co`
   - `anon` `public` key

## Step 4: Update Environment Files
Update your `/server/.env` file with the actual values:

```env
PORT=3000
DB_HOST=your-actual-project-ref.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_actual_supabase_password
SUPABASE_URL=https://your-actual-project-ref.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key
```

## Step 5: Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `/database/init.sql`
4. Click "Run" to create your tables

## Step 6: Test Connection
Run this command from the server directory:
```bash
npm run test-db
```

If you see "✅ Database connection successful!", you're all set!