import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      dob?: Date;
      slug?: string;
      role?: "ADMIN" | "STAFF" | "USER";
    }
  }
}

export { handler as GET, handler as POST };
