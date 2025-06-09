# Deployment Guide for Render.com

## Prerequisites
1. GitHub repository with your backend code
2. Render.com account (free tier available)

## Step-by-Step Deployment

### 1. Prepare Your Repository

First, prepare the backend for production:
```bash
# Switch to PostgreSQL schema for production
npm run prepare:production

# Commit all changes
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### 2. Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `onward-dominicans-db`
   - **Database**: `onward_dominicans`
   - **User**: `onward_dominicans_user`
   - **Plan**: Free (or paid for better performance)
4. Click "Create Database"
5. **Save the connection details** - you'll need the DATABASE_URL

### 3. Create Web Service on Render

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `onward-dominicans-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### 4. Set Environment Variables

In your Render web service settings, add these environment variables:

**Required:**
- `DATABASE_URL`: Copy from your PostgreSQL database (Internal Database URL)
- `JWT_SECRET`: Generate a secure random string (32+ characters)
- `NODE_ENV`: `production`
- `FRONTEND_URL`: Your frontend domain (e.g., `https://your-app.netlify.app`)

**Optional:**
- `GEMINI_API_KEY`: Your Google Gemini API key (for AI features)
- `JWT_EXPIRES_IN`: `7d`
- `MAX_FILE_SIZE`: `5242880`
- `RATE_LIMIT_WINDOW_MS`: `900000`
- `RATE_LIMIT_MAX_REQUESTS`: `100`
- `LOG_LEVEL`: `info`

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs for any issues

### 6. Run Database Migrations

After successful deployment:
1. Go to your web service dashboard
2. Open the "Shell" tab
3. Run: `npm run db:migrate:deploy`

### 7. Test Your Deployment

Your API will be available at: `https://your-service-name.onrender.com`

Test endpoints:
- Health check: `https://your-service-name.onrender.com/api/health`
- API root: `https://your-service-name.onrender.com/`

## Important Notes

### File Uploads
- Render's filesystem is ephemeral (files are lost on restart)
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
- Current setup stores files locally (suitable for testing)

### Database Backups
- Free PostgreSQL plan includes automatic backups
- Consider upgrading for production use

### Performance
- Free tier has limitations (sleeps after 15 minutes of inactivity)
- Consider paid plans for production applications

### Environment Variables Security
- Never commit `.env` files to version control
- Use Render's environment variable settings
- Regenerate JWT_SECRET for production

## Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript compilation

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database is running
- Ensure migrations are applied

### CORS Issues
- Update FRONTEND_URL environment variable
- Check CORS configuration in app.ts

## Next Steps

1. Update your frontend to use the new backend URL
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD pipeline (optional)
