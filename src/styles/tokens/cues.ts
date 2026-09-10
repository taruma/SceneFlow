import type { ColorCategory } from '../../types/script';

export interface CueColorDefinition {
  type: string;
  class: string;
  name: string;
  lightRgb: string;
  warmRgb: string;
  darkRgb: string;
}

export type CuePaletteProfile = 'standard' | 'protanopia';

export const CUE_COLOR_DEFINITIONS_STANDARD: readonly CueColorDefinition[] = [
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
    class: 'bg-blue-500/50',
    name: 'Action',
    lightRgb: '59, 130, 246',
    warmRgb: '75, 125, 185',
    darkRgb: '96, 165, 250',
  },
  {
    type: 'camera',
    class: 'bg-green-500/50',
    name: 'Camera',
    lightRgb: '34, 197, 94',
    warmRgb: '100, 155, 95',
    darkRgb: '52, 211, 153',
  },
  {
    type: 'shot',
    class: 'bg-indigo-400/50',
    name: 'Shot',
    lightRgb: '129, 140, 248',
    warmRgb: '125, 118, 185',
    darkRgb: '165, 180, 252',
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
    lightRgb: '6, 182, 212',
    warmRgb: '40, 155, 170',
    darkRgb: '34, 211, 238',
  },
  {
    type: 'transition',
    class: 'bg-rose-500/50',
    name: 'Transition',
    lightRgb: '244, 63, 94',
    warmRgb: '215, 75, 95',
    darkRgb: '251, 113, 133',
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
 * Palette optimized specifically for Protanopia and Deuteranopia (Red-Green Color Vision Deficiency).
 * Key differences:
 * - Shot is mapped to Deep Wine / Burgundy (high-contrast dark warm tone, zero blue collision with Action).
 * - Action is firm saturated Cobalt Blue.
 * - VFX is high-luminance Ice Aqua (stands out radiantly from Action Blue).
 * - Transition is warm Vermilion Coral.
 */
export const CUE_COLOR_DEFINITIONS_PROTANOPIA: readonly CueColorDefinition[] = [
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
    class: 'bg-blue-600/50',
    name: 'Action',
    lightRgb: '37, 99, 235',
    warmRgb: '55, 110, 185',
    darkRgb: '96, 165, 250',
  },
  {
    type: 'camera',
    class: 'bg-emerald-500/50',
    name: 'Camera',
    lightRgb: '16, 185, 129',
    warmRgb: '90, 150, 95',
    darkRgb: '52, 211, 153',
  },
  {
    type: 'shot',
    class: 'bg-rose-900/50',
    name: 'Shot',
    lightRgb: '136, 19, 55',    // Deep Wine / Burgundy (dark warm chocolate-wine tone for Protanopia)
    warmRgb: '120, 25, 45',     // Antique deep wine gouache
    darkRgb: '225, 29, 72',     // Luminous ruby-wine in dark themes
  },
  {
    type: 'audio',
    class: 'bg-orange-500/50',
    name: 'Audio',
    lightRgb: '249, 115, 22',
    warmRgb: '216, 108, 54',
    darkRgb: '251, 146, 60',
  },
  {
    type: 'vfx',
    class: 'bg-cyan-300/50',
    name: 'VFX',
    lightRgb: '6, 182, 212',
    warmRgb: '35, 160, 175',
    darkRgb: '103, 232, 249',   // High-luminance radiant Ice Aqua
  },
  {
    type: 'transition',
    class: 'bg-orange-600/50',
    name: 'Transition',
    lightRgb: '234, 88, 12',    // Warm Vermilion / Coral
    warmRgb: '205, 75, 40',
    darkRgb: '251, 113, 133',
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

export function getCueDefinitionsForProfile(profile?: CuePaletteProfile | string): readonly CueColorDefinition[] {
  if (profile === 'protanopia') {
    return CUE_COLOR_DEFINITIONS_PROTANOPIA;
  }
  return CUE_COLOR_DEFINITIONS_STANDARD;
}

export const CUE_COLOR_DEFINITIONS: readonly CueColorDefinition[] = CUE_COLOR_DEFINITIONS_STANDARD;

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

/**
 * Maps previous version Tailwind color classes to semantic cue types for backward compatibility.
 */
export const LEGACY_CLASS_MAP: Record<string, string> = {
  'bg-purple-400/50': 'shot',
  'bg-purple-400': 'shot',
  'bg-pink-400/50': 'transition',
  'bg-pink-400': 'transition',
  'bg-blue-400/50': 'action',
  'bg-blue-400': 'action',
  'bg-green-400/50': 'camera',
  'bg-green-400': 'camera',
  'purple': 'shot',
  'pink': 'transition',
};


