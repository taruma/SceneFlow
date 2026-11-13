import type { Cue } from '../types/script';

export interface MeasuredWord {
  text: string;
  start: number;
  end: number;
}

export interface Measurements {
  cuts?: number[];
  words?: MeasuredWord[];
}

export interface SnapResult {
  cues: Cue[];
  moved: Record<string, number>;
}

interface WordToken {
  token: string;
  start: number;
  end: number;
}

const CUT_SNAP_SECONDS = 0.6;
const WORD_SEARCH_SECONDS = 3;
const MIN_WORD_MATCH_RATIO = 0.6;
const CUT_CUE_TYPES = new Set(['shot', 'camera', 'transition']);

/**
 * Validates a measurements file: `{ cuts?: number[], words?: { text, start, end }[] }`.
 */
export function parseMeasurements(json: any): Measurements {
  const cuts = Array.isArray(json?.cuts)
    ? json.cuts.filter((t: unknown) => Number.isFinite(t))
    : [];
  const words = Array.isArray(json?.words)
    ? json.words.filter((w: any) =>
        typeof w?.text === 'string' && Number.isFinite(w?.start) && Number.isFinite(w?.end)
      )
    : [];
  if (cuts.length === 0 && words.length === 0) {
    throw new Error('Expected a "cuts" array of seconds or a "words" array of { text, start, end }.');
  }
  return { cuts, words };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}'’]+/u)
    .map(token => token.replace(/['’]/g, ''))
    .filter(Boolean);
}

/**
 * Drops bracketed or parenthesized annotations ("[MUSIC]", "(light music)"),
 * which recognizers emit for non-speech audio.
 */
function toSpokenTokens(words: MeasuredWord[]): WordToken[] {
  let inAnnotation = false;
  const tokens: WordToken[] = [];
  for (const word of words) {
    const text = word.text.trim();
    const skip = inAnnotation || /^[[(]/.test(text);
    inAnnotation = skip && !/[\])]/.test(text);
    if (skip) continue;
    for (const token of tokenize(text)) {
      tokens.push({ token, start: word.start, end: word.end });
    }
  }
  return tokens.sort((a, b) => a.start - b.start);
}

function nearestCut(cuts: number[], time: number): number | null {
  let best: number | null = null;
  for (const cut of cuts) {
    const distance = Math.abs(cut - time);
    if (distance <= CUT_SNAP_SECONDS && (best === null || distance < Math.abs(best - time))) {
      best = cut;
    }
  }
  return best;
}

function snapToCuts(cue: Cue, cuts: number[]): Cue {
  const startCut = nearestCut(cuts, cue.startTime);
  const startTime = startCut !== null && startCut < cue.endTime ? startCut : cue.startTime;
  const endCut = nearestCut(cuts, cue.endTime);
  const endTime = endCut !== null && endCut > startTime ? endCut : cue.endTime;
  return { ...cue, startTime, endTime };
}

/**
 * Longest common subsequence of cue tokens within a span of measured tokens,
 * returning the matched count and the first/last matched span positions.
 */
function alignTokens(cueTokens: string[], span: WordToken[]): { count: number; first: number; last: number } {
  const rows = cueTokens.length;
  const cols = span.length;
  const table = Array.from({ length: rows + 1 }, () => new Array<number>(cols + 1).fill(0));
  for (let i = rows - 1; i >= 0; i--) {
    for (let j = cols - 1; j >= 0; j--) {
      table[i][j] = cueTokens[i] === span[j].token
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  let first = -1;
  let last = -1;
  let i = 0;
  let j = 0;
  while (i < rows && j < cols) {
    if (cueTokens[i] === span[j].token) {
      if (first === -1) first = j;
      last = j;
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return { count: table[0][0], first, last };
}

function snapToWords(cue: Cue, tokens: WordToken[]): Cue {
  const cueTokens = tokenize(cue.selectedText || '');
  if (cueTokens.length === 0) return cue;

  const nearby = tokens.filter(
    t => t.start >= cue.startTime - WORD_SEARCH_SECONDS && t.start <= cue.endTime + WORD_SEARCH_SECONDS
  );
  const cueTokenSet = new Set(cueTokens);
  let best: { count: number; start: number; end: number } | null = null;

  for (let a = 0; a < nearby.length; a++) {
    if (!cueTokenSet.has(nearby[a].token)) continue;
    // The span may hold as many extra measured words as the line has (stutters, ad-libs);
    // missing ones fall out of the LCS.
    const span = nearby.slice(a, a + cueTokens.length * 2);
    const { count, first, last } = alignTokens(cueTokens, span);
    if (count < cueTokens.length * MIN_WORD_MATCH_RATIO) continue;
    const start = span[first].start;
    const isCloser = best !== null && Math.abs(start - cue.startTime) < Math.abs(best.start - cue.startTime);
    if (best === null || count > best.count || (count === best.count && isCloser)) {
      best = { count, start, end: span[last].end };
    }
  }

  return best ? { ...cue, startTime: best.start, endTime: best.end } : cue;
}

/**
 * Tightens cue times against measurements made outside the app: shot, camera and
 * transition cues snap to the nearest detected cut, dialogue cues to their recognised words.
 */
export function snapCues(cues: Cue[], measurements: Measurements): SnapResult {
  const cuts = measurements.cuts ?? [];
  const tokens = toSpokenTokens(measurements.words ?? []);
  const moved: Record<string, number> = {};

  const snapped = cues.map(cue => {
    const type = cue.type || 'dialogue';
    let next = cue;
    if (CUT_CUE_TYPES.has(type)) {
      next = snapToCuts(cue, cuts);
    } else if (type === 'dialogue') {
      next = snapToWords(cue, tokens);
    }
    if (next.startTime !== cue.startTime || next.endTime !== cue.endTime) {
      moved[type] = (moved[type] || 0) + 1;
    }
    return next;
  });

  return { cues: snapped, moved };
}
