import { PrismaClient } from '@prisma/client';

// Create a singleton instance of Prisma Client
class DatabaseService {
  private static instance: DatabaseService;
  public prisma: PrismaClient;

  private constructor() {
    // Initialize Prisma Client with better connection handling
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Handle process termination gracefully
    process.on('beforeExit', async () => {
      await this.disconnect();
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  public async resetConnection(): Promise<void> {
    try {
      console.log('🔄 Resetting database connection...');
      await this.disconnect();
      await this.connect();
      console.log('✅ Database connection reset successfully');
    } catch (error) {
      console.error('❌ Failed to reset database connection:', error);
      throw error;
    }
  }

  public createFreshClient(): PrismaClient {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  public async executeWithRetry<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Check if it's a prepared statement conflict
        if (error.message?.includes('prepared statement') && error.message?.includes('already exists')) {
          console.log(`🔄 Attempt ${attempt}: Prepared statement conflict detected, using fresh client...`);

          if (attempt < maxRetries) {
            // Create a fresh client for the retry
            const freshClient = this.createFreshClient();
            try {
              const result = await operation();
              await freshClient.$disconnect();
              return result;
            } catch (retryError) {
              await freshClient.$disconnect();
              lastError = retryError;
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
          }
        }

        // If it's not a prepared statement error or we've exhausted retries, throw
        throw error;
      }
    }

    throw lastError;
  }
}

// Export the singleton instance
export const db = DatabaseService.getInstance();
export default db;
