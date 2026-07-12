"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  Share2,
  ArrowUpRight,
  Users,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const stats = [
  { label: "Spend", icon: DollarSign, color: "text-violet-400", bgColor: "bg-violet-500/10" },
  { label: "ROAS", icon: TrendingUp, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
  { label: "Clicks", icon: MousePointer, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  { label: "Conversions", icon: Target, color: "text-amber-400", bgColor: "bg-amber-500/10" },
  { label: "Reach", icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  { label: "Impressions", icon: Eye, color: "text-pink-400", bgColor: "bg-pink-500/10" },
];

const quickActions = [
  { label: "Awareness", desc: "Maximize brand reach & video views", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Traffic", desc: "Drive visitors to your website or app", icon: MousePointer, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Conversions", desc: "Purchases, leads, and app installs", icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Retargeting", desc: "Re-engage website visitors & warm audiences", icon: ArrowUpRight, color: "text-amber-400", bg: "bg-amber-500/10" },
];

type MetaAdAccount = { id: string; name: string; account_status: number };
type Client = { id: string; name: string };

export default function MetaAdsPage() {
  /* ── Connect modal state ───────────────────────── */
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [success, setSuccess] = useState("");

  function openModal() {
    setShowModal(true);
    setModalError("");
    setSuccess("");
    setSelectedClient("");
    setSelectedAccount("");

    // Load clients
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]));

    // Load Meta ad accounts
    setLoadingAccounts(true);
    fetch("/api/meta/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAdAccounts(Array.isArray(data) ? data : []);
        setLoadingAccounts(false);
      })
      .catch(() => {
        setModalError("Failed to load Meta ad accounts. Check META_SYSTEM_USER_TOKEN.");
        setLoadingAccounts(false);
      });
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient || !selectedAccount) return;
    setConnecting(true);
    setModalError("");

    const res = await fetch("/api/meta/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: selectedClient, adAccountId: selectedAccount }),
    });

    const data = await res.json();
    setConnecting(false);

    if (!res.ok) {
      setModalError(data?.error ?? "Failed to connect.");
      return;
    }

    setSuccess("Meta account connected! You can now sync campaigns from the client detail page.");
    setTimeout(() => setShowModal(false), 2500);
  }

  return (
    <div className="min-h-full">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/12 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Share2 className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Meta Ads</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Facebook &amp; Instagram campaigns</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New Campaign
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* ── Connect Banner ───────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-blue-500/6 to-transparent border border-blue-500/20 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="status-dot bg-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Not connected</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Connect your Meta Ads account</h3>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Link a client&apos;s Business Manager to manage campaigns and pull live performance data.
            </p>
          </div>
          <button
            onClick={openModal}
            className="relative shrink-0 flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150"
          >
            <Share2 className="w-3.5 h-3.5" />
            Connect Meta
          </button>
        </div>

        {/* ── KPI Strip ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {stats.map(({ label, icon: Icon, color, bgColor }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 inset-highlight">
              <div className={`w-7 h-7 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.8} />
              </div>
              <div className="text-[22px] font-bold text-foreground leading-none mb-1">—</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Campaign objective cards ─────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Campaign Objectives</h2>
            <span className="text-xs text-muted-foreground">Choose a goal to get started</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {quickActions.map(({ label, desc, icon: Icon, color, bg }) => (
              <button key={label} className="group text-left bg-card border border-border hover:border-primary/40 rounded-xl p-4 transition-all duration-150 hover:bg-accent inset-highlight">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-150`}>
                  <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
                </div>
                <div className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Campaigns Table ──────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Campaigns</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">0 campaigns</span>
              <button onClick={openModal} className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-150">
                <Plus className="w-3 h-3" strokeWidth={2.5} />New
              </button>
            </div>
          </div>
          <div className="py-14 px-6 flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
              Connect a Meta account then sync campaigns from the client detail page.
            </p>
            <button onClick={openModal} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20">
              <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
              Connect Meta Account
            </button>
          </div>
        </div>

        {/* Quick link to clients */}
        <div className="text-center">
          <Link href="/clients" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3 h-3" strokeWidth={2} />
            Sync campaigns from the Clients page after connecting
          </Link>
        </div>
      </div>

      {/* ── Connect Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl inset-highlight">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-500/12 rounded-lg flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-400" strokeWidth={1.8} />
                </div>
                <h2 className="text-sm font-bold text-foreground">Connect Meta Ads</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {success ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
                <p className="text-xs text-emerald-400">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleConnect} className="space-y-4">
                {modalError && (
                  <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-xs text-destructive">{modalError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    className="bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Ad Account</label>
                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 py-2.5 text-xs text-muted-foreground">
                      <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      Loading accounts...
                    </div>
                  ) : (
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      required
                      className="bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select ad account</option>
                      {adAccounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={connecting || loadingAccounts || !selectedClient || !selectedAccount}
                    className="flex-1 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connecting...</>
                    ) : "Connect Account"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-secondary hover:bg-accent border border-border rounded-lg text-sm font-medium transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
