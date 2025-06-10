# 🚀 Vercel Deployment Guide for Onward Dominicans

This guide will help you deploy your Onward Dominicans news application to Vercel with a separate backend.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Backend Hosting** - We recommend Render.com for the backend (free tier available)

## 🏗️ Architecture Overview

- **Frontend**: Deployed on Vercel (Static Site)
- **Backend**: Deployed on Render.com (Node.js API)
- **Database**: PostgreSQL on Render.com or Supabase

## 🎯 Step 1: Deploy Backend to Render.com

### 1.1 Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

### 1.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `onward-dominicans-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (will use backend folder)

### 1.3 Set Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-32-character-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.vercel.app
DATABASE_URL=postgresql://username:password@host:port/database
```

### 1.4 Create Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name: `onward-dominicans-db`
3. Copy the "Internal Database URL"
4. Add it as `DATABASE_URL` in your web service environment variables

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Push to GitHub
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Project Name**: `onward-dominicans`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 Set Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:
```
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key (optional)
```

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## 🔧 Step 3: Update Backend URL

After your backend is deployed on Render:
1. Copy your backend URL (e.g., `https://onward-dominicans-backend.onrender.com`)
2. Update the `VITE_API_URL` environment variable in Vercel
3. Redeploy your frontend

## ✅ Step 4: Verify Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit `https://your-backend.onrender.com/api/health`
3. **Database**: Check if articles load on the frontend

## 🔄 Automatic Deployments

Both Vercel and Render will automatically redeploy when you push to your main branch.

## 🐛 Troubleshooting

### Frontend Issues
- Check Vercel build logs
- Verify environment variables are set
- Ensure `VITE_API_URL` points to your backend

### Backend Issues
- Check Render logs
- Verify database connection
- Ensure all environment variables are set

### CORS Issues
The backend is configured to accept requests from your Vercel domain. If you get CORS errors:
1. Update `FRONTEND_URL` in backend environment variables
2. Redeploy backend

## 📱 Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### For Render (Backend):
1. Go to Render dashboard → Settings → Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)

## 💰 Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth
- **Render**: Free tier includes 750 hours/month
- **Database**: Render PostgreSQL free tier has limitations

For production, consider upgrading to paid plans for better performance and reliability.
