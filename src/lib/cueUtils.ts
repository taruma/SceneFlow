import type { Cue, TimingSettings, AppState, AlternativeLocation } from '../types/script';
import { COLORS, DEFAULT_SETTINGS } from '../constants/script';
import { LEGACY_CLASS_MAP } from '../styles/tokens/cues';
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

    const cueType = c?.type || (c?.colorClass ? (LEGACY_CLASS_MAP[c.colorClass] || COLORS.find(col => col.class === c.colorClass)?.type) : 'dialogue') || 'dialogue';

    // Strip legacy colorClass so cues are modern and don't retain deprecated styling classes
    const { colorClass: _legacyColorClass, ...rest } = c || {};

    return {
      ...rest,
      id,
      type: cueType,
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
    // Strip legacy colorClass so realigned cues remain clean
    const { colorClass: _legacyColorClass, ...cleanCue } = cue;
    const searchText = cleanCue.selectedText?.trim();
    if (!searchText) return cleanCue;

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
        const referenceIndex = (cleanCue.startIndex !== undefined && cleanCue.startIndex >= 0) ? cleanCue.startIndex : lastIndex;
        
        // Find the match closest to our reference point
        const bestMatch = matches.reduce((prev, curr) => {
          return Math.abs(curr.index - referenceIndex) < Math.abs(prev.index - referenceIndex) ? curr : prev;
        });

        const newStart = bestMatch.index;
        const newEnd = newStart + bestMatch.length;
        lastIndex = newEnd;
        alignedCount++;
        return { ...cleanCue, startIndex: newStart, endIndex: newEnd };
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
          const referenceIndex = (cleanCue.startIndex !== undefined && cleanCue.startIndex >= 0) ? cleanCue.startIndex : lastIndex;
          const bestShortMatch = shortMatches.reduce((prev, curr) => {
            return Math.abs(curr.index - referenceIndex) < Math.abs(prev.index - referenceIndex) ? curr : prev;
          });

          const newStart = bestShortMatch.index;
          const newEnd = newStart + searchText.length; // Approximate
          lastIndex = newEnd;
          alignedCount++;
          return { ...cleanCue, startIndex: newStart, endIndex: newEnd };
        }
      }
    } catch (e) {
      console.error("Regex error during alignment:", e);
    }

    console.warn(`Could not align cue: "${searchText}"`);
    return cleanCue;
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
 * Finds the most relevant active cue for a given playback timestamp.
 * Prioritizes the cue with the latest start time (or furthest down the script if tied).
 */
export function findActiveCue(
  cues: Cue[],
  currentTime: number,
  settings?: Record<string, TimingSettings>
): Cue | null {
  if (!cues || cues.length === 0) return null;

  let best: Cue | null = null;
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    if (isCueActive(cue, currentTime, settings)) {
      if (!best) {
        best = cue;
      } else if (cue.startTime > best.startTime) {
        best = cue;
      } else if (cue.startTime === best.startTime && (cue.startIndex || 0) > (best.startIndex || 0)) {
        best = cue;
      }
    }
  }
  return best;
}

/**
 * Finds all active cues for a given playback timestamp.
 */
export function findActiveCues(
  cues: Cue[],
  currentTime: number,
  settings?: Record<string, TimingSettings>
): Cue[] {
  if (!cues || cues.length === 0) return [];
  return cues.filter(cue => isCueActive(cue, currentTime, settings));
}

/**
 * Finds the optimal target cue for auto-scrolling the viewport at a given timestamp.
 * If one or more cues are currently active, delegates to findActiveCue() to track the primary active cue.
 * If no cue is active (e.g. paused in an inter-cue silence gap or between lines), falls back to:
 * 1. The immediate next upcoming cue (cue.startTime >= currentTime).
 * 2. If past all cues, anchors to the last cue in chronological order.
 * 3. If before all cues, anchors to the first cue.
 */
export function findScrollTargetCue(
  cues: Cue[],
  currentTime: number,
  settings?: Record<string, TimingSettings>
): Cue | null {
  if (!cues || cues.length === 0) return null;

  const activeCue = findActiveCue(cues, currentTime, settings);
  if (activeCue) return activeCue;

  // Inter-cue gap fallback: find the next upcoming cue
  let upcomingCue: Cue | null = null;
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    if ((cue.startTime ?? 0) >= currentTime) {
      if (!upcomingCue || (cue.startTime ?? 0) < (upcomingCue.startTime ?? 0)) {
        upcomingCue = cue;
      }
    }
  }

  if (upcomingCue) return upcomingCue;

  // If past all cues, anchor to the last cue in chronological order
  let lastCue: Cue = cues[0];
  for (let i = 1; i < cues.length; i++) {
    if ((cues[i].startTime ?? 0) > (lastCue.startTime ?? 0)) {
      lastCue = cues[i];
    }
  }
  return lastCue;
}

/**
 * Filters cues by multi-select category types and/or text search query.
 */
export function filterCues(
  cues: Cue[],
  selectedCategories?: Set<string>,
  searchQuery?: string
): Cue[] {
  if (!cues || cues.length === 0) return [];
  const q = searchQuery?.trim().toLowerCase() || '';
  const hasCategories = Boolean(selectedCategories && selectedCategories.size > 0);

  if (!q && !hasCategories) return cues;

  return cues.filter(cue => {
    const cueType = cue.type || (cue.colorClass ? (LEGACY_CLASS_MAP[cue.colorClass] || COLORS.find(c => c.class === cue.colorClass)?.type) : 'dialogue') || 'dialogue';

    if (hasCategories && !selectedCategories!.has(cueType)) {
      return false;
    }

    if (q) {
      const textMatch = cue.selectedText?.toLowerCase().includes(q);
      const typeMatch = cueType.toLowerCase().includes(q);
      const startStr = (cue.startTime ?? 0).toFixed(1);
      const endStr = (cue.endTime ?? 0).toFixed(1);
      const timeMatch = startStr.includes(q) || endStr.includes(q);

      return Boolean(textMatch || typeMatch || timeMatch);
    }

    return true;
  });
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

export interface CueCluster {
  id: string;
  startTime: number;
  endTime: number;
  cues: Array<{ cue: Cue; index: number }>;
}

/**
 * Groups chronological cues into temporal clusters. Cues that overlap or are separated
 * by less than maxGapSeconds are grouped under the same cluster window.
 * Enforces maxClusterSpanSeconds (default 10s) and maxCuesPerCluster (default 8) to
 * ensure clusters remain bite-sized even during continuous audio/video playback.
 */
export function clusterCuesByTime(
  cues: Cue[], 
  maxGapSeconds = 2.5,
  maxClusterSpanSeconds = 10.0,
  maxCuesPerCluster = 8
): CueCluster[] {
  if (cues.length === 0) return [];
  const clusters: CueCluster[] = [];
  let currentCluster: CueCluster | null = null;

  cues.forEach((cue, index) => {
    const start = cue.startTime ?? 0;
    const end = Math.max(start, cue.endTime ?? start);

    if (!currentCluster) {
      currentCluster = {
        id: `cluster-${start.toFixed(1)}-0`,
        startTime: start,
        endTime: end,
        cues: [{ cue, index }],
      };
    } else {
      const clusterHorizon = Math.max(currentCluster.endTime, currentCluster.startTime);
      const isWithinGap = start <= clusterHorizon + maxGapSeconds;
      const exceedsMaxSpan = (Math.max(currentCluster.endTime, end) - currentCluster.startTime) > maxClusterSpanSeconds;
      const exceedsMaxCues = currentCluster.cues.length >= maxCuesPerCluster;

      if (isWithinGap && !exceedsMaxSpan && !exceedsMaxCues) {
        currentCluster.cues.push({ cue, index });
        currentCluster.endTime = Math.max(currentCluster.endTime, end);
      } else {
        clusters.push(currentCluster);
        currentCluster = {
          id: `cluster-${start.toFixed(1)}-${clusters.length}`,
          startTime: start,
          endTime: end,
          cues: [{ cue, index }],
        };
      }
    }
  });

  if (currentCluster) {
    clusters.push(currentCluster);
  }

  return clusters;
}

