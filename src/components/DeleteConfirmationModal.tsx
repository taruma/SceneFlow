import React from 'react';
import { Trash2 } from 'lucide-react';
import { Cue } from '../types/script';

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200">
        <div className="p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Delete Sync Cue?</h3>
            <p className="text-sm text-stone-500 mt-2">This action cannot be undone. Are you sure you want to remove this cue?</p>
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
              className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
