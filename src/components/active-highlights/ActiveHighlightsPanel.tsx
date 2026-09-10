import React, { useState, useMemo, useEffect } from 'react';
import { Video, Activity, Layers } from 'lucide-react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { ActiveHighlightsPanelProps, HighlightViewMode } from './types';
import { HighlightFilterBar } from './HighlightFilterBar';
import { HighlightTimelineView } from './views/HighlightTimelineView';
import { HighlightCardsView } from './views/HighlightCardsView';

const STORAGE_KEY = 'sceneflow_highlight_view_mode';

/**
 * Top-level Active Highlights Panel orchestrator.
 *
 * Features:
 * - Segmented view mode switcher: [ 📊 Timeline | 🗂 Cards (Legacy) ] with persistent localStorage memory.
 * - Live category filter bar with theme-resolved color pips and active pulse effects.
 * - Zero-layout-shift Multi-Track Sync Timeline (default modern view).
 * - Preserved Classic Cards list (legacy view).
 */
export const ActiveHighlightsPanel: React.FC<ActiveHighlightsPanelProps> = ({
  cues,
  settings,
  isCueVisible,
  activeCueTypes,
  hiddenCueTypes,
  toggleCueTypeVisibility,
  scriptThemeId,
  currentTime = 0,
  isPlaying = false,
  onSeekTo,
  onSeekCue,
  viewMode: controlledMode,
  onViewModeChange,
  onCueClick,
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any);

  // Persistent view mode state (default to 'timeline')
  const [internalMode, setInternalMode] = useState<HighlightViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'timeline' || saved === 'cards') return saved;
    }
    return 'timeline';
  });

  const activeMode = controlledMode || internalMode;

  const handleModeSwitch = (newMode: HighlightViewMode) => {
    setInternalMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    onViewModeChange?.(newMode);
  };

  // Memoize visible cues for counter and legacy cards view
  const visibleCues = useMemo(() => {
    const filtered = (cues || []).filter(isCueVisible);
    const categoryOrder = COLORS.map(c => c.type);

    return [...filtered].sort((a, b) => {
      const orderA = categoryOrder.indexOf(a.type || 'dialogue');
      const orderB = categoryOrder.indexOf(b.type || 'dialogue');
      return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
    });
  }, [cues, isCueVisible]);

  return (
    <div className="hidden lg:flex flex-col flex-1 mt-6 animate-in fade-in slide-in-from-left-4 duration-700 min-h-0">
      {/* Panel Header, View Switcher & Counter */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2")}>
          <Video size={14} /> Active Highlights
        </h3>

        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs">
            <button
              type="button"
              onClick={() => handleModeSwitch('timeline')}
              title="Multi-Track Sync Timeline"
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none border",
                activeMode === 'timeline'
                  ? "bg-surface text-text-main border-border-main shadow-xs"
                  : "text-text-muted hover:text-text-main border-transparent"
              )}
            >
              <Activity size={10} />
              <span className="leading-none">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('cards')}
              title="Classic Cards (Legacy)"
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none border",
                activeMode === 'cards'
                  ? "bg-surface text-text-main border-border-main shadow-xs"
                  : "text-text-muted hover:text-text-main border-transparent"
              )}
            >
              <Layers size={10} />
              <span className="leading-none">Cards</span>
            </button>
          </div>

          {/* Active Count Badge */}
          <span className="flex items-center justify-center px-2.5 py-1 bg-surface-subtle border border-border-subtle rounded-lg text-[9px] font-black tracking-wider uppercase text-text-muted shadow-xs select-none">
            {visibleCues.length} active
          </span>
        </div>
      </div>

      {/* Category Legend & Filter Controls */}
      <HighlightFilterBar
        activeCueTypes={activeCueTypes}
        hiddenCueTypes={hiddenCueTypes}
        onToggleCueType={toggleCueTypeVisibility}
        resolveCueColor={resolveCueColor}
      />

      {/* View Presentation Switcher */}
      {activeMode === 'timeline' ? (
        <HighlightTimelineView
          currentTime={currentTime}
          isPlaying={isPlaying}
          cues={cues}
          settings={settings}
          hiddenCueTypes={hiddenCueTypes}
          resolveCueColor={resolveCueColor}
          onSeekCue={onSeekCue || onCueClick}
          onSeekTo={onSeekTo}
        />
      ) : (
        <HighlightCardsView
          visibleCues={visibleCues}
          resolveCueColor={resolveCueColor}
          onCueClick={onSeekCue || onCueClick}
        />
      )}
    </div>
  );
};
