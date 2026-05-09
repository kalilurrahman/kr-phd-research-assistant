/**
 * Usage tracking + onboarding profile persistence.
 * All localStorage only — no network calls.
 */

export const KEY_USAGE_LOG = "kr_usage_log";
export const KEY_PHD_PROFILE = "kr_phd_profile";
export const KEY_ONBOARDED = "kr_phd_onboarded";
export const KEY_FILLED_PROMPTS = "kr_filled_prompts";
export const KEY_FAVORITES = "kr-phd:favorites:v1";

export type UsageAction = "view" | "copy" | "open_in_claude";

export interface UsageEvent {
  promptId: string;
  domainId: string;
  timestamp: number;
  action: UsageAction;
}

export interface PhdProfile {
  stage: string;
  challenges: string[];
  field: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent("kr-phd:storage", { detail: { key } }),
    );
  } catch {
    /* ignore */
  }
}

export function logUsage(event: Omit<UsageEvent, "timestamp">): void {
  const log = readJson<UsageEvent[]>(KEY_USAGE_LOG, []);
  log.push({ ...event, timestamp: Date.now() });
  // Cap to last 5000 events to avoid bloat.
  if (log.length > 5000) log.splice(0, log.length - 5000);
  writeJson(KEY_USAGE_LOG, log);
}

export function getUsageLog(): UsageEvent[] {
  return readJson<UsageEvent[]>(KEY_USAGE_LOG, []);
}

export function getProfile(): PhdProfile | null {
  return readJson<PhdProfile | null>(KEY_PHD_PROFILE, null);
}

export function setProfile(p: PhdProfile): void {
  writeJson(KEY_PHD_PROFILE, p);
}

export function isOnboarded(): boolean {
  return readJson<boolean>(KEY_ONBOARDED, false);
}

export function setOnboarded(v: boolean): void {
  writeJson(KEY_ONBOARDED, v);
}

export type FilledPrompts = Record<string, Record<string, string>>;

export function getFilledPrompts(): FilledPrompts {
  return readJson<FilledPrompts>(KEY_FILLED_PROMPTS, {});
}

export function saveFilledPrompt(
  promptId: string,
  values: Record<string, string>,
): void {
  const all = getFilledPrompts();
  all[promptId] = values;
  writeJson(KEY_FILLED_PROMPTS, all);
}

export function resetAllUserData(): void {
  if (typeof window === "undefined") return;
  for (const key of [
    KEY_USAGE_LOG,
    KEY_PHD_PROFILE,
    KEY_ONBOARDED,
    KEY_FILLED_PROMPTS,
    KEY_FAVORITES,
  ]) {
    window.localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("kr-phd:storage", { detail: { key } }),
    );
  }
}

export function humaniseToken(token: string): string {
  return token
    .toLowerCase()
    .split("_")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function extractTokens(prompt: string): string[] {
  const re = /\[([A-Z_0-9]+)\]/g;
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(prompt)) !== null) set.add(m[1]);
  return Array.from(set);
}

export function interpolatePrompt(
  prompt: string,
  values: Record<string, string>,
): string {
  return prompt.replace(/\[([A-Z_0-9]+)\]/g, (_, token: string) => {
    const v = values[token];
    return v && v.trim().length > 0 ? v : `[${token}]`;
  });
}

/** Compute consecutive-day open streak ending today. */
export function computeStreak(log: UsageEvent[]): number {
  if (log.length === 0) return 0;
  const days = new Set<string>();
  for (const e of log) {
    const d = new Date(e.timestamp);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  const cur = new Date();
  // If today not present, streak still starts from yesterday backwards? Per spec
  // "increments if at least one prompt is opened per calendar day" — so streak
  // is consecutive days up to today.
  while (true) {
    const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
    if (days.has(key)) {
      streak += 1;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
