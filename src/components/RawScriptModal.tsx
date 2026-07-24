import React from 'react';
import { FileText, X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 lg:p-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200">
                <FileText size={24} className="text-stone-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Raw Screenplay</h3>
                <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-black">Initial Input & Bulk Edit</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-stone-100 rounded-full transition-colors active:scale-90"
            >
              <X size={24} className="text-stone-400" />
            </button>
          </div>
          
          <textarea
            value={scriptText}
            onChange={(e) => onChangeScriptText(e.target.value)}
            className="w-full h-96 px-6 py-5 bg-stone-50 border border-stone-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all font-mono text-sm resize-none leading-relaxed"
            placeholder="Paste your screenplay here..."
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
