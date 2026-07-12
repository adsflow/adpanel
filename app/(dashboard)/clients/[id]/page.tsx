"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Share2,
  Search,
  BarChart2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  industry: string | null;
  website: string | null;
  portalEmail: string | null;
  status: string;
  createdAt: string;
  metaAccounts: { id: string; adAccountId: string; adAccountName: string | null; status: string }[];
  googleAccounts: { id: string; customerId: string; customerName: string | null; status: string }[];
  campaigns: { id: string; name: string; platform: string; status: string; spend: number | null; clicks: number | null; conversions: number | null }[];
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon className="w-3.5 h-3.5 text-muted-foreground/60 mt-0.5 shrink-0" strokeWidth={1.8} />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<"meta" | "google" | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data?.error ?? `Error ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load client");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full">
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <div className="h-4 w-20 bg-secondary rounded animate-pulse mb-4" />
          <div className="h-7 w-48 bg-secondary rounded animate-pulse" />
        </div>
        <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-full px-8 pt-8">
        <Link href="/clients" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
        <div className="flex items-start gap-3 bg-destructive/8 border border-destructive/25 rounded-xl px-4 py-3.5">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" strokeWidth={1.8} />
          <p className="text-sm text-destructive">{error ?? "Client not found."}</p>
        </div>
      </div>
    );
  }

  async function syncCampaigns(platform: "meta" | "google") {
    setSyncing(platform);
    setSyncResult(null);
    const res = await fetch(`/api/${platform}/sync/${id}`, { method: "POST" });
    const data = await res.json();
    setSyncing(null);
    if (res.ok) {
      setSyncResult(`Synced ${data.synced} ${platform === "meta" ? "Meta" : "Google"} campaigns.`);
      // Refresh client data to show new campaigns
      fetch(`/api/clients/${id}`).then((r) => r.json()).then(setClient).catch(() => {});
    } else {
      setSyncResult(`Sync failed: ${data?.error ?? "Unknown error"}`);
    }
  }

  const activeCampaigns = client.campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalSpend = client.campaigns.reduce((s, c) => s + (c.spend ?? 0), 0);
  const totalClicks = client.campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0);

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <Link href="/clients" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs mb-4 w-fit transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Clients
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-xl border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {client.name[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{client.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {client.industry && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" strokeWidth={1.8} />
                    {client.industry}
                  </span>
                )}
                <span className={[
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  client.status === "ACTIVE" ? "bg-emerald-500/12 text-emerald-400" : "bg-secondary text-muted-foreground",
                ].join(" ")}>
                  <span className={["status-dot", client.status === "ACTIVE" ? "bg-emerald-400" : "bg-muted-foreground/40"].join(" ")} />
                  {client.status}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/clients/${id}/edit`}
            className="text-xs font-semibold px-4 py-2 bg-secondary hover:bg-accent border border-border rounded-md transition-all duration-150"
          >
            Edit Client
          </Link>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Sync result */}
        {syncResult && (
          <div className={["flex items-center gap-3 rounded-xl px-4 py-3",
            syncResult.startsWith("Sync failed")
              ? "bg-destructive/8 border border-destructive/25"
              : "bg-emerald-500/10 border border-emerald-500/20",
          ].join(" ")}>
            {syncResult.startsWith("Sync failed")
              ? <AlertCircle className="w-4 h-4 text-destructive shrink-0" strokeWidth={1.8} />
              : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />}
            <p className={["text-xs font-medium", syncResult.startsWith("Sync failed") ? "text-destructive" : "text-emerald-400"].join(" ")}>
              {syncResult}
            </p>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Campaigns", value: activeCampaigns },
            { label: "Total Spend", value: `$${totalSpend.toFixed(2)}` },
            { label: "Total Clicks", value: totalClicks.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 inset-highlight">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{label}</div>
              <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact info */}
          <div className="bg-card border border-border rounded-xl p-5 inset-highlight">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Contact Info</h2>
            <InfoRow icon={Mail} label="Email" value={client.email} />
            <InfoRow icon={Phone} label="Phone" value={client.phone} />
            <InfoRow icon={Globe} label="Website" value={client.website} />
            <InfoRow icon={Mail} label="Portal Email" value={client.portalEmail} />
            {!client.email && !client.phone && !client.website && (
              <p className="text-xs text-muted-foreground/50 py-3">No contact info added</p>
            )}
          </div>

          {/* Connected platforms */}
          <div className="bg-card border border-border rounded-xl p-5 inset-highlight">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Platforms</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                <div className="w-7 h-7 bg-blue-500/10 rounded-md flex items-center justify-center shrink-0">
                  <Share2 className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">Meta Ads</div>
                  <div className="text-[10px] text-muted-foreground">
                    {client.metaAccounts.length > 0 ? `${client.metaAccounts.length} account(s)` : "Not connected"}
                  </div>
                </div>
                {client.metaAccounts.length > 0 && (
                  <button
                    onClick={() => syncCampaigns("meta")}
                    disabled={syncing === "meta"}
                    title="Sync Meta campaigns"
                    className="p-1.5 rounded text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={["w-3 h-3", syncing === "meta" ? "animate-spin" : ""].join(" ")} strokeWidth={2} />
                  </button>
                )}
                <span className={["status-dot shrink-0", client.metaAccounts.length > 0 ? "bg-emerald-400" : "bg-muted-foreground/30"].join(" ")} />
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                <div className="w-7 h-7 bg-red-500/10 rounded-md flex items-center justify-center shrink-0">
                  <Search className="w-3.5 h-3.5 text-red-400" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">Google Ads</div>
                  <div className="text-[10px] text-muted-foreground">
                    {client.googleAccounts.length > 0 ? `${client.googleAccounts.length} account(s)` : "Not connected"}
                  </div>
                </div>
                {client.googleAccounts.length > 0 && (
                  <button
                    onClick={() => syncCampaigns("google")}
                    disabled={syncing === "google"}
                    title="Sync Google campaigns"
                    className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={["w-3 h-3", syncing === "google" ? "animate-spin" : ""].join(" ")} strokeWidth={2} />
                  </button>
                )}
                <span className={["status-dot shrink-0", client.googleAccounts.length > 0 ? "bg-emerald-400" : "bg-muted-foreground/30"].join(" ")} />
              </div>
            </div>
          </div>

          {/* Portal access */}
          <div className="bg-card border border-border rounded-xl p-5 inset-highlight">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Client Portal</h2>
            {client.portalEmail ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Portal Login</div>
                  <div className="text-sm text-foreground font-medium">{client.portalEmail}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="status-dot bg-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Portal active</span>
                </div>
                <a
                  href="/portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  Open portal
                </a>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/50">No portal access configured</p>
            )}
          </div>
        </div>

        {/* Campaigns table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Campaigns
              {client.campaigns.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({client.campaigns.length})
                </span>
              )}
            </h2>
          </div>

          {client.campaigns.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No campaigns yet</p>
              <p className="text-xs text-muted-foreground">Connect a platform to sync campaigns</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {["Campaign", "Platform", "Status", "Spend", "Clicks"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {client.campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground truncate max-w-[200px]">{c.name}</td>
                      <td className="px-5 py-3.5">
                        <span className={[
                          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded",
                          c.platform === "META" ? "bg-blue-500/15 text-blue-400" : "bg-red-500/15 text-red-400",
                        ].join(" ")}>
                          {c.platform === "META" ? <Share2 className="w-2.5 h-2.5" strokeWidth={2} /> : <Search className="w-2.5 h-2.5" strokeWidth={2} />}
                          {c.platform === "META" ? "Meta" : "Google"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={[
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          c.status === "ACTIVE" ? "bg-emerald-500/12 text-emerald-400" : "bg-secondary text-muted-foreground",
                        ].join(" ")}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground">${(c.spend ?? 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{(c.clicks ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
