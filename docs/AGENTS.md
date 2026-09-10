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
  - `ui.ts`: Centralized `UI_TOKENS` for layout shells (`layout`), modals & overlays (`modal`), dropdown menus (`dropdown`), buttons & action pills (`button`), form controls (`input`), badges & time tags (`badge`, including desktop `currentTimePill` and mobile `currentTimePillSm`), panel cards (`panel`), swatches (`swatch`), and alert containers (`alert`).
  - `src/index.css`: Semantic CSS custom properties defined in `:root` (`--app-bg`, `--surface`, `--border-main`, `--text-main`, `--overlay-bg`, `--color-support`) and mapped into Tailwind CSS v4's `@theme` directive.
  - `themes.ts`: Six visual themes configured in `SCRIPT_THEMES` (`light`, `warm`, `dark`).
  - `cues.ts`: Theme-calibrated RGB strings (`lightRgb`, `warmRgb`, `darkRgb`) defined across two curated palette profiles: `CUE_COLOR_DEFINITIONS_STANDARD` (360° balanced cinema spectrum) and `CUE_COLOR_DEFINITIONS_PROTANOPIA` (Red-Green Color Vision Deficiency safe mode with Deep Wine Shot). Resolved via `getCueColorForTheme(typeOrClass, themeId, paletteProfile)` with fallback normalization in `LEGACY_CLASS_MAP`.
  - `typography.ts`: Theme-specific structural classes and typography generated dynamically via `getScriptThemeStyles(themeId)`.
  - `helpers.ts`: Color manipulation and dynamic badge style generators (`hexToRgba`, `createCueBadgeStyle`, `createInlineCueStyle`).
- **Hook Integration (`useScriptTheme`)**: Use the `useScriptTheme(scriptThemeId, cuePaletteProfile)` hook in components to access active `themeStyles`, `themeMetadata`, `isDark`, and `resolveCueColor` helpers dynamically synchronized with the active accessibility profile.
- **Dynamic Category Indicator Invariant**: Category dot indicators across playback headers, dropdowns, and configuration modals (`ScriptHeaderControls`, `TimingSettingsModal`, `HighlightFilterBar`, `TimelineCuesPanel`) must never use static Tailwind classes (`color.class`). They must resolve dynamically via `getCueColorForTheme(type, scriptThemeId, cuePaletteProfile)` to ensure accurate theme and CVD-safe palette rendering without contrast loss on active selection surfaces.
- **Dropdown Viewport Alignment Invariant**: Dropdown menus embedded within compact or left-aligned toolbars (`ScriptHeaderControls`) must use left-anchoring (`left-0`, e.g. `UI_TOKENS.dropdown.menu` / `menuLeft`) so that menus drop down into the viewport rather than expanding to the left and overflowing offscreen on mobile viewports.
- **Theming & Video Overlay Invariants (`.agents/rules/theming-and-overlay-invariants.md`)**: Strictly maintain two-tier independence between the App Shell (`themeMode` $\to$ `effectiveCategory`) and the Script Paper (`scriptThemeId` $\to$ `activeTheme.category`). When `pureBlackMode` is active on dark themes, DOM attributes (`data-pure-black-script` and `data-pure-black-shell`) ensure `#000000` backgrounds, stripped drop shadows, and hidden punch holes, while preserving `activeTheme.paperBorder`. Light and warm themes must remain completely untouched.
- **Token Context & Surface Contrast Invariant**: `--btn-primary-text` is specifically paired with `--btn-primary-bg`. In dark mode, primary action buttons invert to light backgrounds, causing `--btn-primary-text` to become dark (`#1c1917`). Never use `text-btn-primary-text` inside permanently dark surfaces such as `bg-surface-dark` (e.g. `currentTimePill`, `currentTimePillSm`), as this creates near-black on black contrast failure (~1.1:1). Always use explicit `text-white` or tokens coupled with the appropriate surface background.
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

The `renderedScript` `useMemo` in `src/App.tsx` is executed frequently as playback time updates:

- **Avoid Heavy Computations**: Do not insert complex calculations or synchronous operations inside the `processedLines.forEach` loop.
- **Stable React Keys**: Ensure rendered elements have stable `key` attributes based on `lineIdx`, `cue.id`, or unique segment offsets (`${lineIdx}-${start}`).
- **Opacity Transitions**: In playback mode, opacity is calculated dynamically against per-category before/after buffers. In edit mode, non-active cues remain visible at reduced opacity (0.4) for editing affordance.

## 5. Persistence, State, & External Data

When modifying application state, storage keys, or external fetching:

- **State Schema**: Maintain the `AppState` interface in `src/types/script.ts` (`youtubeId`, `scriptText`, `cues: Cue[]`, `settings?: Record<string, TimingSettings>`).
- **LocalStorage Keys**:
  - `'screenplay_sync_state'`: Core project data (video ID, script text, cues, timing settings).
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

2. **YouTube IFrame API `seekTo()` State Preservation**:
   - YouTube's iframe player tends to auto-play unbuffered video when `seekTo(seconds, true)` is called while paused.
   - **Dual Pause**: Enforce `player.pauseVideo()` before and after `player.seekTo()`.
   - **Auto-Expiring Guard**: Intercept unwanted `BUFFERING (3) -> PLAYING (1)` transitions using an auto-expiring timer (600ms). Never leave a seek-pause flag armed indefinitely, or users will experience the "ghost pause" bug requiring two clicks to play.
   - **Explicit Playback Intent**: Clear the suppression flag immediately on all deliberate play triggers (`playVideo`, `togglePlayPause`, or explicit "Replay" actions).

3. **Deterministic Sub-Lane Allocation**:
   - Compute sub-lane indices **globally** across the entire script once using greedy interval scheduling (`useTimelineWindow.ts`).
   - Never compute sub-lane packing dynamically inside a rolling time window, as this causes cue blocks to juggle or swap rows when neighboring cues enter or exit the viewport.

4. **Modular Sub-Package Architecture**:
   - Keep playback visualization components modularized inside `src/components/active-highlights/` rather than expanding `App.tsx`.
   - Consume the public API barrel export (`src/components/active-highlights/index.ts`).

5. **Playback Left Panel Isolation**:
   - Maintain strict container separation between Playback mode (`src/components/playback/PlaybackLeftPanel.tsx`) and Edit mode in `App.tsx`.
   - Never cross-contaminate playback containers with edit-mode sticky scroll animations, form paddings, or modal listeners.

6. **Timeline Density & Geometry Synchronization**:
   - Support `TimelineDensity` (`'comfortable' | 'compact'`) across timeline components for dynamic vertical scaling (32px vs 24px track heights).
   - Ensure category headers on `TimelineLane` handle both active/idle and muted/hidden visual states when wired to visibility toggles.
   - **Strict Geometry Coupling**: Always pass `density` down to `TimelineCueBlock` to keep top offsets (`subLaneIndex * step + padding`) and block heights (18px vs 22px) mathematically synchronized with `TimelineLane`'s track container height, preventing sub-lane clipping or row jumping.

7. **Responsive Split Pane & Drag Performance**:
   - Keep panel split logic desktop-only (`hidden lg:flex`); mobile/tablet devices must always stack vertically (`flex-col`) with full width (`w-full`).
   - **Absolute Pixel Minimum Constraint (`MIN_PANEL_PIXEL_WIDTH = 380`)**: In addition to percentage ratio bounds (`MIN_SPLIT_RATIO = 30`), pointer dragging and keyboard adjustments calculate `effectiveMinRatio = Math.max(minRatio, (380 / windowWidth) * 100)` to guarantee the left playback panel cannot be collapsed into an unusable micro-sliver on smaller desktop screens (1024px–1366px).
   - **Zero-Latency Dragging**: Temporarily suppress all CSS transitions across panels during active drag operations via the global `.is-resizing-split` class on `document.body`.
   - **Hardware VSync Throttling**: Always clamp pointermove updates to display refresh intervals using `requestAnimationFrame`.
   - **Decoupled Persistence**: Never invoke synchronous disk I/O (`localStorage.setItem`) inside continuous mousemove/pointermove loops. Update in-memory state during drag, and commit to storage only upon pointer release (`commitSplitRatio`).

8. **Vertical Video Resizing & Aspect Ratio Invariants**:
   - Directly resize video height using the horizontal divider (`VideoSplitDivider.tsx`) rather than arbitrary width percentages.
   - **Proportional 16:9 Scaling**: Container must couple `height: ${videoHeight}px` with `aspectRatio: '16 / 9'` and `maxWidth: '100%'`, preventing video distortion and eliminating empty lateral gutters.
   - **Performance & IFrame Guard**: Leverage pointer capture and the body `.is-resizing-split` overlay to prevent YouTube iframe event absorption during vertical drags. Commit disk I/O only on pointer up (`commitVideoHeight`).
9. **Header Layout Stability & Adaptive Two-Tier Toolbar Invariants**:
   - **Adaptive Toolbar Architecture**: High-frequency headers must dynamically adapt to container width via `ResizeObserver` (560px threshold). When wide ($\ge 560\text{px}$), all controls are consolidated into a single unified row (`Highlights` + VU meter on left; Track Height + Zoom + Filters + View Switcher on right), reserving maximum vertical headroom for timeline tracks. When dragged narrow ($< 560\text{px}$), the header automatically transforms into a Two-Tier layout (Tier 1: Title + VU meter + View Switcher; Tier 2: Zoom + Track Height + Filters) to eliminate button collisions and text squishing.
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
    - **Zero-Height Audio & Sync Continuity**: When collapsing the video player in Playback mode (`PlaybackLeftPanel.tsx`), **never** unmount the `<YouTube>` component. Use zero-height clipping styles (`h-0 min-h-0 max-h-0 opacity-0 pointer-events-none !m-0 !p-0 overflow-hidden`) so the iframe context remains attached, audio continues playing, and real-time timeline playhead/cue synchronization persists for screen recording.
    - **Resizer Divider Suppression**: Conditionally omit `VideoSplitDivider` when the video player is collapsed so no orphaned resize handles float above the timeline.
    - **Dual Control & Quick Toggle**: Provide an interactive header toggle button (`[ Hide Video ]` ⇋ `[ Show Video ]`) alongside the global keyboard shortcut (`KeyV` / <kbd>V</kbd>) with animated status badge (`Video Hidden`).
    - **Unified View Reset**: `isViewCustomized` and `resetViewLayout` must track `isVideoCollapsed`, ensuring clicking "Reset View" restores the video player to default visibility.

13. **Persistent Playback Header Transport Controls**:
    - **Unobstructed Transport Access**: Transport controls (`Play`, `Pause`, `Replay from 0:00`) reside in the persistent `PlaybackLeftPanel` header, ensuring media playback is fully controllable even when the video player is collapsed or obstructed.
    - **Immediate State Synchronization**: The Play/Pause button dynamically renders based on `playerState === 1`, showing stateful colors (vibrant accent when playing) and updating in lockstep with global keyboard shortcuts (<kbd>Space</kbd> / <kbd>K</kbd>).
    - **Explicit Replay Semantics**: Replay must invoke `seekTo(0, true, true)` to immediately jump to `0:00` and trigger playback without paused-seek suppression guards interfering.
    - **Viewport Fluidity**: Button labels must gracefully collapse to compact icon buttons on narrow viewports (`hidden sm:inline`), ensuring zero header wrapping.
