import React from 'react';
import { Video } from 'lucide-react';
import { Cue } from '../types/script';
import { COLORS } from '../constants/script';
import { getCueColorForTheme } from '../lib/scriptStyles';
import { cn } from '../lib/utils';

interface ActiveHighlightsPanelProps {
  cues: Cue[];
  isCueVisible: (cue: Cue) => boolean;
  activeCueTypes: Set<string>;
  hiddenCueTypes: Set<string>;
  toggleCueTypeVisibility: (type: string) => void;
  scriptThemeId: string;
}

export const ActiveHighlightsPanel: React.FC<ActiveHighlightsPanelProps> = ({
  cues,
  isCueVisible,
  activeCueTypes,
  hiddenCueTypes,
  toggleCueTypeVisibility,
  scriptThemeId,
}) => {
  const visibleCues = (cues || []).filter(isCueVisible);

  return (
    <div className="hidden lg:flex flex-col flex-1 mt-10 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
          <Video size={14} /> Active Highlights
        </h3>
        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded uppercase">
          {visibleCues.length} active
        </span>
      </div>

      {/* Legend / Filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {COLORS.map(color => {
          const isActive = activeCueTypes.has(color.type);
          const isHidden = hiddenCueTypes.has(color.type);
          const themed = getCueColorForTheme(color.type, scriptThemeId);
          return (
            <button
              key={color.type}
              onClick={() => toggleCueTypeVisibility(color.type)}
              className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border relative overflow-hidden",
                isHidden 
                  ? "bg-stone-50 border-stone-100 text-stone-300 opacity-60" 
                  : "bg-white border-stone-200 text-stone-500 hover:border-stone-300 shadow-sm",
                isActive && !isHidden && "bg-stone-50"
              )}
            >
              {isActive && !isHidden && (
                <span 
                  className="absolute inset-0 opacity-30 animate-pulse" 
                  style={{ backgroundColor: `rgb(${themed.rgb})` }}
                />
              )}
              <div 
                className="w-2 h-2 rounded-full shrink-0" 
                style={{ backgroundColor: isHidden ? undefined : `rgb(${themed.rgb})` }} 
              />
              {color.type}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {visibleCues.sort((a, b) => {
          const order = COLORS.map(c => c.type);
          return order.indexOf(a.type || 'dialogue') - order.indexOf(b.type || 'dialogue');
        }).map((cue, idx) => {
          const themed = getCueColorForTheme(cue.type || cue.colorClass || '', scriptThemeId);
          return (
            <div key={cue.id ? `highlight-${cue.id}-${idx}` : `highlight-idx-${idx}`} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden">
              <div 
                className="w-1.5 h-8 rounded-full shrink-0" 
                style={{ backgroundColor: `rgb(${themed.rgb})` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-serif italic text-stone-700 line-clamp-2">"{cue.selectedText}"</p>
                {cue.type && (
                  <span className="absolute top-1 right-2 text-[8px] font-black uppercase tracking-widest text-stone-300">
                    {cue.type}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {visibleCues.length === 0 && (
          <div className="h-32 border-2 border-dashed border-stone-100 rounded-3xl flex items-center justify-center">
            <p className="text-xs text-stone-300 italic">No active highlights at this time</p>
          </div>
        )}
      </div>
    </div>
  );
};
