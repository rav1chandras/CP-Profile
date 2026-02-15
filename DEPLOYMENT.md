# Fixed Deployment Guide - Using Neon Postgres

## ⚠️ Important Change

Vercel has migrated from `@vercel/postgres` to **Neon Postgres**. This updated version uses the correct Neon SDK.

## 🚀 Deployment Steps

### Step 1: Push Updated Code to GitHub

```bash
# Navigate to your project folder
cd admissions-app-fixed

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Fixed: Updated to Neon Postgres"

# If you already have a repository:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main --force

# Or update existing repo:
git push
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit https://vercel.com
   - Go to your existing project

2. **It Will Auto-Deploy**
   - Vercel watches your GitHub repo
   - It will automatically deploy the new code
   - Wait 1-2 minutes for build

### Step 3: Add Neon Postgres Database

#### Option A: Through Vercel (Recommended)

1. **Go to Storage Tab**
   - In your Vercel project dashboard
   - Click "Storage" in the top navigation

2. **Create Database**
   - Click "Create Database" or "Browse Storage"
   - Select **"Neon Postgres"** (not the old Vercel Postgres)
   - Click "Continue"
   - Give it a name (e.g., "admissions-db")
   - Choose a region (select one close to you)
   - Click "Create & Continue"

3. **Connect to Your Project**
   - Select your admissions app project
   - Click "Connect"
   - This automatically adds the `DATABASE_URL` environment variable

#### Option B: Use Existing Neon Database

If Vercel already migrated your old database:

1. Go to "Storage" tab
2. You should see your database already listed
3. Make sure it shows as "Connected"
4. If not, click "Connect Project" and select your app

### Step 4: Verify Environment Variable

1. Go to **Settings** → **Environment Variables**
2. You should see: `DATABASE_URL`
3. Value will be hidden (••••••) - that's correct!

### Step 5: Redeploy (Critical!)

Environment variables only work on NEW deployments:

1. Go to **"Deployments"** tab
2. Click the three dots (...) on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

### Step 6: Test Your App

1. **Visit Your App**
   - Click on the deployment URL
   
2. **Test Database**
   - Adjust the sliders and inputs
   - Click "Save Profile"
   - Open browser console (F12) to check for errors
   - Refresh the page
   - Your data should persist! ✓

## 🔍 Troubleshooting

### Error: "DATABASE_URL not configured"

**Solutions:**
1. Make sure Neon Postgres is connected (Storage tab)
2. Redeploy after connecting database
3. Check that `DATABASE_URL` exists in Settings → Environment Variables

### Error: "connection refused" or "ECONNREFUSED"

**Solutions:**
1. Your database might be sleeping (Neon free tier sleeps after inactivity)
2. Wait 5 seconds and try again - it will auto-wake
3. Check Neon dashboard to ensure database is active

### Error: Still seeing old warnings about @vercel/postgres

**Solutions:**
1. Make sure you pushed the NEW code to GitHub
2. Vercel should auto-deploy the new code
3. Check the build logs - they should show `@neondatabase/serverless` not `@vercel/postgres`

### Database Not Saving

1. Open browser console (F12)
2. Click "Save Profile"
3. Look for errors in Console tab
4. Check Network tab for failed requests

**Common fixes:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check deployment logs for runtime errors

## ✅ Success Checklist

- [ ] New code pushed to GitHub
- [ ] Vercel auto-deployed (or manual redeploy)
- [ ] Neon Postgres database created
- [ ] Database connected to project
- [ ] DATABASE_URL environment variable present
- [ ] Redeployed after adding database
- [ ] No errors in browser console
- [ ] "Save Profile" works and persists on refresh

## 📊 What Changed from Old Version

1. **Package**: `@vercel/postgres` → `@neondatabase/serverless`
2. **Import**: `import { sql } from '@vercel/postgres'` → `import { neon } from '@neondatabase/serverless'`
3. **Usage**: `await sql\`query\`` → `const sql = neon(DATABASE_URL); await sql\`query\``
4. **Environment**: Multiple POSTGRES_* vars → Single `DATABASE_URL`
5. **Runtime**: Added `export const runtime = 'edge'` for better performance

## 🆘 Still Having Issues?

Please provide:
1. Screenshot of Storage tab in Vercel
2. Screenshot of Environment Variables
3. Any errors in browser console (F12)
4. Any errors in Vercel deployment logs

The most common issue is forgetting to redeploy after connecting the database!
