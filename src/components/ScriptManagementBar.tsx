import React from 'react';
import { FileText, Edit2 } from 'lucide-react';
import { UI_TOKENS } from '../styles/tokens/ui';

interface ScriptManagementBarProps {
  lineCount: number;
  onOpenRawScriptModal: () => void;
}

export function ScriptManagementBar({ lineCount, onOpenRawScriptModal }: ScriptManagementBarProps) {
  return (
    <section className="animate-in fade-in duration-500 mb-10">
      <div className={UI_TOKENS.panel.banner}>
        <div className="flex items-center gap-3">
          <div className={UI_TOKENS.iconWrapper.smBox}>
            <FileText size={14} className="text-text-faint" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-text-faint leading-none mb-1">Screenplay Data</h2>
            <p className="text-[10px] font-bold text-text-body leading-none">
              {lineCount} lines loaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenRawScriptModal}
            className={UI_TOKENS.button.actionPill}
          >
            <Edit2 size={10} /> Edit Raw
          </button>
        </div>
      </div>
    </section>
  );
}
