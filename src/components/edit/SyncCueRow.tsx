import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../../types/script';
import { COLORS } from '../../constants/script';
import { LEGACY_CLASS_MAP, type CuePaletteProfile } from '../../styles/tokens/cues';
import { type CueThemeResolvedColor, getCueColorForTheme, type ScriptThemeId } from '../../styles';
import { formatPrecisionTimecode, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface SyncCueRowProps {
  cue: Cue;
  isSelected: boolean;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
  resolveCueColor?: (typeOrClass?: string) => CueThemeResolvedColor;
}

export const SyncCueRow: React.FC<SyncCueRowProps> = memo(({
  cue,
  isSelected,
  onSelectCue,
  onDeleteCue,
  scriptThemeId = 'studio-light',
  cuePaletteProfile = 'standard',
  resolveCueColor: externalResolveCueColor,
}) => {
  const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';
  const themed = externalResolveCueColor
    ? externalResolveCueColor(cueType)
    : getCueColorForTheme(cueType, scriptThemeId as ScriptThemeId, cuePaletteProfile);

  const startTimeStr = (cue.startTime ?? 0).toFixed(1);

  return (
    <div
      onClick={() => onSelectCue(cue)}
      role="button"
      tabIndex={0}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 34px' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectCue(cue);
        }
      }}
      className={cn(
        "group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-xs select-none",
        isSelected 
          ? "bg-surface-subtle border-blue-500/50 shadow-xs ring-1 ring-blue-500/30 text-text-main" 
          : "bg-surface hover:bg-surface-subtle border-border-subtle hover:border-border-main text-text-body"
      )}
    >
      {/* Timecode Pill */}
      <span className={cn(
        UI_TOKENS.badge.timeTag,
        "shrink-0 font-mono text-[9.5px] font-bold min-w-[50px] text-center"
      )}>
        {formatPrecisionTimecode(cue.startTime)}
      </span>

      {/* Category Indicator Dot & Tag */}
      <div 
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0 border"
        style={{
          backgroundColor: `rgba(${themed.rgb}, 0.12)`,
          borderColor: `rgba(${themed.rgb}, 0.25)`,
          color: themed.textColorClass.includes('text-amber-100') ? '#b45309' : undefined,
        }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full shrink-0" 
          style={{ backgroundColor: `rgb(${themed.rgb})` }} 
        />
        <span className="truncate max-w-[65px]">{cueType}</span>
      </div>

      {/* Cue Text Excerpt */}
      <span className="truncate font-medium text-xs text-text-main flex-1 min-w-0 italic">
        "{cue.selectedText}"
      </span>

      {/* Hover-revealed Delete Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteCue(cue.id);
        }}
        aria-label="Delete cue"
        title="Delete cue"
        className="p-1 text-text-faint hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 rounded active:scale-95"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
});

SyncCueRow.displayName = 'SyncCueRow';
