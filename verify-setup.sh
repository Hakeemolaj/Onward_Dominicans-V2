#!/bin/bash

# Verification script to check backend structure
echo "🔍 Verifying Onward Dominicans Backend Setup..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_check() {
    if [ -f "$1" ] || [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 (missing)${NC}"
        return 1
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
}

# Check project structure
print_section "Project Structure"
print_check "package.json"
print_check "README.md"
print_check "QUICKSTART.md"
print_check "DEVELOPMENT.md"
print_check "DEPLOYMENT.md"
print_check "NEXT_STEPS.md"
print_check "setup.sh"
print_check "setup.bat"

print_section "Frontend Files"
print_check "App.tsx"
print_check "index.tsx"
print_check "vite.config.ts"
print_check "tsconfig.json"
print_check "components"
print_check "services"
print_check "services/apiService.ts"
print_check "services/aiService.ts"
print_check "components/ApiExample.tsx"

print_section "Backend Structure"
print_check "backend"
print_check "backend/package.json"
print_check "backend/tsconfig.json"
print_check "backend/README.md"
print_check "backend/.env.example"
print_check "backend/Dockerfile"

print_section "Backend Source Code"
print_check "backend/src"
print_check "backend/src/app.ts"
print_check "backend/src/controllers"
print_check "backend/src/middleware"
print_check "backend/src/routes"
print_check "backend/src/services"
print_check "backend/src/types"
print_check "backend/src/utils"

print_section "Database & Schema"
print_check "backend/prisma"
print_check "backend/prisma/schema.prisma"
print_check "backend/src/services/database.ts"
print_check "backend/src/utils/seed.ts"

print_section "API Controllers"
print_check "backend/src/controllers/articleController.ts"
print_check "backend/src/controllers/authorController.ts"
print_check "backend/src/controllers/categoryController.ts"
print_check "backend/src/controllers/authController.ts"

print_section "API Routes"
print_check "backend/src/routes/articles.ts"
print_check "backend/src/routes/authors.ts"
print_check "backend/src/routes/categories.ts"
print_check "backend/src/routes/tags.ts"
print_check "backend/src/routes/auth.ts"
print_check "backend/src/routes/health.ts"

print_section "Middleware"
print_check "backend/src/middleware/auth.ts"
print_check "backend/src/middleware/errorHandler.ts"
print_check "backend/src/middleware/notFoundHandler.ts"
print_check "backend/src/middleware/validation.ts"

print_section "Deployment Files"
print_check "docker-compose.yml"
print_check "Dockerfile.frontend"
print_check "nginx.conf"

echo -e "\n${GREEN}🎉 Backend structure verification complete!${NC}"

# Count files
total_files=$(find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" | wc -l)
backend_files=$(find backend -type f -name "*.ts" -o -name "*.js" -o -name "*.json" | wc -l)

echo -e "\n${BLUE}📊 Project Statistics:${NC}"
echo "Total project files: $total_files"
echo "Backend files: $backend_files"
echo "Frontend components: $(find components -name "*.tsx" 2>/dev/null | wc -l)"
echo "API routes: $(find backend/src/routes -name "*.ts" 2>/dev/null | wc -l)"
echo "Controllers: $(find backend/src/controllers -name "*.ts" 2>/dev/null | wc -l)"

echo -e "\n${BLUE}🚀 Ready for setup!${NC}"
echo "Run './setup.sh' (Linux/Mac) or 'setup.bat' (Windows) to install dependencies and start development."
