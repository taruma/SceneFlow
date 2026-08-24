import { ProcessedLine } from './scriptProcessor';

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
  }
};

export const DEFAULT_SCRIPT_THEME_ID: ScriptThemeId = 'studio-light';

export interface CueThemeColor {
  type: string;
  class: string;
  name: string;
  lightRgb: string;
  warmRgb: string;
  darkRgb: string;
}

export const CUE_THEME_COLORS: CueThemeColor[] = [
  { type: 'dialogue', class: 'bg-yellow-400/50', name: 'Dialogue', lightRgb: '250, 204, 21', warmRgb: '222, 160, 24', darkRgb: '253, 224, 71' },
  { type: 'action', class: 'bg-blue-400/50', name: 'Action', lightRgb: '96, 165, 250', warmRgb: '88, 134, 185', darkRgb: '56, 189, 248' },
  { type: 'camera', class: 'bg-green-400/50', name: 'Camera', lightRgb: '74, 222, 128', warmRgb: '110, 158, 90', darkRgb: '52, 211, 153' },
  { type: 'shot', class: 'bg-purple-400/50', rgb: '192, 132, 252', name: 'Shot', lightRgb: '192, 132, 252', warmRgb: '168, 115, 172', darkRgb: '168, 85, 247' } as any,
  { type: 'audio', class: 'bg-orange-400/50', name: 'Audio', lightRgb: '251, 146, 60', warmRgb: '216, 108, 54', darkRgb: '249, 115, 22' },
  { type: 'vfx', class: 'bg-cyan-400/50', name: 'VFX', lightRgb: '34, 211, 238', warmRgb: '52, 160, 170', darkRgb: '45, 212, 191' },
  { type: 'transition', class: 'bg-pink-400/50', name: 'Transition', lightRgb: '244, 114, 182', warmRgb: '216, 102, 136', darkRgb: '244, 114, 182' },
  { type: 'environment', class: 'bg-slate-400/50', name: 'Environment', lightRgb: '148, 163, 184', warmRgb: '158, 146, 130', darkRgb: '148, 163, 184' },
];

/**
 * Returns the theme-calibrated RGB string, opacity multiplier, and contrast styling for a cue type.
 */
export function getCueColorForTheme(
  typeOrClass?: string,
  themeId: ScriptThemeId = 'studio-light'
): {
  type: string;
  rgb: string;
  baseOpacity: number;
  textColorClass: string;
  borderClass: string;
  dotColor: string;
} {
  const theme = getScriptTheme(themeId);
  const normalized = (typeOrClass || '').toLowerCase().trim();
  
  const match = CUE_THEME_COLORS.find(c => 
    c.type === normalized || 
    c.class === normalized || 
    (normalized && c.class.startsWith(normalized.split('/')[0]))
  ) || CUE_THEME_COLORS[0];

  let rgb = match.lightRgb;
  let baseOpacity = 0.50;
  let textColorClass = 'text-stone-900';
  let borderClass = 'border-transparent';

  if (theme.category === 'warm') {
    rgb = match.warmRgb;
    baseOpacity = match.type === 'dialogue' ? 0.52 : 0.44;
    textColorClass = 'text-[#2e261f]';
    borderClass = 'border-amber-900/10';
  } else if (theme.category === 'dark') {
    rgb = match.darkRgb;
    // Dialogue gets higher opacity and distinctive vivid brightness for instant glanceability
    baseOpacity = match.type === 'dialogue' ? 0.50 : 0.34;
    textColorClass = match.type === 'dialogue' ? 'text-amber-100 font-medium' : 'text-stone-100';
    borderClass = match.type === 'dialogue' ? 'border-amber-400/30' : 'border-white/10';
  }

  return {
    type: match.type,
    rgb,
    baseOpacity,
    textColorClass,
    borderClass,
    dotColor: `rgb(${rgb})`
  };
}

export function getScriptTheme(id?: string): ScriptTheme {
  if (id && id in SCRIPT_THEMES) {
    return SCRIPT_THEMES[id as ScriptThemeId];
  }
  return SCRIPT_THEMES[DEFAULT_SCRIPT_THEME_ID];
}

/**
 * Returns the Tailwind CSS classes for a given script line based on its type and active theme.
 */
export function getLineClass(line: ProcessedLine, themeId: ScriptThemeId = 'studio-light'): string {
  const { type, charName, isBrief } = line;
  const theme = getScriptTheme(themeId);
  
  // Base style for all lines
  const baseStyle = "whitespace-pre-wrap min-h-[1em] leading-snug";
  
  if (isBrief) {
    return `${baseStyle} font-mono text-[12px] border border-dashed ${
      theme.isDark ? 'border-stone-700/50' : 'border-stone-300/40'
    } rounded px-3 py-2 my-2 ${theme.textColor}`;
  }

  switch (type) {
    case 'name':
      return `${baseStyle} text-center font-bold mb-0.5 tracking-tight uppercase ${theme.textColor}`;
    
    case 'speech':
      return `${baseStyle} text-center max-w-[75%] mx-auto mb-0.5 ${theme.textColor}`;
    
    case 'parenthetical':
      if (charName) {
        // Dialogue parenthetical
        return `${baseStyle} text-center max-w-[75%] mx-auto italic mb-0.5 text-[11px] ${theme.textMutedColor}`;
      }
      // Generic action parenthetical
      return `${baseStyle} italic mb-0.5 text-[13px] ${theme.textMutedColor}`;
    
    case 'heading':
      return `${baseStyle} font-bold mt-5 mb-2 tracking-tight uppercase ${theme.headingBg} ${theme.headingBorder} ${theme.textColor} -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12 py-2.5`;
    
    case 'note':
      return `${baseStyle} font-mono text-[11px] uppercase tracking-tight mb-1 ${theme.textMutedColor}`;
    
    case 'effect':
      return `${baseStyle} italic mb-1 ${theme.textMutedColor}`;
    
    case 'action':
      return `${baseStyle} font-bold mt-3 mb-0.5 tracking-tight ${theme.textColor}`;
    
    default:
      return `${baseStyle} mb-0.5 ${theme.textColor}`;
  }
}

/**
 * Returns dynamic structural styles matching the active theme.
 */
export function getScriptThemeStyles(themeId: ScriptThemeId = 'studio-light') {
  const theme = getScriptTheme(themeId);
  return {
    separator: `${theme.separatorBorder} mt-10 mb-2 -mx-6 md:-mx-8 lg:-mx-12`,
    titleContainer: "flex items-center gap-4 mt-12 mb-2 -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12",
    titleText: `text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap ${theme.titleTextColor}`,
    titleLine: `h-px flex-1 ${theme.titleLineBg}`,
    stagingContainer: "flex flex-wrap items-center justify-center gap-1.5 lg:gap-2 mb-2 lg:mb-0 max-w-full py-0.5",
    stagingBadgeBase: `flex items-center gap-1 lg:gap-1.5 px-2 py-0.5 lg:px-3 lg:py-1 rounded-full border shadow-sm transition-all shrink-0 ${theme.stagingBadgeBg} ${theme.stagingBadgeBorder}`,
    stagingBadgeActive: theme.isDark 
      ? "hover:border-stone-500 hover:shadow-md active:scale-95" 
      : "hover:border-stone-400 hover:shadow-md active:scale-95",
    stagingBadgeDisabled: "opacity-30 cursor-not-allowed",
    stagingBadgeText: `text-[7.5px] lg:text-[9px] font-black uppercase tracking-wider lg:tracking-widest ${theme.stagingBadgeText}`,
    stagingBadgeIcon: theme.stagingBadgeIcon,
    cueBase: `transition-all duration-300 rounded-sm px-0.5 relative group ${theme.textColor}`,
    cueEdit: theme.isDark 
      ? "cursor-pointer hover:ring-1 hover:ring-stone-500" 
      : "cursor-pointer hover:ring-1 hover:ring-stone-400",
    cueTemp: "ring-2 ring-blue-400 ring-inset",
    cueEditing: theme.isDark 
      ? "ring-2 ring-white ring-inset z-10 shadow-sm" 
      : "ring-2 ring-stone-900 ring-inset z-10 shadow-sm"
  };
}

/**
 * Backward compatibility static styles.
 */
export const SCRIPT_STYLES = getScriptThemeStyles('studio-light');
