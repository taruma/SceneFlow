import React, { memo, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../../types/script';
import { COLORS } from '../../constants/script';
import { LEGACY_CLASS_MAP, type CuePaletteProfile } from '../../styles/tokens/cues';
import { type CueThemeResolvedColor, getCueColorForTheme, type ScriptThemeId } from '../../styles';
import { formatPrecisionTimecode, cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface SyncCueCardProps {
  cue: Cue;
  index?: number;
  isSelected: boolean;
  isActive?: boolean;
  isPrimary?: boolean;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
  resolveCueColor?: (typeOrClass?: string) => CueThemeResolvedColor;
  className?: string;
}

const CORE_KEYS = new Set([
  'id',
  'selectedText',
  'startTime',
  'endTime',
  'startIndex',
  'endIndex',
  'colorClass',
  'type',
  'speaker',
]);

export const SyncCueCard: React.FC<SyncCueCardProps> = memo(({
  cue,
  index,
  isSelected,
  isActive = false,
  isPrimary = false,
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

  const hasValidIndices =
    typeof cue.startIndex === 'number' &&
    typeof cue.endIndex === 'number' &&
    cue.startIndex >= 0 &&
    cue.endIndex >= cue.startIndex;

  const charCount = hasValidIndices ? (cue.endIndex! - cue.startIndex!) : (cue.selectedText?.length || 0);
  const duration = Math.max(0, (cue.endTime ?? 0) - (cue.startTime ?? 0));
  const durationStr = duration.toFixed(1);
  const indexStr = typeof index === 'number' ? `#${String(index + 1).padStart(2, '0')}` : null;
  const spanClass = duration > 5.0 && charCount > 60
    ? "col-span-1 min-[420px]:col-span-2 min-[640px]:col-span-3"
    : "col-span-1 min-[420px]:col-span-2";

  // Filter out any custom metadata attributes from JSON (e.g. shot, take, mood, matchStatus)
  const customTags = useMemo(() => {
    return Object.entries(cue).filter(([k, v]) => {
      if (CORE_KEYS.has(k)) return false;
      if (v === null || v === undefined || v === '') return false;
      if (typeof v === 'object') return false;
      return true;
    });
  }, [cue]);

  return (
    <div 
      id={cue.id ? `sync-cue-${cue.id}` : undefined}
      onClick={() => onSelectCue(cue)}
      role="button"
      tabIndex={0}
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: 'auto 76px',
        borderColor: isSelected 
          ? `rgba(${themed.rgb}, 0.7)` 
          : isPrimary 
            ? `rgba(${themed.rgb}, 0.65)` 
            : undefined,
        boxShadow: isSelected 
          ? `0 0 0 1px rgba(${themed.rgb}, 0.5), 0 1px 3px rgba(0,0,0,0.06)` 
          : isPrimary 
            ? `0 0 10px rgba(${themed.rgb}, 0.3), 0 0 0 1px rgba(${themed.rgb}, 0.35)` 
            : undefined,
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectCue(cue);
        }
      }}
      className={cn(
        spanClass,
        "group flex items-stretch gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden select-none",
        isSelected 
          ? "bg-surface-subtle text-text-main shadow-xs" 
          : isPrimary
            ? "bg-surface-subtle/90 text-text-main shadow-2xs"
            : isActive
              ? "bg-surface text-text-main border-border-subtle"
              : "bg-surface hover:bg-surface-subtle border-border-subtle hover:border-border-main hover:shadow-xs text-text-body",
        className
      )}
    >
      {/* Active Category Ambient Glow Layer (Directional Gradient) */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          isActive ? (isPrimary ? "opacity-100" : "opacity-65") : "opacity-0"
        )}
        style={{
          background: `linear-gradient(90deg, rgba(${themed.rgb}, 0.25) 0%, rgba(${themed.rgb}, 0.07) 100%)`,
        }}
      />

      {/* Vertical Theme Stripe */}
      <div 
        className={cn(
          "w-1 rounded-full shrink-0 transition-all duration-200 self-stretch my-0.5 relative",
          isPrimary && "w-1.5"
        )} 
        style={{ 
          backgroundColor: `rgb(${themed.rgb})`,
          boxShadow: isPrimary ? `0 0 8px rgba(${themed.rgb}, 0.7)` : undefined
        }} 
      />

      {/* Main Content (3-Zone Flex) */}
      <div className="flex flex-col flex-1 min-w-0 gap-1.5 relative">
        {/* Zone 1: Metadata Header */}
        <div className="flex items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {/* Sequence & Cue ID Chip */}
            {(indexStr || cue.id) && (
              <div className="flex items-center gap-1 font-mono text-[8.5px] text-text-faint bg-surface-muted/60 border border-border-subtle/60 px-1.5 py-0.5 rounded shrink-0 leading-none">
                {indexStr && (
                  <span className="font-bold text-text-muted">
                    {indexStr}
                  </span>
                )}
                {indexStr && cue.id && (
                  <span className="text-border-main text-[8px] opacity-60">·</span>
                )}
                {cue.id && (
                  <span 
                    className="text-text-faint/90 hover:text-text-muted transition-colors truncate max-w-[65px]"
                    title={`Cue ID: ${cue.id}`}
                  >
                    {cue.id}
                  </span>
                )}
              </div>
            )}

            {cueType && (
              <span 
                className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 leading-none"
                style={{ 
                  backgroundColor: `rgba(${themed.rgb}, 0.15)`,
                  borderColor: `rgba(${themed.rgb}, 0.3)`,
                  color: themed.textColorClass.includes('text-amber-100') ? '#b45309' : undefined
                }}
              >
                {cueType}
              </span>
            )}

            {/* Custom dynamic tags from JSON */}
            {customTags.slice(0, 2).map(([key, val]) => (
              <span 
                key={key}
                className="text-[8px] font-mono text-text-faint bg-surface-muted/80 px-1.5 py-0.5 rounded border border-border-subtle shrink-0 max-w-[80px] truncate leading-none"
                title={`${key}: ${String(val)}`}
              >
                {key}: {String(val)}
              </span>
            ))}
            {customTags.length > 2 && (
              <span 
                className="text-[8px] font-mono text-text-faint bg-surface-muted px-1 py-0.5 rounded border border-border-subtle shrink-0 cursor-help leading-none"
                title={customTags.slice(2).map(([k, v]) => `${k}: ${String(v)}`).join('\n')}
              >
                +{customTags.length - 2}
              </span>
            )}
          </div>

          {/* Header Action: Delete */}
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

        {/* Zone 2: Excerpt Body */}
        <p 
          className="text-xs font-bold text-text-main italic leading-snug break-words select-text line-clamp-2"
          title={cue.speaker ? `${cue.speaker}: "${cue.selectedText}"` : `"${cue.selectedText}"`}
        >
          {cue.speaker && (
            <span className="not-italic font-black uppercase tracking-wider text-text-main mr-1.5 select-none text-[10px]">
              {cue.speaker}:
            </span>
          )}
          "{cue.selectedText}"
        </p>

        {/* Zone 3: Footer (Timing & Script Anchor / Alignment Status) */}
        <div className="flex items-center justify-between gap-2 text-[9px] font-mono text-text-faint pt-0.5">
          {/* Timing Info */}
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn(UI_TOKENS.badge.timeTag, "font-mono font-bold text-[9px] px-1 py-0.5 leading-none")}>
              {formatPrecisionTimecode(cue.startTime)}
            </span>
            <span className="text-border-main text-[8px]">→</span>
            <span className={cn(UI_TOKENS.badge.timeTag, "font-mono font-bold text-[9px] px-1 py-0.5 leading-none")}>
              {formatPrecisionTimecode(cue.endTime)}
            </span>
            <span className="text-[8.5px] font-medium text-text-muted ml-0.5">
              Δ {durationStr}s
            </span>
          </div>

          {/* Script Anchor or Alignment Status */}
          <div className="shrink-0 flex items-center">
            {hasValidIndices ? (
              <span 
                className="font-mono text-[8.5px] text-text-faint bg-surface-muted/50 px-1.5 py-0.5 rounded border border-border-subtle/60"
                title={`Script Range: ${cue.startIndex}–${cue.endIndex} (${charCount} characters)`}
              >
                {cue.startIndex}–{cue.endIndex} · {charCount}ch
              </span>
            ) : (
              <span 
                className="flex items-center gap-1 text-[8px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded"
                title="Cue is not yet aligned to script text. Use Realign in toolbar or edit manually."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Needs Align
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

SyncCueCard.displayName = 'SyncCueCard';
