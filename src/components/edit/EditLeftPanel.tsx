import React from 'react';
import { WorkstationLeftPanel, WorkstationLeftPanelProps } from '../left-panel';
export { YOUTUBE_PLAYER_OPTS } from '../left-panel';

export type EditLeftPanelProps = Omit<WorkstationLeftPanelProps, 'mode'>;

/**
 * Dedicated Left Panel container for Edit mode (Backwards compatibility bridge).
 * Delegates directly to unified WorkstationLeftPanel with mode="edit".
 */
export const EditLeftPanel: React.FC<EditLeftPanelProps> = (props) => {
  return <WorkstationLeftPanel mode="edit" {...props} />;
};

EditLeftPanel.displayName = 'EditLeftPanel';
