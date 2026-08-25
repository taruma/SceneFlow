import { useState, useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  player: any;
  togglePlayPause: () => void;
  jumpBy: (seconds: number) => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  player,
  togglePlayPause,
  jumpBy,
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

  // Playback shortcuts: Space (play/pause), ArrowLeft (-5s), ArrowRight (+5s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or if modal is open
      if (
        disabled ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (!player) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          jumpBy(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          jumpBy(5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, togglePlayPause, jumpBy, disabled]);

  return { isDesktop };
}
