import React, { useMemo } from 'react';
import { Video } from 'lucide-react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { ActiveHighlightsPanelProps } from './types';
import { HighlightFilterBar } from './HighlightFilterBar';
import { HighlightCard } from './HighlightCard';

/**
 * Orchestrator panel for displaying active screenplay highlights during video playback.
 *
 * Responsibilities:
 * - Computes and memoizes active, visible cues based on playback time and filter toggles.
 * - Displays active cue counter badge and cue category filter legend.
 * - Renders active highlight cards sorted according to canonical cue category order.
 * - Displays empty state placeholder when no cues are active.
 */
export const ActiveHighlightsPanel: React.FC<ActiveHighlightsPanelProps> = ({
  cues,
  isCueVisible,
  activeCueTypes,
  hiddenCueTypes,
  toggleCueTypeVisibility,
  scriptThemeId,
  onCueClick,
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any);

  // Memoize visible cues and category ordering to prevent unnecessary sorting on rapid ticks
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
    <div className="hidden lg:flex flex-col flex-1 mt-10 animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Panel Header & Counter */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2")}>
          <Video size={14} /> Active Highlights
        </h3>
        <span className={UI_TOKENS.badge.counter}>
          {visibleCues.length} active
        </span>
      </div>

      {/* Category Legend & Filter Controls */}
      <HighlightFilterBar
        activeCueTypes={activeCueTypes}
        hiddenCueTypes={hiddenCueTypes}
        onToggleCueType={toggleCueTypeVisibility}
        resolveCueColor={resolveCueColor}
      />

      {/* Cue Display Stream / Cards List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {visibleCues.map((cue, idx) => {
          const themed = resolveCueColor(cue.type || cue.colorClass || '');
          const itemKey = cue.id ? `highlight-${cue.id}-${idx}` : `highlight-idx-${idx}`;

          return (
            <HighlightCard
              key={itemKey}
              cue={cue}
              themedColor={themed}
              index={idx}
              onClick={onCueClick}
            />
          );
        })}

        {visibleCues.length === 0 && (
          <div className={cn(UI_TOKENS.panel.emptyPlaceholder, "py-8")}>
            <p className="text-xs text-text-faint italic">No active highlights at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};
