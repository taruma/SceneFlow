import React, { useEffect, useState } from 'react';
import { X, Check, Palette, RotateCcw, Sparkles, Sun, Moon, Coffee, Eye, Layers, Type } from 'lucide-react';
import { SCRIPT_THEMES, getCueColorForTheme, CUE_THEME_COLORS, type ScriptThemeId, type ScriptTheme } from '../lib/scriptStyles';
import { cn } from '../lib/utils';

interface ScriptColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ScriptThemeId;
  onSelectTheme: (themeId: ScriptThemeId) => void;
  cueTypes?: { type: string; class: string; rgb: string }[];
}

const PREVIEW_CUE_CHIPS = [
  { name: 'Dialogue', type: 'dialogue' },
  { name: 'Action', type: 'action' },
  { name: 'Camera', type: 'camera' },
  { name: 'VFX', type: 'vfx' },
];

export const ScriptColorModal: React.FC<ScriptColorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  cueTypes = []
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'inspector'>('presets');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme = SCRIPT_THEMES[currentThemeId] || SCRIPT_THEMES['studio-light'];
  const themeList = Object.values(SCRIPT_THEMES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />
      
      <div 
        id="script-color-modal"
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-sm">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                Script Paper & Color Presets
              </h2>
              <p className="text-xs text-stone-500">
                Customize the reading surface, borders, headers, and highlights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentThemeId !== 'studio-light' && (
              <button
                onClick={() => onSelectTheme('studio-light')}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
                title="Reset to default Studio Crisp theme"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100 px-4 sm:px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('presets')}
            className={cn(
              "flex items-center gap-2 py-3 px-1 text-xs font-bold border-b-2 transition-all mr-6",
              activeTab === 'presets'
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-600"
            )}
          >
            <Sparkles size={14} /> Theme Presets
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={cn(
              "flex items-center gap-2 py-3 px-1 text-xs font-bold border-b-2 transition-all",
              activeTab === 'inspector'
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-600"
            )}
          >
            <Layers size={14} /> Element Inspector
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'presets' ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {themeList.map((theme) => {
                  const isSelected = theme.id === currentThemeId;
                  return (
                    <button
                      key={theme.id}
                      id={`theme-preset-card-${theme.id}`}
                      onClick={() => onSelectTheme(theme.id)}
                      className={cn(
                        "relative flex flex-col text-left rounded-xl p-3.5 transition-all duration-200 border-2 group",
                        isSelected
                          ? "border-stone-900 shadow-md ring-2 ring-stone-900/10 bg-white"
                          : "border-stone-200/80 hover:border-stone-300 hover:shadow-xs bg-white"
                      )}
                    >
                      {/* Top row: Name & Category badge */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          {theme.name}
                        </span>
                        <span className={cn(
                          "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold flex items-center gap-1",
                          theme.category === 'dark' ? "bg-stone-800 text-stone-200" :
                          theme.category === 'warm' ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"
                        )}>
                          {theme.category === 'dark' && <Moon size={8} />}
                          {theme.category === 'warm' && <Coffee size={8} />}
                          {theme.category === 'light' && <Sun size={8} />}
                          {theme.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-3 min-h-[30px]">
                        {theme.description}
                      </p>

                      {/* Mini Live Preview Paper */}
                      <div className={cn(
                        "rounded-lg p-2.5 text-[10px] font-serif border overflow-hidden mt-auto transition-all",
                        theme.paperBg,
                        theme.paperBorder,
                        theme.textColor
                      )}>
                        {/* Heading banner preview */}
                        <div className={cn(
                          "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 mb-1.5 rounded-xs",
                          theme.headingBg,
                          theme.headingBorder
                        )}>
                          EXT. SCENE 01 - DAY
                        </div>

                        {/* Script Text Line Preview */}
                        <div className="space-y-0.5 font-mono text-[9px] mb-2 leading-tight">
                          <p className="font-bold uppercase tracking-tight text-[8px]">CHARACTER</p>
                          <p className="italic text-[8px] opacity-80">"Synchronized screenplay..."</p>
                        </div>

                        {/* Staging Pill & Cue Highlights Preview */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/5 dark:border-white/5">
                          <div className={cn(
                            "px-1 py-0.2 rounded-full border text-[7px] font-bold uppercase tracking-tighter",
                            theme.stagingBadgeBg,
                            theme.stagingBadgeBorder,
                            theme.stagingBadgeText
                          )}>
                            STAGING
                          </div>
                          
                          <div className="flex items-center gap-0.5">
                            {PREVIEW_CUE_CHIPS.map(chip => {
                              const themed = getCueColorForTheme(chip.type, theme.id);
                              return (
                                <span 
                                  key={chip.name}
                                  className="w-2 h-2 rounded-full shadow-2xs shrink-0" 
                                  style={{ backgroundColor: `rgba(${themed.rgb}, 0.85)` }}
                                  title={`${chip.name} (${theme.category})`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Selected check icon badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Theme Summary footer note */}
              <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-stone-400 shrink-0" />
                  <span>Currently Applied: <strong>{currentTheme.name}</strong></span>
                </div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  Script Paper Only
                </span>
              </div>
            </div>
          ) : (
            /* Element Inspector Tab */
            <div className="space-y-5">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                <InfoIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  These visual tokens compose the active <strong>{currentTheme.name}</strong> theme across the screenplay surface, preserving typographical rhythm and cue clarity.
                </p>
              </div>

              {/* Surface & Structural Tokens */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-1.5">
                  <Layers size={12} /> Paper & Structure Elements
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Paper Canvas Surface</p>
                      <p className="text-[10px] text-stone-400 font-mono">{currentTheme.paperBg}</p>
                    </div>
                    <div className={cn("w-8 h-8 rounded-lg border shadow-xs", currentTheme.paperBg, currentTheme.paperBorder)} />
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Scene Heading Stripe</p>
                      <p className="text-[10px] text-stone-400 font-mono">{currentTheme.headingBg}</p>
                    </div>
                    <div className={cn("w-14 h-8 rounded-lg border flex items-center justify-center text-[8px] font-bold", currentTheme.headingBg, currentTheme.headingBorder, currentTheme.textColor)}>
                      EXT.
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Script Line Typography</p>
                      <p className="text-[10px] text-stone-400 font-mono">{currentTheme.textColor}</p>
                    </div>
                    <div className={cn("px-2.5 py-1 rounded-lg border font-serif text-xs font-bold", currentTheme.paperBg, currentTheme.textColor)}>
                      Dialogue Text
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-800">Staging Block Badges</p>
                      <p className="text-[10px] text-stone-400 font-mono">Pill badge overlay</p>
                    </div>
                    <div className={cn(
                      "px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider",
                      currentTheme.stagingBadgeBg,
                      currentTheme.stagingBadgeBorder,
                      currentTheme.stagingBadgeText
                    )}>
                      STAGING PILL
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-800">BRIEF Macro-States</p>
                      <p className="text-[10px] text-stone-400 font-mono">Dashed card border</p>
                    </div>
                    <div className={cn(
                      "px-2.5 py-1 rounded-md border border-dashed text-[9px] font-mono flex items-center gap-1",
                      currentTheme.briefBg,
                      currentTheme.briefBorder,
                      currentTheme.textColor
                    )}>
                      <b>[CAM]</b>
                      <span>SHOT 01</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cue Highlights Spectrum */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-1.5">
                    <Sparkles size={12} /> Sync Cue Highlight Spectrum (8 Categories)
                  </h4>
                  <span className={cn(
                    "text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    currentTheme.category === 'warm' ? "bg-amber-50 text-amber-800 border-amber-200" :
                    currentTheme.category === 'dark' ? "bg-stone-800 text-stone-200 border-stone-700" :
                    "bg-stone-100 text-stone-600 border-stone-200"
                  )}>
                    {currentTheme.category === 'warm' ? 'Warm Antique Gouache Palette' :
                     currentTheme.category === 'dark' ? 'Luminous Dark Glow Palette' :
                     'Studio Crisp Pastel Palette'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CUE_THEME_COLORS.map(c => {
                    const themed = getCueColorForTheme(c.type, currentThemeId);
                    return (
                      <div key={c.type} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2.5">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: themed.dotColor }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-stone-700 uppercase tracking-tight block truncate">
                            {c.name}
                          </span>
                          <span className="text-[8px] font-mono text-stone-400 block truncate">
                            rgb({themed.rgb})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-stone-400">
            Selected: <strong className="text-stone-700">{currentTheme.name}</strong> ({currentTheme.category})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
