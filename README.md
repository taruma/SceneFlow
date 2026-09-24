<div align="center">
  <img src="public/SCENEFLOW_TAG_B.png" alt="SceneFlow Logo" height="80">
  
  # SceneFlow
  
  **Script-to-screen synchronization for AI filmmakers.**
  
  [![Live App](https://img.shields.io/badge/Live_App-Visit_Site-black?style=flat-square&logo=vercel)](https://sceneflow.taruma.my.id/)
  [![Updates on X](https://img.shields.io/badge/Updates_on_X-%40tarumainfo-black?style=flat-square&logo=x&logoColor=white)](https://x.com/tarumainfo)
  
  <p>
    <strong>Sync scripts and screenplays with video. Evaluate AI-generated footage. Analyze script-to-screen fidelity.</strong>
  </p>
</div>

---

https://github.com/user-attachments/assets/e2469136-4224-4192-affc-d19d7e403f74

## 📖 Overview

**SceneFlow** is a tool that syncs scripts and screenplays with video content, letting you see which parts of your prompt appear on screen in real-time.

Built for evaluating how AI video models visualize prompt instructions, it supports both traditional **Screenplay formatting** and high-precision, state-driven **Auteur Script formatting** with 5-part staging metadata. SceneFlow helps you compare instructions against what was actually generated — essential for assessing prompt adherence and iterating on AI cinema projects.

> **Note on Cue Creation**: SceneFlow does not automatically extract video sync cues in the background. Cues can be authored **manually** in the dedicated 3-Panel Edit Workstation or generated externally using **multimodal AI models** (such as Google Gemini). SceneFlow includes a built-in **Cues JSON Editor & LLM Sync Setup** with a ready-to-copy **Gemini Sync Prompt** and minimal **JSON Schema** for fast 1-click structured cue generation.

### What It Does

- **Script-to-Screen Tracking** — Highlights which parts of your script are playing in real-time
- **Dual Script Workflows** — Seamlessly handles both human-readable screenplays and state-chained Auteur Scripts
- **Desktop 3-Panel Studio Workstation** — Integrated media preview, time-clustered cue grid, reading canvas, and draggable cue inspector
- **Continuous Multi-Track Timeline** — Smooth display-synchronized (VSync) timeline tracking with stationary 35% anticipation playhead
- **Color-Coded Cues** — 8 element types: dialogue, action, camera, shots, audio, VFX, transitions, environments
- **Adherence Analysis** — Pinpoint missed prompt elements, camera drift, or continuity deviations against the generated video
- **LLM Sync Setup** — Built-in Gemini system prompt and JSON schema generator for structured cue outputs
- **Timing Controls** — Micro-nudge steppers (`±0.1s`, `±0.5s`), interactive loop previews, and adjustable per-category buffers
- **Portable** — JSON-based projects you can save, share, and version-control

---

## ✨ Features

### Synchronization System

| Feature | Description |
|---------|-------------|
| **Cue-Based Sync** | Link specific script segments to video timestamps |
| **8 Cue Types** | Dialogue, Action, Camera, Shot, Audio, VFX, Transition, Environment |
| **Auto-Scroll** | Script automatically follows dialogue during playback |
| **Auto-Alignment** | Re-match cues when script text changes |
| **Timing Buffers** | Adjustable before/after timing for each cue type |

### Color-Coded Cue Types (360° Harmonized & CVD-Safe)

| Type | Color | Standard Hue | Protanopia Profile | Purpose |
|------|-------|--------------|--------------------|---------|
| 🟡 Dialogue | Amber | Sunlight Amber | Sunlight Amber | Character speech and conversations |
| 🔵 Action | Blue | Royal Cobalt Blue | Royal Cobalt Blue | Physical actions and movements |
| 🟢 Camera | Green | Emerald Green | Mint Emerald | Camera movements and angles |
| 🟣 Shot | Indigo / Wine | Deep Iris | **Deep Wine / Burgundy** | Shot descriptions, framing, and camera scale |
| 🟠 Audio | Orange | Vivid Tangerine | Vivid Tangerine | Sound effects and music cues |
| 🔷 VFX | Cyan / Aqua | Electric Aqua | **Radiant Ice Aqua** | Visual effects descriptions |
| 🩷 Transition | Rose / Coral | Crimson Rose | **Vermilion Coral** | Scene transitions and editorial cuts |
| ⚪ Environment | Slate | Balanced Slate | Balanced Slate | Setting and atmosphere descriptions |

> **Accessibility Profile**: SceneFlow includes an opt-in **Protanopia / Deuteranopia Safe Mode** in theme settings that remaps Shot to Deep Wine ($L^* \approx 25$) to eliminate blue-indigo ambiguity, paired with high-luminance Ice Aqua VFX ($L^* \approx 85$) and Vermilion Coral transitions.

https://github.com/user-attachments/assets/cf3a7fec-2a4b-48d8-9028-245eba49934c

### 📊 Multi-Track Sync Timeline & Playback Workspace

- **Horizontal Multi-Track Timeline** — Visual NLE/DAW-inspired horizontal lanes for each cue category with deterministic sub-lane stacking
- **Sub-Frame Clock Extrapolation** — Continuous timeline clock advancement (`useSmoothTimelineTime`) running via `requestAnimationFrame` and `performance.now()`, eliminating jittery ~100ms API polling delays and fixed-step CSS transition stutter
- **Stationary Anticipation Playhead** — Laser marker anchored at 35% with a continuous sliding timecode ruler for upcoming cue anticipation
- **Adaptive Single-Row Header** — Stepped label collapsing with live active cue counter, 8-slot category LED VU meter strip, and compact `[ ↕ Fixed ]` / `[ ↕ Flex ]` track height toggle
- **Docked Paused Inspector** — Detailed cue inspection card with quotes, timestamps, category badges, and instant replay when paused
- **Persistent Transport Controls** — Header-mounted Play, Pause, and Replay (0:00) controls operable even when video is hidden
- **Live Timecode HUD Badge** — Real-time `MM:SS.s` precision timecode and media duration indicator active in both modes
- **Collapsible YouTube Source Header Pill** — Replaces bulky inputs with a sleek `[ 🟢 {videoId} ✏️ ]` pill, saving vertical space
- **Collapsible Video Player** — Hide video frame with zero-height clipping for clean timeline screen recording while keeping background audio and clock continuity (`V`)
- **Mode-Aware Layout Reset** — Snaps split panes to calibrated distributions (40/35/25 in Edit Mode, 65/35 in Playback Mode) with 1-click or `Shift+R`
- **Timeline Zoom & Height Modes** — Discrete zoom presets (4s, 8s, 16s) and Fixed vs. Flexible track height allocation

### ✏️ Desktop 3-Panel Edit Workstation & Cue Studio

- **Calibrated 40 / 35 / 25 Distribution** — Dedicated 3-panel layout: Left Media & Cues Studio (40%), Center Screenplay Canvas (35%), and Right Draggable Cue Inspector (25%)
- **Draggable Vertical Inspector Splitter** — Fluid percentage-based resizing (18% to 45% with 260px safety floor), double-click reset to 25%, and keyboard accessibility (<kbd>←</kbd> / <kbd>→</kbd> / <kbd>Enter</kbd>)
- **Time-Clustered Fluid Grid (Cards View)** — Chronological cue grouping ($\le 2.5$s proximity, max 10s span) with frosted sticky timecode landmark rulers and dense auto-fill packing
- **Mini Cue Cards & Dialogue Safeguard** — Compact 1-column cards for quick audio/shot bursts ($\le 1.8$s, $\le 40$ch), while character dialogue (`type === 'dialogue'`) and longer text are guaranteed at least 2 columns
- **Ergonomic Cue Inspector** — Symmetrical Start/End audio-visual timing deck with live timecode HUDs (`MM:SS.s`), micro-nudge steppers (`-0.5s`, `-0.1s`, `+0.1s`, `+0.5s`), clock capture, live duration chips (`⏱ 1.6s`), and interactive `Play Cue [▶]` preview with a dynamic `Loop [🔁]` controller
- **Surrounding Scene Context Window** — Displays screenplay lines immediately preceding (`PREV`) and following (`NEXT`) the selected text for instant narrative orientation
- **Script Anchoring Card** — Decoupled card retaining editable character offsets (`Start Index`, `End Index`), live span counter, and cue ID badge
- **Pinned Sticky Bottom Action Bar** — Anchors `Update Cue` (<kbd>Ctrl+Enter</kbd>), `Cancel` (<kbd>Esc</kbd>), and `Delete` permanently to the inspector bottom
- **Two-Tier Theme-Harmonized Highlights** — Primary scroll focus cue commands attention with radiant ambient glow, halo, and active border; secondary co-active cues render with subtle ambient wash
- **Performance-Shielded Auto-Scroll** — Forward monotonic scrolling guard eliminating rubber-band jitter, with instant touch/wheel cancellation and filter-aware visible cue tracking
- **Cross-Mode Playback Continuity** — Single persistent media viewport prevents YouTube player destruction, audio cutoffs, or timestamp resets when toggling between Playback and Edit modes
- **Clean Script Click Dismissal** — Clicking clean script canvas safely dismisses inspector back to idle overview when no unsaved changes exist (`dismissIfClean`), with reactive `Saved` vs `Unsaved` status badging

### 🤖 Studio Cues JSON Editor & LLM Sync Setup (`RawCuesModal`)

- **Two-Column Workstation Architecture** — Left column visual Schema Reference (essential, auto-calc, and optional fields with copy/insert snippets); right column dual-tab editor
- **`JSON Data` Tab** — Live non-blocking syntax validation pill (`{ cues } detected`, `N cues ready`), error diagnostics without browser alerts, and `[ ✨ Format JSON ]` 2-space indentation standardizer with automatic `{ cues: [...] }` unwrapping
- **`Sync Prompt & Schema` Tab** — Integrated 3-step Gemini setup guide with standalone public asset links (`/sync-prompt.txt`, `/schema.json`)
- **Segmented Sub-View Switcher** — Full-width views (`[ 📄 Sync Prompt ]`, `[ 🤖 Gemini Schema ]`) eliminating horizontal scrollbars, and `[ ◫ Split ]` side-by-side mode
- **Token-Optimized Minimal Schema** — Modular schema contract strictly focused on data types and enums without noisy descriptions that degrade LLM token generation
- **Context-Aware Footer Actions** — Tab-specific actions (`Apply Cues (N)` vs `Go to JSON Data →`) with wrap-resistant Title Case styling

### 📝 Studio Script Editor & Formatting Suite (`RawScriptModal`)

- **4-Rank Hierarchical Outline** — Collapsible navigation tree parsing `PART`, Roman numeral acts (`I. ...`), scene headings (`INT./EXT.`), staging containers, brief execution blocks, and directive tags with section item counters, expand/collapse all, and auto-unfold caret tracking
- **Soft Word-Wrap with Gutter Alignment** — Toggleable via `[ Wrap ]` or <kbd>Alt+Z</kbd>, utilizing an off-screen measurement mirror container computing rendered line heights for exact 1:1 line number gutter alignment without vertical drift
- **Searchable Formatting Guide Sidebar** — Integrated right-hand cheat sheet with live search, category filtering (`Structure`, `Directives`, `Dialogue`, `Effects`), 1-click **Insert** and **Copy** snippets, and live visual preview badges
- **Single-Tier Streamlined Toolbar** — 40px single-row toolbar housing segmented view switcher, container wrapping buttons (`[[STAGING]]`, `[<BRIEF>]`), core directive presets (`INTENT`, `LOGIC`, `AESTHETIC`, `OPENING`), persistent custom directive tags with removal pips, and right-aligned history/document utilities
- **Debounced Undo/Redo & Custom Tags Engine** — Keystroke-debounced history engine (300ms) with full <kbd>Ctrl+Z</kbd>/<kbd>Ctrl+Y</kbd> support and `localStorage` persistence for user-defined directive tags
- **Fast-Path Outline Parsing & DOM Virtualization** — Fast-path character prefix filtering bypassing 95% of regex evaluations, single-pass bottom-up $O(N)$ accumulation, and `content-visibility: auto` CSS virtualization

### Data Management

- **Universal File Dropdown Data Access** — Instant direct access to `Sync Cues (JSON)...` and `Source Script...` across both Playback and Edit modes without mode switching
- **Import/Export** — Save and load projects as JSON files
- **Remote Sharing** — Share projects via URL using query parameters
- **Raw Editing** — Direct access to screenplay text and cue data
- **Separated Blank Canvas & Starter Guide** — Authentic blank project template (`blank.json`) for starting fresh, alongside dedicated 1,200+ line interactive tutorial script (`guide.json`)
- **Local Storage** — Automatic saving of your work

### Script Viewer Customization & Dynamic Theming

- **3-Zone Studio Header Architecture** — Balanced layout: Left Wing tiered `[ File ▾ ]` dropdown (Project I/O, Blank Canvas, Starter Guide, Library), Center Stage segmented mode switcher (`[ ▶ Playback | ✏️ Edit ]`), and Right Wing Studio Preferences
- **Consolidated Studio Preferences (`[ ⚙️ Settings ▾ ]`)** — 4-theme quick selector grid (`Auto`, `Light`, `Warm`, `Dark`), dedicated "Reading Canvas & Viewport" section with 5-segment Script Width row and 3-segment Focus Line row, `<kbd>` shortcut badges, dynamic `Custom` layout badge, and 1-click `[ ↺ Reset All ]` action
- **Instant Color Theme Switching** — Zero-lag theme and paper switching powered by a momentary CSS transition suppression engine (`disableTransitionsTemporarily()`), eliminating repaint stutter and frame drops
- **Auto-Sync Mode** — Application shell automatically adapts to match the active screenplay paper category
- **Pure Black Canvas (Video Overlay Mode)** — Absolute `#000000` luminance and shadow stripping for NLE Screen/Lighten blend compositing and screen capture
- **Theme Presets** — 6 screenplay paper themes: Studio Crisp, Warm Parchment, Midnight Slate, OLED Blackout, Navy Slate, Newsprint
- **Mobile Theme Drawer** — Native bottom-sheet drawer with 4-segment mode switcher and compact swatch cards
- **Adaptive Logo** — Automatic dark/white logo switching across light, warm, and dark surfaces
- **In-Place Cue Editing** — Edit cue text directly without touching raw JSON

### Platform & Performance

- **Mobile-Responsive** — Native bottom-sheet drawers for library and themes with adaptive staging badges and sticky mobile video transport
- **App Info & Attribution** — Desktop information modal with dynamic versioning (`v2.5.1`), author attribution, and documentation resource links
- **Centralized Keyboard Shortcuts Registry & Interactive Cheat-Sheet Modal** — Searchable modal triggered globally via <kbd>?</kbd> (<kbd>Shift+/</kbd>) or Studio Settings, featuring category filter tabs, platform glyphs (<kbd>⌘</kbd> vs <kbd>Ctrl</kbd>), and quick navigation hotkeys (<kbd>Shift+F</kbd> File Menu, <kbd>Shift+S</kbd> Source Script, <kbd>Shift+E</kbd> Cue Editor, <kbd>Shift+L</kbd> Library, <kbd>Ctrl+Enter</kbd> Script Commit)
- **High-Performance Architecture** — Monolithic bundle splitting via dynamic `React.lazy()` secondary modals and Vite Rollup `manualChunks`, slashing initial JS bundle payload by **70%** (778 kB → 243 kB; 215 kB → 65 kB gzip)
- **Vercel Analytics** — Audience traffic insights and real-time Web Vitals monitoring
- **PWA-Ready** — Web manifest and icon suite for standalone app installation

### 📚 Expanded Library Catalogue

SceneFlow features a fully redesigned, responsive **Library Catalogue** serving as an interactive hub for screenplays, cinematic series, and AI-generated video examples:

- **Dynamic Sorting & Filtering** — Toggle by newest, oldest, or A-Z with real-time search across titles, descriptions, tags, and volumes.
- **Cross-Device Fluidity** — Full modal dialog on desktop; touch-friendly bottom-sheet drawer on mobile.
- **Category Navigation** — Browse by AI Scenes, The Written Motion, FRAME Series, and AI Clips with contextual section badges.
- **Featured Curations** — Handpicked standout scripts surfaced at the top.

→ See the full list in **[SceneFlow Catalogue](SCENEFLOW_CATALOGUE.md)** with IDs, dates, and video models.

---

## 🎬 Use Cases

### Evaluating AI-Generated Video

SceneFlow helps you see how well an AI model followed your screenplay prompt:

- **Assess Prompt Adherence** — Compare what you wrote vs. what the model generated
- **Spot Gaps** — Quickly identify which script elements were missed or poorly rendered
- **Compare Models** — Test the same script across different AI video generators
- **Iterate on Prompts** — Understand what works and refine your screenplay instructions

### Example Projects

Browse all projects in the **[SceneFlow Catalogue](SCENEFLOW_CATALOGUE.md)** — organized by AI Scenes, The Written Motion, FRAME Series, and AI Clips, each with shareable `?example=` IDs.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/taruma/SceneFlow.git

# Navigate to project directory
cd SceneFlow

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev

# Open in browser
# Default: http://localhost:3000
```

---

## 📘 Usage Guide

### Playback Mode

1. **Load a Script** — Use the top-level **[ File ▾ ]** menu to open a project, browse the built-in Library (`?example=ID`), load a remote URL (`?project=URL`), or explore the official **Starter Guide**.
2. **Play the Video** — The script highlights in real-time as the video timeline progresses with smooth, display-synchronized playhead tracking.
3. **Auto-Scroll & Focus Mode** — Script automatically follows active cues. Click the **Focus Mode** dropdown next to Auto-Scroll to filter which cue types trigger scrolling (e.g., track *Dialogue* only).
4. **Studio Preferences (`[ ⚙️ Settings ▾ ]`)**:
   - **Scroll Focus Line**: Choose where the active cue centers in your viewport (Top 35%, Center 50%, or Bottom 65%).
   - **Script Width Presets**: Toggle between 5 reading column widths (Narrow 384px to Expanded 1024px) for side-by-side video review.
   - **Shell & Script Themes**: Quick 4-theme picker (`Auto`, `Light`, `Warm`, `Dark`) and full palette modal (<kbd>Shift+C</kbd>).
   - **Reset View Layout**: Snap back to default split layout (<kbd>Shift+R</kbd>).
5. **Timeline Inspection** — Click any cue block in the Multi-Track Timeline or pause playback to reveal the docked Cue Inspector card with quotes, timestamps, and instant replay.
6. **Screen Recording Mode** — Collapse the video player with zero-height clipping (<kbd>V</kbd>) to capture clean, distraction-free recordings of the timeline alongside the screenplay.

### Edit Mode

1. **Switch to Edit Mode** — Click the centered `[ ✏️ Edit ]` toggle in the header. The workspace seamlessly snaps to the **40 / 35 / 25** studio workstation (Left Media/Cues, Center Screenplay Canvas, Right Cue Inspector) with continuous video playback.
2. **Set Video Source** — Click the compact `[ 🟢 {videoId} ✏️ ]` header pill to paste any YouTube video URL, short ID, or direct video link.
3. **Edit Script Text** — Click **[Edit Source]** in the screenplay header to modify the raw script and staging blocks.
4. **Author & Inspect Cues**:
   - Highlight any text in the screenplay canvas to populate a new cue draft, or click any cue card in the left panel to inspect an existing cue.
   - Use the **Audio-Visual Timing Deck** to capture live playback timestamps (`Clock` icon), or fine-tune boundaries using single-click micro-nudge steppers (`-0.5s`, `-0.1s`, `+0.1s`, `+0.5s`).
   - Audition cue timing in real-time using `Play Cue [▶]` and the dynamic `Loop [🔁]` toggle.
   - Review the **Surrounding Scene Context** (`PREV` and `NEXT` script lines) to anchor the quote without looking away.
   - Edit the quote text directly in-place or adjust character index offsets in the Script Anchoring card.
   - Save changes via **Update Cue** (<kbd>Ctrl+Enter</kbd>), cancel with <kbd>Esc</kbd>, or safely dismiss by clicking clean screenplay canvas space.
5. **Fluid Cue Grid & Search**:
   - Browse cues in the **Time-Clustered Fluid Grid** (`Cards` view) with sticky timecode landmark rulers, or switch to high-density `Compact` view.
   - Toggle the collapsible `[ 🔍 Filter ]` bar to search text or filter by multiple categories simultaneously.
   - Toggle Left Panel auto-scroll (`[ 🎯 Scroll ]`) to follow the active cue during playback.
6. **Align & Proximity Matching** — Click **[ ↺ Resync ]** to automatically re-anchor highlights if script text changes; use "Find Alternative" to resolve duplicate phrase occurrences.
7. **Studio Cues JSON Editor & LLM Sync** — Click **[ { } JSON ]** to open the 2-column workstation:
   - Validate and prettify raw cue JSON with live feedback (`{ cues } detected`).
   - Copy the standardized **Gemini Sync Prompt** and minimal **JSON Schema** to generate synchronized cues directly from video models in Google AI Studio.
8. **Export Project** — Download a portable JSON project file via **[ File ▾ ] → Save Project**.

### Keyboard Shortcuts

| Key | Action | Context |
|-----|--------|---------|
| `Space` / `K` | Play / Pause video | Global (Playback active) |
| `←` / `J` | Rewind 5 seconds | Global (Playback active) |
| `→` / `L` | Forward 5 seconds | Global (Playback active) |
| `V` | Toggle video collapse (Screen Recording) | Playback Mode |
| `Shift + C` | Open Script Paper & Colors modal | Global |
| `Shift + T` | Open Timing & Durations modal | Global |
| `Shift + R` | Reset View Layout (Mode-Aware: 40/35/25 in Edit, 65/35 in Playback) | Global |
| `Ctrl + Enter` | Save / Update cue draft | Cue Inspector |
| `Esc` | Cancel cue edit / Close active modal | Global |


---

## 🔗 Sharing & Query Parameters

SceneFlow supports sharing projects directly via URL. When a project is loaded via query parameter, a confirmation dialog will appear to prevent overwriting your current work.

### Loading Examples

You can load any built-in screenplay example directly by appending `?example=ID` to the URL. 

See the **[SceneFlow Catalogue](SCENEFLOW_CATALOGUE.md)** for the complete ID-to-title reference across all four sections.

### Loading Remote Projects

You can load any JSON project hosted on a CORS-enabled server by appending `?project=URL`.

**Example:**
`sceneflow.taruma.my.id/?project=https://raw.githubusercontent.com/user/repo/main/script.json`

> **Note**: The remote server must allow Cross-Origin Resource Sharing (CORS) for the fetch to succeed. GitHub Gist "Raw" links are recommended for sharing.

---

## 📝 Script Formatting Guide

SceneFlow uses deterministic heuristics and regex to parse, render, and synchronize both traditional screenplays and technical Auteur Scripts.

### Two Supported Scripting Workflows

SceneFlow accommodates both major prompting styles used across AI filmmaking:

1. **Classic Auteur (Screenplay Style)**:
   - Uses traditional cinema formatting: Scene Headings (`INT./EXT.`), character dialogue blocks, parentheticals, and bold action lines.
   - Ideal for narrative scenes, multi-page drama, and human-readable script sharing where natural language guides the model's visual staging.
2. **Auteur Script (Technical State Engine)**:
   - Uses modular state-transition blocks enclosed in `[<BRIEF>]` tags with chained arrows (`->`) and bold anchor tokens (`[CAM]`, `[ACT]`, `[AUDIO]`, `[STATE OUT]`).
   - Ideal for reasoning-based video models where each Macro-State line ($S_n$) inherits the visible physical coordinates of the previous beat without hallucinating resets.

Both workflows share the exact same Staging metadata and Timeline Cue synchronization engines.

### Core Elements Table

| Element | Format | Example |
|---------|--------|---------|
| **Scene Heading** | Starts with `INT.` or `EXT.` | `INT. OFFICE - DAY` |
| **Character Name** | ALL CAPS followed by a colon | `JOHN:` |
| **Dialogue** | Lines immediately following a character name | `Everything starts with intent.` |
| **Parenthetical** | Text wrapped in parentheses | `(whispering with excitement)` |
| **Bold Direction** | Single line in ALL CAPS (emphasized action) | `HE PIVOTS SHARPLY TO FACE THE DOOR.` |
| **Action** | Mixed case narrative paragraphs | `The cursor blinks on a clean slate as the creator leans in.` |
| **Shot / Camera Note** | Text wrapped in square brackets `[...]` | `[CLOSE-UP – MONITOR DISPLAY]` |
| **Effect** | Starts with `SFX:` or `VFX:` | `SFX: Mechanical keyboard click` |
| **Separator** | Three dashes on a single line | `---` |
| **Part Separator** | `PART` followed by a number | `PART 1` |
| **Roman Title** | Roman numeral + dot + Uppercase Title | `I. THE BEGINNING` |
| **Auteur Script Block** | Block wrapped in `[<BRIEF>]` and `[</BRIEF>]` | *See below* |

---

### Staging Blocks (Auteur Script Scaffold)

SceneFlow embeds high-level prompt directives directly into your project using **Staging Blocks**. Staging content is concealed from the main reading flow and replaced with an interactive **STAGING** badge that opens a monospace inspector modal.

#### The 5-Part Scaffold Architecture:
The standard Auteur Script framework is built upon a 5-part scaffold (modular and adaptable based on the specific scene or generation task):
1. `[INTENT]` — High-level vision, subject definition, and core emotional beat.
2. `[LOGIC]` — Hard guardrails for visual planning (spatial continuity, 180° axis, object permanence).
3. `[AESTHETIC]` — Master audio-visual reference (palette, lighting, wardrobe, location, textures).
4. `[OPENING]` — Locked first-frame coordinate anchor ($S_0$) establishing baseline geometry.
5. `[EXECUTION]` — Active timeline state-transition pipeline (wrapped in `[<BRIEF>]`).

#### Staging Directives in SceneFlow:
Within SceneFlow, all non-execution setup blocks (parts 1–4) are encapsulated inside `[[STAGING]]...[[/STAGING]]` to keep the reading timeline clean:
- `[[INTENT]]` — Scene vision, identity, and tone.
- `[[LOGIC]]` — Hard guardrails for visual planning.
- `[[AESTHETIC]]` — Master audio-visual styling parameters.
- `[[OPENING]]` — Starting first-frame coordinate anchor ($S_0$).
- *Optional Extensions:* Directives like `[[CONTINUITY PROTOCOL]]` can be added for multi-shot video extensions; legacy directives (`[[GLOBAL]]` and `[[LOOKBOOK]]`) remain fully backward-compatible.
- *Execution Separation:* Everything inside `[<BRIEF>]...[</BRIEF>]` represents the **`[EXECUTION]`** block (never labeled as staging), driving the active state-transition pipeline.

#### Staging Example:

```text
[[STAGING]]
[[INTENT]]
Create a cinematic, dialogue-driven academic drama scene featuring Mark and Robert.
[[/INTENT]]
[[LOGIC]]
Ensure rigid spatial continuity across camera setups. Preserve object permanence for the metronome.
[[/LOGIC]]
[[AESTHETIC]]
Medium: 35mm film texture.
Palette: Deep navy blue, rich mahogany dark oak, warm amber tungsten.
Lighting: Overhead tungsten auditorium grid lighting.
[[/AESTHETIC]]
[[OPENING]]
Establishing wide shot of the auditorium stage. Mark stands stage left; Robert holds a wooden metronome stage right.
[[/OPENING]]
[[/STAGING]]
```

---

### Auteur Script Formatting Engine (`[<BRIEF>]`)

For high-precision AI video models, wrap your timeline execution in `[<BRIEF>]` blocks. SceneFlow renders this in a dedicated monospace card and applies two automatic layout engines:

- **Waterfall Indentation**: Every `->` delimiter automatically creates a new line with nested indentation (`\n    -> `), turning complex prompt sequences into clean visual beat cascades.
- **Bold Anchor Tagging**: Any bracketed dimension tag like `[CAM]`, `[ACT]`, `[AUDIO]`, `[STATE IN]`, or `[STATE OUT]` is automatically bolded (`<b>[...]</b>`) for rapid cognitive scanning.
- **State Chaining**: Each line represents a **Macro-State** ($S_n$), composed of modular **Sub-States** that map frame transformations over time.

#### Auteur Script Example:

```text
[<BRIEF>]
[CAM 01] MS, eye-level lockoff -> [ACT] Creator types the first command -> Creator: "Let's build." -> <Mechanical keyboard click> -> [STATE OUT] Frame locked in clean focus
[CAM 02] MCU, low-angle on monitor -> [ACT] Screen reflects glowing amber text -> [AUDIO] Low cooling fan hum
[</BRIEF>]
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Author:** Taruma Sakti Megariansyah

---

<div align="center">
  <p>
    <a href="https://sceneflow.taruma.my.id/">🌐 Live App</a>
    ·
    <a href="https://x.com/tarumainfo">@tarumainfo</a>
  </p>
</div>