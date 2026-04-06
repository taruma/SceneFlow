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
