# 🚀 Supabase Setup Guide for Onward Dominicans V2

## ✅ Project Created Successfully!

**Your Supabase Project Details:**
- **Project ID**: `zrsfmghkjhxkjjzkigck`
- **Project Name**: onward-dominicans-v2
- **Region**: us-east-1
- **Database Host**: `db.zrsfmghkjhxkjjzkigck.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/zrsfmghkjhxkjjzkigck

## 📋 Next Steps

### 1. Get Your Supabase Keys
Visit your project dashboard (opened in browser) and go to:
- **Settings** → **API** 
- Copy the following keys:
  - `Project URL`: `https://zrsfmghkjhxkjjzkigck.supabase.co`
  - `anon public key` (for frontend)
  - `service_role key` (for backend - keep secret!)

### 2. Set Up Environment Variables

#### Backend (.env)
Create `backend/.env` with:
```env
DATABASE_URL="postgresql://postgres:OnwardDominicans2024!SecureDB@db.zrsfmghkjhxkjjzkigck.supabase.co:5432/postgres"
SUPABASE_URL="https://zrsfmghkjhxkjjzkigck.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET="your-super-secure-jwt-secret-32-characters-minimum"
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)
Create `.env.local` with:
```env
VITE_SUPABASE_URL=https://zrsfmghkjhxkjjzkigck.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. Database Migration
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed database (optional)
npm run db:seed
```

### 4. Update Vercel Environment Variables
In your Vercel dashboard, add:
- `VITE_SUPABASE_URL=https://zrsfmghkjhxkjjzkigck.supabase.co`
- `VITE_SUPABASE_ANON_KEY=your-anon-key-here`
- `VITE_API_BASE_URL=your-backend-production-url`

### 5. Test the Setup
```bash
# Start backend
npm run backend:dev

# Start frontend (in another terminal)
npm run dev
```

## 🔧 Optional: Supabase Auth Integration

If you want to replace your custom JWT auth with Supabase Auth:
1. Enable authentication in Supabase dashboard
2. Configure auth providers (email, Google, etc.)
3. Update your frontend to use Supabase Auth SDK

## 📚 Resources
- [Supabase Dashboard](https://supabase.com/dashboard/project/zrsfmghkjhxkjjzkigck)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma with Supabase](https://supabase.com/docs/guides/integrations/prisma)
