#!/bin/bash

# Onward Dominicans - Automated Deployment Script
# This script automates as much of the deployment process as possible

set -e  # Exit on any error

echo "🚀 Onward Dominicans - Automated Deployment"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_status "Git is installed"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    print_status "Node.js is installed"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_status "npm is installed"
}

# Test builds
test_builds() {
    echo ""
    echo "🔧 Testing builds..."
    
    # Test frontend build
    print_info "Testing frontend build..."
    if npm run build > /dev/null 2>&1; then
        print_status "Frontend build successful"
    else
        print_error "Frontend build failed. Please fix build errors first."
        echo "Run 'npm run build' to see detailed errors."
        exit 1
    fi
    
    # Test backend build
    print_info "Testing backend build..."
    cd backend
    if npm run build > /dev/null 2>&1; then
        print_status "Backend build successful"
    else
        print_error "Backend build failed. Please fix build errors first."
        echo "Run 'cd backend && npm run build' to see detailed errors."
        exit 1
    fi
    cd ..
}

# GitHub setup
setup_github() {
    echo ""
    echo "📱 GitHub Setup"
    echo "==============="
    
    # Check if remote exists
    if git remote get-url origin &> /dev/null; then
        print_status "GitHub remote already configured"
        REPO_URL=$(git remote get-url origin)
        echo "Repository: $REPO_URL"
        return
    fi
    
    print_warning "No GitHub remote found. You need to:"
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named: 'Onward_Dominicans-V2'"
    echo "3. Don't initialize with README (your code is already ready)"
    echo "4. Copy the repository URL"
    echo ""
    
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/Onward_Dominicans-V2.git): " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        print_error "Repository URL is required"
        exit 1
    fi
    
    # Add remote and push
    git remote add origin "$REPO_URL"
    print_status "Added GitHub remote"
    
    print_info "Pushing code to GitHub..."
    if git push -u origin main; then
        print_status "Code pushed to GitHub successfully!"
    else
        print_error "Failed to push to GitHub. Please check your repository URL and permissions."
        exit 1
    fi
}

# Generate deployment URLs
generate_urls() {
    # Extract username and repo name from GitHub URL
    if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
        GITHUB_USER="${BASH_REMATCH[1]}"
        REPO_NAME="${BASH_REMATCH[2]}"
    else
        GITHUB_USER="your-username"
        REPO_NAME="onward-dominicans"
    fi
    
    # Generate suggested URLs
    BACKEND_URL="https://onward-dominicans-backend.onrender.com"
    FRONTEND_URL="https://onward-dominicans.vercel.app"
    
    # Update vercel.json with correct backend URL
    if [ -f "vercel.json" ]; then
        sed -i.bak "s|https://onward-dominicans-backend.onrender.com/api|${BACKEND_URL}/api|g" vercel.json
        rm vercel.json.bak 2>/dev/null || true
    fi
}

# Create deployment instructions
create_instructions() {
    cat > DEPLOYMENT_STEPS.md << EOF
# 🚀 Final Deployment Steps

Your code is now on GitHub! Follow these steps to complete the deployment:

## 📋 Your Project URLs:
- **GitHub**: $REPO_URL
- **Frontend (after deployment)**: $FRONTEND_URL
- **Backend (after deployment)**: $BACKEND_URL/api

## 🔥 Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect GitHub** and select your repository: \`$REPO_NAME\`
4. **Configure:**
   - Name: \`onward-dominicans-backend\`
   - Root Directory: \`backend\`
   - Environment: \`Node\`
   - Build Command: \`npm ci && npm run build\`
   - Start Command: \`npm start\`

5. **Add Environment Variables:**
   \`\`\`
   NODE_ENV=production
   JWT_SECRET=your-super-secure-32-character-secret-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=$FRONTEND_URL
   \`\`\`

6. **Create Database:**
   - Click "New +" → "PostgreSQL"
   - Name: \`onward-dominicans-db\`
   - Copy the "Internal Database URL"
   - Add as \`DATABASE_URL\` in your web service

7. **Click "Create Web Service"**

## 🌐 Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import from GitHub** and select: \`$REPO_NAME\`
4. **Configure:**
   - Project Name: \`onward-dominicans\`
   - Framework: \`Vite\`
   - Build Command: \`npm run build\`
   - Output Directory: \`dist\`

5. **Add Environment Variable:**
   \`\`\`
   VITE_API_URL=$BACKEND_URL/api
   \`\`\`

6. **Click "Deploy"**

## 🔄 Step 3: Update Backend CORS

After frontend deployment:
1. Go to your Render backend service
2. Update \`FRONTEND_URL\` to your actual Vercel URL
3. Redeploy the service

## 🎉 You're Done!

Your app will be live at:
- **Frontend**: $FRONTEND_URL
- **Admin**: $FRONTEND_URL/admin.html
- **API**: $BACKEND_URL/api

## 🔧 Optional: Keep Backend Alive

Run this command to prevent backend from sleeping:
\`\`\`bash
npm run keep-alive
\`\`\`

Or enable the GitHub Actions workflow for automated pinging.
EOF

    print_status "Created DEPLOYMENT_STEPS.md with your specific instructions"
}

# Main execution
main() {
    check_requirements
    test_builds
    setup_github
    generate_urls
    create_instructions
    
    echo ""
    echo "🎉 Automation Complete!"
    echo "======================"
    echo ""
    print_status "Your code is now on GitHub!"
    print_info "Next: Follow the instructions in DEPLOYMENT_STEPS.md"
    echo ""
    echo "📖 Quick links:"
    echo "   - Render: https://render.com"
    echo "   - Vercel: https://vercel.com"
    echo "   - Instructions: ./DEPLOYMENT_STEPS.md"
    echo ""
    print_warning "The deployment will take about 10-15 minutes total"
    echo ""
}

# Run main function
main
