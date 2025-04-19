import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user if not exists
  const adminEmail = 'admin@nutrihealth.local';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true },
    create: {
      email: adminEmail,
      name: 'Admin',
      isAdmin: true,
    },
  });
  console.log(`Seeded admin user: ${adminEmail} (isAdmin: true)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
