import React from 'react';
import YouTube from 'react-youtube';
import { Video } from 'lucide-react';
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
  const handleResetVideoHeight = () => {
    if (onResetVideoHeight) {
      onResetVideoHeight();
    } else {
      setVideoHeight(DEFAULT_VIDEO_HEIGHT);
      commitVideoHeight?.(DEFAULT_VIDEO_HEIGHT);
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
        {/* Playback Section Header */}
        <div className="hidden lg:flex items-center justify-between pb-0.5">
          <h2 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2")}>
            <Video size={14} /> Playback
          </h2>
        </div>

        {/* Video Player */}
        <div 
          className="bg-black overflow-hidden shadow-2xl ring-1 ring-border-main relative group pointer-events-auto rounded-none lg:rounded-2xl transition-all duration-300 flex items-center justify-center shrink-0"
          style={isDesktop ? { 
            height: `${videoHeight}px`, 
            maxWidth: '100%', 
            aspectRatio: '16 / 9', 
            margin: '0 auto' 
          } : { 
            aspectRatio: '16 / 9',
            width: '100%' 
          }}
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
        {isDesktop && (
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
