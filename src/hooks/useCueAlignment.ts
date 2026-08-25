import React, { useState, useCallback } from 'react';
import type { AppState } from '../types/script';
import { realignCuesList } from '../lib/cueUtils';

interface UseCueAlignmentOptions {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function useCueAlignment({ state, setState }: UseCueAlignmentOptions) {
  const [isAligning, setIsAligning] = useState(false);
  const [alignSuccess, setAlignSuccess] = useState(false);

  const realignCues = useCallback((targetState?: AppState) => {
    // If targetState is an event (from onClick), ignore it
    const actualState = (targetState && typeof targetState === 'object' && 'cues' in targetState) 
      ? (targetState as AppState) 
      : state;
    
    if (!actualState || !actualState.cues || actualState.cues.length === 0) {
      console.warn("No cues to realign");
      return;
    }
    
    setIsAligning(true);
    
    // Use a small delay for visual feedback if it's a manual click
    const isManual = !targetState || !('cues' in targetState);
    const delay = isManual ? 600 : 0;
    
    console.log("Aligning cues. Manual:", isManual, "Cues count:", (actualState.cues || []).length);

    setTimeout(() => {
      const { updatedCues, alignedCount } = realignCuesList(actualState.cues, actualState.scriptText);
      
      setState(prev => ({ ...prev, cues: updatedCues }));
      setIsAligning(false);
      
      if (isManual) {
        setAlignSuccess(true);
        setTimeout(() => setAlignSuccess(false), 2000);
      }
      console.log(`Cues realigned: ${alignedCount} of ${actualState.cues.length} updated.`);
    }, delay);
  }, [state, setState]);

  return {
    isAligning,
    alignSuccess,
    realignCues,
  };
}
