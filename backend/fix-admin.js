const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking existing users...');
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log('📋 Existing users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });
    
    // Check if admin exists
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@onwarddominicans.com' },
          { email: 'admin@onwarddominicans.news' },
          { role: 'ADMIN' }
        ]
      }
    });
    
    if (adminUser) {
      console.log('👤 Found admin user:', adminUser.email);
      
      // Update/reset admin password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const updatedAdmin = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          email: 'admin@onwarddominicans.com',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email: admin@onwarddominicans.com');
      console.log('🔑 Password: admin123');
      
    } else {
      console.log('👤 No admin user found, creating new one...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@onwarddominicans.com',
          username: 'admin',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@onwarddominicans.com');
      console.log('🔑 Password: admin123');
    }
    
    // Test password hash
    const testUser = await prisma.user.findUnique({
      where: { email: 'admin@onwarddominicans.com' }
    });
    
    if (testUser) {
      const isValidPassword = await bcrypt.compare('admin123', testUser.password);
      console.log('🧪 Password test:', isValidPassword ? '✅ Valid' : '❌ Invalid');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();
