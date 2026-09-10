import { useState, useCallback } from 'react';
import type { ScriptWidthPresetId, ScrollFocusPresetId } from '../types/script';
import { SCRIPT_WIDTH_PRESETS, SCROLL_FOCUS_PRESETS } from '../constants/script';
import { DEFAULT_SCRIPT_THEME_ID, type ScriptThemeId } from '../lib/scriptStyles';

export const DEFAULT_SPLIT_RATIO = 42;
export const MIN_SPLIT_RATIO = 30;
export const MAX_SPLIT_RATIO = 65;

export function useScriptPreferences() {
  const [videoWidth, setVideoWidthState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sceneflow_video_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 40 && parsed <= 100) {
          return parsed;
        }
      }
    }
    return 100;
  });

  const setVideoWidth = useCallback((width: number) => {
    setVideoWidthState(width);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sceneflow_video_width', width.toString());
    }
  }, []);

  const [splitRatio, setSplitRatioState] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sceneflow_split_ratio');
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
        localStorage.setItem('sceneflow_split_ratio', clamped.toString());
      }
      return clamped;
    });
  }, []);

  const resetViewLayout = useCallback(() => {
    setSplitRatio(DEFAULT_SPLIT_RATIO);
    commitSplitRatio(DEFAULT_SPLIT_RATIO);
    setVideoWidth(100);
  }, [setSplitRatio, commitSplitRatio, setVideoWidth]);

  const isViewCustomized = Math.round(splitRatio) !== DEFAULT_SPLIT_RATIO || videoWidth !== 100;

  const [scriptWidthPreset, setScriptWidthPresetState] = useState<ScriptWidthPresetId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sceneflow_script_width_preset');
      if (saved && SCRIPT_WIDTH_PRESETS.some(p => p.id === saved)) {
        return saved as ScriptWidthPresetId;
      }
    }
    return 'standard';
  });
  const [isWidthDropdownOpen, setIsWidthDropdownOpen] = useState(false);

  const [scrollFocusPreset, setScrollFocusPresetState] = useState<ScrollFocusPresetId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sceneflow_scroll_focus_preset');
      if (saved && SCROLL_FOCUS_PRESETS.some(p => p.id === saved)) {
        return saved as ScrollFocusPresetId;
      }
    }
    return 'top';
  });
  const [isScrollFocusDropdownOpen, setIsScrollFocusDropdownOpen] = useState(false);

  const [scriptThemeId, setScriptThemeIdState] = useState<ScriptThemeId>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sceneflow_script_theme');
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
      localStorage.setItem('sceneflow_script_theme', themeId);
    }
  }, []);

  const setScriptWidthPreset = useCallback((presetId: ScriptWidthPresetId) => {
    setScriptWidthPresetState(presetId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sceneflow_script_width_preset', presetId);
    }
  }, []);

  const setScrollFocusPreset = useCallback((presetId: ScrollFocusPresetId) => {
    setScrollFocusPresetState(presetId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sceneflow_scroll_focus_preset', presetId);
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
    videoWidth,
    setVideoWidth,
    scriptWidthPreset,
    setScriptWidthPreset,
    isWidthDropdownOpen,
    setIsWidthDropdownOpen,
    scrollFocusPreset,
    setScrollFocusPreset,
    isScrollFocusDropdownOpen,
    setIsScrollFocusDropdownOpen,
    scriptThemeId,
    setScriptThemeId,
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
  };
}
