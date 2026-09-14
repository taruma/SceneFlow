# Architecture

SceneFlow follows a modular, 5-layer architecture that separates script parsing, visual theme rendering, shared utilities, state management, and UI presentation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                           PROCESSING LAYER                             │
│  src/lib/scriptParser.ts  •  src/lib/scriptProcessor.ts                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ ProcessedLine[], StagingMarkers
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            UTILITY LAYER                               │
│  src/lib/cueUtils.ts (12 pure functions) • src/lib/utils.ts •          │
│  src/constants/script.ts (COLORS, presets, DEFAULT_SETTINGS)           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ sanitized cues, aligned offsets, theme configs
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    VISUALS & DESIGN TOKENS LAYER                       │
│  src/styles/ (UI_TOKENS, themes, cues, typography, helpers, index.ts)   │
│  src/lib/scriptStyles.ts (backwards-compatibility re-export bridge)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ UI Tokens, Theme Styles, RGB Highlights
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          STATE / HOOKS LAYER                           │
│  src/hooks/useAppShellTheme.ts     src/hooks/useYouTubePlayer.ts       │
│  src/hooks/useScriptStorage.ts     src/hooks/useScriptPreferences.ts   │
│  src/hooks/useAutoScroll.ts        src/hooks/useCueEditor.ts           │
│  src/hooks/useCueAlignment.ts      src/hooks/useKeyboardShortcuts.ts   │
│  src/hooks/useScriptTheme.ts       src/hooks/useEscapeKey.ts           │
│  src/hooks/useClickOutside.ts                                          │
│  src/hooks/index.ts (barrel export with 11 modular hooks)              │
└──────────────────────────────────┬─────────────────────────────────────┘

                                   │ AppState, currentTime, theme, preferences
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                  │
│  src/App.tsx (orchestrator)  •  src/components/* (23 sub-components)    │
│  src/types/script.ts (14 domain interfaces)                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Processing Layer

The processing layer extracts structure, metadata, and character positions from raw screenplay text without depending on React or DOM APIs.

### `src/lib/scriptParser.ts`
- **Staging Block Extraction (`parseScriptWithStaging`)**: Identifies top-level `[[STAGING]]...[[/STAGING]]` blocks and sub-tagged directives (e.g., `[[INTENT]]`, `[[LOGIC]]`, `[[AESTHETIC]]`, `[[OPENING]]`, `[[CONTINUITY PROTOCOL]]`, `[[GLOBAL]]`, `[[LOOKBOOK]]`). Returns original lines, line indices to hide from the main view, and a map of line-anchored `StagingMarker` objects. Evaluates trimmed lines for robust whitespace handling.

### `src/lib/scriptProcessor.ts`
- **Semantic Line Classification (`processScript`)**: Analyzes text line-by-line using heuristics and regex to classify each line into one of 11 `LineType` variants:
  - `name`: ALL CAPS ending with a colon (e.g., `JOHN:`).
  - `speech`: Spoken dialogue following a character name.
  - `parenthetical`: Delivery directions enclosed in `(...)`.
  - `heading`: Scene headings starting with `INT.` or `EXT.`.
  - `note`: Camera/shot directives enclosed in `[...]`.
  - `effect`: Sound/visual directives starting with `SFX:` or `VFX:`.
  - `separator`: Horizontal scene dividers matching `---`.
  - `part-separator`: Major section markers matching `PART N`.
  - `roman-title`: Roman numeral titles (e.g., `IV. THE AWAKENING`).
  - `action`: Emphasized ALL CAPS action beats or standard narrative text.
  - `default`: Fallback text formatting.
- **Dialogue Lookahead**: Pre-scans consecutive speech lines following a character heading and attaches `charName` context to each dialogue line.
- **Auteur Brief & State Transition Handling**: Recognizes `[<BRIEF>]` and `[</BRIEF>]` delimiters, skips blank lines within technical blocks, and sets `isBrief: true` to trigger waterfall indentation (`->`) and bold anchor tagging (`[...]`).
- **Character Offset Indexing**: Computes exact `lineStart` and `lineEnd` character offsets to ensure sync cues remain accurately positioned.

---

## 2. Utility Layer

The utility layer provides pure functions, shared constants, and data normalization that bridge processing output to the visuals and hooks layers.

### `src/lib/cueUtils.ts`
A dedicated module containing twelve exported pure functions for cue lifecycle management:
- **`sanitizeCues(cues)`**: ID deduplication and normalization engine that guarantees unique React keys, infers missing `type`/`colorClass` fields bidirectionally, and injects UUID-fallback IDs for malformed cues. Called by `useScriptStorage` across all five data-load paths and by `RawCuesModal` on JSON paste.
- **`findTextInScript(fullText, text)`**: Three-tier text search (exact match → normalized whitespace/quotes regex → case-insensitive fallback) used by the cue editor.
- **`getSelectionIndicesFromDOM(sel, scriptText)`**: Accurately resolves character start and end offsets within the full script for line-anchored DOM text selections using `data-line-start` metadata, with fallback to `findTextInScript`.
- **`findAlternativeLocations(scriptText, searchText)`**: Proximity-aware regex search returning matching text occurrences with context snippets while skipping `[[STAGING]]` blocks.
- **`realignCuesList(cues, scriptText)`**: Chronological cue alignment engine recalculating `startIndex`/`endIndex` against updated script text using proximity matching and short-match fallbacks.
- **`getCueTimingOffsets(cueType, settings)`**: Aggregates per-type and global lead-in/tail-out timing offsets.
- **`isCueActive(cue, currentTime, settings)`**: High-frequency check determining if a cue falls within the active playback time window.
- **`findActiveCue(cues, currentTime, settings)`**: Resolves the single most active cue for a given timestamp, prioritizing the latest chronological start time with highest start index. Used for performance-shielded Left Panel auto-scroll and playback tracking.
- **`filterCues(cues, selectedCategories, searchQuery)`**: Pure filtering engine filtering a cue array by multi-select category types (`Set<string>`) and text queries (matching selected text, category type, or formatted timecodes).
- **`calculateCuePlaybackOpacity(cue, currentTime, settings)`**: Dynamic fade-in/fade-out opacity calculation for playback transitions.
- **`exportStateToJsonFile(state, fileName)`**: Triggers client-side formatted JSON state download.
- **`validateImportedScriptJson(json)`**: Validates, normalizes, and injects default fallbacks for imported project files.

### `src/lib/utils.ts`
Shared utility functions extracted from `App.tsx`:
- **`cn(...inputs)`**: Merges Tailwind utility classes safely using `clsx` and `tailwind-merge`.
- **`extractYoutubeId(url)`**: Extracts an 11-character YouTube video ID from various URL formats (standard, shortened `youtu.be`, embeds, shorts, mobile).
- **`formatPrecisionTimecode(seconds)`**: Formats raw seconds into standardized `MM:SS.s` (or `HH:MM:SS.s` for $\ge 1\text{h}$) precision timecodes for live playback badges, cue editors, and cue card tags.
- **`generateId()`**: UUID generator utilizing `crypto.randomUUID()` with fallback.

### `src/constants/script.ts`
Centralized application constants and configuration:
- **`COLORS`**: Array of 8 `ColorCategory` objects with `type`, `class`, and `rgb` values.
- **`DEFAULT_SETTINGS`**: Default per-category and general timing buffers (all zeroed).
- **`SCRIPT_WIDTH_PRESETS`**: Five reading-column width presets (`narrow` 384px, `compact` 448px, `standard` 576px, `wide` 768px, `full` 1024px).
- **`SCROLL_FOCUS_PRESETS`**: Three auto-scroll anchor presets (`top` 35%, `center` 50%, `bottom` 65%).
- **Preset Lookups & Defaults**: Exports default IDs (`DEFAULT_SCRIPT_WIDTH_PRESET_ID`, `DEFAULT_SCROLL_FOCUS_PRESET_ID`), default preset objects (`DEFAULT_SCRIPT_WIDTH_PRESET`, `DEFAULT_SCROLL_FOCUS_PRESET`), and typed lookup helpers `getScriptWidthPreset(id)` and `getScrollFocusPreset(id)` with guaranteed default fallbacks.

### `src/constants/links.ts`
Centralized repository, guide, publication, and author links:
- **`EXTERNAL_LINKS`**: Unified URLs for the official Substack introduction article (`article`, `articleTitle`), creator support (`kofi`), source repository (`github`), documentation guide (`docs`), release changelog (`changelog`), and author profile (`author`).

---

## 3. Visuals & Design Tokens Layer (`src/styles/`)

The visuals layer encapsulates all styling tokens, color schemes, UI chrome tokens, and theme definitions.

### Modular Design Tokens Structure
- **`src/styles/tokens/ui.ts` (`UI_TOKENS`)**: Centralized design tokens providing reusable Tailwind class bundles across 9 functional categories:
  - `layout`: App header, playback/edit script headers, left/right panel base containers, and section title typography.
  - `modal`: Backdrop overlays (`overlay`, `overlayHeavy`, `overlayHighZ`), responsive containers (`containerSm`, `containerMd`, `containerLg`, `containerXl`, `containerLibrary`, `containerStaging`), standard headers, footers, and padding tokens.
  - `dropdown`: Focus mode, width preset, and scroll focus preset dropdown menus, headers, and interactive items.
  - `button`: Primary, secondary, danger, header icon action buttons, mode switchers, sort toggles, action pills, support pills, and close buttons.
  - `input`: Search inputs, multiline textareas, code boxes, standard/accented number boxes (`numberBox`, `numberBoxLg`), and label typography.
  - `badge`: Counter tags, timestamp pills, and keyboard shortcut tags (`counter`, `timeCompact`, `shortcut`).
  - `panel`: Banners, interactive cards, empty placeholders, legend containers, and alpha-accent callout cards (`accentCardBlue`).
  - `swatch` & `alert`: Theme preview swatches and notification banners.
- **`src/index.css`**: Semantic CSS custom properties defined in `:root` (`--app-bg`, `--surface`, `--surface-subtle`, `--border-main`, `--text-main`, `--overlay-bg`, `--color-support`, etc.) and mapped directly into Tailwind CSS v4's `@theme` directive.
- **`src/styles/tokens/themes.ts` (`SCRIPT_THEMES`)**: Defines six visual themes categorized into `light`, `warm`, and `dark` alongside `SCRIPT_THEME_MAP`, `DEFAULT_SCRIPT_THEME`, and `THEME_CATEGORIES`.
- **`src/styles/tokens/cues.ts`**: Calibrates the 8 cue categories across light, warm, and dark theme palettes under two curated profiles (`CUE_COLOR_DEFINITIONS_STANDARD` and `CUE_COLOR_DEFINITIONS_PROTANOPIA`), provides `getCueColorForTheme()`, and exposes `LEGACY_CLASS_MAP` for backwards compatibility.
- **`src/styles/tokens/typography.ts` (`getScriptThemeStyles`)**: Generates theme-specific typography, headings, title lines, staging badges, and cue wrapper styles.
- **`src/styles/helpers.ts`**: Color conversion utilities (`hexToRgba`) and dynamic badge/inline cue styling factories (`createCueBadgeStyle`, `createInlineCueStyle`).
- **`src/styles/index.ts`**: Canonical barrel export unifying all design tokens, theme definitions, and helpers.
- **`src/lib/scriptStyles.ts`**: Backwards-compatibility re-export layer forwarding directly to `src/styles/`.

### Script Theme Engine (`SCRIPT_THEMES`)
Supports six distinct visual themes categorized into `light`, `warm`, and `dark`:
1. **Studio Crisp (`studio-light`)**: Neutral stone paper with crisp contrast (Default).
2. **Warm Parchment (`parchment-warm`)**: Vintage typewriter manuscript aesthetic with sepia warmth.
3. **Midnight Slate (`midnight-slate`)**: Refined dark slate for low-light editing.
4. **OLED Blackout (`oled-black`)**: Pure `#000000` surface with high-contrast cue highlights for OLED screens.
5. **Navy Slate (`cyber-matrix`)**: Deep navy-tinted dark paper with atmospheric glow.
6. **Newsprint (`retro-newspaper`)**: Soft gray-tinted print paper for daytime reading comfort.

Each theme provides tokens for `paperBg`, `paperBorder`, `paperShadow`, `textColor`, `textMutedColor`, `headingBg`, `headingBorder`, `separatorBorder`, `titleTextColor`, `titleLineBg`, `stagingBadgeBg`, `stagingBadgeBorder`, `stagingBadgeText`, `stagingBadgeIcon`, `punchHoleBg`, `isDark`, `briefBg`, `briefBorder`, `briefBadgeBg`, `briefBadgeBorder`, and `briefBadgeText`.

- **Pure Black Canvas Mode (`data-pure-black="true"`)**: An opt-in modifier strictly applied when using dark themes. Overrides `--app-bg` and `--surface` to `#000000`, strips fuzzy drop shadow halos (`!shadow-none`), hides decorative punch holes, neutralizes heading banner fills to transparent, and aligns timeline tracks to pitch black. The 1px paper border (`activeTheme.paperBorder`) remains visible to frame the manuscript, producing 100% background transparency for Screen/Lighten blend mode video recording without compromising structure. Light and warm themes remain completely untouched.

### Cue Theme Color Calibration & Accessibility Engine
Defines the eight cue categories with theme-calibrated RGB palettes under two distinct `CuePaletteProfile` configurations (`'standard'` and `'protanopia'`) resolved via `getCueColorForTheme(typeOrClass, themeId, paletteProfile)`:
- **Standard Cinema Profile (`CUE_COLOR_DEFINITIONS_STANDARD`)**:
  - **Dialogue**: Amber Gold (`lightRgb: 245, 158, 11`, `warmRgb: 217, 119, 6`, `darkRgb: 251, 191, 36`)
  - **Action**: Royal Cobalt Blue (`lightRgb: 37, 99, 235`, `warmRgb: 29, 78, 216`, `darkRgb: 59, 130, 246`)
  - **Camera**: Emerald Green (`lightRgb: 22, 163, 74`, `warmRgb: 21, 128, 61`, `darkRgb: 34, 197, 94`)
  - **Shot**: Deep Iris / Indigo (`lightRgb: 99, 102, 241`, `warmRgb: 79, 70, 229`, `darkRgb: 129, 140, 248`)
  - **Audio**: Bright Amber Orange (`lightRgb: 234, 88, 12`, `warmRgb: 194, 65, 12`, `darkRgb: 249, 115, 22`)
  - **VFX**: Electric Aqua (`lightRgb: 6, 182, 212`, `warmRgb: 14, 116, 144`, `darkRgb: 34, 211, 238`)
  - **Transition**: Crimson Rose (`lightRgb: 225, 29, 72`, `warmRgb: 190, 18, 60`, `darkRgb: 244, 63, 94`)
  - **Environment**: Steel Slate (`lightRgb: 100, 116, 139`, `warmRgb: 120, 113, 108`, `darkRgb: 148, 163, 184`)
- **Protanopia & Deuteranopia Safe Profile (`CUE_COLOR_DEFINITIONS_PROTANOPIA`)**:
  - Remaps **Shot** away from the Blue/Indigo spectrum to **Deep Wine / Burgundy** (`rgb(136, 19, 55)` light, `rgb(225, 29, 72)` dark), establishing a distinct $L^* \approx 25$ dark tone that eliminates confusion with Action Blue ($L^* \approx 50$).
  - Elevates **VFX** to radiant high-luminance Ice Aqua (`rgb(103, 232, 249)` dark, $L^* \approx 85$) and **Transition** to Vermilion Coral (`rgb(234, 88, 12)`).
- **Backward Compatibility Normalization (`LEGACY_CLASS_MAP`)**: Maps legacy Tailwind color classes (`bg-purple-400`, `bg-pink-400`, `bg-blue-400`, `bg-green-400`) seamlessly to modern canonical cue categories.

---

## 4. State / Hooks Layer (`src/hooks/`)

The hooks layer encapsulates all side effects, state lifecycle, dynamic theme resolution, and playback orchestration into eleven modular custom hooks, keeping `App.tsx` as a lightweight orchestrator. All hooks are consolidated in the canonical `src/hooks/index.ts` barrel.

### `useScriptStorage`
State initialization and persistence engine:
- Reads/writes `AppState` to `localStorage` under key `screenplay_sync_state`.
- Loads the default project (`/examples/scene_frequency.json`) for first-time visitors.
- Provides `resetToDefault`, `loadBlank`, `loadExample(path)`, and `loadRemoteProject(url)` — all five data paths route through `sanitizeCues()` for ID deduplication.
- Manages `isInitialized` and `isRemoteLoading` lifecycle flags.

### `useYouTubePlayer`
YouTube IFrame Player API wrapper:
- Binds `onReady` and `onStateChange` callback handlers.
- Runs a 100ms polling interval for high-frequency `currentTime` tracking.
- Exposes `seekTo`, `playVideo`, `pauseVideo`, `togglePlayPause`, and `jumpBy(seconds)` transport controls.

### `useScriptPreferences`
Persistent visual customization and layout management:
- Stored in `localStorage` via centralized `SCRIPT_PREFERENCES_STORAGE_KEYS`: reading column width preset (`sceneflow_script_width_preset`), auto-scroll focus preset (`sceneflow_scroll_focus_preset`), active theme ID (`sceneflow_script_theme`), cue palette accessibility profile (`sceneflow_cue_palette_profile`), asymmetric split ratio (`sceneflow_split_ratio`, default 65%), video player height (`sceneflow_video_height`, default 220px), and video collapse state (`sceneflow_playback_video_collapsed`).
- Provides `resetViewLayout()` to instantly restore default 65:35 panel split, 220px video height, and expand the video player if collapsed.
- Exposes `isScriptPreferencesCustomized` and `resetScriptPreferences()` for centralized factory preference resetting.
- Exposes `isVideoCollapsed`, `setIsVideoCollapsed`, and `toggleVideoCollapsed` helpers.
- Exposes `isViewCustomized` flag to drive the active status dot on the header "Reset View" button.
- Manages dropdown visibility toggles, cue type category filter sets, cue palette accessibility profile (`cuePaletteProfile`, `setCuePaletteProfile`), and color picker modal state.

### `useAutoScroll`
Real-time playback auto-scroll engine:
- Filters active cues by multi-select focus types (`autoScrollTargets`).
- Prioritizes the most recently started cue at the farthest script position.
- Computes viewport scroll position using the pure `calculateTargetScrollTop(relativeTop, containerHeight, elementHeight, isDesktop, focusRatio)` helper, referencing active `ScrollFocusPreset.ratio` on desktop and center alignment on mobile.
- Executes programmatic scrolling via a custom high-refresh `requestAnimationFrame` cubic ease-out (`1 - (1 - t)^3`) animator (`smoothScrollTo`, also exported for shared use across the Left Panel Sync Cues Studio), completely replacing browser-native `behavior: 'smooth'` (which is capped at 60Hz in Windows Chromium, causing frame pacing judder on 144Hz/120Hz displays and 60fps screen recordings).
- Binds passive `wheel` and `touchmove` event listeners on the scroll container to immediately cancel in-flight auto-scroll animations upon manual user touch or mouse wheel interaction, eliminating scroll fighting.
- Enforces a 10px deadband threshold (`Math.abs(container.scrollTop - targetScrollTop) > 10`) to eliminate micro-scroll jitter when consecutive cues activate on the same line, with lifecycle-guarded frame cancellation on rapid cue transitions.

### `useCueEditor`
Cue authoring and editing state machine:
- Handles line-anchored DOM text selection → script-text mapping via `getSelectionIndicesFromDOM` with fallback to `findTextInScript`.
- Manages cue creation, editing, deletion with confirmation modals, and duplicate occurrence lookup.
- Exposes `selection`, `newCue`, `altLocations`, `overlapPicker`, and `deleteConfirmation` state (with project lifecycle `resetConfirmation` cleanly isolated to `App.tsx`).

### `useCueAlignment`
Automated cue realignment orchestration:
- Delegates to `realignCuesList()` with manual-click delay for visual feedback.
- Tracks `isAligning` and `alignSuccess` status states.

### `useKeyboardShortcuts`
Global keyboard shortcut handler:
- **Playback hotkeys** (requires active player): `Space` / `KeyK` = play/pause toggle, `ArrowLeft` / `KeyJ` = -5s seek, `ArrowRight` / `KeyL` = +5s seek, `KeyV` = toggle video player collapse in Playback mode.
- **Studio Preferences hotkeys**: `Shift+C` = open Script Paper & Colors modal, `Shift+T` = open Timing & Durations modal, `Shift+R` = reset view layout to defaults.
- Gates execution when input/textarea/contentEditable elements are focused or any modal is open, and validates `!e.ctrlKey && !e.metaKey && !e.altKey` to prevent conflicts with browser hotkeys.
- Also tracks `isDesktop` via `window.innerWidth >= 1024` resize listener.

### `useScriptTheme`
Theme metadata and color resolution hook:
- Resolves active theme metadata (`ScriptThemeMetadata`), computed theme styles (`themeStyles`), and dark mode state (`isDark`).
- Accepts `(scriptThemeId, cuePaletteProfile)` and provides dynamic cue color resolution helper (`resolveCueColor: (typeOrClass) => CueColorInfo`) dynamically adjusted to both the active theme and accessibility profile.
- Encapsulates theme-dependent styling logic for seamless integration across components.

### `useEscapeKey`
Modal and dialog `Escape` key dismissal hook:
- Attaches a lightweight `keydown` listener to `window` specifically for the `Escape` key.
- Lifecycle-guarded: only active when `isOpen === true`, automatically unbinding immediately on modal close or unmount.
### `useClickOutside`
Outside-click detection hook for floating menus and dropdown panels:
- Attaches lightweight `mousedown` and `touchstart` event listeners to `document`.
- Accepts target `ref` and callback, executing only when interactions occur strictly outside the target node tree.
- Eliminates the need for full-screen fixed transparent backdrop `div` overlays (`fixed inset-0 z-40`), allowing direct single-click switching between adjacent header controls.

---


## 5. UI Layer (`src/App.tsx` & `src/components/`)

The UI layer coordinates video playback, real-time highlighting, user interaction, and modal dialogs.

### Core Orchestrator (`src/App.tsx`)
- **Lightweight Composition**: `App.tsx` imports the custom hook suite and twenty-four sub-components, composing them into the full application shell while keeping its own logic to a minimum (mode toggling, library state, modal visibility).
- **Hook Integration**: State, playback, preferences, auto-scroll, cue editing, alignment, keyboard shortcuts, and active script theme are fully delegated to the hooks layer. `App.tsx` only wires hook return values to component props.
- **Sync Engine & Playback Diff Decoupling (`renderedScript` `useMemo`)**: Decouples script parsing into an independent `processedLines` memoized hook so full text parsing runs only on script text modifications. Pre-indexes overlapping cues into `cuesByLineIndex` for $O(1)$ line lookup. Crucially, passes static `currentTime={0}` to lines with zero overlapping cues (`lineCues.length === 0`), completely skipping React prop diffing and reconciliation across 85%+ of screenplay lines on every 100ms playback tick. Lines with cues are delegated to memoized `<ScriptLine />` components that isolate sub-second highlight opacity transitions to active lines only.
- **Auto-Scroll Engine**: Delegates to `useAutoScroll`, which automatically scrolls the screenplay during playback, prioritizing the most recent active cue, supporting multi-selected focus categories, and aligning to the user's selected vertical focus ratio (35% Top, 50% Center, 65% Bottom).
- **Proximity-Aware Alignment**: Delegates to `useCueAlignment`, which uses `realignCuesList()` from `cueUtils.ts` to re-map cue character start/end positions when screenplay text is edited.
- **Cue Sanitization Pipeline**: All data ingress paths (localStorage restore, default load, blank, example, remote fetch) route through `sanitizeCues()` in `useScriptStorage`, guaranteeing deterministic IDs and `type`/`colorClass` normalization.

### Modular Sub-components (`src/components/`)
1. **`AppHeader` Sub-Package (`src/components/AppHeader.tsx`, `src/components/header/`)**:
   - **`AppHeader.tsx`**: Top-level 3-zone desktop studio navigation orchestrator unconditionally hidden on mobile (`hidden lg:flex`). Fully decoupled from the ~10Hz video playback loop (zero `currentTime` prop) and wrapped in `React.memo` to ensure 0 Hz re-render overhead during media playback. Manages unified `activeMenu: HeaderMenuId | null` state.
   - **`FileMenuDropdown.tsx`**: 3-tier hierarchical file dropdown (`[ File ▾ ]`) separating Project I/O (`Open Project...`, `Save Project`), Blank Canvas (`New Project`), and Resource Discovery (`Starter Guide`, `Browse Library...`) with `useClickOutside` and full WAI-ARIA menu roles.
   - **`SettingsMenuDropdown.tsx`**: Consolidated Studio Preferences menu (`[ ⚙️ Settings ▾ ]`) featuring header `[↺ Reset All]` action (for 1-click restoration of theme, width, focus, and layout), 4-theme radio grid (`Auto`, `Light`, `Warm`, `Dark`), dedicated "Reading Canvas & Viewport" section housing 5-segment Script Width row (progressive width bar glyphs) and 3-segment Focus Line row (miniature viewport devices with active indicators), action rows with `<kbd>` shortcut badges (`Shift+C`, `Shift+T`, `Shift+R`), and dynamic `Custom` layout badge.
   - **`ModeSegmentedControl.tsx`**: Centered segmented mode switcher (`[ ▶ Playback | ✏️ Edit ]`) with mode-specific active accents, responsive icon collapsing, and ARIA group attributes.
2. **`InitializingScreen.tsx`**: Branded initial load screen displaying the SceneFlow logo with subtle animation.
3. **`YoutubeSourceInput.tsx`**: YouTube URL/ID input with live player connection indicator and automatic ID extraction using `UI_TOKENS.input`.
4. **`CueEditorForm.tsx` & `CueEditorContext.tsx` (`src/components/edit/`)**: Cue authoring/editing form with editable text area, cue type selector, start/end time inputs with clock buttons and precision timecodes, index editors, and "Find Alternative" button. Powered by compound `CueEditorContext` (`CueEditorProvider`) allowing zero-prop invocation with automatic fallback resolution across layout panels.
5. **`EditLeftPanel.tsx` & `SyncCuesPanel.tsx`**: Studio-grade Two-Tier Flex Left Panel for Edit mode with adaptive container queries (`@container (max-width: 580px)`):
   - **Tier 1 (Media Viewport)**: Media header with persistent transport controls (`[Replay]`, `[Play/Pause]`, `[Hide/Show Video]`), live timecode HUD badge (`LiveTimecodeBadge.tsx`), collapsible YouTube source pill (`[ 🟢 {videoId} ✏️ ]` in `YoutubeSourceInput.tsx`), isolated memoized video viewport (`EditVideoViewport`) with static `YOUTUBE_PLAYER_OPTS` to shield iframe rendering from 10Hz timecode updates, and horizontal `VideoSplitDivider` (tightened `mt-2 mb-1`).
   - **Tier 2 (Sync Cues Studio)**: `flex-1 min-h-0` workspace featuring permanently docked `SyncCuesToolbar.tsx` (with `[ { } JSON ]`, `[ ↺ Resync ]`, `[ 🎯 Scroll ]` auto-scroll toggle with `localStorage` persistence, `[ ⊞ Cards | ≡ Compact ]` adaptive density switcher, collapsible search & multi-select category filter drawer with <kbd>Esc</kbd> shortcut and one-click reset counter badge, and balanced `py-2` vertical padding) and a dedicated scrollable container rendering `SyncCueCard.tsx` or high-density `SyncCueRow.tsx` items optimized with hoisted `resolveCueColor` and `content-visibility: auto`.
   - **Performance-Shielded Auto-Scroll & Forward Monotonicity**: Shields the cue list from 10–60Hz playback ticks by computing discrete `activeCueId` at `EditLeftPanel` using `findActiveCue()`. Employs a Forward Monotonic Scrolling Guard (`furthestScrollTopRef`) to eliminate rubber-band scrolling when nested child cues end inside longer enclosing cues, resetting on backward seeks (`currentTime < prevTime - 0.3s`) and filter changes via `seekVersion`. Dynamically evaluates active cues against `filterCues(cues, selectedCategories, searchQuery)` so auto-scroll accurately tracks visible items when filtering by category or search text. Programmatic scrolling uses exported `smoothScrollTo` with instant passive `wheel`/`touchmove` cancellation.
   - **Cross-Panel Full Sync Jump**: Selecting any cue card/row executes a synchronized triple-action: seeks the video player (without premature pause calls), populates `CueEditorForm.tsx`, and smoothly scrolls the script canvas to center the corresponding line.
6. **`RawScriptModal.tsx`**: Modal dialog for bulk editing raw screenplay text using `UI_TOKENS.modal` and `UI_TOKENS.input`.
7. **`RawCuesModal.tsx`**: Modal dialog for viewing and editing raw cue data in JSON format, with `sanitizeCues()` applied on save and styled via `UI_TOKENS`.
8. **`OverlapPicker.tsx`**: Floating context popup for selecting which overlapping cue to edit at a shared position.
9. **`DeleteConfirmationModal.tsx`**: Confirmation dialog with cue text preview prior to permanent deletion styled via `UI_TOKENS`.
10. **`ResetConfirmationModal.tsx`**: Multi-purpose confirmation dialog for resetting settings, starting a clean blank project (`new`), loading the interactive starter guide (`guide`), loading examples, or fetching remote projects, featuring integrated CORS error reporting and styled via `UI_TOKENS`.
11. **`TimingSettingsModal.tsx`**: Full-screen configuration modal for per-category timing buffers (before/after offsets) and General Master Offset, displaying dynamic theme- and accessibility-profile-calibrated category dots via `getCueColorForTheme` and styled using `UI_TOKENS`.
12. **`ScriptColorModal.tsx`**: Theme and color management dialog featuring a compact zero-scroll "Theme Presets" tab with 2-column widescreen paper preview cards, top-tier dual controls (Cue Palette Accessibility Profile and Pure Black Video Overlay toggle), collision-free selection indicators, and an "Element Inspector" tab displaying token details and the 8-category highlight spectrum using `UI_TOKENS.swatch`.
13. **`ScriptHeaderControls.tsx`**: Dual-mode script header cleanly housing `[FileText] Script Preview` and auto-scroll controls in Playback mode, or the symmetrical `Script Editor` header with loaded line count badge (`lineCount`) and `[Edit Raw]` action button in Edit mode, featuring non-blocking 1-click outside dismissal via `useClickOutside` and `useEscapeKey`, mobile quick-access tools (Theme Palette, Library, and Support), and 0 Hz playback re-render decoupling via `React.memo` (with reading width and focus line relocated to Studio Settings).
14. **`ActiveHighlightsPanel` (`src/components/active-highlights/`)**: Modular playback visualization sub-package featuring:
    - **`ActiveHighlightsPanel.tsx`**: Main orchestrator featuring an **Adaptive Header** layout via `ResizeObserver` (560px threshold): consolidates into a single unified row when wide ($\ge 560\text{px}$) to save vertical headroom, and automatically splits into a Two-Tier Header when narrow ($< 560\text{px}$) where Tier 1 houses `Highlights` + Studio VU Meter + View Switcher, and Tier 2 houses Track Height + Zoom presets + Filters toggle button.
    - **`HighlightTimelineView.tsx`**: Multi-Track Sync Timeline view with dynamic density scaling (`TimelineDensity`: `'comfortable'` 32px vs. `'compact'` 24px), timeline zoom preset integration (`zoomPreset`), height mode integration (`heightMode`: `'flexible' | 'fixed'`), stationary 35% anticipation playhead, and docked inspector card.
    - **`HighlightCardsView.tsx`**: Classic floating cards presentation for legacy playback visualization.
    - **`useSmoothTimelineTime.ts`**: High-precision timeline clock extrapolation hook utilizing `requestAnimationFrame` and `performance.now()` to advance horizontal playhead and cue coordinates continuously at native display refresh rates (144Hz, 120Hz, 60Hz). Incorporates soft-sync drift compensation against ~100ms YouTube timecode ticks, instant snapping on seeking (>0.35s), and 0 idle CPU overhead when paused.
    - **`useTimelineWindow.ts`**: Headless rolling window hook with global greedy interval scheduling for sub-lanes, per-category sub-lane pre-allocation (`subLanesByCategory`), adaptive timecode tick marks, exposure of `scriptCategories`, and stabilized cue block duration geometry (`widthPercent` derived directly from `cue.endTime - cue.startTime` without boundary clamping, eliminating accordion layout reflows as blocks cross window boundaries).
    - **`TimelineLane.tsx` & `TimelineCueBlock.tsx`**: Isolated track components with continuous sub-frame rendering via `displayTime` (with fixed `100ms linear` transitions eliminated to prevent stop-and-go stutter when YouTube ticks jitter), compact track header geometry (`w-18` / 72px), theme coloring, synchronized density offsets, stable category-level sub-lane height preservation (`totalSubLanes`), narrow block label elision (`widthPercent < 3.5%`), and interactive lane headers that toggle category visibility.
    - **`TimelinePlayheadRuler.tsx`**: Gliding timecode ruler and glowing vertical playhead marker continuously rendered at display refresh rates via `displayTime` without CSS timer interpolation lag.
    - **`PausedInspectorCard.tsx`**: Docked paused cue inspector with multi-cue tabs, screenplay quote, and instant replay action.
    - **`HighlightFilterBar.tsx`**: Centered category filter pills with active pulsing state dots and smooth collapsible drawer integration.
15. **`PlaybackLeftPanel.tsx` (`src/components/playback/PlaybackLeftPanel.tsx`)**: Dedicated playback left panel container encapsulating the media player viewport, proportional 16:9 vertical scaling, zero-scroll vertical padding, persistent header transport controls (`Play`, `Pause`, `Replay 0:00`), active highlights synchronization, and collapsible video player toggle with background audio continuity for screen recording, cleanly decoupled from edit-mode sticky scroll behaviors.
16. **`SplitPaneDivider.tsx` (`src/components/common/SplitPaneDivider.tsx`)**: Desktop-only draggable vertical split pane divider featuring global `window`-level pointer event subscriptions, `touch-action: none` gesture safety, `requestAnimationFrame` VSync throttling, `.is-resizing-split` CSS transition suppression, double-click reset, transparent iframe drag guard, `onLostPointerCapture` fallback, and absolute pixel minimum constraint (`MIN_PANEL_PIXEL_WIDTH = 380`).
17. **`VideoSplitDivider.tsx` (`src/components/playback/VideoSplitDivider.tsx`)**: Desktop-only draggable horizontal split divider between the Video Player and Active Highlights timeline featuring global `window`-level pointer event subscriptions, `touch-action: none` gesture safety, dynamic deadband elimination on boundary clamping, `requestAnimationFrame` VSync throttling, double-click reset, `onLostPointerCapture` fallback, and keyboard accessibility (`ArrowUp`/`ArrowDown`).
18. **`LibraryModal.tsx`**: Desktop library catalogue modal featuring real-time search, category navigation, sorting (Latest, Oldest, A-Z), section badges, featured curations, and `[ Introduction ]` link to the official Substack publication.
19. **`MobileLibraryModal.tsx`**: Mobile/tablet bottom-sheet drawer providing a touch-friendly category filter, search interface, and compact `[ Intro ]` link to the official Substack publication.
20. **`StagingModal.tsx`**: Monospace overlay displaying hidden camera, lighting, or lookbook directives from `[[STAGING]]` blocks.
21. **`AppInfoModal.tsx`**: Desktop application info and about dialog displaying dynamic versioning from `metadata.json`, author attribution for Taruma Sakti ([Linktree](https://linktr.ee/tarumainfo)), structured Featured Substack Article card, 2x2 resource badge grid, and keyboard shortcuts cheat sheet.
22. **`MobileColorModal.tsx`**: Mobile/tablet bottom-sheet drawer providing a thumb-friendly 4-segment App Shell switcher, the Cue Palette Accessibility Profile selector (`Standard` vs. `Protan Safe`), and 6 compact screenplay preset cards.
23. **`ScriptLine.tsx` (`src/components/script/ScriptLine.tsx`)**: Dedicated memoized line component encapsulating screenplay line-level rendering, staging badges, roman titles, separators, brief formatting, and cue highlights. Implements an optimized `areScriptLinePropsEqual` custom comparator that skips re-renders for lines with no cues (~95% of lines) and only re-renders lines when overlapping cues become active, change opacity, or exit their playback window. Coupled with static `currentTime={0}` decoupling for non-cue lines in `App.tsx`, eliminates virtual DOM diffing across the vast majority of the script. Applies GPU CSS transitions (`100ms linear`) to highlight spans during playback for analog fading without CPU overhead.

### Type Definitions & Data Schemas
- **`src/types/script.ts`**: Defines 14 domain interfaces and types: `Cue`, `TimingSettings`, `ColorCategory`, `AppState`, `ScriptWidthPresetId`, `ScriptWidthPreset`, `ScrollFocusPresetId`, `ScrollFocusPreset`, `TextSelection`, `DeleteConfirmationState`, `ResetConfirmationState`, `OverlapPickerState`, `AlternativeLocation`, and `AppMode`.
- **`src/examples.ts`**: Defines the `Example` and `ExampleSection` schemas and holds the built-in catalogue metadata.

---

## 6. Data Flow Diagram

```
1. Screenplay Input (Raw Text)
   │
   ▼
2. parseScriptWithStaging() ───► Extracts [[STAGING]] blocks & markers
   │
   ▼
3. processScript() ───────────► Builds ProcessedLine[] with line types & character offsets
   │
   ▼
4. sanitizeCues() ────────────► Deduplicates IDs, normalizes type/colorClass on ingress
   │
   ▼
5. useAutoScroll / useCueEditor ─► Combine lines with Cues[], currentTime, TimingSettings
   │
   ▼
6. src/styles/ & useScriptTheme ──► Resolves theme tokens (SCRIPT_THEMES), UI tokens (UI_TOKENS), & RGB cue colors (CUE_THEME_COLORS)
   │
   ▼
7. Rendered Screenplay ───────► Highlights active cues, auto-scrolls to focus preset, renders UI
```