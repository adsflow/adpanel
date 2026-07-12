"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="w-full max-w-[400px] px-5">
      {/* ── Logo ────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-11 h-11 bg-primary rounded-xl shadow-lg shadow-primary/30 mb-4">
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">
          Scale<span className="text-primary">Ads</span>
          <span className="text-muted-foreground font-medium">Flow</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1.5 tracking-wide">
          Ad Management Panel
        </p>
      </div>

      {/* ── Card ────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-7 inset-highlight">
        <h2 className="text-base font-bold text-foreground mb-0.5">
          Welcome back
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Sign in to your agency account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              required
              className="bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Password */}
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" strokeWidth={2} />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {/* Submit */}
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

      {/* ── Footer ──────────────────────────────────────── */}
      <p className="text-center text-[11px] text-muted-foreground/50 mt-8">
        ScaleAdsFlow &copy; {new Date().getFullYear()} &mdash; Secure ad management
      </p>
    </div>
  );
}
