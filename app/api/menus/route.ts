import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Allowed meal moments (should match your enum or DB values)
const ALLOWED_MEAL_MOMENTS = [
  "Breakfast",
  "Snack1",
  "Lunch",
  "Snack2",
  "Dinner",
  "Supper"
];

const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  weight: z.number(),
});

const MenuSchema = z.object({
  name: z.string(),
  category: z.string(),
  personId: z.string(),
  ingredients: z.array(IngredientSchema),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MenuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid menu data', details: parsed.error.errors }, { status: 400 });
    }
    const { name, category, personId, ingredients } = parsed.data;
    if (!ALLOWED_MEAL_MOMENTS.includes(category)) {
      return NextResponse.json({ error: `Invalid meal moment: ${category}` }, { status: 400 });
    }
    // Lookup MealMoment by name (case-sensitive)
    const mealMoment = await prisma.mealMoment.findUnique({ where: { name: category } });
    if (!mealMoment) {
      return NextResponse.json({ error: `MealMoment not found: ${category}` }, { status: 400 });
    }
    const menu = await prisma.meal.create({
      data: {
        userId: personId,
        date: new Date(), // or pass from client
        mealMomentId: mealMoment.id,
        parts: ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          weight: ing.weight,
          unit: ing.unit,
          imageUrl: ing.imageUrl,
          carbs: ing.carbs,
          protein: ing.protein,
          fat: ing.fat,
        })),
      },
    });
    return NextResponse.json({
  id: menu.id,
  name: name, // use the name from the request, since DB does not store it
  category: category,
  personId: personId,
  ingredients: menu.parts,
});
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create menu', details: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get('personId');

    // Query to get all meals for the person
    const meals = await prisma.meal.findMany({
      where: personId ? { userId: personId } : undefined,
      include: {
        mealMoment: true,
      },
    });

    // Transform the meals to match the expected Menu format
    const menus = meals.map(meal => ({
      id: meal.id,
      name: meal.parts && Array.isArray(meal.parts) && meal.parts.length > 0 && 
            typeof meal.parts[0] === 'object' && meal.parts[0] !== null && 'name' in meal.parts[0] ? 
            String(meal.parts[0].name) : 'Unnamed Menu',
      category: meal.mealMoment?.name || '',
      personId: meal.userId || '',
      ingredients: meal.parts || [],
      // These properties will be set in the UI when assigned to a day/moment
      assignedDay: null,
      assignedMoment: null,
    }));

    return NextResponse.json(menus);
  } catch (e) {
    const message = typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e);
    return NextResponse.json({ error: `Failed to retrieve menus: ${message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing menu id in query string (?id=...)' }, { status: 400 });
    }
    try {
      const deleted = await prisma.meal.delete({ where: { id } });
      if (!deleted) {
        return NextResponse.json({ error: `Menu with id ${id} not found` }, { status: 404 });
      }
      return NextResponse.json({ success: true, deleted });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2025') {
        return NextResponse.json({ error: `Menu with id ${id} not found (prisma)` }, { status: 404 });
      }
      const message = typeof err === 'object' && err !== null && 'message' in err ? (err as { message?: string }).message : String(err);
      return NextResponse.json({ error: `DB error: ${message}` }, { status: 500 });
    }
  } catch (e: unknown) {
    const message = typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e);
    return NextResponse.json({ error: `Failed to delete menu: ${message}` }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing menu id in query string (?id=...)' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = z.object({
      ingredients: z.array(IngredientSchema),
    }).safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid ingredients data', details: parsed.error.errors }, { status: 400 });
    }

    const { ingredients } = parsed.data;

    const menu = await prisma.meal.update({
      where: { id },
      data: {
        parts: ingredients.map(ing => ({
          id: ing.id,
          name: ing.name,
          weight: ing.weight,
          unit: ing.unit,
          imageUrl: ing.imageUrl,
          carbs: ing.carbs,
          protein: ing.protein,
          fat: ing.fat,
        })),
      },
    });

    return NextResponse.json({
      id: menu.id,
      ingredients: menu.parts,
    });
  } catch (e) {
    const message = typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e);
    return NextResponse.json({ error: `Failed to update menu: ${message}` }, { status: 500 });
  }
}
