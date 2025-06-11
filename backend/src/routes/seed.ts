import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
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

    const userCount = await db.executeWithRetry(() => db.prisma.user.count());
    const articleCount = await db.executeWithRetry(() => db.prisma.article.count());
    const authorCount = await db.executeWithRetry(() => db.prisma.author.count());
    const categoryCount = await db.executeWithRetry(() => db.prisma.category.count());

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

// Fix admin user endpoint
router.post('/fix-admin', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { db } = await import('../services/database');

    console.log('🔧 Fixing admin user...');

    // Find existing admin or create new one
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await db.executeWithRetry(() =>
      db.prisma.user.upsert({
        where: { email: 'admin@onwarddominicans.com' },
        update: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User'
        },
        create: {
          email: 'admin@onwarddominicans.com',
          username: 'admin',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      })
    );

    // Test the password
    const isValidPassword = await bcrypt.compare('admin123', adminUser.password);

    console.log('✅ Admin user fixed successfully!');
    console.log('📧 Email: admin@onwarddominicans.com');
    console.log('🔑 Password: admin123');
    console.log('🧪 Password test:', isValidPassword ? 'Valid' : 'Invalid');

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Admin user fixed successfully',
        email: 'admin@onwarddominicans.com',
        passwordTest: isValidPassword,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Fix admin failed:', error);
    next(error);
  }
});

export default router;
