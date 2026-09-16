import React, { useState, useRef, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';

interface UseWordWrapOptions {
  draftText: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function useWordWrap({ draftText, textareaRef }: UseWordWrapOptions) {
  const [wordWrap, setWordWrap] = useState(false);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [mirrorWidth, setMirrorWidth] = useState<number>(0);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const toggleWordWrap = useCallback(() => {
    setWordWrap(prev => !prev);
  }, []);

  // Script lines array
  const lines = useMemo(() => draftText.split('\n'), [draftText]);
  const lineCount = lines.length;

  // High-performance single-string line numbers (avoids thousands of React DOM nodes in unwrapped mode)
  const lineNumbersText = useMemo(() => {
    let str = '';
    for (let i = 1; i <= lineCount; i++) {
      str += i + '\n';
    }
    return str;
  }, [lineCount]);

  // Measure wrapped line heights for pixel-perfect line numbers alignment
  const measureLineHeights = useCallback(() => {
    if (!wordWrap || !mirrorRef.current) return;
    const children = mirrorRef.current.children;
    const len = children.length;
    if (len === 0) return;
    const heights: number[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const el = children[i] as HTMLElement;
      heights[i] = el.offsetHeight || 19.2;
    }
    setLineHeights(heights);
  }, [wordWrap]);

  useLayoutEffect(() => {
    if (!wordWrap) {
      setLineHeights(prev => (prev.length === 0 ? prev : []));
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const contentWidth = Math.max(0, textarea.clientWidth - 28);
    setMirrorWidth(prev => (prev === contentWidth ? prev : contentWidth));

    // Measure immediately after DOM layout
    measureLineHeights();
  }, [wordWrap, draftText, measureLineHeights, textareaRef]);

  // Keep mirror width and heights synced on window resize
  useEffect(() => {
    if (!wordWrap) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const ro = new ResizeObserver(() => {
      const contentWidth = Math.max(0, textarea.clientWidth - 28);
      setMirrorWidth(prev => (prev === contentWidth ? prev : contentWidth));
      measureLineHeights();
    });
    ro.observe(textarea);

    return () => ro.disconnect();
  }, [wordWrap, measureLineHeights, textareaRef]);

  return {
    wordWrap,
    setWordWrap,
    toggleWordWrap,
    lineHeights,
    mirrorWidth,
    mirrorRef,
    lines,
    lineCount,
    lineNumbersText,
  };
}
