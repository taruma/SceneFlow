import type { ProcessedLine } from './scriptProcessor';

export interface BriefSectionSummary {
  sectionIndex: number;
  contextLabel?: string;
  macroStatesCount: number;
  subStatesCount: number;
  startStateIndex: number;
  endStateIndex: number;
}

export interface ScriptBriefStats {
  totalSections: number;
  totalMacroStates: number;
  totalSubStates: number;
  sections: BriefSectionSummary[];
}

/**
 * Counts the modular sub-states in a single macro-state line.
 * Sub-states are delimited by the '->' transition operator.
 * Minimum count is 1 for any non-empty macro-state.
 */
export function countSubStatesInLine(lineText: string): number {
  if (!lineText || !lineText.trim()) return 0;
  const parts = lineText.split('->').map((s) => s.trim()).filter(Boolean);
  return Math.max(1, parts.length);
}

/**
 * Analyzes processed script lines to identify and extract statistics for all
 * [<BRIEF>] state machine execution blocks.
 */
export function analyzeBriefSections(processedLines: ProcessedLine[] = []): ScriptBriefStats {
  if (!processedLines || processedLines.length === 0) {
    return {
      totalSections: 0,
      totalMacroStates: 0,
      totalSubStates: 0,
      sections: [],
    };
  }

  // Group brief lines by their briefSectionIndex
  const sectionMap = new Map<number, { lines: ProcessedLine[]; firstLineIdx: number }>();

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    if (line.isBrief) {
      const sectionIdx = line.briefSectionIndex ?? 0;
      if (!sectionMap.has(sectionIdx)) {
        sectionMap.set(sectionIdx, { lines: [], firstLineIdx: i });
      }
      sectionMap.get(sectionIdx)!.lines.push(line);
    }
  }

  if (sectionMap.size === 0) {
    return {
      totalSections: 0,
      totalMacroStates: 0,
      totalSubStates: 0,
      sections: [],
    };
  }

  const sections: BriefSectionSummary[] = [];
  let cumulativeMacroStates = 0;
  let totalSubStates = 0;

  // Sort sections by their section index ascending
  const sortedSectionEntries = Array.from(sectionMap.entries()).sort(([a], [b]) => a - b);

  for (const [sectionIdx, { lines, firstLineIdx }] of sortedSectionEntries) {
    // Find nearest preceding structural heading or title context
    let contextLabel: string | undefined;
    for (let j = firstLineIdx - 1; j >= 0; j--) {
      const prevLine = processedLines[j];
      // Stop searching if we hit an earlier BRIEF section
      if (prevLine.isBrief && (prevLine.briefSectionIndex ?? 0) < sectionIdx) {
        break;
      }
      if (prevLine.type === 'heading' || prevLine.type === 'roman-title' || prevLine.type === 'part-separator') {
        const text = prevLine.text.trim();
        if (text) {
          contextLabel = text.length > 32 ? `${text.slice(0, 30)}…` : text;
          break;
        }
      }
    }

    const macroStatesCount = lines.length;
    let sectionSubStates = 0;

    for (const line of lines) {
      sectionSubStates += countSubStatesInLine(line.text);
    }

    const startStateIndex = cumulativeMacroStates + 1;
    const endStateIndex = cumulativeMacroStates + macroStatesCount;
    cumulativeMacroStates += macroStatesCount;
    totalSubStates += sectionSubStates;

    sections.push({
      sectionIndex: sectionIdx,
      contextLabel,
      macroStatesCount,
      subStatesCount: sectionSubStates,
      startStateIndex,
      endStateIndex,
    });
  }

  return {
    totalSections: sections.length,
    totalMacroStates: cumulativeMacroStates,
    totalSubStates,
    sections,
  };
}
