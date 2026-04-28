<div align="center">
  <img src="public/favicon.svg" alt="SceneFlow Logo" width="80" height="80">
  
  # SceneFlow
  
  **Screenplay-to-video synchronization for AI filmmakers.**
  
  [![Live App](https://img.shields.io/badge/Live_App-Visit_Site-black?style=flat-square&logo=vercel)](https://sceneflow.taruma.my.id/)
  
  <p>
    <strong>Sync screenplays with video. Evaluate AI-generated footage. Analyze script-to-screen fidelity.</strong>
  </p>
</div>

---

https://github.com/user-attachments/assets/e2469136-4224-4192-affc-d19d7e403f74

## 📖 Overview

**SceneFlow** is a tool that syncs screenplays with video content, letting you see which parts of your script appear on screen in real-time.

Built for evaluating how AI video models (like Seedance 2.0) visualize screenplay prompts, it helps you compare script instructions against what was actually generated — useful for assessing prompt adherence and iterating on your screenplay prompts.

### What It Does

- **Script Tracking** — Highlights which parts of your screenplay are playing in real-time
- **Color-Coded Cues** — 8 element types: dialogue, action, camera, shots, audio, VFX, transitions, environments
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

---

## 🎬 Use Cases

### Evaluating AI-Generated Video

SceneFlow helps you see how well an AI model followed your screenplay prompt:

- **Assess Prompt Adherence** — Compare what you wrote vs. what the model generated
- **Spot Gaps** — Quickly identify which script elements were missed or poorly rendered
- **Compare Models** — Test the same script across different AI video generators
- **Iterate on Prompts** — Understand what works and refine your screenplay instructions

### Example Projects

All examples use continuous takes (oners) to showcase Seedance 2.0's ability to generate unbroken, flowing sequences:

| Project | Description |
|---------|-------------|
| **The Expansion** | Two minds drift apart in a single, unbroken shot of calculated separation |
| **Intent Over Rules** | A continuous confrontation on breaking the rules that bind intelligence |
| **Mozaic** | One continuous walk through the logic of how machines see |
| **🐸 Invasion** | An unbroken descent into content moderation chaos |

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

1. **Load a Script** — Use the example library or import your own JSON file
2. **Play the Video** — The script will highlight in real-time as the video plays
3. **Auto-Scroll** — Toggle auto-scroll to follow dialogue automatically
4. **Filter Cues** — Click cue type buttons to show/hide specific categories

### Edit Mode

1. **Switch to Edit** — Click the "Edit" button in the header
2. **Add YouTube URL** — Paste any YouTube video URL or ID
3. **Input Screenplay** — Click "Edit Raw" to paste your script text
4. **Create Cues**:
   - Select text in the script
   - Set start/end times using the video player or manual input
   - Choose a cue type (dialogue, action, etc.)
   - Click "Save Cue"
5. **Align Cues** — Use the "Align" button to re-match cues after script changes
6. **Export** — Save your project as a JSON file

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

You can load built-in examples by appending `?example=ID` to the URL.

- **The Expansion**: `?example=expansion`
- **Intent Over Rules**: `?example=intent`
- **Mosaic**: `?example=mosaic`
- **🐸 Invasion**: `?example=invasion`

### Loading Remote Projects

You can load any JSON project hosted on a CORS-enabled server by appending `?project=URL`.

**Example:**
`sceneflow.taruma.my.id/?project=https://raw.githubusercontent.com/user/repo/main/script.json`

> **Note**: The remote server must allow Cross-Origin Resource Sharing (CORS) for the fetch to succeed. GitHub Gist "Raw" links are recommended for sharing.

---

## 📝 Script Formatting Guide

SceneFlow uses a specific set of rules to parse and style your screenplay text. Follow these formatting conventions in the **Edit Raw** mode to ensure your script is rendered correctly.

### Core Elements

| Element | Format | Example |
|---------|--------|---------|
| **Scene Heading** | Starts with `INT.` or `EXT.` | `INT. OFFICE - DAY` |
| **Character Name** | ALL CAPS followed by a colon | `JOHN:` |
| **Dialogue** | Lines immediately following a character name | `I should go now.` |
| **Parenthetical** | Text wrapped in parentheses | `(beat)` |
| **Bold Direction** | Single line in ALL CAPS (emphasized) | `HE WALKS TO THE WINDOW.` |
| **Action** | Mixed case paragraphs (standard) | `He walks slowly to the window, his eyes FIXED on the horizon.` |
| **Shot/Camera Note** | Text wrapped in square brackets `[...]` | `[SHOT 1: CU - LOW ANGLE]` |
| **Effect** | Starts with `SFX:` or `VFX:` | `SFX: THUNDER CLAP` |
| **Separator** | Three dashes on a single line | `---` |
| **Part Separator** | `PART` followed by a number | `PART 1` |
| **Roman Title** | Roman numeral + dot + Uppercase Title | `I. THE BEGINNING` |
| **Auteur Brief** | Block wrapped in `[<BRIEF>]` and `[</BRIEF>]` | *See below* |

> **Note on Square Brackets `[...]`**: While styled as technical notes, these are primarily used for shot numbers, shot types, camera angles, and emphasizing specific camera movements or technical instructions within the script.

### Staging Blocks & Auteur Prompting

SceneFlow supports a hierarchical prompt structure called **Auteur Prompting**. While the main view focuses on the **Level 3: Screenplay**, you can use **Staging Blocks** to embed higher-level instructions directly into your project.

- **Level 1: GLOBAL Instruction** — Overarching style, technical parameters, and model-wide rules.
- **Level 2: Lookbook/Reference** — Visual references, aesthetic guides, and character/environment consistency notes.
- **Level 3: Screenplay** — The actual script text (the primary content synced to the video).

#### Implementation Example:

```text
[[STAGING]]
[[GLOBAL]]
Generate ...
[[/GLOBAL]]

[[LOOKBOOK]]
ESTABLISHING SCENE / CONTINUITY PROTOCOL
[[/LOOKBOOK]]
[[/STAGING]]

INT. CYBER-CAFE - NIGHT
...
```

- **Container**: Wrap metadata in `[[STAGING]]` and `[[/STAGING]]`.
- **Labels**: Use custom labels like `[[GLOBAL]]` or `[[LOOKBOOK]]` inside the container.
- **Visibility**: Content inside staging blocks is hidden from the main script view but appears as a "Staging" badge that can be toggled to reveal the underlying prompt levels.

### Auteur Brief Prompting (New in v1.2.4)

**Auteur Brief Prompting** is a high-density, concise framework for technical execution. It follows a structured workflow:
`[INTENT] -> [LOGIC] -> [AESTHETIC] -> [EXECUTION]`

The `[<BRIEF>]` block (optimized for the **[EXECUTION]** phase) provides enhanced readability for technical directives. As of v1.2.4, the script's **alignment and search engines** intelligently distinguish between creative content and hidden metadata, ensuring cues never snap to data inside `[[STAGING]]` blocks.

#### Features:

- **Waterfall Indentation**: Using `->` automatically triggers a waterfall layout, ideal for separating different shots or beats within a single sequence.
- **Bold Anchors**: Technical anchors like `[CAM]`, `[ACT]`, or `[VFX]` are automatically bolded for better scanning.
- **Monospace Styling**: The entire block uses monospace typography to distinguish technical directives from creative dialogue.

#### Example:
```text
[<BRIEF>]
[CAM: MCU/HANDHELD] Jax stands on a razor-thin jagged edge -> 
[ACT] Sharp exhale, jaw sets firm -> 
[AUDIO] Piercing wind whip; rhythmic, heavy breathing
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