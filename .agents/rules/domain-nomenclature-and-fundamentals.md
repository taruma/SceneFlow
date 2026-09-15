---
description: Core domain fundamentals of SceneFlow as a Script-to-Video Synchronization Studio, canonical "Script" nomenclature invariants, and scaffold vs. execution architecture.
---

# Domain Nomenclature & SceneFlow Fundamentals

This document formalizes the canonical terminology, core architectural fundamentals, and structural domain invariants of SceneFlow. All AI agents and developers working on this codebase must strictly adhere to these principles.

---

## 1. Domain Nomenclature: "Script" as Canonical Standard

### The Principle
Across all user interface copy, dialog titles, button labels, tooltips, documentation, and source code comments, **the canonical noun is "Script"**.

- **Why "Script" Over "Screenplay"**:
  While the repository was historically named `Screenplay-Sync`, SceneFlow's creative scope extends far beyond traditional Hollywood 3-act film manuscripts. It is a modern studio designed for:
  - **Auteur Scripts** and director prompt blueprints.
  - **Generative AI Video Prompts** with multi-dimensional parameter blocks.
  - **Directorial Staging Scaffolds** (`[[STAGING]]`).
  - **State-Transition Execution Briefs** (`[<BRIEF>]`).
  - **Shot Lists, Beat Sheets, and High-Density Audio-Visual Vignettes**.
  The word "Script" accurately and cleanly encompasses this full creative spectrum.

### Terminology Invariants
| Concept | Standard Canonical Term | Avoid (Deprecated / Legacy) |
| :--- | :--- | :--- |
| **Reading Workspace** | `Script Preview` | `Screenplay Preview` |
| **Authoring Workspace** | `Script Editor` | `Screenplay Editor` |
| **Typography & Colors** | `Script Paper & Colors` | `Screenplay Colors` / `Paper Settings` |
| **Reading Width** | `Script Width` | `Screenplay Width` |
| **Parsed Line Item** | `ScriptLine` / `Script Line` | `ScreenplayLine` |
| **Parser Utility** | `scriptParser.ts` / `scriptProcessor.ts` | `screenplayParser.ts` |
| **Core Hooks** | `useScriptTheme`, `useScriptPreferences`, `useScriptStorage` | `useScreenplayTheme` |

> [!NOTE]
> **Strict Legacy Exceptions**:
> "Screenplay" is retained strictly in two specific contexts:
> 1. The backward-compatible local storage key: `'screenplay_sync_state'`.
> 2. Historical references when explicitly discussing classic Hollywood script formatting in built-in examples (e.g. *The Written Motion*).

---

## 2. Core Fundamentals of SceneFlow

SceneFlow is not a generic video player with subtitles. It is a **dedicated Studio for Script-to-Video Synchronization and AI Prompt Adherence Analysis**.

Its architecture is built upon three foundational pillars:

### Pillar 1: Temporal-Spatial Anchoring (Sync Cues)
- The script is not a passive reading document—it is an interactive temporal map.
- **Sync Cues** bind exact character offsets (`startIndex`, `endIndex`) in the written script text to millisecond timestamps (`startTime`, `endTime`) in the media playback.
- Cues are categorized into **8 canonical cinematic dimensions**, each theme-calibrated across Light, Warm, Dark, and CVD-safe accessibility profiles:
  1. 🟡 **Dialogue**: Spoken character dialogue (Amber Gold).
  2. 🔵 **Action**: Physical character movement and blocking (Royal Cobalt Blue).
  3. 🟢 **Camera**: Lens choice, framing, and camera motion (Emerald Green).
  4. 🟣 **Shot**: Scale classifications (CU, WIDE, OTS, ESTABLISHING) (Deep Iris / Wine).
  5. 🟠 **Audio**: Foley, sound effects, ambience, and score (Bright Amber Orange).
  6. 🔷 **VFX**: Visual effects, CGI, and generative model directives (Electric Aqua).
  7. 🌹 **Transition**: Cuts, dissolves, pacing shifts, and transitions (Crimson Rose).
  8. ⚪ **Environment**: Lighting setups, weather conditions, and world state (Steel Slate).

### Pillar 2: Directorial Scaffold vs. Active Execution Separation
SceneFlow strictly enforces a dual-layer script architecture:
1. **The Directorial Scaffold (`[[STAGING]]`)**:
   - Represents the foundational setup layer (parts 1–4 of the Auteur Script framework):
     - `[[INTENT]]`: Directorial vision, subtext, and emotional resonance.
     - `[[LOGIC]]`: Continuity guardrails, 180° spatial rules, object permanence.
     - `[[AESTHETIC]]`: Audio-visual reference world (palette, lighting, location).
     - `[[OPENING]]`: First-frame baseline coordinate anchor ($S_0$).
   - **Visual Invariant**: Non-temporal directives inside `[[STAGING]]` blocks are hidden from the primary reading canvas to avoid visual clutter. They are surfaced via interactive line badges (`STAGING: LABEL`) and inspected in a dedicated monospace modal.
   - **Search Exclusion**: Text ranges inside `[[STAGING]]` blocks are strictly excluded from proximity alignment (`realignCues`) and cue occurrence searches.
2. **The Active Execution Timeline (`[<BRIEF>]` & Sync Cues)**:
   - Represents the active, time-bound prompt pipeline (part 5 of the framework).
   - Features waterfall indentation (`->` beat cascades) and bold dimension anchors (`[CAM]`, `[ACT]`, `[AUDIO]`).
   - Drives real-time video synchronization, highlight fading, and multi-track timeline visualization.

### Pillar 3: Dual Workflow Paradigms (Playback vs. Edit)
SceneFlow features two purpose-built desktop modes:
- **Playback Mode (Review & Analysis)**:
  - Designed for evaluating AI video model fidelity and prompt adherence.
  - Multi-track horizontal NLE timeline (`HighlightTimelineView`) with stationary 35% anticipation playhead and continuous sub-frame clock extrapolation (`useSmoothTimelineTime`).
  - High-refresh auto-scrolling (`useAutoScroll`) with user-configurable focus anchor lines (35% Top, 50% Center, 65% Bottom).
  - One-click video collapse (<kbd>V</kbd>) with zero-height background audio continuity for screen recording clean timeline overlays.
- **Edit Mode (Authoring & Synchronization)**:
  - Desktop-only two-tier studio workspace (`EditLeftPanel` & `SyncCuesPanel`).
  - Precision timecode capture (`MM:SS.s`), interactive text adjustment, and duplicate occurrence finding.
  - Chronological proximity realignment (`realignCues`) and non-destructive JSON synchronization (`[ { } JSON ]`).
  - Cross-panel synchronized jump: clicking any cue card seeks the video player, populates the editor form, and smoothly scrolls the script canvas to center the target line.
