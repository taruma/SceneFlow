import React, { useState, useEffect, useCallback } from 'react';
import type { Cue, TimingSettings, ScrollFocusPresetId, AppMode } from '../types/script';
import { SCROLL_FOCUS_PRESETS } from '../constants/script';
import { isCueActive } from '../lib/cueUtils';

interface UseAutoScrollOptions {
  scriptRef: React.RefObject<HTMLDivElement | null>;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
  currentTime: number;
  mode: AppMode;
  isDesktop: boolean;
  scrollFocusPreset: ScrollFocusPresetId;
  onScrollFocusChange?: (presetId: ScrollFocusPresetId) => void;
}

export function useAutoScroll({
  scriptRef,
  cues,
  settings,
  currentTime,
  mode,
  isDesktop,
  scrollFocusPreset,
  onScrollFocusChange,
}: UseAutoScrollOptions) {
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [autoScrollTargets, setAutoScrollTargets] = useState<string[]>(['dialogue']);
  const [isAutoScrollDropdownOpen, setIsAutoScrollDropdownOpen] = useState(false);
  const [lastScrolledCueId, setLastScrolledCueId] = useState<string | null>(null);

  const toggleAutoScrollTarget = useCallback((targetType: string) => {
    setAutoScrollTargets(prev => {
      if (prev.includes(targetType)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(t => t !== targetType);
      }
      return [...prev, targetType];
    });
  }, []);

  const applyScrollFocus = useCallback((presetId: ScrollFocusPresetId) => {
    if (onScrollFocusChange) {
      onScrollFocusChange(presetId);
    }

    // If there is an active cue element, immediately adjust scroll position smoothly
    if (lastScrolledCueId && scriptRef.current) {
      const element = document.getElementById(`cue-${lastScrolledCueId}`);
      const container = scriptRef.current;
      if (element && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
        const preset = SCROLL_FOCUS_PRESETS.find(p => p.id === presetId) || SCROLL_FOCUS_PRESETS[0];
        const targetScrollTop = isDesktop
          ? relativeTop - (containerRect.height * preset.ratio) + (elementRect.height / 2)
          : relativeTop - (containerRect.height / 2) + (elementRect.height / 2);
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }
    }
  }, [lastScrolledCueId, scriptRef, isDesktop, onScrollFocusChange]);

  // Auto-scroll logic on currentTime updates
  useEffect(() => {
    if (mode === 'playback' && isAutoScrollEnabled) {
      const activeCues = (cues || []).filter(c => {
        // Filter by selected focus types
        if (!autoScrollTargets.includes(c.type || 'dialogue')) return false;
        return isCueActive(c, currentTime, settings);
      });

      const activeCue = activeCues.length > 0
        ? activeCues.reduce((best, current) => {
            if (!best) return current;
            
            // Prioritize by most recent start time (the one that started last)
            if (current.startTime > best.startTime) return current;
            
            // If same start time, prioritize by position in script (further down)
            if (current.startTime === best.startTime && (current.startIndex || 0) > (best.startIndex || 0)) return current;
            
            return best;
          }, null as Cue | null)
        : null;

      if (activeCue && activeCue.id !== lastScrolledCueId) {
        const element = document.getElementById(`cue-${activeCue.id}`);
        const container = scriptRef.current;
        if (element && container) {
          setTimeout(() => {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
            
            const focusPreset = SCROLL_FOCUS_PRESETS.find(p => p.id === scrollFocusPreset) || SCROLL_FOCUS_PRESETS[0];
            let targetScrollTop;
            if (isDesktop) {
              // Position active cue based on user-selected focus line preset (default 35% from top)
              targetScrollTop = relativeTop - (containerRect.height * focusPreset.ratio) + (elementRect.height / 2);
            } else {
              // Position active cue exactly in the center for mobile/tablet screens
              targetScrollTop = relativeTop - (containerRect.height / 2) + (elementRect.height / 2);
            }
            
            container.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth',
            });
          }, 50);
          setLastScrolledCueId(activeCue.id);
        }
      } else if (!activeCue) {
        setLastScrolledCueId(null);
      }
    }
  }, [currentTime, mode, isAutoScrollEnabled, cues, settings, lastScrolledCueId, autoScrollTargets, isDesktop, scrollFocusPreset, scriptRef]);

  return {
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    autoScrollTargets,
    setAutoScrollTargets,
    toggleAutoScrollTarget,
    isAutoScrollDropdownOpen,
    setIsAutoScrollDropdownOpen,
    lastScrolledCueId,
    applyScrollFocus,
  };
}
