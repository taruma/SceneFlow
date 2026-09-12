import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MIN_SPLIT_RATIO, MAX_SPLIT_RATIO, MIN_PANEL_PIXEL_WIDTH } from '../../hooks/useScriptPreferences';

export interface SplitPaneDividerProps {
  splitRatio: number;
  onSplitChange: (ratio: number) => void;
  onSplitCommit?: (ratio: number) => void;
  onReset?: () => void;
  minRatio?: number;
  maxRatio?: number;
  className?: string;
}

/**
 * Desktop-only draggable vertical split pane divider.
 * 
 * Features:
 * - Direct pointer-capture drag tracking with requestAnimationFrame throttling (60-144fps).
 * - Disables all CSS transitions during drag via .is-resizing-split class on body to eliminate lag.
 * - Global iframe guard layer to prevent YouTube iframe event absorption during drag.
 * - Double-click to instantly snap back to default ratio.
 * - Keyboard accessible (ArrowLeft/ArrowRight to adjust, Enter/Home to reset).
 * - Commits persistent storage only on drag release to avoid blocking synchronous disk I/O.
 */
export const SplitPaneDivider: React.FC<SplitPaneDividerProps> = ({
  splitRatio,
  onSplitChange,
  onSplitCommit,
  onReset,
  minRatio = MIN_SPLIT_RATIO,
  maxRatio = MAX_SPLIT_RATIO,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const latestRatio = useRef<number>(splitRatio);

  // Sync ref with external prop
  useEffect(() => {
    if (!isDragging) {
      latestRatio.current = splitRatio;
    }
  }, [splitRatio, isDragging]);

  const updateRatioFromPointer = useCallback((clientX: number) => {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 0) return;

    const rawRatio = (clientX / windowWidth) * 100;
    // Guard minimum ratio with an absolute pixel floor so the left panel stays usable
    const pixelMinRatio = (MIN_PANEL_PIXEL_WIDTH / windowWidth) * 100;
    const effectiveMinRatio = Math.min(maxRatio, Math.max(minRatio, pixelMinRatio));
    const clampedRatio = Math.min(maxRatio, Math.max(effectiveMinRatio, rawRatio));
    latestRatio.current = clampedRatio;

    // Throttle to VSync frame rate to eliminate lag
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        onSplitChange(latestRatio.current);
        rafId.current = null;
      });
    }
  }, [minRatio, maxRatio, onSplitChange]);

  const stopDragging = useCallback(() => {
    if (activePointerIdRef.current !== null && dividerRef.current) {
      try {
        if (dividerRef.current.hasPointerCapture(activePointerIdRef.current)) {
          dividerRef.current.releasePointerCapture(activePointerIdRef.current);
        }
      } catch {
        // Ignore cleanup error
      }
      activePointerIdRef.current = null;
    }

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    document.body.classList.remove('is-resizing-split');
    setIsDragging(false);

    // Commit to persistent storage only upon pointer release
    onSplitChange(latestRatio.current);
    onSplitCommit?.(latestRatio.current);
  }, [onSplitChange, onSplitCommit]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button
    e.preventDefault();
    e.stopPropagation();

    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if setPointerCapture is unsupported
    }

    latestRatio.current = splitRatio;
    document.body.classList.add('is-resizing-split');
    setIsDragging(true);
  }, [splitRatio]);

  // Window-level event subscriptions while dragging to guarantee capture stability across iframes/viewports
  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      updateRatioFromPointer(e.clientX);
    };

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault();
      stopDragging();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isDragging, updateRatioFromPointer, stopDragging]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const pixelMinRatio = (MIN_PANEL_PIXEL_WIDTH / windowWidth) * 100;
    const effectiveMinRatio = Math.min(maxRatio, Math.max(minRatio, pixelMinRatio));

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.max(effectiveMinRatio, splitRatio - 1);
      onSplitChange(next);
      onSplitCommit?.(next);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.min(maxRatio, splitRatio + 1);
      onSplitChange(next);
      onSplitCommit?.(next);
    } else if (e.key === 'Enter' || e.key === 'Home') {
      e.preventDefault();
      onReset?.();
    }
  }, [splitRatio, minRatio, maxRatio, onSplitChange, onSplitCommit, onReset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('is-resizing-split');
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <>
      {/* Transparent overlay guard to prevent iframe hover/capture during dragging */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-[100] cursor-col-resize select-none touch-none bg-transparent"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      <div
        ref={dividerRef}
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-valuenow={Math.round(splitRatio)}
        aria-valuemin={minRatio}
        aria-valuemax={maxRatio}
        aria-label="Resize left playback and right screenplay panels"
        onPointerDown={handlePointerDown}
        onLostPointerCapture={stopDragging}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onReset}
        onKeyDown={handleKeyDown}
        title="Drag to resize panels • Double-click to reset view"
        className={cn(
          "hidden lg:flex relative items-center justify-center select-none touch-none cursor-col-resize z-30 shrink-0",
          "w-3 -mx-1.5 transition-colors duration-200 outline-none group focus-visible:ring-2 focus-visible:ring-blue-500",
          className
        )}
      >
        {/* Visual Line */}
        <div
          className={cn(
            "h-full transition-all duration-200 rounded-full",
            isDragging
              ? "w-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              : isHovered
              ? "w-0.5 bg-text-muted"
              : "w-[1px] bg-border-main"
          )}
        />

        {/* Center Grip Handle */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center justify-center",
            "w-4 h-8 rounded-full border border-border-main bg-surface shadow-xs transition-all duration-200 pointer-events-none",
            isDragging || isHovered
              ? "opacity-100 scale-100 border-blue-500/50 text-blue-500 bg-surface shadow-sm"
              : "opacity-0 scale-75 text-text-faint"
          )}
        >
          <GripVertical size={10} />
        </div>
      </div>
    </>
  );
};
