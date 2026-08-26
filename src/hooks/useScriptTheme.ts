import { useMemo } from 'react';
import { 
  getScriptTheme, 
  getCueColorForTheme, 
  type ScriptThemeId, 
  type ScriptTheme,
  type CueThemeResolvedColor 
} from '../styles';

export interface UseScriptThemeReturn {
  themeId: ScriptThemeId;
  theme: ScriptTheme;
  isDark: boolean;
  category: 'light' | 'warm' | 'dark';
  resolveCueColor: (typeOrClass?: string) => CueThemeResolvedColor;
}

/**
 * Custom hook to resolve and memoize active theme attributes and dynamic cue color lookups.
 */
export function useScriptTheme(themeId: ScriptThemeId = 'studio-light'): UseScriptThemeReturn {
  const theme = useMemo(() => getScriptTheme(themeId), [themeId]);

  const resolveCueColor = useMemo(() => {
    return (typeOrClass?: string) => getCueColorForTheme(typeOrClass, themeId);
  }, [themeId]);

  return {
    themeId,
    theme,
    isDark: theme.isDark,
    category: theme.category,
    resolveCueColor,
  };
}
