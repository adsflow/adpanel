/**
 * lib/auth-guard.ts
 *
 * Reusable authentication guard for Next.js App Router API route handlers.
 *
 * Usage pattern:
 *
 *   export async function GET(req: Request) {
 *     const { session, response } = await requireAuth();
 *     if (response) return response;          // 401 — not authenticated
 *
 *     const userId = session.user.id;         // fully typed
 *     // ... rest of handler
 *   }
 *
 * For role-protected routes:
 *
 *   const { session, response } = await requireAuth("ADMIN");
 *   if (response) return response;            // 401 or 403
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Returned when auth succeeds — session is guaranteed non-null */
type AuthSuccess = {
  session: Session & { user: { id: string; role: string } };
  response: null;
};

/** Returned when auth fails — response is a ready-to-return NextResponse */
type AuthFailure = {
  session: null;
  response: NextResponse;
};

type AuthResult = AuthSuccess | AuthFailure;

// ---------------------------------------------------------------------------
// Core guard
// ---------------------------------------------------------------------------

/**
 * Validates the current request's session.
 *
 * @param requiredRole  Optional role string (e.g. "ADMIN"). When provided,
 *                      authenticated users who lack this role receive a 403.
 */
export async function requireAuth(requiredRole?: string): Promise<AuthResult> {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (err) {
    console.error("[auth-guard] auth() threw unexpectedly:", err);
    return {
      session: null,
      response: NextResponse.json(
        { error: "Authentication service unavailable." },
        { status: 503 }
      ),
    };
  }

  // Not authenticated
  if (!session || !session.user) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      ),
    };
  }

  // Role check
  if (requiredRole && (session.user as { role?: string }).role !== requiredRole) {
    return {
      session: null,
      response: NextResponse.json(
        { error: "Forbidden. Insufficient permissions." },
        { status: 403 }
      ),
    };
  }

  return {
    session: session as AuthSuccess["session"],
    response: null,
  };
}
