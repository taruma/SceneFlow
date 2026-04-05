
export type ScriptBlockType = 
  | 'heading' 
  | 'action' 
  | 'character' 
  | 'dialogue' 
  | 'parenthetical' 
  | 'transition' 
  | 'title' 
  | 'note' 
  | 'effect' 
  | 'separator'
  | 'staging';

export interface ScriptBlock {
  id: string;
  type: ScriptBlockType;
  content: string;
  lineIndex: number;
  startIndex: number;
  endIndex: number;
  metadata?: {
    characterName?: string;
    isStaging?: boolean;
    stagingBlocks?: any[];
  };
}

export interface ScriptCue {
  id: string;
  selectedText: string;
  startIndex: number;
  endIndex: number;
  startTime: number;
  endTime: number;
  colorClass: string;
  type?: string;
}
