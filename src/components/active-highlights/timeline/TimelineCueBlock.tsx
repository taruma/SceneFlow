import React from 'react';
import { Cue } from '../../../types/script';
import { TimelineCalculatedCue } from '../types';
import { cn } from '../../../lib/utils';
import { formatTimelineTimecode } from './useTimelineWindow';

interface TimelineCueBlockProps {
  item: TimelineCalculatedCue;
  onClick?: (cue: Cue) => void;
  isSelected?: boolean;
  isPlaying?: boolean;
}

/**
 * Individual cue block rendered along a horizontal timeline lane.
 *
 * Features:
 * - Positioned via percentage offsets (`leftPercent`, `widthPercent`).
 * - Active state illumination when intersected by the playback playhead.
 * - Dynamic theme tinting with subtle glassmorphic backdrop.
 * - Truncated snippet text with full tooltip preview on hover.
 */
export const TimelineCueBlock = React.memo<TimelineCueBlockProps>(({
  item,
  onClick,
  isSelected = false,
  isPlaying = false,
}) => {
  const { cue, leftPercent, widthPercent, isPlayheadInside, themedColor, subLaneIndex = 0 } = item;
  const rgb = themedColor.rgb || '255, 255, 255';
  const topPx = subLaneIndex * 26 + 3;

  const tooltip = `${cue.type?.toUpperCase() || 'CUE'}: "${cue.selectedText}" (${formatTimelineTimecode(cue.startTime)} - ${formatTimelineTimecode(cue.endTime)})`;

  return (
    <div
      role="button"
      tabIndex={0}
      title={tooltip}
      onClick={() => onClick?.(cue)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(cue);
        }
      }}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        top: `${topPx}px`,
        height: '22px',
        backgroundColor: `rgba(${rgb}, ${isPlayheadInside ? 0.35 : 0.18})`,
        borderColor: `rgba(${rgb}, ${isPlayheadInside ? 0.9 : 0.45})`,
        willChange: 'left, width',
        transition: isPlaying ? 'left 100ms linear, width 100ms linear' : 'none',
      }}
      className={cn(
        "absolute flex items-center px-2 rounded-md border text-[11px] font-sans transition-colors duration-150 cursor-pointer select-none overflow-hidden",
        "hover:brightness-125 hover:z-20",
        isPlayheadInside && "ring-1 shadow-sm z-10 font-semibold",
        isSelected && "ring-2 ring-white/80 z-30"
      )}
    >
      {/* Category indicator pip */}
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0 mr-1.5",
          isPlayheadInside && "animate-pulse"
        )}
        style={{ backgroundColor: `rgb(${rgb})` }}
      />

      {/* Snippet text */}
      <span className="truncate text-text-body font-serif italic tracking-tight">
        "{cue.selectedText}"
      </span>
    </div>
  );
});

TimelineCueBlock.displayName = 'TimelineCueBlock';
