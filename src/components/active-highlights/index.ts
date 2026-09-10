// Orchestrator
export { ActiveHighlightsPanel } from './ActiveHighlightsPanel';

// Subcomponents & Views
export { HighlightCard } from './HighlightCard';
export { HighlightFilterBar } from './HighlightFilterBar';
export { HighlightTimelineView } from './views/HighlightTimelineView';
export { HighlightCardsView } from './views/HighlightCardsView';

// Timeline Primitives (for reuse)
export { TimelineLane } from './timeline/TimelineLane';
export { TimelineCueBlock } from './timeline/TimelineCueBlock';
export { TimelinePlayheadRuler } from './timeline/TimelinePlayheadRuler';
export { useTimelineWindow, formatTimelineTimecode } from './timeline/useTimelineWindow';

// Inspector Primitives (for reuse)
export { PausedInspectorCard } from './inspector/PausedInspectorCard';

// Types & Contracts
export * from './types';
