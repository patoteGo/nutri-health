import { PrismaClient, IngredientUnit } from '@prisma/client';

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

  // Seed meal moments
  const mealMoments = [
    { name: 'Breakfast', timeInDay: '08:30', description: 'Morning meal to start the day' },
    { name: 'Snack1', timeInDay: '10:30', description: 'Mid-morning snack' },
    { name: 'Lunch', timeInDay: '12:00', description: 'Main midday meal' },
    { name: 'Snack2', timeInDay: '16:00', description: 'Afternoon snack' },
    { name: 'Dinner', timeInDay: '20:00', description: 'Evening meal' },
    { name: 'Supper', timeInDay: '22:00', description: 'Light late meal or snack' },
  ];
  for (const mm of mealMoments) {
    await prisma.mealMoment.upsert({
      where: { name: mm.name },
      update: mm,
      create: mm,
    });
    console.log(`Seeded meal moment: ${mm.name}`);
  }

  // Seed basic ingredients
  const ingredients = [
    // Already included items (with dynamic Unsplash images)
    { name: 'Chicken Breast',       carbs: 0,    protein: 31,   fat: 3.6,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?chicken-breast',       searchTerms: ['chicken breast','peito de frango'] },
    { name: 'Brown Rice',           carbs: 23,   protein: 2.6,  fat: 0.9,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?brown-rice',           searchTerms: ['brown rice','arroz integral'] },
    { name: 'Broccoli',             carbs: 7,    protein: 2.8,  fat: 0.4,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?broccoli',             searchTerms: ['broccoli','brócolis'] },
    { name: 'Olive Oil',            carbs: 0,    protein: 0,    fat: 100,   unit: IngredientUnit.ML,        imageUrl: 'https://source.unsplash.com/400x400/?olive-oil',            searchTerms: ['olive oil','azeite'] },
    { name: 'Egg',                  carbs: 1.1,  protein: 13,   fat: 11,    unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?egg',                  searchTerms: ['egg','ovo'] },
    { name: 'Apple',                carbs: 14,   protein: 0.3,  fat: 0.2,   unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?apple',                searchTerms: ['apple','maçã'] },
    { name: 'Salmon',               carbs: 0,    protein: 20,   fat: 13,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?salmon',               searchTerms: ['salmon','salmão'] },
    { name: 'Potato',               carbs: 17,   protein: 2,    fat: 0.1,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?potato',               searchTerms: ['potato','batata'] },
    { name: 'Quinoa',               carbs: 21,   protein: 4.4,  fat: 1.9,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?quinoa',               searchTerms: ['quinoa'] },
    { name: 'Almond',               carbs: 22,   protein: 21,   fat: 49,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?almond',               searchTerms: ['almond','amêndoa'] },
  
    // New items from both meal plans
    { name: 'French Bread',         carbs: 56.9, protein: 9.5,  fat: 2.7,   unit: IngredientUnit.SLICE,     imageUrl: 'https://source.unsplash.com/400x400/?french-bread',         searchTerms: ['french bread','pão francês'] },
    { name: 'Cheese Slice',         carbs: 1.3,  protein: 25,   fat: 33,    unit: IngredientUnit.SLICE,     imageUrl: 'https://source.unsplash.com/400x400/?cheese-slice',         searchTerms: ['cheese','queijo'] },
    { name: 'Oregano',              carbs: 68.9, protein: 9,    fat: 4.3,   unit: IngredientUnit.TEASPOON,  imageUrl: 'https://source.unsplash.com/400x400/?oregano',              searchTerms: ['oregano','orégano'] },
    { name: 'Tapioca Flour',        carbs: 88.7, protein: 0.2,  fat: 0.1,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?tapioca',              searchTerms: ['tapioca','tapioca'] },
    { name: 'Low‑Fat Yogurt',       carbs: 4.7,  protein: 3.5,  fat: 0.1,   unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?low-fat-yogurt',       searchTerms: ['low-fat yogurt','iogurte desnatado'] },
    { name: 'Mixed Fruit',          carbs: 12,   protein: 0.5,  fat: 0.2,   unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?fruit-salad',          searchTerms: ['mixed fruit','salada de frutas'] },
    { name: 'Oats',                 carbs: 66.3, protein: 16.9, fat: 6.9,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?oats',                 searchTerms: ['oats','aveia'] },
    { name: 'Ground Beef',          carbs: 0,    protein: 26,   fat: 15,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?ground-beef',          searchTerms: ['ground beef','carne moída'] },
    { name: 'Cassava',              carbs: 38,   protein: 1.4,  fat: 0.3,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?cassava',              searchTerms: ['cassava','mandioca'] },
    { name: 'Corn',                 carbs: 19,   protein: 3.4,  fat: 1.5,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?corn',                 searchTerms: ['corn','milho'] },
    { name: 'Mixed Greens',         carbs: 2.5,  protein: 2,    fat: 0,     unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?mixed-greens',         searchTerms: ['mixed greens','salada'] },
    { name: 'White Fish',           carbs: 0,    protein: 18,   fat: 1,     unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?white-fish',           searchTerms: ['white fish','peixe'] },
    { name: 'White Rice',           carbs: 28,   protein: 2.7,  fat: 0.3,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?white-rice',           searchTerms: ['white rice','arroz branco'] },
    { name: 'Whole Wheat Wrap',     carbs: 43,   protein: 8,    fat: 4,     unit: IngredientUnit.PIECE,     imageUrl: 'https://source.unsplash.com/400x400/?whole-wheat-wrap',     searchTerms: ['wrap','rap 10'] },
    { name: 'Mixed Vegetables',     carbs: 8,    protein: 2,    fat: 0.2,   unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?mixed-vegetables',     searchTerms: ['mixed vegetables','legumes'] },
    { name: 'Pasta',                carbs: 75,   protein: 13,   fat: 1.5,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?pasta',                searchTerms: ['pasta','macarrão'] },
    { name: 'Sardines',             carbs: 0,    protein: 25,   fat: 11,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?sardines',             searchTerms: ['sardines','sardinha'] },
    { name: 'Tuna',                 carbs: 0,    protein: 23,   fat: 1,     unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?tuna',                 searchTerms: ['tuna','atum'] },
    { name: 'Quail Egg',            carbs: 0.4,  protein: 12,   fat: 13,    unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?quail-egg',            searchTerms: ['quail egg','ovo de codorna'] },
    { name: 'Prune',                carbs: 63,   protein: 2.2,  fat: 0.4,   unit: IngredientUnit.PIECE,     imageUrl: 'https://source.unsplash.com/400x400/?prune',                searchTerms: ['prune','ameixa preta'] },
    { name: 'Brazil Nut',           carbs: 12,   protein: 14,   fat: 66,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?brazil-nut',           searchTerms: ['brazil nut','castanha do pará'] },
    { name: 'Sunflower Seeds',      carbs: 20,   protein: 21,   fat: 51,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?sunflower-seeds',      searchTerms: ['sunflower seeds','sementes de girassol'] },
    { name: 'Flaxseed',             carbs: 29,   protein: 18,   fat: 42,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?flaxseed',             searchTerms: ['flaxseed','linhaça'] },
    { name: 'Whole Wheat Bread',    carbs: 40,   protein: 8,    fat: 4,     unit: IngredientUnit.SLICE,     imageUrl: 'https://source.unsplash.com/400x400/?whole-wheat-bread',    searchTerms: ['whole wheat bread','pão integral'] },
    { name: 'Whey Protein Powder',  carbs: 8,    protein: 80,   fat: 6,     unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?whey-protein',         searchTerms: ['whey protein','whey'] },
    { name: 'Cornflakes',           carbs: 84,   protein: 7,    fat: 1,     unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?cornflakes',           searchTerms: ['cornflakes','sucrilhos'] },
    { name: 'Banana',               carbs: 23,   protein: 1.1,  fat: 0.3,   unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?banana',               searchTerms: ['banana'] },
    { name: 'Strawberry',           carbs: 8,    protein: 0.7,  fat: 0.3,   unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?strawberry',           searchTerms: ['strawberry','morango'] },
    { name: 'Maca Powder',          carbs: 81,   protein: 10,   fat: 1.2,   unit: IngredientUnit.TEASPOON,  imageUrl: 'https://source.unsplash.com/400x400/?maca-powder',          searchTerms: ['maca powder','maca peruana'] },
    { name: 'Milk',                 carbs: 5,    protein: 3.4,  fat: 1.5,   unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?milk',                 searchTerms: ['milk','leite sem lactose'] },
    { name: 'Mixed Nuts',           carbs: 22,   protein: 20,   fat: 50,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?mixed-nuts',           searchTerms: ['mixed nuts','mix de castanhas'] },
    { name: 'Sweet Potato',         carbs: 20,   protein: 1.6,  fat: 0,     unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?sweet-potato',         searchTerms: ['sweet potato','batata-doce'] },
    { name: 'Carrot',               carbs: 10,   protein: 0.9,  fat: 0.2,   unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?carrot',               searchTerms: ['carrot','cenoura'] },
    { name: 'Lettuce',              carbs: 2.9,  protein: 1.4,  fat: 0.2,   unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?lettuce',              searchTerms: ['lettuce','alface'] },
    { name: 'Cauliflower',          carbs: 5,    protein: 1.9,  fat: 0.3,   unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?cauliflower',          searchTerms: ['cauliflower','couve-flor'] },
    { name: 'Tomato',               carbs: 3.9,  protein: 0.9,  fat: 0.2,   unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?tomato',               searchTerms: ['tomato','tomate'] },
    { name: 'Bacon',                carbs: 1.4,  protein: 37,   fat: 42,    unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?bacon',                searchTerms: ['bacon'] },
    { name: 'Vinaigrette',          carbs: 1.5,  protein: 0,    fat: 5,     unit: IngredientUnit.TABLESPOON, imageUrl: 'https://source.unsplash.com/400x400/?vinaigrette',          searchTerms: ['vinaigrette','vinagrete'] },
    { name: 'Chamomile Tea',        carbs: 0,    protein: 0,    fat: 0,     unit: IngredientUnit.CUP,       imageUrl: 'https://source.unsplash.com/400x400/?chamomile-tea',        searchTerms: ['chamomile tea','chá de camomila'] },
    { name: 'Omega‑3 Capsule',      carbs: 0,    protein: 0,    fat: 1,     unit: IngredientUnit.UNIT,      imageUrl: 'https://source.unsplash.com/400x400/?omega-3',             searchTerms: ['omega-3','ômega 3'] },
    { name: 'Creatine',             carbs: 0,    protein: 0,    fat: 0,     unit: IngredientUnit.GRAM,      imageUrl: 'https://source.unsplash.com/400x400/?creatine',             searchTerms: ['creatine'] },
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
