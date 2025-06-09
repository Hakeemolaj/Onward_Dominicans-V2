@echo off
echo 🚀 Setting up Onward Dominicans Full Stack Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
node --version
npm --version
echo.

REM Install frontend dependencies
echo ℹ️ Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

REM Set up backend
echo ℹ️ Setting up backend...
cd backend

REM Install backend dependencies
echo ℹ️ Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

REM Copy environment file
if not exist .env (
    echo ℹ️ Creating backend environment file...
    copy .env.example .env
    echo ✅ Backend .env file created
    echo ⚠️ Please edit backend\.env with your configuration
) else (
    echo ℹ️ Backend .env file already exists
)
echo.

REM Generate Prisma client
echo ℹ️ Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated
echo.

REM Set up database
echo ℹ️ Setting up database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to apply database schema
    pause
    exit /b 1
)
echo ✅ Database schema applied
echo.

REM Seed database
echo ℹ️ Seeding database with sample data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ⚠️ Database seeding failed, but you can continue without sample data
) else (
    echo ✅ Database seeded successfully
)
echo.

cd ..

REM Create frontend environment file
if not exist .env.local (
    echo ℹ️ Creating frontend environment file...
    (
        echo # Frontend Environment Variables
        echo VITE_API_URL=http://localhost:3001/api
        echo GEMINI_API_KEY=
    ) > .env.local
    echo ✅ Frontend .env.local file created
    echo ⚠️ Please add your GEMINI_API_KEY to .env.local
) else (
    echo ℹ️ Frontend .env.local file already exists
)
echo.

echo ✅ Setup completed successfully! 🎉
echo.
echo ℹ️ Next steps:
echo 1. Edit backend\.env with your configuration (JWT_SECRET, etc.)
echo 2. Edit .env.local with your GEMINI_API_KEY
echo 3. Run 'npm run dev:full' to start both frontend and backend
echo.
echo ℹ️ Default admin account (after seeding):
echo Email: admin@onwarddominicans.news
echo Password: admin123
echo.
echo ℹ️ Application URLs:
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001
echo API Health Check: http://localhost:3001/api/health
echo.
echo ℹ️ Useful commands:
echo npm run dev:full      - Start both frontend and backend
echo npm run dev           - Start frontend only
echo npm run backend:dev   - Start backend only
echo cd backend ^&^& npm run db:studio - Open database GUI
echo.
pause
