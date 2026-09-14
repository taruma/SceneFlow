import React, { memo, useMemo } from 'react';
import { cn } from '../../lib/utils';

export interface CueSceneContextProps {
  scriptText: string;
  startIndex?: number;
  endIndex?: number;
  children: React.ReactNode;
  className?: string;
}

export const CueSceneContext: React.FC<CueSceneContextProps> = memo(({
  scriptText,
  startIndex,
  endIndex,
  children,
  className,
}) => {
  const { prevLine, nextLine } = useMemo(() => {
    if (!scriptText || startIndex === undefined || endIndex === undefined) {
      return { prevLine: null, nextLine: null };
    }

    // Extract text before startIndex
    const textBefore = scriptText.substring(0, Math.max(0, startIndex));
    const linesBefore = textBefore.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const prev = linesBefore.length > 0 ? linesBefore[linesBefore.length - 1] : null;

    // Extract text after endIndex
    const textAfter = scriptText.substring(Math.max(0, endIndex));
    const linesAfter = textAfter.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const next = linesAfter.length > 0 ? linesAfter[0] : null;

    return { prevLine: prev, nextLine: next };
  }, [scriptText, startIndex, endIndex]);

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Preceding Scene Line */}
      {prevLine && (
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted/30 border border-border-subtle/50 text-[10px] font-serif italic text-text-faint/60 select-none overflow-hidden"
          title={`Preceding screenplay context: ${prevLine}`}
        >
          <span className="text-[8px] font-sans font-black tracking-widest text-text-faint/40 uppercase shrink-0">
            PREV
          </span>
          <span className="truncate">{prevLine}</span>
        </div>
      )}

      {/* Main Quote / Selected Textarea */}
      {children}

      {/* Following Scene Line */}
      {nextLine && (
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-muted/30 border border-border-subtle/50 text-[10px] font-serif italic text-text-faint/60 select-none overflow-hidden"
          title={`Following screenplay context: ${nextLine}`}
        >
          <span className="text-[8px] font-sans font-black tracking-widest text-text-faint/40 uppercase shrink-0">
            NEXT
          </span>
          <span className="truncate">{nextLine}</span>
        </div>
      )}
    </div>
  );
});

CueSceneContext.displayName = 'CueSceneContext';
