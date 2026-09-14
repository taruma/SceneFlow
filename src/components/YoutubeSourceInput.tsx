import React from 'react';
import { Video, X } from 'lucide-react';
import { cn, extractYoutubeId } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface YoutubeSourceInputProps {
  youtubeId: string;
  onChange: (value: string) => void;
  onClear: () => void;
  hasPlayer: boolean;
  className?: string;
  compact?: boolean;
}

export function YoutubeSourceInput({
  youtubeId,
  onChange,
  onClear,
  hasPlayer,
  className,
  compact = false,
}: YoutubeSourceInputProps) {
  const extractedId = extractYoutubeId(youtubeId);

  return (
    <div className={cn(
      compact ? "space-y-1.5 mb-2.5" : "space-y-3 mb-8",
      "animate-in fade-in slide-in-from-top-2 duration-500",
      className
    )}>
      <div className="flex items-center justify-between px-1">
        <label className={cn(
          "uppercase font-black flex items-center gap-1.5 text-text-faint",
          compact ? "text-[9px] tracking-wider" : "text-[10px] tracking-[0.2em]"
        )}>
          <Video size={compact ? 11 : 12} /> YouTube Source
          <div className={cn(
            "rounded-full transition-all duration-500",
            compact ? "w-1.5 h-1.5" : "w-2 h-2",
            hasPlayer ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
          )} />
        </label>
        {youtubeId && extractedId !== youtubeId && (
          <span className="text-[8.5px] font-mono text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
            ID: {extractedId}
          </span>
        )}
      </div>
      <div className="relative group">
        <input
          type="text"
          value={youtubeId}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            compact 
              ? "w-full pl-8 pr-8 py-1.5 bg-surface-subtle border border-border-main text-text-main placeholder-text-placeholder rounded-xl focus:outline-none focus:border-border-main transition-all font-mono text-xs"
              : UI_TOKENS.input.baseText
          )}
          placeholder={compact ? "YouTube URL or Video ID..." : "Paste YouTube URL or Video ID"}
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
