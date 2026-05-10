import { useState } from "react";
import { Sparkles, X, Loader2, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { FlatPrompt } from "@/data/phd-sections";
import { semanticSuggestPrompts } from "@/lib/ai-search.functions";

interface Suggestion {
  prompt: FlatPrompt;
  reason?: string;
}

/** Floating "Suggest a Prompt" CTA — Claude semantic search + keyword fallback. */
export function SuggestPromptFab({
  flatPrompts,
  visible,
  onOpenPrompt,
}: {
  flatPrompts: FlatPrompt[];
  visible: boolean;
  onOpenPrompt: (p: FlatPrompt) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const aiSearch = useServerFn(semanticSuggestPrompts);

  const keywordRank = (q: string): FlatPrompt[] => {
    const tokens = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    return flatPrompts
      .map((p) => {
        const hay =
          `${p.title} ${p.useCase} ${p.sectionLabel} ${p.frameworks}`.toLowerCase();
        let score = 0;
        for (const t of tokens) if (hay.includes(t)) score += 1;
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.p);
  };

  const submit = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setInfo(null);
    setResults([]);

    // Pre-filter candidates using keyword scoring to keep payload small.
    const keywordTop = keywordRank(q);
    const candidates = (keywordTop.length >= 8 ? keywordTop : flatPrompts).slice(0, 50);

    try {
      const res = await aiSearch({
        data: {
          query: q,
          candidates: candidates.map((c) => ({
            num: c.num,
            title: c.title,
            useCase: c.useCase,
            sectionLabel: c.sectionLabel,
            frameworks: c.frameworks,
          })),
        },
      });

      if (res.picks.length > 0) {
        const byNum = new Map(flatPrompts.map((p) => [p.num, p]));
        const mapped: Suggestion[] = res.picks.flatMap((pk) => {
          const prompt = byNum.get(pk.num);
          return prompt ? [{ prompt, reason: pk.reason }] : [];
        });
        if (mapped.length > 0) {
          setResults(mapped);
          setInfo(`Ranked by Claude · ${res.model}`);
          setLoading(false);
          return;
        }
      }
      // Fallback if AI returned nothing useful.
      const fallback = (keywordTop.length ? keywordTop : flatPrompts).slice(0, 5);
      setResults(fallback.map((p) => ({ prompt: p })));
      setInfo(res.error ? `Keyword fallback (${res.error})` : "Keyword fallback");
    } catch (e) {
      const fallback = (keywordTop.length ? keywordTop : flatPrompts).slice(0, 5);
      setResults(fallback.map((p) => ({ prompt: p })));
      setInfo(`Keyword fallback (${(e as Error).message})`);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Suggest a prompt"
        className="fixed bottom-20 right-4 z-30 btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-full shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5" /> Suggest a Prompt
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 bg-card">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div>
              <h2 className="font-display text-xl font-bold">
                What are you working on right now?
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1">
                Claude reads your situation and ranks the best-fit prompts.
              </p>
            </div>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I'm stuck framing the methodology chapter for a mixed-methods PhD on remote work…"
              className="w-full text-sm px-3 py-2 rounded-md bg-background border border-border focus:border-primary focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={loading || !query.trim()}
                className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {loading ? "Asking Claude…" : "Suggest 5 prompts"}
              </button>
              {info && (
                <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                  {info.startsWith("Keyword") && (
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                  )}
                  {info}
                </span>
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h3 className="text-xs uppercase tracking-wider text-primary font-mono">
                  Suggested
                </h3>
                {results.map(({ prompt: p, reason }) => (
                  <button
                    key={p.num}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onOpenPrompt(p);
                    }}
                    className="w-full text-left rounded-lg border border-border hover:border-primary p-3 transition-colors"
                    style={{ borderLeft: `3px solid ${p.sectionColor}` }}
                  >
                    <div className="text-[10px] text-muted-foreground">
                      {p.sectionIcon} {p.sectionLabel} · #{p.num}
                    </div>
                    <div className="text-sm font-semibold mt-0.5 line-clamp-2">
                      {p.title}
                    </div>
                    {reason && (
                      <div className="text-[11px] text-primary/80 italic line-clamp-2 mt-1">
                        "{reason}"
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {p.useCase}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
