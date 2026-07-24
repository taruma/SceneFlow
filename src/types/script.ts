export type ScriptBlockType = 
  | 'staging'
  | 'action'
  | 'separator'
  | 'title'
  | 'heading'
  | 'note'
  | 'effect'
  | 'character'
  | 'parenthetical'
  | 'dialogue';

export interface ScriptBlock {
  id: string;
  type: ScriptBlockType;
  content: string;
  lineIndex: number;
  startIndex: number;
  endIndex: number;
  metadata?: any;
}

export interface Cue {
  id: string;
  selectedText: string;
  startIndex: number;
  endIndex: number;
  startTime: number;
  endTime: number;
  colorClass: string;
  type?: string;
}

