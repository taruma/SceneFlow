import React, { memo } from 'react';
import { Search, Check } from 'lucide-react';
import { AlternativeLocation } from '../../types/script';
import { cn } from '../../lib/utils';

export interface CueTextSectionProps {
  selectedText: string;
  onTextChange: (text: string) => void;
  altLocations: AlternativeLocation[] | null;
  onFindAlternatives: () => void;
  onSelectLocation: (start: number, end: number) => void;
  activeStartIndex?: number;
}

export const CueTextSection: React.FC<CueTextSectionProps> = memo(({
  selectedText,
  onTextChange,
  altLocations,
  onFindAlternatives,
  onSelectLocation,
  activeStartIndex,
}) => {
  return (
    <div className="bg-surface-subtle p-3 rounded-xl border border-border-subtle space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-text-faint uppercase tracking-widest">Selected Text</p>
        <button 
          onClick={onFindAlternatives}
          className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-text-faint hover:text-blue-500 transition-colors"
        >
          <Search size={10} /> {altLocations ? 'Refresh' : 'Find Alternative'}
        </button>
      </div>
      <textarea
        value={selectedText}
        onChange={(e) => onTextChange(e.target.value)}
        className="w-full bg-surface border border-border-main rounded-lg p-2 text-text-main font-mono text-xs min-h-[60px] focus:outline-none focus:ring-1 focus:ring-border-main transition-all duration-200 hover:border-border-main"
        placeholder="Edit cue text..."
      />
      
      {altLocations && altLocations.length > 1 && (
        <div className="pt-2 mt-2 border-t border-border-main">
          <p className="text-[8px] text-text-faint uppercase tracking-widest mb-1">Alternative Locations ({altLocations.length})</p>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {altLocations.map((loc, i) => {
              const isCurrent = loc.start === activeStartIndex;
              return (
                <button
                  key={i}
                  onClick={() => onSelectLocation(loc.start, loc.end)}
                  className={cn(
                    "w-full text-left p-1.5 rounded text-[9px] font-mono transition-all border",
                    isCurrent 
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold" 
                      : "bg-surface border-border-main text-text-muted hover:bg-surface-hover"
                  )}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="opacity-60 text-[7px]">Offset: {loc.start}</span>
                    {isCurrent && <Check size={8} />}
                  </div>
                  <div className="truncate">{loc.context}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {altLocations && altLocations.length <= 1 && (
        <p className="text-[9px] text-text-faint italic pt-0.5">
          No additional occurrences found in script.
        </p>
      )}
    </div>
  );
});

CueTextSection.displayName = 'CueTextSection';
