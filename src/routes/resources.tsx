import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import resourcesCatalog from "@/data/resources-catalog.json";
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

const catalog = resourcesCatalog as {
  totals: { domains: number; entries: number; files: number };
  domains: CatalogDomain[];
};

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      {
        title: "Resources Hub - PhD Research Scholar Prompt Guide",
      },
      {
        name: "description",
        content:
          "Integrated PhD resources from CSV, XLSX sheets, and guides, grouped by domain and sub-domain.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const data = useEffectiveData();
  const [query, setQuery] = useState("");
  const [domainId, setDomainId] = useState<string>("all");
  const [subdomainName, setSubdomainName] = useState<string>("all");

  const visibleDomains = useMemo(
    () => (domainId === "all" ? catalog.domains : catalog.domains.filter((d) => d.id === domainId)),
    [domainId],
  );

  const availableSubdomains = useMemo(() => {
    const names = new Set<string>();
    for (const d of visibleDomains) {
      for (const s of d.subdomains) names.add(s.name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [visibleDomains]);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows: Array<{ domain: string; subdomain: string; entry: CatalogEntry }> = [];
    for (const d of visibleDomains) {
      for (const s of d.subdomains) {
        if (subdomainName !== "all" && s.name !== subdomainName) continue;
        for (const e of s.entries) {
          if (!q) {
            rows.push({ domain: d.name, subdomain: s.name, entry: e });
            continue;
          }
          const content = Object.values(e.fields).join(" ").toLowerCase();
          if (content.includes(q) || e.source.toLowerCase().includes(q)) {
            rows.push({ domain: d.name, subdomain: s.name, entry: e });
          }
        }
      }
    }
    return rows;
  }, [visibleDomains, subdomainName, query]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader
        totalPrompts={data.totalPrompts}
        totalDomains={data.totalDomains}
        phdCount={data.groupCounts.phd}
        researchCount={data.groupCounts.methods}
      />

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-3">
          <h1 className="font-display text-4xl font-bold gold-text">Integrated Resources Hub</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Parsed from all resources in the PhD reference folder, including CSV datasets, individual XLSX sheets, and markdown guides.
          </p>
          <div className="text-xs font-mono text-muted-foreground">
            Domains: {catalog.totals.domains} · Entries: {catalog.totals.entries} · Files: {catalog.totals.files}
          </div>
        </div>
      </section>

      <section className="sticky top-[6.5rem] z-30 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all extracted resources"
              className="w-full pl-9 pr-3 py-2 rounded-md bg-card border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
          <select
            value={domainId}
            onChange={(e) => {
              setDomainId(e.target.value);
              setSubdomainName("all");
            }}
            className="px-3 py-2 rounded-md bg-card border border-border focus:border-primary focus:outline-none text-sm"
          >
            <option value="all">All Main Domains</option>
            {catalog.domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.count})
              </option>
            ))}
          </select>
          <select
            value={subdomainName}
            onChange={(e) => setSubdomainName(e.target.value)}
            className="px-3 py-2 rounded-md bg-card border border-border focus:border-primary focus:outline-none text-sm"
          >
            <option value="all">All Sub-Domains</option>
            {availableSubdomains.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-4">
        <div className="text-xs text-muted-foreground">
          Showing {Math.min(entries.length, 150)} of {entries.length} matched entries.
        </div>
        <div className="space-y-3">
          {entries.slice(0, 150).map((row, idx) => (
            <article key={`${row.entry.source}:${idx}`} className="rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-primary font-mono">
                  {row.domain} / {row.subdomain}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">{row.entry.source}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {Object.entries(row.entry.fields)
                  .filter(([, v]) => String(v).trim().length > 0)
                  .slice(0, 12)
                  .map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <span className="text-muted-foreground">{k}: </span>
                      <span className="text-foreground">{String(v)}</span>
                    </div>
                  ))}
              </div>
            </article>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground py-12 text-center">
              No resources matched your search/filter.
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
