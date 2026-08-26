import React from 'react';
import { Edit2, RefreshCw, Check, Loader2, Trash2 } from 'lucide-react';
import { Cue } from '../types/script';
import { COLORS } from '../constants/script';
import { useScriptTheme } from '../hooks/useScriptTheme';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

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
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any);
  const cueList = cues || [];

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={UI_TOKENS.layout.sectionTitle}>Timeline Cues</h3>
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
              <span className={UI_TOKENS.badge.counterFaint}>
                {cueList.length} total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className={UI_TOKENS.panel.legendContainer}>
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
            const themed = resolveCueColor(cueType);
            return (
              <div 
                key={cue.id ? `timeline-${cue.id}-${idx}` : `timeline-idx-${idx}`} 
                onClick={() => onSelectCue(cue)}
                className={selectedCueId === cue.id ? UI_TOKENS.panel.cardInteractiveActive : UI_TOKENS.panel.cardInteractive}
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
                      <span className={UI_TOKENS.badge.timeTag}>{cue.startTime.toFixed(1)}s</span>
                      <div className="w-2 h-px bg-stone-200" />
                      <span className={UI_TOKENS.badge.timeTag}>{cue.endTime.toFixed(1)}s</span>
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
            <div className={UI_TOKENS.panel.emptyPlaceholder}>
              <p className="text-sm text-stone-400 font-medium italic">No cues created yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
