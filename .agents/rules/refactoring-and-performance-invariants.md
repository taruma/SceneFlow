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

---

## 5. Native Event Lifecycle & Trailing Click Shielding on Interactive Containers

- **The React DOM Mutation vs. Native Selection Race**:
  - In browsers, mouse drag operations dispatch `mousedown` $\to$ `mousemove` $\to$ `mouseup` $\to$ trailing `click`.
  - If a `mouseup` handler updates React state that replaces or wraps the underlying DOM `TextNode` (such as inserting temporary selection highlight spans `<span className="cueTemp">`), the browser engine immediately invalidates and collapses the native selection range (`sel.isCollapsed === true`, `sel.toString() === ""`).
- **Insufficient Guard (`window.getSelection()`)**:
  - Never rely solely on `if (sel && !sel.isCollapsed)` inside container `onClick` handlers to protect text drag selections from dismissal logic. By the time `click` executes, the native selection may already be collapsed by React's DOM insertion.
- **Defensive Multi-Tier Trailing Click Shielding**:
  - Whenever implementing canvas-level click-to-dismiss behavior on containers supporting drag-selection:
    1. **Synchronous Capture Flag (`justSelectedRef`)**: Have selection handlers return a boolean signal upon successful capture. Set a single-use ref flag (`justSelectedRef.current = true`) on `mouseup`, and consume/exit on this flag in `onClick`.
    2. **Mouse Displacement Threshold (`mouseDownPosRef`)**: Record `(clientX, clientY)` on `onMouseDown`. In `onClick`, measure displacement: if `Math.hypot(dx, dy) > 4`, treat the event as a drag gesture rather than a stationary click.
    3. **Ref Garbage Collection**: Always reset `mouseDownPosRef.current = null` immediately after distance evaluation to guarantee 1:1 event pairing and prevent stale coordinates from contaminating synthetic or keyboard events.
    4. **Active Selection Guarding on Nested Click Targets**: If children have `onClick` actions (e.g. cue cards in a list), guard them with `if (sel && !sel.isCollapsed) return;` so drag gestures crossing child boundaries do not trigger click actions.

---

## 6. Investigation Discipline: Architectural Code Evaluation Before Browser Subagents

- **Symptom Observation vs. Root-Cause Analysis**:
  - When investigating UI discrepancies, event failures, or regressions reported by the user, **always perform code inspection and commit history tracing (`git log -S`, `git log -L`) before launching browser subagents**.
  - Browser subagents verify runtime symptoms, but static code tracing and git archaeology isolate the exact commit, author intent, and lifecycle race condition that caused the defect.
  - Browser subagents should be reserved for **verification after formulating the hypothesis and testing the fix**, rather than open-ended initial exploration.
