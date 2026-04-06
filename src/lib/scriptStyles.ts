import { ProcessedLine } from '../types/script';

/**
 * Returns the Tailwind CSS classes for a given script line based on its type.
 * This keeps the styling logic separate from the component structure.
 */
export function getLineClass(line: ProcessedLine): string {
  const { type, charName } = line;
  
  // Base style for all lines
  const baseStyle = "whitespace-pre-wrap min-h-[1em] leading-snug";
  
  switch (type) {
    case 'name':
      return `${baseStyle} text-center font-bold text-stone-900 mb-0.5 tracking-tight uppercase`;
    
    case 'speech':
      return `${baseStyle} text-center max-w-[75%] mx-auto mb-0.5 text-stone-700`;
    
    case 'parenthetical':
      if (charName) {
        // Dialogue parenthetical
        return `${baseStyle} text-center max-w-[75%] mx-auto italic text-stone-400 mb-0.5 text-[11px]`;
      }
      // Generic action parenthetical
      return `${baseStyle} italic text-stone-500 mb-0.5 text-[13px]`;
    
    case 'heading':
      return `${baseStyle} font-bold text-stone-900 mt-5 mb-2 tracking-tight uppercase bg-stone-50 border-y border-stone-100 -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12 py-2.5`;
    
    case 'note':
      return `${baseStyle} font-mono text-[11px] text-stone-500 uppercase tracking-tight mb-1`;
    
    case 'effect':
      return `${baseStyle} italic text-stone-400 mb-1`;
    
    case 'action':
      return `${baseStyle} font-bold text-stone-900 mt-3 mb-0.5 tracking-tight`;
    
    default:
      return `${baseStyle} text-stone-700 mb-0.5`;
  }
}

/**
 * Styles for special structural elements like separators.
 */
export const SCRIPT_STYLES = {
  separator: "border-stone-100 mt-10 mb-2 -mx-6 md:-mx-8 lg:-mx-12",
  titleContainer: "flex items-center gap-4 mt-12 mb-2 -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12",
  titleText: "text-[9px] font-black text-stone-400 uppercase tracking-[0.4em] whitespace-nowrap",
  titleLine: "h-px bg-stone-200/50 flex-1",
  stagingContainer: "hidden lg:flex items-center justify-center gap-2",
  stagingBadgeBase: "flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 bg-white shadow-sm transition-all",
  stagingBadgeActive: "hover:border-stone-400 hover:shadow-md active:scale-95",
  stagingBadgeDisabled: "opacity-30 cursor-not-allowed",
  stagingBadgeText: "text-[9px] font-black uppercase tracking-widest text-stone-500",
  cueBase: "transition-all duration-300 rounded-sm px-0.5 text-stone-900 relative group",
  cueEdit: "cursor-pointer hover:ring-1 hover:ring-stone-400",
  cueTemp: "ring-2 ring-blue-400 ring-inset",
  cueEditing: "ring-2 ring-stone-900 ring-inset z-10 shadow-sm"
};

/**
 * Themes for the ScriptPreview component.
 */
export const SCRIPT_THEMES = {
  standard: {
    container: "bg-white shadow-sm border border-stone-100 rounded-xl",
    line: "mb-0.5",
    activeLine: "opacity-100",
    inactiveLine: "opacity-40 transition-opacity duration-700",
    transition: "border-stone-100 mt-10 mb-2 -mx-6 md:-mx-8 lg:-mx-12",
    title: "flex items-center gap-4 mt-12 mb-2 -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12",
    heading: "font-bold text-stone-900 mt-5 mb-2 tracking-tight uppercase bg-stone-50 border-y border-stone-100 -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12 py-2.5",
    character: "text-center font-bold text-stone-900 mb-0.5 tracking-tight uppercase",
    dialogue: "text-center max-w-[75%] mx-auto mb-0.5 text-stone-700",
    parenthetical: "text-center max-w-[75%] mx-auto italic text-stone-400 mb-0.5 text-[11px]",
    action: "font-bold text-stone-900 mt-3 mb-0.5 tracking-tight",
    note: "font-mono text-[11px] text-stone-500 uppercase tracking-tight mb-1",
    effect: "italic text-stone-400 mb-1",
    separator: "border-stone-100 mt-10 mb-2 -mx-6 md:-mx-8 lg:-mx-12",
  },
  compact: {
    container: "bg-transparent",
    line: "mb-0",
    activeLine: "opacity-100",
    inactiveLine: "opacity-60",
    transition: "border-stone-100 my-4",
    title: "flex items-center gap-2 my-6",
    heading: "font-bold text-stone-900 mt-4 mb-1 tracking-tight uppercase text-sm",
    character: "font-bold text-stone-900 mb-0 tracking-tight uppercase text-xs",
    dialogue: "mb-0 text-stone-700 text-sm",
    parenthetical: "italic text-stone-400 mb-0 text-[10px]",
    action: "font-bold text-stone-900 mt-2 mb-0 tracking-tight text-sm",
    note: "font-mono text-[10px] text-stone-500 uppercase tracking-tight mb-0",
    effect: "italic text-stone-400 mb-0 text-sm",
    separator: "border-stone-100 my-4",
  }
};
