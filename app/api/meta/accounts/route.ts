/**
 * GET  /api/meta/accounts
 * Lists all Meta ad accounts accessible via the system user token.
 * Used to populate the "Connect Meta" dropdown.
 */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { listAdAccounts } from "@/lib/meta-api";

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const accounts = await listAdAccounts();
    return NextResponse.json(accounts);
  } catch (err) {
    console.error("[GET /api/meta/accounts]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch Meta ad accounts.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
