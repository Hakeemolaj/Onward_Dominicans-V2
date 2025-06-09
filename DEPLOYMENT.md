# Deployment Guide

This guide covers various deployment options for the Onward Dominicans news platform.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd onward-dominicans---news

# Update environment variables in docker-compose.yml
# Set production JWT_SECRET and other configs

# Start the application
docker-compose up -d

# Check status
docker-compose ps
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Configuration
Edit `docker-compose.yml` and update:
```yaml
environment:
  - JWT_SECRET=your-super-secure-production-secret
  - FRONTEND_URL=https://your-domain.com
  - NODE_ENV=production
```

## ☁️ Cloud Deployment

### Backend Deployment Options

#### 1. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up
```

#### 2. Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard

#### 3. Heroku
```bash
# Install Heroku CLI
cd backend
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
git subtree push --prefix backend heroku main
```

### Frontend Deployment Options

#### 1. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_URL
```

#### 2. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### 3. GitHub Pages
```bash
# Build the project
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

## 🗄️ Database Options

### Development
- SQLite (default, included)

### Production Options

#### 1. PostgreSQL (Recommended)
Update `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

#### 2. MySQL
Update `backend/.env`:
```env
DATABASE_URL="mysql://username:password@host:port/database"
```

#### 3. Managed Database Services
- **Supabase**: Free PostgreSQL with built-in auth
- **PlanetScale**: Serverless MySQL
- **Railway**: Managed PostgreSQL
- **Render**: Managed PostgreSQL

### Database Migration
```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: add sample data
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Required
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-super-secure-secret
NODE_ENV=production
PORT=3001

# Optional
FRONTEND_URL=https://your-frontend-domain.com
GEMINI_API_KEY=your-gemini-api-key
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend-api-url.com/api
GEMINI_API_KEY=your-gemini-api-key
```

## 🚀 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Deploy to Railway
        run: |
          cd backend
          npm install
          npm run build
          # Add your deployment commands

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build and Deploy
        run: |
          npm install
          npm run build
          # Add your deployment commands
```

## 🔒 Security Checklist

### Backend Security
- [ ] Use strong JWT_SECRET in production
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable security headers (helmet)
- [ ] Regular dependency updates

### Database Security
- [ ] Use connection pooling
- [ ] Enable SSL for database connections
- [ ] Regular backups
- [ ] Restrict database access
- [ ] Use strong passwords

### Frontend Security
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Sanitize user inputs
- [ ] Secure API endpoints
- [ ] Regular dependency updates

## 📊 Monitoring & Logging

### Backend Monitoring
- Use Morgan for HTTP logging
- Monitor API response times
- Set up error tracking (Sentry, LogRocket)
- Database query monitoring

### Frontend Monitoring
- User analytics (Google Analytics)
- Error tracking
- Performance monitoring
- Core Web Vitals

## 🔄 Backup Strategy

### Database Backups
```bash
# PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# SQLite
cp backend/dev.db backup/dev-$(date +%Y%m%d).db
```

### File Uploads
- Regular backup of uploads directory
- Use cloud storage (AWS S3, Cloudinary)
- CDN for better performance

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure database exists

3. **CORS Errors**
   - Update FRONTEND_URL in backend
   - Check CORS configuration
   - Verify domain names

4. **Environment Variables**
   - Ensure all required vars are set
   - Check variable names (case-sensitive)
   - Verify values are correct

### Health Checks
- Backend: `GET /api/health`
- Database: Check connection status
- Frontend: Verify API calls work

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test API endpoints manually
4. Contact the development team
