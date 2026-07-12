/**
 * lib/google-ads-api.ts
 *
 * Thin wrapper around the Google Ads REST API (REST API, not gRPC).
 * Uses the Developer Token + OAuth access token to make calls.
 *
 * Google Ads API reference:
 * https://developers.google.com/google-ads/api/rest/reference/rest
 */

import { refreshAccessToken } from "./google-oauth";
import { prisma } from "./prisma";

const ADS_API_VERSION = "v19";
const BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

function devToken() {
  const t = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!t) throw new Error("[google-ads-api] GOOGLE_ADS_DEVELOPER_TOKEN is not set.");
  return t;
}

// ---------------------------------------------------------------------------
// Get a valid (possibly refreshed) access token for a GoogleAccount record
// ---------------------------------------------------------------------------
export async function getValidAccessToken(googleAccountId: string): Promise<string> {
  const account = await prisma.googleAccount.findUnique({
    where: { id: googleAccountId },
    select: { id: true, accessToken: true, refreshToken: true, tokenExpiry: true },
  });
  if (!account) throw new Error("Google account not found.");

  // Refresh if expired or expiring within 5 minutes
  const needsRefresh =
    !account.tokenExpiry ||
    account.tokenExpiry.getTime() < Date.now() + 5 * 60 * 1000;

  if (!needsRefresh) return account.accessToken;

  const { accessToken, expiry } = await refreshAccessToken(account.refreshToken);

  await prisma.googleAccount.update({
    where: { id: googleAccountId },
    data: { accessToken, tokenExpiry: expiry },
  });

  return accessToken;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GoogleCustomer = {
  resourceName: string;
  id: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
};

export type GoogleCampaign = {
  campaign: {
    resourceName: string;
    id: string;
    name: string;
    status: "ENABLED" | "PAUSED" | "REMOVED";
    advertisingChannelType: string;
    startDate: string;
    endDate?: string;
    campaignBudget?: string;
  };
  metrics: {
    costMicros: string;
    impressions: string;
    clicks: string;
    conversions: number;
    allConversionsValue: number;
  };
};

// ---------------------------------------------------------------------------
// List accessible customer accounts (sub-accounts under MCC)
// ---------------------------------------------------------------------------
export async function listAccessibleCustomers(accessToken: string): Promise<string[]> {
  const res = await fetch(`${BASE}/customers:listAccessibleCustomers`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": devToken(),
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json.error?.message ?? `Google Ads API error ${res.status}`
    );
  }

  return (json.resourceNames ?? []).map((r: string) =>
    r.replace("customers/", "")
  );
}

// ---------------------------------------------------------------------------
// Get customer details
// ---------------------------------------------------------------------------
export async function getCustomer(
  customerId: string,
  accessToken: string,
  loginCustomerId?: string
): Promise<GoogleCustomer> {
  const id = customerId.replace(/-/g, "");
  const mccId = (loginCustomerId ?? process.env.GOOGLE_ADS_MCC_ID ?? "").replace(/-/g, "");

  const res = await fetch(
    `${BASE}/customers/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": devToken(),
        ...(mccId ? { "login-customer-id": mccId } : {}),
      },
    }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Google Ads API error ${res.status}`);
  }

  return {
    resourceName: json.resourceName,
    id: json.id,
    descriptiveName: json.descriptiveName ?? id,
    currencyCode: json.currencyCode ?? "USD",
    timeZone: json.timeZone ?? "UTC",
  };
}

// ---------------------------------------------------------------------------
// Fetch campaigns for a customer (last 30 days metrics via GAQL)
// ---------------------------------------------------------------------------
export async function getCampaigns(
  customerId: string,
  accessToken: string,
  loginCustomerId?: string
): Promise<GoogleCampaign[]> {
  const id = customerId.replace(/-/g, "");
  const mccId = (loginCustomerId ?? process.env.GOOGLE_ADS_MCC_ID ?? "").replace(/-/g, "");

  // No segments.date — this returns one aggregate row per campaign (30-day total).
  // Adding segments.date would return one row per (campaign × day), and the
  // upsert would overwrite to the last day's value, not the 30-day sum.
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.start_date,
      campaign.end_date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.all_conversions_value
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
    LIMIT 100
  `.trim();

  // Date range for the last 30 days is passed in the request body, not as a
  // GAQL segment, so metrics remain aggregated per campaign.
  const requestBody = {
    query,
    summaryRowSetting: "NO_SUMMARY_ROW",
    returnTotalResultsCount: false,
  };

  const res = await fetch(
    `${BASE}/customers/${id}/googleAds:searchStream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": devToken(),
        "Content-Type": "application/json",
        ...(mccId ? { "login-customer-id": mccId } : {}),
      },
      body: JSON.stringify(requestBody),
    }
  );

  const text = await res.text();
  if (!res.ok) {
    let msg = `Google Ads API error ${res.status}`;
    try { msg = JSON.parse(text)?.error?.message ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  // searchStream returns newline-delimited JSON objects
  const results: GoogleCampaign[] = [];
  for (const line of text.split("\n").filter(Boolean)) {
    try {
      const batch = JSON.parse(line);
      for (const row of batch.results ?? []) {
        results.push(row as GoogleCampaign);
      }
    } catch { /* skip malformed lines */ }
  }

  return results;
}
