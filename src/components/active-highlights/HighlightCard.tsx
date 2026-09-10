import React from 'react';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { HighlightCardProps } from './types';

/**
 * Individual active highlight card.
 *
 * Renders:
 * - A vertical rounded indicator stripe matching the theme's resolved cue color.
 * - Screenplay quote text in serif italics with two-line clamping.
 * - Uppercase category tag badge positioned in the top-right corner.
 * - Smooth fade-in & slide-in entry animation.
 */
export const HighlightCard: React.FC<HighlightCardProps> = ({
  cue,
  themedColor,
  onClick,
}) => {
  return (
    <div
      onClick={onClick ? () => onClick(cue) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        UI_TOKENS.panel.card,
        "flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden",
        onClick && "cursor-pointer hover:border-border-muted transition-colors"
      )}
    >
      <div
        className="w-1.5 h-8 rounded-full shrink-0"
        style={{ backgroundColor: `rgb(${themedColor.rgb})` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-serif italic text-text-body line-clamp-2">
          "{cue.selectedText}"
        </p>
        {cue.type && (
          <span className="absolute top-1 right-2 text-[8px] font-black uppercase tracking-widest text-text-faint">
            {cue.type}
          </span>
        )}
      </div>
    </div>
  );
};
