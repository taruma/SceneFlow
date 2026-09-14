import React, { memo, useRef, useCallback } from 'react';
import { 
  FileText, 
  Target, 
  ChevronDown, 
  Check, 
  Book, 
  Coffee, 
  Palette,
  Edit2,
  PanelRight
} from 'lucide-react';
import { COLORS } from '../constants/script';
import { EXTERNAL_LINKS } from '../constants/links';
import { getCueColorForTheme, type CuePaletteProfile } from '../lib/scriptStyles';
import { useClickOutside, useEscapeKey } from '../hooks';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface ScriptHeaderControlsProps {
  mode: 'playback' | 'edit';
  isAutoScrollEnabled?: boolean;
  setIsAutoScrollEnabled?: (enabled: boolean) => void;
  isAutoScrollDropdownOpen?: boolean;
  setIsAutoScrollDropdownOpen?: (open: boolean) => void;
  autoScrollTargets?: string[];
  setAutoScrollTargets?: React.Dispatch<React.SetStateAction<string[]>>;
  setIsLibraryOpen?: (open: boolean) => void;
  setIsColorModalOpen?: (open: boolean) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
  lineCount?: number;
  onOpenRawScriptModal?: () => void;
  activeCueStatus?: 'drafting' | 'editing' | 'idle';
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
}

export const ScriptHeaderControls: React.FC<ScriptHeaderControlsProps> = memo(({
  mode,
  isAutoScrollEnabled = false,
  setIsAutoScrollEnabled = (_: boolean) => {},
  isAutoScrollDropdownOpen = false,
  setIsAutoScrollDropdownOpen = (_: boolean) => {},
  autoScrollTargets = [],
  setAutoScrollTargets = (_: any) => {},
  setIsLibraryOpen = (_: boolean) => {},
  setIsColorModalOpen,
  scriptThemeId,
  cuePaletteProfile = 'standard',
  lineCount,
  onOpenRawScriptModal,
  activeCueStatus,
  isInspectorOpen = true,
  onToggleInspector,
}) => {
  const autoScrollContainerRef = useRef<HTMLDivElement>(null);

  const closeAutoScroll = useCallback(() => setIsAutoScrollDropdownOpen(false), [setIsAutoScrollDropdownOpen]);

  useClickOutside(autoScrollContainerRef, closeAutoScroll, isAutoScrollDropdownOpen);
  useEscapeKey(closeAutoScroll, isAutoScrollDropdownOpen);

  return (
    <div className={cn(
      mode === 'playback' ? UI_TOKENS.layout.scriptHeaderPlayback : UI_TOKENS.layout.scriptHeader,
      "panel-container-query @container min-w-0"
    )}>
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0 min-w-0">
        <FileText size={16} className="text-text-faint shrink-0" />
        <span className={cn(UI_TOKENS.layout.sectionTitleMini, "script-header-title truncate")}>
          {mode === 'playback' ? 'Script Preview' : 'Script Editor'}
        </span>

        {/* Active Cue Status & Line Count Badges (In Edit Mode) */}
        {mode === 'edit' && (
          <div className="flex items-center gap-1.5 shrink-0">
            {activeCueStatus === 'editing' && (
              <span 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs shrink-0 select-none"
                title="Active Cue Status: Editing Cue"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="cue-status-text">Editing Cue</span>
              </span>
            )}
            {activeCueStatus === 'drafting' && (
              <span 
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs shrink-0 select-none"
                title="Active Cue Status: Drafting Cue"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="cue-status-text">Drafting Cue</span>
              </span>
            )}
            {lineCount !== undefined && (
              <span className={cn(UI_TOKENS.badge.counterFaint, "script-line-count shrink-0 select-none")}>
                {lineCount} lines
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {mode === 'playback' ? (
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
                <span className="script-btn-label">Auto-Scroll</span>
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
                <div className={cn(UI_TOKENS.dropdown.menu, "left-0 lg:left-auto lg:right-0")}>
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
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenRawScriptModal && (
              <button 
                type="button"
                onClick={onOpenRawScriptModal}
                title="Edit source screenplay text"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-muted hover:bg-surface-hover border border-border-main text-text-muted hover:text-text-main rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-2xs select-none shrink-0"
              >
                <Edit2 size={10} className="shrink-0" />
                <span className="script-btn-label">Edit Source</span>
              </button>
            )}
            {onToggleInspector && (
              <button
                type="button"
                onClick={onToggleInspector}
                title={isInspectorOpen ? "Collapse Inspector" : "Expand Inspector"}
                aria-label={isInspectorOpen ? "Collapse Inspector" : "Expand Inspector"}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border shadow-2xs select-none shrink-0",
                  isInspectorOpen
                    ? "bg-surface border-border-main text-text-main shadow-xs"
                    : "bg-surface-muted hover:bg-surface-hover border-border-main text-text-muted hover:text-text-main"
                )}
              >
                <PanelRight size={11} className={cn("shrink-0", isInspectorOpen && "text-blue-500")} />
                <span className="script-btn-label">Inspector</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ScriptHeaderControls.displayName = 'ScriptHeaderControls';
