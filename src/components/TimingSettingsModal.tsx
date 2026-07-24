import React from 'react';
import { Settings, X, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TimingSettings {
  before: number;
  after: number;
}

export interface ColorCategory {
  type: string;
  class: string;
  rgb?: string;
}

interface TimingSettingsModalProps {
  isOpen: boolean;
  settings?: Record<string, TimingSettings>;
  colors: ColorCategory[];
  onClose: () => void;
  onUpdateSetting: (category: string, field: 'before' | 'after', value: number) => void;
  onResetClick: () => void;
}

export function TimingSettingsModal({
  isOpen,
  settings,
  colors,
  onClose,
  onUpdateSetting,
  onResetClick,
}: TimingSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200">
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-900/20">
                <Settings size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-stone-900">Timing Settings</h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Adjust highlight visibility buffers</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-stone-100 rounded-2xl text-stone-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* General Master Control - Highlighted */}
            <div className="md:col-span-3 p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600">General Master Offset</span>
                </div>
                <p className="text-[10px] font-bold text-blue-400 italic">Adds extra time to ALL categories globally</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Global Before (s)</label>
                  <input 
                    type="number" step="0.1"
                    value={settings?.general?.before ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateSetting('general', 'before', val);
                    }}
                    className="w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Global After (s)</label>
                  <input 
                    type="number" step="0.1"
                    value={settings?.general?.after ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateSetting('general', 'after', val);
                    }}
                    className="w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Specific Category Grid */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {colors.map(color => (
                <div key={color.type} className="p-4 bg-stone-50 border border-stone-100 rounded-2xl space-y-3 hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", color.class)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">{color.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone-400">Before (s)</label>
                      <input 
                        type="number" step="0.1"
                        value={settings?.[color.type]?.before ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          onUpdateSetting(color.type, 'before', val);
                        }}
                        className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-stone-400">After (s)</label>
                      <input 
                        type="number" step="0.1"
                        value={settings?.[color.type]?.after ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          onUpdateSetting(color.type, 'after', val);
                        }}
                        className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <button 
              onClick={onResetClick}
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={12} /> Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
