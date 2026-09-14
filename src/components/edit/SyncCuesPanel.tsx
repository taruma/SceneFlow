import React, { memo, useMemo, useState, useEffect } from 'react';
import { FilterX, Highlighter } from 'lucide-react';
import { Cue } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { COLORS } from '../../constants/script';
import { LEGACY_CLASS_MAP } from '../../styles/tokens/cues';
import { SyncCuesToolbar, CueDensityMode } from './SyncCuesToolbar';
import { SyncCueCard } from './SyncCueCard';
import { SyncCueRow } from './SyncCueRow';

const DENSITY_STORAGE_KEY = 'sceneflow_edit_cue_density';

export interface SyncCuesPanelProps {
  cues: Cue[];
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  selectedCueId?: string;
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
  onSelectCue,
  onDeleteCue,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
  className,
}) => {
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

  // Search & Category filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Chronologically sorted cues (ascending by startTime, secondary on startIndex)
  const sortedCues = useMemo(() => {
    return [...(cues || [])].sort((a, b) => 
      (a.startTime ?? 0) - (b.startTime ?? 0) || 
      (a.startIndex ?? 0) - (b.startIndex ?? 0)
    );
  }, [cues]);

  // Filtered cues based on search query and selected category
  const filteredCues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return sortedCues.filter(cue => {
      const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';

      // 1. Category filter
      if (selectedCategory && cueType !== selectedCategory) {
        return false;
      }

      // 2. Search query filter
      if (q) {
        const textMatch = cue.selectedText?.toLowerCase().includes(q);
        const typeMatch = cueType.toLowerCase().includes(q);
        const startStr = (cue.startTime ?? 0).toFixed(1);
        const endStr = (cue.endTime ?? 0).toFixed(1);
        const timeMatch = startStr.includes(q) || endStr.includes(q);

        return textMatch || typeMatch || timeMatch;
      }

      return true;
    });
  }, [sortedCues, searchQuery, selectedCategory]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Permanently Docked Toolbar (Never scrolls away) */}
      <SyncCuesToolbar
        filteredCount={filteredCues.length}
        totalCount={sortedCues.length}
        densityMode={densityMode}
        onDensityModeChange={handleDensityChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenRawCuesModal={onOpenRawCuesModal}
        onRealignCues={onRealignCues}
        isAligning={isAligning}
        alignSuccess={alignSuccess}
        scriptThemeId={scriptThemeId}
        cuePaletteProfile={cuePaletteProfile}
      />

      {/* Dedicated Scrollable Cue Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide py-2 px-0.5">
        {/* Render Cards Mode */}
        {densityMode === 'cards' && (
          <div className="grid gap-2">
            {filteredCues.map((cue, idx) => (
              <SyncCueCard
                key={cue.id ? `sync-cue-${cue.id}-${idx}` : `sync-cue-idx-${idx}`}
                cue={cue}
                isSelected={selectedCueId === cue.id}
                onSelectCue={onSelectCue}
                onDeleteCue={onDeleteCue}
                scriptThemeId={scriptThemeId}
                cuePaletteProfile={cuePaletteProfile}
              />
            ))}
          </div>
        )}

        {/* Render Compact List Mode */}
        {densityMode === 'compact' && (
          <div className="space-y-1">
            {filteredCues.map((cue, idx) => (
              <SyncCueRow
                key={cue.id ? `sync-row-${cue.id}-${idx}` : `sync-row-idx-${idx}`}
                cue={cue}
                isSelected={selectedCueId === cue.id}
                onSelectCue={onSelectCue}
                onDeleteCue={onDeleteCue}
                scriptThemeId={scriptThemeId}
                cuePaletteProfile={cuePaletteProfile}
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
              No cues match {selectedCategory ? `category "${selectedCategory}"` : ''}{searchQuery ? ` search "${searchQuery}"` : ''}.
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
