import React, { memo } from 'react';
import YouTube from 'react-youtube';
import { Video, VideoOff, Play, Pause, RotateCcw, Edit2, Plus } from 'lucide-react';
import { Cue } from '../../types/script';
import { extractYoutubeId, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { CuePaletteProfile } from '../../styles';
import { DEFAULT_VIDEO_HEIGHT } from '../../hooks/useScriptPreferences';
import { VideoSplitDivider } from '../playback/VideoSplitDivider';
import { YoutubeSourceInput } from '../YoutubeSourceInput';
import { SyncCuesPanel } from './SyncCuesPanel';
import { LiveTimecodeBadge } from './LiveTimecodeBadge';

export interface EditLeftPanelProps {
  youtubeId: string;
  onChangeYoutubeId: (value: string) => void;
  onClearYoutubeId: () => void;
  hasPlayer: boolean;
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
  cues: Cue[];
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  selectedCueId?: string;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Dedicated Left Panel container for Edit mode.
 * Encapsulates the media preview, YouTube source input, transport controls,
 * resizable/collapsible video viewport, and Sync Cues panel.
 */
export const EditLeftPanel: React.FC<EditLeftPanelProps> = memo(({
  youtubeId,
  onChangeYoutubeId,
  onClearYoutubeId,
  hasPlayer,
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
  cues,
  scriptThemeId,
  cuePaletteProfile = 'standard',
  selectedCueId,
  onSelectCue,
  onDeleteCue,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
  style,
  className,
}) => {
  const isPlaying = playerState === 1;

  const [isSourceInputOpen, setIsSourceInputOpen] = React.useState<boolean>(() => !youtubeId);
  const prevYoutubeIdRef = React.useRef(youtubeId);

  React.useEffect(() => {
    // If youtubeId becomes empty (e.g. cleared), automatically expand input
    if (!youtubeId && prevYoutubeIdRef.current) {
      setIsSourceInputOpen(true);
    }
    prevYoutubeIdRef.current = youtubeId;
  }, [youtubeId]);

  const extractedId = React.useMemo(() => extractYoutubeId(youtubeId), [youtubeId]);

  const handleClearYoutubeId = React.useCallback(() => {
    onClearYoutubeId();
    setIsSourceInputOpen(true);
  }, [onClearYoutubeId]);

  const handleResetVideoHeight = React.useCallback(() => {
    if (onResetVideoHeight) {
      onResetVideoHeight();
    } else {
      setVideoHeight(DEFAULT_VIDEO_HEIGHT);
      commitVideoHeight?.(DEFAULT_VIDEO_HEIGHT);
    }
  }, [onResetVideoHeight, setVideoHeight, commitVideoHeight]);

  const handleReplay = React.useCallback(() => {
    if (onReplay) {
      onReplay();
    }
  }, [onReplay]);

  return (
    <div 
      style={{ ...style, containerType: 'inline-size' }}
      className={cn(
        UI_TOKENS.layout.leftPanelBase,
        "panel-container-query @container w-full border-r p-0 lg:px-5 lg:py-3 gap-0 flex flex-col h-full overflow-hidden z-10 transition-all duration-300",
        className
      )}
    >
      {/* Tier 1: Media Preview, Compact Source Input & Video Viewport */}
      <div className="shrink-0 space-y-2 select-none">
        {/* Section Header with Transport & Collapse Controls */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 lg:px-0 lg:pt-0 lg:pb-0.5 gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            <h2 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2 shrink-0")}>
              <Video size={14} className="text-text-muted shrink-0" />
              <span className="media-preview-title">Media Preview</span>
            </h2>

            {/* Collapsible YouTube Source Pill */}
            <button
              type="button"
              onClick={() => setIsSourceInputOpen(prev => !prev)}
              aria-expanded={isSourceInputOpen}
              aria-label={youtubeId ? "Edit YouTube video source URL" : "Set YouTube video source URL"}
              title={
                isSourceInputOpen
                  ? "Hide YouTube source input"
                  : (youtubeId ? `Video ID: ${extractedId || youtubeId} (Click to change URL)` : "Set YouTube video source URL")
              }
              className={cn(
                "group flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono transition-all duration-150 border shadow-2xs select-none active:scale-95 shrink-0",
                isSourceInputOpen
                  ? "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 font-semibold shadow-blue-500/10"
                  : "bg-surface-subtle hover:bg-surface border-border-subtle hover:border-border-main text-text-muted hover:text-text-main"
              )}
            >
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300",
                youtubeId
                  ? (hasPlayer ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]")
                  : "bg-red-400"
              )} />
              {youtubeId ? (
                <>
                  <span className="truncate max-w-[85px] youtube-pill-text">{extractedId || youtubeId}</span>
                  <Edit2 size={9} className="shrink-0 text-text-faint group-hover:text-text-main transition-colors opacity-70" />
                </>
              ) : (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-blue-500 flex items-center gap-0.5">
                  <Plus size={10} className="shrink-0" />
                  <span className="youtube-pill-text">Video</span>
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Live Precision Timecode Display */}
            {hasPlayer && (
              <LiveTimecodeBadge
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
              />
            )}

            {/* Playback Transport Controls: Replay & Play/Pause */}
            <div className="flex items-center gap-1">
              {onReplay && (
                <button
                  type="button"
                  onClick={handleReplay}
                  aria-label="Replay from beginning"
                  title="Replay from start (0:00)"
                  className="group flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 border border-border-subtle bg-surface hover:bg-surface-subtle text-text-muted hover:text-text-main shadow-xs active:scale-95 select-none"
                >
                  <RotateCcw size={11} className="shrink-0 transition-transform duration-200 group-hover:-rotate-45" />
                  <span className="header-btn-label">Replay</span>
                </button>
              )}

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
                      <span className="header-btn-label">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={11} className="shrink-0 fill-current ml-0.5" />
                      <span className="header-btn-label">Play</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Separator between transport and collapse controls */}
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
                    : "Hide Video Player (Collapse for full cue list) [V]"
                }
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-150 border shadow-xs active:scale-95 select-none",
                  isVideoCollapsed
                    ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold"
                    : "bg-surface hover:bg-surface-subtle border-border-subtle text-text-muted hover:text-text-main"
                )}
              >
                {isVideoCollapsed ? (
                  <>
                    <Video size={12} className="text-blue-500 shrink-0" />
                    <span className="header-btn-label">Show Video</span>
                  </>
                ) : (
                  <>
                    <VideoOff size={12} className="text-text-faint shrink-0" />
                    <span className="header-btn-label">Hide Video</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible YouTube Source Input Bar */}
        {isSourceInputOpen && (
          <YoutubeSourceInput
            youtubeId={youtubeId}
            onChange={onChangeYoutubeId}
            onClear={handleClearYoutubeId}
            hasPlayer={hasPlayer}
            compact={true}
            onClose={() => setIsSourceInputOpen(false)}
          />
        )}

        {/* Video Player Viewport */}
        <div 
          className={cn(
            "bg-black overflow-hidden shadow-xl ring-1 ring-border-main relative group pointer-events-auto rounded-none lg:rounded-2xl transition-all duration-300 flex items-center justify-center shrink-0",
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
            className="mt-2 mb-1"
          />
        )}
      </div>

      {/* Tier 2: Dedicated Sync Cues Workspace (Fills remaining height) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <SyncCuesPanel
          cues={cues}
          scriptThemeId={scriptThemeId}
          cuePaletteProfile={cuePaletteProfile}
          selectedCueId={selectedCueId}
          onSelectCue={onSelectCue}
          onDeleteCue={onDeleteCue}
          onOpenRawCuesModal={onOpenRawCuesModal}
          onRealignCues={onRealignCues}
          isAligning={isAligning}
          alignSuccess={alignSuccess}
        />
      </div>
    </div>
  );
});

EditLeftPanel.displayName = 'EditLeftPanel';
