import React from 'react';
import { ColorCategory } from '../../../types/script';
import { Cue } from '../../../types/script';
import { TimelineCalculatedCue } from '../types';
import { TimelineCueBlock } from './TimelineCueBlock';
import { cn } from '../../../lib/utils';

interface TimelineLaneProps {
  category: ColorCategory;
  items: TimelineCalculatedCue[];
  selectedCueId?: string;
  onCueClick?: (cue: Cue) => void;
  themedColor?: { rgb?: string };
}

/**
 * Single horizontal category track within the multi-track sync timeline.
 *
 * Provides:
 * - Fixed category tag header on the left with department indicator dot.
 * - Stationary, zero-layout-shift horizontal track container.
 * - Sliding cue blocks dynamically mapped within this lane.
 */
export const TimelineLane: React.FC<TimelineLaneProps> = ({
  category,
  items,
  selectedCueId,
  onCueClick,
  themedColor,
}) => {
  const rgb = themedColor?.rgb || category.rgb || '150, 150, 150';
  const hasActiveCue = items.some(item => item.isPlayheadInside);
  const totalSubLanes = items.length > 0 ? Math.max(...items.map(i => i.totalSubLanes)) : 1;
  const trackHeightPx = Math.max(32, totalSubLanes * 26 + 6);

  return (
    <div className="flex items-start gap-2 group">
      {/* Category Track Header */}
      <div 
        className={cn(
          "w-22 shrink-0 flex items-center gap-1.5 px-2 py-1 mt-0.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-colors select-none",
          hasActiveCue 
            ? "bg-surface border border-border-main text-text-main shadow-xs" 
            : "text-text-muted opacity-80"
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 transition-transform",
            hasActiveCue && "scale-125 animate-pulse"
          )}
          style={{ backgroundColor: `rgb(${rgb})` }}
        />
        <span className="truncate">{category.type}</span>
      </div>

      {/* Horizontal Track Field with Dynamic Height */}
      <div 
        style={{ height: `${trackHeightPx}px` }}
        className="relative flex-1 rounded-lg bg-surface-subtle/60 border border-border-subtle/50 overflow-hidden shadow-inner transition-[height] duration-200"
      >
        {/* Track subtle center guide lines for sub-lanes */}
        {totalSubLanes > 1 && Array.from({ length: totalSubLanes - 1 }).map((_, idx) => (
          <div
            key={`sublane-guide-${idx}`}
            className="absolute inset-x-0 border-t border-border-subtle/20 pointer-events-none"
            style={{ top: `${(idx + 1) * 26 + 3}px` }}
          />
        ))}

        {/* Render Cue Blocks */}
        {items.map(item => (
          <TimelineCueBlock
            key={item.cue.id ? `block-${item.cue.id}` : `block-${item.cue.startIndex}-${item.cue.startTime}`}
            item={item}
            onClick={onCueClick}
            isSelected={selectedCueId === item.cue.id}
          />
        ))}
      </div>
    </div>
  );
};
