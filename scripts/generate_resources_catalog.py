from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "PhD Research Reference Files"
OUT_FILE = ROOT / "src" / "data" / "resources-catalog.json"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "domain"


def clean_name(filename: str) -> str:
    base = re.sub(r"^\d+[_\-\s]*", "", filename)
    base = base.replace("_", " ").replace("-", " ")
    return " ".join(base.split()).title()


def nonempty(value: Any) -> str:
    if value is None:
        return ""
    v = str(value).strip()
    return "" if v.lower() == "nan" else v


def pick_subdomain(row: dict[str, Any], default: str) -> str:
    for key in (
        "Category",
        "Type",
        "Stage",
        "Practice Area",
        "Methodology Type",
        "Sheet",
    ):
        if key in row:
            val = nonempty(row.get(key))
            if val:
                return val
    return default


def parse_csv(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for enc in ("utf-8-sig", "utf-8", "cp1252"):
        try:
            with path.open("r", encoding=enc, newline="") as f:
                reader = csv.DictReader(f)
                for r in reader:
                    row = {k: nonempty(v) for k, v in (r or {}).items() if k}
                    if any(row.values()):
                        rows.append(row)
            break
        except UnicodeDecodeError:
            rows = []
            continue
    return rows


def parse_xlsx(path: Path) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    wb = load_workbook(path, data_only=True)
    for ws in wb.worksheets:
        data = list(ws.iter_rows(values_only=True))
        if not data:
            continue
        headers = [nonempty(c) for c in data[0]]
        if not any(headers):
            continue
        for row_vals in data[1:]:
            row = {}
            for i, h in enumerate(headers):
                if not h:
                    continue
                row[h] = nonempty(row_vals[i] if i < len(row_vals) else "")
            if any(nonempty(v) for v in row.values()):
                row["Sheet"] = ws.title
                items.append(row)
    return items


def parse_markdown(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    headings = []
    for line in text.splitlines():
        if line.startswith("#"):
            clean = line.lstrip("#").strip()
            if clean:
                headings.append(clean)
    return {
        "title": clean_name(path.stem),
        "headings": headings[:40],
        "wordCount": len(text.split()),
    }


def main() -> None:
    domains: dict[str, dict[str, Any]] = {}
    file_summaries: list[dict[str, Any]] = []
    all_entries = 0

    files = sorted(SOURCE_DIR.rglob("*"))
    for path in files:
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        rel = str(path.relative_to(SOURCE_DIR)).replace("\\", "/")

        # Skip sample frontend code files.
        if ext in {".jsx", ".vue", ".html"}:
            continue

        # Avoid duplicated copies under csv/json folders if root counterpart exists.
        if rel.startswith("csv/") or rel.startswith("json/"):
            continue

        base_domain = clean_name(path.stem)
        domain_id = slugify(base_domain)
        if domain_id not in domains:
            domains[domain_id] = {
                "id": domain_id,
                "name": base_domain,
                "sources": [],
                "subdomains": defaultdict(list),
            }

        domains[domain_id]["sources"].append(rel)

        if ext == ".csv":
            rows = parse_csv(path)
            for row in rows:
                sub = pick_subdomain(row, "General")
                domains[domain_id]["subdomains"][sub].append(
                    {"source": rel, "fields": row}
                )
            file_summaries.append(
                {"file": rel, "type": "csv", "rows": len(rows), "domain": base_domain}
            )
            all_entries += len(rows)
        elif ext == ".xlsx":
            rows = parse_xlsx(path)
            for row in rows:
                sub = pick_subdomain(row, row.get("Sheet", "General"))
                domains[domain_id]["subdomains"][sub].append(
                    {"source": rel, "fields": row}
                )
            file_summaries.append(
                {"file": rel, "type": "xlsx", "rows": len(rows), "domain": base_domain}
            )
            all_entries += len(rows)
        elif ext == ".md":
            md = parse_markdown(path)
            domains[domain_id]["subdomains"]["Guides"].append({"source": rel, "fields": md})
            file_summaries.append(
                {"file": rel, "type": "md", "rows": 1, "domain": base_domain}
            )
            all_entries += 1
        elif ext in {".txt", ".docx", ".json"}:
            file_summaries.append(
                {"file": rel, "type": ext.lstrip("."), "rows": 0, "domain": base_domain}
            )

    output_domains = []
    for d in domains.values():
        subs = []
        for name, entries in d["subdomains"].items():
            subs.append({"name": name, "count": len(entries), "entries": entries})
        subs.sort(key=lambda x: x["name"].lower())
        output_domains.append(
            {
                "id": d["id"],
                "name": d["name"],
                "sources": d["sources"],
                "subdomains": subs,
                "count": sum(s["count"] for s in subs),
            }
        )
    output_domains.sort(key=lambda x: x["name"].lower())

    result = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceRoot": str(SOURCE_DIR),
        "totals": {
            "domains": len(output_domains),
            "entries": all_entries,
            "files": len(file_summaries),
        },
        "files": sorted(file_summaries, key=lambda x: x["file"].lower()),
        "domains": output_domains,
    }

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(result, indent=2, ensure_ascii=True), encoding="utf-8")
    print(f"Wrote {OUT_FILE}")


if __name__ == "__main__":
    main()
