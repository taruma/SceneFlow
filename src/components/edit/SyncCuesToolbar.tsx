import React, { memo } from 'react';
import { 
  Edit2, 
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
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
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
  selectedCategory,
  onSelectCategory,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
  scriptThemeId,
  cuePaletteProfile = 'standard',
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);
  const isFiltering = Boolean(searchQuery.trim() || selectedCategory);

  return (
    <div className="bg-surface border-b border-border-main shrink-0 space-y-2 pb-2.5 pt-1 select-none">
      {/* Top Row: Title, Counter & Action Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className={UI_TOKENS.layout.sectionTitle}>Sync Cues</h3>
          <span className={cn(
            isFiltering ? UI_TOKENS.badge.counter : UI_TOKENS.badge.counterFaint,
            "text-[9px] font-mono"
          )}>
            {isFiltering ? `${filteredCount}/${totalCount}` : `${totalCount} total`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Density Mode Switcher: Cards vs Compact List */}
          <div className="flex items-center bg-surface-muted p-0.5 rounded-lg border border-border-subtle shadow-2xs">
            <button
              type="button"
              onClick={() => onDensityModeChange('cards')}
              title="Cards view"
              aria-label="Cards view"
              className={cn(
                "p-1 rounded text-xs transition-all active:scale-95 flex items-center gap-1",
                densityMode === 'cards'
                  ? "bg-surface text-text-main shadow-xs font-bold"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              <LayoutGrid size={11} />
            </button>
            <button
              type="button"
              onClick={() => onDensityModeChange('compact')}
              title="Compact list view"
              aria-label="Compact list view"
              className={cn(
                "p-1 rounded text-xs transition-all active:scale-95 flex items-center gap-1",
                densityMode === 'compact'
                  ? "bg-surface text-text-main shadow-xs font-bold"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              <List size={11} />
            </button>
          </div>

          <div className="w-px h-3.5 bg-border-subtle mx-0.5" aria-hidden="true" />

          {/* Raw JSON Modal Action */}
          <button
            type="button"
            onClick={onOpenRawCuesModal}
            title="Edit raw JSON cues"
            className="flex items-center gap-1 px-2 py-1 bg-surface-muted hover:bg-surface-hover border border-border-main text-text-muted hover:text-text-main rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-2xs"
          >
            <Edit2 size={9} /> Raw
          </button>

          {/* Automated Realign Action */}
          {totalCount > 0 && (
            <button
              type="button"
              onClick={onRealignCues}
              disabled={isAligning}
              title="Re-align cues with script text"
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border shadow-2xs",
                alignSuccess 
                  ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-bold" 
                  : "bg-surface-muted border-border-main text-text-muted hover:text-text-main hover:bg-surface-hover"
              )}
            >
              {isAligning ? (
                <Loader2 size={9} className="animate-spin" />
              ) : alignSuccess ? (
                <Check size={9} />
              ) : (
                <RefreshCw size={9} />
              )}
              {alignSuccess ? 'Aligned' : 'Align'}
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Search Input Box */}
      <div className="relative group px-0.5">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-text-main transition-colors pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Filter cues by text or timecode..."
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
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all shrink-0 border",
            selectedCategory === null
              ? "bg-btn-primary-bg text-btn-primary-text border-btn-primary-bg shadow-2xs"
              : "bg-surface-subtle hover:bg-surface text-text-faint hover:text-text-main border-border-subtle"
          )}
        >
          All
        </button>

        {COLORS.map(color => {
          const themed = resolveCueColor(color.type);
          const isSelected = selectedCategory === color.type;

          return (
            <button
              key={color.type}
              type="button"
              onClick={() => onSelectCategory(isSelected ? null : color.type)}
              title={`Filter ${color.type} cues`}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all shrink-0 border",
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
  );
});

SyncCuesToolbar.displayName = 'SyncCuesToolbar';
