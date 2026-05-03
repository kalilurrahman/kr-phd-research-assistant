import { Star, Clock, Search, Trash2, X } from "lucide-react";
import type { FlatPrompt } from "@/data/phd-sections";
import {
  useFavorites,
  useRecentSearches,
  useRecentViews,
} from "@/hooks/use-user-data";

export function FavoritesPanel({
  open,
  onClose,
  flatPrompts,
  onOpenPrompt,
  onApplySearch,
}: {
  open: boolean;
  onClose: () => void;
  flatPrompts: FlatPrompt[];
  onOpenPrompt: (p: FlatPrompt) => void;
  onApplySearch: (q: string) => void;
}) {
  const { ids: favIds, toggle: toggleFav, clear: clearFavs } = useFavorites();
  const { list: searches, clear: clearSearches } = useRecentSearches();
  const { list: views, clear: clearViews } = useRecentViews();

  const byNum = new Map(flatPrompts.map((p) => [p.num, p]));
  const favPrompts = favIds
    .map((id) => byNum.get(id))
    .filter((p): p is FlatPrompt => Boolean(p));
  const viewPrompts = views
    .map((v) => byNum.get(v.num))
    .filter((p): p is FlatPrompt => Boolean(p));

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Your library"
        className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-card border-l border-border shadow-2xl transition-transform overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Your library
            </h2>
            <p className="text-[11px] text-muted-foreground font-mono">
              Stored locally on this device
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Favorites */}
        <PanelSection
          icon={<Star className="w-4 h-4" />}
          title="Favorites"
          count={favPrompts.length}
          onClear={favPrompts.length > 0 ? clearFavs : undefined}
        >
          {favPrompts.length === 0 ? (
            <Empty hint="Tap the ★ on any prompt to save it here." />
          ) : (
            <ul className="space-y-1.5">
              {favPrompts.map((p) => (
                <li key={p.num} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenPrompt(p)}
                    className="flex-1 text-left p-2 rounded-md hover:bg-accent/60 group"
                  >
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary leading-tight">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      <span style={{ color: p.sectionColor }}>{p.sectionIcon}</span>{" "}
                      {p.sectionLabel} · #{p.num}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFav(p.num)}
                    aria-label="Remove favorite"
                    className="p-1.5 mt-1 rounded text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PanelSection>

        {/* Recently viewed */}
        <PanelSection
          icon={<Clock className="w-4 h-4" />}
          title="Recently viewed"
          count={viewPrompts.length}
          onClear={viewPrompts.length > 0 ? clearViews : undefined}
        >
          {viewPrompts.length === 0 ? (
            <Empty hint="Prompts you open will appear here." />
          ) : (
            <ul className="space-y-1.5">
              {viewPrompts.slice(0, 12).map((p) => (
                <li key={p.num}>
                  <button
                    type="button"
                    onClick={() => onOpenPrompt(p)}
                    className="w-full text-left p-2 rounded-md hover:bg-accent/60 group"
                  >
                    <div className="text-sm text-foreground group-hover:text-primary leading-tight truncate">
                      {p.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {p.sectionLabel}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PanelSection>

        {/* Recent searches */}
        <PanelSection
          icon={<Search className="w-4 h-4" />}
          title="Recent searches"
          count={searches.length}
          onClear={searches.length > 0 ? clearSearches : undefined}
        >
          {searches.length === 0 ? (
            <Empty hint="Your search terms will be saved here." />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {searches.map((s) => (
                <button
                  key={s.query + s.at}
                  type="button"
                  onClick={() => {
                    onApplySearch(s.query);
                    onClose();
                  }}
                  className="font-mono text-[11px] px-2 py-1 rounded-md border border-border bg-background/60 hover:border-primary hover:text-primary text-muted-foreground transition-colors"
                >
                  {s.query}
                </button>
              ))}
            </div>
          )}
        </PanelSection>
      </aside>
    </>
  );
}

function PanelSection({
  icon,
  title,
  count,
  onClear,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  onClear?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <h3 className="font-display text-sm font-bold uppercase tracking-wider">
            {title}
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {count}
          </span>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ hint }: { hint: string }) {
  return (
    <p className="text-[12px] text-muted-foreground italic">{hint}</p>
  );
}
