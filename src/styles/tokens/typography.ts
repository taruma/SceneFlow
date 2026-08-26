import type { ProcessedLine } from '../../lib/scriptProcessor';
import { getScriptTheme, type ScriptThemeId } from './themes';

export const SCREENPLAY_BASE_STYLE = "whitespace-pre-wrap min-h-[1em] leading-snug";

/**
 * Returns the Tailwind CSS classes for a given script line based on its type and active theme.
 */
export function getLineClass(line: ProcessedLine, themeId: ScriptThemeId = 'studio-light'): string {
  const { type, charName, isBrief } = line;
  const theme = getScriptTheme(themeId);
  
  if (isBrief) {
    return `${SCREENPLAY_BASE_STYLE} font-mono text-[12px] border border-dashed rounded-lg px-3.5 py-2.5 my-2.5 transition-colors ${theme.briefBorder} ${theme.briefBg} ${theme.textColor}`;
  }

  switch (type) {
    case 'name':
      return `${SCREENPLAY_BASE_STYLE} text-center font-bold mb-0.5 tracking-tight uppercase ${theme.textColor}`;
    
    case 'speech':
      return `${SCREENPLAY_BASE_STYLE} text-center max-w-[75%] mx-auto mb-0.5 ${theme.textColor}`;
    
    case 'parenthetical':
      if (charName) {
        // Dialogue parenthetical
        return `${SCREENPLAY_BASE_STYLE} text-center max-w-[75%] mx-auto italic mb-0.5 text-[11px] ${theme.textMutedColor}`;
      }
      // Generic action parenthetical
      return `${SCREENPLAY_BASE_STYLE} italic mb-0.5 text-[13px] ${theme.textMutedColor}`;
    
    case 'heading':
      return `${SCREENPLAY_BASE_STYLE} font-bold mt-5 mb-2 tracking-tight uppercase ${theme.headingBg} ${theme.headingBorder} ${theme.textColor} -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12 py-2.5`;
    
    case 'note':
      return `${SCREENPLAY_BASE_STYLE} font-mono text-[11px] uppercase tracking-tight mb-1 ${theme.textMutedColor}`;
    
    case 'effect':
      return `${SCREENPLAY_BASE_STYLE} italic mb-1 ${theme.textMutedColor}`;
    
    case 'action':
      return `${SCREENPLAY_BASE_STYLE} font-bold mt-3 mb-0.5 tracking-tight ${theme.textColor}`;
    
    default:
      return `${SCREENPLAY_BASE_STYLE} mb-0.5 ${theme.textColor}`;
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
    briefBadge: `border ${theme.briefBadgeBg} ${theme.briefBadgeBorder} ${theme.briefBadgeText}`,
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
