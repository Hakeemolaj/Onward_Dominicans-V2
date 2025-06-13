import { NextRequest } from 'next/server';
import { supabase, createApiResponse, createErrorResponse } from '../lib/supabase';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 30; // 30 seconds

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Test database connection
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      console.error('❌ Database health check failed:', error);
      return createErrorResponse('Database connection failed', 503);
    }

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: `${responseTime}ms`
      },
      api: {
        status: 'operational',
        endpoints: [
          '/api/articles',
          '/api/categories', 
          '/api/authors',
          '/api/health',
          '/api/regenerate-ssg'
        ]
      },
      features: {
        nextjs: '15.1.0',
        supabase: 'connected',
        ssg: 'enabled',
        caching: 'enabled'
      }
    };

    console.log('✅ Health check passed:', healthData.status);

    const response = createApiResponse(healthData);
    
    // Add cache headers (short cache for health checks)
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    
    return response;

  } catch (error) {
    console.error('❌ Health check error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Health check failed',
      500
    );
  }
}
