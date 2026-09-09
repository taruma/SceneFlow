import React from 'react';
import { COLORS } from '../../constants/script';
import { cn } from '../../lib/utils';
import { HighlightFilterBarProps } from './types';

/**
 * Filter pill bar displaying all screenplay cue categories.
 *
 * Features:
 * - Shows a pulsing background glow when a category has cues active in current playback.
 * - Shows an indicator dot colored with the theme's resolved RGB value.
 * - Allows users to click to mute/hide or unmute/reveal specific cue types.
 */
function areFilterPropsEqual(prev: HighlightFilterBarProps, next: HighlightFilterBarProps) {
  if (prev.onToggleCueType !== next.onToggleCueType) return false;
  if (prev.resolveCueColor !== next.resolveCueColor) return false;

  if (prev.hiddenCueTypes !== next.hiddenCueTypes) {
    if (prev.hiddenCueTypes.size !== next.hiddenCueTypes.size) return false;
    for (const t of prev.hiddenCueTypes) {
      if (!next.hiddenCueTypes.has(t)) return false;
    }
  }

  if (prev.activeCueTypes !== next.activeCueTypes) {
    if (prev.activeCueTypes.size !== next.activeCueTypes.size) return false;
    for (const t of prev.activeCueTypes) {
      if (!next.activeCueTypes.has(t)) return false;
    }
  }

  return true;
}

export const HighlightFilterBar = React.memo<HighlightFilterBarProps>(({
  activeCueTypes,
  hiddenCueTypes,
  onToggleCueType,
  resolveCueColor,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
      {COLORS.map(color => {
        const isActive = activeCueTypes.has(color.type);
        const isHidden = hiddenCueTypes.has(color.type);
        const themed = resolveCueColor(color.type);

        return (
          <button
            key={color.type}
            type="button"
            onClick={() => onToggleCueType(color.type)}
            aria-pressed={!isHidden}
            title={isHidden ? `Show ${color.type} cues` : `Hide ${color.type} cues`}
            className={cn(
              "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors border relative overflow-hidden select-none",
              isHidden
                ? "bg-surface-subtle border-border-subtle text-text-faint opacity-60"
                : "bg-surface border-border-main text-text-muted hover:border-border-main shadow-sm",
              isActive && !isHidden && "bg-surface-subtle"
            )}
          >
            {isActive && !isHidden && (
              <span
                className="absolute inset-0 opacity-30 animate-pulse pointer-events-none"
                style={{ backgroundColor: `rgb(${themed.rgb})` }}
              />
            )}
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: isHidden ? undefined : `rgb(${themed.rgb})` }}
            />
            <span className="leading-none pt-px">{color.type}</span>
          </button>
        );
      })}
    </div>
  );
}, areFilterPropsEqual);

HighlightFilterBar.displayName = 'HighlightFilterBar';
