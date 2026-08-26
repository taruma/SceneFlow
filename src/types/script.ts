
export interface Cue {
  id: string;
  selectedText: string;
  startIndex: number;
  endIndex: number;
  startTime: number;
  endTime: number;
  colorClass?: string;
  type?: string;
}

export interface TimingSettings {
  before: number;
  after: number;
}

export interface ColorCategory {
  type: string;
  class: string;
  rgb?: string;
}

export interface AppState {
  youtubeId: string;
  scriptText: string;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
}

export type ScriptWidthPresetId = 'narrow' | 'compact' | 'standard' | 'wide' | 'full';

export interface ScriptWidthPreset {
  id: ScriptWidthPresetId;
  label: string;
  widthClass: string;
  desc: string;
}

export type ScrollFocusPresetId = 'top' | 'center' | 'bottom';

export interface ScrollFocusPreset {
  id: ScrollFocusPresetId;
  label: string;
  shortLabel: string;
  ratio: number;
  desc: string;
}

export interface TextSelection {
  text: string;
  start: number;
  end: number;
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  cue: Cue | null;
}

export interface ResetConfirmationState {
  isOpen: boolean;
  type: 'settings' | 'data' | 'blank' | 'example' | 'remote' | null;
  examplePath?: string;
  exampleTitle?: string;
  remoteUrl?: string;
  error?: string | null;
}

export interface OverlapPickerState {
  isOpen: boolean;
  cues: Cue[];
  position: { x: number; y: number };
}

export interface AlternativeLocation {
  start: number;
  end: number;
  context: string;
}

export type AppMode = 'playback' | 'edit';

