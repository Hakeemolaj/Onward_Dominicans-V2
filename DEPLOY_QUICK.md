# 🚀 Quick Deployment Guide

## Frontend Deployment (Choose One)

### 1. Netlify (Recommended - Easiest)

**Option A: Drag & Drop**
```bash
# Build the project
npm run build

# Go to netlify.com, drag the 'dist' folder to deploy
```

**Option B: Git Integration**
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → "New site from Git"
3. Connect GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy!

**Option C: CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
npm run deploy:netlify
```

### 2. Vercel (Great for React)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run deploy:vercel
```

### 3. GitHub Pages (Free)

```bash
# Install gh-pages
npm install -g gh-pages

# Deploy
npm run deploy:gh-pages
```

## Backend Deployment (Choose One)

### 1. Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

### 2. Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Connect GitHub repo
3. Create Web Service
4. Settings:
   - Build command: `cd backend && npm install && npm run build`
   - Start command: `cd backend && npm start`
   - Environment: Add your env vars

### 3. Heroku

```bash
# Install Heroku CLI
cd backend
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
git subtree push --prefix backend heroku main
```

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend-url.com/api
GEMINI_API_KEY=your-gemini-key
```

### Backend (.env)
```env
DATABASE_URL=your-database-url
JWT_SECRET=your-super-secure-secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

## Quick Start Commands

```bash
# Build frontend
npm run build

# Deploy to Netlify
npm run deploy:netlify

# Deploy to Vercel  
npm run deploy:vercel

# Deploy to GitHub Pages
npm run deploy:gh-pages
```

## 🎯 Recommended Stack

**For beginners:**
- Frontend: Netlify (free, easy)
- Backend: Railway (simple, good free tier)
- Database: Railway PostgreSQL

**For production:**
- Frontend: Vercel (fast, optimized for React)
- Backend: Render or Railway
- Database: Supabase or PlanetScale

## Need Help?

1. Check the full `DEPLOYMENT.md` for detailed instructions
2. Ensure your code is pushed to GitHub first
3. Test locally with `npm run dev:full` before deploying
