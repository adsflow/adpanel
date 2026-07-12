"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function PortalLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/portal/dashboard");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-primary rounded-xl shadow-lg shadow-primary/30 mb-4">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Scale<span className="text-primary">Ads</span>
            <span className="text-muted-foreground font-medium">Flow</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">Client Portal</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 inset-highlight">
          <h2 className="text-base font-bold text-foreground mb-0.5">Client Login</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Sign in to view your campaign performance
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-input border border-border rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" strokeWidth={2} />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-8">
          ScaleAdsFlow &copy; {new Date().getFullYear()} &mdash; Read-only client access
        </p>
      </div>
    </div>
  );
}
