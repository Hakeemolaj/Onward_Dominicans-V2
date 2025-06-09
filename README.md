# Onward Dominicans - News Publication Platform

A modern, full-stack news publication platform built with React + TypeScript frontend and Node.js + Express backend.

## 🚀 Features

### Frontend
- **Modern React 19** with TypeScript
- **Responsive Design** with Tailwind CSS
- **Dark/Light Theme** support
- **AI-Powered Features** with Google Gemini integration
- **Interactive Components** with modals, search, and filtering
- **Smooth Animations** and user experience

### Backend (NEW!)
- **RESTful API** with Express + TypeScript
- **Database Management** with Prisma ORM + SQLite
- **Authentication** with JWT and role-based access
- **Content Management** for articles, authors, and categories
- **File Upload** support for images
- **Comprehensive API** with pagination and filtering

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## 🛠️ Quick Start

### Option 1: Frontend Only (Original Setup)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local):
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```

### Option 2: Full Stack (Frontend + Backend)

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Set up the backend:
   ```bash
   npm run setup:backend
   cd backend
   cp .env.example .env
   # Edit backend/.env with your configuration
   npm run db:generate
   npm run db:push
   npm run db:seed  # Optional: adds sample data
   cd ..
   ```

3. Run both frontend and backend:
   ```bash
   npm run dev:full
   ```

This will start:
- Frontend at `http://localhost:5173`
- Backend API at `http://localhost:3001`

## 📁 Project Structure

```
onward-dominicans---news/
├── components/          # React components
├── services/           # Frontend services (AI, etc.)
├── backend/            # Backend API (NEW!)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   ├── prisma/
│   └── README.md       # Backend documentation
├── constants.ts        # App constants
├── types.ts           # TypeScript types
└── README.md          # This file
```

## 🔧 Available Scripts

### Frontend Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

### Backend Scripts
- `npm run backend:dev` - Start backend development server
- `npm run backend:build` - Build backend for production
- `npm run backend:start` - Start backend production server

### Full Stack Scripts
- `npm run dev:full` - Start both frontend and backend
- `npm run setup:backend` - Install backend dependencies

## 🗄️ Database & Content Management

The backend provides a complete content management system:

### Default Admin Account
After running `npm run db:seed`:
- **Email:** `admin@onwarddominicans.news`
- **Password:** `admin123`

### API Endpoints
- **Articles:** `/api/articles` - CRUD operations for news articles
- **Authors:** `/api/authors` - Manage article authors
- **Categories:** `/api/categories` - Organize content by category
- **Authentication:** `/api/auth` - User login and registration

### Database Management
```bash
cd backend
npm run db:studio  # Open Prisma Studio (database GUI)
npm run db:seed    # Reset and seed with sample data
```

## 🔐 Environment Configuration

### Frontend (.env.local)
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### Backend (backend/.env)
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret-here
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-api-key-here
```

## 🚀 Deployment

### Frontend Only
Deploy the frontend to any static hosting service (Vercel, Netlify, etc.):
```bash
npm run build
# Deploy the 'dist' folder
```

### Full Stack
1. **Backend:** Deploy to services like Railway, Render, or Heroku
2. **Frontend:** Update API endpoints and deploy to static hosting
3. **Database:** Use PostgreSQL or MySQL for production

## 📚 Documentation

- **Backend API:** See [backend/README.md](backend/README.md) for detailed API documentation
- **Frontend Components:** Check individual component files for usage
- **Database Schema:** See [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

## 🔄 Migration from Static to Dynamic

The platform now supports both static (original) and dynamic (with backend) modes:

1. **Static Mode:** Uses hardcoded `SAMPLE_NEWS_ARTICLES` from constants.ts
2. **Dynamic Mode:** Fetches data from the backend API

To migrate to dynamic mode, update the frontend services to call the backend API instead of using static data.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts:** Backend runs on 3001, frontend on 5173
2. **Database issues:** Run `npm run db:push` in backend folder
3. **CORS errors:** Check FRONTEND_URL in backend/.env
4. **Missing dependencies:** Run `npm install` in both root and backend folders

### Getting Help

1. Check the backend logs for API errors
2. Use browser dev tools for frontend issues
3. Review the backend/README.md for API documentation
4. Check environment variable configuration

## 📞 Support

For technical support or questions about the platform, contact the development team.
