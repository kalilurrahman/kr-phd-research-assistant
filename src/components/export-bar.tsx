import { useState } from "react";
import { Download } from "lucide-react";
import type { FlatPrompt } from "@/data/phd-sections";
import { ExportStudio } from "@/components/export-studio";

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

      <ExportStudio
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
      <ExportStudio
        open={open}
        onClose={() => setOpen(false)}
        flatPrompts={flatPrompts}
        selectedNums={selectedNums}
        favoriteNums={favoriteNums}
      />
    </>
  );
}
