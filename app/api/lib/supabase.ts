import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for API routes
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zrsfmghkjhxkjjzkigck.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM';

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database table names
export const TABLES = {
  ARTICLES: 'articles',
  AUTHORS: 'authors', 
  CATEGORIES: 'categories',
  TAGS: 'tags',
  GALLERY: 'gallery_items',
  GALLERY_CATEGORIES: 'gallery_categories'
} as const;

// Helper function to handle Supabase responses
export function handleSupabaseResponse<T>(response: { data: T | null; error: any }) {
  if (response.error) {
    console.error('Supabase error:', response.error);
    throw new Error(response.error.message || 'Database operation failed');
  }
  return response.data;
}

// Helper function to create API response
export function createApiResponse<T>(data: T, status: number = 200) {
  return Response.json({
    success: status < 400,
    data,
    timestamp: new Date().toISOString()
  }, { status });
}

// Helper function to create error response
export function createErrorResponse(message: string, status: number = 500) {
  return Response.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }, { status });
}

// Cache configuration
export const CACHE_CONFIG = {
  // Cache for 5 minutes for articles
  ARTICLES: 'public, max-age=300, stale-while-revalidate=600',
  // Cache for 1 hour for categories and authors (less frequently updated)
  CATEGORIES: 'public, max-age=3600, stale-while-revalidate=7200',
  AUTHORS: 'public, max-age=3600, stale-while-revalidate=7200',
  // Cache for 10 minutes for gallery
  GALLERY: 'public, max-age=600, stale-while-revalidate=1200'
} as const;
