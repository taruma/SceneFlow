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
1. 🟡 **Dialogue**: Spoken character dialogue.
2. 🔵 **Action**: Physical action beats and actor movements.
3. 🟢 **Camera**: Camera moves, gimbal directions, and framing.
4. 🟣 **Shot**: Shot scale descriptions (CU, WIDE, OTS, ESTABLISHING).
5. 🟠 **Audio**: Sound effects, foley, and soundtrack cues.
6. 🔷 **VFX**: Visual effects and CGI instructions.
7. 🩷 **Transition**: Scene cuts, dissolves, and pacing transitions.
8. ⚪ **Environment**: Atmospheric lighting and weather conditions.

### Cue Creation & In-Place Text Editing
- **Creation**: In Edit Mode, highlight text in the script preview to populate the "New Sync Cue" panel with calculated start and end character offsets.
- **Timestamp Capture**: Click the `Clock` button next to Start/End Time to snap directly to the player's current video time, or input manual values.
- **Manual Monospace Textarea**: Users can directly edit a cue's selected text in-place within the Edit Sync Cue panel. This allows safe text corrections without manual JSON editing while preserving character synchronization.
- **ID Sanitization**: All cues loaded from any source (localStorage, built-in examples, remote projects, or pasted JSON) are automatically run through `sanitizeCues()`, which deduplicates IDs, normalizes `type`/`colorClass` fields bidirectionally, and injects fallback UUIDs for malformed entries.
- **Duplicate Text & Alternative Location Finder**: When a phrase appears multiple times (e.g., `WIDE SHOT`), clicking "Find Alternative" scans the screenplay and presents a contextual list of all occurrences with character offsets and text snippets for instant snapping. Hidden `[[STAGING]]` block ranges are strictly excluded from search matches.

### Overlap Management
Multiple cues can span the same character ranges. In Edit Mode, overlapping regions display an indicator dot. Clicking an overlapping segment opens the floating `OverlapPicker` context menu to select which cue to inspect or edit.

### Chronological Proximity Alignment (`realignCues`)
When script text is edited or pasted, the "Align" tool sorts cues chronologically by time and uses proximity-aware regex matching to re-anchor cue indices to the nearest logical position, falling back to a 15-character prefix search if major edits occurred.

---

## 4. Auto-Scroll & Viewport Alignment Engine

During video playback, the script auto-scrolls to follow active dialogue and narrative cues.

### Multi-Select Focus Modes
Users can choose which cue categories trigger auto-scrolling via the "Focus Mode" dropdown:
- Defaults to tracking `dialogue`.
- Can be multi-selected to follow any combination (e.g., `dialogue` + `action` + `camera`).
- Features quick "Select All" and "Reset" toggles.

### Priority Resolution Logic
When multiple cues are active simultaneously:
1. Prioritizes the cue with the **most recent start time**.
2. If start times match, prioritizes the cue situated **furthest down** in the screenplay text.

### Viewport Scroll Focus Alignment Presets (Desktop)
Controls where the active cue line settles vertically within the reading container:
- **Top (35%)**: Positions the active line 35% from the top of the container, leaving upcoming lines visible for anticipation reading (Default).
- **Center (50%)**: Positions the active line at the balanced midpoint.
- **Bottom (35%)**: Positions the active line 35% from the bottom (65% ratio) for reflection reading.
- Switching presets immediately recalculates and smoothly scrolls to the active cue element; preferences persist in `localStorage`.
- Mobile and tablet viewports use native viewport centering for screen economy.

---

## 5. Script Viewer Customization & Dynamic Multi-Theming

### Dynamic App Shell Theming (Light / Warm / Dark)
The application shell features three bespoke CSS variable palettes that dynamically skin the entire workspace (Header, Left Panels, Modals, Desk Surface):
- **Light Mode**: Crisp studio paper with neutral stone surfaces (`#ffffff`, `#f5f5f4`, `#1c1917`).
- **Warm Mode**: Soft antique sepia & warm umber parchment (`#faf7f0`, `#f3efe6`, `#2b231d`).
- **Dark Mode**: Midnight slate with high-contrast light text (`#171514`, `#0c0a09`, `#f5f5f4`).
- **Auto-Sync Mode (Default)**: Changing the screenplay paper preset automatically transitions the application shell to the matching theme category.
- **Manual Mode Toggle**: Users can click the App Theme button in the header toolbar (`Sparkles [A]`, `Sun`, `Coffee`, `Moon`) to cycle modes explicitly. Preference is persisted in `localStorage`.

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
  - **Theme Presets Tab**: Shows side-by-side cards with live mini paper previews (heading banner, script text line, staging pill, and cue highlight chips).
  - **Element Inspector Tab**: Displays active paper and structural tokens alongside the full 8-category highlight spectrum.
  - Includes a single-click "Reset" button to restore the default *Studio Crisp* theme.
- **Mobile Theme Drawer (`MobileColorModal`)**:
  - A touch-friendly bottom-sheet drawer with a 4-segment App Shell switcher (`Auto`, `Light`, `Warm`, `Dark`) and 6 compact screenplay cards styled in their true paper colors and typography contrast.

### Configurable Screenplay Width Presets (Desktop Playback)
Selectable via a dropdown in the script preview header:
- *Narrow*: 384px (`max-w-sm`) — Focused reading column.
- *Compact*: 448px (`max-w-md`) — Snug reading view.
- *Standard*: 576px (`max-w-xl`) — Default classic screenplay width.
- *Wide*: 768px (`max-w-3xl`) — Spacious dual-column feel.
- *Expanded*: 1024px (`max-w-5xl`) — Full page layout.
- Width preference is saved to `localStorage` and hidden on mobile screens.

### Video Player Sizing Slider
Desktop playback mode includes a range slider (40% to 100%) to scale video preview width seamlessly.

---

## 6. Timing Settings & Buffer Engine

Fine-tunes highlight visibility timing before and after actual cue timestamps:
- **General Master Offset**: Global `before` and `after` buffers applied across all cue categories.
- **Category-Specific Offsets**: Individual `before` and `after` buffers for each of the 8 cue types.
- **Negative Offsets**: Supports negative values to display highlights earlier or end them sooner.
- **Formula**: `Effective Visibility Window = [StartTime - (GlobalBefore + CategoryBefore), EndTime + (GlobalAfter + CategoryAfter)]`.
- Reset button restores all timing settings to `0.0s` defaults.

---

## 7. Persistence, Sharing, & Library Catalogue

### Local Persistence
All project states (`screenplay_sync_state`), theme preferences (`sceneflow_script_theme`), width presets (`sceneflow_script_width_preset`), and scroll focus settings (`sceneflow_scroll_focus_preset`) persist in `localStorage`.

### Default Project & Quick Start Guide
- Fresh visits default to loading the **Scene Frequency** (`scene_frequency.json`) guide script.
- Clicking the header **Guide** button loads the official instructional tutorial (`blank.json`) in playback mode.

### Export & Import
- **Export**: Downloads current project as a JSON bundle containing `youtubeId`, `scriptText`, `cues`, and `settings`.
- **Import**: Uploads any valid SceneFlow JSON file and triggers automatic cue realignment.

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
- **Community Support**: Direct Ko-fi donation link (`https://ko-fi.com/tarumainfo`) integrated into desktop and mobile headers.

---

## 8. Application Information & Keyboard Navigation

### Desktop App Info Modal (`AppInfoModal`)
Accessible via the `i` (Info) icon button in the desktop header toolbar:
- **Dynamic Version & Metadata**: Automatically loads current version (`v2.2.0`), app title, and description directly from `metadata.json`.
- **Author Attribution**: Features creator credit for **Taruma Sakti** in header and footer linking directly to [Linktree](https://linktr.ee/tarumainfo).
- **Interactive Resource Grid**: 2x2 resource links for GitHub Repository, Documentation / Guide, Release Notes (Changelog), and Ko-fi Support.
- **MIT License**: License status indicator.

### Global Keyboard Shortcuts & Modal Dismissal
Available on desktop across both Playback and Edit modes with automatic input/textarea and modal guards:
- `Space` / `K`: Toggle YouTube video playback (Play / Pause).
- `←` / `→` (ArrowLeft / ArrowRight): Seek -5s / +5s.
- `J` / `L`: Seek -5s / +5s (YouTube standard navigation hotkeys).
- `Esc`: Close any active modal or popover (`ScriptColorModal`, `TimingSettingsModal`, `LibraryModal`, `MobileLibraryModal`, `RawScriptModal`, `RawCuesModal`, `DeleteConfirmationModal`, `ResetConfirmationModal`, `StagingModal`, `AppInfoModal`, `OverlapPicker`).
- **Backdrop Dismissal**: Clicking outside modal content on the backdrop overlay dismisses the active modal.
- **Shortcuts Safeguard**: All playback hotkeys are automatically gated and disabled whenever any modal or confirmation prompt is open.



