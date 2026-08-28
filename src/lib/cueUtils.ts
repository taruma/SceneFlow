import type { Cue, TimingSettings, AppState, AlternativeLocation } from '../types/script';
import { COLORS, DEFAULT_SETTINGS } from '../constants/script';
import { processScript } from './scriptProcessor';
import { generateId } from './utils';

/**
 * Sanitizes and deduplicates cue IDs to guarantee unique React keys and identifiers.
 */
export function sanitizeCues(cues: any[]): Cue[] {
  if (!Array.isArray(cues)) return [];
  const seenIds = new Set<string>();

  return cues.map((c, index) => {
    let id = c?.id ? String(c.id).trim() : '';
    if (!id || seenIds.has(id)) {
      id = id ? `${id}_dup_${index}_${generateId().slice(0, 6)}` : `cue_${index}_${generateId().slice(0, 6)}`;
    }
    seenIds.add(id);

    const cueType = c?.type || (c?.colorClass ? COLORS.find(col => col.class === c.colorClass)?.type : 'dialogue') || 'dialogue';
    const colorClass = c?.colorClass || COLORS.find(col => col.type === cueType)?.class || COLORS[0].class;

    return {
      ...c,
      id,
      type: cueType,
      colorClass
    };
  });
}

/**
 * Searches for text within the full script using exact match first,
 * then normalized whitespace/quotes regex matching, and finally case-insensitive search.
 */
export function findTextInScript(fullText: string, text: string): number {
  if (!text || !fullText) return -1;
  
  // Try exact match first
  let startIndex = fullText.indexOf(text);
  if (startIndex !== -1) return startIndex;
  
  // If not found, try matching with normalized whitespace and quotes
  const normalizedSearch = text.replace(/\s+/g, ' ').replace(/['’]/g, "'").trim();
  const normalizedFull = fullText.replace(/\s+/g, ' ').replace(/['’]/g, "'");
  const normIndex = normalizedFull.indexOf(normalizedSearch);
  
  if (normIndex !== -1) {
    // Fallback to regex search for more flexibility
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
    const regex = new RegExp(escaped, 'gi');
    const match = regex.exec(fullText);
    if (match) {
      return match.index;
    } else {
      // Last resort: case-insensitive search
      return fullText.toLowerCase().indexOf(text.toLowerCase().trim());
    }
  }
  
  return -1;
}

/**
 * Accurately extracts start/end character indexes within the full script
 * for a user's DOM mouse selection, using line-anchored metadata (`data-line-start`).
 * Falls back to `findTextInScript` if DOM elements cannot be resolved.
 */
export function getSelectionIndicesFromDOM(
  sel: Selection | null,
  scriptText: string
): { start: number; end: number; text: string } | null {
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const rawSelectedText = sel.toString();
  if (!rawSelectedText.trim()) return null;

  try {
    const range = sel.getRangeAt(0);
    
    // Helper to find the closest line container
    const findLineContainer = (node: Node | null): HTMLElement | null => {
      let curr: Node | null = node;
      if (curr && curr.nodeType === Node.TEXT_NODE) {
        curr = curr.parentElement;
      }
      if (curr && curr instanceof HTMLElement) {
        return curr.closest('[data-line-start]');
      }
      return null;
    };

    const startLineEl = findLineContainer(range.startContainer);
    
    if (startLineEl) {
      const lineStartAttr = startLineEl.getAttribute('data-line-start');
      if (lineStartAttr !== null) {
        const lineStart = parseInt(lineStartAttr, 10);
        
        // Measure offset inside startLineEl up to range.startContainer / range.startOffset
        const preStartRange = range.cloneRange();
        preStartRange.selectNodeContents(startLineEl);
        preStartRange.setEnd(range.startContainer, range.startOffset);
        const offsetInLine = preStartRange.toString().length;
        
        let start = lineStart + offsetInLine;
        let end = start + rawSelectedText.length;

        // Check if multi-line selection
        const endLineEl = findLineContainer(range.endContainer);
        if (endLineEl && endLineEl !== startLineEl) {
          const endLineStartAttr = endLineEl.getAttribute('data-line-start');
          if (endLineStartAttr !== null) {
            const endLineStart = parseInt(endLineStartAttr, 10);
            const preEndRange = range.cloneRange();
            preEndRange.selectNodeContents(endLineEl);
            preEndRange.setEnd(range.endContainer, range.endOffset);
            end = endLineStart + preEndRange.toString().length;
          }
        }

        // Direct slice validation against scriptText
        if (start >= 0 && end <= scriptText.length) {
          const directSlice = scriptText.substring(start, end);
          if (directSlice === rawSelectedText) {
            return { start, end, text: directSlice };
          }
        }

        // Search in a local window bounded by the surrounding line
        const windowStart = Math.max(0, start - 60);
        const windowEnd = Math.min(scriptText.length, end + 60);
        const localSnippet = scriptText.substring(windowStart, windowEnd);
        
        // Try exact match within local snippet
        const localIdx = localSnippet.indexOf(rawSelectedText);
        if (localIdx !== -1) {
          const resolvedStart = windowStart + localIdx;
          const resolvedEnd = resolvedStart + rawSelectedText.length;
          return {
            start: resolvedStart,
            end: resolvedEnd,
            text: scriptText.substring(resolvedStart, resolvedEnd)
          };
        }

        // Try regex match within local snippet for formatting tolerance
        const escaped = rawSelectedText.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        try {
          const reg = new RegExp(escaped, 'i');
          const m = reg.exec(localSnippet);
          if (m) {
            const resolvedStart = windowStart + m.index;
            const resolvedEnd = resolvedStart + m[0].length;
            return {
              start: resolvedStart,
              end: resolvedEnd,
              text: scriptText.substring(resolvedStart, resolvedEnd)
            };
          }
        } catch {
          // ignore regex errors
        }

        // If local snippet didn't match cleanly, return bounded start/end
        if (start >= 0 && start < scriptText.length) {
          return {
            start,
            end: Math.min(scriptText.length, start + rawSelectedText.length),
            text: scriptText.substring(start, Math.min(scriptText.length, start + rawSelectedText.length))
          };
        }
      }
    }
  } catch (err) {
    console.warn("DOM selection index extraction encountered error, falling back:", err);
  }

  // Graceful fallback to legacy findTextInScript
  const fallbackIndex = findTextInScript(scriptText, rawSelectedText);
  if (fallbackIndex !== -1) {
    return {
      start: fallbackIndex,
      end: fallbackIndex + rawSelectedText.length,
      text: scriptText.substring(fallbackIndex, fallbackIndex + rawSelectedText.length)
    };
  }

  return null;
}

/**
 * Finds alternative matching locations for a selected text across the script,
 * skipping any text located inside [[STAGING]] blocks.
 */
export function findAlternativeLocations(
  scriptText: string,
  searchText: string
): AlternativeLocation[] {
  if (!searchText || !scriptText) return [];
  
  const results: AlternativeLocation[] = [];
  const trimmedSearch = searchText.trim();
  if (!trimmedSearch) return [];

  // Get excluded ranges (STAGING blocks)
  const processedLinesForExclusion = processScript(scriptText);
  const excludedRanges = processedLinesForExclusion
    .filter(line => line.isStaging)
    .map(line => ({ start: line.lineStart, end: line.lineEnd }));

  const isExcluded = (start: number, end: number) => {
    return excludedRanges.some(range => 
      (start >= range.start && start < range.end) || 
      (end > range.start && end <= range.end) ||
      (range.start >= start && range.start < end)
    );
  };

  // Use same regex logic as realignCues
  const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexStr = escapedSearch.replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
  
  try {
    const regex = new RegExp(regexStr, 'gi');
    let m;
    while ((m = regex.exec(scriptText)) !== null) {
      const idx = m.index;
      const matchLen = m[0].length;
      
      // Skip if inside a staging block
      if (isExcluded(idx, idx + matchLen)) continue;

      // Get some context
      const startContext = Math.max(0, idx - 25);
      const endContext = Math.min(scriptText.length, idx + matchLen + 25);
      const context = scriptText.substring(startContext, endContext).replace(/\n/g, ' ');
      
      results.push({
        start: idx,
        end: idx + matchLen,
        context: (startContext > 0 ? '...' : '') + context + (endContext < scriptText.length ? '...' : '')
      });
      
      if (results.length > 40) break; // Limit matches
    }
    
    // If no matches found with full text, try the "short match" approach from align
    if (results.length === 0) {
      const shortSearch = trimmedSearch.substring(0, 15).trim();
      if (shortSearch.length >= 5) {
        const shortEscaped = shortSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
        const shortRegex = new RegExp(shortEscaped, 'gi');
        
        let sm;
        while ((sm = shortRegex.exec(scriptText)) !== null) {
          const idx = sm.index;
          
          // Skip if inside a staging block
          if (isExcluded(idx, idx + shortSearch.length)) continue;

          const startContext = Math.max(0, idx - 25);
          const endContext = Math.min(scriptText.length, idx + trimmedSearch.length + 25);
          const context = scriptText.substring(startContext, endContext).replace(/\n/g, ' ');
          
          results.push({
            start: idx,
            end: idx + trimmedSearch.length, // Approximate based on original text length
            context: (startContext > 0 ? '...' : '') + context + (endContext < scriptText.length ? '...' : '')
          });
          if (results.length > 40) break;
        }
      }
    }
  } catch (e) {
    console.error("Regex error in findAlternativeLocations:", e);
  }
  
  return results;
}

/**
 * Realigns cue start and end character indexes against updated script text,
 * chronologically sorted, skipping [[STAGING]] blocks.
 */
export function realignCuesList(
  cues: Cue[],
  scriptText: string
): { updatedCues: Cue[]; alignedCount: number } {
  if (!cues || cues.length === 0 || !scriptText) {
    return { updatedCues: cues || [], alignedCount: 0 };
  }

  // Pre-calculate excluded ranges (STAGING blocks)
  const processedLinesForExclusion = processScript(scriptText);
  const excludedRanges = processedLinesForExclusion
    .filter(line => line.isStaging)
    .map(line => ({ start: line.lineStart, end: line.lineEnd }));

  const isExcluded = (start: number, end: number) => {
    return excludedRanges.some(range => 
      (start >= range.start && start < range.end) || 
      (end > range.start && end <= range.end) ||
      (range.start >= start && range.start < end)
    );
  };

  let lastIndex = 0;
  let alignedCount = 0;
  
  // Sort cues by startTime before aligning to ensure sequential search works correctly
  const sortedCues = [...cues].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
  
  const updatedCues = sortedCues.map(cue => {
    const searchText = cue.selectedText.trim();
    if (!searchText) return cue;

    // Escape special characters for regex
    const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexStr = escapedSearch.replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
    
    try {
      const regex = new RegExp(regexStr, 'gi');
      const matches: { index: number, length: number }[] = [];
      let m;
      while ((m = regex.exec(scriptText)) !== null) {
        if (!isExcluded(m.index, m.index + m[0].length)) {
          matches.push({ index: m.index, length: m[0].length });
        }
      }

      if (matches.length > 0) {
        // Reference point: prefer existing index if valid, otherwise use lastIndex
        const referenceIndex = (cue.startIndex !== undefined && cue.startIndex >= 0) ? cue.startIndex : lastIndex;
        
        // Find the match closest to our reference point
        const bestMatch = matches.reduce((prev, curr) => {
          return Math.abs(curr.index - referenceIndex) < Math.abs(prev.index - referenceIndex) ? curr : prev;
        });

        const newStart = bestMatch.index;
        const newEnd = newStart + bestMatch.length;
        lastIndex = newEnd;
        alignedCount++;
        return { ...cue, startIndex: newStart, endIndex: newEnd };
      }
      
      // Last resort: try matching just the first 15 characters if the full text is not found
      const shortSearch = searchText.substring(0, 15).trim();
      if (shortSearch.length >= 5) {
        const shortEscaped = shortSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
        const shortRegex = new RegExp(shortEscaped, 'gi');
        
        const shortMatches: { index: number, length: number }[] = [];
        let sm;
        while ((sm = shortRegex.exec(scriptText)) !== null) {
          if (!isExcluded(sm.index, sm.index + sm[0].length)) {
            shortMatches.push({ index: sm.index, length: sm[0].length });
          }
        }

        if (shortMatches.length > 0) {
          const referenceIndex = (cue.startIndex !== undefined && cue.startIndex >= 0) ? cue.startIndex : lastIndex;
          const bestShortMatch = shortMatches.reduce((prev, curr) => {
            return Math.abs(curr.index - referenceIndex) < Math.abs(prev.index - referenceIndex) ? curr : prev;
          });

          const newStart = bestShortMatch.index;
          const newEnd = newStart + searchText.length; // Approximate
          lastIndex = newEnd;
          alignedCount++;
          return { ...cue, startIndex: newStart, endIndex: newEnd };
        }
      }
    } catch (e) {
      console.error("Regex error during alignment:", e);
    }

    console.warn(`Could not align cue: "${searchText}"`);
    return cue;
  });

  return { updatedCues, alignedCount };
}

/**
 * Calculates timing offsets for a cue type including general offsets.
 */
export function getCueTimingOffsets(
  cueType: string | undefined,
  settings?: Record<string, TimingSettings>
): { totalBefore: number; totalAfter: number } {
  const typeSettings = settings?.[cueType || ''] || DEFAULT_SETTINGS.general;
  const generalSettings = settings?.['general'] || DEFAULT_SETTINGS.general;
  return {
    totalBefore: (typeSettings.before || 0) + (generalSettings.before || 0),
    totalAfter: (typeSettings.after || 0) + (generalSettings.after || 0)
  };
}

/**
 * Determines if a cue is currently active based on playback time and timing offsets.
 */
export function isCueActive(
  cue: Cue,
  currentTime: number,
  settings?: Record<string, TimingSettings>
): boolean {
  const { totalBefore, totalAfter } = getCueTimingOffsets(cue.type, settings);
  return currentTime >= cue.startTime - totalBefore && currentTime <= cue.endTime + totalAfter;
}

/**
 * Calculates the opacity of a cue during playback with fade-in / fade-out offsets.
 */
export function calculateCuePlaybackOpacity(
  cue: Cue,
  currentTime: number,
  settings?: Record<string, TimingSettings>
): number {
  const { totalBefore, totalAfter } = getCueTimingOffsets(cue.type, settings);
  if (currentTime < cue.startTime) {
    return totalBefore > 0 ? Math.max(0, Math.min(1, (currentTime - (cue.startTime - totalBefore)) / totalBefore)) : 1;
  } else if (currentTime > cue.endTime) {
    return totalAfter > 0 ? Math.max(0, Math.min(1, 1 - (currentTime - cue.endTime) / totalAfter)) : 1;
  }
  return 1;
}

/**
 * Downloads application state as a JSON file.
 */
export function exportStateToJsonFile(state: AppState, fileName: string = 'screenplay_sync.json'): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/**
 * Validates and normalizes imported JSON data to ensure it conforms to AppState.
 */
export function validateImportedScriptJson(json: any): AppState {
  return {
    youtubeId: json.youtubeId || 'dQw4w9WgXcQ',
    scriptText: json.scriptText || '',
    cues: sanitizeCues(json.cues),
    settings: json.settings || DEFAULT_SETTINGS,
  };
}
