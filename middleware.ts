import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// List of protected routes (add more as needed)
const protectedRoutes = ["/log-meal"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the path is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Try to get the session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // Not authenticated, redirect to sign-in
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated, continue
  return NextResponse.next();
}

// Only run middleware on protected routes
export const config = {
  matcher: ["/log-meal"],
};
