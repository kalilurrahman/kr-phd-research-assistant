import { useCallback, useEffect, useState } from "react";

/**
 * Local-only user state — favorites, recent searches, and recently
 * viewed prompt IDs. Persisted to localStorage. SSR-safe.
 */

const FAV_KEY = "kr-phd:favorites:v1";
const SEARCH_KEY = "kr-phd:recent-searches:v1";
const VIEW_KEY = "kr-phd:recent-views:v1";
const MAX_HISTORY = 25;

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
    // Notify other hook instances in the same tab.
    window.dispatchEvent(new CustomEvent("kr-phd:storage", { detail: { key } }));
  } catch {
    /* quota / private mode */
  }
}

function useLocalState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJson<T>(key, initial));

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string }>).detail;
      if (!detail || detail.key === key) {
        setValue(readJson<T>(key, initial));
      }
    };
    window.addEventListener("kr-phd:storage", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("kr-phd:storage", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [key, initial]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeJson(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}

export interface RecentSearch {
  query: string;
  at: number;
}

export interface RecentView {
  num: string;
  at: number;
}

const EMPTY_FAVS: string[] = [];
const EMPTY_SEARCH: RecentSearch[] = [];
const EMPTY_VIEW: RecentView[] = [];

export function useFavorites() {
  const [ids, setIds] = useLocalState<string[]>(FAV_KEY, EMPTY_FAVS);
  const isFavorite = useCallback((num: string) => ids.includes(num), [ids]);
  const toggle = useCallback(
    (num: string) =>
      setIds((prev) =>
        prev.includes(num) ? prev.filter((x) => x !== num) : [num, ...prev],
      ),
    [setIds],
  );
  const clear = useCallback(() => setIds([]), [setIds]);
  return { ids, isFavorite, toggle, clear };
}

export function useRecentSearches() {
  const [list, setList] = useLocalState<RecentSearch[]>(
    SEARCH_KEY,
    EMPTY_SEARCH,
  );
  const record = useCallback(
    (query: string) => {
      const q = query.trim();
      if (q.length < 2) return;
      setList((prev) => {
        const next = [
          { query: q, at: Date.now() },
          ...prev.filter((r) => r.query.toLowerCase() !== q.toLowerCase()),
        ];
        return next.slice(0, MAX_HISTORY);
      });
    },
    [setList],
  );
  const clear = useCallback(() => setList([]), [setList]);
  return { list, record, clear };
}

export function useRecentViews() {
  const [list, setList] = useLocalState<RecentView[]>(VIEW_KEY, EMPTY_VIEW);
  const record = useCallback(
    (num: string) => {
      setList((prev) => {
        const next = [
          { num, at: Date.now() },
          ...prev.filter((r) => r.num !== num),
        ];
        return next.slice(0, MAX_HISTORY);
      });
    },
    [setList],
  );
  const clear = useCallback(() => setList([]), [setList]);
  return { list, record, clear };
}

export function useSelection() {
  const [ids, setIds] = useState<string[]>([]);
  const has = useCallback((num: string) => ids.includes(num), [ids]);
  const toggle = useCallback(
    (num: string) =>
      setIds((prev) =>
        prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num],
      ),
    [],
  );
  const setMany = useCallback((nums: string[]) => setIds(nums), []);
  const clear = useCallback(() => setIds([]), []);
  return { ids, has, toggle, setMany, clear };
}
