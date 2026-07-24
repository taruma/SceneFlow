import React from 'react';
import { FileText, Edit2 } from 'lucide-react';

interface ScriptManagementBarProps {
  lineCount: number;
  onOpenRawScriptModal: () => void;
}

export function ScriptManagementBar({ lineCount, onOpenRawScriptModal }: ScriptManagementBarProps) {
  return (
    <section className="animate-in fade-in duration-500 mb-10">
      <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100 shadow-sm">
            <FileText size={14} className="text-stone-400" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400 leading-none mb-1">Screenplay Data</h2>
            <p className="text-[10px] font-bold text-stone-600 leading-none">
              {lineCount} lines loaded
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenRawScriptModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm"
          >
            <Edit2 size={10} /> Edit Raw
          </button>
        </div>
      </div>
    </section>
  );
}
