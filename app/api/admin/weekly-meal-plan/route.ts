// API route for getting/setting weekly meal plans (admin only)
import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { WeeklyMealPlanSchema } from "../../../../lib/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  // TODO: Check isAdmin
  const { searchParams } = new URL(req.url);
  const person = searchParams.get("person");
  const weekStart = searchParams.get("weekStart");
  if (!person || !weekStart) {
    return new Response("Missing params", { status: 400 });
  }
  const plan = await prisma.weeklyMealPlan.findFirst({
    where: { userId: person, weekStart: new Date(weekStart) },
  });
  return Response.json(plan || { person, weekStart, meals: {} });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  // TODO: Check isAdmin
  const body = await req.json();
  const parse = WeeklyMealPlanSchema.safeParse(body);
  if (!parse.success) {
    return new Response("Invalid data", { status: 400 });
  }
  const { person, weekStart, meals } = parse.data;
  const existing = await prisma.weeklyMealPlan.findFirst({
    where: {
      userId: person,
      weekStart: new Date(weekStart),
    },
  });

  let plan;
  if (existing) {
    plan = await prisma.weeklyMealPlan.update({
      where: { id: existing.id },
      data: { meals },
    });
  } else {
    plan = await prisma.weeklyMealPlan.create({
      data: {
        userId: person,
        weekStart: new Date(weekStart),
        meals,
        name: `Meal Plan for ${new Date(weekStart).toLocaleDateString()}`, // Add required name field
      },
    });
  }
  return Response.json(plan);
}
