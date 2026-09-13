import React, { memo, useMemo } from 'react';
import { Cue } from '../../types/script';
import { CuePaletteProfile } from '../../styles';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { SyncCuesHeader } from './SyncCuesHeader';
import { CueLegend } from './CueLegend';
import { SyncCueCard } from './SyncCueCard';

export interface SyncCuesPanelProps {
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
 * Orchestrator panel for Sync Cues in Edit Mode.
 * Composes SyncCuesHeader, CueLegend, and memoized SyncCueCard elements.
 * Displays cues in a memoized chronologically sorted order.
 */
export const SyncCuesPanel: React.FC<SyncCuesPanelProps> = memo(({
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
  const sortedCues = useMemo(() => {
    return [...(cues || [])].sort((a, b) => 
      (a.startTime ?? 0) - (b.startTime ?? 0) || 
      (a.startIndex ?? 0) - (b.startIndex ?? 0)
    );
  }, [cues]);

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <SyncCuesHeader
            cueCount={sortedCues.length}
            onOpenRawCuesModal={onOpenRawCuesModal}
            onRealignCues={onRealignCues}
            isAligning={isAligning}
            alignSuccess={alignSuccess}
          />

          <CueLegend
            scriptThemeId={scriptThemeId}
            cuePaletteProfile={cuePaletteProfile}
          />
        </div>

        <div className="grid gap-3">
          {sortedCues.map((cue, idx) => (
            <SyncCueCard
              key={cue.id ? `sync-cue-${cue.id}-${idx}` : `sync-cue-idx-${idx}`}
              cue={cue}
              isSelected={selectedCueId === cue.id}
              onSelectCue={onSelectCue}
              onDeleteCue={onDeleteCue}
              scriptThemeId={scriptThemeId}
              cuePaletteProfile={cuePaletteProfile}
            />
          ))}

          {sortedCues.length === 0 && (
            <div className={UI_TOKENS.panel.emptyPlaceholder}>
              <p className="text-sm text-text-faint font-medium italic">No cues created yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

SyncCuesPanel.displayName = 'SyncCuesPanel';
