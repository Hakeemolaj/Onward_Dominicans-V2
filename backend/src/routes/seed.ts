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

// Health check for seeding status (with optional admin fix)
router.get('/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { db } = await import('../services/database');
    const fixAdmin = req.query.fixAdmin === 'true';

    const userCount = await db.executeWithRetry(() => db.prisma.user.count());
    const articleCount = await db.executeWithRetry(() => db.prisma.article.count());
    const authorCount = await db.executeWithRetry(() => db.prisma.author.count());
    const categoryCount = await db.executeWithRetry(() => db.prisma.category.count());

    // Check if admin user exists and get user details
    let users = await db.executeWithRetry(() =>
      db.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })
    );

    let adminUser = users.find(user => user.role === 'ADMIN');
    let adminFixed = false;
    let passwordTest = false;

    // Fix admin user if requested
    if (fixAdmin) {
      console.log('🔧 Fixing admin user via status endpoint...');

      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Use direct Prisma connection without retry wrapper
        const fixedAdmin = await db.prisma.user.upsert({
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
        });

        // Test the password
        passwordTest = await bcrypt.compare('admin123', fixedAdmin.password);
        adminFixed = true;

        console.log('✅ Admin user fixed successfully!');
        console.log('📧 Email: admin@onwarddominicans.com');
        console.log('🔑 Password: admin123');
        console.log('🧪 Password test:', passwordTest ? 'Valid' : 'Invalid');

        // Refresh users list directly
        users = await db.prisma.user.findMany({
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        });
        adminUser = users.find(user => user.role === 'ADMIN');

      } catch (dbError) {
        console.error('❌ Direct database fix failed:', dbError);
        // Try with executeWithRetry as fallback
        try {
          const hashedPassword = await bcrypt.hash('admin123', 10);

          const fixedAdmin = await db.executeWithRetry(() =>
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

          passwordTest = await bcrypt.compare('admin123', fixedAdmin.password);
          adminFixed = true;

          console.log('✅ Admin user fixed with retry mechanism!');

        } catch (retryError) {
          console.error('❌ Both direct and retry methods failed:', retryError);
          adminFixed = false;
        }
      }
    }

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
        users: users,
        adminUser: adminUser,
        adminFixed: adminFixed,
        passwordTest: passwordTest,
        environment: process.env.NODE_ENV || 'development',
        message: fixAdmin ? 'Admin user has been fixed. Try logging in with admin@onwarddominicans.com / admin123' : 'Status check complete',
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

// List users endpoint (for debugging)
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { db } = await import('../services/database');

    const users = await db.executeWithRetry(() =>
      db.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })
    );

    const response: ApiResponse = {
      success: true,
      data: {
        users: users,
        count: users.length,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ List users failed:', error);
    next(error);
  }
});

// Direct admin fix endpoint (no wrappers)
router.post('/admin-fix', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔧 Direct admin fix requested...');

    const { db } = await import('../services/database');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Direct database operation
    const adminUser = await db.prisma.user.upsert({
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
    });

    // Test the password
    const passwordTest = await bcrypt.compare('admin123', adminUser.password);

    console.log('✅ Direct admin fix completed!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123');
    console.log('🧪 Password test:', passwordTest ? 'Valid' : 'Invalid');

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Admin user fixed successfully',
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          role: adminUser.role,
          isActive: adminUser.isActive
        },
        passwordTest: passwordTest,
        credentials: {
          email: 'admin@onwarddominicans.com',
          password: 'admin123'
        }
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Direct admin fix failed:', error);
    next(error);
  }
});

export default router;
