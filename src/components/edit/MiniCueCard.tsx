import React, { memo } from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../../types/script';
import { COLORS } from '../../constants/script';
import { LEGACY_CLASS_MAP, type CuePaletteProfile } from '../../styles/tokens/cues';
import { type CueThemeResolvedColor, getCueColorForTheme, type ScriptThemeId } from '../../styles';
import { formatPrecisionTimecode, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface MiniCueCardProps {
  cue: Cue;
  index?: number;
  isSelected: boolean;
  isActive?: boolean;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
  resolveCueColor?: (typeOrClass?: string) => CueThemeResolvedColor;
  className?: string;
}

/**
 * 1-Column compact card optimized for short audio, camera, and reaction bursts (≤2.0s).
 * Fits neatly within ~160px auto-fill grid cells while maintaining full readability.
 */
export const MiniCueCard: React.FC<MiniCueCardProps> = memo(({
  cue,
  index,
  isSelected,
  isActive = false,
  onSelectCue,
  onDeleteCue,
  scriptThemeId = 'studio-light',
  cuePaletteProfile = 'standard',
  resolveCueColor: externalResolveCueColor,
  className,
}) => {
  const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';
  const themed = externalResolveCueColor
    ? externalResolveCueColor(cueType)
    : getCueColorForTheme(cueType, scriptThemeId as ScriptThemeId, cuePaletteProfile);

  const duration = Math.max(0, (cue.endTime ?? 0) - (cue.startTime ?? 0));
  const durationStr = duration.toFixed(1);
  const indexStr = typeof index === 'number' ? `#${String(index + 1).padStart(2, '0')}` : null;

  const hasValidIndices =
    typeof cue.startIndex === 'number' &&
    typeof cue.endIndex === 'number' &&
    cue.startIndex >= 0 &&
    cue.endIndex >= cue.startIndex;

  const charCount = hasValidIndices ? (cue.endIndex! - cue.startIndex!) : (cue.selectedText?.length || 0);

  const tooltipText = `${cue.speaker ? `${cue.speaker}: ` : ''}"${cue.selectedText}"\n${formatPrecisionTimecode(cue.startTime)} → ${formatPrecisionTimecode(cue.endTime)} (Δ ${durationStr}s)${hasValidIndices ? `\nScript offset: ${cue.startIndex}–${cue.endIndex} (${charCount}ch)` : '\nNot yet aligned'}`;

  return (
    <div
      id={cue.id ? `sync-cue-${cue.id}` : undefined}
      onClick={() => onSelectCue(cue)}
      role="button"
      tabIndex={0}
      title={tooltipText}
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: 'auto 74px',
        borderColor: isSelected 
          ? `rgba(${themed.rgb}, 0.7)` 
          : isActive 
            ? `rgba(${themed.rgb}, 0.55)` 
            : undefined,
        boxShadow: isSelected 
          ? `0 0 0 1px rgba(${themed.rgb}, 0.5), 0 1px 2px rgba(0,0,0,0.06)` 
          : isActive 
            ? `0 0 8px rgba(${themed.rgb}, 0.25), 0 0 0 1px rgba(${themed.rgb}, 0.3)` 
            : undefined,
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectCue(cue);
        }
      }}
      className={cn(
        "col-span-1 group flex items-stretch gap-2 p-2 rounded-xl border transition-all cursor-pointer relative overflow-hidden select-none",
        isSelected 
          ? "bg-surface-subtle text-text-main shadow-xs" 
          : isActive
            ? "bg-surface-subtle/90 text-text-main shadow-2xs"
            : "bg-surface hover:bg-surface-subtle border-border-subtle hover:border-border-main hover:shadow-xs text-text-body",
        className
      )}
    >
      {/* Vertical Theme Stripe */}
      <div 
        className={cn(
          "w-1 rounded-full shrink-0 transition-all duration-200 self-stretch my-0.5",
          isActive && "w-1.5"
        )} 
        style={{ 
          backgroundColor: `rgb(${themed.rgb})`,
          boxShadow: isActive ? `0 0 8px rgba(${themed.rgb}, 0.7)` : undefined
        }} 
      />

      {/* Main Content (Compact 3-Zone) */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        {/* Zone 1: Header */}
        <div className="flex items-center justify-between gap-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0 truncate">
            {indexStr && (
              <span className="font-mono text-[8.5px] font-bold text-text-faint shrink-0 leading-none">
                {indexStr}
              </span>
            )}
            {cueType && (
              <span 
                className="text-[7.5px] font-black uppercase tracking-wider px-1 py-0.5 rounded border shrink-0 leading-none truncate max-w-[70px]"
                style={{ 
                  backgroundColor: `rgba(${themed.rgb}, 0.15)`,
                  borderColor: `rgba(${themed.rgb}, 0.3)`,
                  color: themed.textColorClass.includes('text-amber-100') ? '#b45309' : undefined
                }}
              >
                {cueType}
              </span>
            )}
          </div>

          {/* Delete action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCue(cue.id);
            }}
            aria-label="Delete cue"
            title="Delete cue"
            className="p-0.5 text-text-faint hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 rounded active:scale-95"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Zone 2: Excerpt Body */}
        <p className="text-xs font-bold text-text-main italic leading-snug break-words select-text line-clamp-2">
          {cue.speaker && (
            <span className="not-italic font-black uppercase tracking-wider text-text-main mr-1 select-none text-[9.5px]">
              {cue.speaker}:
            </span>
          )}
          "{cue.selectedText}"
        </p>

        {/* Zone 3: Footer (Time & Duration) */}
        <div className="flex items-center justify-between gap-1 text-[8.5px] font-mono text-text-faint pt-0.5 mt-auto">
          <span className={cn(UI_TOKENS.badge.timeTag, "font-mono font-bold text-[8.5px] px-1 py-0.5 leading-none")}>
            {formatPrecisionTimecode(cue.startTime)}
          </span>
          <span className="text-[8px] font-medium text-text-muted shrink-0">
            Δ {durationStr}s
          </span>
        </div>
      </div>
    </div>
  );
});

MiniCueCard.displayName = 'MiniCueCard';
