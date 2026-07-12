/**
 * lib/meta-api.ts
 *
 * Thin wrapper around the Meta Marketing API.
 * Uses the system-user access token stored in META_SYSTEM_USER_TOKEN.
 * All calls go through the /v20.0 graph endpoint.
 */

const BASE = "https://graph.facebook.com/v20.0";
const SYSTEM_TOKEN = () => {
  const t = process.env.META_SYSTEM_USER_TOKEN;
  if (!t) throw new Error("[meta-api] META_SYSTEM_USER_TOKEN is not set.");
  return t;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MetaAdAccount = {
  id: string;             // "act_1234567890"
  name: string;
  account_status: number; // 1 = ACTIVE
  currency: string;
  timezone_name: string;
};

export type MetaCampaign = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED" | "DELETED";
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  insights?: {
    data: {
      spend: string;
      impressions: string;
      clicks: string;
      actions?: { action_type: string; value: string }[];
      purchase_roas?: { action_type: string; value: string }[];
    }[];
  };
};

// ---------------------------------------------------------------------------
// List all ad accounts accessible to the system user
// ---------------------------------------------------------------------------
export async function listAdAccounts(): Promise<MetaAdAccount[]> {
  const token = SYSTEM_TOKEN();
  const fields = "id,name,account_status,currency,timezone_name";
  const url = `${BASE}/me/adaccounts?fields=${fields}&limit=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Meta API error ${res.status}`);
  }

  return (json.data ?? []) as MetaAdAccount[];
}

// ---------------------------------------------------------------------------
// Verify a single ad account exists and the token has access
// ---------------------------------------------------------------------------
export async function getAdAccount(adAccountId: string): Promise<MetaAdAccount> {
  const token = SYSTEM_TOKEN();
  // Normalize: ensure it starts with "act_"
  const id = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
  const fields = "id,name,account_status,currency,timezone_name";
  const url = `${BASE}/${id}?fields=${fields}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message ?? `Meta API error ${res.status}`
    );
  }

  return json as MetaAdAccount;
}

// ---------------------------------------------------------------------------
// Fetch campaigns for an ad account (with last-30-day insights)
// ---------------------------------------------------------------------------
export async function getCampaigns(adAccountId: string): Promise<MetaCampaign[]> {
  const token = SYSTEM_TOKEN();
  const id = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

  const insightsFields = "spend,impressions,clicks,actions,purchase_roas";
  const campaignFields = `id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights.date_preset(last_30d){${insightsFields}}`;

  const url = `${BASE}/${id}/campaigns?fields=${campaignFields}&limit=100`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  });
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message ?? `Meta API error ${res.status}`
    );
  }

  return (json.data ?? []) as MetaCampaign[];
}
