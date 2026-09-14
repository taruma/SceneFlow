import React, { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { FilterX, Highlighter } from 'lucide-react';
import { Cue } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { smoothScrollTo } from '../../hooks/useAutoScroll';
import { filterCues } from '../../lib/cueUtils';
import { cn } from '../../lib/utils';
import { SyncCuesToolbar, CueDensityMode } from './SyncCuesToolbar';
import { SyncCueCard } from './SyncCueCard';
import { SyncCueRow } from './SyncCueRow';

const DENSITY_STORAGE_KEY = 'sceneflow_edit_cue_density';
const AUTOSCROLL_STORAGE_KEY = 'sceneflow_edit_autoscroll';

export interface SyncCuesPanelProps {
  cues: Cue[];
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  selectedCueId?: string;
  activeCueId?: string | null;
  seekVersion?: number;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  selectedCategories?: Set<string>;
  onToggleCategory?: (category: string | null) => void;
  onResetFilters?: () => void;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
  className?: string;
}

/**
 * Orchestrator panel for Sync Cues in Edit Mode (Tier 2).
 * Houses the permanently docked SyncCuesToolbar, search filtering, category filtering,
 * dual density switcher (Cards vs Compact), and a dedicated scrollable viewport.
 */
export const SyncCuesPanel: React.FC<SyncCuesPanelProps> = memo(({
  cues,
  scriptThemeId,
  cuePaletteProfile = 'standard',
  selectedCueId,
  activeCueId,
  seekVersion = 0,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange: controlledOnSearchQueryChange,
  selectedCategories: controlledSelectedCategories,
  onToggleCategory: controlledOnToggleCategory,
  onResetFilters: controlledOnResetFilters,
  onSelectCue,
  onDeleteCue,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
  className,
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);

  // Density mode state with persistent localStorage
  const [densityMode, setDensityMode] = useState<CueDensityMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DENSITY_STORAGE_KEY);
      if (saved === 'cards' || saved === 'compact') return saved;
    }
    return 'cards';
  });

  const handleDensityChange = (mode: CueDensityMode) => {
    setDensityMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DENSITY_STORAGE_KEY, mode);
    }
  };

  // Auto-scroll state with persistent localStorage
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUTOSCROLL_STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const handleToggleAutoScroll = useCallback(() => {
    setIsAutoScrollEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTOSCROLL_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // User manual scroll listener to cancel ongoing auto-scroll smoothly without fighting user
  useEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    const handleUserScroll = () => {
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };

    container.addEventListener('wheel', handleUserScroll, { passive: true });
    container.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleUserScroll);
      container.removeEventListener('touchmove', handleUserScroll);
    };
  }, []);

  // Cleanup pending animation frame on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };
  }, []);

  // Search & Category filter states (fallback to internal if not controlled from parent)
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<Set<string>>(new Set());

  const searchQuery = controlledSearchQuery !== undefined ? controlledSearchQuery : internalSearchQuery;
  const selectedCategories = controlledSelectedCategories !== undefined ? controlledSelectedCategories : internalSelectedCategories;

  const handleSearchQueryChange = controlledOnSearchQueryChange || setInternalSearchQuery;

  const handleToggleCategory = controlledOnToggleCategory || ((category: string | null) => {
    if (category === null) {
      setInternalSelectedCategories(new Set());
      return;
    }
    setInternalSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  });

  const handleClearFilters = controlledOnResetFilters || (() => {
    handleSearchQueryChange('');
    if (controlledOnToggleCategory) {
      controlledOnToggleCategory(null);
    } else {
      setInternalSelectedCategories(new Set());
    }
  });

  // Chronologically sorted cues (ascending by startTime, secondary on startIndex)
  const sortedCues = useMemo(() => {
    return [...(cues || [])].sort((a, b) => 
      (a.startTime ?? 0) - (b.startTime ?? 0) || 
      (a.startIndex ?? 0) - (b.startIndex ?? 0)
    );
  }, [cues]);

  // Filtered cues based on search query and multi-select categories using shared filterCues
  const filteredCues = useMemo(() => {
    return filterCues(sortedCues, selectedCategories, searchQuery);
  }, [sortedCues, searchQuery, selectedCategories]);

  const furthestScrollTopRef = useRef<number>(0);

  // Reset forward scroll guard when user seeks backwards, or changes density/filters
  useEffect(() => {
    furthestScrollTopRef.current = 0;
  }, [seekVersion, densityMode, filteredCues]);

  // Auto-scroll logic when activeCueId changes
  useEffect(() => {
    if (!isAutoScrollEnabled || !activeCueId || !viewportRef.current) return;

    // Graceful check: ensure cue is visible in current filtered list
    const isCueVisibleInFiltered = filteredCues.some(c => c.id === activeCueId);
    if (!isCueVisibleInFiltered) return;

    const element = document.getElementById(`sync-cue-${activeCueId}`);
    const container = viewportRef.current;
    if (!element || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop;

    // Center the active cue card in the viewport
    const targetScrollTop = Math.max(0, relativeTop - (containerRect.height / 2) + (elementRect.height / 2));

    // Forward Monotonic Guard: During forward playback, never scroll backwards to an
    // enclosing/parent cue that started earlier just because nested child cues finished.
    if (furthestScrollTopRef.current > 0 && targetScrollTop < furthestScrollTopRef.current - 40) {
      return;
    }

    furthestScrollTopRef.current = Math.max(furthestScrollTopRef.current, targetScrollTop);

    // Deadband guard: avoid micro-jitter if already near target
    if (Math.abs(container.scrollTop - targetScrollTop) > 12) {
      smoothScrollTo(container, targetScrollTop, 350, scrollAnimRef);
    }
  }, [activeCueId, isAutoScrollEnabled, filteredCues]);

  return (
    <div className={cn("flex flex-col h-full overflow-hidden select-none", className)}>
      {/* Permanently Docked Toolbar (Never scrolls away) */}
      <SyncCuesToolbar
        filteredCount={filteredCues.length}
        totalCount={sortedCues.length}
        densityMode={densityMode}
        onDensityModeChange={handleDensityChange}
        isAutoScrollEnabled={isAutoScrollEnabled}
        onToggleAutoScroll={handleToggleAutoScroll}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        onOpenRawCuesModal={onOpenRawCuesModal}
        onRealignCues={onRealignCues}
        isAligning={isAligning}
        alignSuccess={alignSuccess}
        scriptThemeId={scriptThemeId}
        cuePaletteProfile={cuePaletteProfile}
        onResetFilters={handleClearFilters}
      />

      {/* Dedicated Scrollable Cue Viewport */}
      <div ref={viewportRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pt-2.5 pb-2 px-0.5">
        {/* Render Cards Mode */}
        {densityMode === 'cards' && (
          <div className="grid gap-2">
            {filteredCues.map((cue, idx) => (
              <SyncCueCard
                key={cue.id ? `sync-cue-${cue.id}` : `sync-cue-idx-${idx}`}
                cue={cue}
                index={idx}
                isSelected={selectedCueId === cue.id}
                isActive={cue.id === activeCueId}
                onSelectCue={onSelectCue}
                onDeleteCue={onDeleteCue}
                resolveCueColor={resolveCueColor}
              />
            ))}
          </div>
        )}

        {/* Render Compact List Mode */}
        {densityMode === 'compact' && (
          <div className="space-y-1">
            {filteredCues.map((cue, idx) => (
              <SyncCueRow
                key={cue.id ? `sync-row-${cue.id}` : `sync-row-idx-${idx}`}
                cue={cue}
                isSelected={selectedCueId === cue.id}
                isActive={cue.id === activeCueId}
                onSelectCue={onSelectCue}
                onDeleteCue={onDeleteCue}
                resolveCueColor={resolveCueColor}
              />
            ))}
          </div>
        )}

        {/* Empty State: Zero Cues in Project */}
        {sortedCues.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border-subtle rounded-2xl bg-surface-subtle/50 my-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-2.5">
              <Highlighter size={18} />
            </div>
            <p className="text-xs font-bold text-text-main mb-1">No Sync Cues Yet</p>
            <p className="text-[11px] text-text-faint max-w-[240px] leading-relaxed">
              Highlight text in the script editor to author your first timestamped cue.
            </p>
          </div>
        )}

        {/* Empty State: Cues Exist but Filter Matched Zero */}
        {sortedCues.length > 0 && filteredCues.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-6 border border-border-subtle rounded-2xl bg-surface-subtle/30 my-3">
            <FilterX size={20} className="text-text-faint mb-2" />
            <p className="text-xs font-bold text-text-main mb-1">No Matching Cues</p>
            <p className="text-[11px] text-text-faint max-w-[220px] mb-3">
              No cues match {selectedCategories.size > 0 ? `selected categories` : ''}{searchQuery ? ` search "${searchQuery}"` : ''}.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 bg-surface hover:bg-surface-subtle border border-border-main text-text-main text-[10px] font-black uppercase tracking-wider rounded-lg shadow-2xs active:scale-95 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

SyncCuesPanel.displayName = 'SyncCuesPanel';
