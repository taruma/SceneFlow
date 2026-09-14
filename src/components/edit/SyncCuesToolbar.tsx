import React, { memo } from 'react';
import { 
  Braces, 
  RefreshCw, 
  Check, 
  Loader2, 
  Search, 
  X, 
  LayoutGrid, 
  List 
} from 'lucide-react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { type CuePaletteProfile } from '../../styles/tokens/cues';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';

export type CueDensityMode = 'cards' | 'compact';

export interface SyncCuesToolbarProps {
  filteredCount: number;
  totalCount: number;
  densityMode: CueDensityMode;
  onDensityModeChange: (mode: CueDensityMode) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (category: string | null) => void;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  onResetFilters?: () => void;
}

/**
 * Permanently docked Sync Cues toolbar for Edit Mode (Tier 2).
 * Houses controls, density switchers, search input, and interactive category filter pills.
 */
export const SyncCuesToolbar: React.FC<SyncCuesToolbarProps> = memo(({
  filteredCount,
  totalCount,
  densityMode,
  onDensityModeChange,
  searchQuery,
  onSearchQueryChange,
  selectedCategories,
  onToggleCategory,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
  scriptThemeId,
  cuePaletteProfile = 'standard',
  onResetFilters,
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const isFiltering = Boolean(searchQuery.trim() || selectedCategories.size > 0);
  const isAllSelected = selectedCategories.size === 0;
  const isExpanded = isFilterOpen || isFiltering;

  const handleToggleFilter = React.useCallback(() => {
    setIsFilterOpen(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return next;
    });
  }, []);

  const handleReset = React.useCallback(() => {
    onResetFilters?.();
    setIsFilterOpen(false);
  }, [onResetFilters]);

  return (
    <div className={cn(
      "bg-surface border-b border-border-main shrink-0 select-none transition-all duration-200",
      isExpanded ? "space-y-2 pb-2.5 pt-1.5" : "py-2"
    )}>
      {/* Top Row: Title, Counter & Action Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className={UI_TOKENS.layout.sectionTitle}>Sync Cues</h3>
          {isFiltering ? (
            <button
              type="button"
              onClick={handleReset}
              title="Click to reset all filters"
              className={cn(
                UI_TOKENS.badge.counter,
                "group flex items-center gap-1 text-[9px] font-mono hover:bg-surface-hover transition-colors cursor-pointer animate-in fade-in zoom-in-95 duration-150"
              )}
            >
              <span>{filteredCount}/{totalCount}</span>
              <X size={9} className="text-text-faint group-hover:text-text-main" />
            </button>
          ) : (
            <span className={cn(
              UI_TOKENS.badge.counterFaint,
              "text-[9px] font-mono"
            )}>
              {totalCount} total
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Density Mode Switcher: Cards vs Compact List */}
          <div className="flex items-center bg-surface-muted p-0.5 rounded-lg border border-border-subtle shadow-2xs">
            <button
              type="button"
              onClick={() => onDensityModeChange('cards')}
              title="Cards view"
              aria-label="Cards view"
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1",
                densityMode === 'cards'
                  ? "bg-surface text-text-main shadow-xs font-bold"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              <LayoutGrid size={10} className="shrink-0" />
              <span className="header-btn-label">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => onDensityModeChange('compact')}
              title="Compact list view"
              aria-label="Compact list view"
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1",
                densityMode === 'compact'
                  ? "bg-surface text-text-main shadow-xs font-bold"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              <List size={10} className="shrink-0" />
              <span className="header-btn-label">Compact</span>
            </button>
          </div>

          <div className="w-px h-3.5 bg-border-subtle mx-0.5" aria-hidden="true" />

          {/* Filter / Search Toggle Action */}
          <button
            type="button"
            onClick={handleToggleFilter}
            aria-expanded={isExpanded}
            title={isExpanded ? "Collapse search & filters [Esc]" : "Search & filter cues"}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border shadow-2xs",
              isExpanded
                ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold shadow-blue-500/10"
                : "bg-surface-muted hover:bg-surface-hover border-border-main text-text-muted hover:text-text-main"
            )}
          >
            <Search size={10} className="shrink-0" />
            <span className="header-btn-label">Filter</span>
            {isFiltering && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)] shrink-0" />
            )}
          </button>

          {/* Raw JSON Modal Action */}
          <button
            type="button"
            onClick={onOpenRawCuesModal}
            title="View & edit raw cues JSON data"
            className="flex items-center gap-1 px-2 py-1 bg-surface-muted hover:bg-surface-hover border border-border-main text-text-muted hover:text-text-main rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-2xs"
          >
            <Braces size={10} className="shrink-0 text-text-muted" />
            <span className="header-btn-label">JSON</span>
          </button>

          {/* Automated Realign Action */}
          {totalCount > 0 && (
            <button
              type="button"
              onClick={onRealignCues}
              disabled={isAligning}
              title="Resynchronize cue highlights with script text"
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border shadow-2xs",
                alignSuccess 
                  ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-bold" 
                  : "bg-surface-muted border-border-main text-text-muted hover:text-text-main hover:bg-surface-hover"
              )}
            >
              {isAligning ? (
                <Loader2 size={10} className="animate-spin shrink-0" />
              ) : alignSuccess ? (
                <Check size={10} className="shrink-0" />
              ) : (
                <RefreshCw size={10} className="shrink-0" />
              )}
              <span className="header-btn-label">
                {alignSuccess ? 'Synced' : 'Resync'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Search & Category Filter Section */}
      {isExpanded && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Middle Row: Search Input Box */}
          <div className="relative group px-0.5">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-text-main transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  if (searchQuery) {
                    onSearchQueryChange('');
                  } else {
                    setIsFilterOpen(false);
                  }
                }
              }}
              placeholder="Filter cues by text or timecode... (Esc to close)"
              className="w-full bg-surface-subtle hover:bg-surface focus:bg-surface border border-border-subtle focus:border-border-main rounded-lg pl-7 pr-7 py-1 text-[11px] text-text-main placeholder-text-placeholder transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-faint hover:text-text-main transition-colors"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Bottom Row: Interactive Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5 px-0.5">
            <button
              type="button"
              onClick={() => onToggleCategory(null)}
              className={cn(
                "px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all shrink-0 border",
                isAllSelected
                  ? "bg-btn-primary-bg text-btn-primary-text border-btn-primary-bg shadow-2xs"
                  : "bg-surface-subtle hover:bg-surface text-text-faint hover:text-text-main border-border-subtle"
              )}
            >
              All
            </button>

            {COLORS.map(color => {
              const themed = resolveCueColor(color.type);
              const isSelected = selectedCategories.has(color.type);

              return (
                <button
                  key={color.type}
                  type="button"
                  onClick={() => onToggleCategory(color.type)}
                  title={isSelected ? `Remove ${color.type} filter` : `Filter by ${color.type}`}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all shrink-0 border cursor-pointer",
                    isSelected
                      ? "shadow-2xs font-bold ring-1"
                      : "bg-surface-subtle hover:bg-surface text-text-faint hover:text-text-main border-border-subtle"
                  )}
                  style={isSelected ? {
                    backgroundColor: `rgba(${themed.rgb}, 0.18)`,
                    borderColor: `rgba(${themed.rgb}, 0.5)`,
                    color: themed.textColorClass.includes('text-amber-100') ? '#b45309' : `rgb(${themed.rgb})`,
                    boxShadow: `0 0 0 1px rgba(${themed.rgb}, 0.25)`,
                  } : undefined}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full shrink-0" 
                    style={{ backgroundColor: themed.dotColor }} 
                  />
                  <span>{color.type}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

SyncCuesToolbar.displayName = 'SyncCuesToolbar';
