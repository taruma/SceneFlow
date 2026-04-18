
import { ScriptBlock, ScriptBlockType } from '../types/script';

export interface StagingBlock {
  label: string;
  content: string;
}

export interface StagingMarker {
  index: number; // The index in the original lines array where this marker should appear
  blocks: StagingBlock[];
}

export interface ParsedScript {
  originalLines: string[];
  stagingLineIndices: Set<number>;
  stagingMarkers: Record<number, StagingMarker>;
  blocks: ScriptBlock[];
}

/**
 * Parses the script text for [[STAGING]] blocks and extracts their content.
 * Returns original lines, which lines to hide, and a map of markers by line index.
 */
export function parseScriptWithStaging(text: string): ParsedScript {
  const lines = text.split('\n');
  const stagingLineIndices = new Set<number>();
  const stagingMarkers: Record<number, StagingMarker> = {};
  
  let inStaging = false;
  let currentStagingBlocks: StagingBlock[] = [];
  let stagingStartIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    const trimmedLine = line.trim();

    if (trimmedLine === '[[STAGING]]') {
      inStaging = true;
      stagingStartIdx = i;
      currentStagingBlocks = [];
      stagingLineIndices.add(i);
      continue;
    }
    
    if (trimmedLine === '[[/STAGING]]') {
      inStaging = false;
      stagingLineIndices.add(i);
      if (currentStagingBlocks.length > 0) {
        stagingMarkers[stagingStartIdx] = {
          index: stagingStartIdx,
          blocks: currentStagingBlocks
        };
      }
      continue;
    }

    if (/^\[<?\/?[A-Z0-9_\s]+>?\]$/i.test(trimmedLine)) {
      stagingLineIndices.add(i);
      continue;
    }
    
    if (inStaging) {
      stagingLineIndices.add(i);
      // Look for [[LABEL]]...[[/LABEL]] blocks
      const labelMatch = line.match(/^\[\[([A-Z0-9_\s]+)\]\]$/);
      if (labelMatch) {
        const label = labelMatch[1];
        let content = '';
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          stagingLineIndices.add(j);
          if (nextLine === `[[/${label}]]`) {
            i = j;
            break;
          }
          content += lines[j] + '\n';
          j++;
        }
        currentStagingBlocks.push({ label, content: content.trim() });
      }
      continue;
    }
  }
  
  return { originalLines: lines, stagingLineIndices, stagingMarkers, blocks: parseScriptToBlocks(text, stagingLineIndices, stagingMarkers) };
}

/**
 * Converts raw script text into structured blocks for rendering.
 */
export function parseScriptToBlocks(
  text: string, 
  stagingLineIndices: Set<number>, 
  stagingMarkers: Record<number, StagingMarker>
): ScriptBlock[] {
  const lines = text.split('\n');
  const blocks: ScriptBlock[] = [];
  let currentPos = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineStart = currentPos;
    const lineEnd = currentPos + line.length;
    currentPos += line.length + 1;

    // Handle staging markers
    if (stagingMarkers[i]) {
      blocks.push({
        id: `staging-${i}`,
        type: 'staging',
        content: '',
        lineIndex: i,
        startIndex: lineStart,
        endIndex: lineStart,
        metadata: {
          isStaging: true,
          stagingBlocks: stagingMarkers[i].blocks
        }
      });
    }

    // Skip lines that are part of a staging block definition
    if (stagingLineIndices.has(i)) continue;

    let type: ScriptBlockType = 'action';
    let metadata: any = {};

    const isHeading = trimmed.startsWith('INT.') || trimmed.startsWith('EXT.');
    const isNote = trimmed.startsWith('[') && trimmed.endsWith(']');
    const isEffect = trimmed.startsWith('SFX:') || trimmed.startsWith('VFX:');
    const isSeparator = trimmed === '---';
    const isPartSeparator = /^PART \d+$/.test(trimmed);
    const romanMatch = trimmed.match(/^[IVXLCDM]+\.\s+(.+)$/);
    const isRomanTitle = romanMatch && trimmed === trimmed.toUpperCase() && (i === lines.length - 1 || lines[i + 1]?.trim() === '');
    
    // Dialogue detection
    const isName = trimmed.length > 0 && trimmed === trimmed.toUpperCase() && trimmed.endsWith(':');

    if (isSeparator) {
      type = 'separator';
    } else if (isPartSeparator || isRomanTitle) {
      type = 'title';
    } else if (isHeading) {
      type = 'heading';
    } else if (isNote) {
      type = 'note';
    } else if (isEffect) {
      type = 'effect';
    } else if (isName) {
      type = 'character';
      metadata.characterName = trimmed.slice(0, -1);
    } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Check if it's inside a dialogue block (simplified for now)
      type = 'parenthetical';
    } else if (i > 0) {
      // Check if previous line was a character or parenthetical to mark as dialogue
      const prevBlock = blocks[blocks.length - 1];
      if (prevBlock && (prevBlock.type === 'character' || prevBlock.type === 'parenthetical' || prevBlock.type === 'dialogue') && trimmed !== '') {
        type = 'dialogue';
      }
    }

    blocks.push({
      id: `line-${i}`,
      type,
      content: line,
      lineIndex: i,
      startIndex: lineStart,
      endIndex: lineEnd,
      metadata
    });
  }

  return blocks;
}
