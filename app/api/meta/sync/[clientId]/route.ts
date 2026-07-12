/**
 * POST /api/meta/sync/[clientId]
 * Syncs all Meta campaigns for a client's connected ad accounts.
 * Creates or updates Campaign records from the live API data.
 */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getCampaigns } from "@/lib/meta-api";
import { prisma } from "@/lib/prisma";

function mapStatus(metaStatus: string): "ACTIVE" | "PAUSED" | "COMPLETED" | "DRAFT" {
  switch (metaStatus) {
    case "ACTIVE":    return "ACTIVE";
    case "PAUSED":    return "PAUSED";
    case "ARCHIVED":  return "COMPLETED";
    case "DELETED":   return "COMPLETED";
    default:          return "PAUSED";
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { response } = await requireAuth();
  if (response) return response;

  const { clientId } = await params;

  const metaAccounts = await prisma.metaAccount.findMany({
    where: { clientId, status: "ACTIVE" },
  });

  if (metaAccounts.length === 0) {
    return NextResponse.json({ error: "No active Meta accounts for this client." }, { status: 404 });
  }

  let synced = 0;

  for (const metaAccount of metaAccounts) {
    let campaigns;
    try {
      campaigns = await getCampaigns(metaAccount.adAccountId);
    } catch (err) {
      console.error(`[meta/sync] Failed to fetch campaigns for ${metaAccount.adAccountId}:`, err);
      continue;
    }

    for (const c of campaigns) {
      const insights = c.insights?.data?.[0];
      const spend = insights?.spend ? parseFloat(insights.spend) : 0;
      const impressions = insights?.impressions ? parseInt(insights.impressions, 10) : 0;
      const clicks = insights?.clicks ? parseInt(insights.clicks, 10) : 0;

      // Extract purchase conversion count
      const conversionAction = insights?.actions?.find(
        (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
      );
      const conversions = conversionAction ? parseInt(conversionAction.value, 10) : 0;

      // Extract ROAS
      const roasEntry = insights?.purchase_roas?.[0];
      const roas = roasEntry ? parseFloat(roasEntry.value) : null;

      // Daily budget in dollars (Meta stores in cents for some currencies)
      const budget = c.daily_budget ? parseFloat(c.daily_budget) / 100 : null;

      await prisma.campaign.upsert({
        where: {
          clientId_platform_externalId: {
            clientId,
            platform: "META",
            externalId: c.id,
          },
        },
        create: {
          clientId,
          externalId: c.id,
          name: c.name,
          platform: "META",
          status: mapStatus(c.status),
          budget,
          spend,
          impressions,
          clicks,
          conversions,
          roas,
          startDate: c.start_time ? new Date(c.start_time) : null,
          endDate: c.stop_time ? new Date(c.stop_time) : null,
          syncedAt: new Date(),
        },
        update: {
          name: c.name,
          status: mapStatus(c.status),
          budget,
          spend,
          impressions,
          clicks,
          conversions,
          roas,
          startDate: c.start_time ? new Date(c.start_time) : null,
          endDate: c.stop_time ? new Date(c.stop_time) : null,
          syncedAt: new Date(),
        },
      });

      synced++;
    }
  }

  return NextResponse.json({ synced });
}
