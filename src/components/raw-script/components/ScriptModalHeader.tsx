import React from 'react';
import { FileText, X } from 'lucide-react';

interface ScriptModalHeaderProps {
  isDirty: boolean;
  onClose: () => void;
}

export function ScriptModalHeader({ isDirty, onClose }: ScriptModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-surface-subtle shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
          <FileText size={16} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-text-main tracking-tight uppercase">
              Source Script Studio
            </h2>
            {isDirty && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 uppercase tracking-wider animate-pulse">
                Unsaved Draft
              </span>
            )}
          </div>
          <p className="text-[9px] font-bold text-text-faint uppercase tracking-wider">
            Quick Edit & Staging Markup
          </p>
        </div>
      </div>
      
      <button 
        onClick={onClose}
        title="Close modal (Esc)"
        className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}
