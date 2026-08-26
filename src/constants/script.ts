import type { TimingSettings, ScriptWidthPreset, ScrollFocusPreset } from '../types/script';
import { COLORS } from '../styles/tokens/cues';

export { COLORS };

export const DEFAULT_SETTINGS: Record<string, TimingSettings> = {
  general: { before: 0, after: 0 },
  ...Object.fromEntries(COLORS.map(c => [
    c.type, 
    { before: 0, after: 0 }
  ]))
};

export const SCRIPT_WIDTH_PRESETS: readonly ScriptWidthPreset[] = [
  { id: 'narrow', label: 'Narrow', widthClass: 'max-w-sm', desc: '384px • Focused column' },
  { id: 'compact', label: 'Compact', widthClass: 'max-w-md', desc: '448px • Snug reading' },
  { id: 'standard', label: 'Standard', widthClass: 'max-w-xl', desc: '576px • Default screenplay' },
  { id: 'wide', label: 'Wide', widthClass: 'max-w-3xl', desc: '768px • Spacious view' },
  { id: 'full', label: 'Expanded', widthClass: 'max-w-5xl', desc: '1024px • Full page' },
] as const;

export const SCROLL_FOCUS_PRESETS: readonly ScrollFocusPreset[] = [
  { id: 'top', label: 'Top (35%)', shortLabel: 'Top', ratio: 0.35, desc: '35% from top • Anticipation' },
  { id: 'center', label: 'Center (50%)', shortLabel: 'Center', ratio: 0.50, desc: '50% viewport • Balanced' },
  { id: 'bottom', label: 'Bottom (35%)', shortLabel: 'Bottom', ratio: 0.65, desc: '35% from bottom • Reflection' },
] as const;
