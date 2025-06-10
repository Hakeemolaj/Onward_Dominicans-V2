import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { seedDatabase } from '../utils/seedProduction';
import { ApiResponse } from '../types';

const router = Router();

// Manual seeding endpoint (for production use)
router.post('/production', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Only allow in production environment
    if (process.env.NODE_ENV !== 'production') {
      res.status(403).json({
        success: false,
        error: {
          message: 'Seeding endpoint only available in production',
          code: 'FORBIDDEN'
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    console.log('🌱 Manual seeding requested...');
    await seedDatabase();

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Database seeded successfully',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Manual seeding failed:', error);
    next(error);
  }
});

// Health check for seeding status
router.get('/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { db } = await import('../services/database');

    const userCount = await db.prisma.user.count();
    const articleCount = await db.prisma.article.count();
    const authorCount = await db.prisma.author.count();
    const categoryCount = await db.prisma.category.count();

    const response: ApiResponse = {
      success: true,
      data: {
        isSeeded: userCount > 0,
        counts: {
          users: userCount,
          articles: articleCount,
          authors: authorCount,
          categories: categoryCount,
        },
        environment: process.env.NODE_ENV || 'development',
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
