#!/bin/bash

# 🚀 Onward Dominicans Deployment Script
# Prepares your application for Render + Vercel + Supabase deployment

set -e

echo "🚀 Preparing Onward Dominicans for deployment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checklist...${NC}"

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📝 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository found${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

# Test builds
echo -e "${BLUE}🔨 Testing builds...${NC}"

# Test frontend build
echo -e "${YELLOW}Testing frontend build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed. Please fix build errors before deploying.${NC}"
    exit 1
fi

# Test backend build
echo -e "${YELLOW}Testing backend build...${NC}"
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed. Please fix build errors before deploying.${NC}"
    exit 1
fi
cd ..

# Check deployment files
echo -e "${BLUE}📋 Checking deployment configuration...${NC}"

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json found${NC}"
else
    echo -e "${RED}❌ vercel.json missing${NC}"
fi

if [ -f "backend/render.yaml" ]; then
    echo -e "${GREEN}✅ backend/render.yaml found${NC}"
else
    echo -e "${RED}❌ backend/render.yaml missing${NC}"
fi

if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${GREEN}✅ DEPLOYMENT_GUIDE.md found${NC}"
else
    echo -e "${RED}❌ DEPLOYMENT_GUIDE.md missing${NC}"
fi

# Commit any changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${BLUE}📝 Committing deployment configuration...${NC}"
    git add .
    git commit -m "Add deployment configuration for Render + Vercel + Supabase"
    echo -e "${GREEN}✅ Changes committed${NC}"
else
    echo -e "${GREEN}✅ No changes to commit${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo -e "${BLUE}📖 Next steps:${NC}"
echo "1. Push your code to GitHub: ${YELLOW}git push origin main${NC}"
echo "2. Follow the DEPLOYMENT_GUIDE.md for detailed deployment instructions"
echo "3. Deploy backend to Render: https://dashboard.render.com"
echo "4. Deploy frontend to Vercel: https://vercel.com/dashboard"
echo ""
echo -e "${BLUE}📚 Deployment URLs:${NC}"
echo "• Backend (Render): https://onward-dominicans-backend-v2.onrender.com"
echo "• Frontend (Vercel): https://odmailsu.vercel.app"
echo "• Admin Panel: https://odmailsu.vercel.app/admin.html"
echo ""
echo -e "${GREEN}🚀 Ready for deployment!${NC}"
