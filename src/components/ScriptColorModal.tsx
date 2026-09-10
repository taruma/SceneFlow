import React, { useState } from 'react';
import { Sparkles, Check, RotateCcw, X, Moon, Sun, Coffee, Eye, Layers, Palette, Video } from 'lucide-react';
import { cn } from '../lib/utils';
import { SCRIPT_THEMES, getCueColorForTheme, CUE_THEME_COLORS, type ScriptThemeId, type ScriptTheme, type CuePaletteProfile } from '../lib/scriptStyles';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { AppThemeMode, AppThemeCategory } from '../hooks/useAppShellTheme';

interface ScriptColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ScriptThemeId;
  onSelectTheme: (themeId: ScriptThemeId) => void;
  themeMode?: AppThemeMode;
  setThemeMode?: (mode: AppThemeMode) => void;
  effectiveThemeCategory?: AppThemeCategory;
  pureBlackMode?: boolean;
  setPureBlackMode?: (enabled: boolean) => void;
  cuePaletteProfile?: CuePaletteProfile;
  onSelectPaletteProfile?: (profile: CuePaletteProfile) => void;
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
  themeMode = 'auto',
  setThemeMode,
  effectiveThemeCategory = 'light',
  pureBlackMode = false,
  setPureBlackMode,
  cuePaletteProfile = 'standard',
  onSelectPaletteProfile,
}) => {
  useEscapeKey(onClose, isOpen);

  const [activeTab, setActiveTab] = useState<'presets' | 'inspector'>('presets');

  if (!isOpen) return null;

  const currentTheme = SCRIPT_THEMES[currentThemeId] || SCRIPT_THEMES['studio-light'];
  const themeList: ScriptTheme[] = Object.values(SCRIPT_THEMES);

  return (
    <div 
      className={cn(UI_TOKENS.modal.overlayHeavy, "hidden lg:flex")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >

      <div 
        id="script-color-modal"
        className={UI_TOKENS.modal.containerXl}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-border-subtle flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-btn-primary-bg text-btn-primary-text flex items-center justify-center shadow-xs shrink-0">
              <Palette size={16} />
            </div>
            <div>
              <h3 className="font-bold text-text-main text-sm flex items-center gap-2">
                Screenplay Visual Themes
                <span className="text-[9px] font-mono font-normal uppercase tracking-wider bg-surface-muted text-text-muted px-1.5 py-0.2 rounded-full">
                  6 Presets
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                Switch screenplay canvas textures, typography contrast, and adaptive cue highlight palettes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentThemeId !== 'studio-light' && (
              <button
                onClick={() => onSelectTheme('studio-light')}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-main bg-surface hover:bg-surface-hover border border-border-main px-2 py-1 rounded-lg transition-colors shadow-xs"
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
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle px-4 sm:px-6 bg-surface shrink-0">
          <button
            onClick={() => setActiveTab('presets')}
            className={cn(
              "flex items-center gap-2 py-2 px-1 text-xs font-bold border-b-2 transition-all mr-6",
              activeTab === 'presets'
                ? "border-text-main text-text-main"
                : "border-transparent text-text-faint hover:text-text-main"
            )}
          >
            <Sparkles size={13} /> Theme Presets
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={cn(
              "flex items-center gap-2 py-2 px-1 text-xs font-bold border-b-2 transition-all",
              activeTab === 'inspector'
                ? "border-text-main text-text-main"
                : "border-transparent text-text-faint hover:text-text-main"
            )}
          >
            <Layers size={13} /> Element Inspector
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {activeTab === 'presets' ? (
            <div className="space-y-2.5">
              {/* Top Controls: Accessibility Profile & Pure Black Canvas Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Column 1: Cue Palette Accessibility Profile */}
                <div className="bg-surface-subtle border border-border-main rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Eye size={13} className="text-btn-primary-bg shrink-0" />
                      <span className="text-xs font-bold text-text-main truncate">Cue Palette</span>
                      <span className={cn(
                        "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-full font-semibold border shrink-0",
                        cuePaletteProfile === 'protanopia' 
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                          : "bg-surface-muted text-text-muted border-border-main"
                      )}>
                        {cuePaletteProfile === 'protanopia' ? 'Protan Safe' : 'Standard'}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">
                      {cuePaletteProfile === 'protanopia' 
                        ? 'Wine/Burgundy high contrast for red-green CVD' 
                        : 'Standard cinema spectrum across themes'}
                    </p>
                  </div>

                  {onSelectPaletteProfile && (
                    <div className="inline-flex p-0.5 bg-surface border border-border-main rounded-lg shrink-0 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onSelectPaletteProfile('standard')}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10.5px] font-bold transition-all",
                          cuePaletteProfile === 'standard'
                            ? "bg-btn-primary-bg text-btn-primary-text shadow-xs"
                            : "text-text-muted hover:text-text-main"
                        )}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectPaletteProfile('protanopia')}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1",
                          cuePaletteProfile === 'protanopia'
                            ? "bg-btn-primary-bg text-btn-primary-text shadow-xs"
                            : "text-text-muted hover:text-text-main"
                        )}
                        title="Protan & Deutan Safe"
                      >
                        <Eye size={11} />
                        <span>Protan</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Column 2: Pure Black Canvas (Video Overlay Mode) Toggle */}
                <div className="bg-surface-subtle border border-border-main rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Video size={13} className={cn("shrink-0", pureBlackMode ? "text-text-main" : "text-text-muted")} />
                      <span className="text-xs font-bold text-text-main">Pure Black Canvas</span>
                      <span className="text-[8px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-neutral-900 text-neutral-200 border border-neutral-700 shrink-0">
                        Video Overlay
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate">
                      {pureBlackMode && currentTheme.category !== 'dark' 
                        ? 'Applies on dark themes (switch to Midnight or OLED)'
                        : 'Absolute #000000 canvas for Screen/Lighten recording'}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      role="switch"
                      id="pure-black-mode-toggle"
                      aria-checked={pureBlackMode}
                      onClick={() => setPureBlackMode?.(!pureBlackMode)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        pureBlackMode ? "bg-black ring-1 ring-neutral-600" : "bg-surface-muted"
                      )}
                    >
                      <span className="sr-only">Toggle Pure Black Video Overlay Mode</span>
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          pureBlackMode ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Presets Grid - 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themeList.map((theme) => {
                  const isSelected = theme.id === currentThemeId;
                  return (
                    <button
                      key={theme.id}
                      id={`theme-preset-card-${theme.id}`}
                      onClick={() => onSelectTheme(theme.id)}
                      className={cn(
                        "relative flex flex-col text-left rounded-xl p-2.5 sm:p-3 transition-all duration-200 border-2 group",
                        isSelected
                          ? UI_TOKENS.swatch.cardSelected + " bg-surface"
                          : "border-border-main hover:border-border-main hover:shadow-xs bg-surface"
                      )}
                    >
                      {/* Top row: Name & Category badge & Checkmark (in flex flow, NO overlap) */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-text-main truncate">
                          {theme.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={cn(
                            "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold flex items-center gap-1",
                            theme.category === 'dark' ? "bg-stone-800 text-stone-200" :
                            theme.category === 'warm' ? "bg-amber-100 text-amber-800" : "bg-surface-muted text-text-muted"
                          )}>
                            {theme.category === 'dark' && <Moon size={8} />}
                            {theme.category === 'warm' && <Coffee size={8} />}
                            {theme.category === 'light' && <Sun size={8} />}
                            {theme.category}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-btn-primary-bg text-btn-primary-text flex items-center justify-center shadow-xs">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[10.5px] text-text-muted line-clamp-1 leading-snug mb-1.5">
                        {theme.description}
                      </p>

                      {/* Mini Live Preview Paper */}
                      <div className={cn(
                        "rounded-lg p-2 text-[9px] font-serif border overflow-hidden mt-auto transition-all",
                        theme.paperBg,
                        theme.paperBorder,
                        theme.textColor
                      )}>
                        {/* Heading banner preview */}
                        <div className={cn(
                          "text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 mb-1 rounded-xs flex items-center justify-between",
                          theme.headingBg,
                          theme.headingBorder
                        )}>
                          <span>EXT. SCENE 01 - DAY</span>
                          <span className="font-mono text-[7px] opacity-60">HEADING</span>
                        </div>

                        {/* Script Text Line Preview */}
                        <div className="font-mono text-[8px] mb-1.5 leading-tight flex items-baseline gap-1.5">
                          <span className="font-bold uppercase tracking-tight text-[7.5px] shrink-0">CHARACTER</span>
                          <span className="italic text-[7.5px] opacity-80 truncate">"Synchronized screenplay..."</span>
                        </div>

                        {/* Staging Pill & Cue Highlights Preview */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-black/5 dark:border-white/5">
                          <div className={cn(
                            "px-1.5 py-0.2 rounded-full border text-[7px] font-bold uppercase tracking-tighter",
                            theme.stagingBadgeBg,
                            theme.stagingBadgeBorder,
                            theme.stagingBadgeText
                          )}>
                            STAGING
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {PREVIEW_CUE_CHIPS.map(chip => {
                              const themed = getCueColorForTheme(chip.type, theme.id, cuePaletteProfile);
                              return (
                                <span 
                                  key={chip.name}
                                  className="w-1.5 h-1.5 rounded-full shadow-2xs shrink-0" 
                                  style={{ backgroundColor: `rgba(${themed.rgb}, 0.85)` }}
                                  title={`${chip.name} (${theme.category})`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Theme Summary footer note */}
              <div className="p-2 bg-surface-subtle rounded-lg border border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Eye size={12} className="text-text-faint shrink-0" />
                  <span>Paper: <strong className="text-text-main">{currentTheme.name}</strong> ({currentTheme.category})</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-faint">
                  <Sparkles size={10} className="text-amber-500 shrink-0" />
                  <span>Shell: <strong className="text-text-body font-semibold uppercase">{themeMode === 'auto' ? `Auto (${effectiveThemeCategory})` : themeMode}</strong></span>
                </div>
              </div>
            </div>
          ) : (
            /* Element Inspector Tab */
            <div className="space-y-3.5">
              {/* Cue Palette Accessibility Profile for Inspector */}
              <div className="bg-surface-subtle border border-border-main rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} className="text-btn-primary-bg shrink-0" />
                    <span className="text-xs font-bold text-text-main">Cue Palette Accessibility Profile</span>
                    <span className={cn(
                      "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded-full font-semibold border shrink-0",
                      cuePaletteProfile === 'protanopia' 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                        : "bg-surface-muted text-text-muted border-border-main"
                    )}>
                      {cuePaletteProfile === 'protanopia' ? 'Protan Safe' : 'Standard'}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {cuePaletteProfile === 'protanopia' 
                      ? 'Wine/Burgundy high contrast for red-green CVD (eliminates collision with Action)' 
                      : 'Standard cinema spectrum calibrated across Studio, Warm Parchment, and Midnight themes'}
                  </p>
                </div>

                {onSelectPaletteProfile && (
                  <div className="inline-flex p-0.5 bg-surface border border-border-main rounded-lg shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onSelectPaletteProfile('standard')}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10.5px] font-bold transition-all",
                        cuePaletteProfile === 'standard'
                          ? "bg-btn-primary-bg text-btn-primary-text shadow-xs"
                          : "text-text-muted hover:text-text-main"
                      )}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectPaletteProfile('protanopia')}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10.5px] font-bold transition-all flex items-center gap-1",
                        cuePaletteProfile === 'protanopia'
                          ? "bg-btn-primary-bg text-btn-primary-text shadow-xs"
                          : "text-text-muted hover:text-text-main"
                      )}
                      title="Protan & Deutan Safe"
                    >
                      <Eye size={11} />
                      <span>Protan</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-900">
                <InfoIcon className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <p className="leading-snug text-[11px]">
                  These visual tokens compose the active <strong>{currentTheme.name}</strong> theme across the screenplay surface, preserving typographical rhythm and cue clarity.
                </p>
              </div>

              {/* Surface & Structural Tokens */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-1.5">
                  <Layers size={11} /> Paper & Structure Elements
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Paper Canvas Surface</p>
                      <p className="text-[10px] text-text-faint font-mono">{currentTheme.paperBg}</p>
                    </div>
                    <div className={cn("w-7 h-7 rounded-lg border shadow-xs", currentTheme.paperBg, currentTheme.paperBorder)} />
                  </div>

                  <div className="p-2.5 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Scene Heading Stripe</p>
                      <p className="text-[10px] text-text-faint font-mono">{currentTheme.headingBg}</p>
                    </div>
                    <div className={cn("w-12 h-7 rounded-lg border flex items-center justify-center text-[7.5px] font-bold", currentTheme.headingBg, currentTheme.headingBorder, currentTheme.textColor)}>
                      EXT.
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Script Line Typography</p>
                      <p className="text-[10px] text-text-faint font-mono">{currentTheme.textColor}</p>
                    </div>
                    <div className={cn("px-2 py-0.5 rounded-lg border font-serif text-[11px] font-bold", currentTheme.paperBg, currentTheme.textColor)}>
                      Dialogue Text
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">Staging Block Badges</p>
                      <p className="text-[10px] text-text-faint font-mono">Pill badge overlay</p>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider",
                      currentTheme.stagingBadgeBg,
                      currentTheme.stagingBadgeBorder,
                      currentTheme.stagingBadgeText
                    )}>
                      STAGING PILL
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-subtle border border-border-main rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-main">BRIEF Macro-States</p>
                      <p className="text-[10px] text-text-faint font-mono">Dashed card border</p>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md border border-dashed text-[8.5px] font-mono flex items-center gap-1",
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
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-1.5">
                    <Sparkles size={11} /> Sync Cue Highlight Spectrum (8 Categories)
                  </h4>
                  <span className={cn(
                    "text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    currentTheme.category === 'warm' ? "bg-amber-50 text-amber-800 border-amber-200" :
                    currentTheme.category === 'dark' ? "bg-stone-800 text-stone-200 border-stone-700" :
                    "bg-surface-muted text-text-muted border-border-main"
                  )}>
                    {currentTheme.category === 'warm' ? 'Warm Antique Gouache Palette' :
                     currentTheme.category === 'dark' ? 'Luminous Dark Glow Palette' :
                     'Studio Crisp Pastel Palette'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CUE_THEME_COLORS.map(c => {
                    const themed = getCueColorForTheme(c.type, currentThemeId, cuePaletteProfile);
                    return (
                      <div key={c.type} className="p-2 bg-surface-subtle border border-border-main rounded-xl flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: themed.dotColor }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9.5px] font-bold text-text-body uppercase tracking-tight block truncate">
                            {c.name}
                          </span>
                          <span className="text-[7.5px] font-mono text-text-faint block truncate">
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
        <div className="px-4 py-2.5 sm:px-6 sm:py-2.5 border-t border-border-subtle bg-surface-subtle flex items-center justify-between shrink-0">
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
