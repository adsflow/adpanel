import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Type augmentation — extend the built-in Session and JWT types so TypeScript
// knows about the `id` and `role` fields we add in the callbacks below.
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  // Extend the User type returned from `authorize`
  interface User {
    role?: string;
  }
}

declare module "next-auth" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

// ---------------------------------------------------------------------------
// Zod schema — validate the raw credentials object before hitting the DB.
// This prevents malformed inputs from ever reaching Prisma.
// ---------------------------------------------------------------------------
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ---------------------------------------------------------------------------
// NextAuth v5 configuration
// ---------------------------------------------------------------------------
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1. Validate shape of incoming credentials
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          // Returning null shows a generic "invalid credentials" error in the UI
          return null;
        }

        const { email, password } = parsed.data;

        // 2. Look up the user in the database
        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
            },
          });
        } catch (err) {
          // Database errors should not leak details to the client
          console.error("[auth] Database error during authorize:", err);
          return null;
        }

        // 3. No user found — use a constant-time check anyway to avoid
        //    user-enumeration via timing attacks (bcrypt.compare is slow).
        if (!user) {
          // Run a dummy compare so the response time is the same as a real user lookup
          await bcrypt.compare(password, "$2a$12$dummyhashtopreventtimingattacks00000000000000000000000");
          return null;
        }

        // 4. Compare the supplied password against the stored bcrypt hash
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return null;
        }

        // 5. Return the user object — only safe, non-sensitive fields
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Persist `id` and `role` into the JWT token on first sign-in
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "ADMIN";
      }
      return token;
    },

    // Expose `id` and `role` on the session object available in the app
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = (token.role ?? "ADMIN") as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    // Sessions expire after 8 hours — appropriate for an admin panel
    maxAge: 8 * 60 * 60,
  },
});
