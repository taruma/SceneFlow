import React from 'react';
import { Edit2, Plus, Search, Check, Clock, Trash2 } from 'lucide-react';
import { Cue } from '../types/script';
import { COLORS } from '../constants/script';
import { useScriptTheme } from '../hooks/useScriptTheme';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface CueEditorFormProps {
  newCue: Partial<Cue>;
  setNewCue: React.Dispatch<React.SetStateAction<Partial<Cue>>>;
  selection: { text: string; start: number; end: number } | null;
  setSelection: React.Dispatch<React.SetStateAction<{ text: string; start: number; end: number } | null>>;
  altLocations: Array<{ start: number; end: number; context: string }> | null;
  findAlternativeLocations: () => void;
  cancelEdit: () => void;
  saveCue: () => void;
  deleteCue: (id: string) => void;
  canSave: boolean;
  scriptText: string;
  scriptThemeId: string;
  player: any;
}

export const CueEditorForm: React.FC<CueEditorFormProps> = ({
  newCue,
  setNewCue,
  selection,
  setSelection,
  altLocations,
  findAlternativeLocations,
  cancelEdit,
  saveCue,
  deleteCue,
  canSave,
  scriptText,
  scriptThemeId,
  player,
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any);

  return (
    <div className="bg-surface border-b border-border-main text-text-main p-4 lg:p-6 shrink-0 z-10 shadow-sm animate-in slide-in-from-top duration-500">
      <div className="max-w-xl mx-auto">
        {!selection ? (
          <div className={UI_TOKENS.panel.emptyPlaceholder}>
            <p className="text-xs text-text-faint font-medium italic">Highlight text in the script below to create a sync cue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {newCue.id ? <Edit2 size={16} className="text-amber-500" /> : <Plus size={16} className="text-blue-500" />}
                <h3 className="text-sm font-bold text-text-main">{newCue.id ? 'Edit Sync Cue' : 'New Sync Cue'}</h3>
              </div>
              <button 
                onClick={cancelEdit}
                className="text-[10px] uppercase tracking-widest text-text-faint hover:text-text-main underline"
              >
                Cancel
              </button>
            </div>

            <div className="bg-surface-subtle p-3 rounded-xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-text-faint uppercase tracking-widest">Selected Text</p>
                <button 
                  onClick={findAlternativeLocations}
                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-text-faint hover:text-blue-500 transition-colors"
                >
                  <Search size={10} /> {altLocations ? 'Refresh' : 'Find Alternative'}
                </button>
              </div>
              <textarea
                value={newCue.selectedText || ''}
                onChange={(e) => {
                  const text = e.target.value;
                  setNewCue(prev => ({ ...prev, selectedText: text }));
                  setSelection(s => s ? { ...s, text } : { text, start: newCue.startIndex || 0, end: newCue.endIndex || 0 });
                }}
                className="w-full bg-surface border border-border-main rounded-lg p-2 text-text-main font-mono text-xs min-h-[60px] focus:outline-none focus:ring-1 focus:ring-border-main transition-all duration-200 hover:border-border-main"
                placeholder="Edit cue text..."
              />
              
              {altLocations && altLocations.length > 1 && (
                <div className="pt-2 mt-2 border-t border-border-main">
                  <p className="text-[8px] text-text-faint uppercase tracking-widest mb-1">Alternative Locations ({altLocations.length})</p>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {altLocations.map((loc, i) => {
                      const isCurrent = loc.start === newCue.startIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setNewCue(prev => ({ ...prev, startIndex: loc.start, endIndex: loc.end }));
                            setSelection(s => s ? { ...s, start: loc.start, end: loc.end } : null);
                          }}
                          className={cn(
                            "w-full text-left p-1.5 rounded text-[9px] font-mono transition-all border",
                            isCurrent 
                              ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" 
                              : "bg-surface border-border-main text-text-muted hover:bg-surface-hover"
                          )}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="opacity-60 text-[7px]">Offset: {loc.start}</span>
                            {isCurrent && <Check size={8} />}
                          </div>
                          <div className="truncate">{loc.context}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">Start Time</label>
                <div className="flex gap-1">
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    value={newCue.startTime ?? ''}
                    onChange={(e) => setNewCue(prev => ({ ...prev, startTime: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setNewCue(prev => ({ ...prev, startTime: player?.getCurrentTime() || 0 }))}
                    className="bg-surface-muted hover:bg-surface-hover p-1 rounded-lg text-blue-500 transition-colors"
                  >
                    <Clock size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">End Time</label>
                <div className="flex gap-1">
                  <input 
                    type="number"
                    step="0.1"
                    min="0"
                    value={newCue.endTime ?? ''}
                    onChange={(e) => setNewCue(prev => ({ ...prev, endTime: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setNewCue(prev => ({ ...prev, endTime: player?.getCurrentTime() || 0 }))}
                    className="bg-surface-muted hover:bg-surface-hover p-1 rounded-lg text-blue-500 transition-colors"
                  >
                    <Clock size={12} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">Start Index</label>
                <input 
                  type="number"
                  min="0"
                  value={newCue.startIndex ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setNewCue(prev => {
                      const updated = { ...prev, startIndex: val };
                      if (updated.endIndex !== undefined && updated.startIndex !== undefined) {
                        const text = scriptText.substring(updated.startIndex, updated.endIndex);
                        updated.selectedText = text;
                        setSelection(s => s ? { ...s, text, start: updated.startIndex!, end: updated.endIndex! } : null);
                      }
                      return updated;
                    });
                  }}
                  className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">End Index</label>
                <input 
                  type="number"
                  min="0"
                  value={newCue.endIndex ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setNewCue(prev => {
                      const updated = { ...prev, endIndex: val };
                      if (updated.endIndex !== undefined && updated.startIndex !== undefined) {
                        const text = scriptText.substring(updated.startIndex, updated.endIndex);
                        updated.selectedText = text;
                        setSelection(s => s ? { ...s, text, start: updated.startIndex!, end: updated.endIndex! } : null);
                      }
                      return updated;
                    });
                  }}
                  className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(color => {
                  const themed = resolveCueColor(color.type);
                  const isSelected = newCue.type ? newCue.type === color.type : newCue.colorClass === color.class;
                  return (
                    <button
                      key={color.class}
                      onClick={() => setNewCue(prev => ({ ...prev, colorClass: color.class, type: color.type }))}
                      title={color.type}
                      className={cn(
                        "px-2 py-1 rounded-md transition-all border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        isSelected 
                          ? "border-btn-primary-bg scale-105 shadow-sm opacity-100 bg-surface font-bold ring-1 ring-btn-primary-bg text-text-main" 
                          : "border-border-main bg-surface-subtle opacity-70 hover:opacity-100 hover:bg-surface text-text-body"
                      )}
                    >
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: `rgb(${themed.rgb})` }} 
                      />
                      {color.type}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                {newCue.id && (
                  <button
                    onClick={() => deleteCue(newCue.id!)}
                    className="p-2 text-text-faint hover:text-red-500 transition-colors"
                    title="Delete Cue"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={saveCue}
                  disabled={!canSave}
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
                    canSave 
                      ? (newCue.id ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md" : "bg-blue-500 hover:bg-blue-600 text-white shadow-md")
                      : "bg-surface-muted text-text-faint cursor-not-allowed"
                  )}
                >
                  <Check size={14} /> {newCue.id ? 'Update Cue' : 'Save Cue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
