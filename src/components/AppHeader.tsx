import React from 'react';
import { Plus, Book, Coffee, Play, Edit2, Palette, Clock, FolderOpen, Download } from 'lucide-react';
import { cn } from '../lib/utils';

interface AppHeaderProps {
  mode: 'playback' | 'edit';
  setMode: (mode: 'playback' | 'edit') => void;
  currentTime: number;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
  onOpenGuide: () => void;
  isColorModalOpen: boolean;
  setIsColorModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  importJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  exportJson: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  mode,
  setMode,
  currentTime,
  isLibraryOpen,
  setIsLibraryOpen,
  onOpenGuide,
  isColorModalOpen,
  setIsColorModalOpen,
  isSettingsOpen,
  setIsSettingsOpen,
  importJson,
  exportJson,
}) => {
  return (
    <header
      className={cn(
        "h-16 border-b border-stone-200 bg-white flex items-center justify-between px-3 lg:px-6 shrink-0 z-40 shadow-sm transition-all",
        mode === 'playback' && "hidden lg:flex"
      )}
    >
      <div className="flex items-center gap-2 lg:gap-3">
        <img
          src="/SCENEFLOW_TAG_B.png"
          alt="SceneFlow Logo"
          referrerPolicy="no-referrer"
          className="h-8 lg:h-9 w-auto object-contain selection:bg-transparent pointer-events-none"
        />
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-1 lg:gap-1.5 mr-1 xl:mr-2">
          <button
            onClick={onOpenGuide}
            title="New Official Guide"
            className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm"
          >
            <Plus size={12} /> <span className="hidden xl:inline">Guide</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(true)}
            title="Example Library Catalog"
            className={cn(
              "flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border shadow-sm",
              isLibraryOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white hover:bg-stone-50 text-stone-600 border-stone-200"
            )}
          >
            <Book size={12} /> <span className="hidden xl:inline">Library</span>
          </button>

          <a
            href="https://ko-fi.com/tarumainfo"
            target="_blank"
            rel="noopener noreferrer"
            title="Support on Ko-fi"
            className="flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 bg-[#FF5E5B] hover:bg-[#e04e4b] text-white shadow-sm"
          >
            <Coffee size={12} /> <span className="hidden xl:inline">Support</span>
          </a>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 xl:px-4 py-2 bg-stone-900 rounded-xl shadow-inner animate-in fade-in zoom-in duration-500">
          <span className="hidden xl:inline text-[10px] font-black text-stone-500 uppercase tracking-widest">Current Time</span>
          <span className="text-base xl:text-lg font-mono font-bold text-white w-12 xl:w-16 text-right">{currentTime.toFixed(1)}s</span>
        </div>

        <div className="flex bg-stone-100 p-0.5 lg:p-1 rounded-lg lg:rounded-xl ring-1 ring-stone-200 scale-90 xl:scale-100">
          <button
            onClick={() => setMode('playback')}
            className={cn(
              "px-2 lg:px-3 xl:px-5 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 lg:gap-2",
              mode === 'playback' ? "bg-white shadow-md text-stone-900" : "text-stone-500 hover:text-stone-700"
            )}
          >
            <Play size={12} className={mode === 'playback' ? "fill-current" : ""} /> Playback
          </button>
          <button
            onClick={() => setMode('edit')}
            className={cn(
              "px-2 lg:px-3 xl:px-5 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 lg:gap-2",
              mode === 'edit' ? "bg-white shadow-md text-stone-900" : "text-stone-500 hover:text-stone-700"
            )}
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>

        <div className="relative hidden lg:block">
          <button
            id="script-theme-header-button"
            onClick={() => setIsColorModalOpen(true)}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm active:scale-95 flex items-center justify-center",
              isColorModalOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 hover:text-stone-700 border-stone-200"
            )}
            title="Script Color & Theme Presets"
          >
            <Palette size={18} />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
              isSettingsOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 hover:text-stone-700 border-stone-200"
            )}
            title="Timing Settings"
          >
            <Clock size={18} />
          </button>
        </div>

        <div className="hidden lg:block h-8 w-px bg-stone-200 mx-2" />

        <div className="flex items-center gap-1">
          <label
            title="Open Sync (.json)"
            className="cursor-pointer p-2 rounded-lg text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 shadow-sm transition-all active:scale-95 flex items-center justify-center"
          >
            <FolderOpen size={18} />
            <input type="file" accept=".json" onChange={importJson} className="hidden" />
          </label>
          <button
            onClick={exportJson}
            title="Save Sync (.json)"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 shadow-sm transition-all active:scale-95 flex items-center justify-center"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
