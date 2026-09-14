import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { 
  Cue, 
  AppState, 
  TextSelection, 
  DeleteConfirmationState, 
  OverlapPickerState, 
  AlternativeLocation, 
  AppMode 
} from '../types/script';
import { COLORS } from '../constants/script';
import { LEGACY_CLASS_MAP } from '../styles/tokens/cues';
import { generateId } from '../lib/utils';
import { getSelectionIndicesFromDOM, findAlternativeLocations as searchAlternativeLocations } from '../lib/cueUtils';

interface UseCueEditorOptions {
  scriptText: string;
  cues: Cue[];
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  mode: AppMode;
  player: any;
}

export function useCueEditor({
  scriptText,
  cues,
  setState,
  mode,
  player,
}: UseCueEditorOptions) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [newCue, setNewCue] = useState<Partial<Cue>>({
    type: 'dialogue',
    colorClass: COLORS[0].class,
  });
  const [originalCue, setOriginalCue] = useState<Cue | null>(null);
  const [altLocations, setAltLocations] = useState<AlternativeLocation[] | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    isOpen: false,
    cue: null,
  });
  const [overlapPicker, setOverlapPicker] = useState<OverlapPickerState>({
    isOpen: false,
    cues: [],
    position: { x: 0, y: 0 },
  });

  // Close overlap picker on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (overlapPicker.isOpen) setOverlapPicker(prev => ({ ...prev, isOpen: false }));
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [overlapPicker.isOpen]);

  const cancelEdit = useCallback(() => {
    setSelection(null);
    setNewCue({ type: 'dialogue', colorClass: COLORS[0].class });
    setOriginalCue(null);
    setAltLocations(null);
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

  const handleSelection = useCallback(() => {
    if (mode !== 'edit') return;
    const sel = window.getSelection();
    
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      if (overlapPicker.isOpen) setOverlapPicker(prev => ({ ...prev, isOpen: false }));
      return;
    }

    const res = getSelectionIndicesFromDOM(sel, scriptText);
    if (res && res.text.trim()) {
      console.log("DOM Selection captured at index range:", res.start, res.end, res.text);
      setOriginalCue(null);
      setSelection({
        text: res.text,
        start: res.start,
        end: res.end,
      });
      setNewCue({
        type: 'dialogue',
        colorClass: COLORS[0].class,
        selectedText: res.text,
        startIndex: res.start,
        endIndex: res.end,
      });
    } else {
      console.warn("Text not found in raw scriptText. Selection might span across complex formatting or have different whitespace.");
    }
  }, [mode, scriptText, overlapPicker.isOpen]);

  const canSave = Boolean(
    newCue.selectedText?.trim() &&
    newCue.startTime !== undefined &&
    newCue.endTime !== undefined &&
    newCue.endTime >= newCue.startTime &&
    newCue.startIndex !== undefined &&
    newCue.endIndex !== undefined &&
    newCue.endIndex >= newCue.startIndex
  );

  const isDirty = useMemo(() => {
    if (!selection) return false;

    // Editing an existing cue
    if (newCue.id) {
      if (!originalCue) return true;
      return Boolean(
        newCue.startTime !== originalCue.startTime ||
        newCue.endTime !== originalCue.endTime ||
        newCue.selectedText !== originalCue.selectedText ||
        newCue.type !== originalCue.type ||
        newCue.colorClass !== originalCue.colorClass ||
        (newCue.startIndex ?? 0) !== (originalCue.startIndex ?? 0) ||
        (newCue.endIndex ?? 0) !== (originalCue.endIndex ?? 0)
      );
    }

    // Drafting a new cue: dirty if timings have been set or draft text/type customized
    return Boolean(
      newCue.startTime !== undefined ||
      newCue.endTime !== undefined ||
      (newCue.selectedText !== undefined && newCue.selectedText !== selection.text) ||
      (newCue.type !== undefined && newCue.type !== 'dialogue')
    );
  }, [selection, newCue, originalCue]);

  const dismissIfClean = useCallback(() => {
    if (!selection) return false;
    if (!isDirty) {
      cancelEdit();
      return true;
    }
    return false;
  }, [selection, isDirty, cancelEdit]);

  const saveCue = useCallback(() => {
    if (!canSave) {
      console.error("Cannot save cue: validation failed or missing data", newCue);
      return;
    }

    const cueType = newCue.type || (newCue.colorClass ? (LEGACY_CLASS_MAP[newCue.colorClass] || COLORS.find(c => c.class === newCue.colorClass)?.type) : 'dialogue') || 'dialogue';
    const colorClass = COLORS.find(c => c.type === cueType)?.class || newCue.colorClass || COLORS[0].class;

    const cue: Cue = {
      id: newCue.id || generateId(),
      selectedText: newCue.selectedText,
      startIndex: newCue.startIndex!,
      endIndex: newCue.endIndex!,
      startTime: newCue.startTime,
      endTime: newCue.endTime,
      colorClass: colorClass,
      type: cueType,
    };

    setState(prev => {
      const existingIdx = (prev.cues || []).findIndex(c => c.id === cue.id);
      let newCues = [...(prev.cues || [])];
      if (existingIdx >= 0) {
        newCues[existingIdx] = cue;
      } else {
        newCues.push(cue);
      }
      return { ...prev, cues: newCues };
    });
    
    cancelEdit();
    console.log("Cue saved successfully:", cue);
  }, [canSave, newCue, setState, cancelEdit]);

  const findAltLocations = useCallback(() => {
    if (!selection?.text) return;
    const results = searchAlternativeLocations(scriptText, selection.text);
    setAltLocations(results);
  }, [selection?.text, scriptText]);

  const deleteCue = useCallback((id: string) => {
    const cueToDelete = (cues || []).find(c => c.id === id);
    if (cueToDelete) {
      setDeleteConfirmation({ isOpen: true, cue: cueToDelete });
    }
  }, [cues]);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmation.cue) {
      const id = deleteConfirmation.cue.id;
      setState(prev => ({
        ...prev,
        cues: (prev.cues || []).filter(c => c.id !== id),
      }));
      if (newCue.id === id) {
        cancelEdit();
      }
      setDeleteConfirmation({ isOpen: false, cue: null });
    }
  }, [deleteConfirmation.cue, newCue.id, setState, cancelEdit]);

  const selectCueForEdit = useCallback((cue: Cue) => {
    const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';
    const colorClass = COLORS.find(c => c.type === cueType)?.class || cue.colorClass || COLORS[0].class;
    const normalizedCue: Cue = {
      ...cue,
      type: cueType,
      colorClass,
      startIndex: cue.startIndex ?? 0,
      endIndex: cue.endIndex ?? 0,
    };
    setOriginalCue(normalizedCue);
    setNewCue(normalizedCue);
    setSelection({ text: cue.selectedText, start: normalizedCue.startIndex, end: normalizedCue.endIndex });
    if (player) {
      player.seekTo(cue.startTime, true);
    }
  }, [player]);

  return {
    selection,
    setSelection,
    newCue,
    setNewCue,
    originalCue,
    isDirty,
    dismissIfClean,
    altLocations,
    setAltLocations,
    deleteConfirmation,
    setDeleteConfirmation,
    overlapPicker,
    setOverlapPicker,
    handleSelection,
    saveCue,
    cancelEdit,
    findAlternativeLocations: findAltLocations,
    deleteCue,
    confirmDelete,
    selectCueForEdit,
    canSave,
  };
}
