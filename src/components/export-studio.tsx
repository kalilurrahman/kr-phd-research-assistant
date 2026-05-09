import { useMemo, useState } from "react";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FlatPrompt } from "@/data/phd-sections";
import { exportPromptsAsJson } from "@/lib/export-prompts";
import { generateBrandedPdf } from "@/lib/branded-pdf";
import {
  extractTokens,
  getFilledPrompts,
  humaniseToken,
  saveFilledPrompt,
} from "@/lib/usage-tracker";

type Scope = "selected" | "favorites" | "all";

export function ExportStudio({
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
    selectedNums.length > 0 ? "selected" : favoriteNums.length > 0 ? "favorites" : "all",
  );

  const resolved = useMemo(() => {
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
  }, [scope, flatPrompts, selectedNums, favoriteNums]);

  const scopeLabel =
    scope === "selected" ? "Selected" : scope === "favorites" ? "Favorites" : "Full library";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[92vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 text-left">
          <DialogTitle className="font-display text-xl font-bold">
            Export Studio
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Curate a JSON bundle or a fully branded PDF report.
          </p>
        </DialogHeader>

        <div className="px-6 pb-3 flex flex-wrap gap-2">
          <ScopePill
            label={`Selected (${selectedNums.length})`}
            active={scope === "selected"}
            disabled={selectedNums.length === 0}
            onClick={() => setScope("selected")}
          />
          <ScopePill
            label={`Favorites (${favoriteNums.length})`}
            active={scope === "favorites"}
            disabled={favoriteNums.length === 0}
            onClick={() => setScope("favorites")}
          />
          <ScopePill
            label={`Entire library (${flatPrompts.length})`}
            active={scope === "all"}
            onClick={() => setScope("all")}
          />
        </div>

        <Tabs defaultValue="pdf" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6">
            <TabsTrigger value="json" className="gap-1.5">
              <FileJson className="w-3.5 h-3.5" /> JSON Export
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Branded PDF Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="px-6 pb-6 pt-2 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-3">
              Machine-readable bundle with full prompt metadata.
            </p>
            <button
              type="button"
              disabled={resolved.length === 0}
              onClick={() => {
                exportPromptsAsJson(resolved, scopeLabel);
                toast.success(`Exported ${resolved.length} prompts as JSON`);
                onClose();
              }}
              className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Download JSON ({resolved.length})
            </button>
          </TabsContent>

          <TabsContent value="pdf" className="overflow-y-auto px-6 pb-6 pt-2">
            <BrandedPdfTab prompts={resolved} onClose={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ScopePill({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

function BrandedPdfTab({
  prompts,
  onClose,
}: {
  prompts: FlatPrompt[];
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [scholar, setScholar] = useState("");
  const [institution, setInstitution] = useState("");
  const [research, setResearch] = useState("");
  const [tagline, setTagline] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filled, setFilled] = useState<Record<string, Record<string, string>>>(
    () => getFilledPrompts(),
  );
  const [progress, setProgress] = useState<number | null>(null);

  const updateFilled = (num: string, token: string, value: string) => {
    setFilled((all) => {
      const next = { ...all, [num]: { ...(all[num] ?? {}), [token]: value } };
      saveFilledPrompt(num, next[num]);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (prompts.length === 0) return;
    setProgress(0);
    try {
      await generateBrandedPdf({
        scholarName: scholar,
        institution,
        researchTitle: research,
        tagline,
        prompts,
        filledValues: filled,
        personalNotes: notes,
        onProgress: (p) => setProgress(p),
      });
      toast.success("PDF generated and downloaded");
      setProgress(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
      setProgress(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Scholar Name" value={scholar} onChange={setScholar} />
        <Field label="University / Institution" value={institution} onChange={setInstitution} />
        <Field label="Research Title" value={research} onChange={setResearch} />
        <Field label="Export Date" value={today} onChange={() => undefined} disabled />
        <Field
          label="Tagline (optional)"
          value={tagline}
          onChange={setTagline}
          placeholder="Think rigorously. Write brilliantly."
          full
        />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-primary font-mono mb-2">
          Prompts in this export ({prompts.length})
        </h3>
        {prompts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No prompts in this scope.
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-1">
            {prompts.map((p) => {
              const tokens = extractTokens(p.prompt);
              const v = filled[p.num] ?? {};
              const filledCount = tokens.filter((t) => v[t]?.trim()).length;
              return (
                <AccordionItem key={p.num} value={p.num} className="border-border">
                  <AccordionTrigger className="text-sm hover:no-underline py-2">
                    <span className="flex items-center gap-2 text-left">
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          color: p.sectionColor,
                          background: `${p.sectionColor}14`,
                        }}
                      >
                        #{p.num}
                      </span>
                      <span className="line-clamp-1">{p.title}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto pr-2">
                        {filledCount}/{tokens.length}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4">
                    {tokens.map((tok) => (
                      <label key={tok} className="block space-y-1">
                        <span className="text-[11px] font-semibold flex items-center gap-1.5">
                          {humaniseToken(tok)}
                          <span className="font-mono text-[10px] text-muted-foreground">
                            [{tok}]
                          </span>
                        </span>
                        <input
                          type="text"
                          value={v[tok] ?? ""}
                          onChange={(e) => updateFilled(p.num, tok, e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded bg-background border border-border focus:border-primary focus:outline-none"
                        />
                      </label>
                    ))}
                    <label className="block space-y-1">
                      <span className="text-[11px] font-semibold">
                        Personal note
                      </span>
                      <textarea
                        rows={2}
                        value={notes[p.num] ?? ""}
                        onChange={(e) =>
                          setNotes((n) => ({ ...n, [p.num]: e.target.value }))
                        }
                        placeholder="e.g. Used for Chapter 3 methodology"
                        className="w-full text-xs px-2 py-1.5 rounded bg-background border border-border focus:border-primary focus:outline-none"
                      />
                    </label>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={progress !== null || prompts.length === 0}
          className="btn-gold inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md disabled:opacity-40"
        >
          {progress === null ? (
            <>
              <Download className="w-3.5 h-3.5" /> Generate PDF
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating… {progress}%
            </>
          )}
        </button>
        {progress !== null && (
          <div className="flex-1 h-1.5 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <label className={`block space-y-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full text-sm px-3 py-2 rounded-md bg-background border border-border focus:border-primary focus:outline-none disabled:opacity-60"
      />
    </label>
  );
}
