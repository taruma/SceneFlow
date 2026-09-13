/**
 * Backwards-compatibility bridge for TimelineCuesPanel.
 * The implementation is modularized in `./edit/`.
 */
export { 
  TimelineCuesPanel,
  TimelineCueCard,
  TimelineCueLegend,
  TimelineCuesHeader 
} from './edit';

export type {
  TimelineCuesPanelProps,
  TimelineCueCardProps,
  TimelineCueLegendProps,
  TimelineCuesHeaderProps,
} from './edit';
