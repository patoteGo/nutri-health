import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/meal-moments
export async function GET() {
  // Return all meal moments (dynamic, from DB)
  const moments = await prisma.mealMoment.findMany({
    select: {
      name: true,
      description: true,
      timeInDay: true,
      id: true,
    },
    orderBy: { timeInDay: 'asc' },
  });
  return NextResponse.json(moments);
}
