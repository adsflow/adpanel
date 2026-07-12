/**
 * POST /api/meta/connect
 * Links a Meta ad account to a client.
 * Body: { clientId, adAccountId }
 */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getAdAccount } from "@/lib/meta-api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  clientId: z.string().min(1),
  adAccountId: z.string().min(1),
});

export async function POST(req: Request) {
  const { response } = await requireAuth();
  if (response) return response;

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "clientId and adAccountId are required." }, { status: 422 });
  }

  const { clientId, adAccountId } = parsed.data;
  const normalizedId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

  try {
    // Verify the ad account exists and the token has access
    const account = await getAdAccount(normalizedId);

    // Upsert so reconnecting updates the record rather than throwing a duplicate key
    const metaAccount = await prisma.metaAccount.upsert({
      where: {
        clientId_adAccountId: { clientId, adAccountId: normalizedId },
      },
      create: {
        clientId,
        adAccountId: normalizedId,
        adAccountName: account.name,
        accessToken: process.env.META_SYSTEM_USER_TOKEN ?? "",
        status: "ACTIVE",
      },
      update: {
        adAccountName: account.name,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(metaAccount, { status: 201 });
  } catch (err) {
    console.error("[POST /api/meta/connect]", err);
    const message = err instanceof Error ? err.message : "Failed to connect Meta account.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
