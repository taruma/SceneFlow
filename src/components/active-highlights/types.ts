import { Cue } from '../../types/script';
import { CueThemeResolvedColor, ScriptThemeId } from '../../styles';

/**
 * View presentation modes for active highlights during video playback.
 * - `cards`: Standard card view featuring quotes, accent bars, and category tags.
 * - `compact`: Dense single-line badges optimized for scenes with many simultaneous cues.
 * - `stream`: Real-time HUD view focusing on primary dialogue with micro technical indicators.
 */
export type HighlightViewMode = 'cards' | 'compact' | 'stream';

/**
 * Props for the main ActiveHighlightsPanel orchestrator.
 */
export interface ActiveHighlightsPanelProps {
  /** All cues defined in the screenplay timeline */
  cues: Cue[];
  /** Predicate returning true if the cue is active at current playback time and not hidden */
  isCueVisible: (cue: Cue) => boolean;
  /** Set of cue types (dialogue, action, etc.) that are currently active in playback */
  activeCueTypes: Set<string>;
  /** Set of cue types explicitly hidden by the user via filter buttons */
  hiddenCueTypes: Set<string>;
  /** Handler to toggle visibility for a given cue type */
  toggleCueTypeVisibility: (type: string) => void;
  /** Active script theme ID used to resolve CSS/RGB accent colors */
  scriptThemeId: ScriptThemeId | string;
  /** Optional layout view mode (defaults to 'cards') */
  viewMode?: HighlightViewMode;
  /** Optional click handler for a cue item (e.g., jump video to cue.startTime) */
  onCueClick?: (cue: Cue) => void;
}

/**
 * Props for individual active highlight card.
 */
export interface HighlightCardProps {
  /** Cue data model */
  cue: Cue;
  /** Theme-resolved color tokens (RGB values, CSS classes) */
  themedColor: CueThemeResolvedColor;
  /** Index position within the visible cues list */
  index?: number;
  /** Optional click callback for seeking or inspection */
  onClick?: (cue: Cue) => void;
}

/**
 * Props for the cue category filter pill legend.
 */
export interface HighlightFilterBarProps {
  /** Set of cue types active at the current playback timestamp */
  activeCueTypes: Set<string>;
  /** Set of cue types disabled/muted by the user */
  hiddenCueTypes: Set<string>;
  /** Handler to toggle category visibility */
  onToggleCueType: (type: string) => void;
  /** Function resolving theme color for a given cue category */
  resolveCueColor: (typeOrClass?: string) => CueThemeResolvedColor;
}
