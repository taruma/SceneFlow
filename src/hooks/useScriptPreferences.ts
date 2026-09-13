import { useState, useCallback } from 'react';
import type { ScriptWidthPresetId, ScrollFocusPresetId } from '../types/script';
import { 
  SCRIPT_WIDTH_PRESETS, 
  SCROLL_FOCUS_PRESETS,
  DEFAULT_SCRIPT_WIDTH_PRESET_ID,
  DEFAULT_SCROLL_FOCUS_PRESET_ID 
} from '../constants/script';
import { DEFAULT_SCRIPT_THEME_ID, type ScriptThemeId, type CuePaletteProfile } from '../lib/scriptStyles';

export const DEFAULT_SPLIT_RATIO = 65;
export const MIN_SPLIT_RATIO = 30;
export const MAX_SPLIT_RATIO = 72;
export const MIN_PANEL_PIXEL_WIDTH = 380;

export const DEFAULT_VIDEO_HEIGHT = 220;
export const MIN_VIDEO_HEIGHT = 160;
export const MAX_VIDEO_HEIGHT = 480;

export const SCRIPT_PREFERENCES_STORAGE_KEYS = {
  VIDEO_HEIGHT: 'sceneflow_video_height',
  SPLIT_RATIO: 'sceneflow_split_ratio',
  VIDEO_COLLAPSED: 'sceneflow_playback_video_collapsed',
  SCRIPT_WIDTH_PRESET: 'sceneflow_script_width_preset',
  SCROLL_FOCUS_PRESET: 'sceneflow_scroll_focus_preset',
  SCRIPT_THEME: 'sceneflow_script_theme',
  CUE_PALETTE_PROFILE: 'sceneflow_cue_palette_profile',
  PURE_BLACK_BG: 'sceneflow_pure_black_bg',
} as const;

export function useScriptPreferences() {
  const [videoHeight, setVideoHeightState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.VIDEO_HEIGHT);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_VIDEO_HEIGHT && parsed <= MAX_VIDEO_HEIGHT) {
          return parsed;
        }
      }
    }
    return DEFAULT_VIDEO_HEIGHT;
  });

  const setVideoHeight = useCallback((height: number) => {
    const clamped = Math.min(MAX_VIDEO_HEIGHT, Math.max(MIN_VIDEO_HEIGHT, Math.round(height)));
    setVideoHeightState(clamped);
  }, []);

  const commitVideoHeight = useCallback((height?: number) => {
    setVideoHeightState(prev => {
      const target = typeof height === 'number' ? height : prev;
      const clamped = Math.min(MAX_VIDEO_HEIGHT, Math.max(MIN_VIDEO_HEIGHT, Math.round(target)));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.VIDEO_HEIGHT, clamped.toString());
      }
      return clamped;
    });
  }, []);

  const [splitRatio, setSplitRatioState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SPLIT_RATIO);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_SPLIT_RATIO && parsed <= MAX_SPLIT_RATIO) {
          return parsed;
        }
      }
    }
    return DEFAULT_SPLIT_RATIO;
  });

  const setSplitRatio = useCallback((ratio: number) => {
    const clamped = Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, Math.round(ratio * 10) / 10));
    setSplitRatioState(clamped);
  }, []);

  const commitSplitRatio = useCallback((ratio?: number) => {
    setSplitRatioState(prev => {
      const target = typeof ratio === 'number' ? ratio : prev;
      const clamped = Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, Math.round(target * 10) / 10));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SPLIT_RATIO, clamped.toString());
      }
      return clamped;
    });
  }, []);

  const [isVideoCollapsed, setIsVideoCollapsedState] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.VIDEO_COLLAPSED);
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false;
  });

  const setIsVideoCollapsed = useCallback((collapsed: boolean) => {
    setIsVideoCollapsedState(collapsed);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.VIDEO_COLLAPSED, String(collapsed));
    }
  }, []);

  const toggleVideoCollapsed = useCallback(() => {
    setIsVideoCollapsedState(prev => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.VIDEO_COLLAPSED, String(next));
      }
      return next;
    });
  }, []);

  const resetViewLayout = useCallback(() => {
    setSplitRatio(DEFAULT_SPLIT_RATIO);
    commitSplitRatio(DEFAULT_SPLIT_RATIO);
    setVideoHeight(DEFAULT_VIDEO_HEIGHT);
    commitVideoHeight(DEFAULT_VIDEO_HEIGHT);
    setIsVideoCollapsed(false);
  }, [setSplitRatio, commitSplitRatio, setVideoHeight, commitVideoHeight, setIsVideoCollapsed]);

  const isViewCustomized = 
    Math.round(splitRatio) !== DEFAULT_SPLIT_RATIO || 
    videoHeight !== DEFAULT_VIDEO_HEIGHT ||
    isVideoCollapsed;

  const [scriptWidthPreset, setScriptWidthPresetState] = useState<ScriptWidthPresetId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCRIPT_WIDTH_PRESET);
      if (saved && SCRIPT_WIDTH_PRESETS.some(p => p.id === saved)) {
        return saved as ScriptWidthPresetId;
      }
    }
    return DEFAULT_SCRIPT_WIDTH_PRESET_ID;
  });

  const [scrollFocusPreset, setScrollFocusPresetState] = useState<ScrollFocusPresetId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCROLL_FOCUS_PRESET);
      if (saved && SCROLL_FOCUS_PRESETS.some(p => p.id === saved)) {
        return saved as ScrollFocusPresetId;
      }
    }
    return DEFAULT_SCROLL_FOCUS_PRESET_ID;
  });

  const isScriptPreferencesCustomized = 
    scriptWidthPreset !== DEFAULT_SCRIPT_WIDTH_PRESET_ID || 
    scrollFocusPreset !== DEFAULT_SCROLL_FOCUS_PRESET_ID;

  const resetScriptPreferences = useCallback(() => {
    setScriptWidthPresetState(DEFAULT_SCRIPT_WIDTH_PRESET_ID);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCRIPT_WIDTH_PRESET, DEFAULT_SCRIPT_WIDTH_PRESET_ID);
    }
    setScrollFocusPresetState(DEFAULT_SCROLL_FOCUS_PRESET_ID);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCROLL_FOCUS_PRESET, DEFAULT_SCROLL_FOCUS_PRESET_ID);
    }
  }, []);

  const [scriptThemeId, setScriptThemeIdState] = useState<ScriptThemeId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCRIPT_THEME);
      if (saved) {
        return saved as ScriptThemeId;
      }
    }
    return DEFAULT_SCRIPT_THEME_ID;
  });
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  const [hiddenCueTypes, setHiddenCueTypes] = useState<Set<string>>(new Set());

  const setScriptThemeId = useCallback((themeId: ScriptThemeId) => {
    setScriptThemeIdState(themeId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCRIPT_THEME, themeId);
    }
  }, []);

  const setScriptWidthPreset = useCallback((presetId: ScriptWidthPresetId) => {
    setScriptWidthPresetState(presetId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCRIPT_WIDTH_PRESET, presetId);
    }
  }, []);

  const setScrollFocusPreset = useCallback((presetId: ScrollFocusPresetId) => {
    setScrollFocusPresetState(presetId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.SCROLL_FOCUS_PRESET, presetId);
    }
  }, []);

  const [cuePaletteProfile, setCuePaletteProfileState] = useState<CuePaletteProfile>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.CUE_PALETTE_PROFILE);
      if (saved === 'protanopia' || saved === 'standard') {
        return saved as CuePaletteProfile;
      }
    }
    return 'standard';
  });

  const setCuePaletteProfile = useCallback((profile: CuePaletteProfile) => {
    setCuePaletteProfileState(profile);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.CUE_PALETTE_PROFILE, profile);
    }
  }, []);

  const [pureBlackMode, setPureBlackModeState] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.PURE_BLACK_BG);
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return false;
  });

  const setPureBlackMode = useCallback((enabled: boolean) => {
    setPureBlackModeState(enabled);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.PURE_BLACK_BG, String(enabled));
    }
  }, []);

  const toggleCueTypeVisibility = useCallback((type: string) => {
    setHiddenCueTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  return {
    videoHeight,
    setVideoHeight,
    commitVideoHeight,
    scriptWidthPreset,
    setScriptWidthPreset,
    scrollFocusPreset,
    setScrollFocusPreset,
    isScriptPreferencesCustomized,
    resetScriptPreferences,
    scriptThemeId,
    setScriptThemeId,
    cuePaletteProfile,
    setCuePaletteProfile,
    pureBlackMode,
    setPureBlackMode,
    isColorModalOpen,
    setIsColorModalOpen,
    hiddenCueTypes,
    setHiddenCueTypes,
    toggleCueTypeVisibility,
    splitRatio,
    setSplitRatio,
    commitSplitRatio,
    resetViewLayout,
    isViewCustomized,
    isVideoCollapsed,
    setIsVideoCollapsed,
    toggleVideoCollapsed,
  };
}
