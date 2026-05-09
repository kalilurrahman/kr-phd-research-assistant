import type { FlatPrompt } from "@/data/phd-sections";
import type { PhdProfile } from "@/lib/usage-tracker";

const CHALLENGE_KEYWORDS: Record<string, string[]> = {
  "Literature Review": ["literature", "review", "systematic", "prisma", "search"],
  Methodology: ["method", "research design", "qualitative", "quantitative", "mixed"],
  "Academic Writing": ["writing", "academic", "style", "argument", "paragraph"],
  "Dissertation Chapters": ["dissertation", "thesis", "chapter", "abstract"],
  "Viva Preparation": ["viva", "defense", "defence", "examination"],
  "Grant Writing": ["grant", "funding", "proposal", "fellowship"],
  Publishing: ["publish", "journal", "paper", "submission", "peer review"],
  "Mental Health & Wellbeing": ["wellbeing", "mental", "wellness", "burnout", "balance"],
  "Career & Job Market": ["career", "job", "market", "academia", "postdoc", "industry"],
};

const STAGE_KEYWORDS: Record<string, string[]> = {
  "Year 1 – Foundations": ["foundation", "start", "topic", "supervisor", "literature"],
  "Year 2 – Deep Research": ["method", "data", "analysis", "ethics"],
  "Year 3 – Writing Up": ["writing", "chapter", "thesis", "draft"],
  "Year 4+ / Submission": ["submission", "viva", "thesis", "defense"],
  "Postdoc / Early Career": ["postdoc", "career", "fellowship", "grant"],
  "Academic Staff / Supervisor": ["supervision", "mentorship", "lab", "teaching"],
};

function scorePrompt(p: FlatPrompt, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const hay = `${p.title} ${p.useCase} ${p.sectionLabel}`.toLowerCase();
  let score = 0;
  for (const k of keywords) if (hay.includes(k)) score += 1;
  return score;
}

export function pickStartingTen(
  profile: PhdProfile,
  flatPrompts: FlatPrompt[],
): FlatPrompt[] {
  const stageKw = STAGE_KEYWORDS[profile.stage] ?? [];
  const challengeKw = profile.challenges.flatMap(
    (c) => CHALLENGE_KEYWORDS[c] ?? [],
  );
  const ranked = flatPrompts
    .map((p) => ({
      p,
      score: scorePrompt(p, challengeKw) * 2 + scorePrompt(p, stageKw),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length >= 10) return ranked.slice(0, 10).map((r) => r.p);
  
  const used = new Set(ranked.map((r) => r.p.num));
  const fillers = flatPrompts.filter((p) => !used.has(p.num));
  return [...ranked.map((r) => r.p), ...fillers].slice(0, 10);
}
