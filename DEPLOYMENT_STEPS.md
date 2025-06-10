# 🚀 Final Deployment Steps

Your code is now on GitHub! Follow these steps to complete the deployment:

## 📋 Your Project URLs:
- **GitHub**: https://github.com/Hakeemolaj/Onward_Dominicans-V2
- **Frontend (after deployment)**: https://onward-dominicans.vercel.app
- **Backend (after deployment)**: https://onward-dominicans-backend.onrender.com/api

## 🔥 Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect GitHub** and select your repository: `Onward_Dominicans-V2`
4. **Configure:**
   - Name: `onward-dominicans-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secure-32-character-secret-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://onward-dominicans.vercel.app
   ```

6. **Create Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `onward-dominicans-db`
   - Copy the "Internal Database URL"
   - Add as `DATABASE_URL` in your web service

7. **Click "Create Web Service"**

## 🌐 Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import from GitHub** and select: `Onward_Dominicans-V2`
4. **Configure:**
   - Project Name: `onward-dominicans`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variable:**
   ```
   VITE_API_URL=https://onward-dominicans-backend.onrender.com/api
   ```

6. **Click "Deploy"**

## 🔄 Step 3: Update Backend CORS

After frontend deployment:
1. Go to your Render backend service
2. Update `FRONTEND_URL` to your actual Vercel URL
3. Redeploy the service

## 🎉 You're Done!

Your app will be live at:
- **Frontend**: https://onward-dominicans.vercel.app
- **Admin**: https://onward-dominicans.vercel.app/admin.html
- **API**: https://onward-dominicans-backend.onrender.com/api

## 🔧 Optional: Keep Backend Alive

Run this command to prevent backend from sleeping:
```bash
npm run keep-alive
```

Or enable the GitHub Actions workflow for automated pinging.
