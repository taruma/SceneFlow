import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../../types/script';
import { COLORS } from '../../constants/script';
import { LEGACY_CLASS_MAP, type CuePaletteProfile } from '../../styles/tokens/cues';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { type CueThemeResolvedColor } from '../../styles';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface SyncCueCardProps {
  cue: Cue;
  isSelected: boolean;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
  resolveCueColor?: (typeOrClass?: string) => CueThemeResolvedColor;
}

export const SyncCueCard: React.FC<SyncCueCardProps> = memo(({
  cue,
  isSelected,
  onSelectCue,
  onDeleteCue,
  scriptThemeId = 'studio-light',
  cuePaletteProfile = 'standard',
  resolveCueColor: externalResolveCueColor,
}) => {
  const fallbackTheme = useScriptTheme(scriptThemeId as any, cuePaletteProfile);
  const resolveCueColor = externalResolveCueColor || fallbackTheme.resolveCueColor;
  const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';
  const themed = resolveCueColor(cueType);

  const startTimeStr = (cue.startTime ?? 0).toFixed(1);
  const endTimeStr = (cue.endTime ?? 0).toFixed(1);

  return (
    <div 
      onClick={() => onSelectCue(cue)}
      role="button"
      tabIndex={0}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 64px' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectCue(cue);
        }
      }}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group select-none",
        isSelected 
          ? "bg-surface-subtle border-blue-500/60 shadow-sm ring-1 ring-blue-500/40 text-text-main" 
          : "bg-surface hover:bg-surface-subtle border-border-subtle hover:border-border-main hover:shadow-xs text-text-body"
      )}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div 
          className="w-1.5 h-9 rounded-full shrink-0" 
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
          <span className="text-xs font-bold text-text-main italic leading-snug break-words">
            "{cue.selectedText}"
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={UI_TOKENS.badge.timeTag}>{startTimeStr}s</span>
            <div className="w-1.5 h-px bg-border-main" />
            <span className={UI_TOKENS.badge.timeTag}>{endTimeStr}s</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCue(cue.id);
          }}
          aria-label="Delete cue"
          title="Delete cue"
          className="p-1.5 text-text-faint hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 rounded active:scale-95"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
});

SyncCueCard.displayName = 'SyncCueCard';
