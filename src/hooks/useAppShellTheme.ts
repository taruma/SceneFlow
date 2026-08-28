import { useState, useEffect, useCallback } from 'react';
import { SCRIPT_THEMES, type ScriptThemeId } from '../lib/scriptStyles';

export type AppThemeMode = 'auto' | 'light' | 'warm' | 'dark';
export type AppThemeCategory = 'light' | 'warm' | 'dark';

const STORAGE_KEY = 'sceneflow_app_theme_mode';

export function useAppShellTheme(currentScriptThemeId: ScriptThemeId) {
  const [themeMode, setThemeModeState] = useState<AppThemeMode>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'auto' || saved === 'light' || saved === 'warm' || saved === 'dark') {
        return saved as AppThemeMode;
      }
    }
    return 'auto';
  });

  const setThemeMode = useCallback((mode: AppThemeMode) => {
    setThemeModeState(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, []);

  const cycleThemeMode = useCallback(() => {
    const modes: AppThemeMode[] = ['auto', 'light', 'warm', 'dark'];
    const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  }, [themeMode, setThemeMode]);

  // Compute effective category
  const scriptCategory: AppThemeCategory = (SCRIPT_THEMES[currentScriptThemeId]?.category as AppThemeCategory) || 'light';
  const effectiveCategory: AppThemeCategory = themeMode === 'auto' ? scriptCategory : themeMode;

  // Apply to documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme-category', effectiveCategory);
      document.body.setAttribute('data-theme-category', effectiveCategory);
    }
  }, [effectiveCategory]);

  return {
    themeMode,
    setThemeMode,
    cycleThemeMode,
    effectiveCategory,
    scriptCategory,
  };
}
