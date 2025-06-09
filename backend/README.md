# Onward Dominicans Backend API

A robust Node.js + Express + TypeScript backend for the Onward Dominicans news publication platform.

## 🚀 Features

- **RESTful API** with full CRUD operations for articles, authors, and categories
- **Authentication & Authorization** with JWT and role-based access control
- **Database Management** with Prisma ORM and SQLite
- **Type Safety** with TypeScript throughout
- **Input Validation** with express-validator
- **Security** with helmet, CORS, and rate limiting
- **Error Handling** with comprehensive error middleware
- **Logging** with Morgan
- **File Upload** support for images
- **Database Seeding** with sample data

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Google Gemini AI (optional)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Database Setup

Generate Prisma client and create the database:

```bash
npm run db:generate
npm run db:push
```

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- Admin user: `admin@onwarddominicans.news` (password: `admin123`)
- Sample categories, authors, and articles
- Tags and relationships

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Health Check
- `GET /api/health` - Check API and database health

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

#### Articles
- `GET /api/articles` - Get all articles (with pagination and filtering)
- `GET /api/articles/:id` - Get single article by ID or slug
- `POST /api/articles` - Create new article (requires editor role)
- `PUT /api/articles/:id` - Update article (requires editor role)
- `DELETE /api/articles/:id` - Delete article (requires editor role)

#### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/:id` - Get single author with articles
- `POST /api/authors` - Create new author (requires editor role)
- `PUT /api/authors/:id` - Update author (requires editor role)
- `DELETE /api/authors/:id` - Delete author (requires editor role)

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category with articles
- `POST /api/categories` - Create new category (requires editor role)
- `PUT /api/categories/:id` - Update category (requires editor role)
- `DELETE /api/categories/:id` - Delete category (requires editor role)

#### Tags
- `GET /api/tags` - Get all tags

### Query Parameters

#### Articles Filtering
```
GET /api/articles?page=1&limit=10&status=PUBLISHED&search=community&authorId=123&categoryId=456&tags=environment,community
```

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (createdAt, updatedAt, title, publishedAt)
- `sortOrder` - Sort direction (asc, desc)
- `status` - Article status (DRAFT, PUBLISHED, ARCHIVED)
- `search` - Search in title, summary, and content
- `authorId` - Filter by author
- `categoryId` - Filter by category
- `tags` - Filter by tags (comma-separated)

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 User Roles

- **ADMIN** - Full access to all operations
- **EDITOR** - Can manage articles, authors, and categories
- **AUTHOR** - Can create and edit their own articles
- **VIEWER** - Read-only access

## 🗄️ Database Schema

The database includes the following main entities:

- **Users** - Authentication and authorization
- **Authors** - Article authors with bio and contact info
- **Categories** - Article categorization
- **Articles** - Main content with rich metadata
- **Tags** - Flexible tagging system

## 🚀 Production Deployment

### Environment Variables

Set these environment variables in production:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Build and Start

```bash
npm run build
npm start
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── app.ts           # Express app setup
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables
└── package.json
```

## 🔧 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check DATABASE_URL in .env
   - Run `npm run db:push` to create tables

2. **JWT errors**
   - Ensure JWT_SECRET is set in .env
   - Check token format in Authorization header

3. **CORS errors**
   - Verify FRONTEND_URL matches your frontend domain
   - Check CORS configuration in app.ts

### Logs

Development logs include:
- HTTP requests (Morgan)
- Database queries (Prisma)
- Error details with stack traces

## 📞 Support

For issues or questions, contact the development team or check the project documentation.
