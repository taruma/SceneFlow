# Agent Guidelines

This document provides instructions for AI agents and developers who need to maintain, extend, or modify the SceneFlow codebase.

## 1. Extending the Script Parser & Line Types

If you need to add a new script line type (e.g., `lyrics`, `transition`, or a specialized directive):

1. **Update Line Types**: Add the new type identifier to the `LineType` union in `src/lib/scriptProcessor.ts`:
   ```typescript
   export type LineType = 
     | 'name' 
     | 'speech' 
     | 'parenthetical' 
     | 'heading' 
     | 'note' 
     | 'effect' 
     | 'separator' 
     | 'part-separator' 
     | 'roman-title' 
     | 'action' 
     | 'default'
     | 'new-type';
   ```
2. **Implement Detection Logic**: Update `processScript()` in `src/lib/scriptProcessor.ts` with regex or heuristic rules to classify the line into your new type.
3. **Map Visual Styles**: Update `getLineClass()` in `src/lib/scriptStyles.ts` to return the appropriate Tailwind CSS classes, referencing active theme tokens (e.g., `theme.textColor`, `theme.textMutedColor`).

## 2. Modifying Styles, UI Tokens, & Script Themes

**DO NOT** write hardcoded Tailwind color classes directly into `src/App.tsx` or components for screenplay text, cue highlights, or modal containers.

- **Modular Design Tokens (`src/styles/tokens/`)**:
  - `ui.ts`: Centralized `UI_TOKENS` for layout shells (`layout`), modals & overlays (`modal`), dropdown menus (`dropdown`), buttons & action pills (`button`), form controls (`input`), badges & time tags (`badge`, including `counter`, `timeCompact`, and `shortcut`), panel cards (`panel`), swatches (`swatch`), and alert containers (`alert`).
  - `src/index.css`: Semantic CSS custom properties defined in `:root` (`--app-bg`, `--surface`, `--border-main`, `--text-main`, `--overlay-bg`, `--color-support`) and mapped into Tailwind CSS v4's `@theme` directive.
  - `themes.ts`: Six visual themes configured in `SCRIPT_THEMES` (`light`, `warm`, `dark`).
  - `cues.ts`: Theme-calibrated RGB strings (`lightRgb`, `warmRgb`, `darkRgb`) defined across two curated palette profiles: `CUE_COLOR_DEFINITIONS_STANDARD` (360° balanced cinema spectrum) and `CUE_COLOR_DEFINITIONS_PROTANOPIA` (Red-Green Color Vision Deficiency safe mode with Deep Wine Shot). Resolved via `getCueColorForTheme(typeOrClass, themeId, paletteProfile)` with fallback normalization in `LEGACY_CLASS_MAP`.
  - `typography.ts`: Theme-specific structural classes and typography generated dynamically via `getScriptThemeStyles(themeId)`.
  - `helpers.ts`: Color manipulation and dynamic badge style generators (`hexToRgba`, `createCueBadgeStyle`, `createInlineCueStyle`).
- **Hook Integration (`useScriptTheme`)**: Use the `useScriptTheme(scriptThemeId, cuePaletteProfile)` hook in components to access active `themeStyles`, `themeMetadata`, `isDark`, and `resolveCueColor` helpers dynamically synchronized with the active accessibility profile.
- **Dynamic Category Indicator Invariant**: Category dot indicators across playback headers, dropdowns, and configuration modals (`ScriptHeaderControls`, `TimingSettingsModal`, `HighlightFilterBar`, `SyncCuesPanel`) must never use static Tailwind classes (`color.class`). They must resolve dynamically via `getCueColorForTheme(type, scriptThemeId, cuePaletteProfile)` to ensure accurate theme and CVD-safe palette rendering without contrast loss on active selection surfaces.
- **Dropdown Viewport Alignment Invariant**: Floating menus must anchor dynamically relative to viewport boundaries to eliminate offscreen clipping: menus on compact or left-aligned toolbars (mobile `ScriptHeaderControls`, `FileMenuDropdown`) must use left-anchoring (`left-0`, e.g. `UI_TOKENS.dropdown.menuLeft`); menus positioned at the far right on desktop (desktop `ScriptHeaderControls`, `SettingsMenuDropdown`) must anchor to the right (`lg:right-0 lg:left-auto` or `right-0`, e.g. `UI_TOKENS.dropdown.menuRight`) so they drop down cleanly into the reading canvas rather than overflowing past the right window frame.
- **Screenplay Cue Nomenclature & Typography Invariant**: Category and cue selectors (such as the Auto-Scroll "Focus Mode" dropdown) must render category names in uppercase with letter tracking (`uppercase tracking-wider`) to match standard screenplay industry formatting conventions (ALL CAPS sluglines and cues) and prevent title-casing acronym artifacts (e.g., ensuring VFX never renders as "Vfx").
- **Theming & Video Overlay Invariants (`.agents/rules/theming-and-overlay-invariants.md`)**: Strictly maintain two-tier independence between the App Shell (`themeMode` $\to$ `effectiveCategory`) and the Script Paper (`scriptThemeId` $\to$ `activeTheme.category`). When `pureBlackMode` is active on dark themes, DOM attributes (`data-pure-black-script` and `data-pure-black-shell`) ensure `#000000` backgrounds, stripped drop shadows, and hidden punch holes, while preserving `activeTheme.paperBorder`. Light and warm themes must remain completely untouched.
- **Token Context & Surface Contrast Invariant**: `--btn-primary-text` is specifically paired with `--btn-primary-bg`. In dark mode, primary action buttons invert to light backgrounds, causing `--btn-primary-text` to become dark (`#1c1917`). Never use `text-btn-primary-text` inside permanently dark surfaces such as `bg-surface-dark` (e.g., permanently dark indicators or overlays), as this creates near-black on black contrast failure (~1.1:1). Always use explicit `text-white` or tokens coupled with the appropriate surface background.
- **Translucent Accent Surfaces Invariant**: Container panels designed with chromatic emphasis or callouts (such as the General Master Offset card in `TimingSettingsModal`) must strictly utilize alpha-translucent tokens (`bg-blue-500/10`, `border-blue-500/20`) rather than opaque static light-mode fills (`bg-blue-50`, `border-blue-100`). This ensures callout cards produce an ambient accent wash on light surfaces while naturally illuminating as a sleek, low-glare dark navy container in dark and pure black modes without inverting nested input contrast.
- **Translucent Ambient Gradient Opacity Calibration Invariant (`.agents/rules/theming-and-overlay-invariants.md`)**: When rendering directional translucent ambient washes over variable theme surfaces, never scale leading edge opacity below 8% (the perceptual invisibility floor). Calibrate secondary co-active ambient washes to 14%–16% (falling to 4%–5%) without custom borders or glow, and primary scroll focus anchors to 22%–25% (falling to 6%–7%) paired with a theme border (`rgba(rgb, 0.65)`) and 10px outer glow halo.
- **Base Typography**: Maintain the `baseStyle` constant (`"whitespace-pre-wrap min-h-[1em] leading-snug"`) to preserve consistent line height and wrapping behavior.

## 3. Regex & Parsing Standards

The parser relies on deterministic line-by-line regex patterns. When modifying or adding patterns, adhere to the following standards:

- **Character Names**: Must be ALL CAPS and end with a colon (`^[A-Z0-9_\s]+:$`). Dialogue lines immediately following a character line inherit character speech context.
- **Scene Headings**: Must detect case-insensitive `INT.` and `EXT.` at line start.
- **Staging Blocks**: Line-based parsing. Look for `[[STAGING]]` and `[[/STAGING]]` on their own lines, enclosing labeled sub-blocks (`[[LABEL]]...[[/LABEL]]`). Do not match staging tags inline.
- **Brief Blocks**: Match opening `[<BRIEF>]` and closing `[</BRIEF>]` tags on their own lines. Ensure whitespace-only lines inside brief blocks are skipped to prevent ghost cards.
- **Roman Numerals**: Match uppercase roman numerals with a trailing period (e.g., `^IV\.\s+.+$`) with uppercase line validation.
- **Exclusion Filters**: When implementing search or auto-alignment engines, always exclude text ranges within `[[STAGING]]` blocks so cues never snap to hidden prompt metadata.

## 4. Sync Logic & Rendering Performance

The `renderedScript` rendering pipeline in `src/App.tsx` runs frequently as YouTube video playback advances (`currentTime` updates every 100ms):

- **Decoupled Script Parsing**: Never run `processScript()` inside hooks or render passes that depend on `currentTime`. Script text parsing must remain independently memoized (`processedLines = useMemo(() => processScript(state.scriptText || ""), [state.scriptText])`), executing strictly when the text changes.
- **Pre-Indexed Cue Mapping**: Never perform nested array filtering (`cues.filter()`) across all screenplay lines during playback. Pre-index overlapping cues by line index (`cuesByLineIndex = useMemo(..., [state.cues, processedLines])`) and provide a stable `EMPTY_CUES_ARRAY` reference for lines without cues.
- **Memoized Line-Level Isolation & Decoupled Non-Cue Lines (`ScriptLine`, `App.tsx`)**: Delegate line rendering to `<ScriptLine />` wrapped in `React.memo` with `areScriptLinePropsEqual`. Pass static `currentTime={0}` to lines with zero overlapping cues (`lineCues.length === 0`) so React skips prop diffing and reconciliation across 85%+ of screenplay lines on every 100ms tick. Lines with cues must re-render only when a cue on that line changes active status or exceeds a 0.005 opacity transition delta.
- **144Hz Native Auto-Scroll Animator (`useAutoScroll`)**: Always execute programmatic auto-scrolling via a custom `requestAnimationFrame` cubic ease-out animator (`smoothScrollTo`) rather than browser-native `behavior: 'smooth'`, eliminating 60Hz scroll pacing judder and frame rate mismatch on high-refresh displays and 60fps screen recordings. Attach passive `wheel` and `touchmove` listeners to cancel in-progress auto-scroll animations immediately upon user manual input without scroll fighting. Enforce a 10px deadband threshold (`Math.abs(container.scrollTop - targetScrollTop) > 10`) before initiating scroll.
- **144Hz Smooth Timeline Clock Extrapolator (`useSmoothTimelineTime`)**: The Multi-Track Timeline consumes continuous `displayTime` from `useSmoothTimelineTime`, advancing timeline coordinates on every display refresh (144Hz, 120Hz, 60Hz) via `requestAnimationFrame` and `performance.now()`. Soft-syncs against 100ms YouTube timecode ticks to prevent long-term drift without visual pops, and halts when paused for 0 idle overhead.
- **Stabilized Cue Block Duration Geometry (`useTimelineWindow`)**: Cue blocks in `useTimelineWindow` compute fixed duration widths directly from `(cue.endTime - cue.startTime) / totalSpanSeconds * 100`, eliminating start/end window boundary clamping that previously caused blocks to accordion/compress and trigger continuous layout reflows as they traversed window edges. Edge clipping is handled naturally by the track container's `overflow-hidden`.
- **Analog Cue Highlight Transitions**: Cue highlight `<span>` elements must apply linear CSS transitions (`transition: background-color 100ms linear, box-shadow 100ms linear`) strictly during playback mode (`mode === 'playback' && !isTemp`). This offloads color and glow fading between 100ms timer ticks directly to the GPU compositor for smooth analog illumination without CPU load.
- **Reference-Stable Active Categories**: In `App.tsx`, preserve `activeCueTypes` `Set` reference equality across 100ms timer ticks when active category members have not changed, preventing spurious re-renders across the left playback panel tree.
- **Dormant Component Calculations**: In `HighlightTimelineView.tsx`, short-circuit `activeCuesUnderPlayhead` during playback when `selectedCue === null` to avoid redundant cue array filtering while `PausedInspectorCard` is unmounted.
- **Stable React Keys**: Ensure rendered elements have stable `key` attributes based on `lineIdx`, `cue.id`, or unique segment offsets (`${lineIdx}-${start}`).
- **Opacity Transitions**: In playback mode, opacity is calculated dynamically against per-category before/after buffers. In edit mode, non-active cues remain visible at reduced opacity (0.4) for editing affordance.

## 5. Persistence, State, & External Data

When modifying application state, storage keys, or external fetching:

- **State Schema**: Maintain the `AppState` interface in `src/types/script.ts` (`youtubeId`, `scriptText`, `cues: Cue[]`, `settings?: Record<string, TimingSettings>`).
- **Storage Hook Handlers (`useScriptStorage`)**:
  - `loadBlank()`: Fetches `/examples/blank.json`, returning an empty canvas (`scriptText: ""`, `cues: []`, zeroed default settings) for clean project authoring.
  - `loadGuide()`: Fetches `/examples/guide.json`, loading the comprehensive 1,200+ line interactive tutorial project in Playback mode.
  - `resetConfirmation.type`: Supports `'settings' | 'data' | 'blank' | 'new' | 'guide' | 'example' | 'remote'`.
- **LocalStorage Keys & Centralized Dictionary (`SCRIPT_PREFERENCES_STORAGE_KEYS`)**:
  - Centralized in `src/hooks/useScriptPreferences.ts` under `SCRIPT_PREFERENCES_STORAGE_KEYS` to eliminate raw string literal duplication and typo risks across getters and setters:
    - `'screenplay_sync_state'`: Core project data (video ID, script text, cues, timing settings).
    - `'sceneflow_app_mode'`: Active workflow mode (`AppMode`: `'playback' | 'edit'`).
    - `'sceneflow_app_theme_mode'`: Active application shell theme mode (`AppThemeMode`: `'auto' | 'light' | 'warm' | 'dark'`).
    - `'sceneflow_script_theme'`: Active script viewer theme ID (`ScriptThemeId`).
    - `'sceneflow_cue_palette_profile'`: Active cue palette accessibility profile (`CuePaletteProfile`: `'standard' | 'protanopia'`).
    - `'sceneflow_script_width_preset'`: Active desktop script width preset (`ScriptWidthPresetId`).
    - `'sceneflow_scroll_focus_preset'`: Active desktop auto-scroll focus anchor (`ScrollFocusPresetId`).
    - `'sceneflow_highlight_view_mode'`: Active highlights presentation mode (`HighlightViewMode`: `'timeline' | 'cards'`).
    - `'sceneflow_highlight_filter_expanded'`: Collapsed/expanded state of playback category filters (`boolean`).
    - `'sceneflow_timeline_zoom_preset'`: Active timeline visible window zoom preset (`TimelineZoomPreset`: `'4s' | '8s' | '16s'`).
    - `'sceneflow_timeline_height_mode'`: Active timeline track height mode (`TimelineHeightMode`: `'flexible' | 'fixed'`).
    - `'sceneflow_split_ratio'`: Active desktop split pane ratio (`number`).
    - `'sceneflow_video_height'`: Active playback video player height in pixels (`number`).
    - `'sceneflow_playback_video_collapsed'`: Video player collapsed/hidden state in Playback mode (`boolean`).
    - `'sceneflow_pure_black_bg'`: Pure Black Canvas / Video Overlay mode toggle state (`boolean`).
    - `'sceneflow_edit_autoscroll'`: Active auto-scroll state in Edit Mode Left Panel (`boolean`).
- **Query Parameters**: On application mount, inspect `window.location.search`:
  - `?example=ID`: Matches an example `id` from `EXAMPLE_SECTIONS` in `src/examples.ts`.
  - `?project=URL`: Loads a remote CORS-enabled JSON project.
  - Clean up query parameters immediately after detection using `window.history.replaceState`.
- **Remote Fetching**: Use the `loadRemoteProject()` pattern with error handling and confirmation modals (`ResetConfirmationModal`) to prevent unintentional data overwrite.

## 6. Responsive UI & Modal Architecture

- **Desktop vs. Mobile Modals**: Desktop browsing uses the full-featured `src/components/LibraryModal.tsx` with search, sorting, and category sidebar. Mobile devices use the touch-optimized bottom-sheet drawer `src/components/MobileLibraryModal.tsx`. Both share state and are mutually exclusive based on viewport width (`lg` breakpoint).
- **Header Adaptations**: On mobile screens, hide width selectors and edit toggles to prevent crowding, surfacing direct Library access and the Ko-fi support button.

## 7. Adding & Managing Catalogue Examples

SceneFlow maintains a curated library of built-in projects across 4 categories: **AI Scenes**, **The Written Motion (TWM Anthology)**, **FRAME Series**, and **AI Clips**. When adding or updating an example in any category:

1. **JSON Asset Placement & Validation**:
   - Place the project JSON in `public/examples/` (e.g. `public/examples/twm_vol1_the_breaking_point.json`, `public/examples/scenes/scene_observation_only.json`, or `public/examples/ai_clips/clip_khemia.json`).
   - Ensure the JSON conforms to `AppState`:
     - `youtubeId`: Valid YouTube video URL or ID.
     - `scriptText`: Clean script text formatted according to screenplay or auteur staging heuristics.
     - `cues`: Array of valid cue objects (`id`, `type`, `selectedText`, `startTime`, `endTime`, `speaker`, `colorClass`, `startIndex`, `endIndex`).
     - `settings` (optional): Per-category timing buffer configuration.

2. **Register in `src/examples.ts`**:
   - Add the entry to the corresponding section array in `EXAMPLE_SECTIONS`.
   - **Path Accuracy**: Ensure `path` strictly mirrors the actual file location under `public/` (e.g., `/examples/ai_clips/clip_khemia.json`, `/examples/scenes/scene_observation_only.json`, or `/examples/frame_08.json`).
   - Populate metadata: `id` (must be unique across all sections), `title`, `description`, `releaseDate` (`YYYY-MM-DD`), and `tags`.

3. **Synchronize `SCENEFLOW_CATALOGUE.md`**:
   - Increment the section count in the target header: `## <Category Name> (N)`.
   - Insert the new example into the section table, maintaining reverse-chronological order (newest `releaseDate` first):
     `| Date | ID | Title | Video Model |`

4. **Verification**:
   - Run `npm run lint` (`tsc --noEmit`) to verify TypeScript integrity.
   - Verify that the example loads properly via direct query parameter (`?example=<id>`).

5. **Commit Message Convention**:
   - Use the repository's semantic commit pattern:
     `feat: add <Title> [<category>] example and register it in catalogue`
     *(Examples: `feat: add Observation Only AI scene example and register it in catalogue`, `feat: add Khemia AI clip example and register it in the examples catalogue`)*

## 8. Media Timeline Synchronization & Playback Invariants

When developing or modifying playback, cue synchronization, or timeline visualization in SceneFlow:

1. **The Dual-Time Principle**:
   - **Physical Media Time (`[startTime, endTime]`)**: Strictly dictates timeline block geometry (`leftPercent`, `widthPercent`), timecode ruler ticks, duration badges, and sub-lane collision intervals. Blocks are never physically stretched or shifted by `before`/`after` buffers to avoid distorting audio timing.
   - **Perceptual Activation Buffers (`isCueActive(cue, currentTime, settings)`)**: Governs visual activation states: cue illumination outlines, pulsing lane indicator dots, inspector card docking, and screenplay text highlighting.

2. **YouTube IFrame API `seekTo()` State Preservation & Player Reset**:
   - YouTube's iframe player tends to auto-play unbuffered video when `seekTo(seconds, true)` is called while paused.
   - **Dual Pause**: Enforce `player.pauseVideo()` before and after `player.seekTo()`.
   - **Auto-Expiring Guard**: Intercept unwanted `BUFFERING (3) -> PLAYING (1)` transitions using an auto-expiring timer (600ms). Never leave a seek-pause flag armed indefinitely, or users will experience the "ghost pause" bug requiring two clicks to play.
   - **Explicit Playback Intent**: Clear the suppression flag immediately on all deliberate play triggers (`playVideo`, `togglePlayPause`, or explicit "Replay" actions).
   - **Timing & State Reset on Project Load (`resetPlayback`)**: When switching projects (built-in examples, blank canvas, guide, remote links, and JSON import) or updating `youtubeId`, synchronously invoke `resetPlayback()` in `useYouTubePlayer`. This clears running interval timers, zeroes `currentTime`, resets `playerState` to idle (-1), and pauses and seeks the active player to 0:00 (tracked via `playerRef`), preventing stale timer closures from polling and restoring previous timestamps across project boundaries.

3. **Deterministic Sub-Lane Allocation**:
   - Compute sub-lane indices **globally** across the entire script once using greedy interval scheduling (`useTimelineWindow.ts`).
   - Never compute sub-lane packing dynamically inside a rolling time window, as this causes cue blocks to juggle or swap rows when neighboring cues enter or exit the viewport.

4. **Modular Sub-Package Architecture**:
   - Keep playback visualization components modularized inside `src/components/active-highlights/` rather than expanding `App.tsx`.
   - Consume the public API barrel export (`src/components/active-highlights/index.ts`).

5. **Workstation Left Panel Architecture & Tier Isolation**:
   - The unified Left Panel (`src/components/left-panel/WorkstationLeftPanel.tsx`) permanently houses Tier 1 (`MediaViewport` and `MediaHeader`), ensuring the `<YouTube>` player iframe is **never unmounted** when switching between Playback and Edit modes.
   - Maintain strict Tier 2 container separation between Playback mode (`ActiveHighlightsPanel`) and Edit mode (`SyncCuesPanel`).
   - Never cross-contaminate playback containers with edit-mode sticky scroll animations, form paddings, or modal listeners.
   - **Mobile Viewport Geometry Differentiation**: Differentiate root container classes between modes:
     - In Edit Mode (`mode === 'edit'`), use `h-full overflow-hidden z-10 border-r` so the mobile cue management workspace occupies the full screen.
     - In Playback Mode (`mode === 'playback'`), **never** apply `h-full` or `overflow-hidden` on mobile viewports (`< lg`). Use `shrink-0 sticky top-0 z-30 shadow-md border-b` with natural height (`h-auto`), ensuring the pinned video player leaves the screenplay (Center Panel) immediately visible and scrollable underneath with seamless auto-scrolling. Desktop viewports (`lg:`) consistently retain `lg:h-full lg:overflow-hidden lg:static lg:z-10 lg:shadow-none lg:border-r`.
   - **Component Unification & 4-Quadrant Verification Invariant**:
     - When consolidating layout components, audit divergent breakpoint contracts. Never inherit outer classes (`h-full`, `overflow-hidden`) from one mode without preserving the other's handheld contract.
     - Prevent "Empty Ghost Containers": when lower-tier child content collapses on mobile (`hidden lg:flex`), the container on mobile must use `shrink-0 h-auto`, never unconditional `h-full`.
     - Verify all workstation changes across 4 quadrants: Desktop Playback ($\ge 1024\text{px}$), Mobile Playback ($< 1024\text{px}$), Desktop Edit ($\ge 1024\text{px}$), and Mobile Edit ($< 1024\text{px}$).

6. **Timeline Density & Geometry Synchronization**:
   - Support `TimelineDensity` (`'comfortable' | 'compact'`) across timeline components for dynamic vertical scaling (32px vs 24px track heights).
   - Ensure category headers on `TimelineLane` handle both active/idle and muted/hidden visual states when wired to visibility toggles.
   - **Strict Geometry Coupling**: Always pass `density` down to `TimelineCueBlock` to keep top offsets (`subLaneIndex * step + padding`) and block heights (18px vs 22px) mathematically synchronized with `TimelineLane`'s track container height, preventing sub-lane clipping or row jumping.

7. **Responsive Split Pane & Drag Performance**:
   - Keep panel split logic desktop-only (`hidden lg:flex`); mobile/tablet devices must always stack vertically (`flex-col`) with full width (`w-full`).
   - **Absolute Pixel Minimum Constraint (`MIN_PANEL_PIXEL_WIDTH = 380`)**: In addition to percentage ratio bounds (`MIN_SPLIT_RATIO = 30`), pointer dragging and keyboard adjustments calculate `effectiveMinRatio = Math.max(minRatio, (380 / windowWidth) * 100)` to guarantee the left playback panel cannot be collapsed into an unusable micro-sliver on smaller desktop screens (1024px–1366px).
   - **Window-Bound Pointer Tracking & Gesture Safety**: Split and resizer drag listeners (`pointermove`, `pointerup`, `pointercancel`) must be subscribed to `window` rather than confined to the drag handle element, with `touch-none` (`touch-action: none`) declared to prevent Windows Precision Touchpad and touch gestures from firing premature `pointercancel` aborts.
   - **Zero-Latency Dragging**: Temporarily suppress all CSS transitions across panels during active drag operations via the global `.is-resizing-split` class on `document.body`.
   - **Hardware VSync Throttling**: Always clamp pointermove updates to display refresh intervals using `requestAnimationFrame`.
   - **Decoupled Persistence**: Never invoke synchronous disk I/O (`localStorage.setItem`) inside continuous mousemove/pointermove loops. Update in-memory state during drag, and commit to storage only upon pointer release (`commitSplitRatio`).

8. **Vertical Video Resizing & Aspect Ratio Invariants**:
   - Directly resize video height using the horizontal divider (`VideoSplitDivider.tsx`) rather than arbitrary width percentages.
   - **Proportional 16:9 Scaling**: Container must couple `height: ${videoHeight}px` with `aspectRatio: '16 / 9'` and `maxWidth: '100%'`, preventing video distortion and eliminating empty lateral gutters.
   - **Performance, IFrame Guard & Deadband Elimination**: Leverage window-level pointer event subscriptions, explicit pointer capture fallbacks, and the body `.is-resizing-split` overlay to prevent YouTube iframe event absorption during vertical drags. Re-anchor the drag origin when reaching min (160px) or max (480px) constraints to eliminate boundary deadbands when reversing direction. Commit disk I/O only on pointer up (`commitVideoHeight`).
9. **Header Layout Stability & Adaptive Single-Row Toolbar Invariants**:
   - **Highlights Adaptive Single-Row Architecture**: The `ActiveHighlightsPanel` header maintains a single unified row across all widths with progressive stepped label collapsing, eliminating two-tier layout reflows while strictly preserving the live active cue count and 8-slot category LED VU meter strip. Track height mode toggles dynamically via a compact single button `[ ↕ Fixed ]` / `[ ↕ Flex ]` with dedicated icons.
   - **Compact Track Header Geometry (`w-18` / 72px)**: Category headers on `TimelineLane` must use compact fixed widths (`w-18` with `text-[8.5px]`) to maximize the available horizontal timeline track canvas for cue blocks.
   - **Zero-Layout-Shift Indicator Strips**: Avoid rendering variable-length dynamic arrays of cue instance dots in high-frequency playback headers, as rapid cue count fluctuations (`4 → 11 → 5`) cause severe visual jitter and layout shifts. Use a fixed-slot category indicator strip (`COLORS` order) where slot positions are permanently anchored and illuminate dynamically via `resolveCueColor()`.
   - **Numeric Tabular Width Isolation**: When displaying numeric counters that oscillate between single and double digits during playback, always isolate the digit inside a dedicated fixed-width slot (`min-w-[14px] font-mono tabular-nums text-center`) to mathematically prevent horizontal jitter.
   - **Collapsible Secondary Filters**: Muting/category filter pill rows in playback headers must remain collapsible by default (`localStorage` key `sceneflow_highlight_filter_expanded`) to prioritize vertical viewport space for timeline lanes, accompanied by an active indicator pip on the toggle button whenever filters are muted.

10. **Timeline Zoom Presets & Adaptive Timecode Invariants**:
    - **Bounded Presets Over Freeform Zoom**: Use discrete, calibrated zoom window presets (`TIMELINE_ZOOM_PRESETS`: `'4s' | '8s' | '16s'`) rather than unrestricted continuous pinch/scroll zoom to guarantee visual stability and predictable sub-lane packing.
    - **Adaptive Timecode Ruler Ticks (LOD)**: To prevent label collision and DOM churn at wider horizons, scale ruler tick steps adaptively (1s intervals for `4s`/`8s`, 2s step with 4s major labels for `16s`).
    - **Narrow Block Label Elision**: When blocks shrink during wide zooms (`widthPercent < 3.5%`), omit inner text snippets and center the category pip, retaining full cue text via hover tooltip and paused inspector docking.

11. **Timeline Track Height Invariants (Fixed vs. Flexible)**:
    - **Per-Category Maximum Sub-Lane Pre-Allocation**: When in `fixed` mode, track heights must be pre-calculated based on the category's global maximum sub-lane index across the entire script (`globalMaxSubLane + 1`), not the rolling window.
    - **Empty Lane Height Preservation**: `TimelineLane` must accept `totalSubLanes` from category-level metadata to maintain its pre-allocated height and horizontal dividers even when `items.length === 0` (no visible cues passing through that track).

12. **Collapsible Video Player & Background Playback Invariants**:
    - **Zero-Height Audio & Sync Continuity**: When collapsing the video player or toggling modes (`WorkstationLeftPanel.tsx`), **never** unmount the `<YouTube>` component. Use zero-height clipping styles (`h-0 min-h-0 max-h-0 opacity-0 pointer-events-none !m-0 !p-0 overflow-hidden`) so the iframe context remains attached, audio continues playing, and real-time timeline playhead/cue synchronization persists for screen recording and mode transitions.
    - **Resizer Divider Suppression**: Conditionally omit `VideoSplitDivider` when the video player is collapsed so no orphaned resize handles float above the timeline.
    - **Dual Control & Quick Toggle**: Provide an interactive header toggle button (`[ Hide Video ]` ⇋ `[ Show Video ]`) alongside the global keyboard shortcut (`KeyV` / <kbd>V</kbd>) with animated status badge (`Video Hidden`).
    - **Unified View Reset**: `isViewCustomized` and `resetViewLayout` must track `isVideoCollapsed`, ensuring clicking "Reset View" restores the video player to default visibility.

13. **Persistent Media Header Transport Controls (`MediaHeader.tsx`)**:
    - **Unified Transport Pill**: Transport controls (`Play`, `Pause`, `Replay from 0:00`) reside within a cohesive pill container with hairline divider in `MediaHeader.tsx`, available across both Playback and Edit modes.
    - **Live Precision Timecode in Media Header**: `LiveTimecodeBadge` renders in `MediaHeader` in both Playback and Edit modes whenever the player is connected, giving editors and viewers consistent real-time `MM:SS.s` feedback.
    - **Unobstructed Transport Access**: Transport controls remain fully functional even when the video player is collapsed or hidden.
    - **Immediate State Synchronization**: The Play/Pause button dynamically renders based on `playerState === 1`, showing stateful colors (vibrant accent when playing) and updating in lockstep with global keyboard shortcuts (<kbd>Space</kbd> / <kbd>K</kbd>).
    - **Explicit Replay Semantics**: Replay must invoke `seekTo(0, true, true)` to immediately jump to `0:00` and trigger playback without paused-seek suppression guards interfering.
    - **Viewport Fluidity**: Button labels must gracefully collapse to compact icon buttons on narrow viewports via container queries (`.media-btn-label`), ensuring zero header wrapping.

14. **Centralized External Links & Navigation Architecture**:
    - Centralize all external publication, documentation, repository, and support URLs in `src/constants/links.ts` (`EXTERNAL_LINKS`) rather than hardcoding raw string literals across UI components.
    - Outbound resources (official Substack introductory publication) are embedded cleanly within modal headers (`[ Introduction ]` in `LibraryModal`, `[ Intro ]` in `MobileLibraryModal`, and hero card in `AppInfoModal`) rather than cluttering primary workspaces.
    - Mobile counterparts in `ScriptHeaderControls.tsx` strictly prioritize essential controls (theme palette, library, and support) and omit redundant article links, preserving horizontal space on phones.

15. **Global 3-Zone Studio Header Architecture (`AppHeader.tsx`, `src/components/header/*`)**:
    - The top application header strictly follows a 3-zone spatial composition: Left Wing (Logo + `[ File ▾ ]` desktop dropdown menu), Center Stage (Centered `[ ▶ Playback | ✏️ Edit ]` segmented mode switcher), and Right Wing (`[ 📚 LIBRARY ]` standalone gateway, `[ ☕ Support ]` Ko-fi pill, `[ ⚙️ Settings ▾ ]` dropdown pill, and `[ ℹ ]` Info trigger).
    - **Modular Subcomponent Decomposition (`src/components/header/`)**:
      - `FileMenuDropdown.tsx`: Dedicated 3-tier project I/O, canvas creation, and guide/library menu.
      - `SettingsMenuDropdown.tsx`: Consolidated Studio Preferences dropdown housing the header `[↺ Reset All]` action, 4-theme picker, Reading Canvas & Viewport controls (Script Width and Focus Line segmented rows), shortcut badge rows (`Shift+C`, `Shift+T`, `Shift+R`), and dynamic `Custom` layout badge.
      - `ModeSegmentedControl.tsx`: Centered mode switcher with mode-specific active accents and ARIA group attributes.
    - **0 Hz Header Re-Render Invariant (`AppHeader`, `ScriptHeaderControls`)**:
      - Neither `AppHeader` nor `ScriptHeaderControls` receive `currentTime` or subscribe to high-frequency video playback clock ticks.
      - Both header components and their subcomponents are wrapped in `React.memo`, with callbacks stabilized via `useCallback`. During video playback, header virtual DOM diffing remains 100% idle across both panels.
    - **Single-Click Outside Dismissal Invariant (`useClickOutside`)**:
      - Floating menus must close via outside-click detection (`useClickOutside` listening on `mousedown`/`touchstart`) bound to the container element rather than full-screen transparent backdrops (`fixed inset-0 z-40`). This ensures clicking an adjacent header button immediately closes the current menu and triggers the target action in a single gesture without double-clicking.
    - **Unified Menu State Invariant (`activeMenu: HeaderMenuId | null`)**:
      - Dropdown visibility must be managed through a single union state (`export type HeaderMenuId = 'file' | 'settings'`) rather than isolated boolean flags, preventing state collision and enabling frictionless scalability for new header tools.
    - **Mobile Viewport Exclusion Invariant (`hidden lg:flex`)**:
      - SceneFlow mobile viewports are strictly playback/review experiences; edit mode and desktop cue authoring are desktop-only (`hidden lg:flex`). `AppHeader` must be declared unconditionally with `hidden lg:flex` so desktop controls never leak onto mobile screens during window resizing.
    - **Truthful Shortcuts & Badging Discipline**: Never add visual shortcut badges (<kbd>Ctrl+O</kbd>, <kbd>Ctrl+S</kbd>, <kbd>?</kbd>) or tooltip annotations for actions lacking active event listeners in `useKeyboardShortcuts.ts` or `useEscapeKey.ts`.
    - **File Dropdown Menu (`[ File ▾ ]`)**: Local JSON import/export actions, new project creation, and guide/library access belong inside the desktop `[ File ▾ ]` dropdown (`UI_TOKENS.button.filePill`), keeping mobile headers clean. The menu is organized into three tiered functional groups separated by hairline borders:
      1. *Project I/O*: `Open Project...` and `Save Project` (top tier for instant inspection and synchronization of existing projects).
      2. *Blank Canvas*: `New Project` (middle tier to clear the workspace and open Edit mode).
      3. *Reference & Discovery*: `Starter Guide` (`guide.json`) and `Browse Library...` (bottom tier).
    - **Top Header Chrome Constraints**: Top header chrome must **never** render raw floating timecode; playback timing belongs exclusively to the media player and Active Highlights timeline.
    - **Studio Preferences Dropdown**: Studio preferences must be consolidated inside the `[ ⚙️ Settings ▾ ]` dropdown, providing direct 4-theme selection (`Auto`, `Light`, `Warm`, `Dark`), Script Color presets access (with `<kbd>Shift+C</kbd>` badge), Timing Settings access (with `<kbd>Shift+T</kbd>` badge), and a live customized layout reset indicator (with `<kbd>Shift+R</kbd>` badge). Keyboard shortcuts in `useKeyboardShortcuts.ts` are guarded with `!e.ctrlKey && !e.metaKey && !e.altKey` and input/modal checks to prevent any clash with browser or playback keys.
    - **Preset Lookup & Scroll Math Centralization (`constants/script.ts`, `hooks/useAutoScroll.ts`)**:
      - Reading column width and auto-scroll focus presets must be resolved through typed lookup helpers (`getScriptWidthPreset(id)` and `getScrollFocusPreset(id)`) with guaranteed default fallbacks (`DEFAULT_SCRIPT_WIDTH_PRESET`, `DEFAULT_SCROLL_FOCUS_PRESET`), preventing repetitive and fragile `.find() || [0]` ladders across components.
      - Viewport auto-scroll offsets are computed strictly through the pure helper `calculateTargetScrollTop(relativeTop, containerHeight, elementHeight, isDesktop, focusRatio)`, unifying manual preset adjustments (`applyScrollFocus`) and continuous playback auto-scrolling to eliminate formula drift.

16. **Edit Mode Architecture & Two-Tier Left Panel Invariants (`EditLeftPanel.tsx`, `SyncCuesPanel.tsx`, `SyncCuesToolbar.tsx`)**:
    - **Two-Tier Flex Container**: Edit mode avoids `sticky top-0` scroll container hacks by structuring the Left Panel as an unpinned, two-zone flex container (`h-full flex flex-col overflow-hidden`):
      - **Tier 1 (Media Preview)**: Contains persistent transport controls, `LiveTimecodeBadge` (real-time `MM:SS.s` timecode and duration), collapsible YouTube source pill (`[ 🟢 {videoId} ✏️ ]` reclaiming ~50px height), resizable 16:9 video player, and horizontal `VideoSplitDivider` (tightened with `className="mt-2 mb-1"`).
      - **Tier 2 (Sync Cues Studio)**: Occupies `flex-1 min-h-0 flex flex-col overflow-hidden` with `pt-0` to eliminate dead space. Houses permanently docked `SyncCuesToolbar` and internal scrollable cue list viewport.
    - **Adaptive Container Queries (`src/index.css`)**:
      - Left panels declare `containerType: 'inline-size'` and class `@container`.
      - Calibrated, padding-aware container query thresholds decouple each section header:
        - Playback MediaHeader: `@container (max-width: 640px)` hides title and button labels; `@container (max-width: 480px)` hides timecode duration.
        - Edit MediaHeader: `@container (max-width: 580px)` hides title; `@container (max-width: 510px)` hides button labels; `@container (max-width: 430px)` hides YouTube pill text and timecode duration.
        - Sync Cues Toolbar: `@container (max-width: 510px)` hides title, secondary labels, and scroll label; `@container (max-width: 420px)` hides density switcher and filter button labels.
        - Center Script Panel: `@container (max-width: 480px)` hides cue status badge text; `@container (max-width: 420px)` hides button labels and line count badge; `@container (max-width: 320px)` hides script title.
    - **Sync Cues Toolbar Architecture (`SyncCuesToolbar.tsx`)**:
      - **Symmetric Padding & Header Parity**: Standardized to `py-2` (8px top, 8px bottom) when collapsed, maintaining balanced breathing room between the video divider above and the cue list below, featuring `ListChecks` icon in the title for visual parity with Playback Highlights.
      - **Action Nomenclature**: Standardized on `[ { } JSON ]` for modal cue inspection and `[ ↺ Resync ]` for proximity realignment with animated `[ ✓ Synced ]` feedback.
      - **Adaptive Density Toggle**: `[ ⊞ Cards | ≡ Compact ]` with responsive text labels collapsing cleanly to icons on narrow viewports.
      - **Collapsible Search & Filter Section**: Resting state is a compact single row with a `[ 🔍 Filter ]` toggle button, reclaiming ~64px of vertical height. Smoothly expands search input (with autofocus and <kbd>Escape</kbd> dismissal) and category pills when toggled or when active queries/filters are present.
      - **Multi-Select Category Filtering**: Category pills use a `Set<string>` to support concurrent multi-category filtering (e.g. `DIALOGUE` + `ACTION`).
      - **One-Click Counter Reset**: The cue count badge (`{filteredCount}/{totalCount}`) converts into an interactive reset button with an `X` when filtering is active, clearing all filters and auto-collapsing the bar in a single click.
    - **Screenplay Header Controls Alignment (`ScriptHeaderControls.tsx`)**:
      - Active cue status badges (`Editing Cue` with pulsing amber dot or `Drafting Cue` with pulsing blue dot) and screenplay line count badge (`{lineCount} lines`) are docked on the left next to the title (`Script Editor`), leaving actions focused on the right.
      - Features `[Edit Source]` (renamed from `[Edit Raw]`) modal trigger and inspector toggle.
      - Redundant `Idle` status placeholder badge is omitted to eliminate visual noise.
    - **Cue Selection Buffering Continuity**:
      - Selecting a cue in Edit mode must never invoke premature `player.pauseVideo()` immediately after `player.seekTo()`. Seeking directly updates the target timestamp, allowing the browser's video decoding pipeline to paint the target frame cleanly without black screen artifacts.
    - **Cue Authoring Compound Context Invariant (`CueEditorContext.tsx`)**:
      - Cue draft state, timing inputs, selection ranges, and saving actions are encapsulated within `<CueEditorProvider>` (`src/components/edit/CueEditorContext.tsx`).
      - `CueEditorForm` supports zero-prop invocation with automatic fallback resolution via `useOptionalCueEditorContext()`, decoupling cue authoring from `App.tsx` and allowing the editor form to be positioned or moved anywhere across Left and Right panels without prop-drilling through parent orchestrators.
    - **Playback Tick Shielding & Static Options (`EditVideoViewport`, `YOUTUBE_PLAYER_OPTS`)**:
      - The YouTube player viewport in Edit mode is encapsulated within the memoized subcomponent `EditVideoViewport` consuming module-level `YOUTUBE_PLAYER_OPTS`.
      - High-frequency timecode ticks (10Hz) delivered to `LiveTimecodeBadge` must never cause React to reconcile or re-evaluate the YouTube iframe player container.
    - **Left Panel Performance-Shielded Auto-Scroll & Forward Monotonic Tracking (`SyncCuesPanel.tsx`, `EditLeftPanel.tsx`, `cueUtils.ts`)**:
      - **Tick Shield Boundary & Multi-Cue Resolution**: `SyncCuesPanel` must never receive continuous `currentTime` from the playback clock loop. Continuous ticks would force re-rendering 100–300 cue cards/rows at 10–60Hz. Active cue resolution is computed at the `EditLeftPanel` boundary:
        - `activeCueId: string | null`: Primary active cue computed via `findActiveCue()`, passed down as the viewport auto-scroll anchor.
        - `activeCueIds: Set<string>`: All concurrently active cues firing at `currentTime` computed via `isCueActive()`.
        - **Reference Stabilization**: `activeCueIds` is memoized and reference-stabilized using a `useRef` shallow-equality check (`prevActiveCueIdsRef`), ensuring identical `Set` instances are returned during video playback when active membership is unchanged, eliminating spurious component re-renders.
      - **Filter-Aware Contextual Tracking**: `EditLeftPanel` evaluates `findActiveCue(filterCues(cues, selectedCategories, searchQuery), currentTime, settings)`. When users filter by specific categories (e.g. Action, Camera, VFX) or type search queries, auto-scroll accurately tracks visible items rather than losing focus due to unrendered dialogue cues.
      - **Forward Monotonic Scrolling Guard (`furthestScrollTopRef`)**: During forward playback, nested cues (e.g. Action cue spanning 0:00 to 0:10 containing child dialogue cues from 0:05 to 0:09) can cause the active cue resolver to jump backward to the enclosing cue when child cues end. The monotonic guard enforces that `targetScrollTop` can only advance forward (`targetScrollTop >= furthestScrollTopRef.current - 40px`), mathematically eliminating rubber-band / yo-yo scrolling artifacts.
      - **Backward Seek & Filter Invalidation (`seekVersion`)**: Backward seeks (`currentTime < prevTime - 0.3s`), category filter toggles, search input changes, and density switches trigger a reset of `furthestScrollTopRef.current = 0`, restoring bidirectional scroll freedom.
      - **Cubic Ease-Out Display Animation & Instant Gesture Cancellation**: Smooth scrolling is driven by the exported `smoothScrollTo` utility (`requestAnimationFrame` cubic ease-out `1 - (1 - t)^3`). Passive `wheel` and `touchmove` listeners immediately cancel ongoing scroll animations on user manual input, eliminating scroll fighting.
      - **Toolbar Toggle & Storage Persistence**: `SyncCuesToolbar` provides a container-query-responsive `[ 🎯 Scroll ]` toggle action persisted under `localStorage` key `sceneflow_edit_autoscroll`.
    - **Time-Clustered Fluid Grid & Card Sizing Invariants (`SyncCuesPanel.tsx`, `MiniCueCard.tsx`, `SyncCueCard.tsx`, `cueUtils.ts`)**:
      - **Temporal Horizon Ceilings**: `clusterCuesByTime()` must enforce hard bounds (`maxClusterSpanSeconds = 10.0` and `maxCuesPerCluster = 8`) in addition to proximity gaps (`maxGapSeconds = 2.5`). Unconstrained dynamic clustering collapses continuous audio/action scenes into a single monolithic 100+ cue block, defeating the purpose of temporal grouping.
      - **Fluid Grid Dense Packing & Span Ceilings**: The card viewport uses CSS Grid `repeat(auto-fill, minmax(160px, 1fr))` with `[grid-auto-flow:dense]`. Card column spans must be capped at 3 (`min-[640px]:col-span-3`) and must **never** declare `col-span-full`, preventing giant empty white space dead zones on widescreen desktop displays.
      - **Dialogue Minimum Width Safeguard**: Spoken dialogue cues (`cue.type === 'dialogue'`) and cues with text $> 40$ characters must never be rendered as 1-column `MiniCueCard` items regardless of duration. They must render with at least 2 columns via `SyncCueCard` (`col-span-1 min-[420px]:col-span-2`) to prevent truncation and mid-word line breaks.
      - **Two-Tier Visual Feedback Hierarchy (Theme-Harmonized States)**: Never hardcode static accent colors (e.g. `border-blue-500`) for active or selected states. State styling follows a calibrated two-tier hierarchy:
        - **Scroll Focus Cue (`isPrimary = cue.id === activeCueId`)**: Renders with an active theme border (`rgba(${themed.rgb}, 0.65)`), outer halo box-shadow (`0 0 10px rgba(${themed.rgb}, 0.3), 0 0 0 1px rgba(${themed.rgb}, 0.35)`), expanded stripe (`w-1.5` with glow), and full directional ambient gradient wash (`25% → 7%`, `opacity-100`).
        - **Secondary Co-Active Cues (`isActive && !isPrimary`)**: Renders with a clearly visible ambient gradient wash (`~16.2% → 4.5%`, `opacity-65`), but explicitly omits colored borders (retains default subtle border) and outer glow shadows to keep visual noise low during dense multi-track playback.
        - **Selected Cue (`isSelected`)**: Maintains primary focus outline (`rgba(${themed.rgb}, 0.7)` with focus ring) for manual inspector editing.

17. **Desktop 3-Panel Workstation & Cue Inspector Architecture (`EditRightPanel.tsx`, `InspectorSplitDivider.tsx`, `CueTimingCard.tsx`, `CueSceneContext.tsx`, `CueScriptAnchoring.tsx`, `useScriptPreferences.ts`)**:
    - **Desktop 3-Panel Workstation & 40 / 35 / 25 Distribution**: Edit mode is structured into three dedicated vertical columns: Left Panel (`EditLeftPanel`, default **40%**), Center Panel (Screenplay Canvas with `flex-1 min-w-0`, default **35%**), and Right Panel (`EditRightPanel`, default **25%**).
    - **Mode-Aware Layout Decoupling & Reset**: Layout states (`editSplitRatio` vs `splitRatio`) and storage keys (`sceneflow_edit_split_ratio`, `sceneflow_inspector_ratio`) are decoupled per mode. Triggering "Reset View Layout" (<kbd>Shift+R</kbd>, Settings, or double-click handles) restores 40/35/25 in Edit Mode (re-opening the inspector if closed) and 65/35 in Playback Mode.
    - **Draggable Inspector Divider (`InspectorSplitDivider`)**:
      - Dynamically resizes inspector ratio via pointer capture and `requestAnimationFrame` VSync throttling, measuring `((windowWidth - clientX) / windowWidth) * 100`, clamped between `18%` and `45%` with a `260px` pixel-floor safety limit.
      - Uses pointer capture, `requestAnimationFrame` throttling, and `.is-resizing-split` CSS transition suppression. Double-click or <kbd>Enter</kbd> / <kbd>Home</kbd> resets to default `25%`; persists in `localStorage` (`sceneflow_inspector_ratio`).
    - **Live Mutable Ref Synchronization for Media Loops & Interval Checks (`CueTimingCard.tsx`)**:
      - Never evaluate raw props or state (`startTime`, `endTime`, `isLooping`) inside long-running intervals or animation frames. Always sync them to mutable `refs` (`startTimeRef`, `endTimeRef`, `isLoopingRef`).
      - Polling ticks (40–50ms) must evaluate against `ref.current`. When an editor clicks micro-nudge steppers (`+0.1s`, `-0.5s`) or types new timestamps while video is actively playing, the loop must dynamically adapt immediately on the fly without requiring playback restart.
      - Check external player state (`player.getPlayerState() === 2` for pause) to automatically reset UI play/pause toggles when the user pauses media externally.
    - **Decoupled Script Anchoring vs. Audio-Visual Timing (`CueScriptAnchoring.tsx`, `CueTimingCard.tsx`)**:
      - Screenplay character offsets (`startIndex`, `endIndex`) must never be mixed into the primary audio-visual timing deck.
      - Keep character indices fully editable in a dedicated `CueScriptAnchoring` card to support manual cue drafting, pasting raw quotes, and proximity alignment without cluttering the timing deck.
    - **Surrounding Scene Context Window (`CueSceneContext.tsx`)**:
      - Surrounds the editable quote with dimmed preceding (`PREV`) and following (`NEXT`) screenplay lines derived from `scriptText` to provide instant narrative context without cross-panel eye scanning.
    - **Pinned Sticky Bottom Action Bar (`CueEditorForm.tsx`)**:
      - Primary actions (`Update / Create Cue` via <kbd>Ctrl+Enter</kbd>, `Cancel` via <kbd>Esc</kbd>, and `Delete`) must be pinned permanently to `bottom-0` (`bg-surface/95 backdrop-blur border-t`).
      - Guarantees width resilience when the inspector is dragged narrow (`280px`–`320px`), avoiding horizontal button collision in the top 48px header while ensuring the save button is never pushed below the vertical scroll fold.
      - Delete button features resting destructive red styling (`text-red-500/80 bg-red-500/10 border-red-500/20`), and Cancel features a styled `<kbd>Esc</kbd>` badge.
    - **Dynamic Dirty Tracking & Status Badging (`useCueEditor.ts`, `EditRightPanel.tsx`)**:
      - `useCueEditor` preserves an `originalCue` baseline snapshot when selecting a cue for editing, deriving `isDirty` by comparing start/end times, selected quote text, cue type, color class, and character offsets. New drafts are dirty if timings or text are customized.
      - `EditRightPanel` header displays reactive status badges: `Saved` (green check) vs `Unsaved` (pulsing amber dot) for existing cues, and `Draft` vs `Draft (Unsaved)` for new drafts.
    - **Clean Script Click Dismissal (`dismissIfClean`, `handleScriptClick`)**:
      - `dismissIfClean()` safely resets `useCueEditor` back to idle workstation overview if no edits have been made (`!isDirty`).
      - In `App.tsx`, `handleScriptClick` is bound to the screenplay reading canvas, safely closing clean cue inspections on click while strictly ignoring clicks on interactive buttons, input fields, staging markers (`e.stopPropagation()` in `ScriptLine`), or active DOM text selections.



