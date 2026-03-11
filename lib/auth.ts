import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// AUHMS uses Azure Active Directory (Microsoft Entra ID) for SSO.
// Students and staff authenticate with existing university Microsoft credentials.
// No standalone AUHMS accounts are created or managed.
//
// Session strategy: JWT — stateless, no database session table required.
// Roles are stored in the app_users table and loaded into the JWT on first sign-in.
// Subsequent requests read the role from the JWT without a DB query.
//
// Required Entra ID app registration scopes:
//   openid, profile, email, User.Read
// Graph API scopes (email/Teams/SharePoint) are separate — see GRAPH_* env vars.

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // account and profile are only present on the initial sign-in.
      // Look up (or create) the user's role in app_users and cache it in the JWT.
      if (account && profile) {
        const oid = (profile as { oid?: string }).oid ?? token.sub!;
        const email = (token.email as string) ?? "";

        token.azureAdId = oid;

        // Upsert: create the record on first login, keep role on subsequent logins.
        const appUser = await prisma.appUser.upsert({
          where: { azure_oid: oid },
          update: { email },
          create: { azure_oid: oid, email, role: UserRole.STUDENT },
          select: { role: true },
        });

        token.role = appUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.azureAdId = token.azureAdId as string | undefined;
        session.user.role = token.role as UserRole | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Type augmentation — extends the built-in NextAuth session and JWT types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      azureAdId?: string;
      role?: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    azureAdId?: string;
    role?: UserRole;
  }
}
