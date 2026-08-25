# Architecture

SceneFlow follows a modular, 3-layer architecture that separates script parsing, visual theme rendering, and UI state management.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              LOGIC LAYER                               │
│  src/lib/scriptParser.ts  •  src/lib/scriptProcessor.ts  •  utils.ts    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ ProcessedLine[], StagingMarkers
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              VISUALS LAYER                             │
│  src/lib/scriptStyles.ts (Theme Engine, Cue Color Calibration)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ CSS Classes, Theme Tokens, RGB Highlights
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                                UI LAYER                                │
│  src/App.tsx  •  src/components/*  •  src/types/script.ts              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Logic Layer

The logic layer extracts structure, metadata, and character positions from raw screenplay text without depending on React or DOM APIs.

### `src/lib/scriptParser.ts`
- **Staging Block Extraction (`parseScriptWithStaging`)**: Identifies top-level `[[STAGING]]...[[/STAGING]]` blocks and sub-tagged directives (e.g., `[[GLOBAL]]`, `[[LOOKBOOK]]`, `[[CAMERA]]`). Returns original lines, line indices to hide from the main view, and a map of line-anchored `StagingMarker` objects.
- **Block-Level Parser (`parseScriptToBlocks`)**: Converts raw text into structured `ScriptBlock` AST items with start/end character offsets for external serialization and AST manipulation.

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
- **Brief Block Handling**: Recognizes `[<BRIEF>]` and `[</BRIEF>]` delimiters, skips blank lines within technical blocks, and sets `isBrief: true`.
- **Character Offset Indexing**: Computes exact `lineStart` and `lineEnd` character offsets to ensure sync cues remain accurately positioned.

### `src/lib/utils.ts`
- **`cn(...inputs)`**: Merges Tailwind utility classes safely using `clsx` and `tailwind-merge`.
- **`extractYoutubeId(url)`**: Extracts an 11-character YouTube video ID from various URL formats (standard, shortened `youtu.be`, embeds, shorts, mobile).

---

## 2. Visuals Layer (`src/lib/scriptStyles.ts`)

The visuals layer encapsulates all styling tokens, color schemes, and theme definitions.

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

## 3. UI Layer (`src/App.tsx` & `src/components/`)

The UI layer coordinates video playback, real-time highlighting, user interaction, and modal dialogs.

### Core Component (`src/App.tsx`)
- **State Orchestration**: Manages `AppState` (`youtubeId`, `scriptText`, `cues`, `settings`), active mode (`playback` vs. `edit`), current video timestamp, and user preferences (`theme`, `scriptWidthPreset`, `scrollFocusPreset`).
- **Sync Engine (`renderedScript` `useMemo`)**: Computes line segments and active cue overlaps in real-time, calculating dynamic opacity based on per-category timing buffers.
- **Auto-Scroll Engine**: Automatically scrolls the screenplay during playback, prioritizing the most recent active cue, supporting multi-selected focus categories, and aligning to the user's selected vertical focus ratio (35% Top, 50% Center, 65% Bottom).
- **Proximity-Aware Alignment (`realignCues`)**: Re-maps cue character start/end positions when screenplay text is edited, excluding hidden `[[STAGING]]` block ranges and utilizing fallback short-matching.
- **Alternative Location Finder**: Scans for duplicate text occurrences in the script and allows one-click snapping to the correct scene offset.

### Modular Sub-components (`src/components/`)
1. **`InitializingScreen.tsx`**: Branded initial load screen displaying the SceneFlow logo with subtle animation.
2. **`YoutubeSourceInput.tsx`**: YouTube URL/ID input with live player connection indicator and automatic ID extraction.
3. **`ScriptManagementBar.tsx`**: Screenplay status banner showing loaded line count with an "Edit Raw" action button.
4. **`RawScriptModal.tsx`**: Modal dialog for bulk editing raw screenplay text.
5. **`RawCuesModal.tsx`**: Modal dialog for viewing and editing raw cue data in JSON format.
6. **`OverlapPicker.tsx`**: Floating context popup for selecting which overlapping cue to edit at a shared position.
7. **`DeleteConfirmationModal.tsx`**: Confirmation dialog with cue text preview prior to permanent deletion.
8. **`ResetConfirmationModal.tsx`**: Multi-purpose confirmation dialog for resetting settings, loading guide scripts, loading examples, or fetching remote projects, featuring integrated CORS error reporting.
9. **`TimingSettingsModal.tsx`**: Full-screen configuration modal for per-category timing buffers (before/after offsets) and General Master Offset.
10. **`ScriptColorModal.tsx`**: Theme picker featuring a "Theme Presets" tab with mini live paper preview cards and an "Element Inspector" tab displaying token details and the 8-category highlight spectrum.
11. **`LibraryModal.tsx`**: Desktop library catalogue modal featuring real-time search, category navigation, sorting (Latest, Oldest, A-Z), section badges, and featured curations.
12. **`MobileLibraryModal.tsx`**: Mobile/tablet bottom-sheet drawer providing a touch-friendly category filter and search interface.
13. **`StagingModal.tsx`**: Monospace overlay displaying hidden camera, lighting, or lookbook directives from `[[STAGING]]` blocks.

### Type Definitions & Data Schemas
- **`src/types/script.ts`**: Defines `Cue`, `ScriptBlock`, and `ScriptBlockType`.
- **`src/examples.ts`**: Defines the `Example` and `ExampleSection` schemas and holds the built-in catalogue metadata.

---

## 4. Data Flow Diagram

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
4. App.tsx Sync Engine ───────► Combines lines with Cues[], currentTime, and TimingSettings
   │
   ▼
5. scriptStyles.ts ───────────► Resolves theme tokens (SCRIPT_THEMES) & RGB cue colors (CUE_THEME_COLORS)
   │
   ▼
6. Rendered Screenplay ───────► Highlights active cues, auto-scrolls to focus preset, renders UI
```