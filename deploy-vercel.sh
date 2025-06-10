#!/bin/bash

# 🚀 Vercel Deployment Setup Script for Onward Dominicans
# This script prepares your application for Vercel deployment

set -e

echo "🚀 Preparing Onward Dominicans for Vercel Deployment..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository found"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
fi

# Test build
echo "🔨 Testing frontend build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed. Please fix build errors before deploying."
    echo "Run 'npm run build' to see detailed errors."
    exit 1
fi

# Check if backend exists and test it
if [ -d "backend" ]; then
    echo "🔧 Checking backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    echo "🔨 Testing backend build..."
    if npm run build > /dev/null 2>&1; then
        echo "✅ Backend build successful"
    else
        echo "❌ Backend build failed. Please fix build errors before deploying."
        echo "Run 'cd backend && npm run build' to see detailed errors."
        exit 1
    fi
    
    cd ..
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
backend/node_modules/

# Build outputs
dist/
backend/dist/

# Environment files
.env
.env.local
.env.production.local
backend/.env

# Database
backend/dev.db
backend/prod.db
backend/data/

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
    echo "✅ .gitignore created"
fi

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json found"
else
    echo "❌ vercel.json not found. This should exist for proper Vercel deployment."
fi

# Display next steps
echo ""
echo "🎉 Your application is ready for Vercel deployment!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 📤 Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Vercel deployment'"
echo "   git push origin main"
echo ""
echo "2. 🌐 Deploy Frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Click 'New Project'"
echo "   - Import your GitHub repository"
echo "   - Set environment variables:"
echo "     VITE_API_URL=https://your-backend-url.onrender.com/api"
echo ""
echo "3. 🔧 Deploy Backend to Render:"
echo "   - Go to https://render.com"
echo "   - Create a new Web Service"
echo "   - Connect your GitHub repository"
echo "   - Set build command: cd backend && npm install && npm run build"
echo "   - Set start command: cd backend && npm start"
echo ""
echo "4. 📖 Read the full guide:"
echo "   cat VERCEL_DEPLOYMENT.md"
echo ""
echo "🚀 Happy deploying!"
