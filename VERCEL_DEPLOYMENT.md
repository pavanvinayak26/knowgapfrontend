# Knowgap Vercel Deployment Guide

## Overview
This guide covers deploying the Knowgap frontend to Vercel while keeping the backend on Render (or another hosting service).

## Prerequisites
- GitHub account with the repository pushed
- Vercel account (https://vercel.com)
- Render account for backend hosting
- Backend already deployed and running on Render

## Deployment Steps

### 1. Prepare Your Repository

Ensure your GitHub repository is up to date with all changes:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy Frontend to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from the project root:
   ```bash
   vercel --prod
   ```

3. When prompted:
   - **Project name**: `knowgap` (or your preferred name)
   - **Which scope to deploy to?**: Select your personal account
   - **Link to existing project?**: No
   - **Detected framework**: Should auto-detect React
   - **Build command**: `cd frontend && npm ci && npm run build`
   - **Output directory**: `frontend/build`

#### Option B: Connect GitHub Repository

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Click "Import Git Repository"
4. Search for and select your repository
5. Configure project settings:
   - **Framework**: React
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Output Directory**: `frontend/build`
   - **Root Directory**: `.` (leave as default)

6. Click "Deploy"

### 3. Configure Environment Variables

After deployment, add environment variables in Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:
   ```
   REACT_APP_API_BASE_URL = https://knowgap-backend.onrender.com
   ```
   (Replace with your actual backend URL from Render)

4. Click "Save"
5. The deployment will automatically redeploy with the new variables

### 4. Verify Deployment

1. Navigate to your Vercel project URL (e.g., `https://knowgap.vercel.app`)
2. Test the following:
   - Login/Registration functionality
   - Quiz features
   - API connectivity to backend
   
3. Check browser console for any errors
4. Verify backend connectivity by checking network requests in DevTools

## Troubleshooting

### Build Fails with Module Not Found

Ensure all dependencies are in `frontend/package.json`:
```bash
cd frontend
npm install
npm run build
```

### API Requests Fail

1. Verify backend is running and accessible
2. Check `REACT_APP_API_BASE_URL` is set correctly in Vercel environment variables
3. Ensure backend CORS is configured to allow your Vercel domain:
   ```
   CORS_ALLOWED_ORIGINS=https://knowgap.vercel.app,https://www.knowgap.vercel.app
   ```

### Static Assets Not Loading

The `vercel.json` includes a redirect rule to handle client-side routing. If assets still fail:
1. Ensure `frontend/build` directory is created correctly
2. Check asset paths in `frontend/public/manifest.json`

## Keeping Backend on Render

Your Spring Boot backend should remain deployed on Render. To update it:

1. Backend changes are automatically redeployed when pushing to GitHub
2. Ensure your GitHub workflow has backend deployment configured
3. Update environment variables in Render dashboard if needed

## Custom Domain Setup (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records according to Vercel's instructions
4. Update `CORS_ALLOWED_ORIGINS` in Render backend environment

## Rollback to Previous Deployment

1. Go to Vercel project dashboard
2. Click **Deployments**
3. Find the previous working deployment
4. Click the three dots (...) → **Promote to Production**

## Environment-Specific Deployments

For preview URLs on pull requests:
1. In Vercel Settings → **Git**
2. Enable **Preview Deployments**
3. Each PR will get a preview URL automatically

## Security Notes

- Never commit `.env` files to GitHub
- Use Vercel's encrypted environment variables for secrets
- Keep `REACT_APP_API_BASE_URL` public (only frontend URL)
- Store sensitive backend secrets in Render's environment variables only
