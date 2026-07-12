/**
 * GET /api/google/oauth/callback?code=...&state=...
 * Handles the OAuth callback from Google.
 * Exchanges the code for tokens and stores them in GoogleAccount.
 */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { exchangeCodeForTokens } from "@/lib/google-oauth";
import { getCustomer, listAccessibleCustomers } from "@/lib/google-ads-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/google?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/google?error=missing_params`);
  }

  let clientId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    clientId = decoded.clientId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/google?error=invalid_state`);
  }

  try {
    const { accessToken, refreshToken, expiry } = await exchangeCodeForTokens(code);

    // Get the list of accessible customer IDs and pick the first one
    const customerIds = await listAccessibleCustomers(accessToken);

    if (customerIds.length === 0) {
      return NextResponse.redirect(
        `${baseUrl}/clients/${clientId}?error=no_google_accounts`
      );
    }

    // Use the first account (or MCC if available)
    const mccId = process.env.GOOGLE_ADS_MCC_ID?.replace(/-/g, "");
    const primaryId = customerIds.find((id) => id === mccId) ?? customerIds[0];

    let customerName = primaryId;
    try {
      const customer = await getCustomer(primaryId, accessToken, mccId);
      customerName = customer.descriptiveName;
    } catch { /* name is optional */ }

    await prisma.googleAccount.upsert({
      where: {
        clientId_customerId: { clientId, customerId: primaryId },
      },
      create: {
        clientId,
        customerId: primaryId,
        customerName,
        accessToken,
        refreshToken,
        tokenExpiry: expiry,
        status: "ACTIVE",
      },
      update: {
        customerName,
        accessToken,
        refreshToken,
        tokenExpiry: expiry,
        status: "ACTIVE",
      },
    });

    return NextResponse.redirect(
      `${baseUrl}/clients/${clientId}?connected=google`
    );
  } catch (err) {
    console.error("[google/oauth/callback]", err);
    const msg = err instanceof Error ? err.message : "OAuth failed";
    return NextResponse.redirect(
      `${baseUrl}/google?error=${encodeURIComponent(msg)}`
    );
  }
}
