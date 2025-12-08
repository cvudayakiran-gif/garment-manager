# Quick Start: Deploy to Supabase + Vercel

## What You Need to Do

1. **Set up Supabase Database** (5 minutes)
   - Log into https://supabase.com/dashboard
   - Open SQL Editor
   - Copy & paste contents of `supabase_schema.sql`
   - Click RUN

2. **Get Service Role Key** (2 minutes)
   - In Supabase: Settings → API
   - Copy the `service_role` key

3. **Create Environment File** (2 minutes)
   - Create file: `.env.local`
   - Copy from `env-setup-guide.txt`
   - Paste your service role key

4. **Test Locally** (5 minutes)
   ```powershell
   cmd.exe /c "npm install"
   cmd.exe /c "npm run dev"
   ```
   - Visit http://localhost:3000
   - Test adding a saree, making a sale

5. **Deploy to Vercel** (10 minutes)
   - Push code to GitHub
   - Connect GitHub to Vercel
   - Add environment variables (from .env.local)
   - Deploy!

---

## Need Help?

Check `DEPLOYMENT.md` for detailed step-by-step instructions.

---

## What Changed?

✅ Migrated from SQLite to Supabase (PostgreSQL)  
✅ Images now stored in Supabase Storage  
✅ All database queries updated  
✅ Ready for worldwide deployment  

---

## Access After Deployment

**Your app URL**: `https://your-app.vercel.app`  
**PIN**: `1234`  
**Works on**: Mobile + Desktop, anywhere in the world!
