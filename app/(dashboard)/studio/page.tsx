import { Paintbrush, Image, Type, Layers, Wand2, Sparkles } from "lucide-react";

const tools = [
  {
    label: "Image Editor",
    desc: "Crop, resize, and enhance ad creatives",
    icon: Image,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    badge: "Coming Soon",
  },
  {
    label: "Copy Generator",
    desc: "AI-powered headline and body copy for your ads",
    icon: Type,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    badge: "Coming Soon",
  },
  {
    label: "Template Library",
    desc: "Pre-built creative templates for Meta and Google",
    icon: Layers,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    badge: "Coming Soon",
  },
  {
    label: "AI Creative",
    desc: "Generate ad visuals from a text prompt",
    icon: Wand2,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    badge: "Beta",
  },
];

export default function StudioPage() {
  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Paintbrush className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Design Studio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create and manage ad creatives for all platforms
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Coming soon banner */}
        <div className="flex items-center gap-3 bg-primary/8 border border-primary/20 rounded-xl px-5 py-4">
          <Sparkles className="w-4 h-4 text-primary shrink-0" strokeWidth={1.8} />
          <div>
            <p className="text-xs font-semibold text-primary mb-0.5">Design Studio — In Development</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The full creative suite is under active development. The tools below will be available
              in an upcoming release.
            </p>
          </div>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tools.map(({ label, desc, icon: Icon, color, bg, badge }) => (
            <div
              key={label}
              className="relative bg-card border border-border rounded-xl p-5 inset-highlight opacity-70"
            >
              {badge && (
                <span className="absolute top-3.5 right-3.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                  {badge}
                </span>
              )}
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.8} />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{label}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
