# 🚀 Render.com Deployment Checklist

## ✅ Pre-Deployment (COMPLETED)
- [x] Backend prepared for production
- [x] PostgreSQL schema configured
- [x] TypeScript compiled successfully
- [x] All dependencies installed

## 📋 Deployment Steps

### Step 1: Create PostgreSQL Database
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `onward-dominicans-db`
   - Database: `onward_dominicans`
   - User: `onward_dominicans_user`
   - Plan: Free
4. Click "Create Database"
5. **COPY THE INTERNAL DATABASE URL** (you'll need this!)

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository: `Onward_Dominicans-V2`
3. Configure:
   - Name: `onward-dominicans-backend`
   - Environment: `Node`
   - **Root Directory**: `backend` ⚠️ IMPORTANT!
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Plan: Free

### Step 3: Environment Variables
Add these in your web service settings:

**REQUIRED:**
```
DATABASE_URL = [Your PostgreSQL Internal Database URL]
JWT_SECRET = [Generate 32+ character random string]
NODE_ENV = production
FRONTEND_URL = https://your-vercel-app.vercel.app
```

**OPTIONAL:**
```
JWT_EXPIRES_IN = 7d
MAX_FILE_SIZE = 5242880
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
LOG_LEVEL = info
UPLOAD_PATH = ./uploads
GEMINI_API_KEY = [Your Google Gemini API key - for AI features]
```

### Step 4: Deploy & Test
1. Click "Create Web Service"
2. Wait for build to complete
3. Test endpoints:
   - Health: `https://your-service-name.onrender.com/api/health`
   - Root: `https://your-service-name.onrender.com/`

### Step 5: Database Migration
1. Go to web service dashboard
2. Open "Shell" tab
3. Run: `npm run db:migrate:deploy`

## 🔗 Your Backend URL
After deployment, your backend will be available at:
`https://onward-dominicans-backend.onrender.com`

## 📝 Next Steps for Frontend (Vercel)
1. Update your frontend's API base URL to point to your Render backend
2. Deploy frontend to Vercel
3. Update FRONTEND_URL environment variable in Render with your Vercel URL

## 🚨 Important Notes
- Free tier sleeps after 15 minutes of inactivity
- File uploads are ephemeral (lost on restart)
- Database includes automatic backups on free tier
- Consider paid plans for production use

## 🔧 Troubleshooting
- **Build fails**: Check build logs in Render dashboard
- **Database connection**: Verify DATABASE_URL is correct
- **CORS issues**: Update FRONTEND_URL environment variable
