export interface RawScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  onSaveScript?: (newScriptText: string, shouldRealign?: boolean) => void;
  onChangeScriptText?: (text: string) => void;
  activeCuesCount?: number;
}

export interface HistoryEntry {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  scrollTop: number;
}

export interface TocItem {
  id: string;
  title: string;
  type: 'scene' | 'part' | 'staging' | 'directive' | 'brief' | 'heading';
  level: number;       // 0 for top-level root, 1 for sub-level, 2 for nested, etc.
  parentId?: string;   // parent section id if nested under a collapsible group
  rank: number;        // hierarchy rank: 1=Part/Major Section, 2=Scene, 3=Staging/Brief, 4=Inner Directive
  lineIdx: number;     // 0-based line number
  charOffset: number;  // character offset from start of script
  length: number;      // line length
}

export const CORE_DIRECTIVE_PRESETS = ['INTENT', 'LOGIC', 'AESTHETIC', 'OPENING'] as const;
