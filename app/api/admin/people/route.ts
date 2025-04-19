// API route for fetching all people (users) for admin dashboard
import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  // TODO: Check isAdmin
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  return Response.json(users);
}
