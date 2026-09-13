import React, { memo } from 'react';
import { Play, Edit2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModeSegmentedControlProps {
  mode: 'playback' | 'edit';
  setMode: (mode: 'playback' | 'edit') => void;
}

export const ModeSegmentedControl: React.FC<ModeSegmentedControlProps> = memo(({
  mode,
  setMode,
}) => {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <div 
        role="group"
        aria-label="Application Workflow Mode"
        className="flex p-0.5 lg:p-1 rounded-xl ring-1 ring-border-main bg-surface-muted/90 shadow-2xs"
      >
        <button
          role="button"
          aria-pressed={mode === 'playback'}
          onClick={() => setMode('playback')}
          className={cn(
            "px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
            mode === 'playback'
              ? "bg-surface text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/20"
              : "text-text-muted hover:text-text-main"
          )}
          title="Playback Mode — Screenplay sync & video player"
        >
          <Play size={12} className={mode === 'playback' ? "fill-current" : ""} />
          <span>Playback</span>
        </button>

        <button
          role="button"
          aria-pressed={mode === 'edit'}
          onClick={() => setMode('edit')}
          className={cn(
            "px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
            mode === 'edit'
              ? "bg-surface text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/20"
              : "text-text-muted hover:text-text-main"
          )}
          title="Edit Mode — Cue authoring & timeline timing"
        >
          <Edit2 size={12} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
});

ModeSegmentedControl.displayName = 'ModeSegmentedControl';
