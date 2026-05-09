import { Link } from "@tanstack/react-router";
import { Linkedin, Globe, Github, Star, Settings, BarChart3, Flame, GraduationCap } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useStreak } from "@/hooks/use-streak";

export function SiteHeader({
  totalPrompts,
  totalDomains,
  phdCount,
  researchCount,
  onOpenLibrary,
  favoritesCount,
  stage,
  onOpenWizard,
}: {
  totalPrompts: number;
  totalDomains: number;
  phdCount: number;
  researchCount: number;
  onOpenLibrary?: () => void;
  favoritesCount?: number;
  stage?: string;
  onOpenWizard?: () => void;
}) {
  const streak = useStreak();
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
        <Link
          to="/"
          className="flex items-center gap-3 group shrink-0"
          aria-label="Home"
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
        </Link>

        <div className="flex items-center gap-2 text-xs">
          {streak > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-[11px]"
              title={`${streak}-day streak`}
            >
              <Flame className="w-3 h-3" /> {streak}
            </span>
          )}
          {stage && onOpenWizard && (
            <button
              type="button"
              onClick={onOpenWizard}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md border border-primary/40 bg-primary/10 text-primary text-[11px] hover:border-primary"
              title="Edit your PhD profile"
            >
              <GraduationCap className="w-3 h-3" /> {stage.split(" – ")[0].replace("Year ", "Yr ")} ✦
            </button>
          )}
          <Link
            to="/research-hub"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors"
            aria-label="Research Hub"
          >
            <span>Hub</span>
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors"
            aria-label="Resources"
          >
            <span className="hidden sm:inline">Resources</span>
            <span className="sm:hidden">Res</span>
          </Link>
          <Link
            to="/my-stats"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors"
            aria-label="My Stats"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Stats</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Stat label="Prompts" value={totalPrompts} />
            <Stat label="Domains" value={totalDomains} />
            <Stat label="PhD" value={phdCount} accent="phd" />
            <Stat label="Research" value={researchCount} accent="research" />
          </div>
          {onOpenLibrary && (
            <button
              type="button"
              onClick={onOpenLibrary}
              className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors"
              aria-label={`Open library (${favoritesCount ?? 0} favorites)`}
            >
              <Star className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Library</span>
              {(favoritesCount ?? 0) > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0 rounded bg-primary text-primary-foreground">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}
          <ThemeSwitcher />
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors"
            aria-label="Admin"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
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
