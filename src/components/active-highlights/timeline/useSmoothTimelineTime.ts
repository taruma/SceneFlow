import { useState, useRef, useEffect } from 'react';

interface UseSmoothTimelineTimeOptions {
  currentTime: number;
  isPlaying: boolean;
  playbackRate?: number;
}

/**
 * High-precision timeline clock extrapolator for 144Hz/high-refresh displays.
 *
 * In web media players, external sources (such as YouTube IFrame API) report `currentTime`
 * in coarse, jittery 100ms intervals. This hook bridges the gap by running a continuous
 * `requestAnimationFrame` loop that advances timeline time at `playbackRate` seconds/second,
 * while soft-syncing to incoming 100ms ticks to prevent drift without visual pops.
 */
export function useSmoothTimelineTime({
  currentTime,
  isPlaying,
  playbackRate = 1.0,
}: UseSmoothTimelineTimeOptions): number {
  const [smoothTime, setSmoothTime] = useState<number>(currentTime);
  const anchorRef = useRef<{
    time: number;
    timestamp: number;
  }>({
    time: currentTime,
    timestamp: performance.now(),
  });

  const rafRef = useRef<number | null>(null);

  // When paused, immediately mirror currentTime with zero overhead
  useEffect(() => {
    if (!isPlaying) {
      setSmoothTime(currentTime);
      anchorRef.current = {
        time: currentTime,
        timestamp: performance.now(),
      };
    }
  }, [currentTime, isPlaying]);

  // Handle updates to currentTime while playing (seeking or 100ms tick updates)
  useEffect(() => {
    if (!isPlaying) return;

    const now = performance.now();
    const elapsedSinceAnchor = (now - anchorRef.current.timestamp) / 1000;
    const currentEstimated = anchorRef.current.time + elapsedSinceAnchor * playbackRate;
    const drift = currentTime - currentEstimated;

    // If drift is large (> 0.35s), user jumped/seeked; snap immediately
    if (Math.abs(drift) > 0.35) {
      anchorRef.current = {
        time: currentTime,
        timestamp: now,
      };
      setSmoothTime(currentTime);
    } else {
      // Soft-sync: absorb 35% of the drift per tick to prevent drift accumulation without jerkiness
      anchorRef.current = {
        time: currentEstimated + drift * 0.35,
        timestamp: now,
      };
    }
  }, [currentTime, isPlaying, playbackRate]);

  // rAF animation loop running strictly while isPlaying
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const tick = () => {
      if (isCancelled) return;

      const now = performance.now();
      const elapsed = (now - anchorRef.current.timestamp) / 1000;
      const nextTime = Math.max(0, anchorRef.current.time + elapsed * playbackRate);

      setSmoothTime(nextTime);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      isCancelled = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, playbackRate]);

  return isPlaying ? smoothTime : currentTime;
}
