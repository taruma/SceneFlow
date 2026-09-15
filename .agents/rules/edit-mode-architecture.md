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
- **Symmetrical Context Titles & Left-Aligned Status**:
  - Playback Mode: `[FileText] Script Preview` + Auto-Scroll controls.
  - Edit Mode: `[FileText] Script Editor` title flanked on the left by active cue status badge (`Editing Cue` with pulsing amber dot or `Drafting Cue` with pulsing blue dot) and loaded line count badge (`{lineCount} lines`). Redundant `Idle` status placeholder is omitted.
- **Action Scoping**:
  - Script text actions (`[Edit Source]` modal trigger and line counter) must be docked directly in the center panel header (`ScriptHeaderControls`) above the script text it modifies, not in the Left Media panel.

## 5. Cue Data Integrity & Chronological Ordering
- **Validation Encapsulation**:
  - `canSave` validation logic resides inside `useCueEditor`, enforcing `endTime >= startTime`, `endIndex >= startIndex`, and non-whitespace trimmed text.
- **Predictable Card Presentation**:
  - `SyncCuesPanel` renders cue cards in memoized chronological order (`startTime` ascending, secondary on `startIndex`), ensuring the card list remains organized and predictable regardless of JSON array insertion order.
- **Defensive Rendering**:
  - Always guard numeric formatting against null/undefined timestamps using `(cue.startTime ?? 0).toFixed(1)`.
- **Screenplay Dialogue Inline Hierarchy**:
  - For dialogue cues with an identified speaker (`cue.speaker`), format the excerpt as an inline prefix: `<span className="font-black uppercase tracking-wider">{cue.speaker}:</span> "{cue.selectedText}"`.
  - Avoid stacking character names above dialogue lines in separate blocks, as vertical height must be conserved (~74–76px) to maximize the visible cue count in the Left Panel Studio.

## 6. Two-Tier Flex Architecture & Cross-Panel Sync Invariants
- **Two-Tier Flex Container**:
  - The Edit Left Panel strictly avoids `sticky top-0` overlay hacks inside scrolling containers. It is structured as an unpinned, two-zone flex container (`h-full flex flex-col overflow-hidden`).
  - **Tier 1 (Media Preview)**:
    - Persistent transport controls in a unified pill (`[ ↺ Replay | ▶ Play/Pause ]` with hairline divider) and `[Hide/Show Video]` toggle.
    - **Live Timecode HUD Badge (`LiveTimecodeBadge.tsx`)**: Displays live pulsing playback indicator, current formatted timecode (`MM:SS.s`), and total video duration (active across both Playback and Edit modes).
    - **Collapsible YouTube Source Pill (`[ 🟢 {videoId} ✏️ ]`)**: Reclaims ~50px of vertical space, revealing the full input on click or when cleared.
    - Proportional 16:9 video player and horizontal `VideoSplitDivider` (with tightened bottom margin `mt-2 mb-1`).
  - **Tier 2 (Sync Cues Studio)**:
    - Occupies `flex-1 min-h-0 flex flex-col overflow-hidden` with `pt-0` to maintain balanced vertical spacing.
    - Features a permanently docked `SyncCuesToolbar`:
      - Standardized symmetric padding (`py-2` collapsed, `pt-1.5 pb-2.5` expanded) and `ListChecks` icon in the title for visual parity with Playback Highlights.
      - **Action Nomenclature**: `[ { } JSON ]` for raw cue modal and `[ ↺ Resync ]` for proximity realignment with animated `[ ✓ Synced ]` feedback.
      - **Adaptive Density Toggle**: `[ ⊞ Cards | ≡ Compact ]` with responsive text labels collapsing cleanly to icons via container queries.
      - **Collapsible Search & Multi-Select Filters**: Rested in a slim single-row by default with a `[ 🔍 Filter ]` toggle button, keyboard shortcuts (<kbd>Escape</kbd> to clear/close), autofocus, and multi-select category pills (`Set<string>`) allowing concurrent filtering across categories (e.g. Dialogue + Action). Auto-expands on active filter transitions while allowing manual collapse to reclaim vertical space with active filter dot indicators.
      - **One-Click Filter Reset**: Counter badge (`{filteredCount}/{totalCount}`) converts into an interactive reset chip with `X` whenever filters are active.
    - Dedicated internal scrollable viewport (`SyncCueCard` in Cards mode, `SyncCueRow` in Compact mode) with `pt-2.5 pb-2` padding and `content-visibility: auto` rendering optimization.
- **Cross-Panel Full Sync Jump**:
  - Selecting any cue in the Left Panel executes a synchronized triple-action: seeks the video player to `cue.startTime` (preserving pause state without premature `pauseVideo()` calls that abort frame decoding), populates `newCue` in `CueEditorForm`, and smoothly scrolls the script canvas to center the corresponding line in the viewport.

## 7. Container Query Responsiveness & Split Width Invariants
- **Container Queries Over Window Breakpoints**:
  - Resizable split panels change width independently of window resize events. Never use window media queries (`sm:`, `md:`, `lg:`) or JavaScript `ResizeObserver` listeners to adapt button labels inside resizable panels.
  - Declare `containerType: 'inline-size'` and class `@container` on panel roots.
  - Calibrated, padding-aware container query thresholds decouple each section header independently:
    - **Playback MediaHeader**: `@container (max-width: 640px)` hides title and transport button labels (`.media-btn-label`); `@container (max-width: 480px)` hides timecode duration (`.timecode-duration`).
    - **Edit MediaHeader**: `@container (max-width: 580px)` hides title; `@container (max-width: 510px)` hides transport labels; `@container (max-width: 430px)` hides YouTube pill text (`.youtube-pill-text`) and timecode duration.
    - **Sync Cues Toolbar**: `@container (max-width: 510px)` hides title (`.sync-cues-title`), secondary action labels (`.sync-btn-label-secondary`), and scroll label (`.sync-btn-label-scroll`); `@container (max-width: 420px)` hides primary density and filter button labels (`.sync-btn-label`).
    - **Center Script Panel**: `@container (max-width: 480px)` hides cue status text (`.cue-status-text`); `@container (max-width: 420px)` hides script action button labels (`.script-btn-label`) and line count badge (`.script-line-count`); `@container (max-width: 320px)` hides script title (`.script-header-title`).
  - Guarantees zero text wrapping, zero horizontal overflow, and fluid drag-smooth responsiveness with zero JavaScript overhead.

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
- **Tick Shield Boundary & Multi-Cue Active Resolution**:
  - `SyncCuesPanel` must never receive continuous `currentTime` from the playback clock loop. Continuous ticks would force re-rendering 100–300 cue cards/rows at 10–60Hz.
  - Active cue resolution is computed at the `EditLeftPanel` boundary:
    - `activeCueId: string | null`: Primary active cue target computed via `findActiveCue(matchingCues, currentTime, settings)` for viewport auto-scrolling.
    - `activeCueIds: Set<string>`: All concurrently active cues firing at `currentTime` computed via `isCueActive()`.
  - **Set Reference Stabilization**: `activeCueIds` is memoized and reference-stabilized using a `useRef` shallow-equality check (`prevActiveCueIdsRef`). When video ticks advance through the same active cues, the identical `Set` instance is returned, ensuring `SyncCuesPanel` experiences zero re-render overhead while media is running.
- **Filter-Aware Active Cue Resolution & Upcoming Cue Fallback**:
  - `WorkstationLeftPanel` evaluates `filterCues(cues, selectedCategories, searchQuery)` and resolves two decoupled cue anchors:
    - `activeCueId: string | null`: Strict active cue resolver via `findActiveCue()` driving `isPrimary` halo glow and category ambient wash without false illumination during gaps.
    - `scrollTargetCueId: string | null`: Primary auto-scroll anchor via `findScrollTargetCue()`. When playback falls into an inter-cue silence gap or pause between lines (`activeCue === null`), it automatically falls back to the immediate next upcoming cue (`cue.startTime >= currentTime`), centering the viewport on upcoming lines without stranding the list at `scrollTop = 0`.
  - This ensures that when users filter by specific categories (e.g. Action, Camera, VFX) or search queries, auto-scroll accurately tracks visible items rather than losing focus due to unrendered dialogue cues.
- **Forward Monotonic Scrolling Guard (`furthestScrollTopRef`)**:
  - During normal playback, nested cues frequently occur (e.g., an enclosing Action cue from 0:00 to 0:10 with multiple dialogue or sound cues from 0:02 to 0:08).
  - Without a monotonic guard, when the nested cues end at 0:08, the active resolver would fall back to the still-active Action cue, causing an annoying upward "rubber-band" or yo-yo scroll.
  - Forward monotonic tracking enforces that target scroll positions can only advance forward during forward playback (`targetScrollTop >= furthestScrollTopRef.current - 40px`).
- **Backward Seek, Scrub & Mode Horizon Reset (`seekVersion`)**:
  - Switching modes into Edit mode (`prevMode !== 'edit' && mode === 'edit'`), playhead scrubber jumps (`currentTime < prevTime - 0.3s` or forward jump $> 1.5$s), manual cue selection (`selectedCueId`), category filter toggles, density switches, or search input changes increment or trigger a reset of `furthestScrollTopRef.current = 0`, restoring complete bidirectional scroll responsiveness immediately and preventing viewport lockouts by downstream cues.
- **Smooth Cubic Ease-Out Animator & Instant Gesture Interruption**:
  - Uses `smoothScrollTo` (`requestAnimationFrame` cubic ease-out `1 - (1 - t)^3`) for high-refresh display animation.
  - Viewport binds passive `wheel` and `touchmove` listeners that immediately abort any active auto-scroll animation, ensuring zero scroll fighting when the user manually scrolls the list.
- **Center-Tracking Viewport Spacers (`spacerHeight`)**:
  - Boundary cues positioned at the extreme start (first cue) and end (last cue) cannot normally reach the viewport vertical center (`H / 2`) because standard containers lack preceding and trailing scroll travel, clamping scroll positions to `0` or `maxScrollTop`.
  - When auto-scroll is active (`isAutoScrollEnabled = true`) and cues exist, `SyncCuesPanel` renders dynamic `spacerHeight` elements (`Math.max(0, Math.floor(viewportHeight / 2))` measured via `useLayoutEffect` and `ResizeObserver`) above and below the cue items.
  - Spacers automatically collapse to 0 (`spacerHeight = 0`) when auto-scroll is toggled off or when zero cues match filters, preserving tight top-alignment for manual inspection and centered empty states without scrollbars.

## 12. Time-Clustered Fluid Grid & Card Sizing Invariants
- **Temporal Horizon Ceilings (`clusterCuesByTime`)**:
  - Grouping cues by temporal proximity (`maxGapSeconds = 2.5`) must be bounded by hard ceiling parameters (`maxClusterSpanSeconds = 10.0` and `maxCuesPerCluster = 8`).
  - Without these caps, continuous audio/action scenes without gaps $> 2.5$s will merge hundreds of cues into a single endless cluster.
- **Fluid Grid Dense Packing & Span Limits**:
  - The card viewport uses CSS Grid `repeat(auto-fill, minmax(160px, 1fr))` with `[grid-auto-flow:dense]`.
  - Span bounds: short cards use 1 column; standard cards use 1 to 2 columns (`col-span-1 min-[420px]:col-span-2`); extended cards use up to 3 columns (`min-[640px]:col-span-3`).
  - **Never use `col-span-full`** on cards, as it creates ~900px of empty dead space on desktop viewports.
- **Dialogue Minimum Width Safeguard**:
  - Spoken dialogue cues (`cue.type === 'dialogue'`) and text $> 40$ characters must never be rendered inside 1-column `MiniCueCard` components regardless of duration.
  - They must always render with at least 2 columns via `SyncCueCard` to preserve readability and prevent clipped dialogue.
- **Two-Tier Visual Feedback Hierarchy (Theme-Harmonized States)**:
  - Never hardcode static colors (e.g. `border-blue-500`) for active or selected states.
  - **Scroll Focus Cue (`isPrimary = cue.id === activeCueId`)**: Renders with an active theme border (`rgba(${themed.rgb}, 0.65)`), outer halo box-shadow (`0 0 10px rgba(${themed.rgb}, 0.3), 0 0 0 1px rgba(${themed.rgb}, 0.35)`), expanded stripe (`w-1.5` with glow), and full directional ambient gradient wash (`25% → 7%`, `opacity-100`).
  - **Secondary Co-Active Cues (`isActive && !isPrimary`)**: Renders with a clearly visible ambient gradient wash (`~16.2% → 4.5%`, `opacity-65`), but explicitly omits colored borders (retains default subtle border) and outer glow shadows to keep visual noise low during dense multi-track playback.
  - **Selected Cue (`isSelected`)**: Maintains primary focus outline (`rgba(${themed.rgb}, 0.7)` with focus ring) for manual inspector editing.

## 13. Desktop 3-Panel Workstation & Mode-Aware Layout Invariants
- **Calibrated 40 / 35 / 25 Workstation Distribution**:
  - Desktop Edit Mode organizes into three specialized vertical columns:
    1. **Left Panel (`EditLeftPanel`)**: Calibrated to **40%** default width (`editSplitRatio`, bounds 25%–55%), housing the video preview and time-clustered cue list.
    2. **Center Panel (Screenplay Canvas)**: Naturally consumes **35%** default width (`flex-1 min-w-0`), providing an unconstrained reading canvas.
    3. **Right Panel (`EditRightPanel`)**: Calibrated to **25%** default width (`inspectorRatio`, bounds 18%–45%), housing the dedicated Cue Inspector.
- **Independent Multi-Mode Layout Decoupling**:
  - Never share split ratios between Playback and Edit modes. Edit Mode maintains its own state and persistence keys (`sceneflow_edit_split_ratio`, `sceneflow_inspector_ratio`) separate from Playback Mode (`sceneflow_split_ratio`).
  - Switching between modes must preserve each mode's distinct split ratios without cross-contamination.
- **Mode-Aware "Reset View Layout" (<kbd>Shift+R</kbd>, Settings, Double-Click)**:
  - In **Edit Mode**: Resets layout to **40 / 35 / 25**, restores 220px video height, expands collapsed video, and automatically re-opens the inspector panel if closed.
  - In **Playback Mode**: Resets layout to **65 : 35** and restores 220px video height.
  - Closing the Cue Inspector in Edit Mode counts as a customized layout state (`isEffectiveViewCustomized`), displaying the "Reset View" button in `AppHeader` for one-click restoration of the 40/35/25 workstation.
- **Draggable Inspector Divider (`InspectorSplitDivider`)**:
  - Resizes inspector ratio dynamically via pointer capture and VSync throttling (`requestAnimationFrame`), measuring `((windowWidth - clientX) / windowWidth) * 100`.
  - Clamped between `18%` and `45%` with a strict `260px` pixel-floor safeguard (`minPixelWidth`) to prevent unreadable sidebars on smaller desktop viewports.
  - Double-click or <kbd>Enter</kbd> / <kbd>Home</kbd> resets inspector ratio to default `25%`.
  - Keyboard accessible: <kbd>←</kbd> widens inspector by 1%, <kbd>→</kbd> narrows inspector by 1%.

## 14. Cue Inspector Layout & Component Decoupling
- **Decoupled Script Anchoring vs. Audio-Visual Timing**:
  - Never mix screenplay character offsets (`startIndex`, `endIndex`) into the primary timing deck.
  - Keep character indices fully editable in a dedicated `CueScriptAnchoring` card to support manual cue drafting, pasting raw quotes, and proximity alignment.
- **Audio-Visual Timing Deck (`CueTimingCard`)**:
  - Symmetrical Start and End boundary cards with precision timecode HUDs, clock capture buttons, and tactile micro-nudge steppers (`-0.5s`, `-0.1s`, `+0.1s`, `+0.5s`).
  - Integrated duration calculation and live loop preview controller.
- **Surrounding Scene Context Window (`CueSceneContext`)**:
  - Surrounds the editable quote with dimmed preceding (`PREV`) and following (`NEXT`) screenplay lines derived from `scriptText` to provide instant narrative context without cross-panel eye scanning.
- **Pinned Sticky Bottom Action Bar**:
  - Anchors primary actions (`Update / Create Cue` via `Ctrl+Enter`, `Cancel` via `Esc`, and `Delete`) permanently to `bottom-0` (`bg-surface/95 backdrop-blur border-t`).
  - Guarantees width resilience when the inspector is dragged narrow (`280px`–`320px`), avoiding horizontal button collision in the top 48px header while ensuring the save button is never pushed below the vertical scroll fold.
  - Delete button features resting destructive red styling (`text-red-500/80 bg-red-500/10 border-red-500/20`), and Cancel features an explicit design-system `<kbd>Esc</kbd>` shortcut badge.
- **Dynamic Dirty Tracking & Status Badging (`useCueEditor.ts`, `EditRightPanel.tsx`)**:
  - `useCueEditor` preserves an `originalCue` baseline snapshot when selecting a cue for editing, deriving `isDirty` by comparing start/end times, selected quote text, cue type, color class, and character offsets. New drafts are dirty if timings or text are customized.
  - `EditRightPanel` header displays reactive status badges: `Saved` (green check) vs `Unsaved` (pulsing amber dot) for existing cues, and `Draft` vs `Draft (Unsaved)` for new drafts.
- **Clean Script Click Dismissal (`dismissIfClean`, `handleScriptClick`)**:
  - `dismissIfClean()` safely resets `useCueEditor` back to idle workstation overview if no edits have been made (`!isDirty`).
  - In `App.tsx`, `handleScriptClick` is bound to the screenplay reading canvas, safely closing clean cue inspections on click while strictly ignoring clicks on interactive buttons, input fields, staging markers (`e.stopPropagation()`), or active DOM text selections.

## 15. Cues JSON Editor & LLM Sync Schema Architecture (`RawCuesModal.tsx`)
- **Two-Column Workstation Layout**:
  - The raw cues modal provides a comprehensive 2-column workstation (`RawCuesModal.tsx`):
    - **Left Column**: Live schema reference with essential fields (`startTime`, `endTime`, `selectedText`, `type`), collapsible optional/auto-calculated fields, and quick copyable example snippet with 1-click insertion.
    - **Right Column**: Dual-tab workspace housing the `{ } JSON Data` editor and `🤖 Sync Prompt & Schema` AI integration deck.
- **Minimal Canonical Schema Contract (`cues.schema.json`, `public/schema.json`)**:
  - JSON schema must remain strictly a structural data contract (types, enums, required fields).
  - Avoid verbose descriptions inside schema properties, as excessive natural language degrades token sampling quality during LLM constrained decoding.
  - Business logic—such as verbatim `<ScriptText>` excerpt copying and `(minutes * 60) + seconds` timecode math—is enforced within `cues.prompt.ts` (`public/sync-prompt.txt`).
- **Draft Baseline UI Separation**:
  - Guidance indicating that prompts provide a draft baseline for user customization must reside cleanly outside the markdown prompt text in the UI to keep copied prompts ready for Gemini/LLM system instructions.
- **Segmented Sub-View Switcher (`prompt` | `schema` | `split`)**:
  - Supports switching between full-width views (`prompt` or `schema`) to ensure zero horizontal scrollbars on JSON schema lines, while preserving a `split` option for side-by-side comparison on wide screens.
- **Context-Aware Footer & Wrap-Resistant Buttons**:
  - Footers adapt actions dynamically per tab: `Cancel` and `Apply Cues (N)` on JSON Data; `Close` and `Go to JSON Data →` on Sync Prompt & Schema.
  - Buttons must declare `whitespace-nowrap`, matching vertical padding (`py-2`), and Title Case labels to eliminate multi-line wrapping and container height distortion.
- **Live Non-Blocking Validation & Auto-Unwrapping**:
  - Real-time syntax and schema validation pills report cue counts or actionable error diagnostic messages without triggering blocking browser `alert()` dialogs.
  - `[ ✨ Format JSON ]` standardizer formats indentation to 2 spaces and automatically unrolls `{ cues: [...] }` wrappers into direct cue arrays.
