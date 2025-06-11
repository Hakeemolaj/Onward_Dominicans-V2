const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function resetDatabaseConnection() {
  console.log('🔄 Resetting database connection and clearing prepared statements...');
  
  let prisma = null;
  
  try {
    // Create a fresh Prisma client
    prisma = new PrismaClient({
      log: ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Clear any existing prepared statements (PostgreSQL specific)
    try {
      await prisma.$executeRaw`DEALLOCATE ALL`;
      console.log('✅ Cleared all prepared statements');
    } catch (error) {
      console.log('ℹ️ No prepared statements to clear or not supported');
    }

    // Test basic connectivity
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connectivity test passed');

    // Test user table access
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible, count: ${userCount}`);
    } catch (error) {
      console.log('⚠️ User table not accessible:', error.message);
    }

    console.log('🎉 Database connection reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection reset failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Database disconnected');
    }
  }
}

// Run the reset
resetDatabaseConnection();
