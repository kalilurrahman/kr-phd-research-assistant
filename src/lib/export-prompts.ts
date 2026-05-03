import jsPDF from "jspdf";
import type { FlatPrompt } from "@/data/phd-sections";

/* Triggers a browser download for an arbitrary blob. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours(),
  )}${pad(d.getMinutes())}`;
}

export function exportPromptsAsJson(
  prompts: FlatPrompt[],
  scopeLabel: string,
): void {
  const payload = {
    source: "PhD Research Scholar Prompt Guide",
    curator: "Kalilur Rahman",
    exportedAt: new Date().toISOString(),
    scope: scopeLabel,
    count: prompts.length,
    prompts: prompts.map((p) => ({
      num: p.num,
      title: p.title,
      badge: p.badge,
      domain: p.sectionLabel,
      domainId: p.sectionId,
      group: p.groupKey,
      useCase: p.useCase,
      vars: p.vars,
      frameworks: p.frameworks,
      output: p.output,
      tip: p.tip,
      prompt: p.prompt,
    })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(
    blob,
    `phd-prompts-${scopeLabel.toLowerCase().replace(/\s+/g, "-")}-${timestamp()}.json`,
  );
}

/* ----------------------------- PDF generation ---------------------------- */

const PAGE_W = 595.28; // A4 portrait, points
const PAGE_H = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 56;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const COL_BG: [number, number, number] = [15, 23, 42]; // slate-950
const COL_CARD: [number, number, number] = [22, 33, 55];
const COL_GOLD: [number, number, number] = [200, 162, 64];
const COL_GOLD_LIGHT: [number, number, number] = [232, 197, 99];
const COL_TEXT: [number, number, number] = [248, 250, 252];
const COL_MUTED: [number, number, number] = [148, 163, 184];
const COL_BORDER: [number, number, number] = [51, 65, 85];

function paintBackground(doc: jsPDF): void {
  doc.setFillColor(...COL_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function addCoverPage(
  doc: jsPDF,
  scopeLabel: string,
  count: number,
): void {
  paintBackground(doc);

  // Top accent bar
  doc.setFillColor(...COL_GOLD);
  doc.rect(0, 0, PAGE_W, 4, "F");

  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("KR · KALILUR RAHMAN", MARGIN_X, 90);

  doc.setTextColor(...COL_TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  const titleLines = doc.splitTextToSize(
    "PhD Research Scholar Prompt Guide",
    CONTENT_W,
  );
  doc.text(titleLines, MARGIN_X, 140);

  doc.setTextColor(...COL_GOLD_LIGHT);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(16);
  doc.text("Think rigorously. Write brilliantly.", MARGIN_X, 215);

  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    [
      `Scope: ${scopeLabel}`,
      `Prompts in this export: ${count}`,
      `Exported: ${new Date().toLocaleString()}`,
      "Curator: Kalilur Rahman",
    ],
    MARGIN_X,
    260,
    { lineHeightFactor: 1.6 },
  );

  // Disclaimer block
  const disclaimerY = PAGE_H - 200;
  doc.setDrawColor(...COL_BORDER);
  doc.setFillColor(...COL_CARD);
  doc.roundedRect(MARGIN_X, disclaimerY, CONTENT_W, 140, 6, 6, "FD");

  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AI CONTENT NOTICE", MARGIN_X + 14, disclaimerY + 22);

  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const disclaimer = doc.splitTextToSize(
    "These prompts are produced with assistance from Artificial Intelligence including large language models. AI systems can produce hallucinations — outputs that appear plausible but may be factually incorrect. All content here is a starting point and reference only — not authoritative or production-ready. Critically review and vet outputs with qualified human professionals before use in any professional, commercial, technical, legal, or safety-critical context.",
    CONTENT_W - 28,
  );
  doc.text(disclaimer, MARGIN_X + 14, disclaimerY + 40, {
    lineHeightFactor: 1.4,
  });
}

function addFooter(doc: jsPDF, page: number, total: number): void {
  doc.setDrawColor(...COL_BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, PAGE_H - 32, PAGE_W - MARGIN_X, PAGE_H - 32);
  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "PhD Research Scholar Prompt Guide · Curated by Kalilur Rahman",
    MARGIN_X,
    PAGE_H - 18,
  );
  doc.text(`${page} / ${total}`, PAGE_W - MARGIN_X, PAGE_H - 18, {
    align: "right",
  });
}

interface Cursor {
  y: number;
}

function ensureSpace(doc: jsPDF, cursor: Cursor, needed: number): void {
  if (cursor.y + needed > PAGE_H - MARGIN_BOTTOM) {
    doc.addPage();
    paintBackground(doc);
    cursor.y = MARGIN_TOP;
  }
}

function writeBlock(
  doc: jsPDF,
  cursor: Cursor,
  label: string,
  body: string,
): void {
  ensureSpace(doc, cursor, 40);
  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), MARGIN_X, cursor.y);
  cursor.y += 12;

  doc.setTextColor(...COL_TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(body, CONTENT_W);
  for (const line of lines) {
    ensureSpace(doc, cursor, 14);
    doc.text(line, MARGIN_X, cursor.y);
    cursor.y += 13;
  }
  cursor.y += 8;
}

function renderPrompt(
  doc: jsPDF,
  cursor: Cursor,
  p: FlatPrompt,
  index: number,
  total: number,
): void {
  // Section divider on first prompt of a new page section
  ensureSpace(doc, cursor, 80);

  // Prompt header card
  doc.setFillColor(...COL_CARD);
  doc.setDrawColor(...COL_BORDER);
  const headerH = 56;
  doc.roundedRect(MARGIN_X, cursor.y, CONTENT_W, headerH, 4, 4, "FD");

  // Number chip
  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`#${p.num}`, MARGIN_X + 12, cursor.y + 18);

  // Badge text
  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${p.badge.toUpperCase()} · ${p.sectionLabel}`,
    MARGIN_X + 50,
    cursor.y + 18,
  );

  // Title
  doc.setTextColor(...COL_TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(p.title, CONTENT_W - 24);
  doc.text(titleLines[0] ?? p.title, MARGIN_X + 12, cursor.y + 40);

  // Index marker top-right
  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${index} / ${total}`, PAGE_W - MARGIN_X - 8, cursor.y + 18, {
    align: "right",
  });

  cursor.y += headerH + 14;

  writeBlock(doc, cursor, "Use case", p.useCase);
  writeBlock(doc, cursor, "Frameworks", p.frameworks);
  writeBlock(doc, cursor, "Output", p.output);
  writeBlock(doc, cursor, "Pro tip", p.tip);
  if (p.vars.length > 0) {
    writeBlock(doc, cursor, "Variables", p.vars.map((v) => `[${v}]`).join("  "));
  }
  writeBlock(doc, cursor, "Prompt", p.prompt);

  // Spacer between prompts
  cursor.y += 6;
  ensureSpace(doc, cursor, 1);
}

export function exportPromptsAsPdf(
  prompts: FlatPrompt[],
  scopeLabel: string,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addCoverPage(doc, scopeLabel, prompts.length);

  // Body pages
  doc.addPage();
  paintBackground(doc);
  const cursor: Cursor = { y: MARGIN_TOP };
  prompts.forEach((p, i) => renderPrompt(doc, cursor, p, i + 1, prompts.length));

  // Footers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    addFooter(doc, i, total);
  }

  doc.save(
    `phd-prompts-${scopeLabel.toLowerCase().replace(/\s+/g, "-")}-${timestamp()}.pdf`,
  );
}
