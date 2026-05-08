/**
 * Changelog:
 * 2026-05-07: Created utility module for merging resource catalog with addon packs.
 * Includes deduplication logic by Tool Name + URL.
 */

export interface CatalogEntry {
  source: string;
  fields: Record<string, string>;
  isAddon?: boolean;
}

export interface CatalogSubdomain {
  name: string;
  count: number;
  entries: CatalogEntry[];
}

export interface CatalogDomain {
  id: string;
  name: string;
  count: number;
  sources: string[];
  subdomains: CatalogSubdomain[];
}

export interface ResourceCatalog {
  generatedAt?: string;
  totals: {
    domains: number;
    entries: number;
    files: number;
  };
  domains: CatalogDomain[];
}

export interface AddonResourcePack {
  addonMetadata: {
    id: string;
    name: string;
    version: string;
    generatedOn: string;
  };
  hubHighlights?: {
    featuredStacks: Array<{ id: string; title: string; items: string[] }>;
    quickRecommendations: {
      byBudget: Record<string, string[]>;
      byResearchStage: Record<string, string[]>;
    };
  };
  domains: CatalogDomain[];
}

/**
 * Merges an addon pack into the main catalog following strict deduplication and merging rules.
 */
export function mergeResourceCatalog(
  base: ResourceCatalog,
  addon: AddonResourcePack
): ResourceCatalog {
  const mergedDomains = [...base.domains];

  addon.domains.forEach((addonDomain) => {
    const existingDomain = mergedDomains.find((d) => d.id === addonDomain.id);

    if (!existingDomain) {
      // Rule: Append addon domain if domain id is new
      mergedDomains.push({
        ...addonDomain,
        subdomains: addonDomain.subdomains.map((s) => ({
          ...s,
          entries: s.entries.map((e) => ({ ...e, isAddon: true })),
        })),
      });
    } else {
      // Rule: If domain id exists, merge subdomains by name
      addonDomain.subdomains.forEach((addonSub) => {
        const existingSub = existingDomain.subdomains.find(
          (s) => s.name.toLowerCase() === addonSub.name.toLowerCase()
        );

        if (!existingSub) {
          existingDomain.subdomains.push({
            ...addonSub,
            entries: addonSub.entries.map((e) => ({ ...e, isAddon: true })),
          });
        } else {
          // Rule: Append unique entries by Tool Name + URL
          addonSub.entries.forEach((addonEntry) => {
            const addonName = addonEntry.fields["Tool Name"] || "";
            const addonUrl = (addonEntry.fields["URL"] || "").toLowerCase();

            const isDuplicate = existingSub.entries.some((e) => {
              const eName = e.fields["Tool Name"] || "";
              const eUrl = (e.fields["URL"] || "").toLowerCase();
              return eName === addonName && eUrl === addonUrl;
            });

            if (!isDuplicate) {
              existingSub.entries.push({ ...addonEntry, isAddon: true });
            }
          });
          // Update counts
          existingSub.count = existingSub.entries.length;
        }
      });

      // Update domain sources and count
      addonDomain.sources.forEach((src) => {
        if (!existingDomain.sources.includes(src)) {
          existingDomain.sources.push(src);
        }
      });
      existingDomain.count = existingDomain.subdomains.reduce(
        (acc, s) => acc + s.entries.length,
        0
      );
    }
  });

  // Recalculate totals
  const totalEntries = mergedDomains.reduce(
    (acc, d) => acc + d.subdomains.reduce((acc2, s) => acc2 + s.entries.length, 0),
    0
  );

  return {
    ...base,
    totals: {
      ...base.totals,
      domains: mergedDomains.length,
      entries: totalEntries,
    },
    domains: mergedDomains,
  };
}
