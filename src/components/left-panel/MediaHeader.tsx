import React, { memo } from 'react';
import { Video, VideoOff, Play, Pause, RotateCcw, Plus, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { LiveTimecodeBadge } from '../edit/LiveTimecodeBadge';
import { AppMode } from '../../types/script';

export interface MediaHeaderProps {
  mode: AppMode;
  youtubeId: string;
  extractedId?: string;
  hasPlayer: boolean;
  isSourceInputOpen?: boolean;
  onToggleSourceInput?: () => void;
  isPlaying: boolean;
  onTogglePlayPause?: () => void;
  onReplay?: () => void;
  isVideoCollapsed?: boolean;
  onToggleVideoCollapsed?: () => void;
  currentTime: number;
  duration: number;
}

export const MediaHeader: React.FC<MediaHeaderProps> = memo(({
  mode,
  youtubeId,
  extractedId,
  hasPlayer,
  isSourceInputOpen = false,
  onToggleSourceInput,
  isPlaying,
  onTogglePlayPause,
  onReplay,
  isVideoCollapsed = false,
  onToggleVideoCollapsed,
  currentTime,
  duration,
}) => {
  return (
    <div className="flex items-center justify-between px-3 pt-2 pb-1 lg:px-0 lg:pt-0 lg:pb-0.5 gap-2 min-w-0">
      <div className="flex items-center gap-1.5 min-w-0 shrink-0">
        <h2 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2 shrink-0")}>
          <Video size={14} className="text-text-muted shrink-0" />
          <span className="media-preview-title">
            {mode === 'playback' ? 'Playback' : 'Media Preview'}
          </span>
        </h2>

        {/* Collapsible YouTube Source Pill (In Edit Mode) */}
        {mode === 'edit' && onToggleSourceInput && (
          <button
            type="button"
            onClick={onToggleSourceInput}
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
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Live Precision Timecode Display (In Edit mode when player is available) */}
        {mode === 'edit' && hasPlayer && (
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
              onClick={onReplay}
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
                : (mode === 'playback' ? "Hide Video Player (Collapse for timeline screen recording) [V]" : "Hide Video Player (Collapse for full cue list) [V]")
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
  );
});

MediaHeader.displayName = 'MediaHeader';
