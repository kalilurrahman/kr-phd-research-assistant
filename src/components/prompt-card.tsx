import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import type { FlatPrompt } from "@/data/phd-sections";

const badgeStyles: Record<string, string> = {
  advanced: "bg-[hsla(0,72%,55%,0.12)] text-[#FC8181] border-[hsla(0,72%,55%,0.32)]",
  intermediate:
    "bg-[hsla(43,90%,55%,0.12)] text-[#FCD34D] border-[hsla(43,90%,55%,0.32)]",
  foundational:
    "bg-[hsla(150,60%,45%,0.12)] text-[#6EE7B7] border-[hsla(150,60%,45%,0.32)]",
};

export function PromptCard({
  prompt,
  onOpen,
}: {
  prompt: FlatPrompt;
  onOpen: () => void;
}) {
  const colour = prompt.sectionColor;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left group rounded-xl border border-border bg-card hover:bg-card/80 transition-all p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]"
      style={{ borderTop: `2px solid ${colour}` }}
    >
      <div className="flex items-center justify-between gap-2">
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
      </div>
      <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
        {prompt.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
        {prompt.useCase}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {prompt.vars.slice(0, 3).map((v) => (
          <span
            key={v}
            className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border text-muted-foreground"
          >
            [{v}]
          </span>
        ))}
        {prompt.vars.length > 3 && (
          <span className="font-mono text-[10px] text-muted-foreground self-center">
            +{prompt.vars.length - 3}
          </span>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground/80 pt-1 inline-flex items-center gap-1">
        <span style={{ color: colour }}>{prompt.sectionIcon}</span>
        <span className="truncate">{prompt.sectionLabel}</span>
      </div>
    </button>
  );
}

export function PromptModal({
  prompt,
  onClose,
}: {
  prompt: FlatPrompt | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!prompt) return null;
  const colour = prompt.sectionColor;

  const copy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl my-8"
        style={{ borderTop: `3px solid ${colour}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
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
            <span
              className="text-[11px] text-muted-foreground inline-flex items-center gap-1"
            >
              <span style={{ color: colour }}>{prompt.sectionIcon}</span>
              {prompt.sectionLabel}
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
            {prompt.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {prompt.useCase}
          </p>

          <Section label="Frameworks" body={prompt.frameworks} />
          <Section label="Output" body={prompt.output} />
          <Section label="Pro tip" body={prompt.tip} accent={colour} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm uppercase tracking-wider text-primary">
                Prompt
              </h3>
              <button
                type="button"
                onClick={copy}
                className="btn-gold inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy prompt
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-[12px] leading-relaxed bg-background/70 border border-border rounded-lg p-4 whitespace-pre-wrap break-words text-foreground/90">
              {prompt.prompt}
            </pre>
          </div>

          {prompt.vars.length > 0 && (
            <div>
              <h3 className="font-display text-sm uppercase tracking-wider text-primary mb-2">
                Variables to fill in
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {prompt.vars.map((v) => (
                  <span
                    key={v}
                    className="font-mono text-[11px] px-2 py-1 rounded bg-background/60 border border-border text-foreground"
                  >
                    [{v}]
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
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
      <h3
        className="font-display text-sm uppercase tracking-wider mb-1"
        style={{ color: accent ?? "hsl(var(--primary))" }}
      >
        {label}
      </h3>
      <p className="text-sm text-foreground/85 leading-relaxed">{body}</p>
    </div>
  );
}
