import React from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../types/script';
import { UI_TOKENS } from '../styles/tokens/ui';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  cue: Cue | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  cue,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={UI_TOKENS.modal.overlay}>
      <div className={UI_TOKENS.modal.containerSm}>
        <div className={UI_TOKENS.modal.dialogPad}>
          <div className={UI_TOKENS.iconWrapper.danger}>
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className={UI_TOKENS.modal.title}>Delete Sync Cue?</h3>
            <p className={UI_TOKENS.modal.description}>This action cannot be undone. Are you sure you want to remove this cue?</p>
          </div>
          
          {cue && (
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Cue Content</p>
              <p className="text-xs italic text-stone-600 line-clamp-2">"{cue.selectedText}"</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className={UI_TOKENS.button.secondary}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={UI_TOKENS.button.danger}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
