#!/usr/bin/env node

/**
 * Script to prepare the backend for production deployment
 * This script switches the Prisma schema to use PostgreSQL
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing backend for production deployment...');

try {
  // Read the PostgreSQL schema
  const postgresqlSchemaPath = path.join(__dirname, '../prisma/schema.postgresql.prisma');
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (fs.existsSync(postgresqlSchemaPath)) {
    const postgresqlSchema = fs.readFileSync(postgresqlSchemaPath, 'utf8');
    
    // Backup current schema
    const backupPath = path.join(__dirname, '../prisma/schema.sqlite.backup');
    if (fs.existsSync(schemaPath)) {
      fs.copyFileSync(schemaPath, backupPath);
      console.log('✅ Backed up SQLite schema to schema.sqlite.backup');
    }
    
    // Replace with PostgreSQL schema
    fs.writeFileSync(schemaPath, postgresqlSchema);
    console.log('✅ Switched to PostgreSQL schema');
    
    console.log('🎉 Production preparation complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Commit and push your changes to GitHub');
    console.log('2. Deploy to Render.com following the DEPLOYMENT.md guide');
    console.log('3. Run database migrations on Render');
    
  } else {
    console.error('❌ PostgreSQL schema file not found');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Error preparing for production:', error.message);
  process.exit(1);
}
