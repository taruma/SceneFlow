import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GripHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  DEFAULT_VIDEO_HEIGHT, 
  MIN_VIDEO_HEIGHT, 
  MAX_VIDEO_HEIGHT 
} from '../../hooks/useScriptPreferences';

export interface VideoSplitDividerProps {
  videoHeight: number;
  onHeightChange: (height: number) => void;
  onHeightCommit?: (height: number) => void;
  onReset?: () => void;
  minHeight?: number;
  maxHeight?: number;
  className?: string;
}

/**
 * Desktop-only draggable horizontal split divider between the Video Player and Active Highlights.
 * 
 * Features:
 * - Direct pointer-capture drag tracking with requestAnimationFrame throttling (60-144fps).
 * - Disables all CSS transitions during drag via .is-resizing-split class on body to eliminate lag.
 * - Global iframe guard layer to prevent YouTube iframe event absorption during drag.
 * - Double-click to instantly snap back to default 240px height.
 * - Keyboard accessible (ArrowUp/ArrowDown to adjust, Enter/Home to reset).
 * - Commits persistent storage only on drag release to avoid blocking synchronous disk I/O.
 */
export const VideoSplitDivider: React.FC<VideoSplitDividerProps> = ({
  videoHeight,
  onHeightChange,
  onHeightCommit,
  onReset,
  minHeight = MIN_VIDEO_HEIGHT,
  maxHeight = MAX_VIDEO_HEIGHT,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(videoHeight);
  const latestHeightRef = useRef<number>(videoHeight);

  // Keep latest height ref in sync when not dragging
  useEffect(() => {
    if (!isDragging) {
      latestHeightRef.current = videoHeight;
    }
  }, [videoHeight, isDragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Primary mouse button only
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if setPointerCapture is unsupported
    }

    startYRef.current = e.clientY;
    startHeightRef.current = videoHeight;
    latestHeightRef.current = videoHeight;

    document.body.classList.add('is-resizing-split');
    setIsDragging(true);
  }, [videoHeight]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaY = e.clientY - startYRef.current;
    const rawHeight = startHeightRef.current + deltaY;
    const clampedHeight = Math.min(maxHeight, Math.max(minHeight, Math.round(rawHeight)));
    latestHeightRef.current = clampedHeight;

    // Throttle to VSync frame rate to eliminate lag
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        onHeightChange(latestHeightRef.current);
        rafId.current = null;
      });
    }
  }, [isDragging, minHeight, maxHeight, onHeightChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore cleanup error
    }

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    document.body.classList.remove('is-resizing-split');
    setIsDragging(false);

    // Commit to persistent storage only upon pointer release
    onHeightChange(latestHeightRef.current);
    onHeightCommit?.(latestHeightRef.current);
  }, [isDragging, onHeightChange, onHeightCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(minHeight, videoHeight - 10);
      onHeightChange(next);
      onHeightCommit?.(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(maxHeight, videoHeight + 10);
      onHeightChange(next);
      onHeightCommit?.(next);
    } else if (e.key === 'Enter' || e.key === 'Home') {
      e.preventDefault();
      onReset?.();
    }
  }, [videoHeight, minHeight, maxHeight, onHeightChange, onHeightCommit, onReset]);

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
          className="fixed inset-0 z-[100] cursor-row-resize select-none bg-transparent"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      <div
        ref={dividerRef}
        role="separator"
        tabIndex={0}
        aria-orientation="horizontal"
        aria-valuenow={Math.round(videoHeight)}
        aria-valuemin={minHeight}
        aria-valuemax={maxHeight}
        aria-label="Resize video player height"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onReset}
        onKeyDown={handleKeyDown}
        title="Drag to resize video height • Double-click to reset"
        className={cn(
          "hidden lg:flex relative items-center justify-center select-none cursor-row-resize z-20 shrink-0",
          "h-6 w-full my-2.5 py-2 transition-colors duration-200 outline-none group focus-visible:ring-2 focus-visible:ring-blue-500",
          className
        )}
      >
        {/* Visual Line */}
        <div
          className={cn(
            "w-full transition-all duration-200 rounded-full",
            isDragging
              ? "h-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              : isHovered
              ? "h-[1.5px] bg-blue-400/80"
              : "h-[1px] bg-border-main/80"
          )}
        />

        {/* Center Grip Handle */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center justify-center",
            "h-4 w-9 rounded-full border bg-surface shadow-xs transition-all duration-200 pointer-events-none",
            isDragging
              ? "opacity-100 scale-105 border-blue-500 text-blue-500 bg-surface shadow-sm"
              : isHovered
              ? "opacity-100 scale-100 border-blue-400 text-blue-500 bg-surface shadow-xs"
              : "opacity-60 scale-95 border-border-main text-text-muted hover:opacity-100"
          )}
        >
          <GripHorizontal size={12} />
        </div>
      </div>
    </>
  );
};
