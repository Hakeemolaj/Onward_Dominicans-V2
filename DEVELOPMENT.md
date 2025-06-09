# Development Guide

This guide will help you set up and run the Onward Dominicans news platform for development.

## 🚀 Quick Start

### Automated Setup

**For Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

### Manual Setup

1. **Install Dependencies:**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Configure Environment:**
   ```bash
   # Backend configuration
   cd backend
   cp .env.example .env
   # Edit .env with your settings
   cd ..
   
   # Frontend configuration
   cp .env.example .env.local
   # Add your GEMINI_API_KEY
   ```

3. **Set Up Database:**
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   npm run db:seed  # Optional: adds sample data
   cd ..
   ```

4. **Start Development:**
   ```bash
   npm run dev:full  # Starts both frontend and backend
   ```

## 🔧 Development Commands

### Frontend Commands
```bash
npm run dev          # Start frontend dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Commands
```bash
cd backend
npm run dev          # Start backend dev server (port 3001)
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with sample data
npm run db:migrate   # Run database migrations
```

### Full Stack Commands
```bash
npm run dev:full     # Start both frontend and backend
npm run setup:backend # Install backend dependencies
```

## 🌐 Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health
- **Database Studio:** http://localhost:5555 (when running `npm run db:studio`)

## 🔑 Default Accounts

After running `npm run db:seed`:

**Admin Account:**
- Email: `admin@onwarddominicans.news`
- Password: `admin123`
- Role: ADMIN (full access)

## 📊 Database Management

### Prisma Studio (Database GUI)
```bash
cd backend
npm run db:studio
```
Opens a web interface at http://localhost:5555 to view and edit database records.

### Reset Database
```bash
cd backend
rm dev.db           # Delete database file
npm run db:push     # Recreate database
npm run db:seed     # Add sample data
```

### Database Schema Changes
1. Edit `backend/prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Run `npm run db:generate` to update Prisma client

## 🔍 API Testing

### Using curl
```bash
# Health check
curl http://localhost:3001/api/health

# Get articles
curl http://localhost:3001/api/articles

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onwarddominicans.news","password":"admin123"}'
```

### Using Browser
- Health Check: http://localhost:3001/api/health
- Articles: http://localhost:3001/api/articles
- Categories: http://localhost:3001/api/categories
- Authors: http://localhost:3001/api/authors

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

#### 2. Database Issues
```bash
cd backend

# Reset database
rm dev.db
npm run db:push
npm run db:seed

# Check database file exists
ls -la dev.db
```

#### 3. Prisma Client Issues
```bash
cd backend
npm run db:generate
```

#### 4. Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### 5. CORS Errors
Check `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

#### 6. JWT Errors
Ensure `JWT_SECRET` is set in `backend/.env`:
```env
JWT_SECRET=your-secret-key-here
```

### Debug Mode

#### Backend Debugging
```bash
cd backend
DEBUG=* npm run dev  # Verbose logging
```

#### Frontend Debugging
Open browser dev tools (F12) and check:
- Console for JavaScript errors
- Network tab for API calls
- Application tab for localStorage

## 🔄 Development Workflow

### Adding New Features

1. **Backend Changes:**
   ```bash
   cd backend
   # Edit files in src/
   # Server auto-restarts with nodemon
   ```

2. **Frontend Changes:**
   ```bash
   # Edit files in components/, services/, etc.
   # Browser auto-refreshes with Vite
   ```

3. **Database Changes:**
   ```bash
   cd backend
   # Edit prisma/schema.prisma
   npm run db:push
   npm run db:generate
   ```

### Testing API Changes

1. Use Prisma Studio to view data
2. Test endpoints with curl or Postman
3. Check frontend integration
4. Verify error handling

## 📝 Code Style

### TypeScript
- Use strict TypeScript settings
- Define interfaces for all data structures
- Use proper error handling

### Backend
- Follow RESTful API conventions
- Use middleware for common functionality
- Validate all inputs
- Handle errors gracefully

### Frontend
- Use React hooks and functional components
- Keep components small and focused
- Use TypeScript interfaces
- Handle loading and error states

## 🚀 Performance Tips

### Development
- Use `npm run dev:full` for full-stack development
- Keep browser dev tools open for debugging
- Use React DevTools extension
- Monitor API response times

### Database
- Use Prisma Studio for data inspection
- Monitor query performance
- Use database indexes for large datasets

## 📚 Useful Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Express.js:** https://expressjs.com/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/

## 🆘 Getting Help

1. Check this development guide
2. Review error messages in console/logs
3. Check the backend README.md for API details
4. Use Prisma Studio to inspect database
5. Test API endpoints directly
6. Contact the development team
