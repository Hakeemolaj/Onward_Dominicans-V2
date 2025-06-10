# Free Deployment Guide - Onward Dominicans

This guide will help you deploy your Onward Dominicans news platform completely free using services that can last for many years.

## 🎯 Deployment Strategy

- **Backend**: Render.com (Free tier - 750 hours/month)
- **Frontend**: Vercel (Free tier - Unlimited static hosting)
- **Database**: Render PostgreSQL (Free tier - 1GB, renewable every 90 days)

## 📋 Prerequisites

1. GitHub account
2. Render.com account
3. Vercel account

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Connect your GitHub account**
3. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository: `onward-dominicans---news`
   - Configure the service:
     - **Name**: `onward-dominicans-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Region**: Choose closest to your users
     - **Branch**: `main`
     - **Build Command**: `npm ci && npm run build`
     - **Start Command**: `npm start`

4. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Generate a secure random string (32+ characters)
   - `JWT_EXPIRES_IN`: `7d`
   - `FRONTEND_URL`: `https://onward-dominicans.vercel.app` (we'll update this after frontend deployment)
   - `GEMINI_API_KEY`: Your Google Gemini API key (optional)

5. **Create PostgreSQL Database**:
   - In Render dashboard, click "New +" → "PostgreSQL"
   - **Name**: `onward-dominicans-db`
   - **Database Name**: `onward_dominicans`
   - **User**: `onward_dominicans_user`
   - **Region**: Same as your web service
   - Click "Create Database"

6. **Connect Database to Backend**:
   - Copy the "Internal Database URL" from your database dashboard
   - Add it as environment variable in your web service:
     - `DATABASE_URL`: [paste the internal database URL]

7. **Deploy**: Click "Create Web Service"

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Import your project**:
   - Click "New Project"
   - Import from GitHub
   - Select your repository: `onward-dominicans---news`
   - Configure project:
     - **Project Name**: `onward-dominicans`
     - **Framework Preset**: `Vite`
     - **Root Directory**: `./` (leave as root)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variables**:
   - `VITE_API_URL`: `https://onward-dominicans-backend.onrender.com/api`
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API key (optional)

4. **Deploy**: Click "Deploy"

### Step 4: Update Backend CORS Settings

After frontend deployment, update the backend environment variable:
1. Go to your Render backend service
2. Update `FRONTEND_URL` to your actual Vercel URL (e.g., `https://onward-dominicans.vercel.app`)
3. Redeploy the service

## 🔧 Configuration Files Created

The following files have been created/updated for deployment:

1. **vercel.json** - Vercel configuration
2. **backend/render.yaml** - Render service configuration
3. **DEPLOY_FREE.md** - This deployment guide

## 💰 Cost Breakdown (FREE!)

### Render.com Free Tier:
- ✅ 750 hours/month web service (enough for most small projects)
- ✅ 1GB PostgreSQL database
- ✅ Automatic SSL certificates
- ✅ Custom domains supported
- ⚠️ Service sleeps after 15 minutes of inactivity
- ⚠️ Database expires after 90 days (but can be renewed for free)

### Vercel Free Tier:
- ✅ Unlimited static site hosting
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL certificates
- ✅ Global CDN
- ✅ Custom domains supported
- ✅ No sleep/downtime

## 🔄 Keeping Services Active

### Backend (Render):
- Service sleeps after 15 minutes of inactivity
- To keep it active, you can:
  1. Set up a simple cron job to ping your API every 10 minutes
  2. Use a free service like UptimeRobot to monitor and ping your site
  3. Accept the sleep behavior for low-traffic sites

### Database (Render):
- Free PostgreSQL expires after 90 days
- You'll receive email notifications before expiration
- Simply create a new database and migrate data when needed
- Consider upgrading to paid plan ($7/month) for permanent database

## 🚨 Important Notes

1. **First Deployment**: May take 10-15 minutes for everything to be ready
2. **Cold Starts**: Backend may take 30-60 seconds to wake up from sleep
3. **Database Backups**: Set up regular backups before the 90-day expiration
4. **Custom Domains**: Both services support custom domains for free

## 🔍 Monitoring Your Deployment

### Health Checks:
- **Backend**: `https://onward-dominicans-backend.onrender.com/api/health`
- **Frontend**: `https://onward-dominicans.vercel.app`

### Logs:
- **Render**: View logs in the Render dashboard
- **Vercel**: View deployment logs in Vercel dashboard

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **CORS Errors**:
   - Ensure FRONTEND_URL is correctly set in backend
   - Check that API URL is correct in frontend

3. **Database Connection**:
   - Verify DATABASE_URL is correctly set
   - Check database is running and accessible

4. **Environment Variables**:
   - Double-check all required variables are set
   - Ensure no typos in variable names

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: `https://onward-dominicans.vercel.app`
- **Backend API**: `https://onward-dominicans-backend.onrender.com/api`
- **Admin Panel**: `https://onward-dominicans.vercel.app/admin.html`

Your Onward Dominicans news platform is now live and accessible to anyone worldwide, completely free!
