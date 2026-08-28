import { useEffect } from 'react';

/**
 * Hook to handle closing modals/popovers when the Escape key is pressed.
 * 
 * @param onClose Callback to trigger when Escape key is pressed.
 * @param isOpen Whether the modal is currently open. Defaults to true.
 */
export function useEscapeKey(onClose: () => void, isOpen: boolean = true) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
