import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type PaletteId = "default" | "financial-slate" | "forest" | "sunset" | "mono";

const PALETTES: { id: PaletteId; label: string; swatch: string }[] = [
  { id: "default", label: "Gold (default)", swatch: "hsl(43 70% 55%)" },
  { id: "financial-slate", label: "Financial Slate", swatch: "hsl(221 83% 60%)" },
  { id: "forest", label: "Forest", swatch: "hsl(160 70% 45%)" },
  { id: "sunset", label: "Sunset", swatch: "hsl(14 90% 60%)" },
  { id: "mono", label: "Mono", swatch: "hsl(0 0% 92%)" },
];

const STORAGE_KEY = "kr-palette";

function applyPalette(id: PaletteId): void {
  const root = document.documentElement;
  if (id === "default") {
    root.removeAttribute("data-palette");
  } else {
    root.setAttribute("data-palette", id);
  }
}

export function ThemeSwitcher(): JSX.Element {
  const [current, setCurrent] = useState<PaletteId>("default");

  useEffect(() => {
    const stored = (typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEY)
      : null) as PaletteId | null;
    if (stored) {
      setCurrent(stored);
      applyPalette(stored);
    }
  }, []);

  const choose = (id: PaletteId) => {
    setCurrent(id);
    applyPalette(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const active = PALETTES.find((p) => p.id === current) ?? PALETTES[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary text-foreground hover:text-primary transition-colors"
          aria-label="Change theme palette"
        >
          <Palette className="w-3.5 h-3.5" />
          <span
            className="w-3 h-3 rounded-full border border-border"
            style={{ background: active.swatch }}
            aria-hidden
          />
          <span className="hidden md:inline">Theme</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Palette
        </div>
        {PALETTES.map((p) => {
          const isActive = p.id === current;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id)}
              className={
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors " +
                (isActive ? "bg-accent/60" : "")
              }
            >
              <span
                className="w-4 h-4 rounded-full border border-border shrink-0"
                style={{ background: p.swatch }}
                aria-hidden
              />
              <span className="flex-1 text-left">{p.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
