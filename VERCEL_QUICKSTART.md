# Quick Start: Vercel Deployment

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Using Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repo
5. **Framework**: React (auto-detected)
6. **Build Command**: `cd frontend && npm ci && npm run build`
7. **Output Directory**: `frontend/build`
8. Click **"Deploy"**

### Using Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## Step 3: Configure Environment Variables
After deployment, in Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   REACT_APP_API_BASE_URL = https://knowgap-backend.onrender.com
   ```
   (Replace with your actual Render backend URL)
3. Save and redeploy

## Step 4: Test the Deployment
- Visit your Vercel URL
- Test login and quiz features
- Check browser console for errors

## Key Files for Vercel
- ✅ `vercel.json` - Vercel configuration
- ✅ `frontend/package.json` - Frontend dependencies
- ✅ `frontend/public/` - Static assets
- ✅ `.vercelignore` - Files to exclude

## Backend Remains on Render
Your Spring Boot backend stays on Render. Update it separately if needed.

## Troubleshooting
If API calls fail:
1. Check `REACT_APP_API_BASE_URL` in Vercel env vars
2. Ensure backend CORS includes: `https://yourdomain.vercel.app`
3. Backend must be running and accessible

---
For detailed guide, see **VERCEL_DEPLOYMENT.md**
