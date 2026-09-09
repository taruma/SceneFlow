import { useMemo } from 'react';
import { Cue } from '../../../types/script';
import { COLORS } from '../../../constants/script';
import { CueThemeResolvedColor } from '../../../styles';
import { 
  TimelineWindowConfig, 
  TimelineCalculatedCue, 
  TimelineTimecodeTick 
} from '../types';

interface UseTimelineWindowOptions {
  currentTime: number;
  cues: Cue[];
  hiddenCueTypes: Set<string>;
  resolveCueColor: (typeOrClass?: string) => CueThemeResolvedColor;
  config?: TimelineWindowConfig;
}

/**
 * Format raw seconds into standard MM:SS timecode string.
 */
export function formatTimelineTimecode(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Headless hook that computes the rolling time window, percentage-based cue block coordinates,
 * stationary playhead anchor, and timecode ruler ticks for the multi-track timeline.
 */
export function useTimelineWindow({
  currentTime,
  cues,
  hiddenCueTypes,
  resolveCueColor,
  config = {},
}: UseTimelineWindowOptions) {
  const { totalSpanSeconds = 8.0, playheadRatio = 0.35 } = config;

  const pastSpan = totalSpanSeconds * playheadRatio;
  const futureSpan = totalSpanSeconds * (1 - playheadRatio);

  // Determine window bounds (preventing negative time at video start)
  const windowStart = Math.max(0, currentTime - pastSpan);
  const windowEnd = windowStart + totalSpanSeconds;

  // Actual playhead left percentage (anchors at playheadRatio once currentTime >= pastSpan)
  const playheadPercent = Math.min(100, Math.max(0, ((currentTime - windowStart) / totalSpanSeconds) * 100));

  // 1. Group and pre-sort all project cues by category (runs ONLY when cues array changes)
  const cuesByCategory = useMemo(() => {
    const map = new Map<string, Cue[]>();
    (cues || []).forEach(cue => {
      const type = cue.type || 'dialogue';
      let list = map.get(type);
      if (!list) {
        list = [];
        map.set(type, list);
      }
      list.push(cue);
    });

    // Pre-sort each category list once by startTime, then endTime
    map.forEach(list => list.sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime));
    return map;
  }, [cues]);

  // 2. Determine which cue categories exist in this script
  const existingCategories = useMemo(() => {
    return COLORS.filter(c => cuesByCategory.has(c.type) && !hiddenCueTypes.has(c.type));
  }, [cuesByCategory, hiddenCueTypes]);

  // 3. Compute normalized cue blocks mapped to percentage coordinates with interval packing (sub-lanes)
  const calculatedCuesByLane = useMemo(() => {
    const laneMap = new Map<string, TimelineCalculatedCue[]>();
    existingCategories.forEach(cat => laneMap.set(cat.type, []));

    // For each active category, only examine pre-grouped cues intersecting current window
    existingCategories.forEach(cat => {
      const allCategoryCues = cuesByCategory.get(cat.type) || [];
      const laneCues = allCategoryCues.filter(
        cue => cue.endTime >= windowStart && cue.startTime <= windowEnd
      );

      const subLaneEndTimes: number[] = [];
      const packed: Array<{ cue: Cue; subLaneIndex: number }> = [];

      for (const cue of laneCues) {
        let assignedLane = -1;
        for (let i = 0; i < subLaneEndTimes.length; i++) {
          // Allow tiny buffer so back-to-back cues share lane cleanly
          if (cue.startTime >= subLaneEndTimes[i] - 0.05) {
            assignedLane = i;
            subLaneEndTimes[i] = cue.endTime;
            break;
          }
        }
        if (assignedLane === -1) {
          assignedLane = subLaneEndTimes.length;
          subLaneEndTimes.push(cue.endTime);
        }
        packed.push({ cue, subLaneIndex: assignedLane });
      }

      const totalSubLanes = Math.max(1, subLaneEndTimes.length);

      const calculatedList: TimelineCalculatedCue[] = packed.map(({ cue, subLaneIndex }) => {
        const startClamped = Math.max(cue.startTime, windowStart);
        const endClamped = Math.min(cue.endTime, windowEnd);

        const leftPercent = ((startClamped - windowStart) / totalSpanSeconds) * 100;
        const rawWidthPercent = ((endClamped - startClamped) / totalSpanSeconds) * 100;
        const widthPercent = Math.max(1.8, rawWidthPercent);

        const isPlayheadInside = currentTime >= cue.startTime && currentTime <= cue.endTime;
        const themedColor = resolveCueColor(cue.type || cue.colorClass || '');

        return {
          cue,
          leftPercent,
          widthPercent,
          isPlayheadInside,
          themedColor,
          subLaneIndex,
          totalSubLanes,
        };
      });

      laneMap.set(cat.type, calculatedList);
    });

    return laneMap;
  }, [cues, existingCategories, hiddenCueTypes, windowStart, windowEnd, totalSpanSeconds, currentTime, resolveCueColor]);

  // Generate 1-second ruler tick marks
  const rulerTicks = useMemo(() => {
    const ticks: TimelineTimecodeTick[] = [];
    const firstSec = Math.floor(windowStart);
    const lastSec = Math.ceil(windowEnd);

    for (let s = firstSec; s <= lastSec; s++) {
      if (s < 0) continue;
      const left = ((s - windowStart) / totalSpanSeconds) * 100;
      if (left >= -2 && left <= 102) {
        ticks.push({
          timeSeconds: s,
          label: formatTimelineTimecode(s),
          leftPercent: left,
          isMajor: s % 2 === 0, // Major tick every 2s, minor every 1s
        });
      }
    }

    return ticks;
  }, [windowStart, windowEnd, totalSpanSeconds]);

  return {
    windowStart,
    windowEnd,
    totalSpanSeconds,
    playheadPercent,
    existingCategories,
    calculatedCuesByLane,
    rulerTicks,
  };
}
