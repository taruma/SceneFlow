import React, { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { 
  FileText, 
  X, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Trash2, 
  Wand2, 
  CheckCircle2,
  Bookmark,
  Plus,
  Undo2,
  Redo2,
  ListTree,
  TextWrap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { cn } from '../lib/utils';

interface RawScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  onSaveScript?: (newScriptText: string, shouldRealign?: boolean) => void;
  onChangeScriptText?: (text: string) => void;
  activeCuesCount?: number;
}

interface HistoryEntry {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  scrollTop: number;
}

export interface TocItem {
  id: string;
  title: string;
  type: 'scene' | 'part' | 'staging' | 'directive' | 'brief' | 'heading';
  level: number;       // 0 for top-level root, 1 for sub-level, 2 for nested, etc.
  parentId?: string;   // parent section id if nested under a collapsible group
  rank: number;        // hierarchy rank: 1=Part/Major Section, 2=Scene, 3=Staging/Brief, 4=Inner Directive
  lineIdx: number;     // 0-based line number
  charOffset: number;  // character offset from start of script
  length: number;      // line length
}

const CORE_DIRECTIVE_PRESETS = ['INTENT', 'LOGIC', 'AESTHETIC', 'OPENING'] as const;


export function RawScriptModal({
  isOpen,
  onClose,
  scriptText,
  onSaveScript,
  onChangeScriptText,
  activeCuesCount = 0,
}: RawScriptModalProps) {
  const [draftText, setDraftText] = useState(scriptText);
  const [autoRealign, setAutoRealign] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Table of contents visibility & active item
  const [showToc, setShowToc] = useState(true);
  const [activeTocId, setActiveTocId] = useState<string | null>(null);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

  // Undo / Redo history state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const lastTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Word wrap (soft wrap) state
  const [wordWrap, setWordWrap] = useState(false);
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  const [mirrorWidth, setMirrorWidth] = useState<number>(0);
  const mirrorRef = useRef<HTMLDivElement>(null);

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draftText and initialize history whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const initialText = scriptText || '';
      setDraftText(initialText);
      setHistory([{
        text: initialText,
        selectionStart: 0,
        selectionEnd: 0,
        scrollTop: 0,
      }]);
      setHistoryIndex(0);
      setActiveTocId(null);
    }
  }, [isOpen, scriptText]);

  const isDirty = draftText !== (scriptText || '');

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
  }, [historyIndex]);

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
  }, [historyIndex, history]);

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
  }, [historyIndex, history]);

  // Handle typing inside textarea with debounced history capture
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  };

  // Keyboard shortcut listener for Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, and Alt+Z (Word Wrap)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    // Alt+Z toggles Word Wrap (standard in VS Code and code editors)
    if (e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      setWordWrap(prev => !prev);
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
  };

  // Synchronize scroll between textarea and line numbers column
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

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
    if (children.length === 0) return;
    const heights: number[] = new Array(children.length);
    for (let i = 0; i < children.length; i++) {
      heights[i] = (children[i] as HTMLElement).getBoundingClientRect().height || 19.2;
    }
    setLineHeights(heights);
  }, [wordWrap]);

  useLayoutEffect(() => {
    if (!wordWrap) {
      setLineHeights([]);
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const contentWidth = Math.max(0, textarea.clientWidth - 28);
    setMirrorWidth(contentWidth);

    // Measure immediately after DOM layout
    measureLineHeights();
  }, [wordWrap, draftText, mirrorWidth, measureLineHeights]);

  // Keep mirror width and heights synced on window resize
  useEffect(() => {
    if (!wordWrap) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const ro = new ResizeObserver(() => {
      const contentWidth = Math.max(0, textarea.clientWidth - 28);
      setMirrorWidth(contentWidth);
      measureLineHeights();
    });
    ro.observe(textarea);

    return () => ro.disconnect();
  }, [wordWrap, measureLineHeights]);

  // Parse Table of Contents / Outline Sections
  const tocItems = useMemo<TocItem[]>(() => {
    if (!draftText) return [];
    const items: TocItem[] = [];
    const lines = draftText.split('\n');
    let currentPos = 0;
    let insideStaging = false;

    // Stack to track open parent sections: { id, rank }
    const stack: { id: string; rank: number }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineLength = line.length;

      if (trimmed.length > 0) {
        // Track closing staging/brief container tags
        if (/^\[\[\/([A-Z0-9_\s]+)\]\]$/i.test(trimmed)) {
          const closeTag = trimmed.match(/^\[\[\/([A-Z0-9_\s]+)\]\]$/i)?.[1]?.toUpperCase();
          if (closeTag === 'STAGING') {
            insideStaging = false;
            // Pop staging and any inner items from stack
            while (stack.length > 0 && stack[stack.length - 1].rank >= 3) {
              stack.pop();
            }
          }
        } else if (/^\[<\/(BRIEF)>\]$/i.test(trimmed)) {
          while (stack.length > 0 && stack[stack.length - 1].rank >= 3) {
            stack.pop();
          }
        } else {
          let itemTitle: string | null = null;
          let itemType: TocItem['type'] = 'heading';
          let itemRank = 3;

          // 1. Roman Numeral / Part / Chapter / Act Titles (Rank 1 - Major Sections)
          const isRomanNumeral = /^([IVXLCDM]+\.\s+.*)$/i.test(trimmed);
          const isPart = /^(PART\s+([0-9]+|[IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|[A-Z])(\s*[-:—–].*|\s+.*)?)$/i.test(trimmed) ||
                         (trimmed.length <= 40 && trimmed.toUpperCase() === trimmed && /^PART\s+/i.test(trimmed));
          const isAct = /^(ACT\s+([0-9]+|[IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|[A-Z])(\s*[-:—–].*|\s+.*)?)$/i.test(trimmed);
          const isChapter = /^(CHAPTER\s+([0-9]+|[IVXLCDM]+|ONE|TWO|THREE|FOUR|FIVE|[A-Z])(\s*[-:—–].*|\s+.*)?)$/i.test(trimmed);
          const isPrologueOrEpilogue = /^(PROLOGUE|EPILOGUE)(\s*[-:—–].*|\s+.*)?$/i.test(trimmed);
          const isMarkdownH1 = /^#\s+(.*)$/.test(trimmed);

          if (isRomanNumeral || isPart || isAct || isChapter || isPrologueOrEpilogue) {
            insideStaging = false;
            itemTitle = trimmed;
            itemType = 'part';
            itemRank = 1;
          } else if (isMarkdownH1) {
            itemTitle = trimmed.replace(/^#\s+/, '');
            itemType = 'heading';
            itemRank = 1;
          }
          // 2. Scene Headings (Rank 2)
          else if (/^(INT\.|EXT\.|INT\/EXT\.|EXT\/INT\.|I\/E\.)/i.test(trimmed)) {
            insideStaging = false;
            itemTitle = trimmed;
            itemType = 'scene';
            itemRank = 2;
          } else if (/^##\s+(.*)$/.test(trimmed)) {
            itemTitle = trimmed.replace(/^##\s+/, '');
            itemType = 'heading';
            itemRank = 2;
          }
          // 3. Markdown H3 (Rank 3)
          else if (/^###\s+(.*)$/.test(trimmed)) {
            itemTitle = trimmed.replace(/^###\s+/, '');
            itemType = 'heading';
            itemRank = 3;
          }
          // 4. Brief Sequences (Rank 3)
          else if (/^\[<BRIEF>\]$/i.test(trimmed) || /^\[<BRIEF>\s*(.*)\]$/i.test(trimmed)) {
            itemTitle = '[<BRIEF>] Sequence';
            itemType = 'brief';
            itemRank = 3;
          }
          // 5. Staging Blocks & Directives (Rank 3 or 4)
          else if (/^\[\[([A-Z0-9_\s]+)\]\]$/i.test(trimmed) && !trimmed.startsWith('[[/')) {
            const tagMatch = trimmed.match(/^\[\[([A-Z0-9_\s]+)\]\]$/i);
            const tagName = tagMatch ? tagMatch[1].toUpperCase() : 'TAG';
            
            if (tagName === 'STAGING') {
              insideStaging = true;
              itemTitle = '[[STAGING]]';
              itemType = 'staging';
              itemRank = 3;
            } else {
              itemTitle = tagName;
              itemType = 'directive';
              itemRank = insideStaging ? 4 : 3;
            }
          }

          // If a section/item was matched, calculate parentage via stack
          if (itemTitle) {
            // Pop stack items that are at the same or deeper rank
            while (stack.length > 0 && stack[stack.length - 1].rank >= itemRank) {
              stack.pop();
            }

            const parentId = stack.length > 0 ? stack[stack.length - 1].id : undefined;
            const level = stack.length;

            const newItem: TocItem = {
              id: `toc_${i}_${currentPos}`,
              title: itemTitle,
              type: itemType,
              rank: itemRank,
              level,
              parentId,
              lineIdx: i,
              charOffset: currentPos,
              length: lineLength,
            };

            items.push(newItem);

            // Push to stack if this item can be a parent group (rank < 4)
            if (itemRank < 4) {
              stack.push({ id: newItem.id, rank: itemRank });
            }
          }
        }
      }

      currentPos += lineLength + 1; // +1 for '\n'
    }

    return items;
  }, [draftText]);

  // Lookup map: item id -> parent id
  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of tocItems) {
      if (item.parentId) {
        map.set(item.id, item.parentId);
      }
    }
    return map;
  }, [tocItems]);

  // Lookup map: parent id -> total descendants count
  const descendantCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of tocItems) {
      let currParent = parentMap.get(item.id);
      while (currParent) {
        counts.set(currParent, (counts.get(currParent) || 0) + 1);
        currParent = parentMap.get(currParent);
      }
    }
    return counts;
  }, [tocItems, parentMap]);

  // List of all items that can be collapsed (items that have children)
  const collapsibleItemIds = useMemo(() => {
    return tocItems
      .filter(item => (descendantCountMap.get(item.id) || 0) > 0)
      .map(item => item.id);
  }, [tocItems, descendantCountMap]);

  // Check if all collapsible sections are currently collapsed
  const areAllCollapsed = useMemo(() => {
    if (collapsibleItemIds.length === 0) return false;
    return collapsibleItemIds.every(id => collapsedSectionIds.has(id));
  }, [collapsibleItemIds, collapsedSectionIds]);

  // Toggle collapse for an individual section
  const toggleSectionCollapse = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCollapsedSectionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Collapse or expand all sections at once
  const toggleCollapseAll = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (areAllCollapsed) {
      setCollapsedSectionIds(new Set());
    } else {
      setCollapsedSectionIds(new Set(collapsibleItemIds));
    }
  }, [areAllCollapsed, collapsibleItemIds]);

  // Filter TOC items by visibility (omitting children of collapsed sections)
  const visibleTocItems = useMemo(() => {
    if (collapsedSectionIds.size === 0) return tocItems;
    return tocItems.filter(item => {
      let currParent = parentMap.get(item.id);
      while (currParent) {
        if (collapsedSectionIds.has(currParent)) {
          return false;
        }
        currParent = parentMap.get(currParent);
      }
      return true;
    });
  }, [tocItems, collapsedSectionIds, parentMap]);

  // Navigate directly to a TOC Section
  const handleNavigateToSection = useCallback((item: TocItem) => {
    setActiveTocId(item.id);

    // If clicking a collapsed section, expand it so its contents are revealed
    if (collapsedSectionIds.has(item.id)) {
      setCollapsedSectionIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    let targetScrollTop = 0;

    if (wordWrap && lineHeights.length > 0) {
      // In Word Wrap mode, calculate exact accumulated pixel height of all preceding lines
      let accumulatedHeight = 0;
      for (let k = 0; k < item.lineIdx && k < lineHeights.length; k++) {
        accumulatedHeight += lineHeights[k] || 19.2;
      }
      // Offset by 2 lines (~38.4px) for comfortable breathing room from top
      targetScrollTop = Math.max(0, accumulatedHeight - 38.4);
    } else {
      // In unwrapped mode, each line has fixed 19.2px line height
      targetScrollTop = Math.max(0, (item.lineIdx - 2) * 19.2);
    }

    textarea.scrollTop = targetScrollTop;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = targetScrollTop;
    }

    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(item.charOffset, item.charOffset + item.length);
  }, [wordWrap, lineHeights, collapsedSectionIds]);

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
  }, [pushHistory]);

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
  }, [pushHistory]);

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

  // File Import Logic
  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setDraftText(text);
        pushHistory(text, 0, 0, 0);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    e.target.value = '';
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  };

  // Export File (.txt with timestamp and 4-digit identifier)
  const handleExport = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const identifier = Math.floor(1000 + Math.random() * 9000);
    const filename = `script_${timestamp}_${identifier}.txt`;

    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(draftText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  // Format / Clean Whitespace
  const handleCleanFormat = () => {
    const prevScrollTop = textareaRef.current?.scrollTop ?? 0;
    const cleaned = draftText
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    setDraftText(cleaned);
    pushHistory(cleaned, 0, 0, prevScrollTop);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = prevScrollTop;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = prevScrollTop;
      }
    });
  };

  // Clear Editor (revertible via Revert Draft or Undo)
  const handleClear = () => {
    setDraftText('');
    pushHistory('', 0, 0, 0);
  };

  // Reset to Saved Script
  const handleReset = () => {
    const saved = scriptText || '';
    setDraftText(saved);
    pushHistory(saved, 0, 0, 0);
  };

  // Close & Discard Draft
  const handleClose = useCallback(() => {
    setDraftText(scriptText || '');
    onClose();
  }, [scriptText, onClose]);

  useEscapeKey(handleClose, isOpen);

  // Apply Changes
  const handleApply = () => {
    if (onSaveScript) {
      onSaveScript(draftText, autoRealign);
    } else if (onChangeScriptText) {
      onChangeScriptText(draftText);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={UI_TOKENS.modal.overlayHeavy}>
      <div className="bg-surface w-[96vw] max-w-6xl h-[90vh] md:h-[92vh] rounded-[1.75rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border-main text-text-main flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-text-main">
                  Source Script
                </h2>
                {isDirty && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Unsaved Draft
                  </span>
                )}
              </div>
              <p className="text-[9px] font-bold text-text-faint uppercase tracking-wider">
                Quick Edit & Staging Markup
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            title="Close modal (Esc)"
            className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Outline Toggle, Wrap Tags, Undo/Redo & File Actions */}
        <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between gap-2 shrink-0 flex-wrap bg-surface text-xs">
          
          {/* Left Group: Outline Toggle & Wrap in Staging Labels */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Outline / TOC Toggle Button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowToc(prev => !prev)}
              title={showToc ? "Hide Outline" : "Show Outline"}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xs active:scale-95 mr-0.5",
                showToc
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-black"
                  : "bg-surface-muted hover:bg-surface-hover text-text-muted hover:text-text-main border-border-subtle"
              )}
            >
              <ListTree size={12} className={showToc ? "text-purple-600 dark:text-purple-400" : "text-text-faint"} />
              <span>Outline</span>
              {tocItems.length > 0 && (
                <span className="ml-0.5 text-[8.5px] px-1 py-0.2 rounded bg-surface border border-border-subtle text-text-faint font-mono">
                  {tocItems.length}
                </span>
              )}
            </button>

            {/* Word Wrap Toggle Button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setWordWrap(prev => !prev)}
              title={wordWrap ? "Disable Word Wrap (Alt+Z)" : "Enable Word Wrap (Alt+Z)"}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xs active:scale-95 mr-1",
                wordWrap
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-black"
                  : "bg-surface-muted hover:bg-surface-hover text-text-muted hover:text-text-main border-border-subtle"
              )}
            >
              <TextWrap size={12} className={wordWrap ? "text-purple-600 dark:text-purple-400" : "text-text-faint"} />
              <span>Wrap</span>
            </button>

            <div className="w-px h-3.5 bg-border-subtle mx-0.5 hidden sm:block" />

            {/* Staging & Brief Containers */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleWrapSelection('STAGING')}
              title="Wrap selected text in [[STAGING]]...[[/STAGING]] container"
              className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-mono font-bold transition-all shadow-2xs active:scale-95"
            >
              [[STAGING]]
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleWrapBrief}
              title="Wrap selection in [<BRIEF>]...[</BRIEF>] or insert brief sequence template"
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-mono font-bold transition-all shadow-2xs active:scale-95"
            >
              [&lt;BRIEF&gt;]
            </button>

            <div className="w-px h-3.5 bg-border-subtle mx-0.5 hidden sm:block" />

            <span className="text-[9px] font-black uppercase tracking-widest text-text-faint flex items-center gap-1 mr-0.5">
              <Bookmark size={10} className="text-purple-500" />
              Tags:
            </span>

            {/* Core Directives */}
            {CORE_DIRECTIVE_PRESETS.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleWrapSelection(tag)}
                title={`Wrap selected text in [[${tag}]]...[[/${tag}]]`}
                className="px-2 py-1 bg-surface-muted hover:bg-surface-hover hover:border-purple-500/40 text-text-body hover:text-purple-600 dark:hover:text-purple-400 rounded-lg text-[10px] font-mono font-bold transition-all border border-border-subtle shadow-2xs active:scale-95"
              >
                [[{tag}]]
              </button>
            ))}

            {/* User-Stored Custom Tags */}
            {customTags.map((tag) => (
              <div key={tag} className="group/tag inline-flex items-center">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleWrapSelection(tag)}
                  title={`Wrap selection in [[${tag}]]...[[/${tag}]]`}
                  className="px-2 py-1 bg-surface-muted hover:bg-surface-hover hover:border-purple-500/40 text-text-body hover:text-purple-600 dark:hover:text-purple-400 rounded-l-lg text-[10px] font-mono font-bold transition-all border-y border-l border-border-subtle shadow-2xs active:scale-95"
                >
                  [[{tag}]]
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomTag(tag);
                  }}
                  title={`Remove [[${tag}]] from your saved tags`}
                  className="px-1 py-1 bg-surface-muted hover:bg-red-500/15 text-text-faint hover:text-red-500 border border-border-subtle border-l-0 rounded-r-lg transition-colors text-[9px]"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {/* Add Custom Tag Button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCustomTagPrompt}
              title="Add a custom tag and save it to your toolbar"
              className="flex items-center gap-1 px-2 py-1 bg-surface-muted hover:bg-surface-hover text-text-muted hover:text-text-main rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-border-subtle shadow-2xs active:scale-95"
            >
              <Plus size={10} />
              <span>Tag...</span>
            </button>
          </div>

          {/* Right Group: Undo/Redo, Import, Export, Copy & Cleanup */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover disabled:opacity-25 disabled:pointer-events-none rounded-lg transition-colors"
            >
              <Undo2 size={14} />
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
              className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover disabled:opacity-25 disabled:pointer-events-none rounded-lg transition-colors"
            >
              <Redo2 size={14} />
            </button>

            <div className="w-px h-3.5 bg-border-subtle mx-1" />

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".fountain,.txt,.md,.fdx"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import script text from file"
              className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Upload size={14} />
            </button>

            <button
              type="button"
              onClick={handleExport}
              title="Download script (.txt)"
              className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Download size={14} />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy script to clipboard"
              className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>

            <button
              type="button"
              onClick={handleCleanFormat}
              title="Clean trailing whitespace and blank lines"
              className="p-1.5 text-text-faint hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
            >
              <Wand2 size={14} />
            </button>

            <button
              type="button"
              onClick={handleClear}
              title="Clear editor"
              className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Modal Workstation: Table of Contents Sidebar + Script Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden divide-x divide-border-subtle">
          
          {/* Left Column: Table of Contents / Outline */}
          {/* Left Column: Outline Sidebar */}
          {showToc && (
            <div className="w-56 sm:w-60 md:w-64 bg-surface-subtle/30 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-left-2 duration-200">
              
              {/* Outline Header */}
              <div className="px-3 py-2 border-b border-border-subtle bg-surface-subtle/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <ListTree size={12} className="text-purple-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-main">
                    Outline
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {collapsibleItemIds.length > 0 && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={toggleCollapseAll}
                      title={areAllCollapsed ? "Expand all sections" : "Collapse all sections"}
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium text-text-muted hover:text-text-main hover:bg-surface-hover/80 transition-colors border border-border-subtle/60 bg-surface/50"
                    >
                      {areAllCollapsed ? "Expand All" : "Collapse All"}
                    </button>
                  )}
                  <span className="text-[9px] font-mono text-text-faint px-1.5 py-0.2 rounded-full bg-surface border border-border-subtle/60">
                    {tocItems.length}
                  </span>
                </div>
              </div>

              {/* Outline Items Tree */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                {visibleTocItems.length > 0 ? (
                  visibleTocItems.map((item) => {
                    const isActive = activeTocId === item.id;
                    const descendantCount = descendantCountMap.get(item.id) || 0;
                    const hasChildren = descendantCount > 0;
                    const isCollapsed = collapsedSectionIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onMouseDown={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNavigateToSection(item);
                          }
                        }}
                        onClick={() => handleNavigateToSection(item)}
                        title={`Jump to line ${item.lineIdx + 1}: ${item.title}`}
                        className={cn(
                          "group w-full text-left rounded-md transition-colors flex items-center justify-between gap-1.5 select-none cursor-pointer",
                          item.level === 0 ? "py-1 pl-1.5 pr-2 mt-1.5 first:mt-0 font-bold" : 
                          item.level === 1 ? "py-1 pl-4 pr-2 font-semibold" : 
                          item.level === 2 ? "py-0.5 pl-6 pr-2 font-medium" : 
                          "py-0.5 pl-8 pr-2 font-normal",
                          isActive
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold ring-1 ring-inset ring-purple-500/25"
                            : "hover:bg-surface-hover/80 text-text-body hover:text-text-main"
                        )}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {/* Collapsible Chevron Button or Placeholder */}
                          {hasChildren ? (
                            <button
                              type="button"
                              aria-label={isCollapsed ? `Expand ${item.title}` : `Collapse ${item.title}`}
                              onClick={(e) => toggleSectionCollapse(item.id, e)}
                              className="w-4 h-4 flex items-center justify-center -ml-0.5 rounded text-text-faint hover:text-text-main hover:bg-surface-hover transition-colors shrink-0"
                            >
                              {isCollapsed ? (
                                <ChevronRight size={11} className="text-text-muted transition-transform" />
                              ) : (
                                <ChevronDown size={11} className="text-text-muted transition-transform" />
                              )}
                            </button>
                          ) : (
                            <span className="w-3.5 shrink-0" />
                          )}

                          {/* Dot / bullet indicator based on type & level */}
                          {item.type === 'part' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          )}
                          {item.type === 'scene' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          {item.type === 'heading' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          )}
                          {item.type === 'staging' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          )}
                          {item.type === 'brief' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          )}
                          {item.type === 'directive' && (
                            <span className="w-1 h-1 rounded-full bg-text-faint/50 group-hover:bg-purple-400 shrink-0" />
                          )}

                          {/* Title */}
                          <span className={cn(
                            "truncate",
                            item.level === 0 && "text-[11px] text-text-main",
                            item.level === 1 && "text-[10.5px]",
                            item.level === 2 && "text-[10px]",
                            item.level >= 3 && "text-[9.5px] text-text-muted group-hover:text-text-main tracking-wide"
                          )}>
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Collapsed Badge Indicator */}
                          {isCollapsed && hasChildren && (
                            <span 
                              className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-surface border border-border-subtle text-text-faint group-hover:text-purple-500 transition-colors"
                              title={`${descendantCount} nested ${descendantCount === 1 ? 'item' : 'items'} hidden`}
                            >
                              +{descendantCount}
                            </span>
                          )}

                          {/* Line number */}
                          <span className="text-[9px] font-mono text-text-faint/60 group-hover:text-text-muted tabular-nums">
                            L{item.lineIdx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center space-y-1.5 text-text-faint">
                    <p className="text-[11px] font-bold text-text-muted">No sections found</p>
                    <p className="text-[9.5px] leading-relaxed">
                      Sections like <code className="font-mono text-purple-500">I. PART</code>, <code className="font-mono text-purple-500">INT./EXT.</code>, or <code className="font-mono text-purple-500">[[STAGING]]</code> will appear here.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Right Column: Script Editor Canvas with Line Numbers */}
          <div 
            className={cn(
              "flex-1 relative flex min-h-0 bg-surface-subtle/30 overflow-hidden transition-colors",
              isDragging && "bg-purple-500/5 ring-2 ring-inset ring-purple-500/40"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay indicator */}
            {isDragging && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/90 backdrop-blur-xs pointer-events-none">
                <div className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-purple-500 text-purple-600">
                  <Upload size={32} className="animate-bounce" />
                  <span className="text-xs font-black uppercase tracking-wider">Drop script file here</span>
                </div>
              </div>
            )}

            {/* Line Numbers Gutter */}
            <div 
              ref={lineNumbersRef}
              aria-hidden="true"
              className={cn(
                "w-10 sm:w-11 bg-surface-muted/40 border-r border-border-subtle/60 py-3.5 pr-2 pl-1.5 text-right select-none font-mono text-[11px] sm:text-xs leading-[19.2px] text-text-faint/50 overflow-hidden shrink-0 pointer-events-none",
                !wordWrap && "whitespace-pre"
              )}
            >
              {wordWrap ? (
                lines.map((_, i) => (
                  <div 
                    key={i} 
                    style={{ height: `${(lineHeights[i] && lineHeights[i] > 0) ? lineHeights[i] : 19.2}px` }}
                    className="leading-[19.2px]"
                  >
                    {i + 1}
                  </div>
                ))
              ) : (
                lineNumbersText
              )}
            </div>

            {/* Hidden mirror element for measuring wrapped line heights */}
            {wordWrap && (
              <div
                ref={mirrorRef}
                aria-hidden="true"
                className="absolute pointer-events-none invisible overflow-hidden font-mono text-[11px] sm:text-xs leading-[19.2px] whitespace-pre-wrap break-words"
                style={{
                  width: mirrorWidth > 0 ? `${mirrorWidth}px` : (textareaRef.current ? `${Math.max(0, textareaRef.current.clientWidth - 28)}px` : '100%'),
                  top: 0,
                  left: 0,
                }}
              >
                {lines.map((line, idx) => (
                  <div key={idx}>{line || '\u00A0'}</div>
                ))}
              </div>
            )}

            {/* Textarea Editor */}
            <textarea
              ref={textareaRef}
              value={draftText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder="Write, paste, or drop your script/brief here. Select text to wrap in [[STAGING]] or [[INTENT]] tags..."
              className={cn(
                "flex-1 w-full h-full p-3.5 bg-transparent border-0 font-mono text-[11px] sm:text-xs leading-[19.2px] text-text-main placeholder-text-placeholder focus:outline-none resize-none custom-scrollbar",
                wordWrap
                  ? "whitespace-pre-wrap break-words overflow-x-hidden"
                  : "whitespace-pre overflow-x-auto"
              )}
              spellCheck={false}
            />
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <div className="px-4 py-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                title="Revert draft back to original saved script"
                className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-faint hover:text-text-main transition-colors active:scale-95"
              >
                <RotateCcw size={11} />
                <span>Revert Draft</span>
              </button>
            )}
            <span className="text-[10px] font-mono text-text-faint flex items-center gap-1.5">
              <span>{lineCount} lines</span>
              <span>·</span>
              <span>{draftText.length.toLocaleString()} chars</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setWordWrap(prev => !prev)}
                title="Toggle Word Wrap (Alt+Z)"
                className="hover:text-text-main transition-colors underline-offset-2 hover:underline"
              >
                {wordWrap ? 'Wrap ON' : 'Wrap OFF'}
              </button>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {activeCuesCount > 0 && (
              <label className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-text-muted cursor-pointer select-none hover:text-text-main transition-colors">
                <input 
                  type="checkbox"
                  checked={autoRealign}
                  onChange={(e) => setAutoRealign(e.target.checked)}
                  className="rounded border-border-main text-purple-600 focus:ring-purple-500 w-3 h-3"
                />
                <span>Auto-realign {activeCuesCount} cues</span>
              </label>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-body hover:text-text-main rounded-xl text-xs font-bold transition-all border border-border-main active:scale-95"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-2",
                isDirty
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                  : "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover shadow-surface-dark/10"
              )}
            >
              <CheckCircle2 size={14} />
              <span>
                {activeCuesCount > 0 && autoRealign
                  ? `Apply & Realign Cues (${activeCuesCount})`
                  : "Apply Changes"}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
