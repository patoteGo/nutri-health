import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * This endpoint returns all menus (meals) for a user that can be assigned to meal plans
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const personId = searchParams.get('personId');

    if (!personId) {
      return NextResponse.json([], { status: 200 }); // Return empty array if no person is selected
    }

    // Step 1: Get all meals for the user
    const meals = await prisma.meal.findMany({
      where: {
        userId: personId
      },
      include: {
        mealMoment: true,
      },
    });

    // Step 2: Get all weekly meal plans for the user to check which meals are already assigned
    const weeklyPlans = await prisma.weeklyMealPlan.findMany({
      where: {
        userId: personId,
      },
    });

    // Step 3: Extract all meal IDs that are already assigned in any meal plan
    const assignedMealIds = new Set<string>();
    
    weeklyPlans.forEach(plan => {
      if (plan.meals && typeof plan.meals === 'object') {
        // Parse the JSON meals structure to find assigned meal IDs
        try {
          const mealsObj = plan.meals as Record<string, Record<string, { id: string }>>;
          
          // Iterate through days and meal moments
          Object.values(mealsObj).forEach(dayMeals => {
            Object.values(dayMeals).forEach(meal => {
              if (meal && meal.id) {
                assignedMealIds.add(meal.id);
              }
            });
          });
        } catch (err) {
          console.error('Error parsing meals JSON:', err);
        }
      }
    });

    // Step 4: Filter out meals that are already assigned
    const unassignedMeals = meals.filter(meal => !assignedMealIds.has(meal.id));

    // Transform the meals to match the expected Menu format
    const menus = unassignedMeals.map(meal => {
      // Extract first part name as menu name if available
      let menuName = 'Unnamed Menu';
      try {
        // Define a proper interface for the meal part instead of using 'any'
        interface MealPart {
          name?: string;
          weight?: number;
          unit?: string;
          imageUrl?: string;
          carbs?: number;
          protein?: number;
          fat?: number;
          [key: string]: unknown;
        }
        
        const parts = meal.parts as MealPart[];
        if (Array.isArray(parts) && parts.length > 0 && parts[0] && parts[0].name) {
          menuName = parts[0].name;
        }
      } catch (err) {
        console.error('Error parsing meal parts:', err);
      }

      return {
        id: meal.id,
        name: menuName,
        category: meal.mealMoment?.name || '',
        personId: meal.userId,
        ingredients: meal.parts || [],
        // These properties will be set in the UI when assigned to a day/moment
        assignedDay: null,
        assignedMoment: null,
      };
    });

    return NextResponse.json(menus);
  } catch (e) {
    const message = typeof e === 'object' && e !== null && 'message' in e ? (e as { message?: string }).message : String(e);
    return NextResponse.json({ error: `Failed to retrieve unassigned menus: ${message}` }, { status: 500 });
  }
}
