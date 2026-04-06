import { parseScriptWithStaging, StagingMarker } from './scriptParser';

export type LineType = 
  | 'name' 
  | 'speech' 
  | 'parenthetical' 
  | 'heading' 
  | 'note' 
  | 'effect' 
  | 'separator' 
  | 'part-separator' 
  | 'roman-title' 
  | 'action' 
  | 'default';

export interface ProcessedLine {
  text: string;
  type: LineType;
  lineIdx: number;
  charName?: string;
  isStaging: boolean;
  stagingMarker?: StagingMarker;
  lineStart: number;
  lineEnd: number;
}

/**
 * Processes the script text into a structured list of lines with their types and metadata.
 * This separates the parsing logic from the rendering logic.
 */
export function processScript(scriptText: string): ProcessedLine[] {
  const { originalLines: lines, stagingLineIndices, stagingMarkers } = parseScriptWithStaging(scriptText);
  
  // Pre-calculate dialogue blocks
  const dialogueInfo = new Array(lines.length).fill(null);
  for (let i = 0; i < lines.length; i++) {
    if (stagingLineIndices.has(i)) continue;
    const trimmed = lines[i].trim();
    
    // Rule: ALL CAPS and ends with ":"
    if (trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.endsWith(':')) {
      const charName = trimmed.slice(0, -1);
      dialogueInfo[i] = { type: 'name', name: charName };
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== '' && !stagingLineIndices.has(j)) {
        dialogueInfo[j] = { type: 'speech', name: charName };
        j++;
      }
      i = j - 1;
    }
  }

  const processedLines: ProcessedLine[] = [];
  let currentPos = 0;

  lines.forEach((line, lineIdx) => {
    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;
    currentPos += line.length + 1; // +1 for the newline character

    const isStaging = stagingLineIndices.has(lineIdx);
    const stagingMarker = stagingMarkers[lineIdx];
    const info = dialogueInfo[lineIdx];
    const trimmed = line.trim();
    
    let type: LineType = 'default';
    let charName = info?.name;

    if (info?.type === 'name') {
      type = 'name';
    } else if (info?.type === 'speech') {
      if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        type = 'parenthetical';
      } else {
        type = 'speech';
      }
    } else if (trimmed.startsWith('INT.') || trimmed.startsWith('EXT.')) {
      type = 'heading';
    } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      type = 'note';
    } else if (trimmed.startsWith('SFX:') || trimmed.startsWith('VFX:')) {
      type = 'effect';
    } else if (trimmed === '---') {
      type = 'separator';
    } else if (/^PART \d+$/.test(trimmed)) {
      type = 'part-separator';
    } else {
      const romanMatch = trimmed.match(/^[IVXLCDM]+\.\s+(.+)$/);
      const isRomanTitle = romanMatch && trimmed === trimmed.toUpperCase() && (lineIdx === lines.length - 1 || lines[lineIdx + 1]?.trim() === '');
      if (isRomanTitle) {
        type = 'roman-title';
      } else if (trimmed.length > 0 && trimmed === trimmed.toUpperCase()) {
        type = 'action';
      } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        type = 'parenthetical';
      }
    }

    processedLines.push({
      text: line,
      type,
      lineIdx,
      charName,
      isStaging,
      stagingMarker,
      lineStart,
      lineEnd
    });
  });

  return processedLines;
}
