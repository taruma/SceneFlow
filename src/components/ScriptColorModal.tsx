import React, { useState } from 'react';
import { Sparkles, Check, RotateCcw, X, Moon, Sun, Coffee, Eye, Layers, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import { SCRIPT_THEMES, getCueColorForTheme, CUE_THEME_COLORS, type ScriptThemeId, type ScriptTheme } from '../lib/scriptStyles';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface ScriptColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ScriptThemeId;
  onSelectTheme: (themeId: ScriptThemeId) => void;
}

const PREVIEW_CUE_CHIPS = [
  { type: 'dialogue', name: 'Dialogue' },
  { type: 'action', name: 'Action' },
  { type: 'camera', name: 'Camera' },
  { type: 'shot', name: 'Shot' },
  { type: 'audio', name: 'Audio' },
];

export const ScriptColorModal: React.FC<ScriptColorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  useEscapeKey(onClose, isOpen);

  const [activeTab, setActiveTab] = useState<'presets' | 'inspector'>('presets');

  if (!isOpen) return null;

  const currentTheme = SCRIPT_THEMES[currentThemeId] || SCRIPT_THEMES['studio-light'];
  const themeList: ScriptTheme[] = Object.values(SCRIPT_THEMES);

  return (
    <div 
      className={UI_TOKENS.modal.overlayHeavy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >

      <div 
        id="script-color-modal"
        className={UI_TOKENS.modal.containerXl}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-border-subtle flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-btn-primary-bg text-btn-primary-text flex items-center justify-center shadow-xs">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="font-bold text-text-main text-base flex items-center gap-2">
                Screenplay Visual Themes
                <span className="text-[10px] font-mono font-normal uppercase tracking-wider bg-surface-muted text-text-muted px-2 py-0.5 rounded-full">
                  6 Presets
                </span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Switch screenplay canvas textures, typography contrast, and adaptive cue highlight palettes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentThemeId !== 'studio-light' && (
              <button
                onClick={() => onSelectTheme('studio-light')}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-main bg-surface hover:bg-surface-hover border border-border-main px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
                title="Reset to default Studio Crisp theme"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle px-4 sm:px-6 bg-surface shrink-0">
          <button
            onClick={() => setActiveTab('presets')}
            className={cn(
              "flex items-center gap-2 py-3 px-1 text-xs font-bold border-b-2 transition-all mr-6",
              activeTab === 'presets'
                ? "border-text-main text-text-main"
                : "border-transparent text-text-faint hover:text-text-main"
            )}
          >
            <Sparkles size={14} /> Theme Presets
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={cn(
              "flex items-center gap-2 py-3 px-1 text-xs font-bold border-b-2 transition-all",
              activeTab === 'inspector'
                ? "border-text-main text-text-main"
                : "border-transparent text-text-faint hover:text-text-main"
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
                          ? UI_TOKENS.swatch.cardSelected + " bg-surface"
                          : "border-border-main hover:border-border-main hover:shadow-xs bg-surface"
                      )}
                    >
                      {/* Top row: Name & Category badge */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-text-main flex items-center gap-1.5">
                          {theme.name}
                        </span>
                        <span className={cn(
                          "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold flex items-center gap-1",
                          theme.category === 'dark' ? "bg-surface-dark text-text-main" :
                          theme.category === 'warm' ? "bg-amber-100 text-amber-800" : "bg-surface-muted text-text-muted"
                        )}>
                          {theme.category === 'dark' && <Moon size={8} />}
                          {theme.category === 'warm' && <Coffee size={8} />}
                          {theme.category === 'light' && <Sun size={8} />}
                          {theme.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed mb-3 min-h-[30px]">
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
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-btn-primary-bg text-btn-primary-text flex items-center justify-center shadow-xs">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Theme Summary footer note */}
              <div className="mt-4 p-3 bg-surface-subtle rounded-xl border border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-text-faint shrink-0" />
                  <span>Currently Applied: <strong>{currentTheme.name}</strong></span>
                </div>
                <span className="text-[10px] font-mono text-text-faint uppercase tracking-wider">
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
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-1.5">
                  <Layers size={12} /> Paper & Structure Elements
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Paper Canvas Surface</p>
                      <p className="text-[10px] text-text-faint font-mono">{currentTheme.paperBg}</p>
                    </div>
                    <div className={cn("w-8 h-8 rounded-lg border shadow-xs", currentTheme.paperBg, currentTheme.paperBorder)} />
                  </div>

                  <div className="p-3 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Scene Heading Stripe</p>
                      <p className="text-[10px] text-text-faint font-mono">{currentTheme.headingBg}</p>
                    </div>
                    <div className={cn("w-14 h-8 rounded-lg border flex items-center justify-center text-[8px] font-bold", currentTheme.headingBg, currentTheme.headingBorder, currentTheme.textColor)}>
                      EXT.
                    </div>
                  </div>

                  <div className="p-3 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Script Line Typography</p>
                      <p className="text-[10px] text-text-faint font-mono">{currentTheme.textColor}</p>
                    </div>
                    <div className={cn("px-2.5 py-1 rounded-lg border font-serif text-xs font-bold", currentTheme.paperBg, currentTheme.textColor)}>
                      Dialogue Text
                    </div>
                  </div>

                  <div className="p-3 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Staging Block Badges</p>
                      <p className="text-[10px] text-text-faint font-mono">Pill badge overlay</p>
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

                  <div className="p-3 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">BRIEF Macro-States</p>
                      <p className="text-[10px] text-text-faint font-mono">Dashed card border</p>
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
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-1.5">
                    <Sparkles size={12} /> Sync Cue Highlight Spectrum (8 Categories)
                  </h4>
                  <span className={cn(
                    "text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    currentTheme.category === 'warm' ? "bg-amber-50 text-amber-800 border-amber-200" :
                    currentTheme.category === 'dark' ? "bg-surface-dark text-text-main border-border-main" :
                    "bg-surface-muted text-text-muted border-border-main"
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
                      <div key={c.type} className="p-2.5 bg-surface-subtle border border-border-main rounded-xl flex items-center gap-2.5">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: themed.dotColor }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-text-body uppercase tracking-tight block truncate">
                            {c.name}
                          </span>
                          <span className="text-[8px] font-mono text-text-faint block truncate">
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
        <div className="p-3.5 sm:p-4 border-t border-border-subtle bg-surface-subtle flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-text-faint">
            Selected: <strong className="text-text-body">{currentTheme.name}</strong> ({currentTheme.category})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-btn-primary-bg hover:bg-btn-primary-hover text-btn-primary-text rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
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
