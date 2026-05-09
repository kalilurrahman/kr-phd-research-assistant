import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { FlatPrompt } from "@/data/phd-sections";

/** Floating "Suggest a Prompt" CTA — keyword search-based fallback. */
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
  const [results, setResults] = useState<FlatPrompt[]>([]);

  const submit = () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const tokens = q.split(/\s+/).filter((t) => t.length > 2);
    const ranked = flatPrompts
      .map((p) => {
        const hay = `${p.title} ${p.useCase} ${p.sectionLabel} ${p.frameworks}`.toLowerCase();
        let score = 0;
        for (const t of tokens) if (hay.includes(t)) score += 1;
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.p);
    setResults(ranked);
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
          <div className="p-6 space-y-4">
            <h2 className="font-display text-xl font-bold">
              What are you working on right now?
            </h2>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I'm stuck writing my methodology chapter"
              className="w-full text-sm px-3 py-2 rounded-md bg-background border border-border focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={submit}
              className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md"
            >
              <Sparkles className="w-3.5 h-3.5" /> Suggest 3 prompts
            </button>

            {results.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h3 className="text-xs uppercase tracking-wider text-primary font-mono">
                  Suggested
                </h3>
                {results.map((p) => (
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
