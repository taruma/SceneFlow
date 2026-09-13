/**
 * Backwards-compatibility bridge for CueEditorForm.
 * The implementation is modularized in `./edit/`.
 */
export {
  CueEditorForm,
  CueTextSection,
  CueTimingInputs,
  CueTypeSelector,
  CueEditorActions,
} from './edit';

export type {
  CueEditorFormProps,
  CueTextSectionProps,
  CueTimingInputsProps,
  CueTypeSelectorProps,
  CueEditorActionsProps,
} from './edit';
