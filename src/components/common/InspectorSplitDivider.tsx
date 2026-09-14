import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MIN_INSPECTOR_WIDTH, MAX_INSPECTOR_WIDTH } from '../../hooks/useScriptPreferences';

export interface InspectorSplitDividerProps {
  width: number;
  onWidthChange: (width: number) => void;
  onWidthCommit?: (width: number) => void;
  onReset?: () => void;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

/**
 * Desktop-only draggable vertical split pane divider for the Right Cue Inspector.
 * 
 * Features:
 * - Direct pointer-capture drag tracking with requestAnimationFrame throttling (60-144fps).
 * - Disables all CSS transitions during drag via .is-resizing-split class on body to eliminate lag.
 * - Global iframe guard layer to prevent YouTube iframe event absorption during drag.
 * - Double-click to instantly snap back to default width (360px).
 * - Keyboard accessible (ArrowLeft expands inspector, ArrowRight shrinks inspector, Enter/Home to reset).
 * - Commits persistent storage only on drag release to avoid blocking synchronous disk I/O.
 */
export const InspectorSplitDivider: React.FC<InspectorSplitDividerProps> = ({
  width,
  onWidthChange,
  onWidthCommit,
  onReset,
  minWidth = MIN_INSPECTOR_WIDTH,
  maxWidth = MAX_INSPECTOR_WIDTH,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const latestWidth = useRef<number>(width);

  // Sync ref with external prop
  useEffect(() => {
    if (!isDragging) {
      latestWidth.current = width;
    }
  }, [width, isDragging]);

  const updateWidthFromPointer = useCallback((clientX: number) => {
    const windowWidth = window.innerWidth;
    if (windowWidth <= 0) return;

    // Right inspector width is measured from the right screen boundary
    const rawWidth = windowWidth - clientX;

    // Safe ceiling to ensure center & left panels retain minimum usable space (at least ~650px total)
    const maxAllowedWidth = Math.min(maxWidth, Math.max(minWidth, windowWidth - 650));
    const clampedWidth = Math.min(maxAllowedWidth, Math.max(minWidth, Math.round(rawWidth)));
    latestWidth.current = clampedWidth;

    // Throttle to VSync frame rate to eliminate lag
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        onWidthChange(latestWidth.current);
        rafId.current = null;
      });
    }
  }, [minWidth, maxWidth, onWidthChange]);

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
    onWidthChange(latestWidth.current);
    onWidthCommit?.(latestWidth.current);
  }, [onWidthChange, onWidthCommit]);

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

    latestWidth.current = width;
    document.body.classList.add('is-resizing-split');
    setIsDragging(true);
  }, [width]);

  // Window-level event subscriptions while dragging to guarantee capture stability across iframes/viewports
  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      updateWidthFromPointer(e.clientX);
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
  }, [isDragging, updateWidthFromPointer, stopDragging]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.min(maxWidth, width + 12);
      onWidthChange(next);
      onWidthCommit?.(next);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = Math.max(minWidth, width - 12);
      onWidthChange(next);
      onWidthCommit?.(next);
    } else if (e.key === 'Enter' || e.key === 'Home') {
      e.preventDefault();
      onReset?.();
    }
  }, [width, minWidth, maxWidth, onWidthChange, onWidthCommit, onReset]);

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
        aria-valuenow={Math.round(width)}
        aria-valuemin={minWidth}
        aria-valuemax={maxWidth}
        aria-label="Resize cue inspector panel"
        onPointerDown={handlePointerDown}
        onLostPointerCapture={stopDragging}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onReset}
        onKeyDown={handleKeyDown}
        title="Drag to resize inspector • Double-click to reset view"
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
