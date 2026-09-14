import React, { memo, useMemo } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { extractYoutubeId, cn } from '../../lib/utils';

export const YOUTUBE_PLAYER_OPTS: YouTubeProps['opts'] = {
  playerVars: {
    controls: 1,
    modestbranding: 1,
    rel: 0,
    playsinline: 1,
  },
};

export interface MediaViewportProps {
  youtubeId: string;
  videoHeight: number;
  isVideoCollapsed: boolean;
  isDesktop: boolean;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
}

/**
 * Isolated, memoized Video Viewport.
 * Stays permanently mounted across Playback and Edit modes to ensure the
 * YouTube iframe is never destroyed during mode switches.
 * Shields the YouTube iframe and container from high-frequency playback tick re-renders.
 */
export const MediaViewport: React.FC<MediaViewportProps> = memo(({
  youtubeId,
  videoHeight,
  isVideoCollapsed,
  isDesktop,
  onReady,
  onStateChange,
}) => {
  const extractedVideoId = useMemo(() => extractYoutubeId(youtubeId), [youtubeId]);

  return (
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
        key={extractedVideoId}
        videoId={extractedVideoId}
        opts={YOUTUBE_PLAYER_OPTS}
        onReady={onReady}
        onStateChange={onStateChange}
        className="w-full h-full bg-black"
        iframeClassName="w-full h-full block border-0 bg-black"
      />
    </div>
  );
});

MediaViewport.displayName = 'MediaViewport';
