import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Play, Pause, RotateCw, Plus, Minus } from 'lucide-react';
import { formatPrecisionTimecode } from '../../lib/utils';
import { cn } from '../../lib/utils';

export interface CueTimingCardProps {
  startTime?: number;
  endTime?: number;
  onStartTimeChange: (time: number | undefined) => void;
  onEndTimeChange: (time: number | undefined) => void;
  onCaptureStartTime: () => void;
  onCaptureEndTime: () => void;
  player?: any;
}

export const CueTimingCard: React.FC<CueTimingCardProps> = memo(({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onCaptureStartTime,
  onCaptureEndTime,
  player,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const checkIntervalRef = useRef<number | null>(null);

  // Live mutable refs to guarantee 0-latency updates during active loop playback without restarting
  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const isLoopingRef = useRef(isLooping);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // Calculate live duration
  const hasValidTimes = startTime !== undefined && endTime !== undefined && !isNaN(startTime) && !isNaN(endTime);
  const rawDuration = hasValidTimes ? Math.max(0, endTime - startTime) : 0;
  const isInvalidRange = hasValidTimes && endTime < startTime;

  // Single-click micro-nudge steppers
  const nudgeStartTime = useCallback((delta: number) => {
    const current = startTimeRef.current !== undefined && !isNaN(startTimeRef.current) ? startTimeRef.current : 0;
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    onStartTimeChange(next);
  }, [onStartTimeChange]);

  const nudgeEndTime = useCallback((delta: number) => {
    const current = endTimeRef.current !== undefined && !isNaN(endTimeRef.current) 
      ? endTimeRef.current 
      : (startTimeRef.current ?? 0);
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    onEndTimeChange(next);
  }, [onEndTimeChange]);

  // Stop preview playback helper
  const stopPreview = useCallback(() => {
    if (checkIntervalRef.current !== null) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (player && typeof player.pauseVideo === 'function') {
      try {
        player.pauseVideo();
      } catch {
        // Player state exception safeguard
      }
    }
    setIsPlayingPreview(false);
  }, [player]);

  // Interactive Play / Loop preview controller
  const handleTogglePreview = useCallback(() => {
    const currentStart = startTimeRef.current;
    const currentEnd = endTimeRef.current;

    if (!player || currentStart === undefined || currentEnd === undefined || currentEnd <= currentStart) {
      return;
    }

    if (isPlayingPreview) {
      stopPreview();
      return;
    }

    try {
      player.seekTo(currentStart, true);
      player.playVideo();
      setIsPlayingPreview(true);

      if (checkIntervalRef.current !== null) {
        clearInterval(checkIntervalRef.current);
      }

      checkIntervalRef.current = window.setInterval(() => {
        if (!player || typeof player.getCurrentTime !== 'function') return;

        // Detect external pause/stop from YouTube player
        if (typeof player.getPlayerState === 'function') {
          const pState = player.getPlayerState();
          if (pState === 2 || pState === 0) { // 2: PAUSED, 0: ENDED
            stopPreview();
            return;
          }
        }

        const cur = player.getCurrentTime();
        const liveStart = startTimeRef.current ?? 0;
        const liveEnd = endTimeRef.current ?? 0;

        // Guard against invalid ranges
        if (liveEnd <= liveStart) {
          stopPreview();
          return;
        }

        // Seamlessly loop or stop when reaching the dynamic end boundary
        if (cur >= liveEnd || cur < liveStart - 1.5) {
          if (isLoopingRef.current) {
            player.seekTo(liveStart, true);
          } else {
            stopPreview();
          }
        }
      }, 40);
    } catch {
      setIsPlayingPreview(false);
    }
  }, [player, isPlayingPreview, stopPreview]);

  // Clean up timer on unmount or when cue boundaries change
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current !== null) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2.5">
      {/* Label and Duration Readout */}
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[9px] uppercase tracking-widest text-text-faint font-black flex items-center gap-1.5">
          <Clock size={11} className="text-blue-500" />
          Timing Deck
        </label>

        <div className="flex items-center gap-2">
          {hasValidTimes && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-2xs",
              isInvalidRange 
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-surface-subtle border border-border-subtle text-text-main"
            )}>
              {isInvalidRange ? 'End < Start' : `⏱ ${rawDuration.toFixed(1)}s`}
            </span>
          )}
        </div>
      </div>

      {/* Symmetrical Two-Column Boundary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* START TIME CARD */}
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-wider text-text-faint">
              Start
            </span>
            {startTime !== undefined && !isNaN(startTime) && (
              <span className="text-[10px] font-mono font-bold text-blue-500 tracking-tight">
                {formatPrecisionTimecode(startTime)}
              </span>
            )}
          </div>

          {/* Numeric Input & Video Time Capture */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.05"
              min="0"
              value={startTime !== undefined && !isNaN(startTime) ? startTime : ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (raw === '') {
                  onStartTimeChange(undefined);
                } else {
                  const parsed = parseFloat(raw);
                  onStartTimeChange(isNaN(parsed) ? undefined : parsed);
                }
              }}
              placeholder="0.00"
              className="w-full bg-surface border border-border-main rounded-lg px-2 py-1 text-text-main font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
            />
            <button
              type="button"
              onClick={onCaptureStartTime}
              title="Capture current video timecode"
              aria-label="Capture start time from video"
              className="p-1.5 bg-surface hover:bg-surface-hover border border-border-main text-blue-500 rounded-lg transition-colors active:scale-95 shrink-0 shadow-2xs"
            >
              <Clock size={13} />
            </button>
          </div>

          {/* Micro-Nudge Stepper Row */}
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => nudgeStartTime(-0.5)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge start backward 0.5s"
            >
              -0.5
            </button>
            <button
              type="button"
              onClick={() => nudgeStartTime(-0.1)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge start backward 0.1s"
            >
              -0.1
            </button>
            <button
              type="button"
              onClick={() => nudgeStartTime(0.1)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge start forward 0.1s"
            >
              +0.1
            </button>
            <button
              type="button"
              onClick={() => nudgeStartTime(0.5)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge start forward 0.5s"
            >
              +0.5
            </button>
          </div>
        </div>

        {/* END TIME CARD */}
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-wider text-text-faint">
              End
            </span>
            {endTime !== undefined && !isNaN(endTime) && (
              <span className="text-[10px] font-mono font-bold text-blue-500 tracking-tight">
                {formatPrecisionTimecode(endTime)}
              </span>
            )}
          </div>

          {/* Numeric Input & Video Time Capture */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.05"
              min="0"
              value={endTime !== undefined && !isNaN(endTime) ? endTime : ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (raw === '') {
                  onEndTimeChange(undefined);
                } else {
                  const parsed = parseFloat(raw);
                  onEndTimeChange(isNaN(parsed) ? undefined : parsed);
                }
              }}
              placeholder="0.00"
              className="w-full bg-surface border border-border-main rounded-lg px-2 py-1 text-text-main font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
            />
            <button
              type="button"
              onClick={onCaptureEndTime}
              title="Capture current video timecode"
              aria-label="Capture end time from video"
              className="p-1.5 bg-surface hover:bg-surface-hover border border-border-main text-blue-500 rounded-lg transition-colors active:scale-95 shrink-0 shadow-2xs"
            >
              <Clock size={13} />
            </button>
          </div>

          {/* Micro-Nudge Stepper Row */}
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => nudgeEndTime(-0.5)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge end backward 0.5s"
            >
              -0.5
            </button>
            <button
              type="button"
              onClick={() => nudgeEndTime(-0.1)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge end backward 0.1s"
            >
              -0.1
            </button>
            <button
              type="button"
              onClick={() => nudgeEndTime(0.1)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge end forward 0.1s"
            >
              +0.1
            </button>
            <button
              type="button"
              onClick={() => nudgeEndTime(0.5)}
              className="py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-muted hover:text-text-main hover:bg-surface-hover active:scale-95 transition-all text-center"
              title="Nudge end forward 0.5s"
            >
              +0.5
            </button>
          </div>
        </div>
      </div>

      {/* Center Audio-Visual Sync Bridge: Cue Preview & Loop Toggle */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-surface-muted/40 border border-border-subtle">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePreview}
            disabled={!player || !hasValidTimes || (endTime !== undefined && startTime !== undefined && endTime <= startTime)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 border shadow-2xs active:scale-95 select-none disabled:opacity-40 disabled:pointer-events-none",
              isPlayingPreview
                ? "bg-blue-500 hover:bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                : "bg-surface hover:bg-surface-hover border-border-main text-text-main"
            )}
            title="Play cue time range in video player"
          >
            {isPlayingPreview ? (
              <>
                <Pause size={12} className="fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={12} className="fill-current" />
                <span>Play Cue</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(prev => !prev)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-150 border shadow-2xs active:scale-95 select-none",
              isLooping
                ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 font-black shadow-2xs"
                : "bg-surface hover:bg-surface-hover border-border-subtle text-text-muted hover:text-text-main"
            )}
            title={isLooping ? "Looping enabled: Repeats cue continuously" : "Click to enable continuous loop playback"}
          >
            <RotateCw size={11} className={cn("transition-transform", isLooping && "rotate-180 text-blue-500")} />
            <span>Loop</span>
          </button>
        </div>

        <span className="text-[9px] font-mono text-text-faint">
          {hasValidTimes ? `${startTime.toFixed(1)}s → ${endTime.toFixed(1)}s` : 'Set start/end time'}
        </span>
      </div>
    </div>
  );
});

CueTimingCard.displayName = 'CueTimingCard';
