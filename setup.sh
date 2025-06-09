#!/bin/bash

# Onward Dominicans - Full Stack Setup Script
echo "🚀 Setting up Onward Dominicans Full Stack Application..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "Node.js and npm are installed"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install frontend dependencies
print_info "Installing frontend dependencies..."
if npm install; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Set up backend
print_info "Setting up backend..."
cd backend

# Install backend dependencies
print_info "Installing backend dependencies..."
if npm install; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    print_info "Creating backend environment file..."
    cp .env.example .env
    print_status "Backend .env file created"
    print_warning "Please edit backend/.env with your configuration"
else
    print_info "Backend .env file already exists"
fi

# Generate Prisma client
print_info "Generating Prisma client..."
if npx prisma generate; then
    print_status "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Set up database
print_info "Setting up database..."
if npx prisma db push; then
    print_status "Database schema applied"
else
    print_error "Failed to apply database schema"
    exit 1
fi

# Seed database
print_info "Seeding database with sample data..."
if npm run db:seed; then
    print_status "Database seeded successfully"
else
    print_warning "Database seeding failed, but you can continue without sample data"
fi

cd ..

# Create frontend environment file
if [ ! -f .env.local ]; then
    print_info "Creating frontend environment file..."
    cat > .env.local << EOF
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=
EOF
    print_status "Frontend .env.local file created"
    print_warning "Please add your GEMINI_API_KEY to .env.local"
else
    print_info "Frontend .env.local file already exists"
fi

echo ""
print_status "Setup completed successfully! 🎉"
echo ""
print_info "Next steps:"
echo "1. Edit backend/.env with your configuration (JWT_SECRET, etc.)"
echo "2. Edit .env.local with your GEMINI_API_KEY"
echo "3. Run 'npm run dev:full' to start both frontend and backend"
echo ""
print_info "Default admin account (after seeding):"
echo "Email: admin@onwarddominicans.news"
echo "Password: admin123"
echo ""
print_info "Application URLs:"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3001"
echo "API Health Check: http://localhost:3001/api/health"
echo ""
print_info "Useful commands:"
echo "npm run dev:full      - Start both frontend and backend"
echo "npm run dev           - Start frontend only"
echo "npm run backend:dev   - Start backend only"
echo "cd backend && npm run db:studio - Open database GUI"
