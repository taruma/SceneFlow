import { useState, useEffect, useCallback } from 'react';
import type { AppState, Cue } from '../types/script';
import { COLORS, DEFAULT_SETTINGS } from '../constants/script';

export function useScriptStorage() {
  const [state, setState] = useState<AppState>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('screenplay_sync_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            youtubeId: parsed.youtubeId || 'dQw4w9WgXcQ',
            scriptText: parsed.scriptText || '',
            cues: Array.isArray(parsed.cues) ? parsed.cues.map((c: any) => {
              const cueType = c.type || (c.colorClass ? COLORS.find(col => col.class === c.colorClass)?.type : 'dialogue') || 'dialogue';
              const colorClass = c.colorClass || COLORS.find(col => col.type === cueType)?.class || COLORS[0].class;
              return { ...c, type: cueType, colorClass };
            }) : [],
            settings: parsed.settings || DEFAULT_SETTINGS,
          };
        } catch (e) {
          console.error("Failed to parse saved state", e);
        }
      }
    }
    return {
      youtubeId: '',
      scriptText: '',
      cues: [],
      settings: DEFAULT_SETTINGS,
    };
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isRemoteLoading, setIsRemoteLoading] = useState(false);

  // Initial load of default data if no local storage
  useEffect(() => {
    const saved = localStorage.getItem('screenplay_sync_state');
    if (!saved) {
      fetch('/examples/scene_frequency.json')
        .then(res => res.json())
        .then(data => {
          setState(data);
          setIsInitialized(true);
        })
        .catch(err => {
          console.error("Failed to load default script", err);
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('screenplay_sync_state', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const resetToDefault = useCallback(async () => {
    try {
      const res = await fetch('/examples/scene_frequency.json');
      const data = await res.json();
      const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
      setState(finalData);
      localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
      return finalData;
    } catch (err) {
      console.error("Failed to reset to default script", err);
      localStorage.removeItem('screenplay_sync_state');
      window.location.reload();
      throw err;
    }
  }, []);

  const loadBlank = useCallback(async () => {
    try {
      const res = await fetch('/examples/blank.json');
      const data = await res.json();
      const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
      setState(finalData);
      localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
      return finalData;
    } catch (err) {
      console.error("Failed to load blank script", err);
      throw err;
    }
  }, []);

  const loadExample = useCallback(async (path: string) => {
    try {
      const res = await fetch(path);
      const data = await res.json();
      const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
      setState(finalData);
      localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
      return finalData;
    } catch (err) {
      console.error("Failed to load example", err);
      throw err;
    }
  }, []);

  const loadRemoteProject = useCallback(async (url: string) => {
    setIsRemoteLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!data.youtubeId || !data.scriptText) {
        throw new Error("Invalid project format: missing youtubeId or scriptText");
      }
      const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
      setState(finalData);
      localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
      return finalData;
    } catch (err: any) {
      console.error("Failed to load remote project", err);
      throw new Error(`${err.message}. This might be due to CORS restrictions if the server doesn't allow cross-origin requests.`);
    } finally {
      setIsRemoteLoading(false);
    }
  }, []);

  return {
    state,
    setState,
    isInitialized,
    isRemoteLoading,
    resetToDefault,
    loadBlank,
    loadExample,
    loadRemoteProject,
  };
}
