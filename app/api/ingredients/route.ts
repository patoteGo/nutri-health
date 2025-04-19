import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ingredients?search=term
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};
  const ingredients = await prisma.ingredient.findMany({
    where,
    orderBy: { name: "asc" },
    take: 20,
  });
  return NextResponse.json(
    ingredients.map(({ id, name, carbs, protein, fat }) => ({ id, name, carbs, protein, fat }))
  );
}
