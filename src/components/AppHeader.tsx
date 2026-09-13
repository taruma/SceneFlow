import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  Book, 
  Coffee, 
  Info 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { EXTERNAL_LINKS } from '../constants/links';
import type { AppThemeMode, AppThemeCategory } from '../hooks/useAppShellTheme';
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
  onCycleThemeMode?: () => void;
  onSetThemeMode?: (mode: AppThemeMode) => void;
  isViewCustomized?: boolean;
  onResetView?: () => void;
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
  onCycleThemeMode,
  onSetThemeMode,
  isViewCustomized = false,
  onResetView,
}) => {
  const [activeMenu, setActiveMenu] = useState<HeaderMenuId | null>(null);

  const closeMenu = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const toggleMenu = useCallback((menuId: HeaderMenuId) => {
    setActiveMenu(prev => (prev === menuId ? null : menuId));
  }, []);

  // Auto-close open dropdown menus whenever a modal opens
  useEffect(() => {
    if (isColorModalOpen || isSettingsOpen || isInfoModalOpen || isLibraryOpen) {
      setActiveMenu(null);
    }
  }, [isColorModalOpen, isSettingsOpen, isInfoModalOpen, isLibraryOpen]);

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

        {/* Support on Ko-fi */}
        <a
          href={EXTERNAL_LINKS.kofi}
          target="_blank"
          rel="noopener noreferrer"
          title="Support SceneFlow on Ko-fi"
          className={UI_TOKENS.button.supportPill}
        >
          <Coffee size={12} />
          <span>Support</span>
        </a>

        {/* Studio Preferences Dropdown Menu */}
        <SettingsMenuDropdown
          isOpen={activeMenu === 'settings'}
          onToggle={() => toggleMenu('settings')}
          onClose={closeMenu}
          themeMode={themeMode}
          effectiveThemeCategory={effectiveThemeCategory}
          onSetThemeMode={onSetThemeMode}
          onCycleThemeMode={onCycleThemeMode}
          onOpenColors={() => setIsColorModalOpen(true)}
          onOpenTiming={() => setIsSettingsOpen(true)}
          isViewCustomized={isViewCustomized}
          onResetView={onResetView}
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
