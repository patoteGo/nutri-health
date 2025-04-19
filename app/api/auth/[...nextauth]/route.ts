import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Helper function to get required environment variables
const getRequiredEnvVar = (varName: string): string => {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
};

// Configure NextAuth (App Router style)
const handler = NextAuth({
  providers: [
    Google({
      clientId: getRequiredEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnvVar("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  // Add any custom NextAuth config here
});

export const GET = handler;
export const POST = handler;