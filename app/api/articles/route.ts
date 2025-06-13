import { NextRequest } from 'next/server';
import { supabase, TABLES, handleSupabaseResponse, createApiResponse, createErrorResponse, CACHE_CONFIG } from '../lib/supabase';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 300; // 5 minutes

// GET /api/articles - Fetch all articles with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'PUBLISHED';
    const limit = parseInt(searchParams.get('limit') || '50');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    console.log('🔍 Fetching articles with params:', { category, status, limit, featured, search });

    // Build query with correct schema
    let query = supabase
      .from(TABLES.ARTICLES)
      .select(`
        *,
        author:authors!authorId(*),
        category:categories!categoryId(*),
        tags:_ArticleToTag(tag:tags(*))
      `)
      .eq('status', status)
      .order('createdAt', { ascending: false });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('categoryId', category);
    }

    if (featured === 'true') {
      query = query.eq('isFeatured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    const response = await query;
    const articles = handleSupabaseResponse(response);

    console.log(`✅ Successfully fetched ${articles?.length || 0} articles`);

    // Transform data to match frontend expectations
    const transformedArticles = articles?.map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content: article.content,
      imageUrl: article.imageUrl,
      author: article.author?.name || 'Unknown Author',
      authorBio: article.author?.bio || '',
      category: article.category?.name || 'Uncategorized',
      categoryColor: article.category?.color || '#3B82F6',
      publishedAt: article.publishedAt || article.createdAt,
      readTime: '5 min read', // Calculate or store this separately
      featured: article.isFeatured || false,
      status: article.status,
      tags: article.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    })) || [];

    const apiResponse = createApiResponse({
      articles: transformedArticles,
      total: transformedArticles.length,
      filters: { category, status, featured, search, limit }
    });

    // Add cache headers
    apiResponse.headers.set('Cache-Control', CACHE_CONFIG.ARTICLES);
    
    return apiResponse;

  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch articles',
      500
    );
  }
}

// POST /api/articles - Create new article (for admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 Creating new article:', body.title);

    // Validate required fields
    const { title, summary, content, author_id, category_id, status = 'DRAFT' } = body;
    
    if (!title || !summary || !content || !author_id || !category_id) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create article
    const response = await supabase
      .from(TABLES.ARTICLES)
      .insert({
        title,
        slug,
        summary,
        content,
        author_id,
        category_id,
        status,
        image_url: body.image_url,
        featured: body.featured || false,
        read_time: body.read_time,
        published_at: status === 'PUBLISHED' ? new Date().toISOString() : null
      })
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .single();

    const article = handleSupabaseResponse(response);
    
    console.log('✅ Successfully created article:', article.id);

    return createApiResponse({
      message: 'Article created successfully',
      article
    }, 201);

  } catch (error) {
    console.error('❌ Error creating article:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create article',
      500
    );
  }
}
