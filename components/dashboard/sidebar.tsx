"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Paintbrush,
  Share2,
  Search,
  Settings,
  LogOut,
  Zap,
  Users,
  ChevronRight,
} from "lucide-react";

/* ─── Navigation structure ───────────────────────────────── */
const mainNav = [
  { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients",      href: "/clients",   icon: Users },
];

const platformNav = [
  { label: "Meta Ads",     href: "/meta",      icon: Share2 },
  { label: "Google Ads",   href: "/google",    icon: Search },
  { label: "Design Studio",href: "/studio",    icon: Paintbrush },
];

/* ─── NavItem ────────────────────────────────────────────── */
function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary/12 text-primary"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
      ].join(" ")}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
      )}
      <Icon
        className={[
          "w-4 h-4 shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
        ].join(" ")}
      />
      <span className="flex-1 truncate">{label}</span>
      {active && (
        <ChevronRight className="w-3.5 h-3.5 text-primary/60 shrink-0" />
      )}
    </Link>
  );
}

/* ─── Section label ─────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
      {children}
    </p>
  );
}

/* ─── Sidebar ────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  /* Derive initials from user name or email */
  const userName = session?.user?.name ?? session?.user?.email ?? "Agency";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <aside className="w-[232px] min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="px-5 py-[18px] border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group w-fit">
          <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-foreground">
            Scale<span className="text-primary">Ads</span>
            <span className="text-muted-foreground font-medium">Flow</span>
          </span>
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
        {/* Main */}
        <SectionLabel>Overview</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Platforms */}
        <SectionLabel>Platforms</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {platformNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
            />
          ))}
        </div>
      </nav>

      {/* ── Bottom: Settings + User ──────────────────────── */}
      <div className="border-t border-sidebar-border">
        {/* Settings link */}
        <div className="px-2.5 pt-2 pb-1">
          <Link
            href="/settings"
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
              isActive("/settings")
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            ].join(" ")}
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </Link>
        </div>

        {/* User card */}
        <div className="px-2.5 pb-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-sidebar-accent/60 border border-sidebar-border group">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-primary">{initials || "A"}</span>
            </div>

            {/* Name & email */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {userName.split("@")[0]}
              </p>
              {userEmail && (
                <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {userEmail}
                </p>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
