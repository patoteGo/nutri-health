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

  // Seed basic ingredients
  const ingredients = [
    { name: 'Chicken Breast', carbs: 0, protein: 31, fat: 3.6, unit: 'GRAM', imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Brown Rice', carbs: 23, protein: 2.6, fat: 0.9, unit: 'GRAM', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
    { name: 'Broccoli', carbs: 7, protein: 2.8, fat: 0.4, unit: 'GRAM', imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' },
    { name: 'Olive Oil', carbs: 0, protein: 0, fat: 100, unit: 'ML', imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Egg', carbs: 1.1, protein: 13, fat: 11, unit: 'UNIT', imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Apple', carbs: 14, protein: 0.3, fat: 0.2, unit: 'UNIT', imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80' },
    { name: 'Salmon', carbs: 0, protein: 20, fat: 13, unit: 'GRAM', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
    { name: 'Potato', carbs: 17, protein: 2, fat: 0.1, unit: 'GRAM', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
    { name: 'Quinoa', carbs: 21, protein: 4.4, fat: 1.9, unit: 'GRAM', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Quinoa_White.png' },
    { name: 'Almond', carbs: 22, protein: 21, fat: 49, unit: 'GRAM', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
  ];
  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: ing,
      create: ing,
    });
    console.log(`Seeded ingredient: ${ing.name}`);
  }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
