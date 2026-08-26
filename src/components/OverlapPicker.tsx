import React from 'react';
import { Cue } from '../types/script';
import { getCueColorForTheme } from '../lib/scriptStyles';
import { UI_TOKENS } from '../styles/tokens/ui';

interface OverlapPickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  cues: Cue[];
  onSelectCue: (cue: Cue) => void;
  onClose: () => void;
}

export function OverlapPicker({
  isOpen,
  position,
  cues,
  onSelectCue,
  onClose,
}: OverlapPickerProps) {
  if (!isOpen) return null;

  return (
    <div 
      className={UI_TOKENS.modal.popover}
      style={{ left: position.x, top: position.y }}
    >
      <div className="px-3 py-2 border-b border-stone-100 mb-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Select Cue to Edit</p>
      </div>
      {cues.map(cue => {
        const themed = getCueColorForTheme(cue.type || cue.colorClass || '');
        return (
          <button
            key={cue.id}
            onClick={() => onSelectCue(cue)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-stone-50 rounded-lg transition-colors text-left group"
          >
            <div 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: `rgb(${themed.rgb})` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">{cue.type || themed.type}</p>
              <p className="text-[9px] text-stone-400 font-mono italic truncate">"{cue.selectedText}"</p>
            </div>
          </button>
        );
      })}
      <button 
        onClick={onClose}
        className="w-full mt-1 px-3 py-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all text-center"
      >
        Cancel
      </button>
    </div>
  );
}
