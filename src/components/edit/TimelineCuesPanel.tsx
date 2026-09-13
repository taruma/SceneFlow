import React, { memo } from 'react';
import { Cue } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { TimelineCuesHeader } from './TimelineCuesHeader';
import { TimelineCueLegend } from './TimelineCueLegend';
import { TimelineCueCard } from './TimelineCueCard';

export interface TimelineCuesPanelProps {
  cues: Cue[];
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
  selectedCueId?: string;
  onSelectCue: (cue: Cue) => void;
  onDeleteCue: (id: string) => void;
  onOpenRawCuesModal: () => void;
  onRealignCues: () => void;
  isAligning: boolean;
  alignSuccess: boolean;
}

/**
 * Orchestrator panel for Timeline Cues in Edit Mode.
 * Composes TimelineCuesHeader, TimelineCueLegend, and memoized TimelineCueCard elements.
 */
export const TimelineCuesPanel: React.FC<TimelineCuesPanelProps> = memo(({
  cues,
  scriptThemeId,
  cuePaletteProfile = 'standard',
  selectedCueId,
  onSelectCue,
  onDeleteCue,
  onOpenRawCuesModal,
  onRealignCues,
  isAligning,
  alignSuccess,
}) => {
  const cueList = cues || [];

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <TimelineCuesHeader
            cueCount={cueList.length}
            onOpenRawCuesModal={onOpenRawCuesModal}
            onRealignCues={onRealignCues}
            isAligning={isAligning}
            alignSuccess={alignSuccess}
          />

          <TimelineCueLegend
            scriptThemeId={scriptThemeId}
            cuePaletteProfile={cuePaletteProfile}
          />
        </div>

        <div className="grid gap-3">
          {cueList.map((cue, idx) => (
            <TimelineCueCard
              key={cue.id ? `timeline-${cue.id}-${idx}` : `timeline-idx-${idx}`}
              cue={cue}
              isSelected={selectedCueId === cue.id}
              onSelectCue={onSelectCue}
              onDeleteCue={onDeleteCue}
              scriptThemeId={scriptThemeId}
              cuePaletteProfile={cuePaletteProfile}
            />
          ))}

          {cueList.length === 0 && (
            <div className={UI_TOKENS.panel.emptyPlaceholder}>
              <p className="text-sm text-text-faint font-medium italic">No cues created yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

TimelineCuesPanel.displayName = 'TimelineCuesPanel';
