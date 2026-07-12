import { Settings, User, Bell, Shield, Palette } from "lucide-react";

const sections = [
  {
    id: "account",
    label: "Account",
    icon: User,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    description: "Manage your agency account details and credentials",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    description: "Control how and when you receive alerts",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    description: "Password, 2FA, and active sessions",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "Theme, density, and display preferences",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center border border-border">
            <Settings className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-3 max-w-2xl">
        {sections.map(({ id, label, icon: Icon, color, bg, description }) => (
          <button
            key={id}
            className="w-full group flex items-center gap-4 bg-card border border-border hover:border-border/80 rounded-xl p-5 transition-all duration-150 hover:bg-accent text-left inset-highlight"
          >
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            </div>
            <svg
              className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        <p className="text-[11px] text-muted-foreground/40 pt-2 text-center">
          ScaleAdsFlow v0.1.0 — Settings coming soon
        </p>
      </div>
    </div>
  );
}
