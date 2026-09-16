import React, { useState, useRef, useCallback, useEffect } from 'react';
import { HistoryEntry } from '../types';

interface UseScriptHistoryOptions {
  initialText: string;
  isOpen: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  onWordWrapToggle?: () => void;
}

export function useScriptHistory({
  initialText,
  isOpen,
  textareaRef,
  lineNumbersRef,
  onWordWrapToggle,
}: UseScriptHistoryOptions) {
  const [draftText, setDraftText] = useState(initialText);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync draftText and initialize history whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const text = initialText || '';
      setDraftText(text);
      setHistory([{
        text,
        selectionStart: 0,
        selectionEnd: 0,
        scrollTop: 0,
      }]);
      setHistoryIndex(0);
    }
  }, [isOpen, initialText]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (lastTypingTimeoutRef.current) {
        clearTimeout(lastTypingTimeoutRef.current);
      }
    };
  }, []);

  // Push entry into Undo/Redo history stack
  const pushHistory = useCallback((
    newText: string, 
    selStart?: number, 
    selEnd?: number, 
    scroll?: number
  ) => {
    const textarea = textareaRef.current;
    const start = selStart !== undefined ? selStart : (textarea?.selectionStart ?? newText.length);
    const end = selEnd !== undefined ? selEnd : (textarea?.selectionEnd ?? newText.length);
    const scrollTop = scroll !== undefined ? scroll : (textarea?.scrollTop ?? 0);

    setHistory(prev => {
      // Discard redo history ahead of current index
      const sliced = prev.slice(0, historyIndex + 1);
      const updated = [...sliced, { text: newText, selectionStart: start, selectionEnd: end, scrollTop }];
      // Limit to 100 history items for memory efficiency
      if (updated.length > 100) {
        updated.shift();
      }
      return updated;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 99));
  }, [historyIndex, textareaRef]);

  // Can Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    if (lastTypingTimeoutRef.current) {
      clearTimeout(lastTypingTimeoutRef.current);
    }

    const targetIndex = historyIndex - 1;
    const target = history[targetIndex];
    if (!target) return;

    setHistoryIndex(targetIndex);
    setDraftText(target.text);

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(target.selectionStart, target.selectionEnd);
      el.scrollTop = target.scrollTop;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = target.scrollTop;
      }
    });
  }, [historyIndex, history, textareaRef, lineNumbersRef]);

  // Handle Redo
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    if (lastTypingTimeoutRef.current) {
      clearTimeout(lastTypingTimeoutRef.current);
    }

    const targetIndex = historyIndex + 1;
    const target = history[targetIndex];
    if (!target) return;

    setHistoryIndex(targetIndex);
    setDraftText(target.text);

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(target.selectionStart, target.selectionEnd);
      el.scrollTop = target.scrollTop;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = target.scrollTop;
      }
    });
  }, [historyIndex, history, textareaRef, lineNumbersRef]);

  // Handle typing inside textarea with debounced history capture
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setDraftText(newText);

    if (lastTypingTimeoutRef.current) {
      clearTimeout(lastTypingTimeoutRef.current);
    }

    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const scroll = e.target.scrollTop;

    // Group continuous typing into snapshots every 400ms
    lastTypingTimeoutRef.current = setTimeout(() => {
      pushHistory(newText, start, end, scroll);
    }, 400);
  }, [pushHistory]);

  // Keyboard shortcut listener for Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, and Alt+Z (Word Wrap)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    // Alt+Z toggles Word Wrap (standard in VS Code and code editors)
    if (e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      onWordWrapToggle?.();
      return;
    }

    if (modKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if (modKey && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
    }
  }, [handleUndo, handleRedo, onWordWrapToggle]);

  return {
    draftText,
    setDraftText,
    history,
    historyIndex,
    canUndo,
    canRedo,
    pushHistory,
    handleUndo,
    handleRedo,
    handleTextareaChange,
    handleKeyDown,
    lastTypingTimeoutRef,
  };
}
