#!/bin/bash

# Onward Dominicans - Free Deployment Setup Script
# This script helps prepare your project for free deployment

echo "🚀 Onward Dominicans - Free Deployment Setup"
echo "============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository found"
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Current branch is '$current_branch'. Consider switching to 'main' for deployment."
    read -p "Switch to main branch? (y/n): " switch_branch
    if [ "$switch_branch" = "y" ]; then
        git checkout -b main 2>/dev/null || git checkout main
        echo "✅ Switched to main branch"
    fi
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in root directory"
    exit 1
fi

if [ ! -f "backend/package.json" ]; then
    echo "❌ backend/package.json not found"
    exit 1
fi

echo "✅ Package files found"

# Check if build scripts work
echo "🔧 Testing build process..."

# Test frontend build
echo "Testing frontend build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed. Please fix build errors before deploying."
    echo "Run 'npm run build' to see detailed errors."
    exit 1
fi

# Test backend build
echo "Testing backend build..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed. Please fix build errors before deploying."
    echo "Run 'cd backend && npm run build' to see detailed errors."
    exit 1
fi
cd ..

# Check for required files
echo "📋 Checking deployment configuration files..."

required_files=("vercel.json" "backend/render.yaml" "DEPLOY_FREE.md")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
    fi
done

# Generate environment template
echo "📝 Creating environment variable templates..."

cat > .env.example << EOF
# Frontend Environment Variables (.env.local)
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key-here
EOF

cat > backend/.env.example << EOF
# Backend Environment Variables (Set in Render Dashboard)
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-32-characters-minimum
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
GEMINI_API_KEY=your-gemini-api-key-here
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF

echo "✅ Environment templates created"

# Check git status
echo "📊 Git status:"
git status --porcelain

# Commit changes if any
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing deployment configuration..."
    git add .
    git commit -m "Add deployment configuration for free hosting"
    echo "✅ Changes committed"
fi

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub: git push origin main"
echo "2. Follow the deployment guide in DEPLOY_FREE.md"
echo "3. Deploy backend to Render.com"
echo "4. Deploy frontend to Vercel.com"
echo ""
echo "📖 Read DEPLOY_FREE.md for detailed instructions"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: https://onward-dominicans.vercel.app"
echo "   Backend:  https://onward-dominicans-backend.onrender.com"
echo ""
echo "💡 Tip: Both services offer free custom domains!"
