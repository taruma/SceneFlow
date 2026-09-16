import React, { useState, useCallback } from 'react';
import { CORE_DIRECTIVE_PRESETS } from '../types';

interface UseCustomTagsOptions {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  lastTypingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  setDraftText: React.Dispatch<React.SetStateAction<string>>;
  pushHistory: (newText: string, selStart?: number, selEnd?: number, scroll?: number) => void;
}

export function useCustomTags({
  textareaRef,
  lineNumbersRef,
  lastTypingTimeoutRef,
  setDraftText,
  pushHistory,
}: UseCustomTagsOptions) {
  // Persistent Custom Tags from localStorage (excluding core presets)
  const [customTags, setCustomTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sceneflow_custom_tags');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(t => typeof t === 'string' && !['STAGING', 'BRIEF', ...CORE_DIRECTIVE_PRESETS].includes(t.toUpperCase() as any));
      }
      return [];
    } catch {
      return [];
    }
  });

  const saveCustomTag = useCallback((tag: string) => {
    const cleaned = tag.trim().toUpperCase().replace(/[^A-Z0-9_\s]/g, '');
    if (!cleaned) return;
    if (['STAGING', 'BRIEF', ...CORE_DIRECTIVE_PRESETS].includes(cleaned as any)) return;
    setCustomTags(prev => {
      if (prev.includes(cleaned)) return prev;
      const updated = [...prev, cleaned];
      try {
        localStorage.setItem('sceneflow_custom_tags', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save custom tag to localStorage', err);
      }
      return updated;
    });
  }, []);

  const removeCustomTag = useCallback((tagToRemove: string) => {
    setCustomTags(prev => {
      const updated = prev.filter(t => t !== tagToRemove);
      try {
        localStorage.setItem('sceneflow_custom_tags', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to remove custom tag from localStorage', err);
      }
      return updated;
    });
  }, []);

  // Wrap selected text in a staging tag (e.g. [[INTENT]]...[[/INTENT]])
  const handleWrapSelection = useCallback((tagName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const tag = tagName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!tag) return;

    if (lastTypingTimeoutRef.current) {
      clearTimeout(lastTypingTimeoutRef.current);
    }

    // Capture exact scroll position before any DOM mutation
    const prevScrollTop = textarea.scrollTop;

    const val = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    // Guard against browser quirk where an unfocused textarea defaults selection to the end
    const isFocused = document.activeElement === textarea;
    if (!isFocused && start === val.length && val.length > 0 && prevScrollTop === 0) {
      start = 0;
      end = 0;
    }

    const selected = val.substring(start, end);

    let replacement = '';
    const isStagingWrapper = tag === 'STAGING';

    if (selected.trim().length > 0) {
      replacement = isStagingWrapper 
        ? `[[STAGING]]\n${selected}\n[[/STAGING]]`
        : `[[${tag}]]\n${selected}\n[[/${tag}]]`;
    } else {
      replacement = isStagingWrapper
        ? `[[STAGING]]\n\n[[/STAGING]]`
        : `[[${tag}]]\n\n[[/${tag}]]`;
    }

    const before = val.substring(0, start);
    const after = val.substring(end);
    const newText = before + replacement + after;

    const newSelStart = selected.trim().length > 0 ? start + `[[${tag}]]\n`.length : start + `[[${tag}]]\n`.length;
    const newSelEnd = selected.trim().length > 0 ? newSelStart + selected.length : newSelStart;

    setDraftText(newText);
    pushHistory(newText, newSelStart, newSelEnd, prevScrollTop);

    // Synchronously restore cursor, selection and scroll position without jumping
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;

      el.focus({ preventScroll: true });
      el.setSelectionRange(newSelStart, newSelEnd);

      // Strictly restore scroll so editor never jumps or scrolls to the end
      el.scrollTop = prevScrollTop;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = prevScrollTop;
      }
    });
  }, [pushHistory, setDraftText, textareaRef, lineNumbersRef, lastTypingTimeoutRef]);

  // Wrap or insert a Brief sequence [<BRIEF>]...[</BRIEF>]
  const handleWrapBrief = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (lastTypingTimeoutRef.current) {
      clearTimeout(lastTypingTimeoutRef.current);
    }

    const prevScrollTop = textarea.scrollTop;
    const val = textarea.value;
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;

    const isFocused = document.activeElement === textarea;
    if (!isFocused && start === val.length && val.length > 0 && prevScrollTop === 0) {
      start = 0;
      end = 0;
    }

    const selected = val.substring(start, end);

    let replacement = '';
    let newSelStart = 0;
    let newSelEnd = 0;

    if (selected.trim().length > 0) {
      replacement = `[<BRIEF>]\n${selected}\n[</BRIEF>]`;
      newSelStart = start + `[<BRIEF>]\n`.length;
      newSelEnd = newSelStart + selected.length;
    } else {
      const snippet = `[<BRIEF>]\n[CAM 01] EWS, wide stage center, static axis -> \n[</BRIEF>]`;
      replacement = snippet;
      newSelStart = start + `[<BRIEF>]\n[CAM 01] EWS, wide stage center, static axis -> `.length;
      newSelEnd = newSelStart;
    }

    const before = val.substring(0, start);
    const after = val.substring(end);
    const newText = before + replacement + after;

    setDraftText(newText);
    pushHistory(newText, newSelStart, newSelEnd, prevScrollTop);

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.setSelectionRange(newSelStart, newSelEnd);
      el.scrollTop = prevScrollTop;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = prevScrollTop;
      }
    });
  }, [pushHistory, setDraftText, textareaRef, lineNumbersRef, lastTypingTimeoutRef]);

  // Custom Tag Prompt with auto-saving to customTags kit
  const handleCustomTagPrompt = useCallback(() => {
    const custom = window.prompt("Enter new tag name to wrap and save to toolbar (e.g. LIGHTING, AUDIO, MOOD):", "LIGHTING");
    if (custom && custom.trim()) {
      const cleaned = custom.trim().toUpperCase().replace(/[^A-Z0-9_\s]/g, '');
      if (cleaned) {
        saveCustomTag(cleaned);
        handleWrapSelection(cleaned);
      }
    }
  }, [saveCustomTag, handleWrapSelection]);

  return {
    customTags,
    saveCustomTag,
    removeCustomTag,
    handleWrapSelection,
    handleWrapBrief,
    handleCustomTagPrompt,
  };
}
