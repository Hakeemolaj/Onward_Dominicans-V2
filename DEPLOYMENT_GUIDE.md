# 🚀 Deployment Guide: Render + Vercel + Supabase

This guide will help you deploy your Onward Dominicans news publication using the optimal free hosting stack.

## 📋 Prerequisites

- [GitHub](https://github.com) account
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) account (already configured)

## 🗄️ Step 1: Supabase Database (Already Done ✅)

Your Supabase database is already configured with:
- Project ID: `zrsfmghkjhxkjjzkigck`
- Database URL: `postgresql://postgres.zrsfmghkjhxkjjzkigck:OnwardDominicans2024!SecureDB@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `onward-dominicans-backend-v2`
   - **Region**: Ohio (US East)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### 2.3 Set Environment Variables in Render
In your Render service settings, add these environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres.zrsfmghkjhxkjjzkigck:OnwardDominicans2024!SecureDB@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://zrsfmghkjhxkjjzkigck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU2NDAwOCwiZXhwIjoyMDY1MTQwMDA4fQ.Qm1j1hvU3LhIYYL2h34aFr7c3tYrVeP_DDEb96M2HmI
FRONTEND_URL=https://odmailsu.vercel.app
JWT_SECRET=your-super-secure-jwt-secret-32-characters-minimum
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
PGCONNECT_TIMEOUT=60
PGCOMMAND_TIMEOUT=60
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2.4 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://onward-dominicans-backend-v2.onrender.com`

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Set Environment Variables in Vercel
In your Vercel project settings → Environment Variables, add:

```env
VITE_API_URL=https://onward-dominicans-backend-v2.onrender.com/api
NODE_ENV=production
```

Optional (if using AI features):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3.3 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://odmailsu.vercel.app`

## 🔄 Step 4: Update CORS Configuration

After both services are deployed, update the backend CORS configuration:

1. Go to your Render service environment variables
2. Update `FRONTEND_URL` to your actual Vercel URL
3. Redeploy the backend service

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
Visit: `https://onward-dominicans-backend-v2.onrender.com/api/health`
Should return: `{"status": "OK", "timestamp": "..."}`

### 5.2 Test Frontend
Visit: `https://odmailsu.vercel.app`
Should load the news publication homepage

### 5.3 Test Admin Panel
Visit: `https://odmailsu.vercel.app/admin.html`
Should load the admin dashboard

## 🔧 Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify all environment variables are set
- Ensure database connection is working

### Frontend Issues
- Check Vercel function logs
- Verify API URL is correct
- Check browser console for errors

### CORS Issues
- Ensure `FRONTEND_URL` in backend matches your Vercel URL
- Check that both HTTP and HTTPS are handled correctly

## 📱 Custom Domain (Optional)

### For Vercel (Frontend)
1. Go to Vercel project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### For Render (Backend)
1. Go to Render service settings → Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update frontend `VITE_API_URL` accordingly

## 🎉 Success!

Your Onward Dominicans news publication is now live with:
- ✅ **Frontend**: Vercel at https://odmailsu.vercel.app (Fast global CDN)
- ✅ **Backend**: Render (Reliable API hosting)
- ✅ **Database**: Supabase (Managed PostgreSQL)

This stack provides excellent performance, reliability, and scalability for your news publication!
