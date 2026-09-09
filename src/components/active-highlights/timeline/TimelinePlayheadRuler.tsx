import React from 'react';
import { TimelineTimecodeTick } from '../types';

interface TimelinePlayheadRulerProps {
  playheadPercent: number;
  rulerTicks: TimelineTimecodeTick[];
}

/**
 * Stationary playhead marker and bottom timecode ruler for the sync timeline.
 *
 * Features:
 * - Playhead vertical line anchored at 35% anticipation position.
 * - Glowing playhead marker badge at the top.
 * - Bottom ruler displaying 1-second ticks and MM:SS labels sliding in real-time.
 */
export const TimelinePlayheadRuler: React.FC<TimelinePlayheadRulerProps> = ({
  playheadPercent,
  rulerTicks,
}) => {
  return (
    <>
      {/* Vertical Playhead Overlay (Stationary at ~35%) */}
      <div
        className="absolute top-0 bottom-6 w-px pointer-events-none z-30 transition-[left] duration-75"
        style={{ left: `${playheadPercent}%` }}
      >
        {/* Glowing playhead line */}
        <div className="w-full h-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />

        {/* Playhead top pip */}
        <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-red-500 rounded-xs shadow-sm" />
      </div>

      {/* Bottom Timecode Ruler */}
      <div className="relative h-6 mt-2 pt-1 border-t border-border-subtle/60 select-none overflow-hidden">
        {rulerTicks.map(tick => (
          <div
            key={`tick-${tick.timeSeconds}`}
            className="absolute top-0 flex flex-col items-center -translate-x-1/2 transition-[left] duration-75 pointer-events-none"
            style={{ left: `${tick.leftPercent}%` }}
          >
            {/* Tick pip */}
            <div
              className={`w-px ${
                tick.isMajor ? 'h-2 bg-border-main' : 'h-1.5 bg-border-subtle'
              }`}
            />
            {/* Time label on major ticks */}
            {tick.isMajor && (
              <span className="text-[9px] font-mono tracking-tighter text-text-faint mt-0.5">
                {tick.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};
