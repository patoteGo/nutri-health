import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

// Helper function to get required environment variables
const getRequiredEnvVar = (varName: string): string => {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
  return value;
};

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: getRequiredEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnvVar("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  // Ensure profile image is always present in session
  callbacks: {
    async signIn({ user, profile }) {
      // Upsert user in DB with name and Google picture on every login
      const { prisma } = await import('./prisma');
      if (user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? profile?.name ?? undefined,
            picture: user.image ?? profile?.picture ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name ?? profile?.name ?? undefined,
            picture: user.image ?? profile?.picture ?? undefined,
          },
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.picture) {
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
};
