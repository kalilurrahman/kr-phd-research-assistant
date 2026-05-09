import jsPDF from "jspdf";
import type { FlatPrompt } from "@/data/phd-sections";
import { extractTokens, interpolatePrompt } from "@/lib/usage-tracker";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_X = 48;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 56;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const COL_BG: [number, number, number] = [15, 23, 42];
const COL_CARD: [number, number, number] = [22, 33, 55];
const COL_GOLD: [number, number, number] = [200, 162, 64];
const COL_GOLD_LIGHT: [number, number, number] = [232, 197, 99];
const COL_TEXT: [number, number, number] = [248, 250, 252];
const COL_MUTED: [number, number, number] = [148, 163, 184];
const COL_BORDER: [number, number, number] = [51, 65, 85];
const COL_GREEN: [number, number, number] = [110, 231, 183];

export interface BrandedPdfInputs {
  scholarName: string;
  institution: string;
  researchTitle: string;
  tagline?: string;
  prompts: FlatPrompt[];
  filledValues: Record<string, Record<string, string>>;
  personalNotes: Record<string, string>;
  onProgress?: (pct: number) => void;
}

function paint(doc: jsPDF) {
  doc.setFillColor(...COL_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function safeName(s: string): string {
  return s.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_-]/g, "") || "Scholar";
}

function ensure(doc: jsPDF, cur: { y: number }, needed: number) {
  if (cur.y + needed > PAGE_H - MARGIN_BOTTOM) {
    doc.addPage();
    paint(doc);
    cur.y = MARGIN_TOP;
  }
}

function addCover(doc: jsPDF, i: BrandedPdfInputs) {
  paint(doc);
  doc.setFillColor(...COL_GOLD);
  doc.rect(0, 0, PAGE_W, 4, "F");
  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("KR · PHD RESEARCH SCHOLAR PROMPT GUIDE", MARGIN_X, 90);

  doc.setTextColor(...COL_TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  const titleLines = doc.splitTextToSize(
    i.researchTitle || "Personal Prompt Guide",
    CONTENT_W,
  );
  doc.text(titleLines, MARGIN_X, 150);

  doc.setTextColor(...COL_GOLD_LIGHT);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  doc.text(i.tagline || "Think rigorously. Write brilliantly.", MARGIN_X, 215);

  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    [
      `Scholar: ${i.scholarName || "—"}`,
      `Institution: ${i.institution || "—"}`,
      `Exported: ${todayIso()}`,
      `Total prompts: ${i.prompts.length}`,
    ],
    MARGIN_X,
    270,
    { lineHeightFactor: 1.6 },
  );

  // Disclaimer card
  const dy = PAGE_H - 200;
  doc.setDrawColor(...COL_BORDER);
  doc.setFillColor(...COL_CARD);
  doc.roundedRect(MARGIN_X, dy, CONTENT_W, 140, 6, 6, "FD");
  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AI CONTENT NOTICE", MARGIN_X + 14, dy + 22);
  doc.setTextColor(...COL_MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const disc = doc.splitTextToSize(
    "These prompts are AI-augmented references. Outputs may include hallucinations or factual errors. Critically review and vet every output with qualified human professionals before professional, commercial, technical, legal, or safety-critical use.",
    CONTENT_W - 28,
  );
  doc.text(disc, MARGIN_X + 14, dy + 40, { lineHeightFactor: 1.4 });
}

interface DomainGroup {
  sectionId: string;
  sectionLabel: string;
  sectionColor: string;
  sectionIcon: string;
  prompts: FlatPrompt[];
}

function group(prompts: FlatPrompt[]): DomainGroup[] {
  const map = new Map<string, DomainGroup>();
  for (const p of prompts) {
    const g = map.get(p.sectionId) ?? {
      sectionId: p.sectionId,
      sectionLabel: p.sectionLabel,
      sectionColor: p.sectionColor,
      sectionIcon: p.sectionIcon,
      prompts: [],
    };
    g.prompts.push(p);
    map.set(p.sectionId, g);
  }
  return Array.from(map.values());
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function addToc(doc: jsPDF, groups: DomainGroup[], pageMap: Map<string, number>) {
  doc.addPage();
  paint(doc);
  const cur = { y: MARGIN_TOP };
  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Table of contents", MARGIN_X, cur.y);
  cur.y += 30;
  for (const g of groups) {
    ensure(doc, cur, 24);
    doc.setTextColor(...hexToRgb(g.sectionColor));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(g.sectionLabel, MARGIN_X, cur.y);
    cur.y += 16;
    doc.setTextColor(...COL_TEXT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const p of g.prompts) {
      ensure(doc, cur, 14);
      const page = pageMap.get(p.num) ?? 0;
      const titleW = CONTENT_W - 36;
      const line = doc.splitTextToSize(`#${p.num} ${p.title}`, titleW)[0];
      doc.text(line, MARGIN_X + 12, cur.y);
      doc.setTextColor(...COL_MUTED);
      doc.text(String(page), PAGE_W - MARGIN_X, cur.y, { align: "right" });
      doc.setTextColor(...COL_TEXT);
      cur.y += 13;
    }
    cur.y += 6;
  }
}

function renderFilledPrompt(
  doc: jsPDF,
  cur: { y: number },
  text: string,
  values: Record<string, string>,
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const re = /\[([A-Z_0-9]+)\]/g;
  const parts: Array<{ text: string; filled: boolean }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), filled: false });
    const v = values[m[1]];
    if (v && v.trim()) parts.push({ text: v, filled: true });
    else parts.push({ text: `[${m[1]}]`, filled: false });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), filled: false });

  let x = MARGIN_X;
  const lh = 13;
  const maxX = PAGE_W - MARGIN_X;
  for (const part of parts) {
    const words = part.text.split(/(\s+)/);
    if (part.filled) {
      doc.setTextColor(...COL_GREEN);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(...COL_TEXT);
      doc.setFont("helvetica", "normal");
    }
    for (const w of words) {
      const ww = doc.getTextWidth(w);
      if (x + ww > maxX) {
        cur.y += lh;
        ensure(doc, cur, lh);
        x = MARGIN_X;
      }
      ensure(doc, cur, lh);
      doc.text(w, x, cur.y);
      x += ww;
    }
  }
  cur.y += lh + 4;
}

function addFooters(doc: jsPDF, scholar: string) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COL_BORDER);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, PAGE_H - 32, PAGE_W - MARGIN_X, PAGE_H - 32);
    doc.setTextColor(...COL_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${scholar || "Scholar"} · PhD Prompt Guide`, MARGIN_X, PAGE_H - 18);
    doc.text(`${i} of ${total}`, PAGE_W - MARGIN_X, PAGE_H - 18, { align: "right" });
  }
}

export async function generateBrandedPdf(i: BrandedPdfInputs): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addCover(doc, i);

  const groups = group(i.prompts);

  doc.addPage();
  paint(doc);
  const cur = { y: MARGIN_TOP };
  const pageMap = new Map<string, number>();

  let done = 0;
  const total = Math.max(i.prompts.length, 1);

  for (const g of groups) {
    ensure(doc, cur, 50);
    doc.setFillColor(...hexToRgb(g.sectionColor));
    doc.rect(MARGIN_X, cur.y - 14, 4, 22, "F");
    doc.setTextColor(...hexToRgb(g.sectionColor));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(g.sectionLabel, MARGIN_X + 12, cur.y);
    cur.y += 22;

    for (const p of g.prompts) {
      ensure(doc, cur, 80);
      pageMap.set(p.num, doc.getNumberOfPages());

      doc.setTextColor(...COL_GOLD);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`#${p.num} · ${p.badge.toUpperCase()}`, MARGIN_X, cur.y);
      cur.y += 12;

      doc.setTextColor(...COL_TEXT);
      doc.setFontSize(13);
      const tlines = doc.splitTextToSize(p.title, CONTENT_W);
      for (const tl of tlines) {
        ensure(doc, cur, 16);
        doc.text(tl, MARGIN_X, cur.y);
        cur.y += 16;
      }

      const tokens = extractTokens(p.prompt);
      const values = i.filledValues[p.num] ?? {};
      const filledCount = tokens.filter((t) => values[t]?.trim()).length;

      doc.setTextColor(...COL_MUTED);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(
        `${filledCount} of ${tokens.length} placeholders filled`,
        MARGIN_X,
        cur.y,
      );
      cur.y += 14;

      renderFilledPrompt(doc, cur, p.prompt, values);

      const note = i.personalNotes[p.num];
      if (note && note.trim()) {
        ensure(doc, cur, 30);
        doc.setTextColor(...COL_GOLD_LIGHT);
        doc.setFont("helvetica", "bolditalic");
        doc.setFontSize(9);
        doc.text("Personal note:", MARGIN_X, cur.y);
        cur.y += 12;
        doc.setTextColor(...COL_MUTED);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        const nl = doc.splitTextToSize(note, CONTENT_W);
        for (const l of nl) {
          ensure(doc, cur, 13);
          doc.text(l, MARGIN_X, cur.y);
          cur.y += 13;
        }
      }

      cur.y += 12;
      done += 1;
      if (i.onProgress) i.onProgress(Math.round((done / total) * 100));
      if (done % 4 === 0) await new Promise((r) => setTimeout(r, 0));
    }
  }

  doc.insertPage(2);
  doc.setPage(2);
  paint(doc);
  const tocCur = { y: MARGIN_TOP };
  doc.setTextColor(...COL_GOLD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Table of contents", MARGIN_X, tocCur.y);
  tocCur.y += 30;
  for (const g of groups) {
    if (tocCur.y > PAGE_H - MARGIN_BOTTOM - 30) break;
    doc.setTextColor(...hexToRgb(g.sectionColor));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(g.sectionLabel, MARGIN_X, tocCur.y);
    tocCur.y += 16;
    doc.setTextColor(...COL_TEXT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const p of g.prompts) {
      if (tocCur.y > PAGE_H - MARGIN_BOTTOM - 14) break;
      const stored = pageMap.get(p.num) ?? 0;
      const adjusted = stored >= 2 ? stored + 1 : stored;
      const titleW = CONTENT_W - 36;
      const line = doc.splitTextToSize(`#${p.num} ${p.title}`, titleW)[0];
      doc.text(line, MARGIN_X + 12, tocCur.y);
      doc.setTextColor(...COL_MUTED);
      doc.text(String(adjusted), PAGE_W - MARGIN_X, tocCur.y, { align: "right" });
      doc.setTextColor(...COL_TEXT);
      tocCur.y += 13;
    }
    tocCur.y += 6;
  }

  addFooters(doc, i.scholarName);

  const filename = `KR_PhD_PromptGuide_${safeName(i.scholarName)}_${todayIso()}.pdf`;
  doc.save(filename);
}
