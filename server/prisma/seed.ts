import { PrismaClient, Role, AuthProvider } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = process.env.SEED_ADMIN_NAME || 'System Administrator';

  console.log('Seeding initial data...');
  console.log(`Admin email: ${adminEmail}`);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  if (existingAdmin) {
    console.log('Admin user already exists. Updating role and password...');
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: Role.ADMIN,
        passwordHash,
        name: adminName,
      },
    });
  } else {
    console.log('Creating initial admin user...');
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
        provider: AuthProvider.LOCAL,
      },
    });
  }

  // Create standard test user
  const testUserEmail = 'user@example.com';
  const existingTestUser = await prisma.user.findUnique({
    where: { email: testUserEmail },
  });

  if (!existingTestUser) {
    console.log('Creating test user (user@example.com)...');
    const userHash = await bcrypt.hash('UserPassword123!', saltRounds);
    const regularUser = await prisma.user.create({
      data: {
        name: 'Jane Doe',
        email: testUserEmail,
        passwordHash: userHash,
        role: Role.USER,
        provider: AuthProvider.LOCAL,
      },
    });

    // Sample ownership record for post ID 1
    await prisma.postOwnership.create({
      data: {
        jsonPlaceholderPostId: 1,
        userId: regularUser.id,
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        body: 'quia et suscipit suscipit recusandae consequuntur expedita et cum reprehenderit molestiae ut ut quas totam nostrum rerum est autem sunt rem eveniet architecto',
      },
    });
    console.log('Created sample post ownership for test user.');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
