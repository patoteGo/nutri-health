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
  // Ensure profile image is always present in session
  callbacks: {
    async session({ session, token }) {
      if (token?.picture) {
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile?.picture) {
        token.picture = profile.picture;
      }
      return token;
    },
  },
});

export const GET = handler;
export const POST = handler;