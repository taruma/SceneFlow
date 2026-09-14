import React, { memo } from 'react';
import { Bookmark, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CueScriptAnchoringProps {
  startIndex?: number;
  endIndex?: number;
  onStartIndexChange: (index: number | undefined) => void;
  onEndIndexChange: (index: number | undefined) => void;
  cueId?: string;
  className?: string;
}

export const CueScriptAnchoring: React.FC<CueScriptAnchoringProps> = memo(({
  startIndex,
  endIndex,
  onStartIndexChange,
  onEndIndexChange,
  cueId,
  className,
}) => {
  const hasValidRange = startIndex !== undefined && endIndex !== undefined && !isNaN(startIndex) && !isNaN(endIndex);
  const charSpan = hasValidRange ? Math.max(0, endIndex - startIndex) : null;
  const isInvalidSpan = hasValidRange && endIndex < startIndex;

  return (
    <div className={cn("p-2.5 rounded-xl bg-surface-subtle border border-border-subtle space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-[9px] uppercase tracking-widest text-text-faint font-black flex items-center gap-1.5">
          <Bookmark size={11} className="text-text-muted" />
          Script Anchoring
        </label>

        <div className="flex items-center gap-1.5">
          {cueId && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-faint">
              <Hash size={9} />
              {cueId}
            </span>
          )}
          {charSpan !== null && (
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight",
              isInvalidSpan
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : "bg-surface border border-border-subtle text-text-muted"
            )}>
              {isInvalidSpan ? 'Invalid Span' : `${charSpan} chars`}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Start Index */}
        <div className="space-y-1">
          <label className="text-[8px] uppercase tracking-widest text-text-faint font-bold block">
            Start Index
          </label>
          <input
            type="number"
            min="0"
            value={startIndex !== undefined && !isNaN(startIndex) ? startIndex : ''}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === '') {
                onStartIndexChange(undefined);
              } else {
                const parsed = parseInt(raw, 10);
                onStartIndexChange(isNaN(parsed) ? undefined : Math.max(0, parsed));
              }
            }}
            placeholder="0"
            className="w-full bg-surface border border-border-main rounded-lg px-2 py-1 text-text-main font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
          />
        </div>

        {/* End Index */}
        <div className="space-y-1">
          <label className="text-[8px] uppercase tracking-widest text-text-faint font-bold block">
            End Index
          </label>
          <input
            type="number"
            min="0"
            value={endIndex !== undefined && !isNaN(endIndex) ? endIndex : ''}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === '') {
                onEndIndexChange(undefined);
              } else {
                const parsed = parseInt(raw, 10);
                onEndIndexChange(isNaN(parsed) ? undefined : Math.max(0, parsed));
              }
            }}
            placeholder="0"
            className="w-full bg-surface border border-border-main rounded-lg px-2 py-1 text-text-main font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
});

CueScriptAnchoring.displayName = 'CueScriptAnchoring';
