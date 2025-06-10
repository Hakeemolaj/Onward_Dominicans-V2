import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { db } from './services/database';

// Import routes
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import authorRoutes from './routes/authors';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import healthRoutes from './routes/health';
import aiRoutes from './routes/ai';
import galleryRoutes from './routes/gallery';
import galleryCategoryRoutes from './routes/galleryCategories';
import seedRoutes from './routes/seed';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://odmailsu.vercel.app', // Production frontend (old)
    'https://onward-dominicans.vercel.app', // Production frontend (new)
    'https://odmailsu-ghd1kiimw-hakeemolajs-projects.vercel.app', // Vercel preview URL
    /^https:\/\/odmailsu.*\.vercel\.app$/, // All old Vercel deployment URLs
    /^https:\/\/onward-dominicans.*\.vercel\.app$/, // All new Vercel deployment URLs
    'http://localhost:5173', // Local development
    'http://localhost:5174', // Allow alternative port
    'http://localhost:5175', // Allow another alternative port
    'http://10.0.2.15:5173', // Allow network access
    'http://10.0.2.15:5174', // Allow network access alternative port
    'http://10.0.2.15:5175', // Allow network access alternative port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Apply rate limiting to all requests
app.use(limiter);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/gallery-categories', galleryCategoryRoutes);
app.use('/api/seed', seedRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Onward Dominicans API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Network access: http://10.0.2.15:${PORT}/api/health`);

  // Connect to database
  try {
    await db.connect();

    // Auto-seed database in production if empty
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Checking if database needs seeding...');
      const userCount = await db.prisma.user.count();
      if (userCount === 0) {
        console.log('🌱 Database is empty, starting auto-seeding...');
        const { seedDatabase } = await import('./utils/seedProduction');
        await seedDatabase();
        console.log('✅ Auto-seeding completed!');
      } else {
        console.log('✅ Database already seeded, skipping auto-seed');
      }
    }
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
});

export default app;
