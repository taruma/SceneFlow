import React, { useState, useMemo, useCallback } from 'react';
import { TocItem } from '../types';

interface UseScriptOutlineOptions {
  draftText: string;
  wordWrap: boolean;
  lineHeights: number[];
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
}

export function useScriptOutline({
  draftText,
  wordWrap,
  lineHeights,
  textareaRef,
  lineNumbersRef,
}: UseScriptOutlineOptions) {
  const [showToc, setShowToc] = useState(true);
  const [activeTocId, setActiveTocId] = useState<string | null>(null);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(new Set());

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
  }, [wordWrap, lineHeights, collapsedSectionIds, textareaRef, lineNumbersRef]);

  return {
    showToc,
    setShowToc,
    activeTocId,
    setActiveTocId,
    collapsedSectionIds,
    setCollapsedSectionIds,
    tocItems,
    visibleTocItems,
    descendantCountMap,
    collapsibleItemIds,
    areAllCollapsed,
    toggleSectionCollapse,
    toggleCollapseAll,
    handleNavigateToSection,
  };
}
