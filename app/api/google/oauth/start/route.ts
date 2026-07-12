/**
 * GET /api/google/oauth/start?clientId=xxx
 * Redirects to Google OAuth consent screen.
 * clientId is the DB client ID — stored in state so the callback knows
 * which client to link the account to.
 */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getAuthUrl } from "@/lib/google-oauth";

export async function GET(req: Request) {
  const { response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }

  // Encode clientId in state so the callback can retrieve it
  const state = Buffer.from(JSON.stringify({ clientId })).toString("base64url");

  try {
    const url = getAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start Google OAuth.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
