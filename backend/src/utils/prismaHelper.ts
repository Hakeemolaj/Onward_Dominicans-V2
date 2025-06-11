import { PrismaClient } from '@prisma/client';
import { db } from '../services/database';

// Global counter for unique client instances
let clientCounter = 0;

/**
 * Creates a fresh Prisma client to avoid prepared statement conflicts
 */
export function createFreshPrismaClient(): PrismaClient {
  clientCounter++;
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

/**
 * Executes a Prisma operation with automatic retry using fresh clients on prepared statement conflicts
 */
export async function executeWithFreshClient<T>(
  operation: (client: PrismaClient) => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = createFreshPrismaClient();
    
    try {
      const result = await operation(client);
      await client.$disconnect();
      return result;
    } catch (error: any) {
      await client.$disconnect();
      lastError = error;
      
      // Check if it's a prepared statement conflict
      if (error.message?.includes('prepared statement') && error.message?.includes('already exists')) {
        console.log(`🔄 Attempt ${attempt}: Prepared statement conflict, retrying with fresh client...`);
        
        if (attempt < maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          continue;
        }
      }
      
      // If it's not a prepared statement error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Safe wrapper for Prisma operations that handles prepared statement conflicts
 * Falls back to raw SQL when Prisma clients fail
 */
export async function safePrismaOperation<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation?: (client: PrismaClient) => Promise<T>,
  rawSqlFallback?: () => Promise<T>
): Promise<T> {
  try {
    return await primaryOperation();
  } catch (error: any) {
    if (error.message?.includes('prepared statement') && error.message?.includes('already exists')) {
      console.log('🔄 Prepared statement conflict detected...');

      // Try raw SQL fallback first if available
      if (rawSqlFallback) {
        console.log('🔄 Using raw SQL fallback...');
        try {
          return await rawSqlFallback();
        } catch (rawError) {
          console.log('❌ Raw SQL fallback failed:', rawError);
        }
      }

      // Try fresh client fallback
      if (fallbackOperation) {
        console.log('🔄 Using fresh client fallback...');
        try {
          return await executeWithFreshClient(fallbackOperation);
        } catch (freshError) {
          console.log('❌ Fresh client fallback failed:', freshError);
        }
      }

      // If all fallbacks fail, throw original error
      throw error;
    }
    throw error;
  }
}

/**
 * Raw SQL fallback functions to bypass Prisma prepared statement issues
 */
export const rawSqlFallbacks = {
  async countAuthors(): Promise<number> {
    const result = await db.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      'SELECT COUNT(*) as count FROM authors WHERE "isActive" = true'
    );
    return Number(result[0].count);
  },

  async getAuthors(skip: number = 0, take: number = 10, sortBy: string = 'name', sortOrder: string = 'asc'): Promise<any[]> {
    // Use raw SQL with string interpolation for ORDER BY (safe since we control the values)
    const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const orderColumn = sortBy === 'name' ? 'name' : 'name'; // Default to name for safety

    const query = `
      SELECT
        a.id,
        a.name,
        a.email,
        a.bio,
        a."avatarUrl",
        a."isActive",
        a."createdAt",
        a."updatedAt",
        CAST(COUNT(ar.id) as INTEGER) as article_count
      FROM authors a
      LEFT JOIN articles ar ON a.id = ar."authorId" AND ar.status = 'PUBLISHED'
      WHERE a."isActive" = true
      GROUP BY a.id, a.name, a.email, a.bio, a."avatarUrl", a."isActive", a."createdAt", a."updatedAt"
      ORDER BY a.${orderColumn} ${orderDirection}
      LIMIT $1 OFFSET $2
    `;

    const result = await db.prisma.$queryRawUnsafe<any[]>(query, take, skip);
    return result.map(author => ({
      ...author,
      _count: { articles: author.article_count || 0 }
    }));
  },

  async countCategories(): Promise<number> {
    const result = await db.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      'SELECT COUNT(*) as count FROM categories WHERE "isActive" = true'
    );
    return Number(result[0].count);
  },

  async getCategories(): Promise<any[]> {
    const query = `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.color,
        c."isActive",
        c."createdAt",
        c."updatedAt",
        CAST(COUNT(a.id) as INTEGER) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a."categoryId" AND a.status = 'PUBLISHED'
      WHERE c."isActive" = true
      GROUP BY c.id, c.name, c.slug, c.description, c.color, c."isActive", c."createdAt", c."updatedAt"
      ORDER BY c.name ASC
    `;

    const result = await db.prisma.$queryRawUnsafe<any[]>(query);
    return result.map(category => ({
      ...category,
      _count: { articles: category.article_count || 0 }
    }));
  },

  async findUserByEmail(email: string): Promise<any> {
    console.log('🔍 Looking for user with email:', email);

    try {
      // First try to find user without isActive filter to see if user exists
      const userExists = await db.prisma.user.findFirst({
        where: { email: email },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          password: true,
          createdAt: true,
          updatedAt: true
        }
      });

      console.log('👤 User exists check:', userExists ? `Found ${userExists.email} (active: ${userExists.isActive})` : 'Not found');

      if (!userExists) {
        console.log('❌ User not found in database');
        return null;
      }

      if (!userExists.isActive) {
        console.log('❌ User found but not active');
        return null;
      }

      console.log('✅ User found and active');
      return userExists;

    } catch (error: any) {
      console.log('🔄 Prisma findFirst failed, using raw SQL fallback:', error.message);

      try {
        // Fallback to raw SQL if Prisma fails
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.prisma.$queryRawUnsafe<any[]>(query, email);
        const user = result[0] || null;

        console.log('🔍 Raw SQL result:', user ? `Found ${user.email} (active: ${user.isActive})` : 'Not found');

        if (!user || !user.isActive) {
          return null;
        }

        return user;
      } catch (rawError: any) {
        console.error('❌ Raw SQL fallback also failed:', rawError.message);
        return null;
      }
    }
  },

  async findUserById(id: string): Promise<any> {
    // Use a unique prepared statement name to avoid conflicts
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);

    try {
      // Try using Prisma's findUnique first (safer)
      const user = await db.prisma.user.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
      return user;
    } catch (error: any) {
      // Fallback to raw SQL if Prisma fails
      console.log('🔄 Prisma findUnique failed, using raw SQL fallback');
      const query = `
        SELECT
          id, email, username, "firstName", "lastName", role, "createdAt", "updatedAt"
        FROM users
        WHERE id = $1 AND "isActive" = true
      `;
      const result = await db.prisma.$queryRawUnsafe<any[]>(query, id);
      return result[0] || null;
    }
  }
};
