export type ScriptThemeId = 
  | 'studio-light' 
  | 'parchment-warm' 
  | 'midnight-slate' 
  | 'oled-black' 
  | 'cyber-matrix' 
  | 'retro-newspaper';

export interface ScriptTheme {
  id: ScriptThemeId;
  name: string;
  category: 'light' | 'warm' | 'dark';
  description: string;
  paperBg: string;
  paperBorder: string;
  paperShadow: string;
  textColor: string;
  textMutedColor: string;
  headingBg: string;
  headingBorder: string;
  separatorBorder: string;
  titleTextColor: string;
  titleLineBg: string;
  stagingBadgeBg: string;
  stagingBadgeBorder: string;
  stagingBadgeText: string;
  stagingBadgeIcon: string;
  punchHoleBg: string;
  isDark: boolean;
  briefBg: string;
  briefBorder: string;
  briefBadgeBg: string;
  briefBadgeBorder: string;
  briefBadgeText: string;
}

export const SCRIPT_THEMES: Record<ScriptThemeId, ScriptTheme> = {
  'studio-light': {
    id: 'studio-light',
    name: 'Studio Crisp',
    category: 'light',
    description: 'Clean default screenplay paper with neutral stone contrast.',
    paperBg: 'bg-white',
    paperBorder: 'ring-1 ring-stone-200',
    paperShadow: 'shadow-lg',
    textColor: 'text-stone-900',
    textMutedColor: 'text-stone-500',
    headingBg: 'bg-stone-50',
    headingBorder: 'border-y border-stone-100',
    separatorBorder: 'border-stone-100',
    titleTextColor: 'text-stone-400',
    titleLineBg: 'bg-stone-200/50',
    stagingBadgeBg: 'bg-white',
    stagingBadgeBorder: 'border-stone-200',
    stagingBadgeText: 'text-stone-500',
    stagingBadgeIcon: 'text-stone-400',
    punchHoleBg: 'bg-stone-400',
    isDark: false,
    briefBg: 'bg-stone-50/50',
    briefBorder: 'border-stone-300/70',
    briefBadgeBg: 'bg-stone-200/60',
    briefBadgeBorder: 'border-stone-300/60',
    briefBadgeText: 'text-stone-800',
  },
  'parchment-warm': {
    id: 'parchment-warm',
    name: 'Warm Parchment',
    category: 'warm',
    description: 'Soft sepia tone inspired by vintage typewriter manuscripts.',
    paperBg: 'bg-[#faf6ee]',
    paperBorder: 'ring-1 ring-amber-200/60',
    paperShadow: 'shadow-lg shadow-amber-900/5',
    textColor: 'text-[#2e261f]',
    textMutedColor: 'text-[#7a6b5a]',
    headingBg: 'bg-[#f3ece0]',
    headingBorder: 'border-y border-[#e8ded0]',
    separatorBorder: 'border-[#e8ded0]',
    titleTextColor: 'text-[#9c8973]',
    titleLineBg: 'bg-[#dfd3c1]',
    stagingBadgeBg: 'bg-[#fffdf9]',
    stagingBadgeBorder: 'border-[#dfd3c1]',
    stagingBadgeText: 'text-[#7a6b5a]',
    stagingBadgeIcon: 'text-[#9c8973]',
    punchHoleBg: 'bg-[#a3927e]',
    isDark: false,
    briefBg: 'bg-[#f4efe4]/60',
    briefBorder: 'border-[#d8ccba]',
    briefBadgeBg: 'bg-[#e8dfd1]',
    briefBadgeBorder: 'border-[#cfc3b2]',
    briefBadgeText: 'text-[#4e3f31]',
  },
  'midnight-slate': {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    category: 'dark',
    description: 'Refined dark slate with soft luminous text for low-light editing.',
    paperBg: 'bg-[#18181b]',
    paperBorder: 'ring-1 ring-stone-800',
    paperShadow: 'shadow-2xl shadow-black/60',
    textColor: 'text-stone-100',
    textMutedColor: 'text-stone-400',
    headingBg: 'bg-[#202024]',
    headingBorder: 'border-y border-stone-800',
    separatorBorder: 'border-stone-800',
    titleTextColor: 'text-stone-500',
    titleLineBg: 'bg-stone-800',
    stagingBadgeBg: 'bg-[#27272a]',
    stagingBadgeBorder: 'border-stone-700',
    stagingBadgeText: 'text-stone-300',
    stagingBadgeIcon: 'text-stone-400',
    punchHoleBg: 'bg-stone-700',
    isDark: true,
    briefBg: 'bg-[#202025]/60',
    briefBorder: 'border-stone-700/80',
    briefBadgeBg: 'bg-stone-800',
    briefBadgeBorder: 'border-stone-600/70',
    briefBadgeText: 'text-stone-200',
  },
  'oled-black': {
    id: 'oled-black',
    name: 'OLED Blackout',
    category: 'dark',
    description: 'Pure black surface with crisp high-contrast cue highlights.',
    paperBg: 'bg-[#000000]',
    paperBorder: 'ring-1 ring-neutral-800',
    paperShadow: 'shadow-2xl shadow-black',
    textColor: 'text-neutral-100',
    textMutedColor: 'text-neutral-400',
    headingBg: 'bg-[#121212]',
    headingBorder: 'border-y border-neutral-800',
    separatorBorder: 'border-neutral-800',
    titleTextColor: 'text-neutral-500',
    titleLineBg: 'bg-neutral-800',
    stagingBadgeBg: 'bg-[#181818]',
    stagingBadgeBorder: 'border-neutral-700',
    stagingBadgeText: 'text-neutral-200',
    stagingBadgeIcon: 'text-neutral-400',
    punchHoleBg: 'bg-neutral-800',
    isDark: true,
    briefBg: 'bg-[#111111]/80',
    briefBorder: 'border-neutral-800',
    briefBadgeBg: 'bg-neutral-900',
    briefBadgeBorder: 'border-neutral-700',
    briefBadgeText: 'text-neutral-200',
  },
  'cyber-matrix': {
    id: 'cyber-matrix',
    name: 'Navy Slate',
    category: 'dark',
    description: 'Deep navy-tinted dark paper with subtle atmospheric glow.',
    paperBg: 'bg-[#0f172a]',
    paperBorder: 'ring-1 ring-slate-800',
    paperShadow: 'shadow-2xl shadow-slate-950/80',
    textColor: 'text-slate-100',
    textMutedColor: 'text-slate-400',
    headingBg: 'bg-[#1e293b]/70',
    headingBorder: 'border-y border-slate-800',
    separatorBorder: 'border-slate-800',
    titleTextColor: 'text-slate-500',
    titleLineBg: 'bg-slate-800',
    stagingBadgeBg: 'bg-[#1e293b]',
    stagingBadgeBorder: 'border-slate-700',
    stagingBadgeText: 'text-slate-300',
    stagingBadgeIcon: 'text-slate-400',
    punchHoleBg: 'bg-slate-700',
    isDark: true,
    briefBg: 'bg-[#131d35]/60',
    briefBorder: 'border-slate-700/80',
    briefBadgeBg: 'bg-slate-800',
    briefBadgeBorder: 'border-slate-600/70',
    briefBadgeText: 'text-slate-200',
  },
  'retro-newspaper': {
    id: 'retro-newspaper',
    name: 'Newsprint',
    category: 'warm',
    description: 'Soft gray-tinted vintage newsprint for easy daytime reading.',
    paperBg: 'bg-[#f3f0e8]',
    paperBorder: 'ring-1 ring-[#dedad0]',
    paperShadow: 'shadow-lg shadow-stone-900/5',
    textColor: 'text-[#242426]',
    textMutedColor: 'text-[#6e6c66]',
    headingBg: 'bg-[#e7e4dc]',
    headingBorder: 'border-y border-[#d8d4ca]',
    separatorBorder: 'border-[#d8d4ca]',
    titleTextColor: 'text-[#8a877f]',
    titleLineBg: 'bg-[#ccc7bc]',
    stagingBadgeBg: 'bg-[#fbf9f4]',
    stagingBadgeBorder: 'border-[#d8d4ca]',
    stagingBadgeText: 'text-[#5a5852]',
    stagingBadgeIcon: 'text-[#8a877f]',
    punchHoleBg: 'bg-[#b8b3a7]',
    isDark: false,
    briefBg: 'bg-[#eae6dc]/60',
    briefBorder: 'border-[#d2ccc0]',
    briefBadgeBg: 'bg-[#ded8cc]',
    briefBadgeBorder: 'border-[#c6bfb0]',
    briefBadgeText: 'text-[#383630]',
  }
};

export const DEFAULT_SCRIPT_THEME_ID: ScriptThemeId = 'studio-light';

export function getScriptTheme(id?: string): ScriptTheme {
  if (id && id in SCRIPT_THEMES) {
    return SCRIPT_THEMES[id as ScriptThemeId];
  }
  return SCRIPT_THEMES[DEFAULT_SCRIPT_THEME_ID];
}
