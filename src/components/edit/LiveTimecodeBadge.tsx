import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { formatPrecisionTimecode, cn } from '../../lib/utils';

export interface LiveTimecodeBadgeProps {
  currentTime: number;
  duration?: number;
  isPlaying?: boolean;
  className?: string;
}

/**
 * Precision real-time timecode badge for media playback and edit monitoring.
 * Displays formatted MM:SS.s precision timecode with live playback status indicator.
 */
export const LiveTimecodeBadge: React.FC<LiveTimecodeBadgeProps> = memo(({
  currentTime,
  duration = 0,
  isPlaying = false,
  className,
}) => {
  const formattedCurrent = formatPrecisionTimecode(currentTime);
  const formattedDuration = duration > 0 ? formatPrecisionTimecode(duration) : null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-mono text-[10px] sm:text-[11px] font-bold select-none transition-all duration-150 shadow-2xs",
        isPlaying
          ? "bg-blue-500/5 border-blue-500/30 text-blue-500 dark:text-blue-400"
          : "bg-surface-subtle border-border-subtle text-text-body",
        className
      )}
      title={`Current Playback Timecode: ${formattedCurrent}${formattedDuration ? ` / ${formattedDuration}` : ''}`}
    >
      {/* Live Activity Pip */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {isPlaying && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-1.5 w-1.5 transition-colors duration-200",
            isPlaying ? "bg-blue-500" : "bg-text-faint/60"
          )}
        />
      </span>

      {/* Clock Icon */}
      <Clock size={10} className="text-text-faint shrink-0" />

      {/* Current Timecode */}
      <span className="tracking-tight text-text-main font-black">
        {formattedCurrent}
      </span>

      {/* Optional Total Duration */}
      {formattedDuration && (
        <span className="text-text-faint font-normal tracking-tight text-[9.5px]">
          / {formattedDuration}
        </span>
      )}
    </div>
  );
});

LiveTimecodeBadge.displayName = 'LiveTimecodeBadge';
