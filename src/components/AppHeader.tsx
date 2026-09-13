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
  ChevronDown
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
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  useEscapeKey(() => setIsSettingsDropdownOpen(false), isSettingsDropdownOpen);

  return (
    <header
      className={cn(
        UI_TOKENS.layout.appHeader,
        mode === 'playback' && "hidden lg:flex"
      )}
    >
      {/* Left Wing: Logo & Compact Document Actions */}
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

        {/* Subtle Document Pair: Open & Save (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1 pl-2 border-l border-border-main">
          <label
            title="Open Project JSON (Ctrl+O)"
            className="p-1.5 rounded-lg border border-border-main hover:bg-surface-hover text-text-muted hover:text-text-main transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            <FolderOpen size={14} />
            <input type="file" accept=".json" onChange={importJson} className="hidden" />
          </label>
          <button
            onClick={exportJson}
            title="Save Project JSON (Ctrl+S)"
            className="p-1.5 rounded-lg border border-border-main hover:bg-surface-hover text-text-muted hover:text-text-main transition-all active:scale-95 shadow-2xs"
          >
            <Download size={14} />
          </button>
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
            title="Playback Mode — Screenplay sync & video player (Space to Play/Pause)"
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
            "flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-xs",
            isLibraryOpen
              ? "bg-btn-primary-bg text-btn-primary-text border-btn-primary-bg shadow-md"
              : "bg-surface hover:bg-surface-hover text-text-main border-border-main hover:border-border-hover"
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
            onClick={() => setIsSettingsDropdownOpen(prev => !prev)}
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
                  >
                    <div className="flex items-center gap-2">
                      <Palette size={14} className="text-text-muted" />
                      <span>Script Paper & Colors</span>
                    </div>
                    <span className="text-[9px] font-mono text-text-faint bg-surface-muted px-1.5 py-0.5 rounded">
                      Presets
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsDropdownOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className={UI_TOKENS.dropdown.item}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-text-muted" />
                      <span>Timing & Durations</span>
                    </div>
                    <span className="text-[9px] font-mono text-text-faint bg-surface-muted px-1.5 py-0.5 rounded">
                      Overlaps
                    </span>
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
                          : `Reset View Layout & Video Size (Default ${DEFAULT_SPLIT_RATIO}:${100 - DEFAULT_SPLIT_RATIO})`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw size={14} className={cn("text-text-muted", isViewCustomized && "text-blue-500")} />
                        <span>Reset View Layout</span>
                      </div>
                      {isViewCustomized ? (
                        <span className="text-[8px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
                          Custom
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-text-faint bg-surface-muted px-1.5 py-0.5 rounded">
                          {DEFAULT_SPLIT_RATIO}:{100 - DEFAULT_SPLIT_RATIO}
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
          title="About SceneFlow, Article & Keyboard Shortcuts (?)"
          aria-label="About SceneFlow, Article & Keyboard Shortcuts"
        >
          <Info size={16} />
        </button>
      </div>
    </header>
  );
};
