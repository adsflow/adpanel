"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  Search,
  Eye,
  ShoppingBag,
  Zap,
  BarChart2,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const stats = [
  { label: "Spend", icon: DollarSign, color: "text-violet-400", bgColor: "bg-violet-500/10" },
  { label: "ROAS", icon: TrendingUp, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
  { label: "Clicks", icon: MousePointer, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  { label: "Conversions", icon: Target, color: "text-amber-400", bgColor: "bg-amber-500/10" },
];

const campaignTypes = [
  { type: "Search", desc: "Text ads in Google search results", icon: Search, color: "text-blue-400", bg: "bg-blue-500/10", badge: "Most Popular", badgeColor: "bg-blue-500/15 text-blue-400" },
  { type: "Performance Max", desc: "AI-driven ads across all Google channels", icon: Zap, color: "text-violet-400", bg: "bg-violet-500/10", badge: "Recommended", badgeColor: "bg-violet-500/15 text-violet-400" },
  { type: "Display", desc: "Visual banners on the Display Network", icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", badge: null, badgeColor: "" },
  { type: "Shopping", desc: "Product listings for e-commerce stores", icon: ShoppingBag, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: null, badgeColor: "" },
];

type Client = { id: string; name: string };

export default function GoogleAdsPage() {
  return (
    <Suspense>
      <GoogleAdsContent />
    </Suspense>
  );
}

function GoogleAdsContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [notice, setNotice] = useState(urlError ? `OAuth error: ${urlError}` : "");
  const [noticeType, setNoticeType] = useState<"error" | "success">(urlError ? "error" : "success");

  useEffect(() => {
    const connected = searchParams.get("connected");
    if (connected === "google") {
      setNotice("Google Ads account connected successfully!");
      setNoticeType("success");
    }
  }, [searchParams]);

  function openModal() {
    setShowModal(true);
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]));
  }

  function handleOAuthStart() {
    if (!selectedClient) return;
    window.location.href = `/api/google/oauth/start?clientId=${selectedClient}`;
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/12 rounded-xl flex items-center justify-center border border-red-500/20">
              <Search className="w-5 h-5 text-red-400" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Google Ads</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Search, Display, Shopping &amp; Performance Max</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New Campaign
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Notice */}
        {notice && (
          <div className={[
            "flex items-start gap-3 rounded-xl px-4 py-3.5",
            noticeType === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-destructive/8 border border-destructive/25",
          ].join(" ")}>
            {noticeType === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" strokeWidth={1.8} />
            )}
            <p className={["text-xs", noticeType === "success" ? "text-emerald-400" : "text-destructive"].join(" ")}>
              {notice}
            </p>
          </div>
        )}

        {/* Connect Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500/10 via-red-500/6 to-transparent border border-red-500/20 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="status-dot bg-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Not connected</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Connect your Google Ads account</h3>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              Authorize with Google to link a client account and pull live campaign data.
            </p>
          </div>
          <button
            onClick={openModal}
            className="relative shrink-0 flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150"
          >
            <Search className="w-3.5 h-3.5" />
            Connect Google
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(({ label, icon: Icon, color, bgColor }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 inset-highlight">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
                <div className={`w-7 h-7 ${bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.8} />
                </div>
              </div>
              <div className="text-[26px] font-bold text-foreground leading-none">—</div>
            </div>
          ))}
        </div>

        {/* Campaign Types */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Campaign Types</h2>
            <span className="text-xs text-muted-foreground">Select a type to begin</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {campaignTypes.map(({ type, desc, icon: Icon, color, bg, badge, badgeColor }) => (
              <button key={type} className="group relative text-left bg-card border border-border hover:border-primary/40 rounded-xl p-4 transition-all duration-150 hover:bg-accent inset-highlight">
                {badge && (
                  <span className={`absolute top-3 right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded ${badgeColor}`}>{badge}</span>
                )}
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-150`}>
                  <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
                </div>
                <div className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors pr-16">{type}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns Table */}
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
            <div className="w-11 h-11 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5 text-red-400" strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
              Connect a Google Ads account then sync campaigns from the client detail page.
            </p>
            <button onClick={openModal} className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20">
              <Search className="w-3.5 h-3.5" strokeWidth={2} />
              Connect Google Account
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/clients" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3 h-3" strokeWidth={2} />
            Sync campaigns from the Clients page after connecting
          </Link>
        </div>
      </div>

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl inset-highlight">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-500/12 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-red-400" strokeWidth={1.8} />
                </div>
                <h2 className="text-sm font-bold text-foreground">Connect Google Ads</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Select which client to link, then you&apos;ll be redirected to Google to authorize access.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Make sure <code className="text-amber-300">http://localhost:3000/api/google/oauth/callback</code> is added to your Google Cloud OAuth redirect URIs.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleOAuthStart}
                  disabled={!selectedClient}
                  className="flex-1 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all"
                >
                  Authorize with Google
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-secondary hover:bg-accent border border-border rounded-lg text-sm font-medium transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
