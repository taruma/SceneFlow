import React from 'react';
import { ColorCategory } from '../../../types/script';
import { Cue } from '../../../types/script';
import { TimelineCalculatedCue, TimelineDensity } from '../types';
import { TimelineCueBlock } from './TimelineCueBlock';
import { cn } from '../../../lib/utils';

export interface TimelineLaneProps {
  category: ColorCategory;
  items: TimelineCalculatedCue[];
  selectedCueId?: string;
  onCueClick?: (cue: Cue) => void;
  themedColor?: { rgb?: string };
  isPlaying?: boolean;
  density?: TimelineDensity;
  isHidden?: boolean;
  onToggleVisibility?: (categoryType: string) => void;
}

/**
 * Single horizontal category track within the multi-track sync timeline.
 *
 * Provides:
 * - Interactive category tag header on the left with department indicator dot and toggle support.
 * - Stationary, zero-layout-shift horizontal track container.
 * - Dynamic density scaling (comfortable 32px vs compact 24px).
 * - Sliding cue blocks dynamically mapped within this lane.
 */
export const TimelineLane = React.memo<TimelineLaneProps>(({
  category,
  items,
  selectedCueId,
  onCueClick,
  themedColor,
  isPlaying = false,
  density = 'comfortable',
  isHidden = false,
  onToggleVisibility,
}) => {
  const rgb = themedColor?.rgb || category.rgb || '150, 150, 150';
  const hasActiveCue = items.some(item => item.isPlayheadInside);
  const totalSubLanes = items.length > 0 ? Math.max(...items.map(i => i.totalSubLanes)) : 1;
  const isCompact = density === 'compact';
  const subLaneStep = isCompact ? 20 : 26;
  const baseHeight = isCompact ? 24 : 32;
  const trackHeightPx = isHidden 
    ? 0 
    : Math.max(baseHeight, totalSubLanes * subLaneStep + (isCompact ? 4 : 6));

  return (
    <div className="flex items-start gap-2 group">
      {/* Category Track Header */}
      <button
        type="button"
        disabled={!onToggleVisibility}
        onClick={() => onToggleVisibility?.(category.type)}
        title={onToggleVisibility ? (isHidden ? `Show ${category.type} cues` : `Hide ${category.type} cues`) : undefined}
        className={cn(
          "w-22 shrink-0 flex items-center gap-1.5 px-2 py-1 mt-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none text-left",
          onToggleVisibility && "cursor-pointer hover:border-border-main active:scale-95",
          isHidden
            ? "opacity-50 line-through bg-surface-subtle/40 border border-border-subtle/30 text-text-faint"
            : hasActiveCue 
              ? "bg-surface border border-border-main text-text-main shadow-xs" 
              : "text-text-muted opacity-80 hover:opacity-100"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-transform",
            hasActiveCue && !isHidden && "scale-125 animate-pulse"
          )}
          style={{ backgroundColor: isHidden ? undefined : `rgb(${rgb})` }}
        />
        <span className="truncate">{category.type}</span>
      </button>

      {/* Horizontal Track Field with Dynamic Height */}
      {!isHidden && (
        <div 
          style={{ height: `${trackHeightPx}px` }}
          className="relative flex-1 rounded-lg bg-surface-subtle/60 border border-border-subtle/50 overflow-hidden shadow-inner transition-[height] duration-200"
        >
          {/* Track subtle center guide lines for sub-lanes */}
          {totalSubLanes > 1 && Array.from({ length: totalSubLanes - 1 }).map((_, idx) => (
            <div
              key={`sublane-guide-${idx}`}
              className="absolute inset-x-0 border-t border-border-subtle/20 pointer-events-none"
              style={{ top: `${(idx + 1) * subLaneStep + (isCompact ? 2 : 3)}px` }}
            />
          ))}

          {/* Render Cue Blocks */}
          {items.map(item => (
            <TimelineCueBlock
              key={item.cue.id ? `block-${item.cue.id}` : `block-${item.cue.startIndex}-${item.cue.startTime}`}
              item={item}
              onClick={onCueClick}
              isSelected={selectedCueId === item.cue.id}
              isPlaying={isPlaying}
            />
          ))}
        </div>
      )}
    </div>
  );
});

TimelineLane.displayName = 'TimelineLane';
