import React from 'react';
import { Plus, Book, Coffee, Play, Edit2, Palette, Clock, FolderOpen, Download, Info, Sun, Moon, Sparkles, RotateCcw, Newspaper } from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { EXTERNAL_LINKS } from '../constants/links';
import type { AppThemeMode, AppThemeCategory } from '../hooks/useAppShellTheme';
import { DEFAULT_SPLIT_RATIO } from '../hooks/useScriptPreferences';

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
  themeMode?: AppThemeMode;
  effectiveThemeCategory?: AppThemeCategory;
  onCycleThemeMode?: () => void;
  isViewCustomized?: boolean;
  onResetView?: () => void;
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
  themeMode = 'auto',
  effectiveThemeCategory = 'light',
  onCycleThemeMode,
  isViewCustomized = false,
  onResetView,
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
          className="logo-light h-8 lg:h-9 w-auto object-contain selection:bg-transparent pointer-events-none"
        />
        <img
          src="/SCENEFLOW_TAG_WHITE.png"
          alt="SceneFlow Logo"
          referrerPolicy="no-referrer"
          className="logo-dark h-8 lg:h-9 w-auto object-contain selection:bg-transparent pointer-events-none"
        />
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-1 lg:gap-1.5 mr-1 xl:mr-2">
          <a
            href={EXTERNAL_LINKS.article}
            target="_blank"
            rel="noopener noreferrer"
            title="Read Introduction Article on Substack"
            className={cn("hidden lg:flex", UI_TOKENS.button.actionPill, "px-2 py-1.5 xl:px-2.5")}
          >
            <Newspaper size={12} /> <span className="hidden xl:inline">Article</span>
          </a>

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
            href={EXTERNAL_LINKS.kofi}
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
          <span className="text-base xl:text-lg font-mono font-bold text-white w-12 xl:w-16 text-right">{currentTime.toFixed(1)}s</span>
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

        {/* Quick App Shell Theme Switcher */}
        {onCycleThemeMode && (
          <div className="relative hidden lg:block">
            <button
              id="app-theme-cycle-button"
              onClick={onCycleThemeMode}
              className={UI_TOKENS.button.headerIconButton}
              title={`App Theme: ${themeMode === 'auto' ? `Auto (Matching ${effectiveThemeCategory})` : themeMode.toUpperCase()} — Click to cycle (Auto/Light/Warm/Dark)`}
            >
              {themeMode === 'auto' ? (
                <div className="relative">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="absolute -bottom-1 -right-1 text-[7px] font-black uppercase tracking-tighter opacity-80">A</span>
                </div>
              ) : effectiveThemeCategory === 'dark' ? (
                <Moon size={17} className="text-blue-400" />
              ) : effectiveThemeCategory === 'warm' ? (
                <Coffee size={17} className="text-amber-600" />
              ) : (
                <Sun size={17} className="text-amber-500" />
              )}
            </button>
          </div>
        )}

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

        {/* Reset View Layout Button */}
        {onResetView && (
          <div className="relative hidden lg:block">
            <button
              onClick={onResetView}
              className={cn(
                UI_TOKENS.button.headerIconButton,
                isViewCustomized && "text-blue-500 hover:text-blue-600 dark:text-blue-400"
              )}
              title={
                isViewCustomized
                  ? "Reset View Layout & Video Size (Customized)"
                  : `Reset View Layout & Video Size (Default ${DEFAULT_SPLIT_RATIO}:${100 - DEFAULT_SPLIT_RATIO})`
              }
            >
              <RotateCcw size={16} className={cn(isViewCustomized && "transition-transform active:-rotate-45")} />
              {isViewCustomized && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          </div>
        )}

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
