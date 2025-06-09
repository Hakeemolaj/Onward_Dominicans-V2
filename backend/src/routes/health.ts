import { Router, Request, Response } from 'express';
import { db } from '../services/database';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await db.healthCheck();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
      },
    };

    const response: ApiResponse = {
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
    };

    // Return 503 if any service is unhealthy
    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(503).json(response);
  }
});

export default router;
