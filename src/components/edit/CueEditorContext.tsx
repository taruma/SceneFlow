import React, { createContext, useContext } from 'react';
import type { Cue, TextSelection, AlternativeLocation } from '../../types/script';
import type { CuePaletteProfile } from '../../styles';

export interface CueEditorContextValue {
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
  widthClass?: string;
  selectCueForEdit?: (cue: Cue) => void;
}

export const CueEditorContext = createContext<CueEditorContextValue | null>(null);

export interface CueEditorProviderProps {
  value: CueEditorContextValue;
  children: React.ReactNode;
}

export const CueEditorProvider: React.FC<CueEditorProviderProps> = ({ value, children }) => {
  return (
    <CueEditorContext.Provider value={value}>
      {children}
    </CueEditorContext.Provider>
  );
};

export function useCueEditorContext(): CueEditorContextValue {
  const context = useContext(CueEditorContext);
  if (!context) {
    throw new Error('useCueEditorContext must be used within a CueEditorProvider');
  }
  return context;
}

export function useOptionalCueEditorContext(): CueEditorContextValue | null {
  return useContext(CueEditorContext);
}
