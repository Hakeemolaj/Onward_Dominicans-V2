#!/bin/bash

echo "🚀 Installing Supabase dependencies..."

# Install Supabase client for frontend
echo "📦 Installing Supabase client for frontend..."
npm install @supabase/supabase-js

# Install Supabase client for backend
echo "📦 Installing Supabase client for backend..."
cd backend
npm install @supabase/supabase-js
cd ..

echo "✅ Supabase dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Get your Supabase keys from: https://supabase.com/dashboard/project/zrsfmghkjhxkjjzkigck"
echo "2. Create your .env files using the examples provided"
echo "3. Run database migration: cd backend && npm run db:push"
echo "4. Start your development servers: npm run dev:full"
