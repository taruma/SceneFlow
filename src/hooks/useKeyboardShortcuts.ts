import { useState, useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  player: any;
  togglePlayPause: () => void;
  jumpBy: (seconds: number) => void;
  onToggleVideo?: () => void;
  onOpenColors?: () => void;
  onOpenTiming?: () => void;
  onResetView?: () => void;
  onOpenShortcuts?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  player,
  togglePlayPause,
  jumpBy,
  onToggleVideo,
  onOpenColors,
  onOpenTiming,
  onResetView,
  onOpenShortcuts,
  disabled = false,
}: UseKeyboardShortcutsOptions) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  // Viewport resize tracking for desktop vs tablet/mobile layouts
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global shortcuts:
  // - Studio Preferences: Shift+C (Colors), Shift+T (Timing), Shift+R (Reset Layout)
  // - Shortcuts Help Modal: ? / Shift+/
  // - Playback (requires player): Space/K (play/pause), ArrowLeft/J (-5s), ArrowRight/L (+5s), V (toggle video)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or contentEditable element, or if modal is open
      if (
        disabled ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Keyboard Shortcuts Help Modal (? or Shift+/) — functional regardless of player instance
      if (
        (e.key === '?' || (e.shiftKey && (e.code === 'Slash' || e.key === '/'))) &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        onOpenShortcuts
      ) {
        e.preventDefault();
        onOpenShortcuts();
        return;
      }

      // Studio Preferences shortcuts (Shift + Key) — functional regardless of player instance
      if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if ((e.code === 'KeyC' || e.key.toLowerCase() === 'c') && onOpenColors) {
          e.preventDefault();
          onOpenColors();
          return;
        }
        if ((e.code === 'KeyT' || e.key.toLowerCase() === 't') && onOpenTiming) {
          e.preventDefault();
          onOpenTiming();
          return;
        }
        if ((e.code === 'KeyR' || e.key.toLowerCase() === 'r') && onResetView) {
          e.preventDefault();
          onResetView();
          return;
        }
      }

      // Playback shortcuts require an active video player instance
      if (!player) return;

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          jumpBy(-5);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          jumpBy(5);
          break;
        case 'KeyV':
          if (onToggleVideo) {
            e.preventDefault();
            onToggleVideo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, togglePlayPause, jumpBy, disabled, onToggleVideo, onOpenColors, onOpenTiming, onResetView, onOpenShortcuts]);

  return { isDesktop };
}
