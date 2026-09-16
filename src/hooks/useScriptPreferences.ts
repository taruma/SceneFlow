import { useState, useCallback } from 'react';
import type { ScriptWidthPresetId, ScrollFocusPresetId, AppMode } from '../types/script';
import { 
  SCRIPT_WIDTH_PRESETS, 
  SCROLL_FOCUS_PRESETS,
  DEFAULT_SCRIPT_WIDTH_PRESET_ID,
  DEFAULT_SCROLL_FOCUS_PRESET_ID 
} from '../constants/script';
import { DEFAULT_SCRIPT_THEME_ID, type ScriptThemeId, type CuePaletteProfile } from '../lib/scriptStyles';
import { disableTransitionsTemporarily } from './useAppShellTheme';

export const DEFAULT_SPLIT_RATIO = 65;
export const MIN_SPLIT_RATIO = 30;
export const MAX_SPLIT_RATIO = 72;
export const MIN_PANEL_PIXEL_WIDTH = 380;

export const DEFAULT_EDIT_SPLIT_RATIO = 40;
export const MIN_EDIT_SPLIT_RATIO = 25;
export const MAX_EDIT_SPLIT_RATIO = 55;

export const DEFAULT_EDIT_INSPECTOR_RATIO = 25;
export const MIN_EDIT_INSPECTOR_RATIO = 18;
export const MAX_EDIT_INSPECTOR_RATIO = 45;
export const MIN_INSPECTOR_PIXEL_WIDTH = 260;

export const DEFAULT_VIDEO_HEIGHT = 220;
export const MIN_VIDEO_HEIGHT = 160;
export const MAX_VIDEO_HEIGHT = 480;

export const DEFAULT_INSPECTOR_WIDTH = 360;
export const MIN_INSPECTOR_WIDTH = 280;
export const MAX_INSPECTOR_WIDTH = 560;

export const SCRIPT_PREFERENCES_STORAGE_KEYS = {
  VIDEO_HEIGHT: 'sceneflow_video_height',
  SPLIT_RATIO: 'sceneflow_split_ratio',
  EDIT_SPLIT_RATIO: 'sceneflow_edit_split_ratio',
  INSPECTOR_RATIO: 'sceneflow_inspector_ratio',
  INSPECTOR_WIDTH: 'sceneflow_inspector_width',
  VIDEO_COLLAPSED: 'sceneflow_playback_video_collapsed',
  SCRIPT_WIDTH_PRESET: 'sceneflow_script_width_preset',
  SCROLL_FOCUS_PRESET: 'sceneflow_scroll_focus_preset',
  SCRIPT_THEME: 'sceneflow_script_theme',
  CUE_PALETTE_PROFILE: 'sceneflow_cue_palette_profile',
  PURE_BLACK_BG: 'sceneflow_pure_black_bg',
  APP_MODE: 'sceneflow_app_mode',
} as const;

export function useScriptPreferences(mode: AppMode = 'playback') {
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

  // Playback mode split ratio (Left video/cues vs Right script)
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

  // Edit mode workstation left panel split ratio (Left panel: 40% default)
  const [editSplitRatio, setEditSplitRatioState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.EDIT_SPLIT_RATIO);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_EDIT_SPLIT_RATIO && parsed <= MAX_EDIT_SPLIT_RATIO) {
          return parsed;
        }
      }
    }
    return DEFAULT_EDIT_SPLIT_RATIO;
  });

  const setEditSplitRatio = useCallback((ratio: number) => {
    const clamped = Math.min(MAX_EDIT_SPLIT_RATIO, Math.max(MIN_EDIT_SPLIT_RATIO, Math.round(ratio * 10) / 10));
    setEditSplitRatioState(clamped);
  }, []);

  const commitEditSplitRatio = useCallback((ratio?: number) => {
    setEditSplitRatioState(prev => {
      const target = typeof ratio === 'number' ? ratio : prev;
      const clamped = Math.min(MAX_EDIT_SPLIT_RATIO, Math.max(MIN_EDIT_SPLIT_RATIO, Math.round(target * 10) / 10));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.EDIT_SPLIT_RATIO, clamped.toString());
      }
      return clamped;
    });
  }, []);

  // Edit mode Cue Inspector ratio (Right panel: 30% default)
  const [inspectorRatio, setInspectorRatioState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.INSPECTOR_RATIO);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= MIN_EDIT_INSPECTOR_RATIO && parsed <= MAX_EDIT_INSPECTOR_RATIO) {
          return parsed;
        }
      }
    }
    return DEFAULT_EDIT_INSPECTOR_RATIO;
  });

  const setInspectorRatio = useCallback((ratio: number) => {
    const clamped = Math.min(MAX_EDIT_INSPECTOR_RATIO, Math.max(MIN_EDIT_INSPECTOR_RATIO, Math.round(ratio * 10) / 10));
    setInspectorRatioState(clamped);
  }, []);

  const commitInspectorRatio = useCallback((ratio?: number) => {
    setInspectorRatioState(prev => {
      const target = typeof ratio === 'number' ? ratio : prev;
      const clamped = Math.min(MAX_EDIT_INSPECTOR_RATIO, Math.max(MIN_EDIT_INSPECTOR_RATIO, Math.round(target * 10) / 10));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.INSPECTOR_RATIO, clamped.toString());
      }
      return clamped;
    });
  }, []);

  const resetInspectorRatio = useCallback(() => {
    setInspectorRatioState(DEFAULT_EDIT_INSPECTOR_RATIO);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SCRIPT_PREFERENCES_STORAGE_KEYS.INSPECTOR_RATIO);
    }
  }, []);

  // Backwards compatibility for pixel-based inspector width
  const [inspectorWidth, setInspectorWidthState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.INSPECTOR_WIDTH);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_INSPECTOR_WIDTH && parsed <= MAX_INSPECTOR_WIDTH) {
          return parsed;
        }
      }
    }
    return DEFAULT_INSPECTOR_WIDTH;
  });

  const setInspectorWidth = useCallback((width: number) => {
    const clamped = Math.min(MAX_INSPECTOR_WIDTH, Math.max(MIN_INSPECTOR_WIDTH, Math.round(width)));
    setInspectorWidthState(clamped);
  }, []);

  const commitInspectorWidth = useCallback((width?: number) => {
    setInspectorWidthState(prev => {
      const target = typeof width === 'number' ? width : prev;
      const clamped = Math.min(MAX_INSPECTOR_WIDTH, Math.max(MIN_INSPECTOR_WIDTH, Math.round(target)));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.INSPECTOR_WIDTH, clamped.toString());
      }
      return clamped;
    });
  }, []);

  const resetInspectorWidth = useCallback(() => {
    setInspectorWidthState(DEFAULT_INSPECTOR_WIDTH);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SCRIPT_PREFERENCES_STORAGE_KEYS.INSPECTOR_WIDTH);
    }
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

  const resetViewLayout = useCallback((targetMode?: AppMode) => {
    const activeMode = targetMode || mode;
    if (activeMode === 'edit') {
      setEditSplitRatio(DEFAULT_EDIT_SPLIT_RATIO);
      commitEditSplitRatio(DEFAULT_EDIT_SPLIT_RATIO);
      resetInspectorRatio();
    } else {
      setSplitRatio(DEFAULT_SPLIT_RATIO);
      commitSplitRatio(DEFAULT_SPLIT_RATIO);
    }
    setVideoHeight(DEFAULT_VIDEO_HEIGHT);
    commitVideoHeight(DEFAULT_VIDEO_HEIGHT);
    resetInspectorWidth();
    setIsVideoCollapsed(false);
  }, [mode, setEditSplitRatio, commitEditSplitRatio, resetInspectorRatio, setSplitRatio, commitSplitRatio, setVideoHeight, commitVideoHeight, resetInspectorWidth, setIsVideoCollapsed]);

  const isViewCustomized = mode === 'edit'
    ? (
        Math.round(editSplitRatio) !== DEFAULT_EDIT_SPLIT_RATIO ||
        Math.round(inspectorRatio) !== DEFAULT_EDIT_INSPECTOR_RATIO ||
        videoHeight !== DEFAULT_VIDEO_HEIGHT ||
        isVideoCollapsed
      )
    : (
        Math.round(splitRatio) !== DEFAULT_SPLIT_RATIO ||
        videoHeight !== DEFAULT_VIDEO_HEIGHT ||
        isVideoCollapsed
      );

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
    disableTransitionsTemporarily();
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
    disableTransitionsTemporarily();
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
    editSplitRatio,
    setEditSplitRatio,
    commitEditSplitRatio,
    inspectorRatio,
    setInspectorRatio,
    commitInspectorRatio,
    resetInspectorRatio,
    inspectorWidth,
    setInspectorWidth,
    commitInspectorWidth,
    resetInspectorWidth,
    resetViewLayout,
    isViewCustomized,
    isVideoCollapsed,
    setIsVideoCollapsed,
    toggleVideoCollapsed,
  };
}
