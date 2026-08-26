import type { ColorCategory } from '../../types/script';

export interface CueColorDefinition {
  type: string;
  class: string;
  name: string;
  lightRgb: string;
  warmRgb: string;
  darkRgb: string;
}

export const CUE_COLOR_DEFINITIONS: readonly CueColorDefinition[] = [
  {
    type: 'dialogue',
    class: 'bg-yellow-400/50',
    name: 'Dialogue',
    lightRgb: '250, 204, 21',
    warmRgb: '222, 160, 24',
    darkRgb: '253, 224, 71',
  },
  {
    type: 'action',
    class: 'bg-blue-400/50',
    name: 'Action',
    lightRgb: '96, 165, 250',
    warmRgb: '88, 134, 185',
    darkRgb: '56, 189, 248',
  },
  {
    type: 'camera',
    class: 'bg-green-400/50',
    name: 'Camera',
    lightRgb: '74, 222, 128',
    warmRgb: '110, 158, 90',
    darkRgb: '52, 211, 153',
  },
  {
    type: 'shot',
    class: 'bg-purple-400/50',
    name: 'Shot',
    lightRgb: '192, 132, 252',
    warmRgb: '168, 115, 172',
    darkRgb: '168, 85, 247',
  },
  {
    type: 'audio',
    class: 'bg-orange-400/50',
    name: 'Audio',
    lightRgb: '251, 146, 60',
    warmRgb: '216, 108, 54',
    darkRgb: '249, 115, 22',
  },
  {
    type: 'vfx',
    class: 'bg-cyan-400/50',
    name: 'VFX',
    lightRgb: '34, 211, 238',
    warmRgb: '52, 160, 170',
    darkRgb: '45, 212, 191',
  },
  {
    type: 'transition',
    class: 'bg-pink-400/50',
    name: 'Transition',
    lightRgb: '244, 114, 182',
    warmRgb: '216, 102, 136',
    darkRgb: '244, 114, 182',
  },
  {
    type: 'environment',
    class: 'bg-slate-400/50',
    name: 'Environment',
    lightRgb: '148, 163, 184',
    warmRgb: '158, 146, 130',
    darkRgb: '148, 163, 184',
  },
] as const;

/**
 * Backward-compatible list of cue theme colors.
 */
export interface CueThemeColor {
  type: string;
  class: string;
  name: string;
  lightRgb: string;
  warmRgb: string;
  darkRgb: string;
  rgb?: string;
}

export const CUE_THEME_COLORS: CueThemeColor[] = CUE_COLOR_DEFINITIONS.map(c => ({
  ...c,
  rgb: c.lightRgb
}));

/**
 * Backward-compatible COLORS array for script constants and timing settings.
 */
export const COLORS: ColorCategory[] = CUE_COLOR_DEFINITIONS.map(c => ({
  type: c.type,
  class: c.class,
  rgb: c.lightRgb
}));

export interface CueThemeResolvedColor {
  type: string;
  rgb: string;
  baseOpacity: number;
  textColorClass: string;
  borderClass: string;
  dotColor: string;
}
