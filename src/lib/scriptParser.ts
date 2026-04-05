
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
    
    if (line === '[[STAGING]]') {
      inStaging = true;
      stagingStartIdx = i;
      currentStagingBlocks = [];
      stagingLineIndices.add(i);
      continue;
    }
    
    if (line === '[[/STAGING]]') {
      inStaging = false;
      stagingLineIndices.add(i);
      if (currentStagingBlocks.length > 0) {
        // Associate this marker with the line BEFORE the staging block
        // or the line AFTER it ends. Let's use the start index for the badge.
        stagingMarkers[stagingStartIdx] = {
          index: stagingStartIdx,
          blocks: currentStagingBlocks
        };
      }
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
  
  return { originalLines: lines, stagingLineIndices, stagingMarkers };
}
