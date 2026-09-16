# Refactoring & Performance Invariants

Universal behavioral guardrails, architectural invariants, and verification protocols for refactoring, bundle optimization, and performance engineering in SceneFlow.

---

## 1. The Rule of Single-Responsibility Commits (Blast-Radius Isolation)

- **Strict Separation**: **Never combine bundler configuration or code-splitting with dead-code deletion or component refactoring in the same commit.**
- **Rationale**: Pruning npm packages can generate thousands of lines of changes in `package-lock.json`. When mixed with JSX restructuring, git diff reviewability collapses, and subtle regressions (such as accidentally omitted JSX tags) are easily masked by diff noise.
- **Commit Sequencing Protocol**:
  1. **Phase 1 (Pruning)**: Remove dead dependencies or orphaned files. Verify tests pass and commit independently (`chore(deps): prune unused dependencies`).
  2. **Phase 2 (Bundler Config)**: Configure Vite, Rollup manual chunks, or build options. Verify production builds and commit independently (`perf(bundle): configure rollup vendor chunks`).
  3. **Phase 3 (Component Code-Splitting)**: Introduce `React.lazy()` and `<Suspense>` wrappers. Verify behavior in the browser and commit independently (`perf(bundle): lazy-load secondary dialogs`).

---

## 2. Surgical JSX Wrapping & Sibling Inventory (No Wholesale Block Replacement)

- **No Wholesale Replacement**: When wrapping existing components in `<Suspense fallback={...}>`, `<Fragment>`, or contextual layout providers, **never delete and retype the surrounding JSX block wholesale**.
- **Sibling Node Inventory**:
  - Perform an explicit inventory of all sibling nodes rendered in that block before making modifications.
  - In SceneFlow, secondary dialogs (`RawScriptModal`, `LibraryModal`, `ScriptColorModal`, etc.) can be lazy-loaded, but synchronous confirmation and picker modals (`ResetConfirmationModal`, `DeleteConfirmationModal`, `OverlapPicker`) must remain permanently mounted in the root render tree.
- **Import/Render Parity**: Every component imported at the top of an orchestrator file (`App.tsx`) must have an intentional, active presence in the JSX tree unless explicitly deprecated.

---

## 3. State Producer / Consumer Parity Invariant

- **Active Consumer Requirement**: **Every state setter invoked in the application must have an active consumer mounted in the rendered DOM tree.**
- **Orphaned State Detection**:
  - In SceneFlow, user actions in child panels trigger state mutations via props and hooks (e.g., `setResetConfirmation`, `setDeleteConfirmation`, `setOverlapPicker`).
  - If a state setter is invoked anywhere in the tree, its corresponding dialog consumer must be rendered:
    - `setResetConfirmation` $\to$ `<ResetConfirmationModal resetConfirmation={resetConfirmation} ... />`
    - `setDeleteConfirmation` $\to$ `<DeleteConfirmationModal isOpen={deleteConfirmation.isOpen} ... />`
    - `setOverlapPicker` $\to$ `<OverlapPicker isOpen={overlapPicker.isOpen} ... />`
  - Calling a setter whose dialog is unmounted fails silently: state updates in memory, but no UI ever appears, giving the appearance of a total feature freeze.

---

## 4. Mandatory Behavioral Smoke Testing Beyond Static Typechecks

- **Insufficient Verification**: **Never treat `tsc --noEmit` or `vite build` as proof of zero regression for UI layout, dialog mounting, or component refactoring.**
- **Why Typechecks Fail Here**:
  - Unused JSX imports or unmounted components do not trigger TypeScript errors when `noUnusedLocals` is disabled.
  - Bundlers only verify module graph resolution and syntax parsing, not runtime UI presence.
- **Verification Protocol**:
  - Whenever modal mounting, dialog lifecycles, or primary routing are modified, execute an automated browser smoke test covering:
    1. **Dialog Ingress**: Open the dialog (via button, hotkey, or file menu).
    2. **Guarded Action**: Trigger a confirmation-dependent action (e.g., click a Library example card, delete a cue, reset settings).
    3. **Confirmation Verification**: Verify that the confirmation modal displays on screen with expected warning text.
    4. **State Persistence**: Confirm the prompt and verify that the target action (e.g. project load, cue deletion) completes successfully.
