import { Sparkles } from "lucide-react";
import type { FlatPrompt } from "@/data/phd-sections";

export function StartingTenStrip({
  prompts,
  onOpen,
  stage,
}: {
  prompts: FlatPrompt[];
  onOpen: (p: FlatPrompt) => void;
  stage: string;
}) {
  if (prompts.length === 0) return null;
  return (
    <section className="border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-display text-sm font-bold text-foreground">
            Your Starting 10
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Tailored to {stage}
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {prompts.map((p) => (
            <button
              key={p.num}
              type="button"
              onClick={() => onOpen(p)}
              className="snap-start shrink-0 w-64 text-left rounded-lg border border-border bg-card hover:border-primary hover:bg-card/80 transition-all p-3 flex flex-col gap-1.5"
              style={{ borderTop: `2px solid ${p.sectionColor}` }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    color: p.sectionColor,
                    background: `${p.sectionColor}14`,
                  }}
                >
                  #{p.num}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {p.sectionIcon} {p.sectionLabel}
                </span>
              </div>
              <div className="font-display text-sm font-semibold leading-snug line-clamp-2">
                {p.title}
              </div>
              <div className="text-[11px] text-muted-foreground line-clamp-2">
                {p.useCase}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
