# Supabase + Vercel Deployment Guide

## Step 1: Set Up Supabase

### 1.1 Access Your Supabase Project
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Open your project: **mmfmmaitutpsatzuudns**

### 1.2 Run the Database Schema
1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase_schema.sql` file
4. Paste it into the SQL editor
5. Click **RUN** to create all tables, indexes, and storage bucket
6. You should see: "Success. No rows returned"

### 1.3 Get Your Service Role Key
1. In Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Under "Project API keys", find the **service_role** key
3. Click the eye icon to reveal it
4. Copy this key (you'll need it in the next step)

---

## Step 2: Configure Environment Variables

### 2.1 Create .env.local File
1. In your project folder, create a new file called `.env.local`
2. Copy the contents from `env-setup-guide.txt`
3. Replace `your_service_role_key_here` with the service role key from Step 1.3
4. Save the file

Your `.env.local` should look like:
```
NEXT_PUBLIC_SUPABASE_URL=https://mmfmmaitutpsatzuudns.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...(your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...(your service role key)
```

---

## Step 3: Install Dependencies and Test Locally

### 3.1 Remove Old Dependencies
```powershell
cmd.exe /c "npm uninstall better-sqlite3 @types/better-sqlite3"
```

### 3.2 Install Dependencies
```powershell
cmd.exe /c "npm install"
```

### 3.3 Test Locally
```powershell
cmd.exe /c "npm run dev"
```

### 3.4 Verify Everything Works
1. Open http://localhost:3000
2. Login with PIN: 1234
3. Try adding a saree with an image
4. Process a test sale
5. Check analytics page
6. Everything should work exactly as before!

---

## Step 4: Deploy to Vercel

### 4.1 Create GitHub Repository (if not already done)
1. Go to https://github.com
2. Click "New repository"
3. Name it: `garment-manager`
4. Click "Create repository"

### 4.2 Push Code to GitHub
```powershell
cd c:\Users\91974\.gemini\antigravity\scratch\garment-manager

# Initialize git if not done
git init
git add .
git commit -m "Migrated to Supabase for deployment"

# Add your GitHub repository (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/garment-manager.git
git branch -M main
git push -u origin main
```

### 4.3 Deploy on Vercel
1. Go to https://vercel.com and sign up/login (use GitHub account)
2. Click "Add New..." → "Project"
3. Import your `garment-manager` repository
4. Click "Deploy"
5. **IMPORTANT**: Before deploying, add environment variables:
   - Click "Environment Variables"
     - Click "Environment Variables"
   - Add these variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `PUTTY_PASSWORD` (New!)
     - `SONY_PASSWORD` (New!)
   - Copy values from your `.env.local` file
6. Click "Deploy"

### 4.4 Wait for Deployment
- Vercel will build and deploy your app (takes 2-3 minutes)
- You'll get a URL like: `https://garment-manager-xxx.vercel.app`

---

## Step 5: Test Deployed Application

### 5.1 Access Your App
1. Click the Vercel URL
2. You should see the login page
3. Try logging in with PIN: 1234

### 5.2 Test All Features
- ✅ Add a saree with image upload
- ✅ Search and view inventory
- ✅ Process a sale in POS
- ✅ View sales history
- ✅ Check analytics

### 5.3 Test on Mobile
1. Open the Vercel URL on your phone
2. Should work perfectly on mobile
3. Camera should work for image uploads!

---

## Step 6: Share with Your Business Partner

Send them the Vercel URL and PIN:
- **URL**: `https://your-app-name.vercel.app`
- **PIN**: `1234`

They can access it from anywhere in the world!

---

## Troubleshooting

### Images Not Uploading
- Check that the storage bucket was created in Step 1.2
- Verify bucket policies are set correctly
- Check browser console for errors

### "Failed to fetch" Errors
- Verify all environment variables are set in Vercel
- Check that Supabase URL is correct (should end with .supabase.co)
- Make sure you're using service_role key, not anon key for server actions

### Analytics Not Working
- Check that all tables were created successfully
- Run a test sale first to have data
- Check Supabase logs for query errors

---

## Next Steps

### Optional Improvements
1. **Custom Domain**: Add your own domain in Vercel settings
2. **Change PIN**: Update the auth logic to use a different PIN
3. **Backup Data**: Export data regularly from Supabase
4. **Monitor Usage**: Check Supabase dashboard for storage/bandwidth usage

---

## Cost Monitoring

Both services are FREE for your usage:
- **Vercel**: Unlimited bandwidth (within fair use)
- **Supabase**: 500MB database + 1GB storage + unlimited API calls

You're well within the free tiers! No charges expected.

---

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Check Supabase logs in the dashboard3. Test locally first with `npm run dev`
4. Verify environment variables are set correctly
