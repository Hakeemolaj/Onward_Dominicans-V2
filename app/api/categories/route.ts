import { NextRequest } from 'next/server';
import { supabase, TABLES, handleSupabaseResponse, createApiResponse, createErrorResponse, CACHE_CONFIG } from '../lib/supabase';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

// GET /api/categories - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('include_count') === 'true';

    console.log('🏷️ Fetching categories, include_count:', includeCount);

    let query = supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .order('name');

    const response = await query;
    const categories = handleSupabaseResponse(response);

    // If requested, include article count for each category
    let categoriesWithCount = categories;
    if (includeCount && categories) {
      categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const countResponse = await supabase
            .from(TABLES.ARTICLES)
            .select('id', { count: 'exact' })
            .eq('category_id', category.id)
            .eq('status', 'PUBLISHED');

          return {
            ...category,
            article_count: countResponse.count || 0
          };
        })
      );
    }

    console.log(`✅ Successfully fetched ${categoriesWithCount?.length || 0} categories`);

    const apiResponse = createApiResponse({
      categories: categoriesWithCount || [],
      total: categoriesWithCount?.length || 0
    });

    // Add cache headers
    apiResponse.headers.set('Cache-Control', CACHE_CONFIG.CATEGORIES);
    
    return apiResponse;

  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch categories',
      500
    );
  }
}

// POST /api/categories - Create new category (for admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🏷️ Creating new category:', body.name);

    // Validate required fields
    const { name, description, color = '#3B82F6' } = body;
    
    if (!name) {
      return createErrorResponse('Category name is required', 400);
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create category
    const response = await supabase
      .from(TABLES.CATEGORIES)
      .insert({
        name,
        slug,
        description,
        color
      })
      .select()
      .single();

    const category = handleSupabaseResponse(response);
    
    console.log('✅ Successfully created category:', category.id);

    return createApiResponse({
      message: 'Category created successfully',
      category
    }, 201);

  } catch (error) {
    console.error('❌ Error creating category:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create category',
      500
    );
  }
}
