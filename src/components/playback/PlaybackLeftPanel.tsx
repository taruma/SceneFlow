import React from 'react';
import { WorkstationLeftPanel, WorkstationLeftPanelProps } from '../left-panel';

export type PlaybackLeftPanelProps = Omit<WorkstationLeftPanelProps, 'mode'>;

/**
 * Dedicated Left Panel container for Playback mode (Backwards compatibility bridge).
 * Delegates directly to unified WorkstationLeftPanel with mode="playback".
 */
export const PlaybackLeftPanel: React.FC<PlaybackLeftPanelProps> = (props) => {
  return <WorkstationLeftPanel mode="playback" {...props} />;
};

PlaybackLeftPanel.displayName = 'PlaybackLeftPanel';
