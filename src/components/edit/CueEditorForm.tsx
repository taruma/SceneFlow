import React, { memo, useCallback } from 'react';
import { Edit2, Plus, X } from 'lucide-react';
import { Cue, TextSelection, AlternativeLocation } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { cn } from '../../lib/utils';
import { useEscapeKey } from '../../hooks';
import { CueTextSection } from './CueTextSection';
import { CueTimingInputs } from './CueTimingInputs';
import { CueTypeSelector } from './CueTypeSelector';
import { CueEditorActions } from './CueEditorActions';
import { useOptionalCueEditorContext } from './CueEditorContext';

export interface CueEditorFormProps {
  newCue: Partial<Cue>;
  setNewCue: React.Dispatch<React.SetStateAction<Partial<Cue>>>;
  selection: TextSelection | null;
  setSelection: React.Dispatch<React.SetStateAction<TextSelection | null>>;
  altLocations: AlternativeLocation[] | null;
  findAlternativeLocations: () => void;
  cancelEdit: () => void;
  saveCue: () => void;
  deleteCue: (id: string) => void;
  canSave: boolean;
  scriptText: string;
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  player: any;
  className?: string;
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

  // Dismiss on Escape key
  useEscapeKey(cancelEdit, Boolean(selection));

  const handleTextChange = useCallback((text: string) => {
    setNewCue(prev => ({ ...prev, selectedText: text }));
    setSelection(s => s ? { ...s, text } : { text, start: newCue.startIndex || 0, end: newCue.endIndex || 0 });
  }, [newCue.startIndex, newCue.endIndex, setNewCue, setSelection]);

  const handleSelectLocation = useCallback((start: number, end: number) => {
    const text = scriptText.substring(start, end);
    setNewCue(prev => ({ ...prev, startIndex: start, endIndex: end, selectedText: text }));
    setSelection(s => s ? { ...s, start, end, text } : { text, start, end });
  }, [scriptText, setNewCue, setSelection]);

  const handleStartTimeChange = useCallback((startTime: number | undefined) => {
    setNewCue(prev => ({ ...prev, startTime }));
  }, [setNewCue]);

  const handleEndTimeChange = useCallback((endTime: number | undefined) => {
    setNewCue(prev => ({ ...prev, endTime }));
  }, [setNewCue]);

  const handleCaptureStartTime = useCallback(() => {
    const raw = player?.getCurrentTime() || 0;
    const rounded = Math.round(raw * 10) / 10;
    setNewCue(prev => ({ ...prev, startTime: rounded }));
  }, [player, setNewCue]);

  const handleCaptureEndTime = useCallback(() => {
    const raw = player?.getCurrentTime() || 0;
    const rounded = Math.round(raw * 10) / 10;
    setNewCue(prev => ({ ...prev, endTime: rounded }));
  }, [player, setNewCue]);

  const handleStartIndexChange = useCallback((val: number | undefined) => {
    const nextStart = val;
    const nextEnd = newCue.endIndex;
    let derivedText = newCue.selectedText;

    if (nextStart !== undefined && nextEnd !== undefined && nextStart <= nextEnd) {
      derivedText = scriptText.substring(nextStart, nextEnd);
    }

    setNewCue(prev => ({
      ...prev,
      startIndex: nextStart,
      selectedText: derivedText,
    }));

    if (nextStart !== undefined && nextEnd !== undefined) {
      setSelection(s => s ? { ...s, text: derivedText || '', start: nextStart, end: nextEnd } : null);
    }
  }, [newCue.endIndex, newCue.selectedText, scriptText, setNewCue, setSelection]);

  const handleEndIndexChange = useCallback((val: number | undefined) => {
    const nextStart = newCue.startIndex;
    const nextEnd = val;
    let derivedText = newCue.selectedText;

    if (nextStart !== undefined && nextEnd !== undefined && nextStart <= nextEnd) {
      derivedText = scriptText.substring(nextStart, nextEnd);
    }

    setNewCue(prev => ({
      ...prev,
      endIndex: nextEnd,
      selectedText: derivedText,
    }));

    if (nextStart !== undefined && nextEnd !== undefined) {
      setSelection(s => s ? { ...s, text: derivedText || '', start: nextStart, end: nextEnd } : null);
    }
  }, [newCue.startIndex, newCue.selectedText, scriptText, setNewCue, setSelection]);

  const handleSelectType = useCallback((type: string, colorClass: string) => {
    setNewCue(prev => ({ ...prev, colorClass, type }));
  }, [setNewCue]);

  const handleDelete = useCallback(() => {
    if (newCue.id) {
      deleteCue(newCue.id);
    }
  }, [newCue.id, deleteCue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSave) {
      e.preventDefault();
      saveCue();
    }
  }, [canSave, saveCue]);

  if (!selection) {
    return null;
  }

  return (
    <div 
      onKeyDown={handleKeyDown}
      className={cn("p-4 space-y-4 text-text-main animate-in fade-in duration-200", props.className)}
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          {newCue.id ? <Edit2 size={15} className="text-amber-500" /> : <Plus size={15} className="text-blue-500" />}
          <h3 className="text-xs font-black uppercase tracking-wider text-text-main">
            {newCue.id ? 'Edit Sync Cue' : 'New Sync Cue'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-faint hidden sm:inline">Esc</span>
          <button 
            type="button"
            onClick={cancelEdit}
            className="p-1 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-md transition-colors"
            title="Cancel (Esc)"
          >
            <X size={14} />
          </button>
        </div>
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

      <div className="space-y-3 pt-1">
        <div>
          <label className="text-[8px] font-black uppercase tracking-widest text-text-faint block mb-1.5">
            Cue Category
          </label>
          <CueTypeSelector
            selectedType={newCue.type}
            selectedColorClass={newCue.colorClass}
            onSelectType={handleSelectType}
            scriptThemeId={scriptThemeId}
            cuePaletteProfile={cuePaletteProfile}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <span className="text-[9px] font-mono text-text-faint">Ctrl+Enter to save</span>
          <CueEditorActions
            isEditing={!!newCue.id}
            canSave={canSave}
            onSave={saveCue}
            onDelete={newCue.id ? handleDelete : undefined}
          />
        </div>
      </div>
    </div>
  );
});

CueEditorForm.displayName = 'CueEditorForm';
