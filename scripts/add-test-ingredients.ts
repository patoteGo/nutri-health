import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestIngredients() {
  console.log('Checking for existing ingredients...');
  const count = await prisma.ingredient.count();
  console.log(`Database has ${count} ingredients`);

  if (count > 0) {
    console.log('Database already has ingredients. Skipping creation.');
    return;
  }

  console.log('Adding test ingredients...');

  const testIngredients = [
    {
      name: 'Chicken Breast',
      carbs: 0,
      protein: 31,
      fat: 3.6,
      unit: 'GRAM',
      searchTerms: ['chicken', 'poultry', 'meat', 'protein']
    },
    {
      name: 'Brown Rice',
      carbs: 23,
      protein: 2.6,
      fat: 0.9,
      unit: 'GRAM',
      searchTerms: ['rice', 'grain', 'carb']
    },
    {
      name: 'Broccoli',
      carbs: 6.6,
      protein: 2.8,
      fat: 0.4,
      unit: 'GRAM',
      searchTerms: ['vegetable', 'green', 'cruciferous']
    },
    {
      name: 'Salmon',
      carbs: 0,
      protein: 25,
      fat: 13,
      unit: 'GRAM',
      searchTerms: ['fish', 'seafood', 'omega-3']
    },
    {
      name: 'Sweet Potato',
      carbs: 20.1,
      protein: 1.6,
      fat: 0.1,
      unit: 'GRAM',
      searchTerms: ['potato', 'tuber', 'carb']
    },
    {
      name: 'Olive Oil',
      carbs: 0,
      protein: 0,
      fat: 100,
      unit: 'ML',
      searchTerms: ['oil', 'fat', 'cooking']
    },
    {
      name: 'Spinach',
      carbs: 3.6,
      protein: 2.9,
      fat: 0.4,
      unit: 'GRAM',
      searchTerms: ['vegetable', 'green', 'leafy']
    },
    {
      name: 'Greek Yogurt',
      carbs: 3.6,
      protein: 10,
      fat: 0.4,
      unit: 'GRAM',
      searchTerms: ['dairy', 'protein', 'breakfast']
    },
    {
      name: 'Quinoa',
      carbs: 21.3,
      protein: 4.4,
      fat: 1.9,
      unit: 'GRAM',
      searchTerms: ['grain', 'protein', 'carb']
    },
    {
      name: 'Avocado',
      carbs: 8.5,
      protein: 2,
      fat: 15,
      unit: 'GRAM',
      searchTerms: ['fruit', 'healthy fat']
    }
  ];

  try {
    const createdIngredients = await prisma.ingredient.createMany({
      data: testIngredients,
      skipDuplicates: true,
    });

    console.log(`Successfully added ${createdIngredients.count} test ingredients`);
  } catch (error) {
    console.error('Error adding test ingredients:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestIngredients()
  .catch(console.error)
  .finally(() => process.exit(0));
