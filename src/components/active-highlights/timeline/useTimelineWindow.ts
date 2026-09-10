import { useMemo } from 'react';
import { Cue, TimingSettings } from '../../../types/script';
import { COLORS } from '../../../constants/script';
import { CueThemeResolvedColor } from '../../../styles';
import { isCueActive } from '../../../lib/cueUtils';
import { 
  TimelineWindowConfig, 
  TimelineCalculatedCue, 
  TimelineTimecodeTick 
} from '../types';

interface UseTimelineWindowOptions {
  currentTime: number;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
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
  settings,
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

  // 1. Group and pre-assign stable global sub-lane indices to all cues (runs ONLY when cues array changes)
  const cuesByCategory = useMemo(() => {
    const map = new Map<string, Array<{ cue: Cue; subLaneIndex: number }>>();

    const rawGrouped = new Map<string, Cue[]>();
    (cues || []).forEach(cue => {
      const type = cue.type || 'dialogue';
      let list = rawGrouped.get(type);
      if (!list) {
        list = [];
        rawGrouped.set(type, list);
      }
      list.push(cue);
    });

    // For each category, sort by startTime and assign stable sub-lane indices globally
    rawGrouped.forEach((list, type) => {
      list.sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime);

      const subLaneEndTimes: number[] = [];
      const packedList: Array<{ cue: Cue; subLaneIndex: number }> = [];

      for (const cue of list) {
        let assignedLane = -1;
        for (let i = 0; i < subLaneEndTimes.length; i++) {
          // Allow small 0.05s buffer so back-to-back cues reuse the same lane
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
        packedList.push({ cue, subLaneIndex: assignedLane });
      }

      map.set(type, packedList);
    });

    return map;
  }, [cues]);

  // 2. Determine which cue categories exist in this script
  const existingCategories = useMemo(() => {
    return COLORS.filter(c => cuesByCategory.has(c.type) && !hiddenCueTypes.has(c.type));
  }, [cuesByCategory, hiddenCueTypes]);

  // 3. Compute normalized cue blocks mapped to percentage coordinates using stable sub-lane indices
  const calculatedCuesByLane = useMemo(() => {
    const laneMap = new Map<string, TimelineCalculatedCue[]>();
    existingCategories.forEach(cat => laneMap.set(cat.type, []));

    existingCategories.forEach(cat => {
      const allCategoryCues = cuesByCategory.get(cat.type) || [];
      const visiblePacked = allCategoryCues.filter(
        item => item.cue.endTime >= windowStart && item.cue.startTime <= windowEnd
      );

      // Determine total sub-lanes needed in the current visible window
      const maxSubLane = visiblePacked.length > 0
        ? Math.max(...visiblePacked.map(item => item.subLaneIndex))
        : 0;
      const totalSubLanes = maxSubLane + 1;

      const calculatedList: TimelineCalculatedCue[] = visiblePacked.map(({ cue, subLaneIndex }) => {
        const startClamped = Math.max(cue.startTime, windowStart);
        const endClamped = Math.min(cue.endTime, windowEnd);

        const leftPercent = ((startClamped - windowStart) / totalSpanSeconds) * 100;
        const rawWidthPercent = ((endClamped - startClamped) / totalSpanSeconds) * 100;
        const widthPercent = Math.max(1.8, rawWidthPercent);

        const isPlayheadInside = isCueActive(cue, currentTime, settings);
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
  }, [cuesByCategory, existingCategories, windowStart, windowEnd, totalSpanSeconds, currentTime, resolveCueColor, settings]);

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
