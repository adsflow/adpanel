"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Share2,
  Search,
  AlertCircle,
  ArrowUpRight,
  Building2,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string | null;
  industry: string | null;
  status: string;
  metaAccounts: { id: string; status: string }[];
  googleAccounts: { id: string; status: string }[];
  campaigns: { id: string; status: string; platform: string }[];
};

/* ─── Skeleton row ──────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary rounded-lg animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-28 bg-secondary rounded animate-pulse" />
            <div className="h-2.5 w-36 bg-secondary/60 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell">
        <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-secondary rounded animate-pulse" />
          <div className="h-5 w-14 bg-secondary rounded animate-pulse" />
        </div>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell">
        <div className="h-3 w-6 bg-secondary rounded animate-pulse" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-5 w-14 bg-secondary rounded-full animate-pulse" />
      </td>
      <td className="px-5 py-3.5">
        <div className="h-3 w-8 bg-secondary rounded animate-pulse" />
      </td>
    </tr>
  );
}

/* ─── Platform badge ─────────────────────────────────────── */
function PlatformBadge({
  active,
  icon: Icon,
  label,
  activeClass,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  activeClass: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded",
        active ? activeClass : "bg-secondary text-muted-foreground/60",
      ].join(" ")}
    >
      <Icon className="w-2.5 h-2.5" strokeWidth={2} />
      {label}
    </span>
  );
}

/* ─── Status badge ───────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full",
        isActive
          ? "bg-emerald-500/12 text-emerald-400"
          : "bg-secondary text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "status-dot",
          isActive ? "bg-emerald-400" : "bg-muted-foreground/40",
        ].join(" ")}
      />
      {isActive ? "Active" : status}
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`API error ${r.status}: ${text.slice(0, 200)}`);
        }
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response format from /api/clients");
        }
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load clients:", err);
        setError(err.message ?? "Failed to load clients");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-full">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Clients
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading
                ? "Loading..."
                : `${clients.length} client${clients.length !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <Link
            href="/clients/new"
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Add Client
          </Link>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* ── Error state ─────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-destructive/8 border border-destructive/25 rounded-xl px-4 py-3.5 mb-6">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" strokeWidth={1.8} />
            <div>
              <p className="text-xs font-semibold text-destructive mb-0.5">
                Failed to load clients
              </p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────── */}
        {!loading && !error && clients.length === 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
            <div className="py-16 px-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" strokeWidth={1.8} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">
                No clients yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
                Add your first client to start managing their Meta and Google Ads
                campaigns from one place.
              </p>
              <Link
                href="/clients/new"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                Add First Client
              </Link>
            </div>
          </div>
        )}

        {/* ── Clients table ───────────────────────────────── */}
        {(loading || clients.length > 0) && (
          <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Client
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                      Industry
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Platforms
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                      Campaigns
                    </th>
                    <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-5 py-3 w-10" />
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : (
                    clients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors duration-100 group"
                      >
                        {/* Client name + email */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                              {client.name[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                                {client.name}
                              </div>
                              {client.email && (
                                <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                                  {client.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Industry */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          {client.industry ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {client.industry}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Platform badges */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <PlatformBadge
                              active={client.metaAccounts.length > 0}
                              icon={Share2}
                              label="Meta"
                              activeClass="bg-blue-500/15 text-blue-400"
                            />
                            <PlatformBadge
                              active={client.googleAccounts.length > 0}
                              icon={Search}
                              label="Google"
                              activeClass="bg-red-500/15 text-red-400"
                            />
                          </div>
                        </td>

                        {/* Campaign count */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm font-medium text-foreground">
                            {client.campaigns.length}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={client.status} />
                        </td>

                        {/* View link */}
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/clients/${client.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-150"
                          >
                            View
                            <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {!loading && clients.length > 0 && (
              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Showing {clients.length} of {clients.length} clients
                </span>
                <Link
                  href="/clients/new"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                  Add client
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
