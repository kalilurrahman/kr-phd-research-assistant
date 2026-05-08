import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  BookOpen,
  Database,
  Users,
  FlaskConical,
  ClipboardList,
  PenSquare,
  BarChart3,
  Library,
  Shield,
  Coins,
  Layers,
  Sparkles,
  ExternalLink,
  Workflow,
  FileText,
  Wrench,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import resourcesCatalog from "@/data/resources-catalog.json";
import resourcesAddon from "@/data/resources-addon-2026-05.json";
import { useEffectiveData } from "@/hooks/use-effective-data";

type CatalogEntry = {
  source: string;
  fields: Record<string, string>;
};

type CatalogSubdomain = {
  name: string;
  count: number;
  entries: CatalogEntry[];
};

type CatalogDomain = {
  id: string;
  name: string;
  count: number;
  sources: string[];
  subdomains: CatalogSubdomain[];
};

const catalogRaw = mergeResourceCatalog(
  resourcesCatalog as unknown as ResourceCatalog,
  resourcesAddon as unknown as AddonResourcePack
);

// Drop guide/prose/index/duplicate-aggregator domains — they contain free-form
// general info, not structured tool entries.
const EXCLUDED_DOMAIN_IDS = new Set<string>([
  "data-management-best-practices",
  "file-index",
  "integration-guide",
  "package-summary",
  "phd-research-assistant-guide",
  "phd-research-assistant-master-guide",
  "phd-research-assistant-comprehensive-toolkit",
  "phd-research-assistant-resource-repository",
  "readme",
  "readme-getting-started",
  "research-ethics-compliance-guide",
  "research-methodologies-toolkit",
  "research-toolkit",
  "research-tools-database",
  "web-toolkit",
  "publication-venues-guide",
  "phd-best-practices-checklist",
]);

const EXCLUDED_SUBDOMAINS = new Set<string>(["Guides", "General"]);

// Keep only meaningful structured fields.
const FIELD_DENYLIST = [
  "guide",
  "notes",
  "section",
  "content",
  "summary",
  "overview",
];

function isDenseProse(value: string): boolean {
  if (!value) return false;
  // > 3 lines OR very long single block of prose
  if (value.split(/\r?\n/).length > 3) return true;
  if (value.length > 280) return true;
  return false;
}

const catalog = {
  ...catalogRaw,
  domains: catalogRaw.domains
    .filter((d) => !EXCLUDED_DOMAIN_IDS.has(d.id))
    .map((d) => ({
      ...d,
      subdomains: d.subdomains
        .filter((s) => !EXCLUDED_SUBDOMAINS.has(s.name))
        .map((s) => ({
          ...s,
          entries: s.entries.filter((e) => {
            const values = Object.values(e.fields).filter(
              (v) => String(v).trim().length > 0,
            );
            if (values.length === 0) return false;
            // drop entries that are essentially a single long prose blob
            if (values.length === 1 && isDenseProse(String(values[0])))
              return false;
            return true;
          }),
        }))
        .filter((s) => s.entries.length > 0),
    }))
    .filter((d) => d.subdomains.length > 0),
};

const DOMAIN_ICONS: Record<string, { icon: LucideIcon; tint: string }> = {
  "academic-databases": { icon: Library, tint: "hsl(207 90% 60%)" },
  "additional-research-resources": { icon: Sparkles, tint: "hsl(280 70% 65%)" },
  "collaboration-tools": { icon: Users, tint: "hsl(160 70% 50%)" },
  "data-repositories": { icon: Database, tint: "hsl(195 90% 55%)" },
  "funding-grant-resources": { icon: Coins, tint: "hsl(36 90% 55%)" },
  "project-management-tools": { icon: ClipboardList, tint: "hsl(220 80% 65%)" },
  "qualitative-analysis-tools": { icon: BookOpen, tint: "hsl(330 75% 60%)" },
  "reference-management-tools": { icon: Library, tint: "hsl(43 70% 55%)" },
  "research-ethics-compliance": { icon: Shield, tint: "hsl(0 70% 60%)" },
  "research-ethics-compliance-csv": { icon: Shield, tint: "hsl(0 70% 60%)" },
  "research-methodologies": { icon: FlaskConical, tint: "hsl(265 70% 65%)" },
  "research-workflow-stages": { icon: Workflow, tint: "hsl(168 79% 52%)" },
  "research-writing-productivity-tools": {
    icon: PenSquare,
    tint: "hsl(43 70% 60%)",
  },
  "statistical-analysis-tools": { icon: BarChart3, tint: "hsl(155 65% 50%)" },
  "survey-data-collection-tools": { icon: FileText, tint: "hsl(14 90% 60%)" },
  "systematic-review-tools": { icon: Layers, tint: "hsl(105 55% 50%)" },
  "open-science-compliance": { icon: Shield, tint: "hsl(180 70% 45%)" },
  "ai-discovery-evidence-mapping": { icon: Sparkles, tint: "hsl(280 80% 60%)" },
  "systematic-review-and-reporting-standards": { icon: Layers, tint: "hsl(140 60% 50%)" },
  "reproducible-computational-research": { icon: Workflow, tint: "hsl(210 80% 55%)" },
  "research-impact-and-evaluation": { icon: BarChart3, tint: "hsl(340 70% 55%)" },
};

function iconFor(domainId: string): { icon: LucideIcon; tint: string } {
  return (
    DOMAIN_ICONS[domainId] ?? { icon: Wrench, tint: "hsl(43 52% 54%)" }
  );
}

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      {
        title: "Resources Hub - PhD Research Scholar Prompt Guide",
      },
      {
        name: "description",
        content:
          "Curated PhD research tools and resources, grouped by domain and sub-domain in clean alternating rows.",
      },
    ],
  }),
  component: ResourcesPage,
});

type Row = {
  domain: string;
  domainId: string;
  subdomain: string;
  entry: CatalogEntry;
};

function pickHeaders(entries: CatalogEntry[]): string[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const [k, v] of Object.entries(e.fields)) {
      const lower = k.toLowerCase();
      if (FIELD_DENYLIST.some((d) => lower.includes(d))) continue;
      if (!String(v).trim()) continue;
      if (isDenseProse(String(v))) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);
}

function ResourcesPage() {
  const data = useEffectiveData();
  const [query, setQuery] = useState("");
  const [domainId, setDomainId] = useState<string>("all");

  const visibleDomains = useMemo(
    () =>
      domainId === "all"
        ? catalog.domains
        : catalog.domains.filter((d) => d.id === domainId),
    [domainId],
  );

  const totalEntries = useMemo(
    () =>
      catalog.domains.reduce(
        (sum, d) =>
          sum + d.subdomains.reduce((s2, sd) => s2 + sd.entries.length, 0),
        0,
      ),
    [],
  );

  const filteredDomains = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleDomains;
    return visibleDomains
      .map((d) => ({
        ...d,
        subdomains: d.subdomains
          .map((s) => ({
            ...s,
            entries: s.entries.filter((e) => {
              const blob = (
                Object.values(e.fields).join(" ") +
                " " +
                e.source
              ).toLowerCase();
              return blob.includes(q);
            }),
          }))
          .filter((s) => s.entries.length > 0),
      }))
      .filter((d) => d.subdomains.length > 0);
  }, [visibleDomains, query]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader
        totalPrompts={data.totalPrompts}
        totalDomains={data.totalDomains}
        phdCount={data.groupCounts.phd}
        researchCount={data.groupCounts.methods}
      />

      <section className="border-b border-border hero-backdrop">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-3">
          <h1 className="font-display text-4xl font-bold gold-text">
            Integrated Resources Hub
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Curated tools and references parsed from CSV datasets and JSON
            sources. Generic guides, READMEs, and prose blobs have been removed
            so only structured rows remain.
          </p>
          <div className="text-xs font-mono text-muted-foreground">
            Domains: {catalog.domains.length} · Entries: {totalEntries}
          </div>
        </div>
      </section>

      <section className="sticky top-[6.5rem] z-30 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, descriptions, sources…"
              className="w-full pl-9 pr-3 py-2 rounded-md bg-card border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="px-3 py-2 rounded-md bg-card border border-border focus:border-primary focus:outline-none text-sm"
          >
            <option value="all">All Domains</option>
            {catalog.domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-10">
        {filteredDomains.map((d) => {
          const allEntries = d.subdomains.flatMap((s) =>
            s.entries.map((e) => ({ subdomain: s.name, entry: e })),
          );
          const headers = pickHeaders(allEntries.map((r) => r.entry));
          return (
            <DomainTable
              key={d.id}
              domain={d}
              rows={allEntries}
              defaultHeaders={headers}
            />
          );
        })}

        {filteredDomains.length === 0 && (
          <div className="text-sm text-muted-foreground py-12 text-center">
            No resources matched your search/filter.
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

type DomainRow = { subdomain: string; entry: CatalogEntry };

function allFieldKeys(rows: DomainRow[]): string[] {
  const keys = new Set<string>();
  rows.forEach((r) =>
    Object.keys(r.entry.fields).forEach((k) => {
      const lower = k.toLowerCase();
      if (FIELD_DENYLIST.some((d) => lower.includes(d))) return;
      keys.add(k);
    }),
  );
  return Array.from(keys);
}

const PAGE_SIZE = 15;

function DomainTable({
  domain,
  rows,
  defaultHeaders,
}: {
  domain: CatalogDomain;
  rows: DomainRow[];
  defaultHeaders: string[];
}) {
  const meta = iconFor(domain.id);
  const Icon = meta.icon;
  const tintBg = meta.tint
    .replace("hsl(", "hsla(")
    .replace(")", " / 0.10)");

  const availableFields = useMemo(() => allFieldKeys(rows), [rows]);
  const [visibleHeaders, setVisibleHeaders] = useState<string[]>(
    defaultHeaders.length ? defaultHeaders : availableFields.slice(0, 5),
  );
  const [sortKey, setSortKey] = useState<string>("__subdomain");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [openRow, setOpenRow] = useState<DomainRow | null>(null);

  const sortedRows = useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av =
        sortKey === "__subdomain"
          ? a.subdomain
          : String(a.entry.fields[sortKey] ?? "");
      const bv =
        sortKey === "__subdomain"
          ? b.subdomain
          : String(b.entry.fields[sortKey] ?? "");
      const cmp = av.localeCompare(bv, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = sortedRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIcon = (key: string) => {
    if (sortKey !== key)
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  };

  const toggleHeader = (key: string) => {
    setVisibleHeaders((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
    );
  };

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center gap-3">
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border"
          style={{
            background: tintBg,
            color: meta.tint,
          }}
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl font-semibold">{domain.name}</h2>
          <div className="text-xs text-muted-foreground">
            {rows.length} entries · {domain.subdomains.length} sub-domains
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              aria-label="Choose visible columns"
            >
              <Columns3 className="w-3.5 h-3.5" />
              Columns ({visibleHeaders.length}/{availableFields.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 max-h-80 overflow-y-auto">
            <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
              Visible columns
            </div>
            <div className="space-y-2">
              {availableFields.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={visibleHeaders.includes(f)}
                    onCheckedChange={() => toggleHeader(f)}
                  />
                  <span className="truncate">{f}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-border flex justify-between gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => setVisibleHeaders(availableFields)}
              >
                All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() =>
                  setVisibleHeaders(
                    defaultHeaders.length
                      ? defaultHeaders
                      : availableFields.slice(0, 5),
                  )
                }
              >
                Reset
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{
                background: meta.tint.replace("hsl(", "hsla(").replace(
                  ")",
                  " / 0.10)",
                ),
              }}
            >
              <th className="px-3 py-2 font-medium text-foreground/90 w-44">
                Sub-domain
              </th>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 font-medium text-foreground/90"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allEntries.map((row, idx) => {
              const url =
                row.entry.fields["URL"] ||
                row.entry.fields["Url"] ||
                row.entry.fields["Website"] ||
                row.entry.fields["Link"] ||
                "";
              return (
                <tr
                  key={`${d.id}-${idx}`}
                  className={
                    idx % 2 === 0
                      ? "bg-card/40"
                      : "bg-background/40 hover:bg-card/60"
                  }
                >
                  <td className="px-3 py-2 align-top text-xs font-mono text-primary whitespace-nowrap">
                    {row.subdomain}
                  </td>
                  {headers.map((h) => {
                    const val = String(row.entry.fields[h] ?? "");
                    if (
                      h.toLowerCase().includes("url") ||
                      h.toLowerCase() === "website" ||
                      h.toLowerCase() === "link"
                    ) {
                      return (
                        <td key={h} className="px-3 py-2 align-top">
                          {val ? (
                            <a
                              href={val}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              Visit
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                      );
                    }
                    return (
                      <td
                        key={h}
                        className="px-3 py-2 align-top text-foreground/90"
                      >
                        {val || (
                          <span className="text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {!headers.some((h) =>
                    h.toLowerCase().includes("url"),
                  ) &&
                    url && (
                      <td className="px-3 py-2 align-top">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
})}

{
  filteredDomains.length === 0 && (
    <div className="text-sm text-muted-foreground py-12 text-center">
      No resources matched your search/filter.
    </div>
  )
}
      </main >

  <SiteFooter />
    </div >
  );
}
