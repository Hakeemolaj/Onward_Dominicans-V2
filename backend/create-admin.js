const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔐 Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@onwarddominicans.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@onwarddominicans.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.message.includes('prepared statement')) {
      console.log('🔄 Retrying with fresh connection...');
      await prisma.$disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));
      return createAdmin();
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin().catch(console.error);
