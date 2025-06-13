import { NextRequest } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { supabase, TABLES, handleSupabaseResponse, createApiResponse, createErrorResponse } from '../lib/supabase';

// This route needs to be dynamic for POST operations
export const dynamic = 'force-dynamic';

// POST /api/regenerate-ssg - Regenerate static pages
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    console.log('🔄 Starting SSG regeneration...');

    // Get request body for specific regeneration options
    const body = await request.json().catch(() => ({}));
    const { 
      revalidateAll = true, 
      specificPaths = [],
      regenerateArticles = true,
      regenerateCategories = true 
    } = body;

    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      revalidated: [] as string[],
      generated: [] as string[],
      errors: [] as string[]
    };

    // Revalidate main pages
    if (revalidateAll) {
      const mainPaths = ['/', '/news'];
      for (const path of mainPaths) {
        try {
          revalidatePath(path);
          results.revalidated.push(path);
          console.log(`✅ Revalidated: ${path}`);
        } catch (error) {
          console.error(`❌ Failed to revalidate ${path}:`, error);
          results.errors.push(`Failed to revalidate ${path}`);
        }
      }
    }

    // Revalidate specific paths if provided
    if (specificPaths.length > 0) {
      for (const path of specificPaths) {
        try {
          revalidatePath(path);
          results.revalidated.push(path);
          console.log(`✅ Revalidated specific path: ${path}`);
        } catch (error) {
          console.error(`❌ Failed to revalidate ${path}:`, error);
          results.errors.push(`Failed to revalidate ${path}`);
        }
      }
    }

    // Regenerate article pages
    if (regenerateArticles) {
      try {
        const articlesResponse = await supabase
          .from(TABLES.ARTICLES)
          .select('slug')
          .eq('status', 'PUBLISHED');

        const articles = handleSupabaseResponse(articlesResponse);
        
        if (articles) {
          for (const article of articles) {
            const articlePath = `/article/${article.slug}`;
            try {
              revalidatePath(articlePath);
              results.revalidated.push(articlePath);
            } catch (error) {
              console.error(`❌ Failed to revalidate article ${articlePath}:`, error);
              results.errors.push(`Failed to revalidate ${articlePath}`);
            }
          }
          console.log(`✅ Revalidated ${articles.length} article pages`);
        }
      } catch (error) {
        console.error('❌ Error fetching articles for regeneration:', error);
        results.errors.push('Failed to fetch articles for regeneration');
      }
    }

    // Regenerate category pages
    if (regenerateCategories) {
      try {
        const categoriesResponse = await supabase
          .from(TABLES.CATEGORIES)
          .select('slug');

        const categories = handleSupabaseResponse(categoriesResponse);
        
        if (categories) {
          for (const category of categories) {
            const categoryPath = `/category/${category.slug}`;
            try {
              revalidatePath(categoryPath);
              results.revalidated.push(categoryPath);
            } catch (error) {
              console.error(`❌ Failed to revalidate category ${categoryPath}:`, error);
              results.errors.push(`Failed to revalidate ${categoryPath}`);
            }
          }
          console.log(`✅ Revalidated ${categories.length} category pages`);
        }
      } catch (error) {
        console.error('❌ Error fetching categories for regeneration:', error);
        results.errors.push('Failed to fetch categories for regeneration');
      }
    }

    // Revalidate cache tags
    try {
      revalidateTag('articles');
      revalidateTag('categories');
      revalidateTag('authors');
      console.log('✅ Revalidated cache tags');
    } catch (error) {
      console.error('❌ Failed to revalidate cache tags:', error);
      results.errors.push('Failed to revalidate cache tags');
    }

    const duration = Date.now() - startTime;
    
    console.log(`🎉 SSG regeneration completed in ${duration}ms`);
    console.log(`📊 Results: ${results.revalidated.length} revalidated, ${results.errors.length} errors`);

    return createApiResponse({
      message: 'SSG regeneration completed',
      duration: `${duration}ms`,
      stats: {
        revalidated: results.revalidated.length,
        errors: results.errors.length,
        totalPaths: results.revalidated.length
      },
      results
    });

  } catch (error) {
    console.error('❌ SSG regeneration failed:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'SSG regeneration failed',
      500
    );
  }
}

// GET /api/regenerate-ssg - Get regeneration status/info
export async function GET(request: NextRequest) {
  try {
    // Get current article and category counts for info
    const [articlesResponse, categoriesResponse] = await Promise.all([
      supabase
        .from(TABLES.ARTICLES)
        .select('id', { count: 'exact' })
        .eq('status', 'PUBLISHED'),
      supabase
        .from(TABLES.CATEGORIES)
        .select('id', { count: 'exact' })
    ]);

    const articleCount = articlesResponse.count || 0;
    const categoryCount = categoriesResponse.count || 0;

    return createApiResponse({
      status: 'ready',
      info: 'SSG regeneration endpoint is ready',
      stats: {
        publishedArticles: articleCount,
        categories: categoryCount,
        estimatedPages: 2 + articleCount + categoryCount // home + news + articles + categories
      },
      endpoints: {
        regenerate: 'POST /api/regenerate-ssg',
        options: {
          revalidateAll: 'boolean - revalidate main pages',
          specificPaths: 'string[] - specific paths to revalidate',
          regenerateArticles: 'boolean - regenerate article pages',
          regenerateCategories: 'boolean - regenerate category pages'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting regeneration info:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to get regeneration info',
      500
    );
  }
}
