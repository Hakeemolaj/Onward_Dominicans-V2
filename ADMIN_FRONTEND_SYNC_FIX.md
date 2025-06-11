# Admin Panel & Frontend Content Sync Fix

## Problem Identified

The admin panel and frontend are showing different content because they're connected to different databases:

- **Frontend (Vercel)**: Uses Supabase directly → Shows 4 rich articles
- **Admin Panel (Vercel)**: Uses Render backend API → Shows 1 basic article
- **Render Backend**: Connected to a different/empty database

## Root Cause

The Render backend environment variables are not properly configured to use the same Supabase database as the local development environment.

## Solution Implemented: Option C - Unified Backend API

✅ **Updated frontend** to always use backend API instead of Supabase directly
✅ **Updated admin panel** to use the same backend API
🔄 **Need to update Render backend** to use correct Supabase database

### Step 1: Update Render Environment Variables (REQUIRED)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Navigate to your backend service**: `onward-dominicans-backend-v2`
3. **Go to Environment tab**
4. **Add/Update these environment variables**:

```bash
DATABASE_URL=postgresql://postgres.zrsfmghkjhxkjjzkigck:OnwardDominicans2024!SecureDB@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://zrsfmghkjhxkjjzkigck.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU2NDAwOCwiZXhwIjoyMDY1MTQwMDA4fQ.Qm1j1hvU3LhIYYL2h34aFr7c3tYrVeP_DDEb96M2HmI
NODE_ENV=production
FRONTEND_URL=https://odmailsu.vercel.app
JWT_SECRET=your_secure_jwt_secret_here
```

5. **Redeploy the service** after updating environment variables

### Step 2: Deploy Updated Frontend

The frontend has been updated to use the backend API consistently. Deploy to Vercel:

```bash
npm run build
# Vercel will auto-deploy from GitHub
```

## Verification Steps

After implementing the fix:

1. **Check Backend Health**: https://onward-dominicans-backend-v2.onrender.com/api/health
2. **Check Backend Articles**: https://onward-dominicans-backend-v2.onrender.com/api/articles
3. **Check Frontend**: https://odmailsu.vercel.app
4. **Check Admin Panel**: https://odmailsu.vercel.app/admin.html

All should show the same 4 articles:
- "Celebrating Dominican Independence Day: A Community United"
- "The Art of Making Traditional Mangu: A Family Recipe"
- "Youth Leadership Program Graduates First Class"
- "Preserving Our Musical Heritage: The Sounds of Merengue"

## Expected Results

- ✅ Admin panel shows all 4 articles
- ✅ Frontend shows all 4 articles  
- ✅ Both use the same data source
- ✅ Admin can edit articles that appear on frontend
- ✅ Changes in admin reflect immediately on frontend

## Troubleshooting

If issues persist:
1. Check browser console for API errors
2. Verify Supabase database has the articles
3. Ensure Render backend is using correct DATABASE_URL
4. Check CORS settings allow frontend domain
