import {
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Share2,
  Search,
  AlertCircle,
  Plus,
} from "lucide-react";

/* ─── Metric card data ───────────────────────────────────── */
const stats = [
  {
    label: "Total Spend",
    value: "$0",
    change: "+0%",
    up: true,
    icon: DollarSign,
    sub: "vs. last month",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Avg. ROAS",
    value: "0.00×",
    change: "+0%",
    up: true,
    icon: TrendingUp,
    sub: "All platforms",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    label: "Total Clicks",
    value: "0",
    change: "+0%",
    up: true,
    icon: MousePointer,
    sub: "vs. last month",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Conversions",
    value: "0",
    change: "+0%",
    up: true,
    icon: Target,
    sub: "vs. last month",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

/* ─── Platform data ──────────────────────────────────────── */
const platforms = [
  {
    name: "Meta Ads",
    description: "Facebook & Instagram campaigns",
    icon: Share2,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    href: "/meta",
    status: "Not connected",
    spend: "$0",
    roas: "—",
    campaigns: 0,
    connected: false,
  },
  {
    name: "Google Ads",
    description: "Search, Display & Shopping",
    icon: Search,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    href: "/google",
    status: "Not connected",
    spend: "$0",
    roas: "—",
    campaigns: 0,
    connected: false,
  },
];

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({
  label,
  value,
  change,
  up,
  icon: Icon,
  sub,
  color,
  bgColor,
}: (typeof stats)[number]) {
  return (
    <div className="relative bg-card border border-border rounded-xl p-5 inset-highlight overflow-hidden group hover:border-border/80 transition-all duration-200">
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
        </div>
      </div>

      {/* Value */}
      <div className="text-[28px] font-bold tracking-tight text-foreground leading-none mb-3">
        {value}
      </div>

      {/* Change badge + sub label */}
      <div className="flex items-center gap-2">
        <span
          className={[
            "inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded",
            up
              ? "bg-emerald-500/12 text-emerald-400"
              : "bg-red-500/12 text-red-400",
          ].join(" ")}
        >
          {up ? (
            <ArrowUpRight className="w-3 h-3" strokeWidth={2.5} />
          ) : (
            <ArrowDownRight className="w-3 h-3" strokeWidth={2.5} />
          )}
          {change}
        </span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

/* ─── Platform Row ──────────────────────────────────────── */
function PlatformRow({
  name,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  status,
  spend,
  roas,
  campaigns,
  connected,
  href,
}: (typeof platforms)[number]) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors duration-150 group">
      {/* Icon */}
      <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.8} />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>

      {/* Status pill */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span
          className={[
            "status-dot",
            connected ? "bg-emerald-400" : "bg-muted-foreground/40",
          ].join(" ")}
        />
        <span className="text-xs text-muted-foreground">{status}</span>
      </div>

      {/* Metrics */}
      <div className="hidden md:flex items-center gap-8">
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Spend</div>
          <div className="text-sm font-semibold text-foreground">{spend}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">ROAS</div>
          <div className="text-sm font-semibold text-foreground">{roas}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Campaigns</div>
          <div className="text-sm font-semibold text-foreground">{campaigns}</div>
        </div>
      </div>

      {/* Action */}
      {connected ? (
        <a
          href={href}
          className="shrink-0 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2.5 py-1.5 rounded-md hover:bg-primary/10"
        >
          View
        </a>
      ) : (
        <button className="shrink-0 flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-150">
          <Plus className="w-3 h-3" strokeWidth={2.5} />
          Connect
        </button>
      )}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div className="min-h-full">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Campaign performance overview across all platforms
            </p>
          </div>

          {/* Date range pill — static for now */}
          <div className="hidden sm:flex items-center gap-2 bg-secondary border border-border rounded-lg px-3.5 py-2 text-xs font-medium text-muted-foreground">
            <span className="status-dot bg-primary animate-pulse" />
            This Month
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* ── KPI Strip ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* ── Platforms ───────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Connected Platforms</h2>
            <span className="text-xs text-muted-foreground">
              {platforms.filter((p) => p.connected).length} of {platforms.length} active
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
            {platforms.map((p) => (
              <PlatformRow key={p.name} {...p} />
            ))}
          </div>
        </div>

        {/* ── Empty state / Getting started ───────────────── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          </div>

          {/* Empty body */}
          <div className="py-14 px-6 flex flex-col items-center text-center">
            <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-primary" strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">
              No campaigns running yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
              Connect your Meta or Google Ads account and launch your first
              campaign to see performance data here.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 shadow-sm shadow-primary/20">
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                Connect Platform
              </button>
              <a
                href="/clients"
                className="flex items-center gap-1.5 bg-secondary hover:bg-accent text-foreground text-xs font-semibold px-4 py-2 rounded-md border border-border transition-all duration-150"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                Add Client
              </a>
            </div>
          </div>
        </div>

        {/* ── Notice bar ──────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3.5">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" strokeWidth={1.8} />
          <div>
            <p className="text-xs font-semibold text-amber-300 mb-0.5">
              Platform connections required
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Link your Meta Business Manager and Google Ads accounts to unlock
              full campaign management, reporting, and budget controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
