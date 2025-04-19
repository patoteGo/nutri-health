import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Helper function to get required environment variables
// const getRequiredEnvVar = (varName: string): string => {
//   const value = process.env[varName];
//   if (!value) {
//     throw new Error(`Missing required environment variable: ${varName}`);
//   }
//   return value;
// };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };