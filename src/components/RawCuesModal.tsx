import React from 'react';
import { Clock, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 lg:p-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                <Clock size={20} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-stone-900">Edit Raw Cues</h2>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">JSON Format</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-stone-100 rounded-2xl text-stone-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">JSON Data</label>
            <textarea
              value={rawCuesText}
              onChange={(e) => onChangeRawCuesText(e.target.value)}
              className="w-full h-[400px] bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 font-mono text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              placeholder='[ { "id": "...", "selectedText": "...", "startTime": 0, "endTime": 10, ... } ]'
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
