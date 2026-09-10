import { 
  getCueDefinitionsForProfile, 
  LEGACY_CLASS_MAP, 
  type CueThemeResolvedColor,
  type CuePaletteProfile 
} from './tokens/cues';
import { getScriptTheme, type ScriptThemeId } from './tokens/themes';

/**
 * Returns the theme-calibrated RGB string, opacity multiplier, and contrast styling for a cue type.
 */
export function getCueColorForTheme(
  typeOrClass?: string,
  themeId: ScriptThemeId = 'studio-light',
  paletteProfile: CuePaletteProfile | string = 'standard'
): CueThemeResolvedColor {
  const theme = getScriptTheme(themeId);
  const raw = (typeOrClass || '').toLowerCase().trim();
  const normalized = LEGACY_CLASS_MAP[raw] || raw;
  
  const definitions = getCueDefinitionsForProfile(paletteProfile);
  const match = definitions.find(c => 
    c.type === normalized || 
    c.class === normalized || 
    (normalized && c.class.startsWith(normalized.split('/')[0]))
  ) || definitions[0];

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
