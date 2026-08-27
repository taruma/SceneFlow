<div align="center">
  <img src="public/SCENEFLOW_TAG_B.png" alt="SceneFlow Logo" height="80">
  
  # SceneFlow
  
  **Script-to-screen synchronization for AI filmmakers.**
  
  [![Live App](https://img.shields.io/badge/Live_App-Visit_Site-black?style=flat-square&logo=vercel)](https://sceneflow.taruma.my.id/)
  
  <p>
    <strong>Sync scripts and screenplays with video. Evaluate AI-generated footage. Analyze script-to-screen fidelity.</strong>
  </p>
</div>

---

https://github.com/user-attachments/assets/e2469136-4224-4192-affc-d19d7e403f74

## 📖 Overview

**SceneFlow** is a tool that syncs scripts and screenplays with video content, letting you see which parts of your prompt appear on screen in real-time.

Built for evaluating how AI video models visualize prompt instructions, it supports both traditional **Screenplay formatting** and high-precision, state-driven **Auteur Script formatting** with 5-part staging metadata. SceneFlow helps you compare instructions against what was actually generated — essential for assessing prompt adherence and iterating on AI cinema projects.

> **Note on Cue Creation**: SceneFlow does not automatically extract or generate video sync cues for you. Cues must be mapped **manually** (by highlighting text in Edit Mode and setting timestamps) or generated externally using **multimodal AI models** (such as Gemini) that analyze video frames against script timecodes.

### What It Does

- **Script-to-Screen Tracking** — Highlights which parts of your script are playing in real-time
- **Dual Script Workflows** — Seamlessly handles both human-readable screenplays and state-chained Auteur Scripts
- **Color-Coded Cues** — 8 element types: dialogue, action, camera, shots, audio, VFX, transitions, environments
- **Adherence Analysis** — Pinpoint missed prompt elements, camera drift, or continuity deviations against the generated video
- **Timing Controls** — Adjustable buffers to fine-tune when highlights appear
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

### Color-Coded Cue Types

| Type | Color | Purpose |
|------|-------|---------|
| 🟡 Dialogue | Yellow | Character speech and conversations |
| 🔵 Action | Blue | Physical actions and movements |
| 🟢 Camera | Green | Camera movements and angles |
| 🟣 Shot | Purple | Shot descriptions and framing |
| 🟠 Audio | Orange | Sound effects and music cues |
| 🔷 VFX | Cyan | Visual effects descriptions |
| 🩷 Transition | Pink | Scene transitions |
| ⚪ Environment | Slate | Setting and atmosphere descriptions |

https://github.com/user-attachments/assets/cf3a7fec-2a4b-48d8-9028-245eba49934c

### Data Management

- **Import/Export** — Save and load projects as JSON files
- **Remote Sharing** — Share projects via URL using query parameters
- **Raw Editing** — Direct access to screenplay text and cue data
- **Example Library** — Pre-built demos to get started quickly
- **Local Storage** — Automatic saving of your work

### Script Viewer Customization

- **Theme Presets** — 6 visual themes: Studio Crisp, Warm Parchment, Midnight Slate, OLED Black, Cyber Matrix, Retro Newspaper
- **Width Presets** — 5 reading column widths from Narrow (384px) to Expanded (1024px)
- **Scroll Focus** — 3 viewport alignment anchors (Top, Center, Bottom) for auto-scroll positioning
- **In-Place Cue Editing** — Edit cue text directly without touching raw JSON

### Platform

- **Mobile-Responsive** — Distinct library modals for desktop and mobile with adaptive staging badges
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

1. **Load a Script** — Use the built-in Library (`?example=ID`), load a remote URL (`?project=URL`), or import a JSON project file.
2. **Play the Video** — The script highlights in real-time as the video timeline progresses.
3. **Auto-Scroll & Focus Mode** — Script automatically follows active cues. Click the **Focus Mode** dropdown next to Auto-Scroll to filter which cue types trigger scrolling (e.g., track *Dialogue* only).
4. **Scroll Focus Line** — Choose where the active cue centers in your viewport (Top 35%, Center 50%, or Bottom 65%).
5. **Script Width Presets** — Toggle between 5 reading column widths (Narrow to Expanded) for side-by-side video review.
6. **Script Themes** — Switch between 6 light, warm, and OLED dark themes via the theme picker.

### Edit Mode

1. **Switch to Edit** — Click the "Edit" toggle in the header.
2. **Set Video Source** — Paste any YouTube video URL, short ID, or direct video link.
3. **Edit Script Text** — Click "Edit Raw" to modify the complete script and staging blocks.
4. **Create & Adjust Cues**:
   - Highlight any text in the script preview to open the Cue Editor.
   - Snap start/end timestamps using the clock button or manual inputs.
   - Choose a cue category (Dialogue, Action, Camera, Shot, Audio, VFX, Transition, Environment).
   - Edit the selected cue text directly in-place using the monospace editor without touching raw JSON.
5. **Handle Overlaps** — Click overlapping highlights in the script to select specific cues via the Overlap Picker.
6. **Align Cues** — Click "Align" to automatically re-anchor highlights if script text changes; use "Find Alternative" to resolve duplicate phrase occurrences.
7. **Export** — Download a portable JSON project file via "Save Sync".

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause video |
| `←` Arrow Left | Rewind 5 seconds |
| `→` Arrow Right | Forward 5 seconds |

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