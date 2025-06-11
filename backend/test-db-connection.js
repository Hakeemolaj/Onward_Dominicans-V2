const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if tables exist using a different approach
    const articles = await prisma.article.findMany({ take: 1 });
    console.log('✅ Articles table accessible, count:', articles.length);

    const authors = await prisma.author.findMany({ take: 1 });
    console.log('✅ Authors table accessible, count:', authors.length);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
