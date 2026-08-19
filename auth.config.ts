/**
 * Lightweight auth config — no Prisma, no Node.js-only modules.
 * Safe to import in middleware (Edge Runtime).
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        (session.user as { role?: string }).role = (token.role ?? "ADMIN") as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
} satisfies NextAuthConfig;
