import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { createClientSchema, parseBody } from "@/lib/validations";

// ---------------------------------------------------------------------------
// GET /api/clients
// Returns all clients with their associated account/campaign counts.
// Requires: authenticated session (any role).
// ---------------------------------------------------------------------------
export async function GET() {
  // Auth guard — returns 401 if no valid session
  const { session, response } = await requireAuth();
  if (response) return response;

  // session is guaranteed non-null here
  void session;

  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        metaAccounts: { select: { id: true, status: true } },
        googleAccounts: { select: { id: true, status: true } },
        campaigns: { select: { id: true, status: true, platform: true } },
      },
    });

    return NextResponse.json(clients);
  } catch (err) {
    console.error("[GET /api/clients]", err);
    return NextResponse.json(
      { error: "Failed to fetch clients. Please try again." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/clients
// Creates a new client. portalPassword is stored as a bcrypt hash.
// Requires: authenticated session (any role).
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  // 1. Auth check
  const { session, response } = await requireAuth();
  if (response) return response;

  // 2. Parse + validate request body with Zod
  const { data, error } = await parseBody(req, createClientSchema);
  if (error) {
    return NextResponse.json(error, { status: 422 });
  }

  const {
    name,
    email,
    phone,
    industry,
    website,
    portalEmail,
    portalPassword,
  } = data;

  try {
    // 3. Hash the client portal password before storing — never store plaintext
    //    Cost factor 12 is a good balance between security and latency (~250ms on
    //    a modern CPU). Increase to 13–14 if running on beefier hardware.
    const hashedPortalPassword = await bcrypt.hash(portalPassword, 12);

    // 4. Resolve the authenticated user's DB id from session
    const userId: string = session.user.id;

    // 5. Create the client record
    const client = await prisma.client.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        industry: industry ?? null,
        website: website ?? null,
        portalEmail,
        portalPassword: hashedPortalPassword,
        userId,
      },
    });

    // 6. Return the created record — strip the hashed password from the response
    const { portalPassword: _omit, ...safeClient } = client as typeof client & {
      portalPassword?: string;
    };
    void _omit;

    return NextResponse.json(safeClient, { status: 201 });
  } catch (err) {
    console.error("[POST /api/clients]", err);

    const message = err instanceof Error ? err.message : String(err);

    // Surface a user-friendly message for unique-constraint violations
    const isUniqueViolation =
      message.includes("Unique constraint") ||
      message.includes("Duplicate entry") ||
      message.includes("unique_violation");

    if (isUniqueViolation) {
      return NextResponse.json(
        { error: "A client with this portal email already exists." },
        { status: 409 }
      );
    }

    // Foreign-key failure means the session user doesn't exist in the DB yet.
    // This should never happen if the seed script has been run, but we surface a
    // clear error rather than a generic 500 to make debugging straightforward.
    const isFkViolation =
      message.includes("Foreign key constraint") ||
      message.includes("foreign key constraint") ||
      message.includes("ER_NO_REFERENCED_ROW");

    if (isFkViolation) {
      return NextResponse.json(
        {
          error:
            "Your user account does not exist in the database. Run `npm run db:seed` to create it.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create client. Please try again." },
      { status: 500 }
    );
  }
}
