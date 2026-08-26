import React from 'react';
import { Clock, X } from 'lucide-react';
import { UI_TOKENS } from '../styles/tokens/ui';

interface RawCuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCuesText: string;
  onChangeRawCuesText: (text: string) => void;
  onSave: () => void;
}

export function RawCuesModal({
  isOpen,
  onClose,
  rawCuesText,
  onChangeRawCuesText,
  onSave,
}: RawCuesModalProps) {
  if (!isOpen) return null;

  return (
    <div className={UI_TOKENS.modal.overlayHeavy}>
      <div className={UI_TOKENS.modal.containerMd}>
        <div className={UI_TOKENS.modal.bodyPad}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={UI_TOKENS.iconWrapper.blue}>
                <Clock size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-stone-900">Edit Raw Cues</h2>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">JSON Format</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={UI_TOKENS.button.iconCloseSquare}
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2">
            <label className={UI_TOKENS.input.label}>JSON Data</label>
            <textarea
              value={rawCuesText}
              onChange={(e) => onChangeRawCuesText(e.target.value)}
              className={UI_TOKENS.input.textareaCode}
              placeholder='[ { "id": "...", "selectedText": "...", "startTime": 0, "endTime": 10, ... } ]'
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              className={UI_TOKENS.button.secondaryWide}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className={UI_TOKENS.button.primaryBlue}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
