"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Building2, KeyRound } from "lucide-react";

const industries = [
  "E-commerce",
  "Restaurant & Food",
  "Real Estate",
  "Healthcare & Aesthetics",
  "Education",
  "Fashion & Apparel",
  "Technology & SaaS",
  "Travel & Tourism",
  "Automotive",
  "Finance",
  "Other",
];

/* ─── Reusable field wrapper ─────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 w-full";

/* ─── Page ──────────────────────────────────────────────── */
export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
    website: "",
    portalEmail: "",
    portalPassword: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/clients");
        return;
      }

      let errorMessage = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) {
          errorMessage = data.error;
          if (data.detail) errorMessage += ` — ${data.detail}`;
        }
      } catch {
        errorMessage = `Unexpected response from server (${res.status} ${res.statusText})`;
      }

      setError(errorMessage);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}`
          : "An unexpected error occurred. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back to Clients
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Add New Client
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in the details to create a client account and set up portal access.
        </p>
      </div>

      <div className="px-8 py-6">
        <div className="max-w-2xl">
          {/* ── Error banner ──────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-3 bg-destructive/8 border border-destructive/25 rounded-xl px-4 py-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-xs font-semibold text-destructive mb-0.5">
                  Could not save client
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* ── Business Information ───────────────────── */}
            <div className="bg-card border border-border rounded-xl inset-highlight overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-secondary/20">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Business Information
                </h2>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Business Name" required>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Acme Digital Store"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Contact Email">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    className={inputClass}
                  />
                </Field>

                <Field label="Phone">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+90 555 000 0000"
                    className={inputClass}
                  />
                </Field>

                <Field label="Industry">
                  <select
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select industry</option>
                    {industries.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Website">
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {/* ── Portal Access ──────────────────────────── */}
            <div className="bg-card border border-border rounded-xl inset-highlight overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-secondary/20">
                <KeyRound className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
                <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Client Portal Access
                </h2>
              </div>

              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  The client will use these credentials to log into their read-only
                  reporting portal. Keep them separate from their main business email
                  if possible.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Portal Email" required>
                    <input
                      name="portalEmail"
                      type="email"
                      value={form.portalEmail}
                      onChange={handleChange}
                      required
                      placeholder="client@example.com"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Portal Password" required>
                    <input
                      name="portalPassword"
                      type="password"
                      value={form.portalPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Actions ────────────────────────────────── */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Client"
                )}
              </button>
              <Link
                href="/clients"
                className="flex items-center gap-2 bg-secondary hover:bg-accent text-foreground font-semibold px-5 py-2.5 rounded-lg text-sm border border-border transition-all duration-150"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
