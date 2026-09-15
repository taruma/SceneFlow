import React, { memo } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CueEditorActionsProps {
  isEditing: boolean;
  canSave: boolean;
  onSave: () => void;
  onDelete?: () => void;
}

export const CueEditorActions: React.FC<CueEditorActionsProps> = memo(({
  isEditing,
  canSave,
  onSave,
  onDelete,
}) => {
  return (
    <div className="flex items-center gap-2">
      {isEditing && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-text-faint hover:text-red-500 transition-colors"
          title="Delete Cue"
        >
          <Trash2 size={18} />
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className={cn(
          "px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
          canSave 
            ? (isEditing ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md" : "bg-blue-500 hover:bg-blue-600 text-white shadow-md")
            : "bg-surface-muted text-text-faint cursor-not-allowed"
        )}
      >
        <Check size={14} /> {isEditing ? 'Update Cue' : 'Save Cue'}
      </button>
    </div>
  );
});

CueEditorActions.displayName = 'CueEditorActions';
