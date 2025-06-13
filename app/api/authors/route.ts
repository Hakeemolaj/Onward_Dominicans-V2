import { NextRequest } from 'next/server';
import { supabase, TABLES, handleSupabaseResponse, createApiResponse, createErrorResponse, CACHE_CONFIG } from '../lib/supabase';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

// GET /api/authors - Fetch all authors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('include_count') === 'true';

    console.log('👥 Fetching authors, include_count:', includeCount);

    let query = supabase
      .from(TABLES.AUTHORS)
      .select('*')
      .order('name');

    const response = await query;
    const authors = handleSupabaseResponse(response);

    // If requested, include article count for each author
    let authorsWithCount = authors;
    if (includeCount && authors) {
      authorsWithCount = await Promise.all(
        authors.map(async (author) => {
          const countResponse = await supabase
            .from(TABLES.ARTICLES)
            .select('id', { count: 'exact' })
            .eq('author_id', author.id)
            .eq('status', 'PUBLISHED');

          return {
            ...author,
            article_count: countResponse.count || 0
          };
        })
      );
    }

    console.log(`✅ Successfully fetched ${authorsWithCount?.length || 0} authors`);

    const apiResponse = createApiResponse({
      authors: authorsWithCount || [],
      total: authorsWithCount?.length || 0
    });

    // Add cache headers
    apiResponse.headers.set('Cache-Control', CACHE_CONFIG.AUTHORS);
    
    return apiResponse;

  } catch (error) {
    console.error('❌ Error fetching authors:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch authors',
      500
    );
  }
}

// POST /api/authors - Create new author (for admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('👤 Creating new author:', body.name);

    // Validate required fields
    const { name, email, bio, avatar_url } = body;
    
    if (!name || !email) {
      return createErrorResponse('Name and email are required', 400);
    }

    // Create author
    const response = await supabase
      .from(TABLES.AUTHORS)
      .insert({
        name,
        email,
        bio,
        avatar_url
      })
      .select()
      .single();

    const author = handleSupabaseResponse(response);
    
    console.log('✅ Successfully created author:', author.id);

    return createApiResponse({
      message: 'Author created successfully',
      author
    }, 201);

  } catch (error) {
    console.error('❌ Error creating author:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create author',
      500
    );
  }
}
