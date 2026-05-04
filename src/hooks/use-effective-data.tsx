import { useCallback, useEffect, useMemo, useState } from "react";
import {
  phdSections as basePhdSections,
  sectionGroups as baseSectionGroups,
  type PhdPrompt,
  type PhdSection,
  type SectionGroup,
  type SectionGroupKey,
  type FlatPrompt,
} from "@/data/phd-sections";

/**
 * Admin overrides — layered on top of the bundled JSON. Stored in
 * localStorage so the curator can manage prompts/domains without
 * touching code, while bundled defaults remain the safety net.
 */

const OVERRIDES_KEY = "kr-phd:overrides:v1";

export interface PromptOverride extends Partial<PhdPrompt> {
  num: string;
  hidden?: boolean;
}

export interface SectionOverride {
  id: string;
  hidden?: boolean;
  label?: string;
  icon?: string;
  colorHex?: string;
  groupKey?: SectionGroupKey;
  // Admin-added prompts live here (full prompts, not partials).
  addedPrompts?: PhdPrompt[];
  // Admin-overridden / hidden bundled prompts.
  promptOverrides?: PromptOverride[];
  // Admin-side ordering of prompt nums (subset = pin to top).
  promptOrder?: string[];
}

export interface AddedSection {
  id: string; // must start with "custom-"
  label: string;
  icon: string;
  colorHex: string;
  groupKey: SectionGroupKey;
  prompts: PhdPrompt[];
}

export interface AdminOverrides {
  version: 1;
  sectionOverrides: Record<string, SectionOverride>;
  addedSections: AddedSection[];
  // Admin-side ordering of section ids (subset = pin to top).
  sectionOrder: string[];
}

export const EMPTY_OVERRIDES: AdminOverrides = {
  version: 1,
  sectionOverrides: {},
  addedSections: [],
  sectionOrder: [],
};

function readOverrides(): AdminOverrides {
  if (typeof window === "undefined") return EMPTY_OVERRIDES;
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return EMPTY_OVERRIDES;
    const parsed = JSON.parse(raw) as AdminOverrides;
    return { ...EMPTY_OVERRIDES, ...parsed };
  } catch {
    return EMPTY_OVERRIDES;
  }
}

function writeOverrides(value: AdminOverrides): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(value));
  window.dispatchEvent(
    new CustomEvent("kr-phd:storage", { detail: { key: OVERRIDES_KEY } }),
  );
}

export function useAdminOverrides() {
  const [overrides, setOverridesState] =
    useState<AdminOverrides>(readOverrides);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (!detail || detail.key === OVERRIDES_KEY) {
        setOverridesState(readOverrides());
      }
    };
    window.addEventListener("kr-phd:storage", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("kr-phd:storage", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setOverrides = useCallback(
    (next: AdminOverrides | ((prev: AdminOverrides) => AdminOverrides)) => {
      setOverridesState((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (p: AdminOverrides) => AdminOverrides)(prev)
            : next;
        writeOverrides(resolved);
        return resolved;
      });
    },
    [],
  );

  const reset = useCallback(() => setOverrides(EMPTY_OVERRIDES), [setOverrides]);

  return { overrides, setOverrides, reset };
}

/* -------------------------------------------------------------------------- */
/* Merger — produces an effective view of sections+groups for the rest of UI  */
/* -------------------------------------------------------------------------- */

export interface EffectiveData {
  sections: PhdSection[];
  groups: SectionGroup[];
  sectionsById: Record<string, PhdSection>;
  flatPrompts: FlatPrompt[];
  totalPrompts: number;
  totalDomains: number;
  groupCounts: Record<SectionGroupKey, number>;
}

function applyPromptOverride(
  base: PhdPrompt,
  ov: PromptOverride | undefined,
): PhdPrompt {
  if (!ov) return base;
  return {
    ...base,
    title: ov.title ?? base.title,
    badge: ov.badge ?? base.badge,
    useCase: ov.useCase ?? base.useCase,
    vars: ov.vars ?? base.vars,
    frameworks: ov.frameworks ?? base.frameworks,
    output: ov.output ?? base.output,
    tip: ov.tip ?? base.tip,
    prompt: ov.prompt ?? base.prompt,
  };
}

function orderBy<T>(items: T[], pinnedIds: string[], key: (x: T) => string): T[] {
  if (!pinnedIds.length) return items;
  const idx = new Map(pinnedIds.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ai = idx.has(key(a)) ? (idx.get(key(a)) as number) : Infinity;
    const bi = idx.has(key(b)) ? (idx.get(key(b)) as number) : Infinity;
    if (ai !== bi) return ai - bi;
    return 0;
  });
}

export function mergeData(overrides: AdminOverrides): EffectiveData {
  // 1. Start from bundled sections, applying overrides + filtering hidden.
  const sectionGroupMap: Record<string, SectionGroupKey> = {};
  for (const g of baseSectionGroups) {
    for (const id of g.sectionIds) sectionGroupMap[id] = g.key;
  }

  const mergedBase: Array<PhdSection & { _group: SectionGroupKey }> = [];
  for (const s of basePhdSections) {
    const so = overrides.sectionOverrides[s.id];
    if (so?.hidden) continue;
    const promptOverridesByNum = new Map<string, PromptOverride>(
      (so?.promptOverrides ?? []).map((p) => [p.num, p]),
    );
    const visiblePrompts = s.prompts
      .filter((p) => !promptOverridesByNum.get(p.num)?.hidden)
      .map((p) => applyPromptOverride(p, promptOverridesByNum.get(p.num)));
    const added = so?.addedPrompts ?? [];
    const ordered = orderBy(
      [...visiblePrompts, ...added],
      so?.promptOrder ?? [],
      (p) => p.num,
    );
    mergedBase.push({
      ...s,
      label: so?.label ?? s.label,
      icon: so?.icon ?? s.icon,
      colorHex: so?.colorHex ?? s.colorHex,
      prompts: ordered,
      meta: `${ordered.length} prompts`,
      _group: so?.groupKey ?? sectionGroupMap[s.id] ?? "general",
    });
  }

  // 2. Append admin-added sections.
  for (const a of overrides.addedSections) {
    mergedBase.push({
      id: a.id,
      label: a.label,
      icon: a.icon,
      colorHex: a.colorHex,
      dim: `${a.colorHex}1a`,
      border: `${a.colorHex}55`,
      meta: `${a.prompts.length} prompts`,
      prompts: a.prompts,
      _group: a.groupKey,
    });
  }

  // 3. Section ordering.
  const orderedSections = orderBy(
    mergedBase,
    overrides.sectionOrder,
    (s) => s.id,
  );

  const sections: PhdSection[] = orderedSections.map(
    ({ _group: _g, ...rest }) => rest,
  );
  const sectionsById = Object.fromEntries(sections.map((s) => [s.id, s]));

  // 4. Build groups dynamically (preserving original group order).
  const groups: SectionGroup[] = baseSectionGroups.map((g) => ({
    ...g,
    sectionIds: orderedSections
      .filter((s) => s._group === g.key)
      .map((s) => s.id),
  }));

  // 5. Flatten prompts.
  const sectionToGroup = new Map(
    orderedSections.map((s) => [s.id, s._group]),
  );
  const flatPrompts: FlatPrompt[] = sections.flatMap((s) =>
    s.prompts.map((p) => ({
      ...p,
      sectionId: s.id,
      sectionLabel: s.label,
      sectionIcon: s.icon,
      sectionColor: s.colorHex,
      groupKey: sectionToGroup.get(s.id) ?? "general",
    })),
  );

  const groupCounts: Record<SectionGroupKey, number> = {
    general: 0,
    phd: 0,
    methods: 0,
    bonus: 0,
    bonus2: 0,
  };
  for (const p of flatPrompts) groupCounts[p.groupKey] += 1;

  return {
    sections,
    groups,
    sectionsById,
    flatPrompts,
    totalPrompts: flatPrompts.length,
    totalDomains: sections.length,
    groupCounts,
  };
}

export function useEffectiveData(): EffectiveData {
  const { overrides } = useAdminOverrides();
  return useMemo(() => mergeData(overrides), [overrides]);
}
