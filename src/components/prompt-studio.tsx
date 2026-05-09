import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FlatPrompt } from "@/data/phd-sections";
import {
  extractTokens,
  getFilledPrompts,
  humaniseToken,
  interpolatePrompt,
  logUsage,
  saveFilledPrompt,
} from "@/lib/usage-tracker";

const badgeStyles: Record<string, string> = {
  advanced:
    "bg-[hsla(0,72%,55%,0.12)] text-[#FC8181] border-[hsla(0,72%,55%,0.32)]",
  intermediate:
    "bg-[hsla(43,90%,55%,0.12)] text-[#FCD34D] border-[hsla(43,90%,55%,0.32)]",
  foundational:
    "bg-[hsla(150,60%,45%,0.12)] text-[#6EE7B7] border-[hsla(150,60%,45%,0.32)]",
};

export function PromptStudio({
  prompt,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  prompt: FlatPrompt | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const tokens = useMemo(
    () => (prompt ? extractTokens(prompt.prompt) : []),
    [prompt],
  );
  const [values, setValues] = useState<Record<string, string>>({});

  // Hydrate previously filled values when the prompt changes.
  useEffect(() => {
    if (!prompt) return;
    const all = getFilledPrompts();
    setValues(all[prompt.num] ?? {});
    logUsage({
      promptId: prompt.num,
      domainId: prompt.sectionId,
      action: "view",
    });
  }, [prompt]);

  // Persist on change (debounced).
  useEffect(() => {
    if (!prompt) return;
    const id = window.setTimeout(() => saveFilledPrompt(prompt.num, values), 400);
    return () => window.clearTimeout(id);
  }, [values, prompt]);

  if (!prompt) return null;

  const completed = interpolatePrompt(prompt.prompt, values);

  const renderedPreview = (() => {
    const parts: Array<{ kind: "text" | "filled" | "empty"; text: string }> = [];
    const re = /\[([A-Z_0-9]+)\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(prompt.prompt)) !== null) {
      if (m.index > last)
        parts.push({ kind: "text", text: prompt.prompt.slice(last, m.index) });
      const token = m[1];
      const v = values[token];
      if (v && v.trim()) parts.push({ kind: "filled", text: v });
      else parts.push({ kind: "empty", text: `[${token}]` });
      last = m.index + m[0].length;
    }
    if (last < prompt.prompt.length)
      parts.push({ kind: "text", text: prompt.prompt.slice(last) });
    return parts;
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(completed);
      logUsage({
        promptId: prompt.num,
        domainId: prompt.sectionId,
        action: "copy",
      });
      toast.success("Copied completed prompt to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleOpenInClaude = () => {
    logUsage({
      promptId: prompt.num,
      domainId: prompt.sectionId,
      action: "open_in_claude",
    });
    const url = `https://claude.ai/new?q=${encodeURIComponent(completed)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening Claude in a new tab");
  };

  const colour = prompt.sectionColor;

  return (
    <Dialog open={Boolean(prompt)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-5xl w-[95vw] max-h-[92vh] overflow-hidden p-0 gap-0 bg-card"
        style={{ borderTop: `3px solid ${colour}` }}
      >
        <DialogHeader className="px-6 pt-6 pb-3 space-y-2 text-left">
          <div className="flex items-center gap-2 flex-wrap pr-10">
            <span
              className="font-mono text-[10px] px-2 py-0.5 rounded-md border"
              style={{
                color: colour,
                borderColor: `${colour}55`,
                background: `${colour}14`,
              }}
            >
              #{prompt.num}
            </span>
            <span
              className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                badgeStyles[prompt.badge] ?? badgeStyles.intermediate
              }`}
            >
              {prompt.badge}
            </span>
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <span style={{ color: colour }}>{prompt.sectionIcon}</span>
              {prompt.sectionLabel}
            </span>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`ml-auto p-1.5 rounded-md border ${
                  isFavorite
                    ? "border-[hsl(43,52%,54%)] bg-[hsl(43,52%,54%)]/15 text-[hsl(43,70%,66%)]"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                aria-label={isFavorite ? "Unfavorite" : "Favorite"}
              >
                <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
              </button>
            )}
          </div>
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold leading-tight">
            {prompt.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prompt.useCase}
          </p>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-0 border-t border-border max-h-[68vh]">
          {/* Inputs */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto border-b lg:border-b-0 lg:border-r border-border">
            <h3 className="font-display text-xs uppercase tracking-wider text-primary">
              Fill in your details
            </h3>
            {tokens.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                This prompt has no placeholders — copy directly.
              </p>
            )}
            {tokens.map((tok) => (
              <label key={tok} className="block space-y-1">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  {humaniseToken(tok)}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{tok}]
                  </span>
                </span>
                <textarea
                  rows={2}
                  value={values[tok] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [tok]: e.target.value }))
                  }
                  placeholder={`e.g. your ${humaniseToken(tok).toLowerCase()}…`}
                  className="w-full text-sm px-3 py-2 rounded-md bg-background border border-border focus:border-primary focus:outline-none placeholder:text-muted-foreground/60 resize-y"
                />
              </label>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-gold inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-md"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Completed Prompt
              </button>
              <button
                type="button"
                onClick={handleOpenInClaude}
                className="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-md border border-primary/40 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in Claude
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="p-5 sm:p-6 space-y-3 overflow-y-auto bg-background/40">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-xs uppercase tracking-wider text-primary">
                Live preview
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">
                {tokens.filter((t) => values[t]?.trim()).length}/{tokens.length} filled
              </span>
            </div>
            <pre className="font-mono text-[12px] leading-relaxed bg-background/70 border border-border rounded-lg p-4 whitespace-pre-wrap break-words text-foreground/90">
              {renderedPreview.map((p, i) => {
                if (p.kind === "text") return <span key={i}>{p.text}</span>;
                if (p.kind === "filled")
                  return (
                    <span
                      key={i}
                      className="bg-emerald-500/15 text-emerald-300 dark:text-emerald-300 px-0.5 rounded"
                    >
                      {p.text}
                    </span>
                  );
                return (
                  <span
                    key={i}
                    className="bg-amber-500/15 text-amber-400 px-0.5 rounded font-semibold"
                  >
                    {p.text}
                  </span>
                );
              })}
            </pre>

            {prompt.frameworks && (
              <MetaBlock label="Frameworks" body={prompt.frameworks} />
            )}
            {prompt.output && <MetaBlock label="Output" body={prompt.output} />}
            {prompt.tip && (
              <MetaBlock label="Pro tip" body={prompt.tip} accent={colour} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaBlock({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent?: string;
}) {
  return (
    <div>
      <div
        className="font-display text-[10px] uppercase tracking-wider mb-1"
        style={{ color: accent ?? "hsl(var(--primary))" }}
      >
        {label}
      </div>
      <p className="text-xs text-foreground/85 leading-relaxed">{body}</p>
    </div>
  );
}
