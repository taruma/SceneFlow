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
│  src/lib/cueUtils.ts (9 pure functions) • src/lib/utils.ts •           │
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
│  src/hooks/useScriptStorage.ts     src/hooks/useYouTubePlayer.ts       │
│  src/hooks/useScriptPreferences.ts  src/hooks/useAutoScroll.ts         │
│  src/hooks/useCueEditor.ts         src/hooks/useCueAlignment.ts        │
│  src/hooks/useKeyboardShortcuts.ts  src/hooks/useScriptTheme.ts        │
│  src/hooks/index.ts (barrel export)                                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ AppState, currentTime, theme, preferences
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                  │
│  src/App.tsx (orchestrator)  •  src/components/* (18 sub-components)    │
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
A dedicated module containing nine exported pure functions for cue lifecycle management:
- **`sanitizeCues(cues)`**: ID deduplication and normalization engine that guarantees unique React keys, infers missing `type`/`colorClass` fields bidirectionally, and injects UUID-fallback IDs for malformed cues. Called by `useScriptStorage` across all five data-load paths and by `RawCuesModal` on JSON paste.
- **`findTextInScript(fullText, text)`**: Three-tier text search (exact match → normalized whitespace/quotes regex → case-insensitive fallback) used by the cue editor.
- **`findAlternativeLocations(scriptText, searchText)`**: Proximity-aware regex search returning matching text occurrences with context snippets while skipping `[[STAGING]]` blocks.
- **`realignCuesList(cues, scriptText)`**: Chronological cue alignment engine recalculating `startIndex`/`endIndex` against updated script text using proximity matching and short-match fallbacks.
- **`getCueTimingOffsets(cueType, settings)`**: Aggregates per-type and global lead-in/tail-out timing offsets.
- **`isCueActive(cue, currentTime, settings)`**: High-frequency check determining if a cue falls within the active playback time window.
- **`calculateCuePlaybackOpacity(cue, currentTime, settings)`**: Dynamic fade-in/fade-out opacity calculation for playback transitions.
- **`exportStateToJsonFile(state, fileName)`**: Triggers client-side formatted JSON state download.
- **`validateImportedScriptJson(json)`**: Validates, normalizes, and injects default fallbacks for imported project files.

### `src/lib/utils.ts`
Shared utility functions extracted from `App.tsx`:
- **`cn(...inputs)`**: Merges Tailwind utility classes safely using `clsx` and `tailwind-merge`.
- **`extractYoutubeId(url)`**: Extracts an 11-character YouTube video ID from various URL formats (standard, shortened `youtu.be`, embeds, shorts, mobile).
- **`generateId()`**: UUID generator utilizing `crypto.randomUUID()` with fallback.

### `src/constants/script.ts`
Centralized application constants and configuration:
- **`COLORS`**: Array of 8 `ColorCategory` objects with `type`, `class`, and `rgb` values.
- **`DEFAULT_SETTINGS`**: Default per-category and general timing buffers (all zeroed).
- **`SCRIPT_WIDTH_PRESETS`**: Five reading-column width presets (`narrow` 384px, `compact` 448px, `standard` 576px, `wide` 768px, `full` 1024px).
- **`SCROLL_FOCUS_PRESETS`**: Three auto-scroll anchor presets (`top` 35%, `center` 50%, `bottom` 65%).

---

## 3. Visuals & Design Tokens Layer (`src/styles/`)

The visuals layer encapsulates all styling tokens, color schemes, UI chrome tokens, and theme definitions.

### Modular Design Tokens Structure
- **`src/styles/tokens/ui.ts` (`UI_TOKENS`)**: Centralized design tokens providing reusable Tailwind class bundles across 9 functional categories:
  - `layout`: App header, playback/edit script headers, left/right panel base containers, and section title typography.
  - `modal`: Backdrop overlays (`overlay`, `overlayHeavy`, `overlayHighZ`), responsive containers (`containerSm`, `containerMd`, `containerLg`, `containerXl`, `containerLibrary`, `containerStaging`), standard headers, footers, and padding tokens.
  - `dropdown`: Focus mode, width preset, and scroll focus preset dropdown menus, headers, and interactive items.
  - `button`: Primary, secondary, danger, header icon action buttons, mode switchers, sort toggles, action pills, support pills, and close buttons.
  - `input`: Search inputs, multiline textareas, code boxes, number boxes, and label typography.
  - `badge`: Counter tags, timestamp pills, and header current time pill badge.
  - `panel`: Banners, interactive cards, empty placeholders, and legend containers.
  - `swatch` & `alert`: Theme preview swatches and notification banners.
- **`src/index.css`**: Semantic CSS custom properties defined in `:root` (`--app-bg`, `--surface`, `--surface-subtle`, `--border-main`, `--text-main`, `--overlay-bg`, `--color-support`, etc.) and mapped directly into Tailwind CSS v4's `@theme` directive.
- **`src/styles/tokens/themes.ts` (`SCRIPT_THEMES`)**: Defines six visual themes categorized into `light`, `warm`, and `dark` alongside `SCRIPT_THEME_MAP`, `DEFAULT_SCRIPT_THEME`, and `THEME_CATEGORIES`.
- **`src/styles/tokens/cues.ts` (`CUE_THEME_COLORS`)**: Calibrates the 8 cue categories across light, warm, and dark theme palettes and provides `getCueColorForTheme()`.
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

### Cue Theme Color Calibration (`CUE_THEME_COLORS` & `getCueColorForTheme`)
Defines the eight cue categories with theme-calibrated RGB palettes:
- **Dialogue**: Yellow (`lightRgb: 250, 204, 21`, `warmRgb: 222, 160, 24`, `darkRgb: 253, 224, 71`)
- **Action**: Blue (`lightRgb: 96, 165, 250`, `warmRgb: 88, 134, 185`, `darkRgb: 56, 189, 248`)
- **Camera**: Green (`lightRgb: 74, 222, 128`, `warmRgb: 110, 158, 90`, `darkRgb: 52, 211, 153`)
- **Shot**: Purple (`lightRgb: 192, 132, 252`, `warmRgb: 168, 115, 172`, `darkRgb: 168, 85, 247`)
- **Audio**: Orange (`lightRgb: 251, 146, 60`, `warmRgb: 216, 108, 54`, `darkRgb: 249, 115, 22`)
- **VFX**: Cyan (`lightRgb: 34, 211, 238`, `warmRgb: 52, 160, 170`, `darkRgb: 45, 212, 191`)
- **Transition**: Pink (`lightRgb: 244, 114, 182`, `warmRgb: 216, 102, 136`, `darkRgb: 244, 114, 182`)
- **Environment**: Slate (`lightRgb: 148, 163, 184`, `warmRgb: 158, 146, 130`, `darkRgb: 148, 163, 184`)

The `getCueColorForTheme` helper returns the appropriate RGB values, contrast classes, and theme-adjusted opacity multipliers.

---

## 4. State / Hooks Layer (`src/hooks/`)

The hooks layer encapsulates all side effects, state lifecycle, dynamic theme resolution, and playback orchestration into eight modular custom hooks, keeping `App.tsx` as a lightweight orchestrator. All hooks are consolidated in the canonical `src/hooks/index.ts` barrel.

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
User preference management with `localStorage` synchronization:
- `scriptWidthPreset` → key `sceneflow_script_width_preset` (5 presets).
- `scrollFocusPreset` → key `sceneflow_scroll_focus_preset` (3 presets).
- `scriptThemeId` → key `sceneflow_script_theme` (6 themes).
- `hiddenCueTypes` → per-type visibility toggle with `toggleCueTypeVisibility()`.

### `useAutoScroll`
Real-time playback auto-scroll engine:
- Filters active cues by multi-select focus types (`autoScrollTargets`).
- Prioritizes the most recently started cue at the farthest script position.
- Computes viewport scroll position using the active `ScrollFocusPreset.ratio` on desktop and center alignment on mobile.

### `useCueEditor`
Cue authoring and editing state machine:
- Handles line-anchored DOM text selection → script-text mapping via `getSelectionIndicesFromDOM` with fallback to `findTextInScript`.
- Manages cue creation, editing, deletion with confirmation modals, and duplicate occurrence lookup.
- Exposes `selection`, `newCue`, `altLocations`, `overlapPicker`, and `resetConfirmation` state.

### `useCueAlignment`
Automated cue realignment orchestration:
- Delegates to `realignCuesList()` with manual-click delay for visual feedback.
- Tracks `isAligning` and `alignSuccess` status states.

### `useKeyboardShortcuts`
Global keyboard shortcut handler:
- Space = play/pause toggle, ArrowLeft = -5s seek, ArrowRight = +5s seek.
- Gates execution when input/textarea elements are focused or modals are open.
- Also tracks `isDesktop` via `window.innerWidth >= 1024` resize listener.

### `useScriptTheme`
Theme metadata and color resolution hook:
- Resolves active theme metadata (`ScriptThemeMetadata`), computed theme styles (`themeStyles`), and dark mode state (`isDark`).
- Provides dynamic cue color resolution helper (`resolveCueColor: (typeOrClass) => CueColorInfo`).
- Encapsulates theme-dependent styling logic for seamless integration across components.

---

## 5. UI Layer (`src/App.tsx` & `src/components/`)

The UI layer coordinates video playback, real-time highlighting, user interaction, and modal dialogs.

### Core Orchestrator (`src/App.tsx`)
- **Lightweight Composition**: `App.tsx` imports the custom hook suite and eighteen sub-components, composing them into the full application shell while keeping its own logic to a minimum (mode toggling, library state, modal visibility).
- **Hook Integration**: State, playback, preferences, auto-scroll, cue editing, alignment, keyboard shortcuts, and active script theme are fully delegated to the hooks layer. `App.tsx` only wires hook return values to component props.
- **Sync Engine (`renderedScript` `useMemo`)**: Computes line segments and active cue overlaps in real-time, calculating dynamic opacity based on per-category timing buffers.
- **Auto-Scroll Engine**: Delegates to `useAutoScroll`, which automatically scrolls the screenplay during playback, prioritizing the most recent active cue, supporting multi-selected focus categories, and aligning to the user's selected vertical focus ratio (35% Top, 50% Center, 65% Bottom).
- **Proximity-Aware Alignment**: Delegates to `useCueAlignment`, which uses `realignCuesList()` from `cueUtils.ts` to re-map cue character start/end positions when screenplay text is edited.
- **Cue Sanitization Pipeline**: All data ingress paths (localStorage restore, default load, blank, example, remote fetch) route through `sanitizeCues()` in `useScriptStorage`, guaranteeing deterministic IDs and `type`/`colorClass` normalization.

### Modular Sub-components (`src/components/`)
1. **`AppHeader.tsx`**: Global navigation header with SceneFlow logo, Guide/Library/Ko-fi action buttons, real-time playback clock, and Playback/Edit mode toggle.
2. **`InitializingScreen.tsx`**: Branded initial load screen displaying the SceneFlow logo with subtle animation.
3. **`YoutubeSourceInput.tsx`**: YouTube URL/ID input with live player connection indicator and automatic ID extraction using `UI_TOKENS.input`.
4. **`ScriptManagementBar.tsx`**: Screenplay status banner showing loaded line count with an "Edit Raw" action button styled with `UI_TOKENS`.
5. **`CueEditorForm.tsx`**: Cue authoring/editing form with editable text area, cue type selector, start/end time inputs with clock buttons, index editors, and "Find Alternative" button, consuming `useScriptTheme` for cue colors.
6. **`TimelineCuesPanel.tsx`**: Chronological cue list in edit mode showing color-dotted cards, per-type color legend, "Raw JSON" editor access, and "Align" realignment button, styled with `useScriptTheme`.
7. **`RawScriptModal.tsx`**: Modal dialog for bulk editing raw screenplay text using `UI_TOKENS.modal` and `UI_TOKENS.input`.
8. **`RawCuesModal.tsx`**: Modal dialog for viewing and editing raw cue data in JSON format, with `sanitizeCues()` applied on save and styled via `UI_TOKENS`.
9. **`OverlapPicker.tsx`**: Floating context popup for selecting which overlapping cue to edit at a shared position.
10. **`DeleteConfirmationModal.tsx`**: Confirmation dialog with cue text preview prior to permanent deletion styled via `UI_TOKENS`.
11. **`ResetConfirmationModal.tsx`**: Multi-purpose confirmation dialog for resetting settings, loading guide scripts, loading examples, or fetching remote projects, featuring integrated CORS error reporting and styled via `UI_TOKENS`.
12. **`TimingSettingsModal.tsx`**: Full-screen configuration modal for per-category timing buffers (before/after offsets) and General Master Offset using `UI_TOKENS`.
13. **`ScriptColorModal.tsx`**: Theme picker featuring a "Theme Presets" tab with mini live paper preview cards and an "Element Inspector" tab displaying token details and the 8-category highlight spectrum using `UI_TOKENS.swatch`.
14. **`ScriptHeaderControls.tsx`**: Playback-mode control bar with auto-scroll toggle, target-type multi-select dropdown, reading width preset selector, and scroll focus preset selector.
15. **`ActiveHighlightsPanel.tsx`**: Desktop playback sidebar showing active highlight cards sorted by type, with per-type filter toggle chips and animated pulse indicators, consuming `useScriptTheme`.
16. **`LibraryModal.tsx`**: Desktop library catalogue modal featuring real-time search, category navigation, sorting (Latest, Oldest, A-Z), section badges, and featured curations.
17. **`MobileLibraryModal.tsx`**: Mobile/tablet bottom-sheet drawer providing a touch-friendly category filter and search interface.
18. **`StagingModal.tsx`**: Monospace overlay displaying hidden camera, lighting, or lookbook directives from `[[STAGING]]` blocks.

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