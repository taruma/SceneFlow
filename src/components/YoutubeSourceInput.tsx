import React from 'react';
import { Video, X } from 'lucide-react';
import { cn, extractYoutubeId } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface YoutubeSourceInputProps {
  youtubeId: string;
  onChange: (value: string) => void;
  onClear: () => void;
  hasPlayer: boolean;
}

export function YoutubeSourceInput({
  youtubeId,
  onChange,
  onClear,
  hasPlayer,
}: YoutubeSourceInputProps) {
  const extractedId = extractYoutubeId(youtubeId);

  return (
    <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] uppercase tracking-[0.2em] text-text-faint font-black flex items-center gap-2">
          <Video size={12} /> YouTube Source
          <div className={cn(
            "w-2 h-2 rounded-full transition-all duration-500",
            hasPlayer ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
          )} />
        </label>
        {youtubeId && extractedId !== youtubeId && (
          <span className="text-[9px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            ID: {extractedId}
          </span>
        )}
      </div>
      <div className="relative group">
        <input
          type="text"
          value={youtubeId}
          onChange={(e) => onChange(e.target.value)}
          className={UI_TOKENS.input.baseText}
          placeholder="Paste YouTube URL or Video ID"
        />
        <Video size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-text-main transition-colors" />
        {youtubeId && (
          <button 
            onClick={onClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
