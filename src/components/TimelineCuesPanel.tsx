import React from 'react';
import { Edit2, RefreshCw, Check, Loader2, Trash2 } from 'lucide-react';
import { Cue } from '../types/script';
import { COLORS } from '../constants/script';
import { getCueColorForTheme } from '../lib/scriptStyles';
import { cn } from '../lib/utils';

interface TimelineCuesPanelProps {
  cues: Cue[];
  scriptThemeId: string;
  selectedCueId?: string;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
}

export const TimelineCuesPanel: React.FC<TimelineCuesPanelProps> = ({
  cues,
  scriptThemeId,
  selectedCueId,
  onSelectCue,
  onDeleteCue,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
}) => {
  const cueList = cues || [];

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Timeline Cues</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRawCuesModal}
                title="Edit raw JSON cues"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <Edit2 size={10} /> Raw
              </button>
              {cueList.length > 0 && (
                <button
                  onClick={onRealignCues}
                  disabled={isAligning}
                  title="Re-align cues with script text"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                    alignSuccess 
                      ? "bg-green-50 border-green-100 text-green-600" 
                      : "bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-200"
                  )}
                >
                  {isAligning ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : alignSuccess ? (
                    <Check size={10} />
                  ) : (
                    <RefreshCw size={10} />
                  )}
                  {alignSuccess ? 'Aligned' : 'Align'}
                </button>
              )}
              <span className="text-[10px] font-bold text-stone-300 bg-stone-100 px-2 py-0.5 rounded uppercase">
                {cueList.length} total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
            {COLORS.map(color => (
              <div key={color.type} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", color.class)} />
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{color.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {cueList.map((cue, idx) => {
            const cueType = cue.type || (cue.colorClass ? COLORS.find(c => c.class === cue.colorClass)?.type : 'dialogue') || 'dialogue';
            const themed = getCueColorForTheme(cueType, scriptThemeId);
            return (
              <div 
                key={cue.id ? `timeline-${cue.id}-${idx}` : `timeline-idx-${idx}`} 
                onClick={() => onSelectCue(cue)}
                className={cn(
                  "flex items-center justify-between p-4 bg-stone-50 border rounded-2xl group hover:bg-white hover:shadow-md transition-all relative overflow-hidden cursor-pointer",
                  selectedCueId === cue.id ? "border-stone-900 ring-1 ring-stone-900 bg-white shadow-md" : "border-stone-200"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div 
                    className="w-1.5 h-10 rounded-full shrink-0" 
                    style={{ backgroundColor: `rgb(${themed.rgb})` }} 
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    {cueType && (
                      <span 
                        className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md w-fit mb-1 border"
                        style={{ 
                          backgroundColor: `rgba(${themed.rgb}, 0.15)`,
                          borderColor: `rgba(${themed.rgb}, 0.3)`,
                          color: themed.textColorClass.includes('text-amber-100') ? '#b45309' : undefined
                        }}
                      >
                        {cueType}
                      </span>
                    )}
                    <span className="text-sm font-bold text-stone-800 italic leading-tight break-words">"{cue.selectedText}"</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{cue.startTime.toFixed(1)}s</span>
                      <div className="w-2 h-px bg-stone-200" />
                      <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{cue.endTime.toFixed(1)}s</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCue(cue.id);
                    }}
                    className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          {cueList.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-[2rem] bg-stone-50/50">
              <p className="text-sm text-stone-400 font-medium italic">No cues created yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
