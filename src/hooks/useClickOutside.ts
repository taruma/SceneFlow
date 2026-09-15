import { useEffect, RefObject } from 'react';

/**
 * Hook to handle clicks outside of a specified element.
 * 
 * @param ref Ref object attached to the container element.
 * @param handler Callback invoked when a click occurs outside the container.
 * @param enabled Whether the outside-click listener is currently active. Defaults to true.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}
