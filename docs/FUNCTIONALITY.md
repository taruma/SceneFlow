# Functionality

SceneFlow is a specialized workspace for synchronizing video playback with written screenplays and AI prompts, evaluating AI video model fidelity, and analyzing script-to-screen prompt adherence.

---

## 1. Dual Script Parsing & Formatting Heuristics

SceneFlow seamlessly parses raw screenplay and technical Auteur Script text into structured layouts using deterministic heuristics and regex:

| Element | Heuristic / Pattern | Styling & Layout |
|---|---|---|
| **Scene Heading** | Starts with `INT.` or `EXT.` (case-insensitive) | Bold uppercase, theme-calibrated heading background and border padding |
| **Character Name** | Line in ALL CAPS ending with a colon (`JOHN:`) | Centered, bold uppercase with tracking |
| **Dialogue** | Spoken lines following a character name | Centered, narrowed reading column (75% width) |
| **Parenthetical** | Enclosed in `(...)` within dialogue or standalone | Italicized, subdued text color |
| **Action** | ALL CAPS single line or standard narrative paragraphs | Bold emphasis for short beats, standard serif body for descriptions |
| **Effects** | Starts with `SFX:` or `VFX:` | Italicized, subdued text color |
| **Notes / Shots** | Enclosed in square brackets `[...]` | Monospace uppercase technical style |
| **Separators** | Line containing exactly `---` | Themed horizontal dividing rule |
| **Part Separators** | Matches `PART N` format | Themed centered title divider with flanking accent lines |
| **Roman Titles** | Roman numeral prefix (e.g., `IV. THE AWAKENING`) | Themed title divider with uppercase spacing |
| **Brief Blocks** | Enclosed between `[<BRIEF>]` and `[</BRIEF>]` | Monospace technical card with dashed border, waterfall indentation, and bold anchors |

### Auteur Script Formatting Engine (`[<BRIEF>]`)
For high-precision AI video prompting, the active **`[EXECUTION]`** timeline is wrapped in `[<BRIEF>]` blocks (strictly separated from the static staging setup) and rendered as modular state transitions:
- **Waterfall Indentation**: Beat transitions separated by `->` automatically trigger hierarchical line breaks with nested indentation (`\n    -> `), rendering complex execution prompts as readable visual cascades.
- **Bold Anchors**: Bracketed dimension tags like `[CAM]`, `[ACT]`, `[AUDIO]`, `[STATE IN]`, or `[STATE OUT]` are automatically bolded (`<b>[...]</b>`) for rapid cognitive scanning.
- **Ghost Line Suppression**: Empty or whitespace-only lines inside brief blocks are filtered out during script processing.

---

## 2. Staging System (Auteur Script Scaffold)

Blocks wrapped in `[[STAGING]]...[[/STAGING]]` hold multi-level prompt directives and guardrails representing the foundational setup layer of the Auteur Script, cleanly separated from the `[EXECUTION]` timeline:
- **The 5-Part Scaffold Architecture**:
  The standard Auteur Script framework is built upon a 5-part scaffold (modular and adaptable based on the specific scene or generation task):
  1. `[INTENT]`: Directorial vision, high-level subject, and emotional weight.
  2. `[LOGIC]`: Hard guardrails for visual planning (spatial continuity, 180° axis, object permanence).
  3. `[AESTHETIC]`: Audio-visual reference world (palette, lighting, wardrobe, location, ambience).
  4. `[OPENING]`: First-frame coordinate anchor ($S_0$) establishing baseline geometry.
  5. `[EXECUTION]`: Active timeline state-transition pipeline (rendered via `[<BRIEF>]`).
- **Staging Block Directives in SceneFlow**:
  All non-execution setup blocks (parts 1–4) are declared inside `[[STAGING]]...[[/STAGING]]` to keep the reading timeline clean:
  - `[[INTENT]]`: Scene vision, identity, and tone.
  - `[[LOGIC]]`: Spatial, physics, and continuity guardrails.
  - `[[AESTHETIC]]`: Master audio-visual styling parameters.
  - `[[OPENING]]`: Initial frame coordinate anchor ($S_0$).
  - *Optional Extensions*: Directives like `[[CONTINUITY PROTOCOL]]` (for video continuation rules) or legacy directives (`[[GLOBAL]]`, `[[LOOKBOOK]]`) are fully supported.
  - *Execution Separation*: Everything inside `[<BRIEF>]...[</BRIEF>]` represents the **`[EXECUTION]`** block (never labeled as staging), driving the active state-transition pipeline.
- **Visual Hiding**: Content inside staging blocks is concealed from the main reading flow.
- **Interactive Badges**: A responsive `STAGING: LABEL` pill badge appears on the line where the staging block was declared.
- **Staging Modal**: Clicking a staging badge opens a monospace inspector displaying the hidden technical directives. Badges are disabled during active video playback, and any open staging modal automatically closes upon video play.
- **Mobile Adaptation**: Staging badge sizes, padding, and gaps scale down dynamically on mobile viewports for compact wrapping.

---

## 3. Syncing System (Cues)

Cues link specific text segments in the screenplay to video playback timestamps.

### Cue Categories & Themes
Supports eight color-coded cue categories, each calibrated with theme-specific RGB values:
1. 🟡 **Dialogue**: Spoken character dialogue (Amber Gold).
2. 🔵 **Action**: Physical action beats and actor movements (Royal Cobalt Blue).
3. 🟢 **Camera**: Camera moves, gimbal directions, and framing (Emerald Green).
4. 🟣 **Shot**: Shot scale descriptions (CU, WIDE, OTS, ESTABLISHING) (Deep Iris).
5. 🟠 **Audio**: Sound effects, foley, and soundtrack cues (Bright Amber Orange).
6. 🔷 **VFX**: Visual effects and CGI instructions (Electric Aqua).
7. 🌹 **Transition**: Scene cuts, dissolves, and pacing transitions (Crimson Rose).
8. ⚪ **Environment**: Atmospheric lighting and weather conditions (Steel Slate).


### Cue Creation & In-Place Text Editing
- **Creation**: In Edit Mode, highlight text in the script preview to populate the "New Sync Cue" panel with calculated start and end character offsets.
- **Compound Context Architecture (`CueEditorContext`, `CueEditorForm`)**: Cue draft state, timing offsets, DOM text selection ranges, alternative locations, and persistence actions are encapsulated within `<CueEditorProvider>`, enabling zero-prop invocation with automatic fallback resolution across layout panels.
- **Dynamic Dirty Tracking & Reactive Status Badges**: The Cue Inspector (`EditRightPanel`) tracks an `originalCue` baseline snapshot. When editing an existing cue, it dynamically indicates `Saved` (green checkmark) vs `Unsaved` (pulsing amber dot) based on changes to start/end times, quote text, category type, or character offsets. For new drafts, it displays `Draft` or `Draft (Unsaved)`.
- **Clean Script Click Dismissal (`dismissIfClean`)**: Clicking anywhere on the clean screenplay canvas while in Edit mode safely dismisses the cue inspector back to the idle workstation overview when no unsaved changes exist (`!isDirty`), while strictly ignoring clicks on interactive buttons, input fields, staging markers, and active DOM text drag selections.
- **Timestamp Capture & Live Precision Timecodes (`CueTimingInputs`)**: Start and End inputs display live formatted precision timecodes (`MM:SS.s`) above each field alongside `Clock` buttons to capture the player's current video time, or input manual values.
- **Manual Monospace Textarea (`CueTextSection`)**: Users can directly edit a cue's selected text in-place within the Edit Sync Cue panel. This allows safe text corrections without manual JSON editing while preserving character synchronization.
- **ID Sanitization**: All cues loaded from any source (localStorage, built-in examples, remote projects, or pasted JSON) are automatically run through `sanitizeCues()`, which deduplicates IDs, migrates legacy `colorClass` to canonical semantic `type` while stripping the deprecated `colorClass` property, and injects fallback UUIDs for malformed entries.
- **Duplicate Text & Alternative Location Finder**: When a phrase appears multiple times (e.g., `WIDE SHOT`), clicking "Find Alternative" scans the screenplay and presents a contextual list of all occurrences with character offsets and text snippets for instant snapping. Hidden `[[STAGING]]` block ranges are strictly excluded from search matches.

### Overlap Management
Multiple cues can span the same character ranges. In Edit Mode, overlapping regions display an indicator dot. Clicking an overlapping segment opens the floating `OverlapPicker` context menu to select which cue to inspect or edit.

### Chronological Proximity Alignment (`realignCues`)
When script text is edited or pasted, the "Resync" tool sorts cues chronologically by time, strips any legacy `colorClass` properties, and uses proximity-aware regex matching to re-anchor cue indices to the nearest logical position, falling back to a 15-character prefix search if major edits occurred.

### Edit Mode: Studio Workspace & Cue Management
Desktop Edit Mode features a dedicated Two-Tier studio workspace in the Left Panel (`EditLeftPanel` & `SyncCuesPanel`) optimized for high-density cue inspection and authoring:

- **Two-Tier Flex Architecture**:
  - **Tier 1 (Media Preview)**:
    - Persistent media transport controls in a unified pill (`[ ↺ Replay | ▶ Play/Pause ]` with hairline divider) and `[Hide/Show Video]` toggle.
    - **Live Timecode HUD Badge (`LiveTimecodeBadge.tsx`)**: Real-time `MM:SS.s` timecode display, video duration tracking, and live pulsing activity indicator, active in both Playback and Edit modes.
    - **Collapsible YouTube Source Header Pill (`[ 🟢 {videoId} ✏️ ]`)**: Replaces bulky persistent input boxes, saving ~50px vertical height while keeping video ID editing 1 click away.
    - Resizable 16:9 video player and horizontal `VideoSplitDivider` with balanced vertical spacing.
  - **Tier 2 (Sync Cues Studio)**:
    - Permanently docked `SyncCuesToolbar` that never scrolls away, featuring `ListChecks` icon in the title for visual parity.
    - Dedicated internal scrollable viewport supporting both the **Time-Clustered Fluid Grid** (Cards view) and high-density tabular list (`SyncCueRow` in Compact view) with `content-visibility: auto` rendering optimization.
- **Time-Clustered Fluid Grid (Cards View)**:
  - **Temporal Cue Clustering (`clusterCuesByTime`)**: Intelligently groups cues by temporal proximity ($\le 2.5$s gaps) with strict ceiling boundaries (maximum 10.0s window span and maximum 8 cues per cluster) to prevent continuous dialogue/action scenes from coalescing into an unmanageable monolithic block.
  - **Pinned Sticky Timecode Rulers**: Frosted timecode strips (`⏱ 00:00.0 – 00:04.5 · N cues`) with backdrop blur stick to the top of the viewport during scrolling, serving as temporal anchors.
  - **Dense Auto-Fill Grid**: Uses CSS Grid `grid-cols-[repeat(auto-fill,minmax(160px,1fr))] [grid-auto-flow:dense]` to dynamically pack cards into gap-free rows.
  - **Adaptive Card Sizing & Dialogue Protection**: Short audio bursts, camera moves, and reaction cues ($\le 1.8$s, non-dialogue, $\le 40$ch) render as compact 1-column `MiniCueCard` items. Dialogue cues (`type === 'dialogue'`) and longer text cues are safeguarded to at least 2 columns via `SyncCueCard` (with extended cues spanning up to 3 columns: `col-span-1 min-[420px]:col-span-2 min-[640px]:col-span-3`), ensuring spoken dialogue is never truncated. Avoids `col-span-full` to eliminate wide empty dead zones on widescreen viewports.
  - **Compact 3-Zone Micro-Card Hierarchy**: `SyncCueCard` features sequence number chip (`#01 · cue_01`), category badge, custom metadata tag tray, inline character speaker prefix (`MARK: "..."`), and script offset alignment diagnostics (`startIndex–endIndex · Nch`) or `⚠️ Needs Align` indicator.
  - **Two-Tier Visual Feedback Hierarchy**:
    - **Scroll Focus Cue (`isPrimary = cue.id === activeCueId`)**: Renders with an active theme border (`rgba(${themed.rgb}, 0.65)`), outer halo box-shadow (`0 0 10px rgba(..., 0.3)`), expanded stripe (`w-1.5` with glow), and vibrant directional ambient gradient wash (`25% → 7%`, `opacity-100`).
    - **Secondary Co-Active Cues (`isActive && !isPrimary`)**: Renders with a clearly visible ambient gradient wash (`~16.2% → 4.5%`, `opacity-65`), but explicitly omits colored borders (retains default subtle border) and outer glow shadows to keep visual noise low during dense multi-track playback.
    - **Selected Cue (`isSelected`)**: Maintains primary focus outline (`rgba(${themed.rgb}, 0.7)` with focus ring) for manual inspector editing.
- **Sync Cues Toolbar Capabilities**:
  - **Collapsible Search & Filter Bar**: Rests in an ultra-slim single row by default with a `[ 🔍 Filter ]` toggle action, reclaiming ~64px of vertical height. Smoothly expands search input (with autofocus and <kbd>Escape</kbd> shortcut) and category pills when toggled or when active queries/filters are present.
  - **Multi-Select Category Filtering**: Category pills use a `Set<string>` to support concurrent multi-category filtering (e.g. `DIALOGUE` + `ACTION` simultaneously).
  - **One-Click Filter Reset**: Counter badge (`{filteredCount}/{totalCount}`) converts into an interactive reset button with an `X` when filtering is active, clearing all filters and auto-collapsing the bar in a single click.
  - **Action Tools**: Standardized on `[ { } JSON ]` for modal cue inspection and `[ ↺ Resync ]` for proximity realignment with animated `[ ✓ Synced ]` feedback.
  - **Dual Density Modes**: `[ ⊞ Cards | ≡ Compact ]` density switcher with responsive text labels collapsing to icons via container queries.
- **Decoupled Container Queries (`src/index.css`)**:
  - Workstation headers declare container queries with calibrated thresholds accounting for container padding: Playback MediaHeader (640px/480px), Edit MediaHeader (580px/510px/430px), Sync Cues Toolbar (510px/420px), and Center Script Panel (480px/420px/320px). Button labels and text automatically collapse to compact icon buttons on narrow panels, eliminating horizontal overflow or text wrapping.
- **Black-Screen-Free Cue Seeking**:
  - Clicking any cue in the list seeks the YouTube player directly to the cue's start time without premature `pauseVideo()` calls, ensuring the video decoding pipeline smoothly paints the target frame buffer on first load or paused scrub.
- **Left Panel Performance-Shielded Auto-Scroll & Forward Monotonicity**:
  - **`[ 🎯 Scroll ]` Toolbar Toggle**: Integrated auto-scroll toggle button in `SyncCuesToolbar` with persistent preference state in `localStorage` (`sceneflow_edit_autoscroll`). On narrow panels, the label gracefully collapses to `[ 🎯 ]` via container queries.
  - **Context-Aware Multi-Cue Highlighting**: All active cues firing at `currentTime` automatically illuminate with their category ambient wash, while the primary scroll anchor commands focus with an enhanced halo and border.
  - **High-Refresh Cubic Ease-Out Animator**: Uses display-refresh `smoothScrollTo` for fluid, non-blocking auto-scrolling with instant wheel/touch gesture cancellation so manual list scrolling is never fought.
  - **Forward Monotonic Scrolling Guard**: Prevents irritating rubber-band / yo-yo scrolling when nested cues finish inside a long-duration cue (e.g. Action cue spanning 0:00 to 0:10 after nested dialogue cues at 0:05–0:09 finish). The cue list smoothly scrolls forward without snapping back up to older enclosing cues.
  - **Backward Seek & Filter Reset**: Seeking backwards (`currentTime < prevTime - 0.3s`), toggling category filters, changing density, or clearing searches immediately resets the monotonic guard, providing complete bidirectional scrubbing responsiveness.
  - **Filter-Aware Active Tracking**: When filtering cues by multi-select categories (e.g. Action, Camera, VFX) or typing search queries, active cue detection dynamically tracks the active cue among currently matching visible items, ensuring the panel scrolls to the active cue in the filtered set rather than being hidden or dropped due to unrendered dialogue.

### Studio-Grade Cues JSON Editor & LLM Sync Setup (`RawCuesModal`)
Accessible via `[ { } JSON ]` on the `SyncCuesToolbar`, the Raw Cues modal provides a studio-grade 2-column workstation for inspecting, formatting, and synchronizing cues directly with LLM structured outputs:

- **Two-Column Workstation Architecture**:
  - **Left Column (Schema Reference & Guide)**:
    - **Live Field Directory**: Detailed reference for Essential Fields (`startTime`, `endTime`, `selectedText`, `type`) with requirement badges and typing constraints.
    - **Collapsible Optional & Auto-Calc Fields**: Expandable accordion detailing `startIndex`, `endIndex`, `id`, `speaker`, and legacy `colorClass` mappings.
    - **Quick Example Snippet**: Copyable JSON payload with 1-click **Insert** button when the editor is empty.
  - **Right Column (Dual-Tab Workstation)**:
    - **`{ } JSON Data` Tab**: Spacious monospace code editor supporting direct arrays `[...]` or wrapped project objects `{ cues: [...] }`.
      - **Live Non-Blocking Validation Pill**: Instantly reports `{ cues } detected` or cue count (`108 cues ready`) in green, or specific syntax/schema error details in amber without blocking browser `alert()` popups. Disables the apply action while invalid.
      - **`[ ✨ Format JSON ]` Standardizer**: Cleans and normalizes indentation to 2 spaces and automatically unrolls wrapped `{ cues: [...] }` objects into direct cue arrays.
    - **`🤖 Sync Prompt & Schema` Tab**:
      - **Lightweight Gemini Setup Guide**: Integrated step-by-step workflow for generating cues with Google AI Studio or Gemini API:
        1. *Set System Prompt*: Paste the Sync Prompt into Gemini's *System Instructions*. Attach video and wrap screenplay text in `<ScriptText>...</ScriptText>`.
        2. *Set Output Schema*: Provide the cues JSON schema under Gemini *Structured Output* (or API `responseSchema`).
        3. *Import Cues*: Copy the model's generated JSON response and paste directly into the **JSON Data** tab.
      - **Draft Baseline Guidance**: Clearly positioned outside the markdown prompt to emphasize that the template provides a baseline draft that users are encouraged to customize for their specific workflow.
      - **Standalone Public Asset Links**: Clickable chips linking directly to [sync-prompt.txt](/sync-prompt.txt) and [schema.json](/schema.json) for easy downloading or external referencing.
      - **Segmented Sub-View Switcher**: Instant switching between `[ 📄 Sync Prompt ]`, `[ 🤖 Gemini Schema ]`, and `[ ◫ Split ]`. In standard single-view mode, the active file takes the full ~650px container width, completely eliminating horizontal scrollbars on JSON schema lines.
      - **Prompt Enforcement Rules**: Enforces strict verbatim extraction from `<ScriptText>` and explicit `(minutes * 60) + seconds` timecode math with negative counter-examples (`01:23.3 is 83.3, NOT 123.3`).
- **Context-Aware Modal Footer**:
  - Automatically switches actions based on the active tab:
    - In **`JSON Data`**: Displays `Cancel` and `Apply Cues ({count})` (disabled when invalid or empty).
    - In **`Sync Prompt & Schema`**: Displays `Close` and an active `Go to JSON Data →` shortcut, with Title Case typography and `whitespace-nowrap` to prevent button height distortion.

---

## 4. Multi-Track Sync Timeline & Active Highlights

During video playback, the sidebar presents a real-time visualization of all active and upcoming cues:

### Multi-Track Sync Timeline (`HighlightTimelineView`)
Inspired by professional Non-Linear Editors (NLEs), the timeline maps cues onto horizontal category tracks (Dialogue, Action, Camera, Audio, etc.):
- **Stationary 35% Anticipation Playhead**: The vertical laser line and top pip marker remain anchored at 35% of the container width, providing generous lookahead space for approaching dialogue and sound cues.
- **Continuous Real-Time Timecode Ruler**: Glides underneath the tracks in real-time, displaying 1-second ticks and major `MM:SS` timecode labels.
- **Dynamic Density Scaling (`TimelineDensity`)**: Supports `'comfortable'` (32px track height) and `'compact'` (24px track height) modes, optimizing vertical space across varying screen sizes.
- **Interactive Lane Header Toggles**: Track headers on `TimelineLane` (`[• CATEGORY]`) serve as interactive buttons to mute/unmute that category directly, showing pulsing active glow or dimmed strikethrough styling when hidden.
- **Zero Layout Shift & Sub-Frame Display Extrapolation**: Replaced fixed 100ms linear CSS transitions with continuous display time extrapolation (`useSmoothTimelineTime`) running via `requestAnimationFrame` at the monitor's native refresh rate (60Hz, 120Hz, etc.). Stabilized cue block duration geometry (`useTimelineWindow`) by calculating fixed duration widths without boundary clamping, letting track container `overflow-hidden` handle edge clipping and eliminating continuous layout reflows.
- **Seek Without Unwanted Playback**: Clicking any cue block seeks the player to that timestamp while preserving the paused state without triggering YouTube's unbuffered autoplay quirk.

### Docked Paused Cue Inspector (`PausedInspectorCard`)
Reveals smoothly below the timeline whenever video playback is paused or a cue block is clicked:
- **Multi-Cue Tabs**: If multiple cues are active at the same timestamp, horizontal tabs allow instant cycling between them.
- **Themed Accent Header**: Features category pill badge, theme-colored top bar, and precise timecode range (`MM:SS.s`) with duration badge.
- **Screenplay Quote**: Displays the full screenplay excerpt in large, readable serif italics.
- **Instant Replay**: Clicking "Replay" jumps to the cue's start time and immediately initiates playback.

### Studio VU Meter & Layout Stability
- **Fixed-Slot Category LED Strip**: Anchored directly beside the section title, an 8-slot category VU meter (`Dialogue`, `Action`, `Camera`, `Shot`, `Audio`, `VFX`, `Transition`, `Environment`) illuminates in theme-calibrated colors (`resolveCueColor`) whenever cues in that category are active.
- **Zero-Layout-Shift Numerical Box**: The active cue count is isolated inside a fixed-width monospace tabular container (`min-w-[14px] font-mono tabular-nums`), mathematically eliminating visual jitter and horizontal shifting when cue counts oscillate between single and double digits during playback.

### View Mode Switcher (Timeline vs. Cards)
- **Segmented Control**: The panel header features a `[ 📊 Timeline | 🗂 Cards ]` switcher.
- **Classic Cards View**: Users can switch back to the legacy floating cards presentation at any time.
- **Persistence**: View mode selection persists across sessions in `localStorage` (`sceneflow_highlight_view_mode`).

### Timeline Window Zoom Presets (`4s` | `8s` | `16s`)
- **Calibrated Time Horizons**: Users can switch between 3 discrete window span presets depending on editing or review intent:
  - **`4s` (Close-up / Precision)**: A 4.0-second visible window displaying 1-second ticks and 1-second labels. Optimizes legibility for dense, rapid dialogue exchanges and frame-accurate cue boundaries.
  - **`8s` (Default / Standard Sync)**: An 8.0-second visible window with 2-second major labels, balancing text snippet readability with forward lookahead anticipation.
  - **`16s` (Overview / Macro Pacing)**: A 16.0-second visible window with adaptive 2-second tick marks and 4-second major labels, visualizing the broader rhythm of the scene and quiet vs. active periods.
- **Context-Aware Header Segment**: Embedded directly to the left of the `Filters` button, the `[ 4s | 8s | 16s ]` control is rendered strictly in Timeline view, automatically hiding in Cards view without layout shift.
- **Adaptive Level-of-Detail (LOD)**: As the zoom horizon widens, timecode ruler ticks automatically space out to prevent label collisions, while narrow cue blocks (`widthPercent < 3.5%`) gracefully omit inner text snippets in favor of centered category pips and hover tooltips.
- **Session Persistence**: The chosen zoom preset is saved to `localStorage` (`sceneflow_timeline_zoom_preset`).

### Fixed vs. Flexible Track Height Mode (`[ Flex | Fixed ]`)
- **Dynamic vs. Pre-Allocated Layout**:
  - **`Flex` (Default)**: Tracks expand dynamically from a single 32px row to multi-row stacked layouts only when overlapping cues in the same category enter the visible window, contracting back when they exit to conserve vertical space.
  - **`Fixed`**: Each category pre-calculates its maximum potential overlapping sub-lanes across the entire script (`globalMaxSubLane + 1`) and locks its track height permanently from `00:00`. For instance, if dialogue overlaps anywhere in the scene, the dialogue lane renders as 2 rows with a persistent horizontal sub-lane divider from the very start.
- **Zero Vertical Layout Shift**: In `Fixed` mode, tracks never jump or change height during playback or scrubbing, ensuring rock-solid visual stability.
- **Adaptive Single-Row Header Hierarchy**: Consolidates all controls into an adaptive single row across all widths with progressive stepped label collapsing (`Sparkles` icon with collapsible `Highlights` title), strictly preserving the live active cue count and 8-slot category LED VU meter strip, with a space-saving single toggle button `[ ↕ Fixed ]` / `[ ↕ Flex ]` featuring dedicated icons and tooltips.
- **Session Persistence**: User preference is stored in `localStorage` (`sceneflow_timeline_height_mode`).

### Collapsible Filter Drawer & Toolbar (`HighlightFilterBar`)
- **Smooth Drawer Collapse**: The 8-category filter pill bar is tucked into a smoothly collapsible container (`max-h-32 opacity-100` ⇋ `max-h-0 opacity-0`), saving ~35–40px of vertical space for the multi-track timeline tracks.
- **Toolbar Toggle Button**: A dedicated `Filters` button sits in the timeline sub-toolbar (and in Tier 1 during Cards mode), persisting its expanded/collapsed state in `localStorage` (`sceneflow_highlight_filter_expanded`).
- **Muted Filter Pip**: When any categories are muted, the `Filters` button displays an active pulsing blue pip to ensure users are always aware filters are active even with the drawer collapsed.
- **Interactive Pills**: Clickable category pills with dynamic count indicators, theme colors, and active pulsing indicators. Toggle category visibility in both the timeline tracks and the script viewer.

### Asymmetric Dual-Axis Split & Zero-Scroll Layout
- **Horizontal Panel Splitter (`SplitPaneDivider`)**: Desktop users can drag the vertical divider between the left playback panel and the screenplay preview to customize workspace proportions. Defaults to 65% Left / 35% Right (clamped between 30% and 72%), reinforced with a hard minimum width guard (`MIN_PANEL_PIXEL_WIDTH = 380px`) to prevent collapsing into an unusable state on smaller laptops.
- **Vertical Video ⇕ Timeline Splitter (`VideoSplitDivider`)**: Replaces manual percentage size sliders with an interactive horizontal handle directly between the Video Player and the Active Highlights timeline.
  - Dragging down expands the video height (up to 480px) for detailed visual review.
  - Dragging up shrinks the video height (down to 160px), allocating maximum vertical space to multi-track timeline lanes.
  - Automatic 16:9 aspect scaling (`aspect-video` + `maxWidth: 100%`) ensures zero video distortion and completely eliminates lateral empty gutters.
- **Clean Headroom**: The redundant "NOW PLAYING" header row and percentage slider have been completely eliminated, reclaiming ~28px of top vertical space.
- **Hardware VSync Dragging & Gesture Safety**: Pointer movements are throttled via `requestAnimationFrame` with global `window`-level event subscriptions, `touch-action: none` gesture protection against Windows/touchpad scroll collisions, dynamic boundary deadband re-anchoring, and `.is-resizing-split` CSS transition suppression on `document.body` for rock-solid, uninterrupted cursor tracking.
- **Unified Mode-Aware "Reset View Layout" (`SettingsMenuDropdown`, <kbd>Shift+R</kbd>)**: Accessible inside Studio Settings (`[ ⚙️ Settings ▾ ]`), via the global <kbd>Shift+R</kbd> keyboard shortcut, or by double-clicking split dividers:
  - **In Edit Mode**: Snaps the 3-panel workstation to a calibrated **40 / 35 / 25** distribution (40% Left Media/Cues, 35% Center Screenplay, 25% Right Cue Inspector), restores the 220px vertical video height, expands collapsed video, and re-opens the cue inspector.
  - **In Playback Mode**: Snaps the 2-panel player to a **65 : 35** horizontal split (65% Left Player/Timeline, 35% Screenplay) and restores the 220px video height.
- **Decoupled Persistence**: Changes commit to `localStorage` (`sceneflow_split_ratio`, `sceneflow_edit_split_ratio`, `sceneflow_inspector_ratio`, `sceneflow_video_height`) only upon pointer release to eliminate main-thread disk I/O bottlenecks.

### Desktop 3-Panel Edit Workstation & Draggable Cue Inspector
- **Dedicated 3-Panel Workstation Layout**: Desktop Edit Mode organizes the workspace into three specialized vertical columns calibrated to **40 / 35 / 25**:
  1. *Left Panel (`EditLeftPanel`)*: Defaults to **40%** width, housing the media preview with live timecode HUD badge, persistent transport controls, and the time-clustered Sync Cues fluid grid.
  2. *Center Panel (Screenplay Canvas)*: Defaults to **35%** width (`flex-1 min-w-0`), an unobstructed reading canvas ensuring screenplay text editing never overlaps or collides with the cue inspector.
  3. *Right Panel (`EditRightPanel`)*: Defaults to **25%** width, a dedicated Cue Inspector panel featuring a 48px header matching the script toolbar, active status indicator (`Drafting`, `Editing`, `Idle`), collapsible toggle, embedded `CueEditorForm`, and an idle overview displaying cue statistics by category with quick editing shortcuts.
- **Draggable Vertical Inspector Splitter (`InspectorSplitDivider`)**:
  - Dragging the divider between the screenplay canvas and cue inspector resizes inspector ratio between `18%` (minimum, pixel floor `260px`) and `45%` (maximum), defaulting to `25%`.
  - Enforces minimum width floors so neither the script canvas nor inspector are ever crushed.
  - VSync-aligned `requestAnimationFrame` throttling and zero-transition suppression (`is-resizing-split`) deliver fluid, judder-free dragging.
  - Double-clicking the divider snaps inspector back to default layout (`25%`).
  - Keyboard accessible: <kbd>←</kbd> widens inspector by 1%, <kbd>→</kbd> narrows inspector by 1%, <kbd>Enter</kbd> / <kbd>Home</kbd> resets to default.
  - Persists preference in `localStorage` (`sceneflow_inspector_ratio`) upon drag release.
- **Interactive Panel Toggling**: A dedicated `<PanelRight />` toggle in `ScriptHeaderControls` allows collapsing or expanding the inspector on demand. Selecting script text or clicking any sync cue card automatically opens the inspector. Closing the inspector allows the center script canvas to smoothly expand into the remaining 60% space.
- **Ergonomic Cue Inspector Workstation (`CueEditorForm`, `CueTimingCard`, `CueSceneContext`, `CueScriptAnchoring`)**:
  - *Surrounding Scene Context Window*: Renders dimmed preceding (`PREV`) and following (`NEXT`) screenplay lines directly around the editable quote, providing instant narrative orientation.
  - *Audio-Visual Timing Deck*: Symmetrical Start and End boundary cards featuring precision timecodes (`00:00.2`), single-click micro-nudge steppers (`-0.5s`, `-0.1s`, `+0.1s`, `+0.5s`), clock capture buttons, a live calculated duration badge (`⏱ 1.6s`), and an integrated `Play Cue [▶]` preview button with a `Loop [🔁]` toggle for repetitive sound/speech auditing that dynamically adapts to nudged timestamps in real time without restarting playback.
  - *Script Anchoring Card*: Dedicated card retaining fully editable `Start Index` and `End Index` inputs (for manual cue drafting and pasting raw text), live character span counter (`54 chars`), and cue ID badge.
  - *Pinned Sticky Bottom Action Bar*: Anchors `Update Cue` (<kbd>Ctrl+Enter</kbd>), `Cancel` (with explicit design-system `<kbd>Esc</kbd>` badge), and `Delete` (with resting destructive red styling) permanently to the bottom of the inspector viewport, ensuring critical actions are always accessible without crowding the top header.
  - *Script Header Controls Symmetrical Docking*: Screenplay header docks active cue status badges (`Editing Cue` with pulsing amber dot / `Drafting Cue` with pulsing blue dot) and loaded line count on the left beside the title (`Script Editor`), leaving `[Edit Source]` (renamed from `[Edit Raw]`) modal trigger and inspector toggle focused on the right.

### Collapsible Video Player (Screen Recording Mode)
- **Unobstructed Timeline Viewport**: Playback mode features an interactive collapse toggle button in the `PLAYBACK` section header (`[ Hide Video ]` ⇋ `[ Show Video ]`) and a global keyboard shortcut (<kbd>V</kbd>) to collapse/hide the YouTube video player.
- **Tailored for Screen Recording**: Collapsing the video player gives the entire left panel height to the Multi-Track Sync Timeline and Active Highlights, removing visual clutter when capturing clean sync recordings of the timeline alongside screenplay text.
- **Zero-Height Audio & Sync Continuity**: The `<YouTube>` player remains fully mounted in the DOM using zero-height CSS clipping (`h-0 min-h-0 max-h-0 opacity-0 pointer-events-none !m-0 !p-0 overflow-hidden`). This guarantees:
  - Audio continues playing without disruption.
  - Video timecode ticks and real-time playback clock advance accurately.
  - Timeline playhead, cue activation glows, and screenplay auto-scrolling remain in perfect lockstep.
  - Re-expanding the player is instant with zero buffering or reload latency.
- **Context-Aware Header & Status Badge**: Displays an animated amber status pill (`Video Hidden`) when collapsed, and automatically hides the vertical `VideoSplitDivider` handle.
- **Session Persistence**: Stored in `localStorage` (`sceneflow_playback_video_collapsed`), and unified with the Reset View Layout action in Studio Settings or <kbd>Shift+R</kbd> to restore the video player in a single click.

### Persistent Playback Header Transport Controls
- **Always-Accessible Media Controls**: The `PLAYBACK` section header in `PlaybackLeftPanel` houses dedicated playback transport controls:
  - **Play / Pause Toggle**: Dynamically toggles between `Play` and `Pause` states with responsive icons and an active blue accent highlight when media is actively playing. Synchronized with the global <kbd>Space</kbd> and <kbd>K</kbd> keyboard shortcuts.
  - **Replay from Beginning (`0:00`)**: A single click on the `Replay` button (`RotateCcw`) immediately jumps playback to `0:00` and resumes playback, enabling fast iterative review without needing manual timeline scrubbing.
- **Continuous Operation While Video Is Collapsed**: Even when the video viewport is hidden via the `Hide Video` toggle or <kbd>V</kbd> key, the transport controls remain pinned in the header, allowing users to control playback and audio during timeline screen recording.
- **Fluid Viewport Responsiveness**: Button labels automatically collapse to compact icon buttons on mobile/tablet viewports (`hidden sm:inline`), ensuring zero header wrapping.

### Global 3-Zone Studio Header Layout (`AppHeader`, `ScriptHeaderControls`)
- **Balanced 3-Zone Composition**: Replaced the previous single-row cluster with a studio-grade 3-zone layout separating brand utilities, workflow state, and content/preferences:
  - **Left Wing (Brand & File Management)**: Houses the SceneFlow logo alongside a dedicated desktop `[ File ▾ ]` dropdown menu (`UI_TOKENS.button.filePill`), organized into three distinct tiers separated by hairline dividers:
    1. *Project I/O*: `Open Project...` and `Save Project` for the primary inspect-and-sync workflow.
    2. *Blank Canvas*: `New Project` with confirmation modal to clear the workspace and open Edit mode.
    3. *Resources & Discovery*: `Starter Guide` (`guide.json`) for the full interactive tutorial and `Browse Library...` for community screenplays.
  - **Center Stage (Workflow Mode Switcher)**: Features a centered segmented control (`[ ▶ Playback | ✏️ Edit ]`) with mode-specific active accents (soft blue for Playback, soft amber for Edit) and responsive icon collapsing. Both modes remain visible side-by-side, providing instant discoverability of the application's dual-mode architecture.
  - **Right Wing (Content, Support & Studio Tools)**:
    - **Standalone Library Gateway (`[ 📚 LIBRARY ]`)**: Featured prominently on a neutral surface pill (`UI_TOKENS.button.libraryPop`) with an amber book icon and uppercase tracked typography as the primary content discovery hub for screenplay examples and templates.
    - **Support on Ko-fi (`[ ☕ Support ]`)**: Vibrant warm red/coral button positioned directly adjacent to the Library.
    - **Studio Preferences Dropdown (`[ ⚙️ Settings ▾ ]`)**: Houses a discrete `[↺ Reset All]` header action (appearing when any preference or layout is non-default to restore theme, width, focus, and layout to defaults), a direct 4-theme quick-selector grid (`Auto`, `Light`, `Warm`, `Dark`), dedicated "Reading Canvas & Viewport" section with 5-segment Script Width row (progressive width bar glyphs) and 3-segment Focus Line row (miniature viewport devices with active amber indicators), Script Paper & Colors modal trigger (with <kbd>Shift+C</kbd> badge), Timing & Durations modal trigger (with <kbd>Shift+T</kbd> badge), and Reset View Layout trigger (with <kbd>Shift+R</kbd> badge, live pulse dot indicator, and dynamic `Custom` badge when layout is customized).
    - **Dedicated Info Trigger (`[ ℹ ]`)**: 1-click access to keyboard shortcuts directory, about details, and the deep-dive Substack overview card.
- **Fluid Single-Click Outside Dismissal**: Floating menus across both top header chrome and the screenplay preview toolbar (`ScriptHeaderControls`) use `useClickOutside` to detect outside clicks on `mousedown`, eliminating full-screen blocking backdrops. Users can switch directly between *File*, *Settings*, and *Auto-Scroll Focus* in a single fluid click without needing an intermediate dismissal click.
- **Truthful Shortcuts & Streamlined Badges**: All menus strictly display truthful functionality without non-existing keyboard shortcut annotations (<kbd>Ctrl+O</kbd>, <kbd>Ctrl+S</kbd>, <kbd>?</kbd>) or decorative pseudo-badges, ensuring clean, focused typography.
- **Decoupled Playback Performance (0 Hz Header Re-Render)**: Both global header chrome (`AppHeader`) and screenplay preview controls (`ScriptHeaderControls`) are completely decoupled from playback time updates, eliminating high-frequency virtual DOM diffing across the application shell during media playback. Timecode feedback is delegated exclusively to the video player transport and Timeline ruler.
- **Strict Mobile Exclusion**: Declared with unconditional `hidden lg:flex` to ensure desktop-only cue editing controls never leak into mobile playback viewports.
- **Mobile Workstation Layout Ergonomics (Playback vs. Edit)**:
  - **Playback Mode on Mobile**: The unified workstation header and media viewport pin to the top of the mobile screen (`sticky top-0 z-30 shadow-md border-b`) with natural content height, ensuring the screenplay Center Panel renders immediately below with full visibility, touch scrolling, and automatic dialogue tracking.
  - **Edit Mode on Mobile**: Expands the workstation to full height (`h-full overflow-hidden`), dedicating the entire handheld viewport to cue selection, category filtering, search, and timestamp editing.


---

## 5. Auto-Scroll & Viewport Alignment Engine

During video playback, the script auto-scrolls to follow active dialogue and narrative cues.

### Multi-Select Focus Modes
Users can choose which cue categories trigger auto-scrolling via the "Focus Mode" dropdown:
- Defaults to tracking `dialogue`.
- Can be multi-selected to follow any combination (e.g., `dialogue` + `action` + `camera`).
- Features quick "Select All" and "Reset" toggles.
- **Unified Split-Button Geometry**: Features a unified split button linking the primary auto-scroll toggle with the focus dropdown chevron, bound by `items-stretch` to guarantee equal height and consistent color styling without stepped lips or color mismatch.
- **Dynamic Category Indicators**: Indicator dots dynamically calibrate to the active script paper theme and cue palette profile (Standard 360° vs. Protan & Deutan Safe) via `getCueColorForTheme`, reinforced with an active ring border (`ring-1 ring-white/40`) when selected so colors never clash or wash out against primary blue selection surfaces.
- **Viewport-Safe Responsive Dropdown Alignment**: The Focus Mode dropdown anchors with left-alignment (`left-0`), expanding downward and rightward into the viewport so all category items and controls remain fully visible without mobile boundary clipping or offscreen overflow.
- **Uppercase Category Nomenclature**: Category labels are rendered in uppercase with letter tracking (`uppercase tracking-wider`), matching standard screenplay industry formatting conventions (ALL CAPS sluglines and cues) and ensuring acronyms like **VFX** are cleanly rendered without awkward title-casing.

### Priority Resolution Logic
When multiple cues are active simultaneously:
1. Prioritizes the cue with the **most recent start time**.
2. If start times match, prioritizes the cue situated **furthest down** in the screenplay text.

### Viewport Scroll Focus Alignment Presets (Desktop)
Selectable directly within Studio Settings (`[ ⚙️ Settings ▾ ]`) via a 3-segment miniature viewport control, determining where the active cue line settles vertically within the reading container:
- **Top (35%)**: Positions the active line 35% from the top of the container, leaving upcoming lines visible for anticipation reading (Default).
- **Center (50%)**: Positions the active line at the balanced midpoint.
- **Bottom (35%)**: Positions the active line 35% from the bottom (65% ratio) for reflection reading.
- Switching presets immediately recalculates and smoothly scrolls to the active cue element; preferences persist in `localStorage`.
- Mobile and tablet viewports use native viewport centering for screen economy.

### VSync Frame-Aligned Scheduling & Layout Reflow Elimination
- **Display-Rate Auto-Scroll Animator (`smoothScrollTo`)**: Replaces browser-native `behavior: 'smooth'` (which is capped at 60Hz in Windows Chromium, causing frame pacing judder on high-refresh displays and in 60fps screen captures) with a custom `requestAnimationFrame` cubic ease-out (`1 - (1 - t)^3`) animator.
- **User Gesture Interruption**: Passive `wheel` and `touchmove` listeners on the scroll container cancel active auto-scroll animations immediately upon manual user interaction without scroll fighting.
- **Stale Frame Cancellation & Deadband Guard**: Rapid cue transitions cancel pending animation frames before scheduling a new target, while a 10px scroll distance deadband (`Math.abs(container.scrollTop - targetScrollTop) > 10`) suppresses micro-scroll jitter when consecutive cues activate on the same line.

### Sub-Second Playback Render Isolation (`ScriptLine` Memoization)
- **Decoupled Script Text Processing**: The regex and token parsing pipeline (`processScript`) runs exclusively when script text changes, eliminating redundant parsing cycles during video playback.
- **$O(1)$ Cue Pre-Indexing**: Overlapping cues are indexed to line numbers on script load, removing nested $O(\text{lines} \times \text{cues})$ filter passes on every 100ms clock tick.
- **Decoupled Non-Cue Line Diffing**: In `App.tsx`, lines with zero overlapping cues receive static `currentTime={0}`, allowing React to skip virtual DOM prop diffing and reconciliation across 85%+ of screenplay lines on every playback tick.
- **Granular Line Updates**: Screenplay lines without cues completely skip React re-renders during playback. Only lines whose cues are currently active, fading in/out, or transitioning state re-render, ensuring silky-smooth 60fps playback even on long screenplays with 100+ cues.
- **GPU CSS Highlight Transitions**: Screenplay highlight spans apply `100ms linear` transitions for background color and glow, allowing the GPU compositor to interpolate 100ms timer ticks into smooth, continuous analog light fades without CPU overhead.

---

## 6. Script Viewer Customization & Dynamic Multi-Theming

### Dynamic App Shell Theming (Light / Warm / Dark)
The application shell features three bespoke CSS variable palettes that dynamically skin the entire workspace (Header, Left Panels, Modals, Desk Surface):
- **Light Mode**: Crisp studio paper with neutral stone surfaces (`#ffffff`, `#f5f5f4`, `#1c1917`).
- **Warm Mode**: Soft antique sepia & warm umber parchment (`#faf7f0`, `#f3efe6`, `#2b231d`).
- **Dark Mode**: Midnight slate with high-contrast light text (`#171514`, `#0c0a09`, `#f5f5f4`).
- **Auto-Sync Mode (Default)**: Changing the screenplay paper preset automatically transitions the application shell to the matching theme category.
- **Manual Mode Selection**: Users can select their desired App Theme directly via the 4-theme quick-selector grid (`Auto`, `Light`, `Warm`, `Dark`) inside Studio Settings (`[ ⚙️ Settings ▾ ]`) on desktop, or via the 4-segment switcher in the mobile theme drawer (`MobileColorModal`). Preference is persisted in `localStorage`.

### 6-Theme Script Engine
Users can toggle between six screenplay visual themes via the desktop `ScriptColorModal` or the mobile `MobileColorModal`:
- **Light & Warm Themes**:
  - *Studio Crisp*: Neutral stone paper with crisp contrast (Default).
  - *Warm Parchment*: Vintage sepia-toned typewriter paper.
  - *Newsprint (Retro Newspaper)*: High-contrast vintage gray newsprint for daytime reading.
- **Dark Themes**:
  - *Midnight Slate*: Refined dark slate for low-light environments.
  - *OLED Blackout*: Pure black (`#000000`) for power efficiency and high-contrast glow.
  - *Navy Slate (Cyber Matrix)*: Deep navy-tinted dark paper with atmospheric glow.
- **Desktop Theme Modal (`ScriptColorModal`)**:
  - **Theme Presets Tab**: Compact zero-scroll layout featuring a top controls row (Cue Palette Accessibility Profile segmented buttons + Pure Black Canvas toggle switch) above a 2-column grid of theme cards with live mini paper previews (heading banner, dialogue line, staging pill, and cue highlight dots) and non-overlapping selection checkmarks.
  - **Element Inspector Tab**: Displays active paper and structural tokens alongside the full 8-category highlight spectrum with live accessibility profile calibration.
  - Includes a single-click "Reset" button to restore the default *Studio Crisp* theme.
- **Mobile Theme Drawer (`MobileColorModal`)**:
  - A touch-friendly bottom-sheet drawer with a 4-segment App Shell switcher (`Auto`, `Light`, `Warm`, `Dark`) and 6 compact screenplay cards styled in their true paper colors and typography contrast, triggered via the icon-only palette button (`<Palette size={12} />`) in the mobile playback header.

### Cue Palette Accessibility Profile (Standard vs. Protan & Deutan Safe)
Accessible directly inside both `ScriptColorModal` and `MobileColorModal`:
- **Standard Cinema (`standard`)**: Default 360° color-wheel balanced palette across all 8 cue categories (Transition: Crimson Rose, Shot: Deep Iris, VFX: Electric Aqua, Action: Royal Cobalt Blue, Camera: Emerald Green, Audio: Bright Amber Orange, Dialogue: Amber Gold, Environment: Steel Slate).
- **Protan & Deutan Safe (`protanopia`)**: Designed specifically for Red-Green Color Vision Deficiency (Protanopia and Deuteranopia).
  - **The CVD Challenge**: Reduced L/M-cone sensitivity causes purple/indigo and blue to collapse into identical blue tones when luminance levels match. Users with protanopia cannot distinguish between Action (Blue) and Shot (Indigo/Purple).
  - **Deep Wine / Burgundy Remapping**: Remaps **Shot** away from the blue/indigo family to **Deep Wine / Burgundy** (`rgb(136, 19, 55)` in light paper / `rgb(225, 29, 72)` in dark paper). In protanopia, this registers as a warm, rich chocolate-wine tone ($L^* \approx 25$) with massive luminance and chromatic contrast against Cobalt Blue Action ($L^* \approx 50$), eliminating ambiguity.
  - **Radiant Ice Aqua VFX & Vermilion Coral Transition**: Elevates VFX to ultra-high-luminance Ice Aqua (`rgb(103, 232, 249)` in dark themes, $L^* \approx 85$) and Transition to warm Vermilion Coral (`rgb(234, 88, 12)`).
- **Live Synchronization**: Toggling the accessibility profile immediately updates screenplay text highlights, multi-track timeline lanes, Active Highlights VU meter and cards, and modal inspector swatches without page reloads.
- **Session Persistence**: User preference is preserved in `localStorage` (`sceneflow_cue_palette_profile`).

### Pure Black Canvas (Video Overlay Mode)
- **Engineered for Video Compositing**: An opt-in toggle within both `ScriptColorModal` and `MobileColorModal` designed specifically for creators recording the screenplay, filter badges, or timeline as video overlays.
- **True `#000000` on Dark Themes**: When toggled ON with any dark theme (`Midnight Slate`, `OLED Blackout`, `Navy Slate`), forces literal RGB `0, 0, 0` backgrounds across the entire app (`--app-bg`, `--surface`, `--surface-dark`), allowing Screen or Lighten blend modes in editing software (Premiere Pro, DaVinci Resolve, Final Cut, OBS) to key out the background with 100% transparency without hazy rectangular artifacts.
- **Clean Paper Border Framing**: Strips fuzzy drop shadow halos (`!shadow-none`), hides decorative hole-punches, and renders scene heading banner backgrounds as transparent, while preserving the sharp 1px paper border (`activeTheme.paperBorder`) to maintain clear manuscript structure.
- **Full-App Overlay Alignment**: Extends `#000000` to the left panel, category filter pills (`HighlightFilterBar`), and horizontal multi-track timeline lanes (`.timeline-track-field`), supporting cropped recordings of any UI section with zero background milkiness.
- **Light & Warm Theme Safety**: Strictly inactive on light and warm themes (`Studio Crisp`, `Warm Parchment`, `Newsprint`), preserving standard reading comfort. Switching back to any dark theme instantly re-engages pure black rendering.
- **Session Persistence**: User preference is preserved in `localStorage` (`sceneflow_pure_black_bg`).

### Configurable Screenplay Width Presets (Desktop Playback)
Selectable directly within Studio Settings (`[ ⚙️ Settings ▾ ]`) via a 5-segment progressive width bar control under Reading Canvas & Viewport:
- *Narrow*: 384px (`max-w-sm`) — Focused reading column.
- *Compact*: 448px (`max-w-md`) — Snug reading view.
- *Standard*: 576px (`max-w-xl`) — Default classic screenplay width.
- *Wide*: 768px (`max-w-3xl`) — Spacious dual-column feel.
- *Expanded*: 1024px (`max-w-5xl`) — Full page layout.
- Width preference is saved to `localStorage` and hidden on mobile screens.

---

## 7. Timing Settings & Buffer Engine

Fine-tunes highlight visibility timing before and after actual cue timestamps:
- **General Master Offset**: Global `before` and `after` buffers applied across all cue categories.
- **Category-Specific Offsets**: Individual `before` and `after` buffers for each of the 8 cue types.
- **Negative Offsets**: Supports negative values to display highlights earlier or end them sooner.
- **Formula**: `Effective Visibility Window = [StartTime - (GlobalBefore + CategoryBefore), EndTime + (GlobalAfter + CategoryAfter)]`.
- **Timeline & Inspector Synchronization**: The timeline's active playhead detection and docked inspector honor the full visibility window, illuminating cues across their `before`/`after` lead-in while maintaining accurate audio media positions on the ruler.
- **Dynamic Theme-Aware Swatches**: Each category configuration card displays a color indicator dot dynamically resolved with the active script theme and CVD accessibility profile via `getCueColorForTheme`.
- **Theme-Calibrated Master Control**: The General Master Offset hero panel and its high-density numerical inputs strictly adhere to App Shell design system tokens (`UI_TOKENS.panel.accentCardBlue` and `UI_TOKENS.input.numberBoxLg`), providing seamless alpha-tinted styling across Light, Warm, Dark, and Pure Black themes.
- Reset button restores all timing settings to `0.0s` defaults.

---

## 8. Persistence, Sharing, & Library Catalogue

### Local Persistence
All project states (`screenplay_sync_state`), active workflow mode (`sceneflow_app_mode`), theme preferences (`sceneflow_script_theme`), cue palette accessibility profile (`sceneflow_cue_palette_profile`), width presets (`sceneflow_script_width_preset`), scroll focus settings (`sceneflow_scroll_focus_preset`), timeline view mode (`sceneflow_highlight_view_mode`), and filter drawer state (`sceneflow_highlight_filter_expanded`) persist in `localStorage`.

### Default Project, New Projects, & Starter Guide
- **Default Load**: Fresh visits default to loading the **Scene Frequency** (`scene_frequency.json`) demo script.
- **Synchronous Player Reset on Load**: Project loaders (`New Project`, `Starter Guide`, `Open Project...`, example scripts, and remote URLs) synchronously trigger `resetPlayback()` in `useYouTubePlayer`, clearing running timers, zeroing timecode to `00:00`, and pausing and seeking the player.
- **`[ File ▾ ]` Desktop Dropdown Menu**: Accessible from the desktop header with a 3-tier organized structure:
  1. *Project I/O*: `Open Project...` (local `.json` file upload) and `Save Project` (export active state).
  2. *Blank Canvas*: `New Project` prompts confirmation to clear the workspace with a fresh empty template (`blank.json`) and automatically transitions into Edit mode.
  3. *Reference & Discovery*: `Starter Guide` loads the official 1,200+ line interactive instructional guide (`guide.json`) in Playback mode; `Browse Library...` opens the curated example catalog modal.

### Export & Import
- **Export (`Save Project`)**: Downloads current project as a JSON bundle containing `youtubeId`, `scriptText`, `cues`, and `settings`.
- **Import (`Open Project...`)**: Uploads any valid SceneFlow JSON file and triggers automatic cue realignment.

### Query Parameters
- `?example=ID`: Loads any built-in example from the catalogue (e.g., `?example=mosaic`, `?example=twm_vol1`, `?example=scene_frequency`).
- `?project=URL`: Fetches a JSON project from a CORS-enabled remote server.
- All query-based loads prompt a confirmation modal with error reporting before replacing the workspace.

### Library Catalogue (Desktop & Mobile)
An interactive catalogue featuring curated screenplays organized into 4 distinct sections: **AI Scenes**, **The Written Motion (TWM Anthology)**, **FRAME Series**, and **AI Clips**.

For a complete and up-to-date list of all available sceneflow projects, release dates, video models, and shareable IDs, refer to the **[SceneFlow Catalogue](../SCENEFLOW_CATALOGUE.md)**.

#### Catalogue Features
- **`hideFromAll` Filtering**: Excludes high-density vignettes (e.g., AI Clips) from populating the unified "All Works" view.
- **Contextual Section Badges**: Displays source category badges on cards in aggregated views ("All Works", "Featured Works") and suppresses them within category-specific views.
- **Sorting Controls**: Toggle lists by "Latest" (newest release date), "Oldest", or "A-Z" alphabetical order. Inactive/draft scripts are automatically placed at the bottom.
- **Dual Modal Architecture**: Full modal dialog on desktop viewports (`LibraryModal`), touch-friendly bottom-sheet drawer on mobile viewports (`MobileLibraryModal`).
- **Foundational Introduction Link**: Direct link to the official introductory publication on Substack accessible in modal headers (`[ Introduction ]` on desktop, `[ Intro ]` on mobile).
- **Updates on X & Creator Tip**: Direct links to the creator's X profile (`@tarumainfo`) for project updates (`[ 𝕏 Updates ]` pill on desktop, `[ 𝕏 ]` icon on mobile) and Ko-fi creator tip link (`[ ☕ Tip ]` pill on desktop, `[ ☕ ]` icon on mobile).

---

## 9. Application Information & Keyboard Navigation

### Desktop App Info Modal (`AppInfoModal`)
Accessible via the `i` (Info) icon button in the desktop header toolbar:
- **Dynamic Version & Metadata**: Automatically loads current version (`v2.4.0`), app title, and description directly from `metadata.json`.
- **Author Attribution**: Features creator credit for **Taruma Sakti** in header and footer linking directly to [Linktree](https://linktr.ee/tarumainfo).
- **Featured Substack Deep Dive**: Prominent hero card showcasing the official introductory article (*Introducing SceneFlow: Script-to-Screen Synchronization* on Substack) with a dedicated header badge, full-width summary, and direct article link.
- **Interactive Resource Grid**: 2x2 resource links for GitHub Repository, Documentation / Guide, Release Notes (Changelog), and Ko-fi Support.
- **MIT License**: License status indicator.

### Global Keyboard Shortcuts & Modal Dismissal
Available on desktop across both Playback and Edit modes with automatic input/textarea and modal guards:
- `Space` / `K`: Toggle YouTube video playback (Play / Pause).
- `←` / `→` (ArrowLeft / ArrowRight): Seek -5s / +5s.
- `J` / `L`: Seek -5s / +5s (YouTube standard navigation hotkeys).
- `V`: Toggle video player visibility / collapse (Playback and Edit modes).
- `Shift + C`: Open Script Paper & Colors modal.
- `Shift + T`: Open Timing & Durations modal.
- `Shift + R`: Reset View Layout & Video Size to defaults.
- `Esc`: Close any active modal or popover (`ScriptColorModal`, `TimingSettingsModal`, `LibraryModal`, `MobileLibraryModal`, `RawScriptModal`, `RawCuesModal`, `DeleteConfirmationModal`, `ResetConfirmationModal`, `StagingModal`, `AppInfoModal`, `OverlapPicker`).
- **Backdrop Dismissal**: Clicking outside modal content on the backdrop overlay dismisses the active modal.
- **Shortcuts Safeguard**: All playback and studio hotkeys are automatically gated and disabled whenever any modal or confirmation prompt is open, or when typing inside inputs, textareas, or contentEditable elements.



