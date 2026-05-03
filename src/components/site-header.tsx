import { Linkedin, Globe, Github } from "lucide-react";

export function SiteHeader({
  totalPrompts,
  totalDomains,
  phdCount,
  researchCount,
}: {
  totalPrompts: number;
  totalDomains: number;
  phdCount: number;
  researchCount: number;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      {/* Curator strip */}
      <div className="bg-[hsl(220,33%,7%)] border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
          <span className="text-[hsl(43,70%,66%)]">✦</span>
          <span>
            Curated by{" "}
            <strong className="text-foreground">Kalilur Rahman</strong>
          </span>
          <span className="opacity-40">·</span>
          <a
            href="https://kalilurrahman.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary inline-flex items-center gap-1"
          >
            <Globe className="w-3 h-3" /> Portfolio
          </a>
          <span className="opacity-40">·</span>
          <a
            href="https://www.linkedin.com/in/kalilurrahman"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary inline-flex items-center gap-1"
          >
            <Linkedin className="w-3 h-3" /> LinkedIn
          </a>
          <span className="opacity-40">·</span>
          <a
            href="https://github.com/kalilurrahman"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary inline-flex items-center gap-1"
          >
            <Github className="w-3 h-3" /> GitHub
          </a>
        </div>
      </div>

      {/* Brand row */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <a
          href="https://kalilurrahman.lovable.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-card border border-primary/40 flex items-center justify-center group-hover:border-primary transition-colors">
            <span className="font-display text-base font-bold text-primary">
              KR
            </span>
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-base font-bold text-foreground">
              PhD Research Scholar Prompt Guide
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              v7.0 · {totalPrompts} prompts · {totalDomains} domains
            </div>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-2 text-xs">
          <Stat label="Prompts" value={totalPrompts} />
          <Stat label="Domains" value={totalDomains} />
          <Stat label="PhD" value={phdCount} accent="phd" />
          <Stat label="Research" value={researchCount} accent="research" />
        </div>
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "phd" | "research";
}) {
  const colour =
    accent === "phd"
      ? "text-[#8BB4E0]"
      : accent === "research"
        ? "text-[#FB923C]"
        : "text-primary";
  return (
    <div className="px-2.5 py-1 rounded-md bg-card border border-border">
      <span className={`font-bold ${colour}`}>{value}</span>
      <span className="ml-1 text-muted-foreground">{label}</span>
    </div>
  );
}
