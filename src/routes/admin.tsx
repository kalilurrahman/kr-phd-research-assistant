import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Download,
  Upload,
  RotateCcw,
  Pencil,
  X,
} from "lucide-react";
import {
  useAdminOverrides,
  type AdminOverrides,
  type SectionOverride,
  type AddedSection,
} from "@/hooks/use-effective-data";
import { useEffectiveData } from "@/hooks/use-effective-data";
import {
  phdSections as bundledSections,
  type PhdPrompt,
  type PromptBadge,
  type SectionGroupKey,
} from "@/data/phd-sections";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · PhD Research Scholar Prompt Guide" },
      {
        name: "description",
        content:
          "Curate, edit, hide, reorder and add prompts and domains. Local-only changes layered on top of the bundled library.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const GROUPS: { key: SectionGroupKey; label: string }[] = [
  { key: "general", label: "General & Academic" },
  { key: "phd", label: "PhD Exclusive" },
  { key: "methods", label: "Research Methods" },
  { key: "bonus", label: "KR Bonus" },
];

const BADGES: PromptBadge[] = ["foundational", "intermediate", "advanced"];

function AdminPage() {
  const { overrides, setOverrides, reset } = useAdminOverrides();
  const data = useEffectiveData();
  const fileInput = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    sectionId: string;
    prompt?: PhdPrompt;
  } | null>(null);
  const [addingDomain, setAddingDomain] = useState(false);

  const bundledIds = useMemo(
    () => new Set(bundledSections.map((s) => s.id)),
    [],
  );

  const moveSection = (id: string, dir: -1 | 1) => {
    const order = data.sections.map((s) => s.id);
    const idx = order.indexOf(id);
    const next = idx + dir;
    if (next < 0 || next >= order.length) return;
    [order[idx], order[next]] = [order[next], order[idx]];
    setOverrides((prev) => ({ ...prev, sectionOrder: order }));
  };

  const updateSection = (
    sectionId: string,
    patch: Partial<SectionOverride>,
  ) => {
    setOverrides((prev) => {
      const isAdded = !bundledIds.has(sectionId);
      if (isAdded) {
        return {
          ...prev,
          addedSections: prev.addedSections.map((s) =>
            s.id === sectionId
              ? {
                  ...s,
                  label: patch.label ?? s.label,
                  icon: patch.icon ?? s.icon,
                  colorHex: patch.colorHex ?? s.colorHex,
                  groupKey: patch.groupKey ?? s.groupKey,
                }
              : s,
          ),
        };
      }
      const existing = prev.sectionOverrides[sectionId] ?? { id: sectionId };
      return {
        ...prev,
        sectionOverrides: {
          ...prev.sectionOverrides,
          [sectionId]: { ...existing, ...patch, id: sectionId },
        },
      };
    });
  };

  const toggleSectionHidden = (sectionId: string) => {
    if (!bundledIds.has(sectionId)) {
      // Added section — actually delete
      if (!confirm("Delete this custom domain and all its prompts?")) return;
      setOverrides((prev) => ({
        ...prev,
        addedSections: prev.addedSections.filter((s) => s.id !== sectionId),
        sectionOrder: prev.sectionOrder.filter((id) => id !== sectionId),
      }));
      return;
    }
    setOverrides((prev) => {
      const cur = prev.sectionOverrides[sectionId] ?? { id: sectionId };
      return {
        ...prev,
        sectionOverrides: {
          ...prev.sectionOverrides,
          [sectionId]: { ...cur, hidden: !cur.hidden, id: sectionId },
        },
      };
    });
  };

  const togglePromptHidden = (sectionId: string, num: string) => {
    const isAdded = !bundledIds.has(sectionId);
    if (isAdded) {
      if (!confirm("Delete this prompt?")) return;
      setOverrides((prev) => ({
        ...prev,
        addedSections: prev.addedSections.map((s) =>
          s.id === sectionId
            ? { ...s, prompts: s.prompts.filter((p) => p.num !== num) }
            : s,
        ),
      }));
      return;
    }
    setOverrides((prev) => {
      const so = prev.sectionOverrides[sectionId] ?? { id: sectionId };
      const list = so.promptOverrides ?? [];
      const idx = list.findIndex((p) => p.num === num);
      let next;
      if (idx === -1) {
        next = [...list, { num, hidden: true }];
      } else {
        next = list.map((p) =>
          p.num === num ? { ...p, hidden: !p.hidden } : p,
        );
      }
      return {
        ...prev,
        sectionOverrides: {
          ...prev.sectionOverrides,
          [sectionId]: { ...so, promptOverrides: next, id: sectionId },
        },
      };
    });
  };

  const savePromptEdit = (sectionId: string, draft: PhdPrompt) => {
    const isAdded = !bundledIds.has(sectionId);
    setOverrides((prev) => {
      if (isAdded) {
        return {
          ...prev,
          addedSections: prev.addedSections.map((s) => {
            if (s.id !== sectionId) return s;
            const exists = s.prompts.some((p) => p.num === draft.num);
            return {
              ...s,
              prompts: exists
                ? s.prompts.map((p) => (p.num === draft.num ? draft : p))
                : [...s.prompts, draft],
            };
          }),
        };
      }
      const so = prev.sectionOverrides[sectionId] ?? { id: sectionId };
      // If draft.num matches a bundled prompt, store as override; else as added.
      const bundled = bundledSections.find((s) => s.id === sectionId);
      const isBundledPrompt = bundled?.prompts.some((p) => p.num === draft.num);
      if (isBundledPrompt) {
        const list = so.promptOverrides ?? [];
        const exists = list.some((p) => p.num === draft.num);
        const next = exists
          ? list.map((p) =>
              p.num === draft.num ? { ...p, ...draft, hidden: false } : p,
            )
          : [...list, { ...draft, hidden: false }];
        return {
          ...prev,
          sectionOverrides: {
            ...prev.sectionOverrides,
            [sectionId]: { ...so, promptOverrides: next, id: sectionId },
          },
        };
      }
      const added = so.addedPrompts ?? [];
      const exists = added.some((p) => p.num === draft.num);
      const nextAdded = exists
        ? added.map((p) => (p.num === draft.num ? draft : p))
        : [...added, draft];
      return {
        ...prev,
        sectionOverrides: {
          ...prev.sectionOverrides,
          [sectionId]: { ...so, addedPrompts: nextAdded, id: sectionId },
        },
      };
    });
  };

  const addDomain = (draft: AddedSection) => {
    setOverrides((prev) => ({
      ...prev,
      addedSections: [...prev.addedSections, draft],
    }));
  };

  const exportOverrides = () => {
    const blob = new Blob([JSON.stringify(overrides, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `phd-admin-overrides-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importOverrides = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as AdminOverrides;
      if (parsed.version !== 1) throw new Error("Unsupported version");
      setOverrides(parsed);
    } catch (e) {
      alert(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back to library
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importOverrides(f);
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={exportOverrides}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary"
            >
              <Download className="w-3.5 h-3.5" /> Export overrides
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Reset all admin changes? This restores the bundled library.",
                  )
                )
                  reset();
              }}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text">
            Admin · Curate the library
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Add, edit, hide and reorder prompts and domains. Changes are stored
            locally on this device and layered on top of the bundled library —
            export the overrides JSON to share or back them up.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span>Domains: {data.totalDomains}</span>
            <span>·</span>
            <span>Prompts: {data.totalPrompts}</span>
            <span>·</span>
            <span>Custom domains: {overrides.addedSections.length}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAddingDomain(true)}
          className="btn-gold inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm"
        >
          <Plus className="w-4 h-4" /> Add new domain
        </button>

        <div className="space-y-3">
          {data.sections.map((s, idx) => {
            const isAdded = !bundledIds.has(s.id);
            const sectionOv = overrides.sectionOverrides[s.id];
            const isHidden = Boolean(sectionOv?.hidden);
            return (
              <div
                key={s.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
                style={{ borderLeft: `3px solid ${s.colorHex}` }}
              >
                <div className="p-3 flex items-center gap-2 flex-wrap">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={idx === 0}
                      onClick={() => moveSection(s.id, -1)}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={idx === data.sections.length - 1}
                      onClick={() => moveSection(s.id, 1)}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((v) => (v === s.id ? null : s.id))
                    }
                    className="flex-1 text-left flex items-center gap-2 min-w-0"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span
                      className="font-display font-bold text-base truncate"
                      style={{ color: s.colorHex }}
                    >
                      {s.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {s.prompts.length} · {s.id}
                    </span>
                    {isAdded && (
                      <span className="font-mono text-[10px] px-1.5 rounded bg-primary/15 text-primary">
                        custom
                      </span>
                    )}
                    {isHidden && (
                      <span className="font-mono text-[10px] px-1.5 rounded bg-destructive/15 text-destructive">
                        hidden
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        sectionId: s.id,
                        prompt: undefined,
                      })
                    }
                    className="text-xs px-2 py-1 rounded border border-border hover:border-primary inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Prompt
                  </button>
                  <SectionMetaEditor
                    section={s}
                    onSave={(patch) => updateSection(s.id, patch)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSectionHidden(s.id)}
                    className="text-xs px-2 py-1 rounded border border-border hover:border-destructive inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                  >
                    {isAdded ? (
                      <>
                        <Trash2 className="w-3 h-3" /> Delete
                      </>
                    ) : isHidden ? (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    )}
                  </button>
                </div>

                {expanded === s.id && (
                  <div className="border-t border-border bg-background/40 p-3 space-y-1.5 max-h-[420px] overflow-y-auto">
                    {s.prompts.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No prompts.
                      </p>
                    )}
                    {s.prompts.map((p) => {
                      const ov = sectionOv?.promptOverrides?.find(
                        (x) => x.num === p.num,
                      );
                      return (
                        <div
                          key={p.num}
                          className="flex items-center gap-2 px-2 py-1.5 rounded bg-card border border-border/60"
                        >
                          <span className="font-mono text-[10px] text-muted-foreground w-10">
                            #{p.num}
                          </span>
                          <span className="flex-1 truncate text-sm">
                            {p.title}
                          </span>
                          {ov && !ov.hidden && (
                            <span className="font-mono text-[10px] text-primary">
                              edited
                            </span>
                          )}
                          <button
                            type="button"
                            aria-label="Edit prompt"
                            onClick={() =>
                              setEditing({ sectionId: s.id, prompt: p })
                            }
                            className="p-1 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={ov?.hidden ? "Show" : "Hide"}
                            onClick={() => togglePromptHidden(s.id, p.num)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            {ov?.hidden ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : isAdded ? (
                              <Trash2 className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {editing && (
        <PromptEditor
          sectionId={editing.sectionId}
          initial={editing.prompt}
          onClose={() => setEditing(null)}
          onSave={(draft) => {
            savePromptEdit(editing.sectionId, draft);
            setEditing(null);
          }}
        />
      )}

      {addingDomain && (
        <DomainEditor
          onClose={() => setAddingDomain(false)}
          onSave={(d) => {
            addDomain(d);
            setAddingDomain(false);
          }}
        />
      )}
    </div>
  );
}

/* ----------------------------- Section meta editor -------------------------- */

function SectionMetaEditor({
  section,
  onSave,
}: {
  section: { id: string; label: string; icon: string; colorHex: string };
  onSave: (patch: Partial<SectionOverride>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(section.label);
  const [icon, setIcon] = useState(section.icon);
  const [colorHex, setColorHex] = useState(section.colorHex);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setLabel(section.label);
          setIcon(section.icon);
          setColorHex(section.colorHex);
          setOpen(true);
        }}
        className="text-xs px-2 py-1 rounded border border-border hover:border-primary inline-flex items-center gap-1"
      >
        <Pencil className="w-3 h-3" /> Edit
      </button>
      {open && (
        <Modal title={`Edit domain: ${section.label}`} onClose={() => setOpen(false)}>
          <Field label="Label">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="admin-input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Icon (emoji)">
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="admin-input"
                maxLength={4}
              />
            </Field>
            <Field label="Accent colour">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="admin-input h-9 p-1"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs px-3 py-1.5 rounded border border-border"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave({ label, icon, colorHex });
                setOpen(false);
              }}
              className="btn-gold text-xs px-3 py-1.5 rounded inline-flex items-center gap-1.5"
            >
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ----------------------------- Prompt editor -------------------------------- */

function PromptEditor({
  sectionId,
  initial,
  onClose,
  onSave,
}: {
  sectionId: string;
  initial?: PhdPrompt;
  onClose: () => void;
  onSave: (draft: PhdPrompt) => void;
}) {
  const [draft, setDraft] = useState<PhdPrompt>(
    initial ?? {
      num: `c${Date.now().toString(36).slice(-5)}`,
      title: "",
      badge: "intermediate",
      useCase: "",
      vars: [],
      frameworks: "",
      output: "",
      tip: "",
      prompt: "",
    },
  );
  const [varsRaw, setVarsRaw] = useState((initial?.vars ?? []).join(", "));

  const set = <K extends keyof PhdPrompt>(k: K, v: PhdPrompt[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Modal
      title={initial ? `Edit prompt #${initial.num}` : `New prompt in ${sectionId}`}
      onClose={onClose}
      wide
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Number / ID">
          <input
            value={draft.num}
            onChange={(e) => set("num", e.target.value)}
            className="admin-input"
            disabled={Boolean(initial)}
          />
        </Field>
        <Field label="Badge">
          <select
            value={draft.badge}
            onChange={(e) => set("badge", e.target.value as PromptBadge)}
            className="admin-input"
          >
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Variables (comma-separated)">
          <input
            value={varsRaw}
            onChange={(e) => {
              setVarsRaw(e.target.value);
              set(
                "vars",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              );
            }}
            className="admin-input"
            placeholder="TOPIC, METHOD, CONTEXT"
          />
        </Field>
      </div>
      <Field label="Title">
        <input
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
          className="admin-input"
        />
      </Field>
      <Field label="Use case">
        <textarea
          value={draft.useCase}
          onChange={(e) => set("useCase", e.target.value)}
          className="admin-input min-h-[60px]"
        />
      </Field>
      <Field label="Frameworks">
        <textarea
          value={draft.frameworks}
          onChange={(e) => set("frameworks", e.target.value)}
          className="admin-input min-h-[50px]"
        />
      </Field>
      <Field label="Expected output">
        <textarea
          value={draft.output}
          onChange={(e) => set("output", e.target.value)}
          className="admin-input min-h-[50px]"
        />
      </Field>
      <Field label="Pro tip">
        <textarea
          value={draft.tip}
          onChange={(e) => set("tip", e.target.value)}
          className="admin-input min-h-[50px]"
        />
      </Field>
      <Field label="Prompt body">
        <textarea
          value={draft.prompt}
          onChange={(e) => set("prompt", e.target.value)}
          className="admin-input font-mono text-xs min-h-[140px]"
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded border border-border"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!draft.title.trim() || !draft.prompt.trim()) {
              alert("Title and prompt body are required.");
              return;
            }
            onSave(draft);
          }}
          className="btn-gold text-xs px-3 py-1.5 rounded inline-flex items-center gap-1.5"
        >
          <Save className="w-3 h-3" /> Save prompt
        </button>
      </div>
    </Modal>
  );
}

/* ----------------------------- Domain editor -------------------------------- */

function DomainEditor({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (d: AddedSection) => void;
}) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("✨");
  const [colorHex, setColorHex] = useState("#C8A240");
  const [groupKey, setGroupKey] = useState<SectionGroupKey>("bonus");

  return (
    <Modal title="Add new domain" onClose={onClose}>
      <Field label="Domain name">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="admin-input"
          placeholder="e.g. Open Science Practices"
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Icon">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="admin-input"
            maxLength={4}
          />
        </Field>
        <Field label="Accent colour">
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="admin-input h-9 p-1"
          />
        </Field>
        <Field label="Group">
          <select
            value={groupKey}
            onChange={(e) => setGroupKey(e.target.value as SectionGroupKey)}
            className="admin-input"
          >
            {GROUPS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-3 py-1.5 rounded border border-border"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!label.trim()) return;
            onSave({
              id: `custom-${Date.now().toString(36)}`,
              label: label.trim(),
              icon,
              colorHex,
              groupKey,
              prompts: [],
            });
          }}
          className="btn-gold text-xs px-3 py-1.5 rounded inline-flex items-center gap-1.5"
        >
          <Plus className="w-3 h-3" /> Create domain
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------- Primitives --------------------------------- */

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl border border-border bg-card shadow-2xl my-6`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: "3px solid hsl(var(--primary))" }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-primary font-mono block mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
