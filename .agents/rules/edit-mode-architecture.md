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
  - Toolbar: `SyncCuesToolbar.tsx` (houses category filters, search, density toggles, and modal actions).
  - Container: `SyncCuesPanel.tsx` (not `TimelineCuesPanel`).
  - Card: `SyncCueCard.tsx` (not `TimelineCueCard`).
  - Row: `SyncCueRow.tsx` (compact density list item).
  - Form: `CueEditorForm.tsx` (with `CueTextSection`, `CueTimingInputs`, `CueTypeSelector`, `CueEditorActions`, backed by `CueEditorContext`).
- Maintain this distinction to prevent conceptual confusion and UI misdirection.

## 3. Drag & Playback Tick Performance Shields
- **Zero Allocations on Drag Frames**:
  - Never execute string operations (such as `scriptText.split('\n')`) or unbounded array transformations inside render bodies or mousemove listeners. Consume pre-computed metrics (`processedLines.length`).
- **React.memo Decoupling**:
  - Video playback ticks re-render `App.tsx` at 10–60Hz to update `currentTime`.
  - Because `EditLeftPanel`, `SyncCuesPanel`, `CueEditorForm`, and `ScriptHeaderControls` do not consume continuous `currentTime`, they must remain wrapped in `React.memo` to eliminate cascading re-renders.
  - **Memoized Style Objects**: Never pass inline style object literals (e.g. `style={{ width: `${splitRatio}%` }}`) to memoized panels in `App.tsx`; always memoize via `useMemo`.
  - **Theme Resolution Hoisting**: Never invoke `useScriptTheme` inside individual cue cards or row items. Hoist `resolveCueColor` to `SyncCuesPanel` and pass down the stable function reference to avoid thousands of redundant hook calls per second during playback.
  - **Pure Fallback Discipline (No "Hook-as-Fallback")**: Never use a React hook as a fallback for an optional hoisted prop inside mapped children or list cards. If a fallback is needed, consume a pure utility function (`getCueColorForTheme`) to guarantee zero hook registrations per list item.
  - **Offscreen Paint Skipping**: The scrollable cue list must declare `content-visibility: auto` with `contain-intrinsic-size` to permit the browser engine to skip layout and paint calculations for offscreen cue cards.
  - **Static Player Options (`YOUTUBE_PLAYER_OPTS`)**: Never pass inline `opts={{ ... }}` object literals to `<YouTube>` inside panels. Consume static, module-level `YOUTUBE_PLAYER_OPTS` to avoid player reconfiguration checks.
  - **Tick Shield Boundary (`EditVideoViewport`)**: When a container hosts high-frequency display elements (`LiveTimecodeBadge` at 10Hz) alongside heavy iframe viewports, encapsulate the heavy viewport inside a dedicated `React.memo` subcomponent (`EditVideoViewport`). This confines DOM updates strictly to the timecode HUD badge.

## 4. Header Symmetrical Layout & Action Scoping
- **Zero-Pixel Shift**: Both Playback and Edit headers must strictly share the `h-12` (48px) sticky top-0 layout token (`UI_TOKENS.layout.scriptHeader`). Switching modes must produce 0px vertical layout jump.
- **Symmetrical Context Titles**:
  - Playback Mode: `[FileText] Script Preview` + Auto-Scroll controls.
  - Edit Mode: `[FileText] Script Editor` + line count badge.
- **Action Scoping (Option B)**:
  - Script text actions (`[Edit Raw]` script modal and line counter) must be docked directly in the Right Panel header (`ScriptHeaderControls`) above the script text it modifies, not in the Left Media panel.

## 5. Cue Data Integrity & Chronological Ordering
- **Validation Encapsulation**:
  - `canSave` validation logic resides inside `useCueEditor`, enforcing `endTime >= startTime`, `endIndex >= startIndex`, and non-whitespace trimmed text.
- **Predictable Card Presentation**:
  - `SyncCuesPanel` renders cue cards in memoized chronological order (`startTime` ascending, secondary on `startIndex`), ensuring the card list remains organized and predictable regardless of JSON array insertion order.
- **Defensive Rendering**:
  - Always guard numeric formatting against null/undefined timestamps using `(cue.startTime ?? 0).toFixed(1)`.

## 6. Two-Tier Flex Architecture & Cross-Panel Sync Invariants
- **Two-Tier Flex Container**:
  - The Edit Left Panel strictly avoids `sticky top-0` overlay hacks inside scrolling containers. It is structured as an unpinned, two-zone flex container (`h-full flex flex-col overflow-hidden`).
  - **Tier 1 (Media Preview)**:
    - Persistent transport controls (`[Replay]`, `[Play/Pause]`, `[Hide/Show Video]`).
    - **Live Timecode HUD Badge (`LiveTimecodeBadge.tsx`)**: Displays live pulsing playback indicator, current formatted timecode (`MM:SS.s`), and total video duration.
    - **Collapsible YouTube Source Pill (`[ 🟢 {videoId} ✏️ ]`)**: Reclaims ~50px of vertical space, revealing the full input on click or when cleared.
    - Proportional 16:9 video player and horizontal `VideoSplitDivider` (with tightened bottom margin `mt-2 mb-1`).
    - **Adaptive Container Queries (`@container (max-width: 580px)`)**: Action button text labels (`.header-btn-label`) and pill text (`.youtube-pill-text`) automatically collapse to compact icon buttons when the left panel is dragged narrow.
  - **Tier 2 (Sync Cues Studio)**:
    - Occupies `flex-1 min-h-0 flex flex-col overflow-hidden` with `pt-0` to maintain balanced vertical spacing.
    - Features a permanently docked `SyncCuesToolbar`:
      - Standardized symmetric padding (`py-2` collapsed, `pt-1.5 pb-2.5` expanded).
      - **Action Nomenclature**: `[ { } JSON ]` for raw cue modal and `[ ↺ Resync ]` for proximity realignment with animated `[ ✓ Synced ]` feedback.
      - **Adaptive Density Toggle**: `[ ⊞ Cards | ≡ Compact ]` with responsive text labels collapsing cleanly to icons via container queries.
      - **Collapsible Search & Multi-Select Filters**: Rested in a slim single-row by default with a `[ 🔍 Filter ]` toggle button, keyboard shortcuts (<kbd>Escape</kbd> to clear/close), autofocus, and multi-select category pills (`Set<string>`) allowing concurrent filtering across categories (e.g. Dialogue + Action).
      - **One-Click Filter Reset**: Counter badge (`{filteredCount}/{totalCount}`) converts into an interactive reset chip with `X` whenever filters are active.
    - Dedicated internal scrollable viewport (`SyncCueCard` in Cards mode, `SyncCueRow` in Compact mode) with `pt-2.5 pb-2` padding and `content-visibility: auto` rendering optimization.
- **Cross-Panel Full Sync Jump**:
  - Selecting any cue in the Left Panel executes a synchronized triple-action: seeks the video player to `cue.startTime` (preserving pause state without premature `pauseVideo()` calls that abort frame decoding), populates `newCue` in `CueEditorForm`, and smoothly scrolls the script canvas to center the corresponding line in the viewport.

## 7. Container Query Responsiveness & Split Width Invariants
- **Container Queries Over Window Breakpoints**:
  - Resizable split panels change width independently of window resize events. Never use window media queries (`sm:`, `md:`, `lg:`) or JavaScript `ResizeObserver` listeners to adapt button labels inside resizable panels.
  - Declare `containerType: 'inline-size'` and class `@container` on panel roots.
  - Use `@container (max-width: 580px)` to automatically collapse text labels (`.header-btn-label`, `.youtube-pill-text`) into compact icon buttons (`[ ↺ ]`, `[ ▶ ]`, `[ 👁/ ]`, `[ 🟢 ✏️ ]`, `[ ⊞ | ≡ ]`, `[ 🔍 ]`, `[ { } ]`, `[ ↺ ]`).
  - Guarantees zero text wrapping, zero horizontal overflow, and 144Hz drag-smooth responsiveness with zero JavaScript overhead.

## 8. Vertical Boundary Hygiene & Flex Margin Anti-Accumulation
- **No Compounding Flex Margins**:
  - In vertical flex layouts (`flex flex-col`), margins do not collapse. Avoid scattering top/bottom paddings and margins across adjacent parent wrappers and child toolbars.
  - **Tier 2 Container**: Must maintain `pt-0` so spacing above the workspace is strictly controlled by the preceding boundary element.
  - **Divider Boundaries**: Separation between the resizable video player and the cue workspace must be governed exclusively by `VideoSplitDivider` margins (standardized to `mt-2 mb-1`).
  - **Toolbar Symmetry**: `SyncCuesToolbar` must maintain symmetric vertical padding (`py-2` collapsed, `pt-1.5 pb-2.5` expanded).
  - **Cue Viewport Offset**: The scrollable cue container must apply `pt-2.5` to mirror the toolbar's bottom padding, ensuring identical breathing room above and below the docked header border line.

## 9. YouTube Seeking & Frame Buffer Continuity
- **No Synchronous Pauses on Seek**:
  - Never call `player.pauseVideo()` synchronously immediately after `player.seekTo()` when jumping to cue timestamps while paused.
  - In Chromium and YouTube iframes, premature pauses abort the video frame decoding pipeline before the texture buffer renders, causing a black canvas.
  - Direct seeking updates the frame position cleanly without unwanted autoplay triggers.

## 10. Compound Cue Authoring Context (`CueEditorContext.tsx`)
- **Dual-Mode Compound Context Pattern**:
  - Cue draft state (`newCue`), timing inputs, DOM selection ranges, alternative locations, and save/delete callbacks are consolidated into `<CueEditorProvider value={cueEditorContextValue}>`.
  - `CueEditorForm` supports dual-mode operation: it accepts explicit props (for isolated testing or overrides) but falls back automatically to `useOptionalCueEditorContext()`.
  - **Zero-Prop Portability**: `<CueEditorForm />` can be dropped anywhere inside the Edit Mode Provider tree (Right Panel header, Left Panel Studio, or popover modals) without prop-drilling through orchestrators.

## 11. Left Panel Performance-Shielded Auto-Scroll & Forward Monotonicity
- **Tick Shield Boundary**:
  - `SyncCuesPanel` must never receive continuous `currentTime` from the playback clock loop. Continuous ticks would force re-rendering 100–300 cue cards/rows at 10–60Hz.
  - Active cue resolution is computed at the `EditLeftPanel` boundary using `findActiveCue(matchingCues, currentTime, settings)`.
  - Only discrete `activeCueId: string | null` and `seekVersion: number` are passed down to `SyncCuesPanel`, ensuring it only re-renders when crossing cue boundaries.
- **Filter-Aware Active Cue Resolution**:
  - `EditLeftPanel` tracks filter state (`searchQuery`, `selectedCategories`) and evaluates `filterCues(cues, selectedCategories, searchQuery)` before passing cues to `findActiveCue`.
  - This ensures that when users filter by specific categories (e.g. Action, Camera, VFX) or search queries, auto-scroll accurately tracks visible items rather than losing focus due to unrendered dialogue cues.
- **Forward Monotonic Scrolling Guard (`furthestScrollTopRef`)**:
  - During normal playback, nested cues frequently occur (e.g., an enclosing Action cue from 0:00 to 0:10 with multiple dialogue or sound cues from 0:02 to 0:08).
  - Without a monotonic guard, when the nested cues end at 0:08, the active resolver would fall back to the still-active Action cue, causing an annoying upward "rubber-band" or yo-yo scroll.
  - Forward monotonic tracking enforces that target scroll positions can only advance forward during forward playback (`targetScrollTop >= furthestScrollTopRef.current - 40px`).
- **Backward Seek & Filter Invalidation (`seekVersion`)**:
  - Backward seeks (`currentTime < prevTime - 0.3s`), category filter toggles, density switches, or search input changes increment or trigger a reset of `furthestScrollTopRef.current = 0`, restoring complete bidirectional scroll responsiveness immediately.
- **Smooth Cubic Ease-Out Animator & Instant Gesture Interruption**:
  - Uses `smoothScrollTo` (`requestAnimationFrame` cubic ease-out `1 - (1 - t)^3`) for high-refresh display animation.
  - Viewport binds passive `wheel` and `touchmove` listeners that immediately abort any active auto-scroll animation, ensuring zero scroll fighting when the user manually scrolls the list.

