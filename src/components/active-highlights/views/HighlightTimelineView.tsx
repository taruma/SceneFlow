import React, { useState, useMemo, useEffect } from 'react';
import { Cue, TimingSettings } from '../../../types/script';
import { CueThemeResolvedColor } from '../../../styles';
import { isCueActive } from '../../../lib/cueUtils';
import { TimelineDensity } from '../types';
import { useTimelineWindow } from '../timeline/useTimelineWindow';
import { TimelineLane } from '../timeline/TimelineLane';
import { TimelinePlayheadRuler } from '../timeline/TimelinePlayheadRuler';
import { PausedInspectorCard } from '../inspector/PausedInspectorCard';
import { UI_TOKENS } from '../../../styles/tokens/ui';
import { cn } from '../../../lib/utils';

interface HighlightTimelineViewProps {
  currentTime: number;
  isPlaying: boolean;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
  hiddenCueTypes: Set<string>;
  resolveCueColor: (typeOrClass?: string) => CueThemeResolvedColor;
  onSeekCue?: (cue: Cue, autoPlay?: boolean) => void;
  onSeekTo?: (seconds: number, autoPlay?: boolean) => void;
  density?: TimelineDensity;
  onToggleCueType?: (type: string) => void;
}

/**
 * Multi-Track Sync Timeline view displaying horizontal tracks with a stationary
 * 35% playhead, continuous timecode ruler, and docked paused cue inspector.
 */
export const HighlightTimelineView: React.FC<HighlightTimelineViewProps> = ({
  currentTime,
  isPlaying,
  cues,
  settings,
  hiddenCueTypes,
  resolveCueColor,
  onSeekCue,
  onSeekTo,
  density = 'comfortable',
  onToggleCueType,
}) => {
  const [selectedCue, setSelectedCue] = useState<Cue | null>(null);

  const {
    playheadPercent,
    existingCategories,
    calculatedCuesByLane,
    rulerTicks,
  } = useTimelineWindow({
    currentTime,
    cues,
    settings,
    hiddenCueTypes,
    resolveCueColor,
  });

  // Identify all cues currently active under the playhead (respecting timing buffers)
  const activeCuesUnderPlayhead = useMemo(() => {
    return (cues || []).filter(cue => {
      if (hiddenCueTypes.has(cue.type || 'dialogue')) return false;
      return isCueActive(cue, currentTime, settings);
    });
  }, [cues, hiddenCueTypes, currentTime, settings]);

  // If playback resumes, clear manually selected cue so inspector follows live playhead
  useEffect(() => {
    if (isPlaying) {
      setSelectedCue(null);
    }
  }, [isPlaying]);

  const handleCueClick = (cue: Cue) => {
    setSelectedCue(cue);
    onSeekCue?.(cue);
  };

  const handleReplayCue = (cue: Cue) => {
    if (onSeekTo) {
      onSeekTo(cue.startTime, true);
    } else if (onSeekCue) {
      onSeekCue(cue, true);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-2">
      {/* Horizontal Multi-Track Container */}
      <div className="relative p-3 bg-surface/70 border border-border-main rounded-xl shadow-xs overflow-hidden">
        {/* Track Lanes Stack */}
        <div className="space-y-1.5 min-h-[72px]">
          {existingCategories.map(category => {
            const items = calculatedCuesByLane.get(category.type) || [];
            const themed = resolveCueColor(category.type);

            return (
              <TimelineLane
                key={`lane-${category.type}`}
                category={category}
                items={items}
                selectedCueId={selectedCue?.id}
                onCueClick={handleCueClick}
                themedColor={themed}
                isPlaying={isPlaying}
                density={density}
                isHidden={hiddenCueTypes.has(category.type)}
                onToggleVisibility={onToggleCueType}
              />
            );
          })}

          {existingCategories.length === 0 && (
            <div className={cn(UI_TOKENS.panel.emptyPlaceholder, "py-6 text-xs text-text-faint italic")}>
              No cue categories enabled in filter or present in scene
            </div>
          )}
        </div>

        {/* Playhead Overlay & Bottom Timecode Ruler */}
        {existingCategories.length > 0 && (
          <TimelinePlayheadRuler
            playheadPercent={playheadPercent}
            rulerTicks={rulerTicks}
            isPlaying={isPlaying}
          />
        )}
      </div>

      {/* Docked Inspector Card (visible when paused or when cue is selected) */}
      {(!isPlaying || selectedCue !== null) && (
        <PausedInspectorCard
          activeCues={activeCuesUnderPlayhead}
          selectedCue={selectedCue}
          onSelectCue={setSelectedCue}
          onReplayCue={handleReplayCue}
          resolveCueColor={resolveCueColor}
        />
      )}
    </div>
  );
};
