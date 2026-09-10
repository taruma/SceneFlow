import React from 'react';
import YouTube from 'react-youtube';
import { Video } from 'lucide-react';
import { Cue, TimingSettings } from '../../types/script';
import { extractYoutubeId, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { ActiveHighlightsPanel } from '../ActiveHighlightsPanel';
import { TimelineDensity } from '../active-highlights/types';

export interface PlaybackLeftPanelProps {
  youtubeId: string;
  videoWidth: number;
  setVideoWidth: (width: number) => void;
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
 * Encapsulates the media player viewport, size scaling, and ActiveHighlights synchronization.
 */
export const PlaybackLeftPanel: React.FC<PlaybackLeftPanelProps> = ({
  youtubeId,
  videoWidth,
  setVideoWidth,
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
  return (
    <div 
      style={style}
      className={cn(
        UI_TOKENS.layout.leftPanelBase,
        "w-full border-r p-0 lg:px-6 lg:py-3.5 gap-0 lg:overflow-y-auto scrollbar-hide sticky top-0 z-30 shadow-md lg:shadow-none transition-all duration-300",
        className
      )}
    >
      <section className="space-y-3 lg:space-y-3.5 z-30 sticky top-0">
        {/* Now Playing Header + Size Slider */}
        <div className="hidden lg:flex items-center justify-between transition-all duration-300">
          <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-2">
            <Video size={14} /> Now Playing
          </h2>
          {isDesktop && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-faint">Size</span>
              <input 
                type="range" 
                min="40" 
                max="100" 
                step="5"
                value={videoWidth}
                onChange={(e) => setVideoWidth(parseInt(e.target.value, 10))}
                className="w-24 h-1 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-text-muted hover:accent-text-main transition-all"
              />
              <span className="text-[9px] font-mono font-bold text-text-faint w-8">{videoWidth}%</span>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div 
          className="aspect-video bg-black overflow-hidden shadow-2xl ring-1 ring-border-main relative group transition-all duration-500 origin-top-left pointer-events-auto rounded-none lg:rounded-3xl"
          style={isDesktop ? { width: `${videoWidth}%`, margin: '0 auto' } : {}}
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
