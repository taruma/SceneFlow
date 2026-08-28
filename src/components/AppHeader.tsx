import React from 'react';
import { Plus, Book, Coffee, Play, Edit2, Palette, Clock, FolderOpen, Download, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

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
  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (open: boolean) => void;
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
  isInfoModalOpen,
  setIsInfoModalOpen,
  importJson,
  exportJson,
}) => {
  return (
    <header
      className={cn(
        UI_TOKENS.layout.appHeader,
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
            className={cn("hidden lg:flex", UI_TOKENS.button.actionPill, "px-2 py-1.5 xl:px-2.5")}
          >
            <Plus size={12} /> <span className="hidden xl:inline">Guide</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(true)}
            title="Example Library Catalog"
            className={cn(
              "px-1.5 py-1.5 lg:px-2 xl:px-2.5",
              isLibraryOpen ? UI_TOKENS.button.actionPillActive : UI_TOKENS.button.actionPill
            )}
          >
            <Book size={12} /> <span className="hidden xl:inline">Library</span>
          </button>

          <a
            href="https://ko-fi.com/tarumainfo"
            target="_blank"
            rel="noopener noreferrer"
            title="Support on Ko-fi"
            className={UI_TOKENS.button.supportPill}
          >
            <Coffee size={12} /> <span className="hidden xl:inline">Support</span>
          </a>
        </div>

        <div className={UI_TOKENS.badge.currentTimePill}>
          <span className="hidden xl:inline text-[10px] font-black text-text-faint uppercase tracking-widest">Current Time</span>
          <span className="text-base xl:text-lg font-mono font-bold text-btn-primary-text w-12 xl:w-16 text-right">{currentTime.toFixed(1)}s</span>
        </div>

        <div className={UI_TOKENS.button.modeSwitchContainer}>
          <button
            onClick={() => setMode('playback')}
            className={cn(
              "px-2 lg:px-3 xl:px-5 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 lg:gap-2",
              mode === 'playback' ? UI_TOKENS.button.modeSwitchActive : UI_TOKENS.button.modeSwitchInactive
            )}
          >
            <Play size={12} className={mode === 'playback' ? "fill-current" : ""} /> Playback
          </button>
          <button
            onClick={() => setMode('edit')}
            className={cn(
              "px-2 lg:px-3 xl:px-5 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 lg:gap-2",
              mode === 'edit' ? UI_TOKENS.button.modeSwitchActive : UI_TOKENS.button.modeSwitchInactive
            )}
          >
            <Edit2 size={12} /> Edit
          </button>
        </div>

        <div className="relative hidden lg:block">
          <button
            id="script-theme-header-button"
            onClick={() => setIsColorModalOpen(true)}
            className={isColorModalOpen ? UI_TOKENS.button.headerIconButtonActive : UI_TOKENS.button.headerIconButton}
            title="Script Color & Theme Presets"
          >
            <Palette size={18} />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={isSettingsOpen ? UI_TOKENS.button.headerIconButtonActive : UI_TOKENS.button.headerIconButton}
            title="Timing Settings"
          >
            <Clock size={18} />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className={isInfoModalOpen ? UI_TOKENS.button.headerIconButtonActive : UI_TOKENS.button.headerIconButton}
            title="About & Information"
          >
            <Info size={18} />
          </button>
        </div>

        <div className="hidden lg:block h-8 w-px bg-border-main mx-2" />

        <div className="flex items-center gap-1">
          <label
            title="Open Sync (.json)"
            className={cn("cursor-pointer", UI_TOKENS.button.headerIconButton)}
          >
            <FolderOpen size={18} />
            <input type="file" accept=".json" onChange={importJson} className="hidden" />
          </label>
          <button
            onClick={exportJson}
            title="Save Sync (.json)"
            className={UI_TOKENS.button.headerIconButton}
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
