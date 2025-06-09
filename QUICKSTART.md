# 🚀 Quick Start Checklist

Follow this checklist to get your Onward Dominicans news platform running in minutes!

## ✅ Prerequisites

- [ ] **Node.js installed** (v18 or higher) - [Download here](https://nodejs.org/)
- [ ] **Git installed** (to clone the repository)
- [ ] **Code editor** (VS Code recommended)

## ✅ Setup Steps

### 1. Clone and Navigate
```bash
git clone <your-repository-url>
cd onward-dominicans---news
```

### 2. Automated Setup (Recommended)

**For Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

**OR Manual Setup:**
```bash
# Install frontend dependencies
npm install

# Setup backend
cd backend
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
cd ..

# Create frontend env file
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
echo "GEMINI_API_KEY=" >> .env.local
```

### 3. Configure Environment

**Edit `backend/.env`:**
```env
JWT_SECRET=your-super-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

**Edit `.env.local`:**
```env
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Start the Application
```bash
npm run dev:full
```

## ✅ Verification

### Check These URLs:
- [ ] **Frontend:** http://localhost:5173 ✅
- [ ] **Backend Health:** http://localhost:3001/api/health ✅
- [ ] **API Articles:** http://localhost:3001/api/articles ✅

### Test Login:
- [ ] **Email:** `admin@onwarddominicans.news`
- [ ] **Password:** `admin123`

## ✅ Development Commands

```bash
# Start both frontend and backend
npm run dev:full

# Start frontend only
npm run dev

# Start backend only
npm run backend:dev

# Open database GUI
cd backend && npm run db:studio

# Reset database with sample data
cd backend && npm run db:seed
```

## ✅ Project Structure

```
onward-dominicans---news/
├── components/          # React components
├── services/           # API services
├── backend/            # Backend API
│   ├── src/           # Source code
│   ├── prisma/        # Database schema
│   └── .env           # Backend config
├── .env.local         # Frontend config
└── package.json       # Dependencies
```

## ✅ Troubleshooting

### Common Issues:

**❌ "npm not found"**
- Install Node.js from https://nodejs.org/

**❌ "Port 3001 already in use"**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**❌ "Database error"**
```bash
cd backend
rm dev.db
npm run db:push
npm run db:seed
```

**❌ "CORS error"**
- Check `FRONTEND_URL=http://localhost:5173` in `backend/.env`

**❌ "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

## ✅ Next Steps

1. **Explore the API:**
   - Visit http://localhost:3001/api/health
   - Check http://localhost:3001/api/articles
   - Use the ApiExample component

2. **Customize Content:**
   - Add your own articles via the API
   - Update categories and authors
   - Modify the frontend components

3. **Deploy:**
   - See `DEPLOYMENT.md` for deployment options
   - Use Docker for easy deployment
   - Deploy to cloud platforms

## ✅ Getting Help

- **Development Guide:** `DEVELOPMENT.md`
- **API Documentation:** `backend/README.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Backend Health:** http://localhost:3001/api/health

## ✅ Success! 🎉

If you can see:
- ✅ Frontend at http://localhost:5173
- ✅ Backend health check passes
- ✅ Sample articles load
- ✅ Admin login works

**You're ready to start developing!**

---

**Need help?** Check the troubleshooting section above or review the detailed guides in the repository.
