import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  GraduationCap,
  FlaskConical,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PromptCard } from "@/components/prompt-card";
import { PromptStudio } from "@/components/prompt-studio";
import { FavoritesPanel } from "@/components/favorites-panel";
import { ExportBar, ExportLauncher } from "@/components/export-bar";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { StartingTenStrip } from "@/components/starting-ten-strip";
import { SuggestPromptFab } from "@/components/suggest-prompt-fab";
import {
  type FlatPrompt,
  type SectionGroupKey,
} from "@/data/phd-sections";
import { useEffectiveData } from "@/hooks/use-effective-data";
import {
  useFavorites,
  useRecentSearches,
  useRecentViews,
  useSelection,
} from "@/hooks/use-user-data";
import {
  getProfile,
  isOnboarded,
  type PhdProfile,
} from "@/lib/usage-tracker";
import { pickStartingTen } from "@/lib/starting-ten";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "PhD Research Scholar Prompt Guide — by Kalilur Rahman",
      },
      {
        name: "description",
        content:
          "A scholar's complete AI prompting companion. Expert-grade prompts across academic and research domains — favorite, search, export and admin-curated by Kalilur Rahman.",
      },
      {
        property: "og:title",
        content: "PhD Research Scholar Prompt Guide — by Kalilur Rahman",
      },
      {
        property: "og:description",
        content:
          "Expert-grade research prompts across PhD, methods, ethics and AI-augmented scholarship — favorite, export and curate.",
      },
    ],
  }),
  component: Index,
});

type Filter =
  | { kind: "all" }
  | { kind: "group"; group: SectionGroupKey }
  | { kind: "section"; sectionId: string };

function Index() {
  const data = useEffectiveData();
  const {
    sections,
    groups,
    flatPrompts,
    totalPrompts,
    totalDomains,
    groupCounts,
  } = data;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [active, setActive] = useState<FlatPrompt | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [profile, setProfileState] = useState<PhdProfile | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);

  const favorites = useFavorites();
  const recentSearches = useRecentSearches();
  const recentViews = useRecentViews();
  const selection = useSelection();

  // First-visit onboarding + profile hydration.
  useEffect(() => {
    setProfileState(getProfile());
    if (!isOnboarded()) setWizardOpen(true);
  }, []);

  // Reveal "Suggest a Prompt" FAB after 5s.
  useEffect(() => {
    const id = window.setTimeout(() => setShowFab(true), 5000);
    return () => window.clearTimeout(id);
  }, []);

  const startingTen = useMemo(
    () => (profile ? pickStartingTen(profile, flatPrompts) : []),
    [profile, flatPrompts],
  );

  // Debounce-record searches once the user pauses typing.
  useEffect(() => {
    if (!query.trim()) return;
    const id = window.setTimeout(() => recentSearches.record(query), 700);
    return () => window.clearTimeout(id);
  }, [query, recentSearches]);

  const visiblePrompts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flatPrompts.filter((p) => {
      if (filter.kind === "group" && p.groupKey !== filter.group) return false;
      if (filter.kind === "section" && p.sectionId !== filter.sectionId)
        return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.useCase.toLowerCase().includes(q) ||
        p.frameworks.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.sectionLabel.toLowerCase().includes(q) ||
        p.vars.some((v) => v.toLowerCase().includes(q))
      );
    });
  }, [query, filter, flatPrompts]);

  const grouped = useMemo(() => {
    const map = new Map<string, FlatPrompt[]>();
    for (const p of visiblePrompts) {
      const arr = map.get(p.sectionId) ?? [];
      arr.push(p);
      map.set(p.sectionId, arr);
    }
    return sections
      .map((s) => ({ section: s, prompts: map.get(s.id) ?? [] }))
      .filter((g) => g.prompts.length > 0);
  }, [visiblePrompts, sections]);

  const visibleNums = useMemo(
    () => visiblePrompts.map((p) => p.num),
    [visiblePrompts],
  );
  const allVisibleSelected =
    visibleNums.length > 0 &&
    visibleNums.every((n) => selection.has(n));

  const openPrompt = (p: FlatPrompt) => {
    setActive(p);
    recentViews.record(p.num);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader
        totalPrompts={totalPrompts}
        totalDomains={totalDomains}
        phdCount={groupCounts.phd}
        researchCount={groupCounts.methods}
        onOpenLibrary={() => setLibraryOpen(true)}
        favoritesCount={favorites.ids.length}
        stage={profile?.stage}
        onOpenWizard={() => setWizardOpen(true)}
      />

      {profile && startingTen.length > 0 && (
        <StartingTenStrip
          prompts={startingTen}
          onOpen={openPrompt}
          stage={profile.stage}
        />
      )}
      {/* HERO */}
      <section className="hero-backdrop border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:py-20">
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary font-mono mb-4">
            Comprehensive Academic & PhD Research Prompt Library
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-4xl">
            Think rigorously.
            <br />
            <em className="gold-text not-italic font-bold">Write brilliantly.</em>
            <br />
            <span className="text-2xl sm:text-3xl text-muted-foreground font-normal italic">
              A scholar's complete AI prompting companion.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mt-6 leading-relaxed">
            <span className="text-foreground font-semibold">{totalPrompts}</span>{" "}
            expert-grade prompts across{" "}
            <span className="text-foreground font-semibold">{totalDomains}</span>{" "}
            domains. Favorite the ones you use, build a personal collection, and
            export curated bundles as JSON or a branded PDF report.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8">
            <HeroPill
              accent="#8BB4E0"
              icon={<GraduationCap className="w-4 h-4" />}
              title={`${groupCounts.phd} PhD-Exclusive Prompts`}
              caption="Dissertation, viva, grants, postdoc, supervision"
            />
            <HeroPill
              accent="#FB923C"
              icon={<FlaskConical className="w-4 h-4" />}
              title={`${groupCounts.methods} Research Method Prompts`}
              caption="PRISMA, qualitative, quantitative, mixed, ethics, FAIR"
            />
            <HeroPill
              accent="#F59E0B"
              icon={<Sparkles className="w-4 h-4" />}
              title={`${groupCounts.bonus} KR Bonus Prompts`}
              caption="AI co-author, reproducibility, pre-registration, wellbeing"
            />
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="sticky top-[6.5rem] sm:top-[6.5rem] z-30 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${totalPrompts} prompts — title, framework, variable…`}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-card border border-border focus:border-primary focus:outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (allVisibleSelected) {
                  // Deselect just the currently visible set
                  selection.setMany(
                    selection.ids.filter((n) => !visibleNums.includes(n)),
                  );
                } else {
                  const merged = Array.from(
                    new Set([...selection.ids, ...visibleNums]),
                  );
                  selection.setMany(merged);
                }
              }}
              disabled={visibleNums.length === 0}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors disabled:opacity-40"
            >
              {allVisibleSelected ? (
                <CheckSquare className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              {allVisibleSelected ? "Deselect" : "Select all"}
            </button>
            <ExportLauncher
              flatPrompts={flatPrompts}
              selectedNums={selection.ids}
              favoriteNums={favorites.ids}
            />
            <div className="hidden md:block text-xs text-muted-foreground font-mono whitespace-nowrap">
              {visiblePrompts.length}/{totalPrompts}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterPill
              active={filter.kind === "all"}
              onClick={() => setFilter({ kind: "all" })}
              label="✦ All Domains"
            />
            {groups.map((g) => (
              <FilterPill
                key={g.key}
                active={filter.kind === "group" && filter.group === g.key}
                onClick={() => setFilter({ kind: "group", group: g.key })}
                label={g.label}
                colour={g.accent}
              />
            ))}
            <span className="w-px h-5 bg-border mx-1 shrink-0" />
            {sections.map((s) => (
              <FilterPill
                key={s.id}
                active={filter.kind === "section" && filter.sectionId === s.id}
                onClick={() => setFilter({ kind: "section", sectionId: s.id })}
                label={`${s.icon} ${s.label}`}
                count={s.prompts.length}
                colour={s.colorHex}
                compact
              />
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 space-y-12">
        {grouped.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No prompts match{" "}
            <span className="text-foreground font-mono">"{query}"</span>.
          </div>
        )}
        {grouped.map(({ section, prompts }) => (
          <section
            key={section.id}
            id={section.id}
            className="space-y-4 scroll-mt-48"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.08))",
                  }}
                >
                  {section.icon}
                </span>
                <h2
                  className="font-display text-2xl sm:text-3xl font-bold"
                  style={{ color: section.colorHex }}
                >
                  {section.label}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {prompts.length} prompt{prompts.length === 1 ? "" : "s"}
                </span>
              </div>
              <div
                className="h-px flex-1 min-w-[40px]"
                style={{
                  background: `linear-gradient(90deg, ${section.colorHex}55, transparent)`,
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map((p) => (
                <PromptCard
                  key={p.num}
                  prompt={p}
                  onOpen={() => openPrompt(p)}
                  isFavorite={favorites.isFavorite(p.num)}
                  onToggleFavorite={() => favorites.toggle(p.num)}
                  isSelected={selection.has(p.num)}
                  onToggleSelect={() => selection.toggle(p.num)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <SiteFooter />

      <PromptStudio
        prompt={active}
        onClose={() => setActive(null)}
        isFavorite={active ? favorites.isFavorite(active.num) : false}
        onToggleFavorite={
          active ? () => favorites.toggle(active.num) : undefined
        }
      />

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onFinish={(p) => setProfileState(p)}
        allowSkip={!isOnboarded()}
      />

      <SuggestPromptFab
        flatPrompts={flatPrompts}
        visible={showFab}
        onOpenPrompt={openPrompt}
      />

      <FavoritesPanel
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        flatPrompts={flatPrompts}
        onOpenPrompt={(p) => {
          setLibraryOpen(false);
          openPrompt(p);
        }}
        onApplySearch={(q) => setQuery(q)}
      />

      <ExportBar
        selectedNums={selection.ids}
        onClear={selection.clear}
        flatPrompts={flatPrompts}
        favoriteNums={favorites.ids}
      />
    </div>
  );
}

function HeroPill({
  accent,
  icon,
  title,
  caption,
}: {
  accent: string;
  icon: React.ReactNode;
  title: string;
  caption: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 bg-card/60 backdrop-blur-sm flex items-start gap-3"
      style={{
        borderColor: `${accent}55`,
        background: `linear-gradient(135deg, ${accent}10, transparent)`,
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <div className="leading-tight">
        <div
          className="font-display text-sm font-bold"
          style={{ color: accent }}
        >
          {title}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{caption}</div>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  colour,
  count,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  colour?: string;
  count?: number;
  compact?: boolean;
}) {
  const c = colour ?? "hsl(var(--primary))";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border text-xs whitespace-nowrap transition-all ${
        compact ? "px-2.5 py-1" : "px-3 py-1.5"
      } ${active ? "shadow-[0_0_16px_-4px_currentColor]" : "hover:-translate-y-0.5"}`}
      style={{
        color: active ? c : "hsl(var(--muted-foreground))",
        borderColor: active ? c : "hsl(var(--border))",
        background: active ? `${c}1a` : "transparent",
      }}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="font-mono opacity-70">{count}</span>
      )}
    </button>
  );
}
