import React from 'react';
import { Video, X } from 'lucide-react';
import { cn, extractYoutubeId } from '../lib/utils';

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
        <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black flex items-center gap-2">
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
          className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-300 transition-all font-mono text-sm"
          placeholder="Paste YouTube URL or Video ID"
        />
        <Video size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
        {youtubeId && (
          <button 
            onClick={onClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
