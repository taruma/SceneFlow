import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Book, 
  Coffee, 
  Info 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { EXTERNAL_LINKS } from '../constants/links';
import { XIcon } from './common';
import type { AppThemeMode, AppThemeCategory } from '../hooks/useAppShellTheme';
import type { ScriptWidthPresetId, ScrollFocusPresetId } from '../types/script';
import { 
  FileMenuDropdown, 
  SettingsMenuDropdown, 
  ModeSegmentedControl 
} from './header';

export type HeaderMenuId = 'file' | 'settings';

export interface AppHeaderProps {
  mode: 'playback' | 'edit';
  setMode: (mode: 'playback' | 'edit') => void;
  isLibraryOpen: boolean;
  setIsLibraryOpen: (open: boolean) => void;
  onNewProject?: () => void;
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
  onSetThemeMode?: (mode: AppThemeMode) => void;
  isViewCustomized?: boolean;
  onResetView?: () => void;
  onOpenShortcuts?: () => void;
  scriptWidthPreset?: ScriptWidthPresetId;
  setScriptWidthPreset?: (preset: ScriptWidthPresetId) => void;
  scrollFocusPreset?: ScrollFocusPresetId;
  applyScrollFocus?: (preset: ScrollFocusPresetId) => void;
  isPreferencesCustomized?: boolean;
  onResetAll?: () => void;
  onOpenRawCuesModal?: () => void;
  onOpenRawScriptModal?: () => void;
  isCuesModalOpen?: boolean;
  isScriptModalOpen?: boolean;
  activeMenu?: HeaderMenuId | null;
  onToggleMenu?: (menuId: HeaderMenuId) => void;
  onCloseMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = memo(({
  mode,
  setMode,
  isLibraryOpen,
  setIsLibraryOpen,
  onNewProject,
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
  onSetThemeMode,
  isViewCustomized = false,
  onResetView,
  onOpenShortcuts,
  scriptWidthPreset,
  setScriptWidthPreset,
  scrollFocusPreset,
  applyScrollFocus,
  isPreferencesCustomized = false,
  onResetAll,
  onOpenRawCuesModal,
  onOpenRawScriptModal,
  isCuesModalOpen = false,
  isScriptModalOpen = false,
  activeMenu: activeMenuProp,
  onToggleMenu: onToggleMenuProp,
  onCloseMenu: onCloseMenuProp,
}) => {
  const [internalActiveMenu, setInternalActiveMenu] = useState<HeaderMenuId | null>(null);
  const activeMenu = activeMenuProp !== undefined ? activeMenuProp : internalActiveMenu;

  const closeMenu = useCallback(() => {
    if (onCloseMenuProp) onCloseMenuProp();
    setInternalActiveMenu(null);
  }, [onCloseMenuProp]);

  const toggleMenu = useCallback((menuId: HeaderMenuId) => {
    if (onToggleMenuProp) {
      onToggleMenuProp(menuId);
    } else {
      setInternalActiveMenu(prev => (prev === menuId ? null : menuId));
    }
  }, [onToggleMenuProp]);

  // Auto-close open dropdown menus whenever a modal opens
  useEffect(() => {
    if (isColorModalOpen || isSettingsOpen || isInfoModalOpen || isLibraryOpen || isCuesModalOpen || isScriptModalOpen) {
      closeMenu();
    }
  }, [isColorModalOpen, isSettingsOpen, isInfoModalOpen, isLibraryOpen, isCuesModalOpen, isScriptModalOpen, closeMenu]);

  return (
    <header className={cn(UI_TOKENS.layout.appHeader, "hidden lg:flex")}>
      {/* Left Wing: Brand Logo & Tiered File Menu */}
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

        {/* File Dropdown Menu */}
        <FileMenuDropdown
          isOpen={activeMenu === 'file'}
          onToggle={() => toggleMenu('file')}
          onClose={closeMenu}
          onImportJson={importJson}
          onExportJson={exportJson}
          onNewProject={onNewProject}
          onOpenGuide={onOpenGuide}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onOpenRawCuesModal={onOpenRawCuesModal}
          onOpenRawScriptModal={onOpenRawScriptModal}
        />
      </div>

      {/* Center Stage: Segmented Workflow Mode Switcher */}
      <ModeSegmentedControl
        mode={mode}
        setMode={setMode}
      />

      {/* Right Wing: Library Gateway, Support, Studio Preferences & Info */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
        {/* Standalone Library Button */}
        <button
          onClick={() => setIsLibraryOpen(true)}
          title="Explore Screenplay Library & Examples"
          className={cn(
            UI_TOKENS.button.libraryPop,
            isLibraryOpen && UI_TOKENS.button.libraryPopActive
          )}
        >
          <Book size={14} className="text-amber-500 shrink-0" />
          <span className="font-black uppercase tracking-wider text-[10px]">Library</span>
        </button>

        {/* Updates on X */}
        <a
          href={EXTERNAL_LINKS.x}
          target="_blank"
          rel="noopener noreferrer"
          title="Follow @tarumainfo on X for updates"
          className={UI_TOKENS.button.xPill}
        >
          <XIcon size={11} className="shrink-0" />
          <span>Updates</span>
        </a>

        {/* Tip on Ko-fi */}
        <a
          href={EXTERNAL_LINKS.kofi}
          target="_blank"
          rel="noopener noreferrer"
          title="Tip on Ko-fi"
          className={UI_TOKENS.button.supportPill}
        >
          <Coffee size={12} />
          <span>Tip</span>
        </a>

        {/* Studio Preferences Dropdown Menu */}
        <SettingsMenuDropdown
          isOpen={activeMenu === 'settings'}
          onToggle={() => toggleMenu('settings')}
          onClose={closeMenu}
          themeMode={themeMode}
          effectiveThemeCategory={effectiveThemeCategory}
          onSetThemeMode={onSetThemeMode}
          onOpenColors={() => setIsColorModalOpen(true)}
          onOpenTiming={() => setIsSettingsOpen(true)}
          isViewCustomized={isViewCustomized}
          onResetView={onResetView}
          onOpenShortcuts={onOpenShortcuts}
          scriptWidthPreset={scriptWidthPreset}
          setScriptWidthPreset={setScriptWidthPreset}
          scrollFocusPreset={scrollFocusPreset}
          applyScrollFocus={applyScrollFocus}
          isPreferencesCustomized={isPreferencesCustomized}
          onResetAll={onResetAll}
        />

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
});

AppHeader.displayName = 'AppHeader';
