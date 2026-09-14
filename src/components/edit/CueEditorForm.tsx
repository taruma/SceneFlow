import React, { memo, useCallback } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { Cue } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { CueTextSection } from './CueTextSection';
import { CueTimingInputs } from './CueTimingInputs';
import { CueTypeSelector } from './CueTypeSelector';
import { CueEditorActions } from './CueEditorActions';
import { useOptionalCueEditorContext } from './CueEditorContext';

export interface CueEditorFormProps {
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
  cuePaletteProfile?: CuePaletteProfile;
  player: any;
  widthClass?: string;
}

export const CueEditorForm: React.FC<Partial<CueEditorFormProps>> = memo((props) => {
  const context = useOptionalCueEditorContext();

  const newCue = props.newCue ?? context?.newCue ?? {};
  const setNewCue = props.setNewCue ?? context?.setNewCue ?? (() => {});
  const selection = props.selection !== undefined ? props.selection : (context?.selection ?? null);
  const setSelection = props.setSelection ?? context?.setSelection ?? (() => {});
  const altLocations = props.altLocations !== undefined ? props.altLocations : (context?.altLocations ?? null);
  const findAlternativeLocations = props.findAlternativeLocations ?? context?.findAlternativeLocations ?? (() => {});
  const cancelEdit = props.cancelEdit ?? context?.cancelEdit ?? (() => {});
  const saveCue = props.saveCue ?? context?.saveCue ?? (() => {});
  const deleteCue = props.deleteCue ?? context?.deleteCue ?? (() => {});
  const canSave = props.canSave !== undefined ? props.canSave : (context?.canSave ?? false);
  const scriptText = props.scriptText ?? context?.scriptText ?? '';
  const scriptThemeId = props.scriptThemeId ?? context?.scriptThemeId ?? 'studio-light';
  const cuePaletteProfile = props.cuePaletteProfile ?? context?.cuePaletteProfile ?? 'standard';
  const player = props.player ?? context?.player;
  const widthClass = props.widthClass ?? context?.widthClass;
  const handleTextChange = useCallback((text: string) => {
    setNewCue(prev => ({ ...prev, selectedText: text }));
    setSelection(s => s ? { ...s, text } : { text, start: newCue.startIndex || 0, end: newCue.endIndex || 0 });
  }, [newCue.startIndex, newCue.endIndex, setNewCue, setSelection]);

  const handleSelectLocation = useCallback((start: number, end: number) => {
    setNewCue(prev => ({ ...prev, startIndex: start, endIndex: end }));
    setSelection(s => s ? { ...s, start, end } : null);
  }, [setNewCue, setSelection]);

  const handleStartTimeChange = useCallback((startTime: number) => {
    setNewCue(prev => ({ ...prev, startTime }));
  }, [setNewCue]);

  const handleEndTimeChange = useCallback((endTime: number) => {
    setNewCue(prev => ({ ...prev, endTime }));
  }, [setNewCue]);

  const handleCaptureStartTime = useCallback(() => {
    setNewCue(prev => ({ ...prev, startTime: player?.getCurrentTime() || 0 }));
  }, [player, setNewCue]);

  const handleCaptureEndTime = useCallback(() => {
    setNewCue(prev => ({ ...prev, endTime: player?.getCurrentTime() || 0 }));
  }, [player, setNewCue]);

  const handleStartIndexChange = useCallback((val: number) => {
    setNewCue(prev => {
      const updated = { ...prev, startIndex: val };
      if (updated.endIndex !== undefined && updated.startIndex !== undefined) {
        const text = scriptText.substring(updated.startIndex, updated.endIndex);
        updated.selectedText = text;
        setSelection(s => s ? { ...s, text, start: updated.startIndex!, end: updated.endIndex! } : null);
      }
      return updated;
    });
  }, [scriptText, setNewCue, setSelection]);

  const handleEndIndexChange = useCallback((val: number) => {
    setNewCue(prev => {
      const updated = { ...prev, endIndex: val };
      if (updated.endIndex !== undefined && updated.startIndex !== undefined) {
        const text = scriptText.substring(updated.startIndex, updated.endIndex);
        updated.selectedText = text;
        setSelection(s => s ? { ...s, text, start: updated.startIndex!, end: updated.endIndex! } : null);
      }
      return updated;
    });
  }, [scriptText, setNewCue, setSelection]);

  const handleSelectType = useCallback((type: string, colorClass: string) => {
    setNewCue(prev => ({ ...prev, colorClass, type }));
  }, [setNewCue]);

  const handleDelete = useCallback(() => {
    if (newCue.id) {
      deleteCue(newCue.id);
    }
  }, [newCue.id, deleteCue]);

  return (
    <div className="bg-surface border-b border-border-main text-text-main p-4 lg:p-6 shrink-0 z-10 shadow-sm animate-in slide-in-from-top duration-500">
      <div className={cn("mx-auto transition-all duration-300", widthClass || "max-w-xl")}>
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
                type="button"
                onClick={cancelEdit}
                className="text-[10px] uppercase tracking-widest text-text-faint hover:text-text-main underline"
              >
                Cancel
              </button>
            </div>

            <CueTextSection
              selectedText={newCue.selectedText || ''}
              onTextChange={handleTextChange}
              altLocations={altLocations}
              onFindAlternatives={findAlternativeLocations}
              onSelectLocation={handleSelectLocation}
              activeStartIndex={newCue.startIndex}
            />

            <CueTimingInputs
              startTime={newCue.startTime}
              endTime={newCue.endTime}
              startIndex={newCue.startIndex}
              endIndex={newCue.endIndex}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              onStartIndexChange={handleStartIndexChange}
              onEndIndexChange={handleEndIndexChange}
              onCaptureStartTime={handleCaptureStartTime}
              onCaptureEndTime={handleCaptureEndTime}
            />

            <div className="flex items-center justify-between pt-1">
              <CueTypeSelector
                selectedType={newCue.type}
                selectedColorClass={newCue.colorClass}
                onSelectType={handleSelectType}
                scriptThemeId={scriptThemeId}
                cuePaletteProfile={cuePaletteProfile}
              />
              <CueEditorActions
                isEditing={!!newCue.id}
                canSave={canSave}
                onSave={saveCue}
                onDelete={newCue.id ? handleDelete : undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CueEditorForm.displayName = 'CueEditorForm';
