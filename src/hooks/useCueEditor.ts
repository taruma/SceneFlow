import React, { useState, useCallback, useEffect } from 'react';
import type { 
  Cue, 
  AppState, 
  TextSelection, 
  DeleteConfirmationState, 
  ResetConfirmationState, 
  OverlapPickerState, 
  AlternativeLocation, 
  AppMode 
} from '../types/script';
import { COLORS } from '../constants/script';
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
  const [altLocations, setAltLocations] = useState<AlternativeLocation[] | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    isOpen: false,
    cue: null,
  });
  const [resetConfirmation, setResetConfirmation] = useState<ResetConfirmationState>({
    isOpen: false,
    type: null,
    error: null,
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
    setAltLocations(null);
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
      setSelection({
        text: res.text,
        start: res.start,
        end: res.end,
      });
      setNewCue(prev => ({
        ...prev,
        selectedText: res.text,
        startIndex: res.start,
        endIndex: res.end,
      }));
    } else {
      console.warn("Text not found in raw scriptText. Selection might span across complex formatting or have different whitespace.");
    }
  }, [mode, scriptText, overlapPicker.isOpen]);

  const saveCue = useCallback(() => {
    if (!newCue.selectedText || newCue.startTime === undefined || newCue.endTime === undefined) {
      console.error("Cannot save cue: missing data", newCue);
      return;
    }

    const cueType = newCue.type || (newCue.colorClass ? COLORS.find(c => c.class === newCue.colorClass)?.type : 'dialogue') || 'dialogue';
    const colorClass = newCue.colorClass || COLORS.find(c => c.type === cueType)?.class || COLORS[0].class;

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
  }, [newCue, setState, cancelEdit]);

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
    const cueType = cue.type || (cue.colorClass ? COLORS.find(c => c.class === cue.colorClass)?.type : 'dialogue') || 'dialogue';
    const colorClass = cue.colorClass || COLORS.find(c => c.type === cueType)?.class || COLORS[0].class;
    setNewCue({ ...cue, type: cueType, colorClass });
    setSelection({ text: cue.selectedText, start: cue.startIndex, end: cue.endIndex });
    if (player) player.seekTo(cue.startTime, true);
  }, [player]);

  return {
    selection,
    setSelection,
    newCue,
    setNewCue,
    altLocations,
    setAltLocations,
    deleteConfirmation,
    setDeleteConfirmation,
    resetConfirmation,
    setResetConfirmation,
    overlapPicker,
    setOverlapPicker,
    handleSelection,
    saveCue,
    cancelEdit,
    findAlternativeLocations: findAltLocations,
    deleteCue,
    confirmDelete,
    selectCueForEdit,
  };
}
