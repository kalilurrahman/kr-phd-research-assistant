import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ExternalLink, Wrench, BookOpen, CheckCircle2, Send, Scale, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { resources } from "@/data/comprehensive-resources";
import { useEffectiveData } from "@/hooks/use-effective-data";
import { useFavorites } from "@/hooks/use-user-data";

type TabId = "tools" | "methodologies" | "practices" | "publication" | "ethics";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "methodologies", label: "Methodologies", icon: BookOpen },
  { id: "practices", label: "Best Practices", icon: CheckCircle2 },
  { id: "publication", label: "Publication", icon: Send },
  { id: "ethics", label: "Ethics", icon: Scale },
];

export const Route = createFileRoute("/research-hub")({
  head: () => ({
    meta: [
      { title: "Research Hub — Tools, Methods, Practices, Ethics" },
      { name: "description", content: "Comprehensive PhD resource library: tools, methodologies, best practices, publication venues, and ethics compliance." },
      { property: "og:title", content: "Research Hub — PhD Research Assistant" },
      { property: "og:description", content: "Curated tools, methodologies, best practices, publication venues, and ethics compliance for PhD researchers." },
    ],
  }),
  component: ResearchHubPage,
});

function ResearchHubPage() {
  const { sections, totalPrompts, totalDomains, groupCounts } = useEffectiveData();
  const favorites = useFavorites();
  const [tab, setTab] = useState<TabId>("tools");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        totalPrompts={totalPrompts}
        totalDomains={totalDomains}
        phdCount={groupCounts.phd}
        researchCount={groupCounts.methods}
        favoritesCount={favorites.ids.length}
      />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Research Hub</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            A curated library of research tools, methodologies, PhD best practices, publication venues, and ethics
            compliance — synthesised from {resources.tools.data.length} tools,{" "}
            {resources.methodologies.data.length} methodologies, and more.
          </p>
        </header>

        {/* Tab nav */}
        <nav className="flex flex-wrap gap-2 mb-6 border-b border-border" role="tablist" aria-label="Research hub sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setQuery("");
                setFilter("all");
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="relative mb-4 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
            aria-label={`Search ${tab}`}
          />
        </div>

        {tab === "tools" && <ToolsPanel query={query} filter={filter} setFilter={setFilter} />}
        {tab === "methodologies" && <MethodsPanel query={query} />}
        {tab === "practices" && <PracticesPanel query={query} filter={filter} setFilter={setFilter} />}
        {tab === "publication" && <PublicationPanel query={query} filter={filter} setFilter={setFilter} />}
        {tab === "ethics" && <EthicsPanel query={query} filter={filter} setFilter={setFilter} />}
      </main>
      <SiteFooter />
    </div>
  );
}

function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
            value === opt.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
          }`}
        >
          {opt.label}
          {opt.count !== undefined && <span className="ml-1.5 opacity-70">({opt.count})</span>}
        </button>
      ))}
    </div>
  );
}

function ResultCount({ shown, total, label }: { shown: number; total: number; label: string }) {
  return (
    <div className="text-xs text-muted-foreground mb-3">
      Showing <span className="text-foreground font-medium">{shown}</span> of {total} {label}
    </div>
  );
}

function ToolsPanel({ query, filter, setFilter }: { query: string; filter: string; setFilter: (v: string) => void }) {
  const tools = resources.tools.data;
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    tools.forEach((t) => counts.set(t.category, (counts.get(t.category) ?? 0) + 1));
    return Array.from(counts.entries()).map(([id, count]) => ({ id, label: id, count }));
  }, [tools]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tools.filter((t) => {
      if (filter !== "all" && t.category !== filter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        t.features.join(" ").toLowerCase().includes(q)
      );
    });
  }, [tools, query, filter]);

  return (
    <div>
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[{ id: "all", label: "All", count: tools.length }, ...categories]}
      />
      <ResultCount shown={filtered.length} total={tools.length} label="tools" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <article
            key={t.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-bold text-lg leading-tight">{t.name}</h3>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 shrink-0">
                {t.cost}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">{t.category}</div>
            <p className="text-sm text-muted-foreground mb-3 flex-1">{t.purpose}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {t.features.slice(0, 4).map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t.rating && <>★ {t.rating} · {t.reviews} reviews</>}
              </span>
              <a
                href={t.website.startsWith("http") ? t.website : `https://${t.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MethodsPanel({ query }: { query: string }) {
  const methods = resources.methodologies.data;
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return methods;
    return methods.filter(
      (m) =>
        m.type.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.bestFor.join(" ").toLowerCase().includes(q),
    );
  }, [methods, query]);

  return (
    <div>
      <ResultCount shown={filtered.length} total={methods.length} label="methodologies" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <article key={m.id} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-display font-bold text-lg mb-1">{m.type}</h3>
            <p className="text-sm text-muted-foreground mb-3">{m.description}</p>
            <dl className="grid grid-cols-2 gap-2 text-xs mb-3">
              <DescItem label="Design" value={m.designApproach} />
              <DescItem label="Data" value={m.dataType} />
              <DescItem label="Analysis" value={m.analysisApproach} />
              {m.sampleSize && <DescItem label="Sample" value={m.sampleSize} />}
            </dl>
            <PillList title="Strengths" items={m.strengths} tone="positive" />
            <PillList title="Challenges" items={m.challenges} tone="warning" />
            <PillList title="Best for" items={m.bestFor} />
          </article>
        ))}
      </div>
    </div>
  );
}

function DescItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function PillList({ title, items, tone }: { title: string; items: string[]; tone?: "positive" | "warning" }) {
  if (!items?.length) return null;
  const cls =
    tone === "positive"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : tone === "warning"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
        : "bg-muted text-muted-foreground border-border";
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <span key={i} className={`text-[10px] px-2 py-0.5 rounded border ${cls}`}>
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

function PracticesPanel({ query, filter, setFilter }: { query: string; filter: string; setFilter: (v: string) => void }) {
  const phases = resources.bestPractices.phases;
  const phaseIds = Object.keys(phases);
  const all = useMemo(
    () =>
      phaseIds.flatMap((p) =>
        (phases[p].practices ?? []).map((pr) => ({ ...pr, phase: p, months: phases[p].months })),
      ),
    [phases, phaseIds],
  );
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return all.filter((p) => {
      if (filter !== "all" && p.phase !== filter) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    });
  }, [all, query, filter]);

  return (
    <div>
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All phases", count: all.length },
          ...phaseIds.map((p) => ({
            id: p,
            label: `${p[0].toUpperCase()}${p.slice(1)} (${phases[p].months}mo)`,
            count: phases[p].practices?.length ?? 0,
          })),
        ]}
      />
      <ResultCount shown={filtered.length} total={all.length} label="practices" />
      <div className="space-y-3">
        {filtered.map((p) => (
          <PracticeCard key={p.id} practice={p} />
        ))}
      </div>
    </div>
  );
}

function PracticeCard({ practice }: { practice: BestPracticeWithPhase }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30"
        aria-expanded={open}
      >
        <div>
          <div className="text-[10px] uppercase tracking-wider text-primary mb-0.5">
            {practice.phase} · Months {practice.months} · {practice.area}
          </div>
          <h3 className="font-display font-semibold">{practice.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{practice.description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-border grid md:grid-cols-2 gap-4 text-sm">
          <DetailList title="Steps" items={practice.steps} ordered />
          <DetailList title="Tools" items={practice.tools} />
          <DetailList title="Success indicators" items={practice.successIndicators} />
          {practice.commonPitfalls && <DetailList title="Common pitfalls" items={practice.commonPitfalls} />}
        </div>
      )}
    </article>
  );
}

type BestPracticeWithPhase = (typeof resources.bestPractices.phases)[string]["practices"][number] & {
  phase: string;
  months: string;
};

function DetailList({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{title}</div>
      <Tag className={`${ordered ? "list-decimal" : "list-disc"} pl-5 space-y-0.5 text-muted-foreground`}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </Tag>
    </div>
  );
}

function PublicationPanel({ query, filter, setFilter }: { query: string; filter: string; setFilter: (v: string) => void }) {
  const types = resources.publicationVenues.types;
  const typeIds = Object.keys(types);
  const all = useMemo(
    () => typeIds.flatMap((t) => (types[t].venues ?? []).map((v) => ({ ...v, typeId: t }))),
    [types, typeIds],
  );
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return all.filter((v) => {
      if (filter !== "all" && v.typeId !== filter) return false;
      if (!q) return true;
      return v.name.toLowerCase().includes(q) || (v.examples?.join(" ").toLowerCase().includes(q) ?? false);
    });
  }, [all, query, filter]);

  return (
    <div>
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All types", count: all.length },
          ...typeIds.map((t) => ({ id: t, label: t[0].toUpperCase() + t.slice(1), count: types[t].venues?.length ?? 0 })),
        ]}
      />
      <ResultCount shown={filtered.length} total={all.length} label="venues" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((v) => (
          <article key={v.id} className="rounded-xl border border-border bg-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-primary mb-1">{v.typeId}</div>
            <h3 className="font-display font-bold text-lg">{v.name}</h3>
            {v.examples && (
              <p className="text-xs text-muted-foreground mt-1">e.g., {v.examples.join(", ")}</p>
            )}
            <dl className="grid grid-cols-2 gap-2 text-xs mt-3 mb-3">
              {v.peerReview && <DescItem label="Peer review" value={v.peerReview} />}
              {v.timeline && <DescItem label="Timeline" value={v.timeline} />}
              {v.audience && <DescItem label="Audience" value={v.audience} />}
              {v.reach && <DescItem label="Reach" value={v.reach} />}
            </dl>
            {v.advantages && <PillList title="Advantages" items={v.advantages} tone="positive" />}
            {v.considerations && <PillList title="Considerations" items={v.considerations} tone="warning" />}
          </article>
        ))}
      </div>
    </div>
  );
}

function EthicsPanel({ query, filter, setFilter }: { query: string; filter: string; setFilter: (v: string) => void }) {
  const cats = resources.ethicsCompliance.categories;
  const catIds = Object.keys(cats);
  const all = useMemo(
    () => catIds.flatMap((c) => (cats[c].requirements ?? []).map((r) => ({ ...r, catId: c }))),
    [cats, catIds],
  );
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return all.filter((r) => {
      if (filter !== "all" && r.catId !== filter) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    });
  }, [all, query, filter]);

  const labelFor = (c: string) => c.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  return (
    <div>
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "All", count: all.length },
          ...catIds.map((c) => ({ id: c, label: labelFor(c), count: cats[c].requirements?.length ?? 0 })),
        ]}
      />
      <ResultCount shown={filtered.length} total={all.length} label="requirements" />
      <div className="space-y-3">
        {filtered.map((r) => (
          <EthicsCard key={r.id} requirement={r} category={labelFor(r.catId)} />
        ))}
      </div>
    </div>
  );
}

function EthicsCard({ requirement, category }: { requirement: Parameters<typeof DetailList>[0] extends never ? never : { id: string; name: string; description: string; whenNeeded?: string; actions: string[]; timeline?: string; penalties?: string; resources?: string[] }; category: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30"
        aria-expanded={open}
      >
        <div>
          <div className="text-[10px] uppercase tracking-wider text-primary mb-0.5">{category}</div>
          <h3 className="font-display font-semibold">{requirement.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
        </div>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-border grid md:grid-cols-2 gap-4 text-sm">
          {requirement.whenNeeded && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">When needed</div>
              <p className="text-muted-foreground">{requirement.whenNeeded}</p>
            </div>
          )}
          {requirement.timeline && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Timeline</div>
              <p className="text-muted-foreground">{requirement.timeline}</p>
            </div>
          )}
          <DetailList title="Key actions" items={requirement.actions} ordered />
          {requirement.penalties && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Penalties</div>
              <p className="text-amber-400">{requirement.penalties}</p>
            </div>
          )}
          {requirement.resources && requirement.resources.length > 0 && (
            <DetailList title="Resources" items={requirement.resources} />
          )}
        </div>
      )}
    </article>
  );
}
