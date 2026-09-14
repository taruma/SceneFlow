import React, { memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Cue, TimingSettings, AppMode } from '../../types/script';
import { extractYoutubeId, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { CuePaletteProfile } from '../../styles';
import { ActiveHighlightsPanel } from '../ActiveHighlightsPanel';
import { TimelineDensity } from '../active-highlights/types';
import { DEFAULT_VIDEO_HEIGHT } from '../../hooks/useScriptPreferences';
import { VideoSplitDivider } from '../playback/VideoSplitDivider';
import { YoutubeSourceInput } from '../YoutubeSourceInput';
import { SyncCuesPanel } from '../edit/SyncCuesPanel';
import { filterCues, findActiveCue, isCueActive } from '../../lib/cueUtils';
import { MediaViewport } from './MediaViewport';
import { MediaHeader } from './MediaHeader';

export interface WorkstationLeftPanelProps {
  mode: AppMode;
  youtubeId: string;
  onChangeYoutubeId?: (value: string) => void;
  onClearYoutubeId?: () => void;
  hasPlayer?: boolean;
  videoHeight: number;
  setVideoHeight: (height: number) => void;
  commitVideoHeight?: (height: number) => void;
  onResetVideoHeight?: () => void;
  isVideoCollapsed?: boolean;
  onToggleVideoCollapsed?: () => void;
  onTogglePlayPause?: () => void;
  onReplay?: () => void;
  isDesktop: boolean;
  playerState: number;
  currentTime?: number;
  duration?: number;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean, autoPlay?: boolean) => void;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
  // Playback mode props
  isCueVisible?: (cue: Cue) => boolean;
  activeCueTypes?: Set<string>;
  hiddenCueTypes?: Set<string>;
  toggleCueTypeVisibility?: (type: string) => void;
  density?: TimelineDensity;
  // Common theme props
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  // Edit mode props
  selectedCueId?: string;
  onSelectCue?: (cue: Cue) => void;
  onDeleteCue?: (id: string) => void;
  onOpenRawCuesModal?: () => void;
  onRealignCues?: () => void;
  isAligning?: boolean;
  alignSuccess?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Unified Left Panel Workstation.
 * Houses Tier 1 (Media Preview & Video Player) permanently across mode transitions,
 * ensuring the YouTube iframe is NEVER unmounted or reset when toggling between Playback and Edit.
 * Dynamically switches Tier 2 between ActiveHighlightsPanel (Playback) and SyncCuesPanel (Edit).
 */
export const WorkstationLeftPanel: React.FC<WorkstationLeftPanelProps> = memo(({
  mode,
  youtubeId,
  onChangeYoutubeId,
  onClearYoutubeId,
  hasPlayer = false,
  videoHeight,
  setVideoHeight,
  commitVideoHeight,
  onResetVideoHeight,
  isVideoCollapsed = false,
  onToggleVideoCollapsed,
  onTogglePlayPause,
  onReplay,
  isDesktop,
  playerState,
  currentTime = 0,
  duration = 0,
  onReady,
  onStateChange,
  seekTo,
  cues,
  settings,
  isCueVisible = () => true,
  activeCueTypes = new Set(),
  hiddenCueTypes = new Set(),
  toggleCueTypeVisibility = () => {},
  density = 'comfortable',
  scriptThemeId,
  cuePaletteProfile = 'standard',
  selectedCueId,
  onSelectCue = () => {},
  onDeleteCue = () => {},
  onOpenRawCuesModal = () => {},
  onRealignCues = () => {},
  isAligning = false,
  alignSuccess = false,
  style,
  className,
}) => {
  const isPlaying = playerState === 1;

  // Filter states for Edit Mode Sync Cues
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const handleToggleCategory = useCallback((category: string | null) => {
    if (category === null) {
      setSelectedCategories(new Set());
      return;
    }
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories(new Set());
  }, []);

  // Filter-aware cue matching for Edit mode active-cue tracking
  const matchingCues = useMemo(() => {
    if (mode !== 'edit') return [];
    return filterCues(cues, selectedCategories, searchQuery);
  }, [mode, cues, selectedCategories, searchQuery]);

  // Primary active cue used for Edit mode Left Panel auto-scrolling
  const activeCue = useMemo(() => {
    if (mode !== 'edit') return null;
    return findActiveCue(matchingCues, currentTime, settings);
  }, [mode, matchingCues, currentTime, settings]);
  const activeCueId = activeCue?.id ?? null;

  // Multi-cue active tracking for Edit mode
  const prevActiveCueIdsRef = useRef<Set<string>>(new Set());
  const activeCueIds = useMemo(() => {
    if (mode !== 'edit') return prevActiveCueIdsRef.current;
    const ids = new Set<string>();
    for (const cue of matchingCues) {
      if (isCueActive(cue, currentTime, settings)) {
        if (cue.id) ids.add(cue.id);
      }
    }

    const prev = prevActiveCueIdsRef.current;
    if (prev.size === ids.size) {
      let isSame = true;
      for (const id of ids) {
        if (!prev.has(id)) {
          isSame = false;
          break;
        }
      }
      if (isSame) {
        return prev;
      }
    }
    prevActiveCueIdsRef.current = ids;
    return ids;
  }, [mode, matchingCues, currentTime, settings]);

  // Track backward seeks to reset forward monotonic auto-scroll guard
  const prevTimeRef = useRef<number>(currentTime);
  const [seekVersion, setSeekVersion] = useState<number>(0);

  useEffect(() => {
    if (currentTime < prevTimeRef.current - 0.3) {
      setSeekVersion(v => v + 1);
    }
    prevTimeRef.current = currentTime;
  }, [currentTime]);

  const [isSourceInputOpen, setIsSourceInputOpen] = useState<boolean>(() => !youtubeId);
  const prevYoutubeIdRef = useRef(youtubeId);

  useEffect(() => {
    if (!youtubeId && prevYoutubeIdRef.current) {
      setIsSourceInputOpen(true);
    }
    prevYoutubeIdRef.current = youtubeId;
  }, [youtubeId]);

  const extractedId = useMemo(() => extractYoutubeId(youtubeId), [youtubeId]);

  const handleClearYoutubeId = useCallback(() => {
    onClearYoutubeId?.();
    setIsSourceInputOpen(true);
  }, [onClearYoutubeId]);

  const handleResetVideoHeight = useCallback(() => {
    if (onResetVideoHeight) {
      onResetVideoHeight();
    } else {
      setVideoHeight(DEFAULT_VIDEO_HEIGHT);
      commitVideoHeight?.(DEFAULT_VIDEO_HEIGHT);
    }
  }, [onResetVideoHeight, setVideoHeight, commitVideoHeight]);

  const handleReplay = useCallback(() => {
    if (onReplay) {
      onReplay();
    } else {
      seekTo(0, true, true);
    }
  }, [onReplay, seekTo]);

  return (
    <div 
      style={{ ...style, containerType: 'inline-size' }}
      className={cn(
        UI_TOKENS.layout.leftPanelBase,
        "panel-container-query @container w-full border-r p-0 lg:px-5 lg:py-3 gap-0 flex flex-col h-full overflow-hidden z-10 transition-all duration-300",
        mode === 'playback' && "overflow-y-auto lg:overflow-hidden",
        className
      )}
    >
      {/* Tier 1: Media Preview, Compact Source Input, Video Viewport & Transport */}
      <div className="shrink-0 space-y-2 select-none">
        <MediaHeader
          mode={mode}
          youtubeId={youtubeId}
          extractedId={extractedId}
          hasPlayer={hasPlayer}
          isSourceInputOpen={isSourceInputOpen}
          onToggleSourceInput={() => setIsSourceInputOpen(prev => !prev)}
          isPlaying={isPlaying}
          onTogglePlayPause={onTogglePlayPause}
          onReplay={handleReplay}
          isVideoCollapsed={isVideoCollapsed}
          onToggleVideoCollapsed={onToggleVideoCollapsed}
          currentTime={currentTime}
          duration={duration}
        />

        {/* Collapsible YouTube Source Input Bar */}
        {mode === 'edit' && isSourceInputOpen && onChangeYoutubeId && (
          <YoutubeSourceInput
            youtubeId={youtubeId}
            onChange={onChangeYoutubeId}
            onClear={handleClearYoutubeId}
            hasPlayer={hasPlayer}
            compact={true}
            onClose={() => setIsSourceInputOpen(false)}
          />
        )}

        {/* Persistent Video Viewport (Stays mounted across mode changes) */}
        <MediaViewport
          youtubeId={youtubeId}
          videoHeight={videoHeight}
          isVideoCollapsed={isVideoCollapsed}
          isDesktop={isDesktop}
          onReady={onReady}
          onStateChange={onStateChange}
        />

        {/* Horizontal Video ⇕ Timeline Split Divider */}
        {isDesktop && !isVideoCollapsed && (
          <VideoSplitDivider
            videoHeight={videoHeight}
            onHeightChange={setVideoHeight}
            onHeightCommit={commitVideoHeight}
            onReset={handleResetVideoHeight}
          />
        )}
      </div>

      {/* Tier 2: Workstation Content */}
      {mode === 'playback' ? (
        <ActiveHighlightsPanel
          cues={cues}
          settings={settings}
          isCueVisible={isCueVisible}
          activeCueTypes={activeCueTypes}
          hiddenCueTypes={hiddenCueTypes}
          toggleCueTypeVisibility={toggleCueTypeVisibility}
          scriptThemeId={scriptThemeId}
          cuePaletteProfile={cuePaletteProfile}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onSeekTo={(seconds, autoPlay) => seekTo(seconds, true, autoPlay)}
          onSeekCue={(cue, autoPlay) => seekTo(cue.startTime, true, autoPlay)}
          density={density}
        />
      ) : (
        <SyncCuesPanel
          cues={cues}
          scriptThemeId={scriptThemeId}
          cuePaletteProfile={cuePaletteProfile}
          selectedCueId={selectedCueId}
          activeCueId={activeCueId}
          activeCueIds={activeCueIds}
          seekVersion={seekVersion}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
          onResetFilters={handleClearFilters}
          onSelectCue={onSelectCue}
          onDeleteCue={onDeleteCue}
          onOpenRawCuesModal={onOpenRawCuesModal}
          onRealignCues={onRealignCues}
          isAligning={isAligning}
          alignSuccess={alignSuccess}
        />
      )}
    </div>
  );
});

WorkstationLeftPanel.displayName = 'WorkstationLeftPanel';
