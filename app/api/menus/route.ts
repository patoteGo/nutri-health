import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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
    const menu = await prisma.meal.create({
      data: {
        userId: personId,
        date: new Date(), // or pass from client
        moment: category.toUpperCase(), // expects enum value
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
    return NextResponse.json(menu);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create menu', details: String(e) }, { status: 500 });
  }
}
