import React from 'react';
import { FileText, X } from 'lucide-react';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface RawScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  onChangeScriptText: (text: string) => void;
}

export function RawScriptModal({
  isOpen,
  onClose,
  scriptText,
  onChangeScriptText,
}: RawScriptModalProps) {
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div 
      className={UI_TOKENS.modal.overlayHeavy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={UI_TOKENS.modal.containerMd}>

        <div className={UI_TOKENS.modal.bodyPad}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={UI_TOKENS.iconWrapper.neutral}>
                <FileText size={24} className="text-text-body" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-main">Raw Screenplay</h3>
                <p className="text-xs text-text-faint uppercase tracking-[0.2em] font-black">Initial Input & Bulk Edit</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={UI_TOKENS.button.iconClose}
            >
              <X size={24} />
            </button>
          </div>
          
          <textarea
            value={scriptText}
            onChange={(e) => onChangeScriptText(e.target.value)}
            className={`h-96 ${UI_TOKENS.input.textarea}`}
            placeholder="Paste your screenplay here..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className={UI_TOKENS.button.primary}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
