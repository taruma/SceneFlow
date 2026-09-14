---
description: Architectural invariants, desktop isolation, domain nomenclature, and performance rules for Edit mode and cue authoring in SceneFlow.
---

# Edit Mode Architecture & Invariants

When developing, refactoring, or adding features to Edit mode in SceneFlow, strictly adhere to these core principles:

## 1. Strict Desktop-Only Isolation
- SceneFlow mobile and tablet viewports (< 1024px) are exclusively designed for screenplay reading and video playback.
- Edit mode, cue authoring, raw text/cues modals, and split dividers are **desktop-only**:
  - Guard all Edit-mode layouts with `isDesktop` and `hidden lg:flex`.
  - Never render cue authoring forms, editing controls, or split pane handles on mobile viewports.

## 2. Domain Nomenclature: "Sync Cues" vs. "Timeline"
- **Playback Timeline**: The term **"Timeline"** is reserved exclusively for the graphical, multi-track time-window visualization in Playback mode (`HighlightTimelineView`, `TimelineLane`, `TimelineCueBlock`).
- **Edit Mode Sync Cues**: Edit mode does **not** feature a visual timeline track. It manages a vertical card-based cue list:
  - Header: `"Sync Cues"` (`SyncCuesHeader.tsx`).
  - Container: `SyncCuesPanel.tsx` (not `TimelineCuesPanel`).
  - Card: `SyncCueCard.tsx` (not `TimelineCueCard`).
  - Legend: `CueLegend.tsx`.
  - Form: `CueEditorForm.tsx` (with `CueTextSection`, `CueTimingInputs`, `CueTypeSelector`, `CueEditorActions`).
- Maintain this distinction to prevent conceptual confusion and UI misdirection.

## 3. Drag & Playback Tick Performance Shields
- **Zero Allocations on Drag Frames**:
  - Never execute string operations (such as `scriptText.split('\n')`) or unbounded array transformations inside render bodies or mousemove listeners. Consume pre-computed metrics (`processedLines.length`).
- **React.memo Decoupling**:
  - Video playback ticks re-render `App.tsx` at 10–60Hz to update `currentTime`.
  - Because `EditLeftPanel`, `SyncCuesPanel`, `CueEditorForm`, and `ScriptHeaderControls` do not consume continuous `currentTime`, they must remain wrapped in `React.memo` to eliminate cascading re-renders.

## 4. Header Symmetrical Layout & Action Scoping
- **Zero-Pixel Shift**: Both Playback and Edit headers must strictly share the `h-12` (48px) sticky top-0 layout token (`UI_TOKENS.layout.scriptHeader`). Switching modes must produce 0px vertical layout jump.
- **Symmetrical Context Titles**:
  - Playback Mode: `[FileText] Script Preview` + Auto-Scroll controls.
  - Edit Mode: `[FileText] Script Editor` + line count badge.
- **Action Scoping (Option B)**:
  - Screenplay text actions (`[Edit Raw]` screenplay modal and line counter) must be docked directly in the Right Panel header (`ScriptHeaderControls`) above the screenplay text it modifies, not in the Left Media panel.

## 5. Cue Data Integrity & Chronological Ordering
- **Validation Encapsulation**:
  - `canSave` validation logic resides inside `useCueEditor`, enforcing `endTime >= startTime`, `endIndex >= startIndex`, and non-whitespace trimmed text.
- **Predictable Card Presentation**:
  - `SyncCuesPanel` renders cue cards in memoized chronological order (`startTime` ascending, secondary on `startIndex`), ensuring the card list remains organized and predictable regardless of JSON array insertion order.
- **Defensive Rendering**:
  - Always guard numeric formatting against null/undefined timestamps using `(cue.startTime ?? 0).toFixed(1)`.
