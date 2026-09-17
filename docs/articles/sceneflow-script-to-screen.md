---
title: "Introducing SceneFlow: Script-to-Screen Synchronization"
subtitle: "An interactive web tool for real-time prompt tracking, cue alignment, and synchronized video playback."
author: "Taruma Sakti"
date: "2026-08-28"
source: "https://taruma.substack.com/p/sceneflow-script-to-screen"
publication: "Grounded Hallucinations"
---

# Introducing SceneFlow: Script-to-Screen Synchronization

> **Subtitle:** An interactive web tool for real-time prompt tracking, cue alignment, and synchronized video playback.  
> **Author:** Taruma Sakti  
> **Date:** August 28, 2026  
> **Publication:** [Grounded Hallucinations](https://taruma.substack.com)  
> **Original Article:** [https://taruma.substack.com/p/sceneflow-script-to-screen](https://taruma.substack.com/p/sceneflow-script-to-screen)

---

<!-- ========================================== -->
<!-- MEDIA: Image 1 (Hero Banner)               -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Hero Header Banner**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/26a653d3-8e80-4840-bdda-8c50128392f6_2400x1260.png`  
> **Description:** A modern, high-resolution header graphic (2400x1260) featuring dark aesthetics with emerald and vibrant accent highlights. Displays the bold title **"SCENEFLOW: Script-to-Screen Synchronization"** along with preview interface mockups showing a video playback player on the left and a color-coded synchronized screenplay script pane on the right.

---

As generative AI video models continue to evolve, turning descriptive written prompts into video is faster than ever. But as prompts become more detailed and multi-layered, a practical challenge quickly comes up: **how do you actually check what the model followed versus what it missed?**

Currently, comparing your prompt to the video is a tedious manual chore. You have your prompt open in a text editor and your video in a separate player. To see if a specific camera move, dialogue line, or lighting change landed at the right second, you are constantly pausing, switching windows, and scrubbing back and forth.

To solve this disconnect, I built **[SceneFlow](https://sceneflow.taruma.my.id)**—a web tool that puts your script and video side-by-side in synchronized real-time playback.

---

<!-- ========================================== -->
<!-- MEDIA: Image 2 (Split-Screen Flow Diagram)  -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Split-Screen Flow Diagram**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/6fb33b83-2d76-41da-af32-6bf1bc386255_1386x310.png`  
> **Description:** A clean horizontal concept diagram (1386x310) illustrating the dual-pane architecture of SceneFlow: showing the **Video Player** panel on the left connected across a central timeline/sync mechanism to the **Script & Cues** reader on the right, symbolizing the bridge between written prompt directives and on-screen cinematic execution.

---

SceneFlow puts the video player on the left and your script on the right, locked in synchronized playback. As the video plays, the text highlights line by line, auto-scrolls along with the scene, and shows which prompt elements are active on screen at each moment.

---

<!-- ========================================== -->
<!-- MEDIA: Video 1 (Synchronized Playback Demo) -->
<!-- ========================================== -->
> 🎬 **Video Placeholder: SceneFlow Synchronized Playback Demo**  
> **Embed Reference ID:** `media-b2f62632-bf4e-47c7-af54-286961792269`  
> **Caption:** *SceneFlow Synchronized Playback Demo*  
> **Description:** Video demonstration showcasing synchronized playback in real time. On the left side, an AI-generated video clip plays smoothly. On the right, the formatted screenplay text auto-scrolls in lockstep, with active prompt cues illuminating line-by-line with their corresponding category highlight colors. The floating Active Highlights card panel simultaneously displays the active cues at the exact current timecode.

---

---

## Synchronized Playback: Seeing Your Prompt on Screen

When you load a project and press play, the video and text move together in real time.

---

<!-- ========================================== -->
<!-- MEDIA: Image 3 (Full Workspace Screenshot) -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Full Workspace Interface**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/7eb9858e-945f-438c-87dc-b2946def80ae_1920x1032.png`  
> **Description:** Full-screen desktop screenshot (1920x1032) of SceneFlow in dark mode during synchronized playback. Shows the top header bar with navigation, project library selection, playback controls, and paper styling options; the left half showing the video player with transport scrubbing controls; the right half showing the screenplay viewer with active highlighted text lines; and the floating Active Highlights sidebar on the right edge.

---

### The 8-Category Color Spectrum

To help visually organize what is happening in the scene, SceneFlow highlights prompt instructions using eight distinct color categories:

- 🟡 **Dialogue** — Character speech, voiceovers, and whisper lines.
- 🔵 **Action** — Physical movements, character interactions, and gestures.
- 🟢 **Camera** — Dolly shots, pans, tilts, crane moves, and tracking arcs.
- 🟣 **Shot** — Framing scale (wide shots, close-ups, medium shots, over-the-shoulder).
- 🟠 **Audio** — Foley, background music shifts, ambient sound, and sound effects.
- 🔷 **VFX** — CGI elements, magical effects, and visual transformations.
- 🩷 **Transition** — Scene cuts, dissolves, fades, and pacing transitions.
- ⚪ **Environment** — Lighting shifts, weather dynamics, and atmosphere.

As the timeline progresses, active lines smoothly light up, giving you immediate visual confirmation of what the video is currently rendering.

### Active Highlights Live Panel

On desktop screens, SceneFlow includes an **Active Highlights** sidebar that displays dedicated cards for every cue active at that exact timestamp—complete with timing, category labels, and the exact text snippet.

---

<!-- ========================================== -->
<!-- MEDIA: Image 4 (Active Highlights Sidebar) -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Active Highlights Live Panel**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/84be21ef-f275-467b-b346-b0eed4e54f36_903x666.png`  
> **Description:** Close-up UI crop (903x666) focusing on the Active Highlights live panel on the right side of the screen. Shows stacked active cue cards with colored category badges (e.g., green for `CAM`, yellow for `DIALOGUE`, blue for `ACTION`), precise millisecond timestamps (e.g., `00:01.200 - 00:03.500`), and verbatim prompt excerpts being executed at that moment.

---

---

## Flexible Script Layouts & Staging Directives

SceneFlow supports multiple ways of structuring your prompts. *(Note: Rather than strictly mimicking rigid, paper-based screenplay margins, the layout is specifically adapted for effortless digital reading and side-by-side tracking).*

---

<!-- ========================================== -->
<!-- MEDIA: Image 5 (Screenplay Layout Overview) -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Adapted Screenplay Layout Overview**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/91b8e947-96c2-46df-b248-5c00da163adb_1186x574.png`  
> **Description:** Screenshot (1186x574) of the screenplay reader layout, showing how standard screenplay syntax (`EXT. OLD GROWTH FOREST - DAWN`, character cues, parentheticals, and action paragraphs) is typeset with clean margins and modern typography optimized for digital screens and side-by-side tracking.

---

### Adapted Screenplay Layout

If you write in screenplay style, SceneFlow automatically parses scene headings (`INT./EXT.`), character names, dialogue, parentheticals, and action lines—styling them for clean, distraction-free screen reading.

---

<!-- ========================================== -->
<!-- MEDIA: Image 6 (Screenplay Styling Detail)  -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Screenplay Parsing & Dialogue Styling**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/d6b048e9-106e-4c77-b12c-15f7d8e6a4a6_872x645.png`  
> **Description:** Close-up view (872x645) highlighting screenplay elements in SceneFlow. Demonstrates centered uppercase character cues, indented dialogue blocks with active yellow dialogue highlights, parenthetical direction lines, and action descriptions rendered cleanly.

---

### State-Driven Brief Blocks (`[<BRIEF>]`)

If you write prompts as chained state changes using arrows (`->`), wrapping them in `[<BRIEF>]` automatically formats them with clean waterfall indentation and bolded tags like `[CAM]` and `[ACT]`.

---

<!-- ========================================== -->
<!-- MEDIA: Image 7 (Waterfall State-Driven Brief)-->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Waterfall Indentation for [<BRIEF>] Blocks**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/055a65b4-762d-42c1-bc76-9725ac88fd4c_565x550.png`  
> **Description:** Screenshot (565x550) showcasing a state-driven prompt formatted inside a `[<BRIEF>]` block. Chained transitions (`->`) are rendered as cascading waterfall steps, with sub-state tags such as `[CAM]`, `[ACT]`, and `[AUDIO]` bolded and illuminated with category highlight colors during active playback.

---

### Concealed Staging Directives (`[[STAGING]]`)

Setup notes, guardrails, or aesthetic rules wrapped in double brackets (like `[[INTENT]]`, `[[LOGIC]]`, or `[[AESTHETIC]]`) are tucked away into an interactive **STAGING** badge so your reading view stays clean. Clicking the badge opens a quick inspector popup to review the details anytime.

---

<!-- ========================================== -->
<!-- MEDIA: Video 2 (Concealed Staging Directives)-->
<!-- ========================================== -->
> 🎬 **Video Placeholder: Concealed Staging Directives Demo**  
> **Embed Reference ID:** `media-febb0aa4-9528-4ba9-abd6-6a88d1c8297c`  
> **Description:** Short video recording demonstrating the interactive staging badge behavior. Shows the user clicking the compact `[[STAGING]]` pill badges (`INTENT`, `LOGIC`, `AESTHETIC`, `OPENING`) at the top of the script viewer to open an overlay inspector popup displaying the director's notes and model constraints, and then dismissing it back to the clean script view.

---

## Reading & Workspace Controls

SceneFlow includes flexible layout controls to tailor the script view and video player to your workflow:

- **Script Paper Styles**: Switch between 6 visual paper presets (*Studio Crisp*, *Warm Parchment*, *Retro Newsprint*, *Midnight Slate*, *OLED Blackout*, and *Cyber Matrix*). This is especially useful when screen-recording or creating video overlays where dark or stylized backgrounds blend better.
- **Adjustable Column Widths**: Choose between 5 column widths from **Narrow (384px)** to **Expanded (1024px)**.
- **Scroll Focus Position**: Choose where active lines settle during auto-scrolling—**Top (35%)**, **Center (50%)**, or **Bottom (65%)**.
- **Focus Modes**: Select which cue categories trigger auto-scrolling (e.g., track *only Dialogue* or *all cues*).
- **Video Scaler**: Dynamically resize the desktop video preview from 40% to 100% width.

---

<!-- ========================================== -->
<!-- MEDIA: Video 3 (Reading & Workspace Controls)-->
<!-- ========================================== -->
> 🎬 **Video Placeholder: Reading & Workspace Controls Demo**  
> **Embed Reference ID:** `media-a1ba68e7-91a0-45dc-bcf3-570868dfb15a`  
> **Description:** Screen recording demonstrating workspace customization: the user dynamically changes paper presets (cycling through light paper, vintage newsprint, dark slate, OLED black, and green matrix terminal styles), adjusts reading column width sliders, adjusts scroll focus settling anchors, and toggles video player width scaling between 40% and 100%.

---

## Built-In Editor & Cue Alignment

If you want to sync your own video with a prompt or screenplay, SceneFlow provides a full Edit Mode directly in the browser.

---

<!-- ========================================== -->
<!-- MEDIA: Video 4 (Built-In Editor & Cue Alignment)-->
<!-- ========================================== -->
> 🎬 **Video Placeholder: Built-In Editor & Cue Alignment Demo**  
> **Embed Reference ID:** `media-32be9f55-ad75-460e-9380-05333a90d0b5`  
> **Description:** Video demonstration of SceneFlow's in-browser sync editor. Demonstrates selecting text in the script to generate new cue entries, pressing the clock icon to snap start/end timestamps directly to the video playhead, searching and selecting alternative occurrences with "Find Alternative", performing automatic re-alignment (`realignCues`), and resolving overlapping cues with the floating Overlap Picker.

---

- **In-Place Cue Editor**: Highlight any text in the script to create a cue, or edit cue text directly in the panel without touching raw JSON data.
- **One-Click Timestamps**: Snap start and end times to the current video position using the clock button.
- **Alternative Phrase Finder**: If a phrase appears multiple times in your script, use “Find Alternative” to quickly pick the right location.
- **Automatic Alignment (`realignCues`)**: When you edit or paste updated text, click “Align” to automatically re-anchor existing cues to the new text positions.
- **Overlap Handling**: View and select overlapping cues easily using the floating Overlap Picker.

> 💡 **How Are Cues Created?**  
> SceneFlow is a playback and alignment engine—it does not automatically detect timestamps from raw video files. To build a synced project, you can either:
> 1. **Tag manually** using the built-in editor and one-click timestamp buttons.
> 2. **Use Multimodal AI (e.g. Google Gemini)** to analyze your video footage against your script/prompt and output the structured cue JSON automatically.
> 
> *(A dedicated, step-by-step tutorial on generating cue syncs using Multimodal AI will be published in a separate article!)*

*Thanks for reading Grounded Hallucinations! Subscribe for free to receive new posts and support my work.*

---

## Built-In Catalogue & Easy Sharing

SceneFlow includes an interactive **Library Catalogue** with over 30 complete examples across four collections.

---

<!-- ========================================== -->
<!-- MEDIA: Video 5 (Library Catalogue Navigation)-->
<!-- ========================================== -->
> 🎬 **Video Placeholder: Library Catalogue Navigation Demo**  
> **Embed Reference ID:** `media-2bd278fc-1ea0-4e3d-992f-9127285fc637`  
> **Description:** Video recording showcasing the Library Catalogue modal in SceneFlow. Demonstrates browsing across the four featured collections, previewing project cards with cover images and cue statistics, and loading a selected scene into the player with a single click.

---

1. **AI Scenes** — Character and dialogue-driven scenes (*Frequency Over Force*, *Museum*, *Entropy*).
2. **The Written Motion Anthology** — Multi-part series (*Wonder*, *What We Leave*).
3. **FRAME Series** — Atmospheric and visual pieces (*Old Growth*, *Samsara*).
4. **AI Clips** — Short-form prompt execution vignettes.

→ Browse the full index in the **[SceneFlow Catalogue on GitHub](https://github.com/taruma/SceneFlow/blob/main/SCENEFLOW_CATALOGUE.md)**.

### Instant Sharing & Export

- **Share Examples**: Share any built-in example with a single URL (e.g., `sceneflow.taruma.my.id/?example=twm_vol7`).
- **Share Custom Projects**: Load remote JSON files directly via `?project=URL`.
- **Export & Import**: Download your synced project as a portable JSON file anytime using “Save Sync”.

---

## Lightweight & Cross-Device

SceneFlow runs entirely in your browser with no installation, account creation, or setup required:

- **Desktop Keyboard Shortcuts**: Spacebar to Play/Pause, `←`/`→` arrows to rewind or fast-forward 5 seconds.
- **Interactive In-App Guide**: Click the `+Guide` button in the top navigation bar anytime to open an interactive walkthrough.

---

<!-- ========================================== -->
<!-- MEDIA: Video 6 (Cross-Device & In-App Guide) -->
<!-- ========================================== -->
> 🎬 **Video Placeholder: Cross-Device Features & In-App Guide**  
> **Embed Reference ID:** `media-ec84358a-c181-4d96-89b0-6a5dff29b68b`  
> **Description:** Video showing cross-device usability and onboard help. Shows launching the step-by-step interactive onboarding guide via the top `+Guide` button, demonstrating keyboard navigation shortcuts, and transitioning to a mobile viewport with a bottom-sheet drawer for searching and selecting catalogue scenes.

---

- **Mobile-Friendly Drawer**: Touch-optimized bottom-sheet drawer for browsing the catalogue on phones and tablets.
- **PWA-Ready**: Installable as a standalone app on your home screen or desktop.
- **Complete Documentation**: Detailed usage instructions, schema specs, and keyboard shortcuts are documented in the **[GitHub README](https://github.com/taruma/SceneFlow#readme)**.

---

## Inside the Catalogue: The “Auteur Script” Style

When you browse through the built-in catalogue examples (such as *The Written Motion* anthology or *AI Scenes*), you will notice that many prompts follow a structured format rather than standard conversational text. This comes from my personal prompting framework: the **“Auteur Script”**.

### The Origin of "Auteur Script"

I feel like I’ve been carrying a debt. Many of you have asked about my current prompting style, which I now call the Auteur Script. It is finally time to share where this idea came from.

The core philosophy is **boundaries, not handcuffs**. Today’s reasoning video models perform best when given clear intent and spatial boundaries, while leaving room for the model’s reasoning layer to calculate natural physics and smooth motion.

An Auteur Script structures each scene into a 5-part scaffold:

1. `[INTENT]` — The overarching vision, tone, and emotional goal.
2. `[LOGIC]` — Essential guardrails for the model’s visual planning (spatial continuity, prop tracking, axis rules).
3. `[AESTHETIC]` — Master reference for lighting, palette, wardrobe, and location.
4. `[OPENING]` — The composed first-frame anchor establishing initial geography and blocking.
5. `[EXECUTION]` — A timeline of state transitions chained with `->` and modular tags (`[CAM]`, `[ACT]`, `[AUDIO]`):

When you play these examples in SceneFlow, you can watch how each state transition maps directly to the rendered video, demonstrating how structured intent translates into cinema.

---

<!-- ========================================== -->
<!-- MEDIA: Image 8 (Auteur Script Scaffold)    -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: The 5-Part Auteur Script Scaffold**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/00f48e8e-8174-4ec9-8063-aa17a3bd590c_553x420.png`  
> **Description:** Architectural breakdown diagram (553x420) illustrating the 5 structured layers of an Auteur Script: `[INTENT]` (tone & emotion), `[LOGIC]` (physical guardrails), `[AESTHETIC]` (visual direction), `[OPENING]` (starting frame anchor), and `[EXECUTION]` (chained state timeline).

---

### “Is This the Exact Prompt You Used?” (SceneFlow vs. Raw Input)

A common question when viewing the catalogue is whether SceneFlow displays a simplified mockup or the *actual* prompt sent to the AI generator.

**Unless stated otherwise, the text displayed in SceneFlow is 100% the exact raw input prompt fed into the video model.**

---

<!-- ========================================== -->
<!-- MEDIA: Image 9 (Raw Prompt vs. SceneFlow)  -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Raw Prompt vs. SceneFlow Parsed View**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/1d731b88-3804-498e-abef-ac0e86a9ac87_4456x2804.png`  
> **Description:** Comprehensive comparison graphic (4456x2804) displaying raw AI prompt input on the left versus the parsed SceneFlow interface on the right. Demonstrates how plain text blocks seamlessly map into top STAGING pill buttons and how arrow-chained execution text turns into readable waterfall state lines without modifying the prompt text itself.

---

The only difference between what you type into an AI generator and how a SceneFlow project is structured comes down to visual parsing:

- **The Staging Section (`[INTENT]`, `[LOGIC]`, `[AESTHETIC]`, `[OPENING]`)**: In your actual prompt, you simply write these as plain text blocks. Inside a SceneFlow project file, they are wrapped with `[[STAGING]]...[[/STAGING]]` and `[[LABEL]]...[[/LABEL]]` tags purely so the app can tuck them away into the top interactive pill badges (`INTENT`, `LOGIC`, `AESTHETIC`, `OPENING`) for easy inspection without cluttering the reading view.
- **The Execution Timeline (`[EXECUTION]` ➔ `[<BRIEF>]`)**: In your raw prompt, each Macro-State is written as a single line chained with `->`. In SceneFlow, the `[<BRIEF>]` block corresponds exclusively to the `[EXECUTION]` block of an Auteur Script. Wrapping it in `[<BRIEF>]` tells SceneFlow to format each Macro-State with **waterfall indentation**, making it effortless to track individual Sub-States (`[CAM]`, `[ACT]`, `[AUDIO]`) as they light up in real time.

You don’t need any special markup when writing prompts for AI models—the extra tags in SceneFlow exist solely to make viewing, inspecting, and following the script side-by-side with video seamless.

→ **Read more**: Dive deeper into the methodology and breakdown in the **[From Code to Cinema](https://taruma.substack.com/t/from-code-to-cinema)** [series on Substack](https://taruma.substack.com/t/from-code-to-cinema).

---

## Who is SceneFlow For?

Whether you are crafting multi-layered generative video prompts or studying screenplays, SceneFlow fits naturally into a few core workflows:

- **AI Filmmakers & Prompt Engineers** — Verify prompt fidelity in seconds. Spot whether the video model executed specific camera moves, actor choreography, lighting transitions, or sound cues without scrubbing back and forth.
- **Writers & Directors** — Review scene pacing and dialogue timing side-by-side with footage to see how written beats translate into visual rhythm.
- **Students & Film Enthusiasts** — Experience scripts interactively alongside final scenes, making it a great way to study screenwriting, blocking, and cinematic structure.

---

## Try SceneFlow Today

SceneFlow is open-source, free to use, and available in your browser:

- 🌐 **Live App**: [sceneflow.taruma.my.id](https://sceneflow.taruma.my.id/) *(Click `+Guide` for the in-app tour!)*
- 💻 **GitHub Repository & Usage**: [github.com/taruma/SceneFlow](https://github.com/taruma/SceneFlow#readme)
- 📖 **Full Catalogue**: [SceneFlow Catalogue](https://github.com/taruma/SceneFlow/blob/main/SCENEFLOW_CATALOGUE.md)
- ✍️ **Substack Articles**: [From Code to Cinema](https://taruma.substack.com/t/from-code-to-cinema)
- ☕ **Support**: [ko-fi.com/tarumainfo](https://ko-fi.com/tarumainfo)
- 💬 **Connect on X**: [@tarumainfo](https://x.com/tarumainfo)

Pick a script from the catalogue, press spacebar, and see your prompt synchronized with the screen.
