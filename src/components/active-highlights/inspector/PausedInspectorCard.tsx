import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Cue } from '../../../types/script';
import { PausedInspectorCardProps } from '../types';
import { UI_TOKENS } from '../../../styles/tokens/ui';
import { cn } from '../../../lib/utils';

/**
 * Format decimal seconds to MM:SS.s precision (e.g., 00:14.2).
 */
function formatPrecisionTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = (safe % 60).toFixed(1);
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
}

/**
 * Docked inspector card appearing below the timeline when video playback is paused,
 * or when the user selects a specific cue block.
 *
 * Features:
 * - Tabbed navigation if multiple cues are simultaneously active under the playhead.
 * - Category pill with theme-resolved dynamic color pip.
 * - Screenplay quote rendered in large, readable serif italics.
 * - Precision timecode range and duration badge (e.g. 00:14.2 → 00:18.0 • 3.8s).
 * - "Replay Cue" button allowing instant scrub & replay.
 */
export const PausedInspectorCard: React.FC<PausedInspectorCardProps> = ({
  activeCues,
  selectedCue,
  onSelectCue,
  onReplayCue,
  resolveCueColor,
}) => {
  const currentCue = selectedCue || (activeCues.length > 0 ? activeCues[0] : null);

  if (!currentCue) {
    return (
      <div className={cn(UI_TOKENS.panel.emptyPlaceholder, "py-4 text-xs text-text-faint italic")}>
        Pause playback over a cue to inspect timing and delivery details
      </div>
    );
  }

  const themed = resolveCueColor(currentCue.type || currentCue.colorClass || '');
  const duration = Math.max(0, currentCue.endTime - currentCue.startTime).toFixed(1);

  return (
    <div className={cn(
      UI_TOKENS.panel.card,
      "p-4 mt-3 bg-surface/90 border border-border-main shadow-md rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden"
    )}>
      {/* Category accent line at top */}
      <div
        className="absolute top-0 inset-x-0 h-1"
        style={{ backgroundColor: `rgb(${themed.rgb || '255,255,255'})` }}
      />

      {/* Multi-cue Tabs (if more than one cue active simultaneously) */}
      {activeCues.length > 1 && (
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-faint mr-1">
            Active ({activeCues.length}):
          </span>
          {activeCues.map((c, idx) => {
            const isTabActive = (selectedCue?.id || activeCues[0].id) === c.id;
            const tabTheme = resolveCueColor(c.type || c.colorClass || '');
            return (
              <button
                key={c.id || `tab-${idx}`}
                type="button"
                onClick={() => onSelectCue(c)}
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border",
                  isTabActive
                    ? "bg-surface-elevated text-text-main border-border-muted shadow-xs"
                    : "bg-surface-subtle text-text-muted border-transparent hover:text-text-main"
                )}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: `rgb(${tabTheme.rgb})` }}
                />
                <span>{c.type || 'cue'}</span>
                <span className="truncate max-w-[100px] opacity-70 font-serif italic lowercase font-normal">
                  "{c.selectedText.slice(0, 16)}..."
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Inspector Header */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Category Pill */}
          <span
            className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border"
            style={{
              borderColor: `rgba(${themed.rgb}, 0.5)`,
              backgroundColor: `rgba(${themed.rgb}, 0.15)`,
              color: `rgb(${themed.rgb})`,
            }}
          >
            {currentCue.type || 'cue'}
          </span>

          {/* Time Range & Duration */}
          <span className="text-xs font-mono text-text-muted">
            {formatPrecisionTime(currentCue.startTime)} → {formatPrecisionTime(currentCue.endTime)}
            <span className="text-text-faint ml-1.5">({duration}s)</span>
          </span>
        </div>

        {/* Replay Cue Button */}
        <button
          type="button"
          onClick={() => onReplayCue(currentCue)}
          title="Jump to start and replay this cue"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-muted hover:bg-surface-hover border border-border-main text-text-muted hover:text-text-main rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-xs"
        >
          <RotateCcw size={11} />
          Replay
        </button>
      </div>

      {/* Full Screenplay Quote */}
      <p className="text-sm font-serif italic text-text-body leading-relaxed pl-2 border-l-2 border-border-subtle">
        "{currentCue.selectedText}"
      </p>
    </div>
  );
};
