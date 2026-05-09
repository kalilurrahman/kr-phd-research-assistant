import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Copy, ExternalLink, Flame, Trash2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffectiveData } from "@/hooks/use-effective-data";
import { useFavorites } from "@/hooks/use-user-data";
import {
  computeStreak,
  getUsageLog,
  resetAllUserData,
  type UsageEvent,
} from "@/lib/usage-tracker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/my-stats")({
  head: () => ({
    meta: [
      { title: "My Stats — PhD Research Scholar Prompt Guide" },
      {
        name: "description",
        content: "Personal usage analytics for your PhD prompt activity.",
      },
    ],
  }),
  component: MyStatsPage,
});

function MyStatsPage() {
  const data = useEffectiveData();
  const favorites = useFavorites();
  const [log, setLog] = useState<UsageEvent[]>([]);

  useEffect(() => {
    setLog(getUsageLog());
    const onChange = () => setLog(getUsageLog());
    window.addEventListener("kr-phd:storage", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("kr-phd:storage", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const totals = useMemo(() => {
    let view = 0,
      copy = 0,
      claude = 0;
    for (const e of log) {
      if (e.action === "view") view += 1;
      else if (e.action === "copy") copy += 1;
      else if (e.action === "open_in_claude") claude += 1;
    }
    return { view, copy, claude };
  }, [log]);

  const heatmap = useMemo(() => buildHeatmap(log), [log]);

  const topDomains = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of log) {
      if (e.action !== "view") continue;
      counts.set(e.domainId, (counts.get(e.domainId) ?? 0) + 1);
    }
    const ranked = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, n]) => ({
        id,
        n,
        section: data.sectionsById[id],
      }))
      .filter((x) => x.section);
    return ranked;
  }, [log, data.sectionsById]);

  const unexplored = useMemo(() => {
    const seen = new Set(log.filter((e) => e.action === "view").map((e) => e.domainId));
    return data.sections.filter((s) => !seen.has(s.id)).slice(0, 8);
  }, [log, data.sections]);

  const last5Favs = useMemo(() => {
    const byNum = new Map(data.flatPrompts.map((p) => [p.num, p]));
    return favorites.ids
      .map((n) => byNum.get(n))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .slice(0, 5);
  }, [favorites.ids, data.flatPrompts]);

  const handleReset = () => {
    resetAllUserData();
    setLog([]);
    toast.success("All your local data has been cleared");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader
        totalPrompts={data.totalPrompts}
        totalDomains={data.totalDomains}
        phdCount={data.groupCounts.phd}
        researchCount={data.groupCounts.methods}
        favoritesCount={favorites.ids.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 space-y-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-2">
            Personal Analytics
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            My Stats
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Local-only — nothing leaves your browser.
          </p>
        </div>

        {/* Row 1 — totals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Prompts viewed" value={totals.view} icon={<Eye className="w-4 h-4" />} />
          <StatCard label="Copied" value={totals.copy} icon={<Copy className="w-4 h-4" />} />
          <StatCard label="Sent to Claude" value={totals.claude} icon={<ExternalLink className="w-4 h-4" />} />
        </div>

        {/* Row 2 — heatmap */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Last 30 days</h2>
          <div className="grid grid-cols-15 sm:grid-cols-30 gap-1" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
            {heatmap.map((d) => (
              <div
                key={d.key}
                title={`${d.label}: ${d.count} actions`}
                className={`aspect-square rounded-sm ${heatColor(d.count)} ${
                  d.isToday ? "ring-2 ring-primary" : ""
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className={`w-3 h-3 rounded-sm ${heatColor(n === 0 ? 0 : n * 2)}`} />
            ))}
            <span>More</span>
          </div>
        </section>

        {/* Row 3 — top domains */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Top 5 domains</h2>
          {topDomains.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No views yet — open a prompt to start tracking.
            </p>
          ) : (
            <div className="space-y-2">
              {topDomains.map(({ section, n }) => {
                const max = topDomains[0].n || 1;
                return (
                  <div key={section.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">
                        {section.icon} {section.label}
                      </span>
                      <span className="font-mono text-muted-foreground">{n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-card overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${(n / max) * 100}%`,
                          background: section.colorHex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Row 4 — unexplored */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Unexplored domains</h2>
          {unexplored.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              You've touched every domain — well done.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {unexplored.map((s) => (
                <Link
                  key={s.id}
                  to="/"
                  hash={s.id}
                  className="rounded-lg border border-border p-3 opacity-70 hover:opacity-100 hover:border-primary transition-all flex flex-col gap-1"
                  style={{ borderLeft: `3px solid ${s.colorHex}` }}
                >
                  <div className="text-xs text-muted-foreground">
                    {s.icon} {s.label}
                  </div>
                  <div className="text-[11px] text-primary inline-flex items-center gap-1">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Row 5 — favorites */}
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Recent favorites</h2>
          {last5Favs.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No favorites yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {last5Favs.map((p) => (
                <div
                  key={p.num}
                  className="rounded-lg border border-border p-3 flex flex-col gap-1"
                  style={{ borderTop: `2px solid ${p.sectionColor}` }}
                >
                  <div className="text-[10px] text-muted-foreground">
                    {p.sectionIcon} {p.sectionLabel}
                  </div>
                  <div className="text-sm font-semibold line-clamp-2">{p.title}</div>
                  <Link
                    to="/"
                    className="text-[11px] text-primary inline-flex items-center gap-1 mt-1"
                  >
                    Open in library <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reset */}
        <section className="pt-6 border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset my data
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all local data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears your usage log, profile, onboarding state,
                  filled-in prompts and favorites. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="font-display text-3xl font-bold text-foreground mt-2">
        {value}
      </div>
    </div>
  );
}

interface HeatCell {
  key: string;
  label: string;
  count: number;
  isToday: boolean;
}

function buildHeatmap(log: UsageEvent[]): HeatCell[] {
  const counts = new Map<string, number>();
  for (const e of log) {
    const d = new Date(e.timestamp);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const cells: HeatCell[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    cells.push({
      key: k,
      label: d.toLocaleDateString(),
      count: counts.get(k) ?? 0,
      isToday: i === 0,
    });
  }
  return cells;
}

function heatColor(n: number): string {
  if (n === 0) return "bg-muted/40";
  if (n <= 2) return "bg-emerald-900/60";
  if (n <= 5) return "bg-emerald-700/70";
  if (n <= 10) return "bg-emerald-500/80";
  return "bg-emerald-400";
}

/** Re-export streak for header use elsewhere. */
export function useStreak(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const update = () => setN(computeStreak(getUsageLog()));
    update();
    window.addEventListener("kr-phd:storage", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kr-phd:storage", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return n;
}

export { Flame };
