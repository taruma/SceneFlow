
import React from 'react';
import { cn } from '../lib/utils';
import { ScriptBlock, ScriptCue } from '../types/script';
import { SCRIPT_THEMES } from '../lib/scriptStyles';
import { ScriptLine } from './ScriptLine';
import { Info } from 'lucide-react';

interface ScriptPreviewProps {
  blocks: ScriptBlock[];
  cues: ScriptCue[];
  currentTime: number;
  isCueVisible: (cue: ScriptCue) => boolean;
  settings?: any;
  mode: 'playback' | 'edit';
  theme?: 'standard' | 'compact';
  isAutoScrollEnabled?: boolean;
  newCueId?: string;
  selection?: { start: number; end: number; text: string } | null;
  playerState?: number;
  onStagingClick: (block: any) => void;
  onCueClick: (cues: ScriptCue[], event: React.MouseEvent) => void;
}

export const ScriptPreview: React.FC<ScriptPreviewProps> = ({
  blocks,
  cues,
  currentTime,
  isCueVisible,
  settings,
  mode,
  theme = 'standard',
  newCueId,
  selection,
  playerState,
  onStagingClick,
  onCueClick
}) => {
  const styles = SCRIPT_THEMES[theme];

  return (
    <div className={cn("p-6 md:p-8 lg:p-12 font-serif", styles.container)}>
      {blocks.map((block, idx) => {
        if (block.type === 'staging') {
          return (
            <div key={block.id} className="hidden lg:flex items-center justify-center gap-2 my-4">
              {block.metadata?.stagingBlocks?.map((staging, bIdx) => (
                <button
                  key={bIdx}
                  onClick={() => onStagingClick(staging)}
                  disabled={playerState === 1}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white shadow-sm transition-all",
                    playerState === 1 
                      ? "opacity-30 cursor-not-allowed" 
                      : "hover:border-stone-400 hover:shadow-md active:scale-95"
                  )}
                >
                  <Info size={10} className="text-stone-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
                    {staging.label}
                  </span>
                </button>
              ))}
            </div>
          );
        }

        if (block.type === 'separator') {
          return <hr key={block.id} className={styles.transition} />;
        }

        if (block.type === 'title') {
          return (
            <div key={block.id} className={styles.title}>
              <div className="h-px bg-stone-200/50 flex-1" />
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-[0.4em] whitespace-nowrap">
                {block.content.trim()}
              </span>
              <div className="h-px bg-stone-200/50 flex-1" />
            </div>
          );
        }

        // Check if any cue is active for this block to apply "Focus"
        const isBlockActive = cues.some(c => 
          isCueVisible(c) && c.startIndex < block.endIndex && c.endIndex > block.startIndex
        );

        const blockClassName = cn(
          styles[block.type as keyof typeof styles] || styles.action,
          styles.line,
          mode === 'playback' && (isBlockActive ? styles.activeLine : styles.inactiveLine)
        );

        return (
          <ScriptLine
            key={block.id}
            line={block.content}
            lineStart={block.startIndex}
            lineEnd={block.endIndex}
            cues={cues}
            isCueVisible={isCueVisible}
            mode={mode}
            currentTime={currentTime}
            settings={settings}
            newCueId={newCueId}
            selection={selection}
            onCueClick={onCueClick}
            className={blockClassName}
            isName={block.type === 'character'}
          />
        );
      })}
    </div>
  );
};
