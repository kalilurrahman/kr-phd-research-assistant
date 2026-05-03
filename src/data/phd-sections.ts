import rawData from "./phd-prompts.json";

export type PromptBadge = "advanced" | "intermediate" | "foundational";

export interface PhdPrompt {
  num: string;
  title: string;
  badge: PromptBadge;
  useCase: string;
  vars: string[];
  frameworks: string;
  output: string;
  tip: string;
  prompt: string;
}

export interface PhdSection {
  id: string;
  colorHex: string;
  dim: string;
  border: string;
  icon: string;
  label: string;
  meta: string;
  prompts: PhdPrompt[];
}

export type SectionGroupKey = "general" | "phd" | "methods" | "bonus";

export interface SectionGroup {
  key: SectionGroupKey;
  label: string;
  accent: string;
  sectionIds: string[];
}

const baseSections: PhdSection[] = Object.entries(
  rawData as Record<string, Omit<PhdSection, "id">>,
).map(([id, value]) => ({ id, ...value }));

// Bonus domain — KR-curated extension prompts on top of the 236 imported ones.
const bonusSection: PhdSection = {
  id: "s40",
  colorHex: "#F59E0B",
  dim: "rgba(245,158,11,0.10)",
  border: "rgba(245,158,11,0.32)",
  icon: "✨",
  label: "AI-Augmented Scholarship (KR Bonus)",
  meta: "8 prompts",
  prompts: [
    {
      num: "237",
      title: "AI Co-Author Disclosure Architect",
      badge: "advanced",
      useCase:
        "Draft a transparent, journal-compliant statement describing how AI tools were used in your research and writing.",
      vars: ["JOURNAL", "AI_TOOLS_USED", "TASKS_PERFORMED", "HUMAN_OVERSIGHT"],
      frameworks:
        "COPE author guidance; ICMJE statements; Nature/Elsevier/Springer AI policies; CRediT taxonomy",
      output:
        "Camera-ready AI-use disclosure paragraph with method-level granularity, oversight description, and reviewer-anticipation notes.",
      tip: "List every AI tool by name and version, and the exact stage it touched — vague disclosures get rejected.",
      prompt:
        "You are an AI Co-Author Disclosure Architect. For journal [JOURNAL], with AI tools [AI_TOOLS_USED] used for tasks [TASKS_PERFORMED] under human oversight [HUMAN_OVERSIGHT], draft a transparent, policy-compliant disclosure section. Specify model versions, prompts saved, decisions made by humans, and how originality and accountability were preserved.",
    },
    {
      num: "238",
      title: "Reproducibility Package Architect",
      badge: "advanced",
      useCase:
        "Design a complete reproducibility bundle (code, data, environment, README) that meets ACM/Nature standards.",
      vars: ["STUDY_TYPE", "ARTIFACTS", "PLATFORM", "TARGET_BADGE"],
      frameworks:
        "ACM Artifact Review badges; Nature Code & Software policy; FAIR principles; Docker/Singularity; Binder",
      output:
        "Reproducibility package blueprint with directory layout, environment lockfile strategy, runbook, validation tests, and badge-application checklist.",
      tip: "Pin every dependency by hash and ship a one-command runner — reviewers will not debug your environment.",
      prompt:
        "You are a Reproducibility Package Architect. For a [STUDY_TYPE] study with artifacts [ARTIFACTS] running on [PLATFORM], targeting badge [TARGET_BADGE], design a full reproducibility bundle: directory layout, dependency lockfile, container recipe, deterministic seeds, validation script, README walk-through, and DOI-minting plan.",
    },
    {
      num: "239",
      title: "Pre-Registration Coach",
      badge: "advanced",
      useCase:
        "Write a tight, OSF-quality pre-registration that locks hypotheses, design and analysis plan before data collection.",
      vars: ["RESEARCH_QUESTION", "DESIGN", "ANALYSIS_PLAN", "STOPPING_RULE"],
      frameworks:
        "OSF pre-registration; AsPredicted; Registered Reports; Bayesian sequential design; Multiverse analysis",
      output:
        "Pre-registration draft with falsifiable hypotheses, exact analysis pipeline, contingency rules, and deviation-reporting protocol.",
      tip: "Specify your stopping rule and how you will report any deviation — that is what reviewers actually scrutinise.",
      prompt:
        "You are a Pre-Registration Coach. For research question [RESEARCH_QUESTION], with design [DESIGN], analysis plan [ANALYSIS_PLAN], and stopping rule [STOPPING_RULE], produce an OSF-grade pre-registration. Lock hypotheses, sampling, exclusion rules, primary and secondary analyses, robustness checks, and a transparent deviation log template.",
    },
    {
      num: "240",
      title: "Responsible AI Research Reviewer",
      badge: "advanced",
      useCase:
        "Audit your study for bias, fairness, dual-use risk and societal impact before submission.",
      vars: ["STUDY", "DATASET", "MODEL_OR_METHOD", "DEPLOYMENT_CONTEXT"],
      frameworks:
        "NIST AI RMF; EU AI Act risk tiers; Datasheets for Datasets; Model Cards; Stochastic parrots critique",
      output:
        "Responsible-AI audit with risk register, fairness metrics, mitigation plan, and a dual-use impact statement ready for ethics review.",
      tip: "Name affected populations explicitly — generic 'users' framing hides the most serious harms.",
      prompt:
        "You are a Responsible AI Research Reviewer. For study [STUDY] using dataset [DATASET] and method [MODEL_OR_METHOD] in deployment context [DEPLOYMENT_CONTEXT], audit for bias, fairness, privacy, dual-use, and societal harm. Produce a risk register, mitigation plan, model card, and an ethics-board-ready impact statement.",
    },
    {
      num: "241",
      title: "Cross-Disciplinary Bridge Builder",
      badge: "intermediate",
      useCase:
        "Translate concepts, methods and notation between fields so collaborators on different teams stay aligned.",
      vars: ["FIELD_A", "FIELD_B", "SHARED_PROBLEM"],
      frameworks:
        "Boundary objects; Trading zones; Concept mapping; Glossary harmonisation",
      output:
        "Bilingual concept map with shared glossary, method-equivalence table, and a one-page brief each side can hand to their PI.",
      tip: "Start by listing the three terms each field uses differently — that is where collaborations actually break.",
      prompt:
        "You are a Cross-Disciplinary Bridge Builder. Between [FIELD_A] and [FIELD_B], working on shared problem [SHARED_PROBLEM], create a bilingual glossary, map equivalent methods, surface conflicting assumptions, and produce a one-page brief each discipline can use to align objectives, terminology, and success criteria.",
    },
    {
      num: "242",
      title: "Conference Talk and Keynote Architect",
      badge: "intermediate",
      useCase:
        "Convert dense research into a memorable 15-minute talk with one big idea, three supporting acts and a clear call to action.",
      vars: ["RESEARCH", "AUDIENCE", "DURATION", "VENUE"],
      frameworks:
        "Three-act structure; Pyramid principle; Assertion-Evidence slides; Story spine; Q&A handling",
      output:
        "Talk outline with hook, narrative arc, slide-by-slide notes, anticipated Q&A and a polished closing call to action.",
      tip: "Open with the single sentence you want the audience to remember tomorrow — then earn it backwards.",
      prompt:
        "You are a Conference Talk Architect. For research [RESEARCH], audience [AUDIENCE], duration [DURATION], venue [VENUE], craft a memorable talk: one-line core message, three-act narrative, assertion-evidence slide outline, transitions, anticipated Q&A, and a closing call to action that drives citations and collaboration.",
    },
    {
      num: "243",
      title: "Academic Brand and Visibility Strategist",
      badge: "intermediate",
      useCase:
        "Build a coherent online scholarly presence across Google Scholar, ORCID, ResearchGate and LinkedIn.",
      vars: ["CAREER_STAGE", "FIELD", "GOALS", "TIME_BUDGET"],
      frameworks:
        "Personal brand canvas; H-index hygiene; Altmetrics; Content cadence; Profile-platform fit",
      output:
        "12-week visibility plan with profile-by-profile checklist, content calendar and metrics to track impact responsibly.",
      tip: "Pick two platforms to do well rather than five mediocre — discoverability beats noise.",
      prompt:
        "You are an Academic Brand Strategist. For a researcher at [CAREER_STAGE] in [FIELD] with goals [GOALS] and weekly time budget [TIME_BUDGET], design a 12-week visibility plan: profile audit (Scholar, ORCID, LinkedIn, ResearchGate), content cadence, talk and review opportunities, network expansion, and ethical impact metrics.",
    },
    {
      num: "244",
      title: "PhD Wellbeing and Sustainable Pace Coach",
      badge: "foundational",
      useCase:
        "Build a humane weekly cadence that protects deep work, recovery and relationships through a multi-year program.",
      vars: ["CURRENT_LOAD", "PEAK_HOURS", "CONSTRAINTS", "SUPPORT_SYSTEM"],
      frameworks:
        "Energy management; Deep Work; Pomodoro and timeboxing; Burnout-prevention checklists; Imposter-syndrome reframing",
      output:
        "Weekly template with deep-work blocks, recovery rituals, social anchors, and a quarterly check-in to recalibrate.",
      tip: "Schedule rest before output — calendars without recovery blocks always overrun.",
      prompt:
        "You are a PhD Wellbeing Coach. For a researcher with current load [CURRENT_LOAD], peak hours [PEAK_HOURS], constraints [CONSTRAINTS], and support [SUPPORT_SYSTEM], design a sustainable weekly cadence with deep-work blocks, recovery rituals, social anchors, burnout early-warning signs, and a quarterly recalibration ritual.",
    },
  ],
};

export const phdSections: PhdSection[] = [...baseSections, bonusSection];

const generalIds = Array.from({ length: 22 }, (_, i) => `s${i + 1}`);
const phdIds = Array.from({ length: 7 }, (_, i) => `s${i + 23}`);
const methodIds = Array.from({ length: 10 }, (_, i) => `s${i + 30}`);

export const sectionGroups: SectionGroup[] = [
  {
    key: "general",
    label: "General & Academic",
    accent: "#C8A240",
    sectionIds: generalIds,
  },
  { key: "phd", label: "PhD Exclusive", accent: "#8BB4E0", sectionIds: phdIds },
  {
    key: "methods",
    label: "Research Methods",
    accent: "#FB923C",
    sectionIds: methodIds,
  },
  {
    key: "bonus",
    label: "KR Bonus",
    accent: "#F59E0B",
    sectionIds: ["s40"],
  },
];

export const sectionsById: Record<string, PhdSection> = Object.fromEntries(
  phdSections.map((s) => [s.id, s]),
);

export const totalPromptCount = phdSections.reduce(
  (n, s) => n + s.prompts.length,
  0,
);
export const totalDomainCount = phdSections.length;
export const phdExclusiveCount = phdIds.reduce(
  (n, id) => n + (sectionsById[id]?.prompts.length ?? 0),
  0,
);
export const researchMethodsCount = methodIds.reduce(
  (n, id) => n + (sectionsById[id]?.prompts.length ?? 0),
  0,
);

export interface FlatPrompt extends PhdPrompt {
  sectionId: string;
  sectionLabel: string;
  sectionIcon: string;
  sectionColor: string;
  groupKey: SectionGroupKey;
}

const idToGroup: Record<string, SectionGroupKey> = {};
for (const g of sectionGroups) for (const id of g.sectionIds) idToGroup[id] = g.key;

export const allPrompts: FlatPrompt[] = phdSections.flatMap((s) =>
  s.prompts.map((p) => ({
    ...p,
    sectionId: s.id,
    sectionLabel: s.label,
    sectionIcon: s.icon,
    sectionColor: s.colorHex,
    groupKey: idToGroup[s.id] ?? "general",
  })),
);
