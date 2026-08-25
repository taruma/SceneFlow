import { useState, useCallback } from 'react';
import type { ScriptWidthPresetId, ScrollFocusPresetId } from '../types/script';
import { SCRIPT_WIDTH_PRESETS, SCROLL_FOCUS_PRESETS } from '../constants/script';
import { DEFAULT_SCRIPT_THEME_ID, type ScriptThemeId } from '../lib/scriptStyles';

export function useScriptPreferences() {
  const [videoWidth, setVideoWidth] = useState(100); // Percentage of container width

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
  };
}
