import { useState } from "react";
import { Download, FileJson, FileText, X, Star, ListChecks } from "lucide-react";
import type { FlatPrompt } from "@/data/phd-sections";
import { exportPromptsAsJson, exportPromptsAsPdf } from "@/lib/export-prompts";

export function ExportBar({
  selectedNums,
  onClear,
  flatPrompts,
  favoriteNums,
}: {
  selectedNums: string[];
  onClear: () => void;
  flatPrompts: FlatPrompt[];
  favoriteNums: string[];
}) {
  const [open, setOpen] = useState(false);
  const hasSelection = selectedNums.length > 0;

  return (
    <>
      {hasSelection && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-full border border-primary/40 bg-card/95 backdrop-blur-md shadow-2xl flex items-center gap-2 max-w-[95vw]">
          <span className="text-xs text-foreground font-mono px-2">
            {selectedNums.length} selected
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-gold text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Clear
          </button>
        </div>
      )}

      <ExportDialog
        open={open}
        onClose={() => setOpen(false)}
        flatPrompts={flatPrompts}
        selectedNums={selectedNums}
        favoriteNums={favoriteNums}
      />
    </>
  );
}

export function ExportLauncher({
  flatPrompts,
  selectedNums,
  favoriteNums,
}: {
  flatPrompts: FlatPrompt[];
  selectedNums: string[];
  favoriteNums: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Export
      </button>
      <ExportDialog
        open={open}
        onClose={() => setOpen(false)}
        flatPrompts={flatPrompts}
        selectedNums={selectedNums}
        favoriteNums={favoriteNums}
      />
    </>
  );
}

type Scope = "selected" | "favorites" | "all";

function ExportDialog({
  open,
  onClose,
  flatPrompts,
  selectedNums,
  favoriteNums,
}: {
  open: boolean;
  onClose: () => void;
  flatPrompts: FlatPrompt[];
  selectedNums: string[];
  favoriteNums: string[];
}) {
  const [scope, setScope] = useState<Scope>(
    selectedNums.length > 0 ? "selected" : "all",
  );

  if (!open) return null;

  const resolvePrompts = (): FlatPrompt[] => {
    const byNum = new Map(flatPrompts.map((p) => [p.num, p]));
    if (scope === "selected") {
      return selectedNums
        .map((n) => byNum.get(n))
        .filter((p): p is FlatPrompt => Boolean(p));
    }
    if (scope === "favorites") {
      return favoriteNums
        .map((n) => byNum.get(n))
        .filter((p): p is FlatPrompt => Boolean(p));
    }
    return flatPrompts;
  };

  const scopeLabel = (): string =>
    scope === "selected"
      ? "Selected"
      : scope === "favorites"
        ? "Favorites"
        : "Full library";

  const handle = (kind: "json" | "pdf") => {
    const list = resolvePrompts();
    if (list.length === 0) return;
    if (kind === "json") exportPromptsAsJson(list, scopeLabel());
    else exportPromptsAsPdf(list, scopeLabel());
    onClose();
  };

  const counts: Record<Scope, number> = {
    selected: selectedNums.length,
    favorites: favoriteNums.length,
    all: flatPrompts.length,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: "3px solid hsl(var(--primary))" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Export prompts
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Download a curated bundle as JSON or a branded PDF report.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-primary font-mono">
              Scope
            </p>
            <ScopeOption
              icon={<ListChecks className="w-4 h-4" />}
              label="Selected prompts"
              count={counts.selected}
              active={scope === "selected"}
              onClick={() => setScope("selected")}
              disabled={counts.selected === 0}
            />
            <ScopeOption
              icon={<Star className="w-4 h-4" />}
              label="Favorites"
              count={counts.favorites}
              active={scope === "favorites"}
              onClick={() => setScope("favorites")}
              disabled={counts.favorites === 0}
            />
            <ScopeOption
              icon={<Download className="w-4 h-4" />}
              label="Entire library"
              count={counts.all}
              active={scope === "all"}
              onClick={() => setScope("all")}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-primary font-mono">
              Format
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handle("json")}
                disabled={counts[scope] === 0}
                className="rounded-lg border border-border hover:border-primary p-3 text-left flex flex-col gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <FileJson className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">JSON</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Machine-readable, full fields
                </span>
              </button>
              <button
                type="button"
                onClick={() => handle("pdf")}
                disabled={counts[scope] === 0}
                className="rounded-lg border border-border hover:border-primary p-3 text-left flex flex-col gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">PDF report</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Branded, A4, with disclaimer
                </span>
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            AI content notice: prompts are AI-augmented references, not
            authoritative outputs. Review with qualified human experts before
            professional use.
          </p>
        </div>
      </div>
    </div>
  );
}

function ScopeOption({
  icon,
  label,
  count,
  active,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-mono text-xs">{count}</span>
    </button>
  );
}
