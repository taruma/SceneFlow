import React, { useRef } from 'react';
import { Video, X, Check, FileVideo } from 'lucide-react';
import { cn, extractYoutubeId } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface YoutubeSourceInputProps {
  youtubeId: string;
  onChange: (value: string) => void;
  onClear: () => void;
  localVideoName?: string;
  localVideoError?: boolean;
  onSelectLocalVideo?: (file: File) => void;
  onClearLocalVideo?: () => void;
  hasPlayer: boolean;
  className?: string;
  compact?: boolean;
  onClose?: () => void;
}

export function YoutubeSourceInput({
  youtubeId,
  onChange,
  onClear,
  localVideoName,
  localVideoError = false,
  onSelectLocalVideo,
  onClearLocalVideo,
  hasPlayer,
  className,
  compact = false,
  onClose,
}: YoutubeSourceInputProps) {
  const extractedId = extractYoutubeId(youtubeId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn(
      compact ? "space-y-1.5 mb-1" : "space-y-3 mb-8",
      "animate-in fade-in slide-in-from-top-1 duration-200",
      className
    )}>
      <div className="flex items-center justify-between px-1">
        <label className={cn(
          "uppercase font-black flex items-center gap-1.5 text-text-faint",
          compact ? "text-[9px] tracking-wider" : "text-[10px] tracking-[0.2em]"
        )}>
          <Video size={compact ? 11 : 12} /> {localVideoName ? 'Local Video' : 'YouTube Source'}
          <div className={cn(
            "rounded-full transition-all duration-500",
            compact ? "w-1.5 h-1.5" : "w-2 h-2",
            hasPlayer ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
          )} />
        </label>
        <div className="flex items-center gap-1.5">
          {!localVideoName && youtubeId && extractedId !== youtubeId && (
            <span className="text-[8.5px] font-mono text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              ID: {extractedId}
            </span>
          )}
          {onSelectLocalVideo && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSelectLocalVideo(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-border-main transition-colors shadow-2xs active:scale-95 select-none"
                title="Play a video file from this computer (MP4, WebM, MOV)"
              >
                <FileVideo size={10} className="text-blue-500" />
                <span className="source-btn-label">Local File</span>
              </button>
            </>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-text-muted hover:text-text-main bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-border-main transition-colors shadow-2xs active:scale-95 select-none"
              title="Close source input (Enter or Esc)"
            >
              <Check size={10} className="text-blue-500" /> Done
            </button>
          )}
        </div>
      </div>
      {localVideoName && (
        <>
          <div className="relative">
            <div
              className="w-full pl-8 pr-8 py-1.5 bg-surface-subtle border border-border-main text-text-main rounded-xl font-mono text-xs truncate"
              title={localVideoName}
            >
              {localVideoName}
            </div>
            <FileVideo size={13} className="absolute top-1/2 -translate-y-1/2 left-2.5 text-text-faint" />
            <button
              type="button"
              onClick={onClearLocalVideo}
              className="absolute top-1/2 -translate-y-1/2 right-2.5 text-text-faint hover:text-text-main transition-colors"
              title="Back to the YouTube source"
              aria-label="Back to the YouTube source"
            >
              <X size={13} />
            </button>
          </div>
          <p className={cn("px-1 text-[10px]", localVideoError ? "text-red-500" : "text-text-muted")}>
            {localVideoError ? "This browser can't play this file" : 'Local file, not saved with the project'}
          </p>
        </>
      )}
      <div className={cn("relative group", localVideoName && "hidden")}>
        <input
          type="text"
          value={youtubeId}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault();
              onClose?.();
            }
          }}
          className={cn(
            compact 
              ? "w-full pl-8 pr-8 py-1.5 bg-surface-subtle border border-border-main text-text-main placeholder-text-placeholder rounded-xl focus:outline-none focus:border-border-main transition-all font-mono text-xs"
              : UI_TOKENS.input.baseText
          )}
          placeholder={compact ? "YouTube URL or Video ID... (Enter when done)" : "Paste YouTube URL or Video ID"}
        />
        <Video size={compact ? 13 : 16} className={cn(
          "absolute top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-text-main transition-colors",
          compact ? "left-2.5" : "left-3.5"
        )} />
        {youtubeId && (
          <button 
            type="button"
            onClick={onClear}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main transition-colors",
              compact ? "right-2.5" : "right-3.5"
            )}
            title="Clear video source"
            aria-label="Clear video source"
          >
            <X size={compact ? 13 : 16} />
          </button>
        )}
      </div>
    </div>
  );
}
