import React from 'react';
import YouTube from 'react-youtube';
import { Video, VideoOff, Play, Pause, RotateCcw } from 'lucide-react';
import { Cue, TimingSettings } from '../../types/script';
import { extractYoutubeId, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { ActiveHighlightsPanel } from '../ActiveHighlightsPanel';
import { TimelineDensity } from '../active-highlights/types';

import { DEFAULT_VIDEO_HEIGHT } from '../../hooks/useScriptPreferences';
import { VideoSplitDivider } from './VideoSplitDivider';

export interface PlaybackLeftPanelProps {
  youtubeId: string;
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
  currentTime: number;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean, autoPlay?: boolean) => void;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
  isCueVisible: (cue: Cue) => boolean;
  activeCueTypes: Set<string>;
  hiddenCueTypes: Set<string>;
  toggleCueTypeVisibility: (type: string) => void;
  scriptThemeId: string;
  density?: TimelineDensity;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Dedicated Left Panel container for Playback mode.
 * Encapsulates the media player viewport, vertical resizer, and ActiveHighlights synchronization.
 */
export const PlaybackLeftPanel: React.FC<PlaybackLeftPanelProps> = ({
  youtubeId,
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
  currentTime,
  onReady,
  onStateChange,
  seekTo,
  cues,
  settings,
  isCueVisible,
  activeCueTypes,
  hiddenCueTypes,
  toggleCueTypeVisibility,
  scriptThemeId,
  density = 'comfortable',
  style,
  className,
}) => {
  const isPlaying = playerState === 1;

  const handleResetVideoHeight = () => {
    if (onResetVideoHeight) {
      onResetVideoHeight();
    } else {
      setVideoHeight(DEFAULT_VIDEO_HEIGHT);
      commitVideoHeight?.(DEFAULT_VIDEO_HEIGHT);
    }
  };

  const handleReplay = () => {
    if (onReplay) {
      onReplay();
    } else {
      seekTo(0, true, true);
    }
  };

  return (
    <div 
      style={style}
      className={cn(
        UI_TOKENS.layout.leftPanelBase,
        "w-full border-r p-0 lg:px-6 lg:py-3.5 gap-0 lg:overflow-y-auto scrollbar-hide sticky top-0 z-30 shadow-md lg:shadow-none transition-all duration-300",
        className
      )}
    >
      <section className="space-y-2 lg:space-y-2.5 z-30 sticky top-0">
        {/* Playback Section Header with Transport & Collapsible Controls */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1 lg:px-0 lg:pt-0 lg:pb-0.5">
          <div className="flex items-center gap-2">
            <h2 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2")}>
              <Video size={14} className="text-text-muted" /> Playback
            </h2>
            {isVideoCollapsed && (
              <span 
                className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200"
                title="Video player is hidden. Timeline is unobstructed for screen recording."
              >
                <VideoOff size={10} /> Video Hidden
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Playback Transport Controls: Replay & Play/Pause */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReplay}
                aria-label="Replay from beginning"
                title="Replay from start (0:00)"
                className="group flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 border border-border-subtle bg-surface hover:bg-surface-subtle text-text-muted hover:text-text-main shadow-xs active:scale-95 select-none"
              >
                <RotateCcw size={11} className="shrink-0 transition-transform duration-200 group-hover:-rotate-45" />
                <span className="hidden sm:inline">Replay</span>
              </button>

              {onTogglePlayPause && (
                <button
                  type="button"
                  onClick={onTogglePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause playback [Space]" : "Start playback [Space]"}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 border shadow-xs active:scale-95 select-none",
                    isPlaying
                      ? "bg-blue-500 hover:bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                      : "bg-surface hover:bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main"
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={11} className="shrink-0 fill-current" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={11} className="shrink-0 fill-current ml-0.5" />
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Subtle separator between transport and collapse controls */}
            {onToggleVideoCollapsed && (
              <div className="w-px h-3.5 bg-border-subtle mx-0.5" aria-hidden="true" />
            )}

            {onToggleVideoCollapsed && (
              <button
                type="button"
                onClick={onToggleVideoCollapsed}
                aria-expanded={!isVideoCollapsed}
                aria-label={isVideoCollapsed ? "Show Video Player" : "Hide Video Player"}
                title={
                  isVideoCollapsed 
                    ? "Show Video Player [V]" 
                    : "Hide Video Player (Collapse for timeline screen recording) [V]"
                }
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 border shadow-xs active:scale-95 select-none",
                  isVideoCollapsed
                    ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400"
                    : "bg-surface hover:bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main"
                )}
              >
                {isVideoCollapsed ? (
                  <>
                    <Video size={12} className="text-blue-500 shrink-0" />
                    <span className="hidden sm:inline">Show Video</span>
                  </>
                ) : (
                  <>
                    <VideoOff size={12} className="text-text-faint shrink-0" />
                    <span className="hidden sm:inline">Hide Video</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Video Player (Kept mounted with zero height when collapsed so audio and sync events persist) */}
        <div 
          className={cn(
            "bg-black overflow-hidden shadow-2xl ring-1 ring-border-main relative group pointer-events-auto rounded-none lg:rounded-2xl transition-all duration-300 flex items-center justify-center shrink-0",
            isVideoCollapsed && "h-0 min-h-0 max-h-0 opacity-0 pointer-events-none ring-0 shadow-none border-none !m-0 !p-0 overflow-hidden"
          )}
          style={!isVideoCollapsed ? (isDesktop ? { 
            height: `${videoHeight}px`, 
            maxWidth: '100%', 
            aspectRatio: '16 / 9', 
            margin: '0 auto' 
          } : { 
            aspectRatio: '16 / 9',
            width: '100%' 
          }) : { 
            height: 0, 
            minHeight: 0,
            maxHeight: 0,
            margin: 0, 
            padding: 0, 
            opacity: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
          aria-hidden={isVideoCollapsed}
        >
          <YouTube
            key={extractYoutubeId(youtubeId)}
            videoId={extractYoutubeId(youtubeId)}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0,
                modestbranding: 1,
                rel: 0,
                controls: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : undefined,
              },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            className="w-full h-full bg-black"
            iframeClassName="w-full h-full block border-0 bg-black"
          />
        </div>

        {/* Horizontal Video ⇕ Timeline Split Divider */}
        {isDesktop && !isVideoCollapsed && (
          <VideoSplitDivider
            videoHeight={videoHeight}
            onHeightChange={setVideoHeight}
            onHeightCommit={commitVideoHeight}
            onReset={handleResetVideoHeight}
          />
        )}

        {/* Active Highlights */}
        <ActiveHighlightsPanel
          cues={cues}
          settings={settings}
          isCueVisible={isCueVisible}
          activeCueTypes={activeCueTypes}
          hiddenCueTypes={hiddenCueTypes}
          toggleCueTypeVisibility={toggleCueTypeVisibility}
          scriptThemeId={scriptThemeId}
          currentTime={currentTime}
          isPlaying={playerState === 1}
          onSeekTo={(seconds, autoPlay) => seekTo(seconds, true, autoPlay)}
          onSeekCue={(cue, autoPlay) => seekTo(cue.startTime, true, autoPlay)}
          density={density}
        />
      </section>
    </div>
  );
};
