import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../../types/script';
import { COLORS } from '../../constants/script';
import { LEGACY_CLASS_MAP, type CuePaletteProfile } from '../../styles/tokens/cues';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface SyncCueCardProps {
  cue: Cue;
  isSelected: boolean;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
}

export const SyncCueCard: React.FC<SyncCueCardProps> = memo(({
  cue,
  isSelected,
  onSelectCue,
  onDeleteCue,
  scriptThemeId,
  cuePaletteProfile = 'standard',
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);
  const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';
  const themed = resolveCueColor(cueType);

  const startTimeStr = (cue.startTime ?? 0).toFixed(1);
  const endTimeStr = (cue.endTime ?? 0).toFixed(1);

  return (
    <div 
      onClick={() => onSelectCue(cue)}
      className={isSelected ? UI_TOKENS.panel.cardInteractiveActive : UI_TOKENS.panel.cardInteractive}
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
          <span className="text-sm font-bold text-text-body italic leading-tight break-words">
            "{cue.selectedText}"
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className={UI_TOKENS.badge.timeTag}>{startTimeStr}s</span>
            <div className="w-2 h-px bg-border-main" />
            <span className={UI_TOKENS.badge.timeTag}>{endTimeStr}s</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCue(cue.id);
          }}
          aria-label="Delete cue"
          title="Delete cue"
          className="p-2 text-text-faint hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
});

SyncCueCard.displayName = 'SyncCueCard';
