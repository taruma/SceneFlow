import React, { useRef, memo } from 'react';
import { 
  Settings, 
  ChevronDown, 
  Sparkles, 
  Moon, 
  Coffee, 
  Sun, 
  Palette, 
  Clock, 
  RotateCcw 
} from 'lucide-react';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { cn } from '../../lib/utils';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import type { AppThemeMode, AppThemeCategory } from '../../hooks/useAppShellTheme';
import { SCRIPT_WIDTH_PRESETS, SCROLL_FOCUS_PRESETS } from '../../constants/script';
import type { ScriptWidthPresetId, ScrollFocusPresetId } from '../../types/script';

export interface SettingsMenuDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  themeMode?: AppThemeMode;
  effectiveThemeCategory?: AppThemeCategory;
  onSetThemeMode?: (mode: AppThemeMode) => void;
  onCycleThemeMode?: () => void;
  onOpenColors: () => void;
  onOpenTiming: () => void;
  isViewCustomized?: boolean;
  onResetView?: () => void;
  scriptWidthPreset?: ScriptWidthPresetId;
  setScriptWidthPreset?: (preset: ScriptWidthPresetId) => void;
  scrollFocusPreset?: ScrollFocusPresetId;
  applyScrollFocus?: (preset: ScrollFocusPresetId) => void;
}

export const SettingsMenuDropdown: React.FC<SettingsMenuDropdownProps> = memo(({
  isOpen,
  onToggle,
  onClose,
  themeMode = 'auto',
  effectiveThemeCategory = 'light',
  onSetThemeMode,
  onCycleThemeMode,
  onOpenColors,
  onOpenTiming,
  isViewCustomized = false,
  onResetView,
  scriptWidthPreset = 'standard',
  setScriptWidthPreset,
  scrollFocusPreset = 'top',
  applyScrollFocus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const currentWidth = SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset) || SCRIPT_WIDTH_PRESETS[2];
  const currentFocus = SCROLL_FOCUS_PRESETS.find(p => p.id === scrollFocusPreset) || SCROLL_FOCUS_PRESETS[0];

  useClickOutside(containerRef, onClose, isOpen);
  useEscapeKey(onClose, isOpen);

  return (
    <div ref={containerRef} className="relative">
      <button
        id="app-settings-menu-button"
        onClick={onToggle}
        className={cn(
          UI_TOKENS.button.settingsPill,
          isOpen && UI_TOKENS.button.settingsPillActive
        )}
        title="Studio Preferences & Tools"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Settings 
          size={14} 
          className={cn(
            "text-text-muted transition-transform duration-300", 
            isOpen && "rotate-45"
          )} 
        />
        <span className="hidden sm:inline">Settings</span>
        <ChevronDown 
          size={11} 
          className={cn(
            "text-text-faint transition-transform duration-200", 
            isOpen && "rotate-180"
          )} 
        />
        {isViewCustomized && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" title="Layout is customized" />
        )}
      </button>

      {isOpen && (
        <div 
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="app-settings-menu-button"
          className={UI_TOKENS.dropdown.menuSettings}
        >
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
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface-muted rounded-xl border border-border-main" role="radiogroup" aria-label="App Theme">
              {(['auto', 'light', 'warm', 'dark'] as AppThemeMode[]).map((modeKey) => {
                const isSelected = themeMode === modeKey;
                return (
                  <button
                    key={modeKey}
                    role="radio"
                    aria-checked={isSelected}
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

          {/* Reading Canvas & Viewport */}
          <div className="p-2.5 space-y-2.5 bg-surface-subtle">
            {/* Script Width */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-faint">Script Width</span>
                <span className="text-[9px] font-mono font-bold text-text-muted">
                  {currentWidth.label} ({currentWidth.desc.split('•')[0].trim()})
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-1 bg-surface-muted rounded-xl border border-border-main" role="radiogroup" aria-label="Script Width">
                {SCRIPT_WIDTH_PRESETS.map((preset, index) => {
                  const isSelected = scriptWidthPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setScriptWidthPreset?.(preset.id)}
                      className={cn(
                        "flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg text-[8px] font-mono font-bold tracking-tight uppercase transition-all active:scale-95 group",
                        isSelected
                          ? "bg-surface text-text-main shadow-xs ring-1 ring-border-main"
                          : "text-text-muted hover:text-text-main hover:bg-surface/50"
                      )}
                      title={`${preset.label}: ${preset.desc}`}
                      aria-label={`${preset.label} width preset`}
                    >
                      <div className="w-full flex items-center justify-center h-2 mb-0.5">
                        <div 
                          className={cn(
                            "h-1 rounded-full transition-all",
                            isSelected ? "bg-blue-500" : "bg-border-main group-hover:bg-text-muted"
                          )}
                          style={{ width: `${32 + index * 15}%` }}
                        />
                      </div>
                      <span>{preset.id === 'full' ? 'Full' : preset.label.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll Focus Line */}
            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-text-faint">Focus Line</span>
                <span className="text-[9px] font-mono font-bold text-text-muted">
                  {currentFocus.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-surface-muted rounded-xl border border-border-main" role="radiogroup" aria-label="Scroll Focus Line">
                {SCROLL_FOCUS_PRESETS.map((preset) => {
                  const isSelected = scrollFocusPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => applyScrollFocus?.(preset.id)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-1.5 rounded-lg text-[9px] font-bold capitalize transition-all active:scale-95 group",
                        isSelected
                          ? "bg-surface text-text-main shadow-xs ring-1 ring-border-main"
                          : "text-text-muted hover:text-text-main hover:bg-surface/50"
                      )}
                      title={`${preset.label} - ${preset.desc}`}
                      aria-label={`${preset.label} scroll focus`}
                    >
                      <div className={cn(
                        "w-3.5 h-4.5 rounded border flex flex-col justify-between p-0.5 transition-all shrink-0",
                        isSelected ? "border-text-muted bg-surface-muted" : "border-border-main bg-surface/50 group-hover:border-text-muted"
                      )}>
                        <div 
                          className={cn(
                            "w-full h-0.5 rounded-2xs transition-all",
                            preset.id === 'top' ? (isSelected ? "bg-amber-500" : "bg-blue-500") : "opacity-0"
                          )} 
                        />
                        <div 
                          className={cn(
                            "w-full h-0.5 rounded-2xs transition-all",
                            preset.id === 'center' ? (isSelected ? "bg-amber-500" : "bg-blue-500") : "opacity-0"
                          )} 
                        />
                        <div 
                          className={cn(
                            "w-full h-0.5 rounded-2xs transition-all",
                            preset.id === 'bottom' ? (isSelected ? "bg-amber-500" : "bg-blue-500") : "opacity-0"
                          )} 
                        />
                      </div>
                      <span>{preset.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Menu Items with shortcut & feature hints */}
          <div className="p-1.5 space-y-0.5">
            <button
              id="script-theme-header-button"
              role="menuitem"
              onClick={() => {
                onClose();
                onOpenColors();
              }}
              className={UI_TOKENS.dropdown.item}
              title="Script Paper & Color Theme Presets (Shift+C)"
            >
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-text-muted" />
                <span>Script Paper & Colors</span>
              </div>
              <kbd className={UI_TOKENS.badge.shortcut}>Shift+C</kbd>
            </button>

            <button
              role="menuitem"
              onClick={() => {
                onClose();
                onOpenTiming();
              }}
              className={UI_TOKENS.dropdown.item}
              title="Timing, Auto-Scroll Speed & Durations (Shift+T)"
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-text-muted" />
                <span>Timing & Durations</span>
              </div>
              <kbd className={UI_TOKENS.badge.shortcut}>Shift+T</kbd>
            </button>

            {onResetView && (
              <button
                role="menuitem"
                onClick={() => {
                  onClose();
                  onResetView();
                }}
                className={UI_TOKENS.dropdown.item}
                title={
                  isViewCustomized
                    ? "Reset View Layout & Video Size (Customized, Shift+R)"
                    : "Reset View Layout & Video Size to Default (Shift+R)"
                }
              >
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className={cn("text-text-muted", isViewCustomized && "text-blue-500")} />
                  <span>Reset View Layout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isViewCustomized && (
                    <span className="text-[8px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
                      Custom
                    </span>
                  )}
                  <kbd className={UI_TOKENS.badge.shortcut}>Shift+R</kbd>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

SettingsMenuDropdown.displayName = 'SettingsMenuDropdown';
