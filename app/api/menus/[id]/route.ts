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

// GET handler for retrieving a menu by ID
export async function GET(request: NextRequest) {
  try {
    // Extract ID from URL
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing menu id in route parameters' }, { status: 400 });
    }

    const menu = await prisma.meal.findUnique({
      where: { id },
      include: {
        mealMoment: true,
      },
    });

    if (!menu) {
      return NextResponse.json({ error: `Menu with id ${id} not found` }, { status: 404 });
    }

    // Return the menu with the name derived from parts and category from mealMoment
    return NextResponse.json({
      id: menu.id,
      name: menu.parts && Array.isArray(menu.parts) && menu.parts.length > 0 && typeof menu.parts[0] === 'object' && menu.parts[0] !== null && 'name' in menu.parts[0] ? 
        String(menu.parts[0].name) : 'Unnamed Menu', // Derive name from first ingredient or use default
      category: menu.mealMoment?.name || '',
      personId: menu.userId || '',
      ingredients: menu.parts || [],
    });
  } catch (e) {
    const message = typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e);
    return NextResponse.json({ error: `Failed to retrieve menu: ${message}` }, { status: 500 });
  }
}

// PUT handler for updating a menu by ID
export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing menu id in route parameters' }, { status: 400 });
    }

    // Check if the menu exists
    const existingMenu = await prisma.meal.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: `Menu with id ${id} not found` }, { status: 404 });
    }

    const body = await request.json();
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

    // Update the menu
    const updatedMenu = await prisma.meal.update({
      where: { id },
      data: {
        userId: personId,
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

    // Return the updated menu with the name and category from the request
    return NextResponse.json({
      id: updatedMenu.id,
      name: name, // use the name from the request, since DB does not store it
      category: category,
      personId: personId,
      ingredients: updatedMenu.parts,
    });
  } catch (e) {
    const message = typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e);
    return NextResponse.json({ error: `Failed to update menu: ${message}` }, { status: 500 });
  }
}

// DELETE handler for deleting a menu by ID
export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing menu id in route parameters' }, { status: 400 });
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
