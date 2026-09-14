import React, { memo, useMemo } from 'react';
import { SlidersHorizontal, PanelRightClose, Sparkles, Clock, CheckCircle2, Bookmark } from 'lucide-react';
import { Cue } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { cn } from '../../lib/utils';
import { CueEditorForm } from './CueEditorForm';
import { useOptionalCueEditorContext } from './CueEditorContext';

export interface EditRightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  ratio?: number;
  style?: React.CSSProperties;
  cues?: Cue[];
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
  className?: string;
}

export const EditRightPanel: React.FC<EditRightPanelProps> = memo(({
  isOpen,
  onClose,
  width,
  ratio,
  style,
  cues = [],
  scriptThemeId = 'studio-light',
  cuePaletteProfile = 'standard',
  className,
}) => {
  const context = useOptionalCueEditorContext();
  const selection = context?.selection;
  const newCue = context?.newCue;
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);

  const panelStyle = useMemo(() => {
    if (style) return style;
    if (typeof ratio === 'number') return { width: `${ratio}%` };
    if (typeof width === 'number') return { width: `${width}px` };
    return undefined;
  }, [style, ratio, width]);

  // Group cues by type for the idle studio overview
  const cueTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cue of cues) {
      const t = cue.type || 'dialogue';
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    return counts;
  }, [cues]);

  if (!isOpen) {
    return null;
  }

  const isEditing = Boolean(newCue?.id);
  const isDrafting = Boolean(selection && !newCue?.id);

  return (
    <aside 
      aria-label="Cue Inspector"
      style={panelStyle}
      className={cn(
        "bg-surface border-l border-border-main flex flex-col shrink-0 h-full overflow-hidden transition-[border-color,background-color] duration-300 z-20",
        !panelStyle && "w-[340px] lg:w-[360px]",
        className
      )}
    >
      {/* Inspector Panel Header (matches script header height: 48px) */}
      <div className="h-12 border-b border-border-main flex items-center justify-between px-4 bg-surface shrink-0 z-20 shadow-xs text-text-main">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-text-faint shrink-0" />
          <span className={UI_TOKENS.layout.sectionTitleMini}>
            Cue Inspector
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Status Badge */}
          {isEditing && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Editing
            </span>
          )}
          {isDrafting && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Drafting
            </span>
          )}
          {!selection && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider text-text-faint bg-surface-muted border border-border-subtle shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-text-faint/40" />
              Idle
            </span>
          )}

          {/* Collapse Inspector Toggle Button */}
          <button
            type="button"
            onClick={onClose}
            title="Collapse Inspector Panel"
            aria-label="Collapse Inspector Panel"
            className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors active:scale-95"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      </div>

      {/* Inspector Body Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {selection ? (
          <CueEditorForm />
        ) : (
          /* Studio Idle Overview & Cheat Sheet */
          <div className="p-5 space-y-6 flex-1 flex flex-col justify-between text-text-main">
            <div className="space-y-5">
              {/* Guidance Box */}
              <div className="p-4 bg-surface-subtle border border-border-subtle rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-blue-500">
                  <Sparkles size={16} />
                  <h4 className="text-xs font-black uppercase tracking-wider">Inspector Ready</h4>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Highlight text in the screenplay to draft a new sync cue, or select any cue card in the left panel to inspect and edit timings.
                </p>
              </div>

              {/* Script Cues Summary */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-faint flex items-center gap-1.5">
                    <Bookmark size={11} /> Cues Summary
                  </p>
                  <span className={UI_TOKENS.badge.counter}>
                    {cues.length} Total
                  </span>
                </div>

                {cues.length === 0 ? (
                  <p className="text-xs text-text-faint italic py-2">
                    No sync cues created yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {COLORS.map((color) => {
                      const count = cueTypeCounts.get(color.type) || 0;
                      if (count === 0) return null;
                      const themed = resolveCueColor(color.type);
                      return (
                        <div 
                          key={color.type}
                          className="flex items-center justify-between p-2 rounded-xl bg-surface-muted/50 border border-border-subtle text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <div 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: `rgb(${themed.rgb})` }} 
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-body truncate">
                              {color.type}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-black text-text-faint shrink-0 ml-1">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Workflow & Shortcuts Quick-Guide */}
            <div className="p-3.5 bg-surface-muted/30 rounded-xl border border-border-subtle space-y-2 text-[10px]">
              <p className="font-black uppercase tracking-widest text-text-faint flex items-center gap-1.5">
                <Clock size={11} /> Quick Tips
              </p>
              <ul className="space-y-1 text-text-muted">
                <li className="flex items-center justify-between">
                  <span>Capture Time</span>
                  <span className="font-mono text-text-faint font-bold">Clock icon</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Save / Update</span>
                  <span className="font-mono text-text-faint font-bold">Ctrl + Enter</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Cancel Draft</span>
                  <span className="font-mono text-text-faint font-bold">Esc</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
});

EditRightPanel.displayName = 'EditRightPanel';
