import React, { useState } from 'react';
import { 
  Book, 
  Coffee, 
  Play, 
  Edit2, 
  Palette, 
  Clock, 
  FolderOpen, 
  Download, 
  Info, 
  Sun, 
  Moon, 
  Sparkles, 
  RotateCcw, 
  Settings, 
  ChevronDown,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { EXTERNAL_LINKS } from '../constants/links';
import type { AppThemeMode, AppThemeCategory } from '../hooks/useAppShellTheme';
import { DEFAULT_SPLIT_RATIO } from '../hooks/useScriptPreferences';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface AppHeaderProps {
  mode: 'playback' | 'edit';
  setMode: (mode: 'playback' | 'edit') => void;
  currentTime?: number;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
  onOpenGuide?: () => void;
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
  onSetThemeMode?: (mode: AppThemeMode) => void;
  isViewCustomized?: boolean;
  onResetView?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  mode,
  setMode,
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
  onSetThemeMode,
  isViewCustomized = false,
  onResetView,
}) => {
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);

  useEscapeKey(() => {
    setIsFileDropdownOpen(false);
    setIsSettingsDropdownOpen(false);
  }, isFileDropdownOpen || isSettingsDropdownOpen);

  return (
    <header
      className={cn(
        UI_TOKENS.layout.appHeader,
        mode === 'playback' && "hidden lg:flex"
      )}
    >
      {/* Left Wing: Logo & File Dropdown Menu */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
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

        {/* File Dropdown Menu (Desktop only) */}
        <div className="hidden lg:block relative pl-1">
          <button
            id="app-file-menu-button"
            onClick={() => {
              setIsFileDropdownOpen(prev => !prev);
              setIsSettingsDropdownOpen(false);
            }}
            className={cn(
              UI_TOKENS.button.filePill,
              isFileDropdownOpen && UI_TOKENS.button.filePillActive
            )}
            title="Project & File Actions"
            aria-expanded={isFileDropdownOpen}
          >
            <span>File</span>
            <ChevronDown size={11} className={cn("text-text-faint transition-transform duration-200", isFileDropdownOpen && "rotate-180")} />
          </button>

          {isFileDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsFileDropdownOpen(false)} 
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-surface rounded-2xl shadow-2xl border border-border-main overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 text-text-main divide-y divide-border-subtle">
                <div className="p-1.5 space-y-0.5">
                  {onOpenGuide && (
                    <button
                      onClick={() => {
                        setIsFileDropdownOpen(false);
                        onOpenGuide();
                      }}
                      className={UI_TOKENS.dropdown.item}
                    >
                      <div className="flex items-center gap-2">
                        <Plus size={14} className="text-text-muted" />
                        <span>New / Starter Guide</span>
                      </div>
                    </button>
                  )}

                  <label
                    title="Open Project JSON"
                    className={cn("cursor-pointer", UI_TOKENS.dropdown.item)}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className="text-text-muted" />
                      <span>Open Project...</span>
                    </div>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => {
                        setIsFileDropdownOpen(false);
                        importJson(e);
                      }} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    onClick={() => {
                      setIsFileDropdownOpen(false);
                      exportJson();
                    }}
                    title="Save Project JSON"
                    className={UI_TOKENS.dropdown.item}
                  >
                    <div className="flex items-center gap-2">
                      <Download size={14} className="text-text-muted" />
                      <span>Save Project</span>
                    </div>
                  </button>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setIsFileDropdownOpen(false);
                      setIsLibraryOpen(true);
                    }}
                    title="Explore Screenplay Library"
                    className={UI_TOKENS.dropdown.item}
                  >
                    <div className="flex items-center gap-2">
                      <Book size={14} className="text-amber-500" />
                      <span>Browse Library...</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center Stage: Segmented Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="flex p-0.5 lg:p-1 rounded-xl ring-1 ring-border-main bg-surface-muted/90 shadow-2xs">
          <button
            onClick={() => setMode('playback')}
            className={cn(
              "px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              mode === 'playback'
                ? "bg-surface text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/20"
                : "text-text-muted hover:text-text-main"
            )}
            title="Playback Mode — Screenplay sync & video player"
          >
            <Play size={12} className={mode === 'playback' ? "fill-current" : ""} />
            <span className="hidden sm:inline">Playback</span>
          </button>
          <button
            onClick={() => setMode('edit')}
            className={cn(
              "px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              mode === 'edit'
                ? "bg-surface text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/20"
                : "text-text-muted hover:text-text-main"
            )}
            title="Edit Mode — Cue authoring & timeline timing"
          >
            <Edit2 size={12} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </div>

      {/* Right Wing: Library, Support, Settings & Info */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
        {/* Standalone Prominent Library Button */}
        <button
          onClick={() => setIsLibraryOpen(true)}
          title="Explore Screenplay Library & Examples"
          className={cn(
            UI_TOKENS.button.libraryPop,
            isLibraryOpen && UI_TOKENS.button.libraryPopActive
          )}
        >
          <Book size={14} className="text-amber-500 shrink-0" />
          <span className="hidden sm:inline font-black uppercase tracking-wider text-[10px]">Library</span>
        </button>

        {/* Support on Ko-fi */}
        <a
          href={EXTERNAL_LINKS.kofi}
          target="_blank"
          rel="noopener noreferrer"
          title="Support SceneFlow on Ko-fi"
          className={UI_TOKENS.button.supportPill}
        >
          <Coffee size={12} />
          <span className="hidden md:inline">Support</span>
        </a>

        {/* Settings Dropdown Menu */}
        <div className="relative">
          <button
            id="app-settings-menu-button"
            onClick={() => {
              setIsSettingsDropdownOpen(prev => !prev);
              setIsFileDropdownOpen(false);
            }}
            className={cn(
              UI_TOKENS.button.settingsPill,
              isSettingsDropdownOpen && UI_TOKENS.button.settingsPillActive
            )}
            title="Studio Preferences & Tools"
            aria-expanded={isSettingsDropdownOpen}
          >
            <Settings size={14} className={cn("text-text-muted transition-transform duration-300", isSettingsDropdownOpen && "rotate-45")} />
            <span className="hidden sm:inline">Settings</span>
            <ChevronDown size={11} className={cn("text-text-faint transition-transform duration-200", isSettingsDropdownOpen && "rotate-180")} />
            {isViewCustomized && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Layout is customized" />
            )}
          </button>

          {isSettingsDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsSettingsDropdownOpen(false)} 
              />
              <div className={UI_TOKENS.dropdown.menuSettings}>
                {/* Header */}
                <div className={UI_TOKENS.dropdown.header}>
                  <p className={UI_TOKENS.dropdown.headerText}>Studio Preferences</p>
                </div>

                {/* Quick 4-Theme Selector */}
                <div className="p-2.5 bg-surface-subtle">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-faint">App Theme</span>
                    <span className="text-[9px] font-mono font-bold text-text-muted capitalize">
                      {themeMode === 'auto' ? `Auto (${effectiveThemeCategory})` : themeMode}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-surface-muted rounded-xl border border-border-main">
                    {(['auto', 'light', 'warm', 'dark'] as AppThemeMode[]).map((modeKey) => {
                      const isSelected = themeMode === modeKey;
                      return (
                        <button
                          key={modeKey}
                          onClick={() => {
                            if (onSetThemeMode) {
                              onSetThemeMode(modeKey);
                            } else if (onCycleThemeMode) {
                              onCycleThemeMode();
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center py-1.5 rounded-lg text-[9px] font-bold capitalize transition-all active:scale-95",
                            isSelected
                              ? "bg-surface text-text-main shadow-xs ring-1 ring-border-main"
                              : "text-text-muted hover:text-text-main hover:bg-surface/50"
                          )}
                          title={`Set theme mode to ${modeKey}`}
                        >
                          {modeKey === 'auto' ? (
                            <Sparkles size={13} className="text-amber-500 mb-0.5" />
                          ) : modeKey === 'dark' ? (
                            <Moon size={13} className="text-blue-400 mb-0.5" />
                          ) : modeKey === 'warm' ? (
                            <Coffee size={13} className="text-amber-600 mb-0.5" />
                          ) : (
                            <Sun size={13} className="text-amber-500 mb-0.5" />
                          )}
                          <span>{modeKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Menu Items with shortcut/feature hints */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    id="script-theme-header-button"
                    onClick={() => {
                      setIsSettingsDropdownOpen(false);
                      setIsColorModalOpen(true);
                    }}
                    className={UI_TOKENS.dropdown.item}
                    title="Script Paper & Color Theme Presets"
                  >
                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-text-muted" />
                      <span>Script Paper & Colors</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsDropdownOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className={UI_TOKENS.dropdown.item}
                    title="Timing, Auto-Scroll Speed & Durations"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-text-muted" />
                      <span>Timing & Durations</span>
                    </div>
                  </button>

                  {onResetView && (
                    <button
                      onClick={() => {
                        setIsSettingsDropdownOpen(false);
                        onResetView();
                      }}
                      className={UI_TOKENS.dropdown.item}
                      title={
                        isViewCustomized
                          ? "Reset View Layout & Video Size (Customized)"
                          : "Reset View Layout & Video Size to Default"
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw size={14} className={cn("text-text-muted", isViewCustomized && "text-blue-500")} />
                        <span>Reset View Layout</span>
                      </div>
                      {isViewCustomized && (
                        <span className="text-[8px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
                          Custom
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Standalone Info Button */}
        <button
          onClick={() => setIsInfoModalOpen(true)}
          className={cn(
            UI_TOKENS.button.headerIconButton,
            isInfoModalOpen && UI_TOKENS.button.headerIconButtonActive
          )}
          title="About SceneFlow, Article & Documentation"
          aria-label="About SceneFlow, Article & Documentation"
        >
          <Info size={16} />
        </button>
      </div>
    </header>
  );
};
