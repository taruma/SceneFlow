import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ScriptEditorFooterProps {
  isDirty: boolean;
  onReset: () => void;
  lineCount: number;
  charCount: number;
  wordWrap: boolean;
  onToggleWordWrap: () => void;
  activeCuesCount: number;
  autoRealign: boolean;
  onToggleAutoRealign: (val: boolean) => void;
  onClose: () => void;
  onApply: () => void;
}

export function ScriptEditorFooter({
  isDirty,
  onReset,
  lineCount,
  charCount,
  wordWrap,
  onToggleWordWrap,
  activeCuesCount,
  autoRealign,
  onToggleAutoRealign,
  onClose,
  onApply,
}: ScriptEditorFooterProps) {
  return (
    <div className="px-4 py-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-between shrink-0 gap-3">
      <div className="flex items-center gap-3">
        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            title="Revert draft back to original saved script"
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-faint hover:text-text-main transition-colors active:scale-95"
          >
            <RotateCcw size={11} />
            <span>Revert Draft</span>
          </button>
        )}
        <span className="text-[10px] font-mono text-text-faint flex items-center gap-1.5">
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{charCount.toLocaleString()} chars</span>
          <span>·</span>
          <button
            type="button"
            onClick={onToggleWordWrap}
            title="Toggle Word Wrap (Alt+Z)"
            className="hover:text-text-main transition-colors underline-offset-2 hover:underline"
          >
            {wordWrap ? 'Wrap ON' : 'Wrap OFF'}
          </button>
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {activeCuesCount > 0 && (
          <label className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-text-muted cursor-pointer select-none hover:text-text-main transition-colors">
            <input 
              type="checkbox"
              checked={autoRealign}
              onChange={(e) => onToggleAutoRealign(e.target.checked)}
              className="rounded border-border-main text-purple-600 focus:ring-purple-500 w-3 h-3"
            />
            <span>Auto-realign {activeCuesCount} cues</span>
          </label>
        )}

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-body hover:text-text-main rounded-xl text-xs font-bold transition-all border border-border-main active:scale-95"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onApply}
          className={cn(
            "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-2",
            isDirty
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
              : "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover shadow-surface-dark/10"
          )}
        >
          <CheckCircle2 size={14} />
          <span>
            {activeCuesCount > 0 && autoRealign
              ? `Apply & Realign Cues (${activeCuesCount})`
              : "Apply Changes"}
          </span>
        </button>
      </div>
    </div>
  );
}
