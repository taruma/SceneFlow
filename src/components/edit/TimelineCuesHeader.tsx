import React, { memo } from 'react';
import { Edit2, RefreshCw, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface TimelineCuesHeaderProps {
  cueCount: number;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
}

export const TimelineCuesHeader: React.FC<TimelineCuesHeaderProps> = memo(({
  cueCount,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className={UI_TOKENS.layout.sectionTitle}>Timeline Cues</h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenRawCuesModal}
          title="Edit raw JSON cues"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-muted border border-border-main text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          <Edit2 size={10} /> Raw
        </button>

        {cueCount > 0 && (
          <button
            type="button"
            onClick={onRealignCues}
            disabled={isAligning}
            title="Re-align cues with script text"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border",
              alignSuccess 
                ? "bg-green-50 border-green-100 text-green-600" 
                : "bg-surface-muted border-border-main text-text-muted hover:text-text-main hover:bg-surface-hover"
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
          {cueCount} total
        </span>
      </div>
    </div>
  );
});

TimelineCuesHeader.displayName = 'TimelineCuesHeader';
