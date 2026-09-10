import { Cue, TimingSettings } from '../../types/script';
import { CueThemeResolvedColor, ScriptThemeId } from '../../styles';

/**
 * View presentation modes for active highlights during video playback.
 * - `timeline`: Modern horizontal multi-track sync timeline with stationary playhead.
 * - `cards`: Classic floating cards view (legacy mode).
 */
export type HighlightViewMode = 'timeline' | 'cards';

/**
 * Props for the main ActiveHighlightsPanel orchestrator.
 */
export interface ActiveHighlightsPanelProps {
  /** All cues defined in the screenplay timeline */
  cues: Cue[];
  /** Global and per-category timing settings for cue activation buffers */
  settings?: Record<string, TimingSettings>;
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
  /** Current video playback timestamp in seconds */
  currentTime?: number;
  /** Whether video playback is currently active */
  isPlaying?: boolean;
  /** Seek video playback to an exact timestamp in seconds, optionally forcing playback */
  onSeekTo?: (seconds: number, autoPlay?: boolean) => void;
  /** Seek video playback and synchronize screenplay canvas to a specific cue, optionally forcing playback */
  onSeekCue?: (cue: Cue, autoPlay?: boolean) => void;
  /** Optional controlled view presentation mode */
  viewMode?: HighlightViewMode;
  /** Callback fired when user switches view mode */
  onViewModeChange?: (mode: HighlightViewMode) => void;
  /** Optional click handler for a cue item (legacy compatibility) */
  onCueClick?: (cue: Cue) => void;
}

/**
 * Configuration for the rolling timeline window calculation.
 */
export interface TimelineWindowConfig {
  /** Total visible window duration in seconds (default: 8.0s) */
  totalSpanSeconds?: number;
  /** Playhead horizontal position ratio from left edge (default: 0.35 for 35% anticipation) */
  playheadRatio?: number;
}

/**
 * Normalized cue positioned on a horizontal timeline track with percentage coordinates.
 */
export interface TimelineCalculatedCue {
  /** Source cue data */
  cue: Cue;
  /** Horizontal start coordinate in percent [0, 100] */
  leftPercent: number;
  /** Horizontal width in percent [0, 100] */
  widthPercent: number;
  /** Whether the stationary playhead is currently intersecting this cue block */
  isPlayheadInside: boolean;
  /** Resolved cue theme color tokens */
  themedColor: CueThemeResolvedColor;
  /** Sub-lane vertical index when multiple cues in the same category overlap */
  subLaneIndex: number;
  /** Total number of sub-lanes required by this category in current window */
  totalSubLanes: number;
}

/**
 * Timecode tick mark along the timeline ruler.
 */
export interface TimelineTimecodeTick {
  /** Time in seconds */
  timeSeconds: number;
  /** Formatted timecode label (e.g., "00:14") */
  label: string;
  /** Horizontal position in percent [0, 100] */
  leftPercent: number;
  /** Whether this tick corresponds to a full second or key interval */
  isMajor: boolean;
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

/**
 * Props for the docked paused inspector card.
 */
export interface PausedInspectorCardProps {
  /** List of cues currently active at the paused playhead position */
  activeCues: Cue[];
  /** Currently selected/inspected cue */
  selectedCue: Cue | null;
  /** Handler to select a specific cue if multiple overlap */
  onSelectCue: (cue: Cue) => void;
  /** Handler to replay this cue from its start time */
  onReplayCue: (cue: Cue) => void;
  /** Theme color resolver */
  resolveCueColor: (typeOrClass?: string) => CueThemeResolvedColor;
}
