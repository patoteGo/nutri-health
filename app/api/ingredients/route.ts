import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ingredients?search=term
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  // Fetch a reasonable number of ingredients for client-side filtering
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    take: 100
  });
  let filtered = ingredients;
  if (search) {
    const lower = search.toLowerCase();
    filtered = ingredients.filter(ing =>
      ing.name.toLowerCase().includes(lower) ||
      (ing.searchTerms || []).some(term => term.toLowerCase().includes(lower))
    );
  }
  return NextResponse.json(
    filtered.slice(0, 20).map(({ id, name, carbs, protein, fat, imageUrl, unit }) => ({ id, name, carbs, protein, fat, imageUrl, unit }))
  );
}
