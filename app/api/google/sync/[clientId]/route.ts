/**
 * POST /api/google/sync/[clientId]
 * Syncs Google Ads campaigns for a client.
 */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getValidAccessToken, getCampaigns } from "@/lib/google-ads-api";
import { prisma } from "@/lib/prisma";

function mapStatus(s: string): "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT" {
  switch (s) {
    case "ENABLED":  return "ACTIVE";
    case "PAUSED":   return "PAUSED";
    case "REMOVED":  return "COMPLETED";
    default:         return "PAUSED";
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { response } = await requireAuth();
  if (response) return response;

  const { clientId } = await params;

  const googleAccounts = await prisma.googleAccount.findMany({
    where: { clientId, status: "ACTIVE" },
  });

  if (googleAccounts.length === 0) {
    return NextResponse.json({ error: "No active Google accounts for this client." }, { status: 404 });
  }

  const mccId = process.env.GOOGLE_ADS_MCC_ID?.replace(/-/g, "");
  let synced = 0;

  for (const account of googleAccounts) {
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(account.id);
    } catch (err) {
      console.error(`[google/sync] Token refresh failed for account ${account.id}:`, err);
      await prisma.googleAccount.update({
        where: { id: account.id },
        data: { status: "EXPIRED" },
      });
      continue;
    }

    let campaigns;
    try {
      campaigns = await getCampaigns(account.customerId, accessToken, mccId);
    } catch (err) {
      console.error(`[google/sync] Campaign fetch failed for ${account.customerId}:`, err);
      continue;
    }

    for (const row of campaigns) {
      const c = row.campaign;
      const m = row.metrics;

      const spend = m.costMicros ? parseInt(m.costMicros, 10) / 1_000_000 : 0;
      const impressions = m.impressions ? parseInt(m.impressions, 10) : 0;
      const clicks = m.clicks ? parseInt(m.clicks, 10) : 0;
      const conversions = m.conversions ?? 0;
      const roas = spend > 0 && m.allConversionsValue > 0
        ? m.allConversionsValue / spend
        : null;

      await prisma.campaign.upsert({
        where: {
          clientId_platform_externalId: {
            clientId,
            platform: "GOOGLE",
            externalId: c.id,
          },
        },
        create: {
          clientId,
          externalId: c.id,
          name: c.name,
          platform: "GOOGLE",
          status: mapStatus(c.status),
          budget: null,
          spend,
          impressions,
          clicks,
          conversions,
          roas,
          startDate: c.startDate ? new Date(c.startDate) : null,
          endDate: c.endDate ? new Date(c.endDate) : null,
          syncedAt: new Date(),
        },
        update: {
          name: c.name,
          status: mapStatus(c.status),
          spend,
          impressions,
          clicks,
          conversions,
          roas,
          startDate: c.startDate ? new Date(c.startDate) : null,
          endDate: c.endDate ? new Date(c.endDate) : null,
          syncedAt: new Date(),
        },
      });

      synced++;
    }
  }

  return NextResponse.json({ synced });
}
