import type { NextAuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt";
import FacebookProvider from "next-auth/providers/facebook"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, withRetry } from "@/lib/prisma";
import type { AdapterUser } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...(process.env.FACEBOOK_ID && process.env.FACEBOOK_SECRET ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET
      })
    ] : []),
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET
      })
    ] : []),
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID ? [
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID,
      })
    ] : []),
  ],
  session: {
    strategy: "jwt" as const,
  },
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async signIn({ user, account, profile }: {
      user: User | AdapterUser;
      account: any | null;
      profile?: any;
    }) {
      // Azure AD returns verified corporate emails — safe to trust
      if (!user?.email || !account) return false;

      try {
        // Find if a user already exists with this email
        const existingUser = await withRetry(() => prisma.user.findUnique({
          where: { email: user.email || '' },
          include: { accounts: true },
        }));

        if (existingUser) {
          // Check if this provider is already linked
          const isLinked = existingUser.accounts.some(
            (acc: any) => acc.provider === account.provider
          );

          if (!isLinked) {
            // 👇 Manually create the provider link
            await withRetry(() => prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                expires_at: account.expires_at,
              },
            }));
          }
        }

        return true;
      } catch (err) {
        console.error("Sign-in error:", err);
        return false;
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // If we have a user id, fetch subscription details from the database
        const userId = token.sub as string | undefined;
        
        // if (userId) {
        //   const dbUser = await withRetry(() => prisma.user.findUnique({
        //     where: { email: session.user?.email || undefined },
        //     select: {
        //       currentEditableBiasId: true,
        //       subscriptionTier: true,
        //       subscriptionStartedAt: true,
        //       subscriptionExpiresAt: true,
        //       stripeCustomerId: true,
        //       moderatedBias: { select: { id: true } },
        //       role: true,
        //     },
        //   }));

          // if (dbUser) {
          //   session.user.subscription = {
          //     tier: dbUser.subscriptionTier,
          //     startedAt: dbUser.subscriptionStartedAt ? dbUser.subscriptionStartedAt.toISOString() : null,
          //     expiresAt: dbUser.subscriptionExpiresAt ? dbUser.subscriptionExpiresAt.toISOString() : null,
          //     stripeCustomerId: dbUser.stripeCustomerId ?? null,
          //   } as any;
          //   session.user.currentEditableBiasId = dbUser.currentEditableBiasId;
          //   session.user.moderatedBias = {
          //     id: dbUser.moderatedBias?.id,
          //   };
          //   session.user.role = dbUser.role;
          // }
        // }
      }

      return session;
    },
  },
}