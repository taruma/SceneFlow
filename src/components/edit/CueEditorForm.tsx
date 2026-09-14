import React, { memo, useCallback } from 'react';
import { Edit2, Plus, X, Check, Trash2 } from 'lucide-react';
import { Cue, TextSelection, AlternativeLocation } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { cn } from '../../lib/utils';
import { useEscapeKey } from '../../hooks';
import { CueTextSection } from './CueTextSection';
import { CueSceneContext } from './CueSceneContext';
import { CueTimingCard } from './CueTimingCard';
import { CueTypeSelector } from './CueTypeSelector';
import { CueScriptAnchoring } from './CueScriptAnchoring';
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

  const isEditing = Boolean(newCue.id);

  return (
    <div 
      onKeyDown={handleKeyDown}
      className={cn("flex flex-col min-h-full justify-between text-text-main animate-in fade-in duration-200", props.className)}
    >
      {/* Scrollable Form Cards Container */}
      <div className="p-4 space-y-4">
        {/* Form Title & Fast Cancel Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Edit2 size={14} className="text-amber-500 shrink-0" />
            ) : (
              <Plus size={14} className="text-blue-500 shrink-0" />
            )}
            <h3 className="text-xs font-black uppercase tracking-wider text-text-main truncate">
              {isEditing ? 'Edit Sync Cue' : 'New Sync Cue'}
            </h3>
          </div>

          <button 
            type="button"
            onClick={cancelEdit}
            className="p-1 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-md transition-colors"
            title="Cancel (Esc)"
            aria-label="Cancel editing"
          >
            <X size={14} />
          </button>
        </div>

        {/* Card 1: Surrounding Scene Context & Editable Quote */}
        <CueSceneContext
          scriptText={scriptText}
          startIndex={newCue.startIndex}
          endIndex={newCue.endIndex}
        >
          <CueTextSection
            selectedText={newCue.selectedText || ''}
            onTextChange={handleTextChange}
            altLocations={altLocations}
            onFindAlternatives={findAlternativeLocations}
            onSelectLocation={handleSelectLocation}
            activeStartIndex={newCue.startIndex}
          />
        </CueSceneContext>

        {/* Card 2: Dedicated Audio-Visual Timing Deck & Loop Preview */}
        <CueTimingCard
          startTime={newCue.startTime}
          endTime={newCue.endTime}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
          onCaptureStartTime={handleCaptureStartTime}
          onCaptureEndTime={handleCaptureEndTime}
          player={player}
        />

        {/* Card 3: Cue Category Palette */}
        <div className="space-y-1.5">
          <label className="text-[8px] font-black uppercase tracking-widest text-text-faint block">
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

        {/* Card 4: Dedicated Script Anchoring & Offsets */}
        <CueScriptAnchoring
          startIndex={newCue.startIndex}
          endIndex={newCue.endIndex}
          onStartIndexChange={handleStartIndexChange}
          onEndIndexChange={handleEndIndexChange}
          cueId={newCue.id}
        />
      </div>

      {/* Pinned Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 bg-surface/95 backdrop-blur border-t border-border-subtle p-3 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-red-500/80 bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors active:scale-95 shadow-2xs"
              title="Delete Cue"
              aria-label="Delete this cue"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={cancelEdit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-muted hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors font-medium select-none"
          >
            <span>Cancel</span>
            <kbd className="text-[9px] font-mono font-normal opacity-60 px-1 py-0.5 rounded bg-surface-muted border border-border-subtle">
              Esc
            </kbd>
          </button>
        </div>

        <button
          type="button"
          onClick={saveCue}
          disabled={!canSave}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 shadow-sm active:scale-95 select-none",
            canSave
              ? (isEditing 
                  ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20")
              : "bg-surface-muted text-text-faint cursor-not-allowed opacity-50"
          )}
          title={canSave ? "Save cue (Ctrl+Enter)" : "Fill required text and timing to save"}
        >
          <Check size={14} className="stroke-[3]" />
          <span>{isEditing ? 'Update Cue' : 'Create Cue'}</span>
          <kbd className="text-[9px] font-mono font-normal opacity-70 px-1 py-0.5 rounded bg-black/20 ml-0.5">
            ^↵
          </kbd>
        </button>
      </div>
    </div>
  );
});

CueEditorForm.displayName = 'CueEditorForm';
