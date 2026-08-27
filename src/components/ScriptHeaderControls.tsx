import React from 'react';
import { 
  FileText, 
  Target, 
  ChevronDown, 
  Check, 
  Book, 
  Coffee, 
  MoveHorizontal, 
  AlignVerticalJustifyCenter 
} from 'lucide-react';
import { COLORS, SCRIPT_WIDTH_PRESETS, SCROLL_FOCUS_PRESETS } from '../constants/script';
import { ScriptWidthPresetId, ScrollFocusPresetId } from '../types/script';
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
  scriptWidthPreset: ScriptWidthPresetId;
  setScriptWidthPreset: (preset: ScriptWidthPresetId) => void;
  isWidthDropdownOpen: boolean;
  setIsWidthDropdownOpen: (open: boolean) => void;
  scrollFocusPreset: ScrollFocusPresetId;
  applyScrollFocus: (preset: ScrollFocusPresetId) => void;
  isScrollFocusDropdownOpen: boolean;
  setIsScrollFocusDropdownOpen: (open: boolean) => void;
  currentTime: number;
}

export const ScriptHeaderControls: React.FC<ScriptHeaderControlsProps> = ({
  mode,
  isAutoScrollEnabled,
  setIsAutoScrollEnabled,
  isAutoScrollDropdownOpen,
  setIsAutoScrollDropdownOpen,
  autoScrollTargets,
  setAutoScrollTargets,
  setIsLibraryOpen,
  scriptWidthPreset,
  setScriptWidthPreset,
  isWidthDropdownOpen,
  setIsWidthDropdownOpen,
  scrollFocusPreset,
  applyScrollFocus,
  isScrollFocusDropdownOpen,
  setIsScrollFocusDropdownOpen,
  currentTime,
}) => {
  return (
    <div className={mode === 'playback' ? UI_TOKENS.layout.scriptHeaderPlayback : UI_TOKENS.layout.scriptHeader}>
      <div className="flex items-center gap-2 lg:gap-3">
        <FileText size={16} className="text-stone-400 shrink-0" />
        <span className={cn("hidden sm:inline", UI_TOKENS.layout.sectionTitleMini)}>Script Preview</span>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {mode === 'playback' && (
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <button
                onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-l-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border-y border-l shadow-sm",
                  isAutoScrollEnabled ? "bg-blue-500 text-white border-blue-600" : "bg-white text-stone-400 border-stone-200 hover:text-stone-600"
                )}
                title={isAutoScrollEnabled ? "Auto-scroll enabled" : "Auto-scroll disabled"}
              >
                <Target size={10} className={cn(isAutoScrollEnabled && "animate-pulse")} />
                <span className="hidden sm:inline">Auto-Scroll</span>
              </button>
              <button
                onClick={() => setIsAutoScrollDropdownOpen(!isAutoScrollDropdownOpen)}
                className={cn(
                  "px-1 py-1 rounded-r-lg border-y border-r shadow-sm transition-all active:scale-95",
                  isAutoScrollEnabled ? "bg-blue-600 text-white border-blue-700" : "bg-white text-stone-400 border-stone-200 hover:text-stone-600"
                )}
              >
                <ChevronDown size={10} className={cn("transition-transform duration-200", isAutoScrollDropdownOpen && "rotate-180")} />
              </button>

              {isAutoScrollDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsAutoScrollDropdownOpen(false)} 
                  />
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
                              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-colors capitalize",
                              isSelected ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className={cn("w-1.5 h-1.5 rounded-full", color.class)} />
                              {color.type}
                            </div>
                            {isSelected && <Check size={10} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="lg:hidden flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[10px] font-bold text-stone-700 transition-colors"
            >
              <Book size={10} /> Library
            </button>
            <a 
              href="https://ko-fi.com/tarumainfo"
              target="_blank"
              rel="noopener noreferrer"
              title="Support on Ko-fi"
              className={cn("lg:hidden", UI_TOKENS.button.supportPill)}
            >
              <Coffee size={10} />
            </a>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "hidden sm:block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
            mode === 'edit' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
          )}>
            {mode === 'edit' ? 'Edit' : 'Playback'}
          </div>

          {/* Page Width Preset Selector (Playback mode on Desktop only) */}
          {mode === 'playback' && (
            <div className="relative hidden lg:flex items-center">
              <button
                id="script-preview-width-control"
                onClick={() => setIsWidthDropdownOpen(!isWidthDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-tight transition-all active:scale-95 shadow-sm",
                  isWidthDropdownOpen 
                    ? "bg-stone-900 text-white border-stone-900" 
                    : "bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-stone-300"
                )}
                title={`Script Width: ${SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.label || 'Standard'}`}
              >
                <MoveHorizontal size={11} className="text-stone-400 shrink-0" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500 font-semibold">
                  {SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.label}
                </span>
                <ChevronDown size={10} className={cn("text-stone-400 transition-transform duration-200", isWidthDropdownOpen && "rotate-180")} />
              </button>

              {isWidthDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsWidthDropdownOpen(false)} 
                  />
                  <div className={UI_TOKENS.dropdown.menuWide}>
                    <div className={UI_TOKENS.dropdown.header}>
                      <p className={UI_TOKENS.dropdown.headerText}>Script Width</p>
                      <span className="text-[8px] font-mono text-stone-400 font-medium">5 Presets</span>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {SCRIPT_WIDTH_PRESETS.map((preset, index) => {
                        const isSelected = scriptWidthPreset === preset.id;
                        const isDefault = preset.id === 'standard';
                        return (
                          <button
                            key={preset.id}
                            id={`script-width-preset-${preset.id}`}
                            onClick={() => {
                              setScriptWidthPreset(preset.id);
                              if (typeof localStorage !== 'undefined') {
                                localStorage.setItem('sceneflow_script_width_preset', preset.id);
                              }
                              setIsWidthDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors group",
                              isSelected 
                                ? "bg-stone-900 text-white" 
                                : "text-stone-700 hover:bg-stone-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 flex items-center justify-center">
                                <div 
                                  className={cn(
                                    "h-1.5 rounded-full transition-all",
                                    isSelected ? "bg-white" : "bg-stone-300 group-hover:bg-stone-500"
                                  )}
                                  style={{ width: `${30 + index * 16}%` }}
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold leading-none">{preset.label}</span>
                                  {isDefault && (
                                    <span className={cn(
                                      "text-[8px] px-1 py-0.2 rounded font-medium",
                                      isSelected ? "bg-stone-800 text-stone-300" : "bg-stone-200 text-stone-600"
                                    )}>
                                      Default
                                    </span>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[9px] font-mono leading-tight mt-0.5",
                                  isSelected ? "text-stone-300" : "text-stone-400"
                                )}>
                                  {preset.desc}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check size={12} className="shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Scroll Focus Line Selector (Playback mode on Desktop only) */}
          {mode === 'playback' && (
            <div className="relative hidden lg:flex items-center">
              <button
                id="script-preview-scroll-focus-control"
                onClick={() => setIsScrollFocusDropdownOpen(!isScrollFocusDropdownOpen)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-tight transition-all active:scale-95 shadow-sm",
                  isScrollFocusDropdownOpen 
                    ? "bg-stone-900 text-white border-stone-900" 
                    : "bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-stone-300"
                )}
                title={`Scroll Focus Position: ${SCROLL_FOCUS_PRESETS.find(p => p.id === scrollFocusPreset)?.label || 'Top (35%)'}`}
              >
                <AlignVerticalJustifyCenter size={11} className="text-stone-400 shrink-0" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500 font-semibold">
                  {SCROLL_FOCUS_PRESETS.find(p => p.id === scrollFocusPreset)?.shortLabel}
                </span>
                <ChevronDown size={10} className={cn("text-stone-400 transition-transform duration-200", isScrollFocusDropdownOpen && "rotate-180")} />
              </button>

              {isScrollFocusDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsScrollFocusDropdownOpen(false)} 
                  />
                  <div className={UI_TOKENS.dropdown.menuWide}>
                    <div className={UI_TOKENS.dropdown.header}>
                      <p className={UI_TOKENS.dropdown.headerText}>Focus Line</p>
                      <span className="text-[8px] font-mono text-stone-400 font-medium">Viewport Focus</span>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {SCROLL_FOCUS_PRESETS.map((preset) => {
                        const isSelected = scrollFocusPreset === preset.id;
                        const isDefault = preset.id === 'top';
                        return (
                          <button
                            key={preset.id}
                            id={`script-scroll-focus-${preset.id}`}
                            onClick={() => applyScrollFocus(preset.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors group",
                              isSelected 
                                ? "bg-stone-900 text-white" 
                                : "text-stone-700 hover:bg-stone-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-4 h-6 rounded border flex flex-col justify-between p-0.5 transition-all shrink-0",
                                isSelected ? "border-stone-700 bg-stone-800" : "border-stone-200 bg-stone-50 group-hover:border-stone-300"
                              )}>
                                <div 
                                  className={cn(
                                    "w-full h-1 rounded-sm transition-all",
                                    preset.id === 'top' ? (isSelected ? "bg-amber-400" : "bg-blue-500") : "opacity-0"
                                  )} 
                                />
                                <div 
                                  className={cn(
                                    "w-full h-1 rounded-sm transition-all",
                                    preset.id === 'center' ? (isSelected ? "bg-amber-400" : "bg-blue-500") : "opacity-0"
                                  )} 
                                />
                                <div 
                                  className={cn(
                                    "w-full h-1 rounded-sm transition-all",
                                    preset.id === 'bottom' ? (isSelected ? "bg-amber-400" : "bg-blue-500") : "opacity-0"
                                  )} 
                                />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold leading-none">{preset.label}</span>
                                  {isDefault && (
                                    <span className={cn(
                                      "text-[8px] px-1 py-0.2 rounded font-medium",
                                      isSelected ? "bg-stone-800 text-stone-300" : "bg-stone-200 text-stone-600"
                                    )}>
                                      Default
                                    </span>
                                  )}
                                </div>
                                <span className={cn(
                                  "text-[9px] font-mono leading-tight mt-0.5",
                                  isSelected ? "text-stone-300" : "text-stone-400"
                                )}>
                                  {preset.desc}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check size={12} className="shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-1 px-2 py-1 bg-stone-900 rounded-lg shadow-inner">
          <span className="text-[8px] font-black text-stone-500 uppercase">Time</span>
          <span className="text-xs font-mono font-bold text-white w-10 text-right">{currentTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
