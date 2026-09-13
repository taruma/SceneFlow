import React, { memo, useRef, useCallback } from 'react';
import { 
  FileText, 
  Target, 
  ChevronDown, 
  Check, 
  Book, 
  Coffee, 
  Palette 
} from 'lucide-react';
import { COLORS } from '../constants/script';
import { EXTERNAL_LINKS } from '../constants/links';
import { getCueColorForTheme, type CuePaletteProfile } from '../lib/scriptStyles';
import { useClickOutside, useEscapeKey } from '../hooks';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface ScriptHeaderControlsProps {
  mode: 'playback' | 'edit';
  isAutoScrollEnabled: boolean;
  setIsAutoScrollEnabled: (enabled: boolean) => void;
  isAutoScrollDropdownOpen: boolean;
  setIsAutoScrollDropdownOpen: (open: boolean) => void;
  autoScrollTargets: string[];
  setAutoScrollTargets: React.Dispatch<React.SetStateAction<string[]>>;
  setIsLibraryOpen: (open: boolean) => void;
  setIsColorModalOpen?: (open: boolean) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
}

export const ScriptHeaderControls: React.FC<ScriptHeaderControlsProps> = memo(({
  mode,
  isAutoScrollEnabled,
  setIsAutoScrollEnabled,
  isAutoScrollDropdownOpen,
  setIsAutoScrollDropdownOpen,
  autoScrollTargets,
  setAutoScrollTargets,
  setIsLibraryOpen,
  setIsColorModalOpen,
  scriptThemeId,
  cuePaletteProfile = 'standard',
}) => {
  const autoScrollContainerRef = useRef<HTMLDivElement>(null);

  const closeAutoScroll = useCallback(() => setIsAutoScrollDropdownOpen(false), [setIsAutoScrollDropdownOpen]);

  useClickOutside(autoScrollContainerRef, closeAutoScroll, isAutoScrollDropdownOpen);
  useEscapeKey(closeAutoScroll, isAutoScrollDropdownOpen);

  return (
    <div className={mode === 'playback' ? UI_TOKENS.layout.scriptHeaderPlayback : UI_TOKENS.layout.scriptHeader}>
      <div className="flex items-center gap-2 lg:gap-3">
        <FileText size={16} className="text-text-faint shrink-0" />
        <span className={cn("hidden sm:inline", UI_TOKENS.layout.sectionTitleMini)}>Script Preview</span>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {mode === 'playback' && (
          <div className="flex items-center gap-2">
            <div ref={autoScrollContainerRef} className="relative flex items-stretch">
              <button
                onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-l-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border-y border-l shadow-sm",
                  isAutoScrollEnabled 
                    ? "bg-blue-500 text-white border-blue-600 hover:bg-blue-600" 
                    : "bg-surface text-text-faint border-border-main hover:text-text-main hover:bg-surface-hover"
                )}
                title={isAutoScrollEnabled ? "Auto-scroll enabled" : "Auto-scroll disabled"}
              >
                <Target size={10} className={cn(isAutoScrollEnabled && "animate-pulse")} />
                <span className="hidden sm:inline">Auto-Scroll</span>
              </button>
              <button
                onClick={() => setIsAutoScrollDropdownOpen(!isAutoScrollDropdownOpen)}
                className={cn(
                  "flex items-center justify-center px-1.5 py-1 rounded-r-lg border-y border-r border-l shadow-sm transition-all active:scale-95",
                  isAutoScrollEnabled 
                    ? "bg-blue-500 text-white border-blue-600 border-l-blue-600/50 hover:bg-blue-600" 
                    : "bg-surface text-text-faint border-border-main border-l-border-subtle hover:text-text-main hover:bg-surface-hover"
                )}
                title="Auto-scroll settings"
                aria-label="Auto-scroll settings"
              >
                <ChevronDown size={10} className={cn("transition-transform duration-200", isAutoScrollDropdownOpen && "rotate-180")} />
              </button>

              {isAutoScrollDropdownOpen && (
                <div className={UI_TOKENS.dropdown.menu}>
                  <div className={UI_TOKENS.dropdown.header}>
                    <p className={UI_TOKENS.dropdown.headerText}>Focus Mode</p>
                    <button 
                      onClick={() => {
                        const allTypes = COLORS.map(c => c.type);
                        if (autoScrollTargets.length === allTypes.length) {
                          setAutoScrollTargets(['dialogue']);
                        } else {
                          setAutoScrollTargets(allTypes);
                        }
                      }}
                      className="text-[8px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-tighter"
                    >
                      {autoScrollTargets.length === COLORS.length ? 'Reset' : 'Select All'}
                    </button>
                  </div>
                  <div className="p-1 max-h-64 overflow-y-auto">
                    {COLORS.map(color => {
                      const isSelected = autoScrollTargets.includes(color.type);
                      const themed = getCueColorForTheme(color.type, scriptThemeId as any, cuePaletteProfile);
                      return (
                        <button
                          key={color.type}
                          onClick={() => {
                            setAutoScrollTargets(prev => {
                              if (isSelected) {
                                if (prev.length === 1) return prev;
                                return prev.filter(t => t !== color.type);
                              } else {
                                return [...prev, color.type];
                              }
                            });
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors",
                            isSelected ? "bg-btn-primary-bg text-btn-primary-text" : "text-text-body hover:bg-surface-subtle"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0 shadow-2xs",
                                isSelected && "ring-1 ring-white/40"
                              )}
                              style={{ backgroundColor: themed.dotColor }}
                            />
                            {color.type}
                          </div>
                          {isSelected && <Check size={10} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {setIsColorModalOpen && (
              <button 
                onClick={() => setIsColorModalOpen(true)}
                className="lg:hidden flex items-center justify-center p-1.5 bg-surface-muted hover:bg-surface-hover rounded-lg text-text-body hover:text-text-main transition-colors active:scale-95 shadow-xs"
                title="Screenplay & App Theme Settings"
                aria-label="Screenplay & App Theme Settings"
              >
                <Palette size={12} />
              </button>
            )}
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="lg:hidden flex items-center gap-1 px-2 py-1 bg-surface-muted hover:bg-surface-hover rounded text-[10px] font-bold text-text-body transition-colors active:scale-95"
            >
              <Book size={10} /> Library
            </button>
            <a 
              href={EXTERNAL_LINKS.kofi}
              target="_blank"
              rel="noopener noreferrer"
              title="Support on Ko-fi"
              className={cn("lg:hidden", UI_TOKENS.button.supportPill)}
            >
              <Coffee size={10} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

ScriptHeaderControls.displayName = 'ScriptHeaderControls';
