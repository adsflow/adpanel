import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";
import { prisma } from "@/lib/prisma";
import {
  Zap,
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  Share2,
  Search,
  LogOut,
  BarChart2,
} from "lucide-react";

export default async function PortalDashboardPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const client = await prisma.client.findUnique({
    where: { id: session.sub },
    include: {
      campaigns: {
        select: {
          id: true,
          name: true,
          platform: true,
          status: true,
          spend: true,
          clicks: true,
          conversions: true,
          roas: true,
          impressions: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) redirect("/portal/login");

  const totalSpend = client.campaigns.reduce((s, c) => s + (c.spend ?? 0), 0);
  const totalClicks = client.campaigns.reduce((s, c) => s + (c.clicks ?? 0), 0);
  const totalConversions = client.campaigns.reduce((s, c) => s + (c.conversions ?? 0), 0);
  const avgRoas =
    client.campaigns.filter((c) => c.roas).length > 0
      ? client.campaigns.reduce((s, c) => s + (c.roas ?? 0), 0) /
        client.campaigns.filter((c) => c.roas).length
      : null;

  const kpis = [
    { label: "Total Spend", value: `$${totalSpend.toFixed(2)}`, icon: DollarSign, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Avg. ROAS", value: avgRoas ? `${avgRoas.toFixed(2)}×` : "—", icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointer, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center shadow-sm shadow-primary/30">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-foreground">
            Scale<span className="text-primary">Ads</span>
            <span className="text-muted-foreground font-medium">Flow</span>
          </span>
          <span className="text-muted-foreground/40 font-light mx-1">|</span>
          <span className="text-sm text-muted-foreground">Client Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-foreground">{client.name}</p>
            <p className="text-[10px] text-muted-foreground">{client.portalEmail}</p>
          </div>
          <form action="/api/portal/signout" method="post">
            <button
              type="submit"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </header>

      <main className="px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome back, {client.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here's your campaign performance overview
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 inset-highlight">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {label}
                </span>
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.8} />
                </div>
              </div>
              <div className="text-[26px] font-bold text-foreground leading-none">{value}</div>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <div className="bg-card border border-border rounded-xl overflow-hidden inset-highlight">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Active Campaigns</h2>
          </div>

          {client.campaigns.length === 0 ? (
            <div className="py-14 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No campaigns yet</p>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Your agency will add campaigns here once they're launched.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {["Campaign", "Platform", "Status", "Spend", "Clicks", "ROAS"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {client.campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground truncate max-w-[180px]">{c.name}</td>
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
                      <td className="px-5 py-3.5 text-sm text-foreground">{c.roas ? `${c.roas.toFixed(2)}×` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground/40 text-center pb-4">
          This is a read-only view. Contact your agency for changes.
        </p>
      </main>
    </div>
  );
}
