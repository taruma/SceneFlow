import React from 'react';
import { Cue } from '../../../types/script';
import { CueThemeResolvedColor } from '../../../styles';
import { HighlightCard } from '../HighlightCard';
import { UI_TOKENS } from '../../../styles/tokens/ui';
import { cn } from '../../../lib/utils';

interface HighlightCardsViewProps {
  visibleCues: Cue[];
  resolveCueColor: (typeOrClass?: string) => CueThemeResolvedColor;
  onCueClick?: (cue: Cue) => void;
}

/**
 * Classic Cards (Legacy) view rendering floating cue cards with vertical accent stripes.
 */
export const HighlightCardsView: React.FC<HighlightCardsViewProps> = ({
  visibleCues,
  resolveCueColor,
  onCueClick,
}) => {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
      {visibleCues.map((cue, idx) => {
        const themed = resolveCueColor(cue.type || cue.colorClass || '');
        const itemKey = cue.id ? `highlight-${cue.id}-${idx}` : `highlight-idx-${idx}`;

        return (
          <HighlightCard
            key={itemKey}
            cue={cue}
            themedColor={themed}
            index={idx}
            onClick={onCueClick}
          />
        );
      })}

      {visibleCues.length === 0 && (
        <div className={cn(UI_TOKENS.panel.emptyPlaceholder, "py-8")}>
          <p className="text-xs text-text-faint italic">No active highlights at this time</p>
        </div>
      )}
    </div>
  );
};
