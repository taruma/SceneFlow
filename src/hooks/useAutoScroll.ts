import React, { useState, useEffect, useCallback } from 'react';
import type { Cue, TimingSettings, ScrollFocusPresetId, AppMode } from '../types/script';
import { getScrollFocusPreset } from '../constants/script';
import { isCueActive } from '../lib/cueUtils';

/**
 * Calculates the target scrollTop offset within a script container
 * given cue geometry, container dimensions, device profile, and target focus line ratio.
 */
export function calculateTargetScrollTop(
  relativeTop: number,
  containerHeight: number,
  elementHeight: number,
  isDesktop: boolean,
  focusRatio: number
): number {
  const target = isDesktop
    ? relativeTop - (containerHeight * focusRatio) + (elementHeight / 2)
    : relativeTop - (containerHeight / 2) + (elementHeight / 2);
  return Math.max(0, target);
}

/**
 * Smoothly animates container.scrollTop at native display refresh rate (144Hz/60Hz)
 * using a cubic ease-out curve, avoiding Windows Chrome's 60Hz native smooth-scroll judder.
 */
export function smoothScrollTo(
  container: HTMLElement,
  targetTop: number,
  duration: number = 380,
  activeAnimRef: React.MutableRefObject<number | null>
) {
  if (activeAnimRef.current !== null) {
    cancelAnimationFrame(activeAnimRef.current);
    activeAnimRef.current = null;
  }

  const startTop = container.scrollTop;
  const distance = targetTop - startTop;

  // Deadband: If already within 2px of target, snap directly
  if (Math.abs(distance) <= 2) {
    container.scrollTop = targetTop;
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Cubic ease-out curve: 1 - (1 - t)^3
    const ease = 1 - Math.pow(1 - progress, 3);
    container.scrollTop = startTop + distance * ease;

    if (progress < 1) {
      activeAnimRef.current = requestAnimationFrame(step);
    } else {
      activeAnimRef.current = null;
    }
  };

  activeAnimRef.current = requestAnimationFrame(step);
}

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
        const preset = getScrollFocusPreset(presetId);
        const targetScrollTop = calculateTargetScrollTop(
          relativeTop,
          containerRect.height,
          elementRect.height,
          isDesktop,
          preset.ratio
        );
        smoothScrollTo(container, targetScrollTop, 300, scrollAnimRef);
      }
    }
  }, [lastScrolledCueId, scriptRef, isDesktop, onScrollFocusChange]);

  const rafRef = React.useRef<number | null>(null);
  const scrollAnimRef = React.useRef<number | null>(null);

  // User manual scroll listener to cancel ongoing auto-scroll smoothly without fighting user
  useEffect(() => {
    const container = scriptRef.current;
    if (!container) return;

    const handleUserScroll = () => {
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };

    container.addEventListener('wheel', handleUserScroll, { passive: true });
    container.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleUserScroll);
      container.removeEventListener('touchmove', handleUserScroll);
    };
  }, [scriptRef]);

  // Clean up pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };
  }, []);

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
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }

          rafRef.current = requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
            
            const focusPreset = getScrollFocusPreset(scrollFocusPreset);
            const finalTarget = calculateTargetScrollTop(
              relativeTop,
              containerRect.height,
              elementRect.height,
              isDesktop,
              focusPreset.ratio
            );
            // Deadband guard: avoid micro-scroll jitter when consecutive cues are on the same line
            if (Math.abs(container.scrollTop - finalTarget) > 10) {
              smoothScrollTo(container, finalTarget, 380, scrollAnimRef);
            }
            rafRef.current = null;
          });
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
