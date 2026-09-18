---
title: "SceneFlow: Introducing the Multi-Track Timeline and Studio Workspace"
subtitle: "Moving from floating cards to a horizontal timeline, making cue editing less painful, and sharing recent experiments."
author: "Taruma Sakti"
date: "2026-09-17"
source: "https://taruma.substack.com/p/sceneflow-timeline"
publication: "Grounded Hallucinations"
---

# SceneFlow: Introducing the Multi-Track Timeline and Studio Workspace

> **Subtitle:** Moving from floating cards to a horizontal timeline, making cue editing less painful, and sharing recent experiments.  
> **Author:** Taruma Sakti  
> **Date:** September 17, 2026  
> **Publication:** [Grounded Hallucinations](https://taruma.substack.com)  
> **Original Article:** [https://taruma.substack.com/p/sceneflow-timeline](https://taruma.substack.com/p/sceneflow-timeline)

---

<!-- ========================================== -->
<!-- MEDIA: Image 1 (Hero Banner)               -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Hero Header Banner**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/sceneflow-timeline-hero.png`  
> **Description:** Clean desktop banner showing SceneFlow's interface: the video player and horizontal multi-track timeline on the left, the screenplay text in the center, and the cue editor on the right, with dark mode aesthetics and colorful category badges.

---

If you read my [previous article introducing SceneFlow](https://taruma.substack.com/p/sceneflow-script-to-screen), you already know the core premise: it puts AI-generated video and screenplay prompts side-by-side, synchronizing text highlights as the video plays.

After posting about it on X, the most common response was people asking for a tutorial—along with one big question that kept coming up:

### A Quick Clarification on How Cues Work

People often asked: *“Can I just drop in a video link and have SceneFlow automatically generate the script and timing cues for me?”*

No, it doesn't do that. SceneFlow is not an AI web app that generates video or prompts on its own. It’s an interactive player for aligning and reviewing existing prompts against footage. You bring your video and your prompt, and use SceneFlow to see where things land, check what the model actually followed, and adjust the timing.

To create the cues, you have two options:
1. **Tag them manually** in the editor using the one-click timecode buttons.
2. **Use a multimodal model (like Google Gemini)** to draft timestamps from your video and script. To make this easier, SceneFlow now includes a built-in **Sync Prompt & Schema** tab right inside the cues window. You can copy the prompt and schema with one click, run it in Google AI Studio, and paste the generated JSON straight into SceneFlow.

While this post isn't a step-by-step tutorial, I hope that gives a lot more clarity on what the tool actually does.

Once you have your project loaded, however, using the earlier version revealed two obvious friction points:
1. **During playback**, the floating cards in the sidebar didn't feel meaningful or useful. In busy scenes, cards just cluttered the screen and vanished before you could read them.
2. **During editing**, tweaking a cue was clumsy—and switching modes kept resetting the video back to `0:00`.

In the past week, I rebuilt these two core areas. Here is what changed and why.

---

## 1. The Multi-Track Timeline (Playback Mode)

In the first version, active cues popped up as floating cards in a vertical sidebar. If a scene only had one or two dialogue lines, that worked fine. But in actual scenes, sound effects, camera moves, and character actions often happen at the exact same second. A vertical stack meant cards were constantly competing for space, jumping around, and cluttering the view. 

Scenes aren't sequential lists; they're parallel. So instead of a vertical card stack, I organized cues onto **horizontal tracks**, similar to an audio editor or a video timeline.

---

<!-- ========================================== -->
<!-- MEDIA: Image 2 (Timeline in Action)        -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: Multi-Track Timeline in Action**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/sceneflow-timeline-in-action.png`  
> **Description:** Full-width screenshot showing the multi-track timeline docked below the video player. Displays horizontal parallel tracks (Dialogue, Action, Camera, Audio), the 3-button zoom presets (4s, 8s, 16s), and category filter buttons.

---

Here are the three main features of the new timeline:

- **Parallel Category Tracks**: Cues are split into dedicated horizontal lanes by category (Dialogue, Action, Camera, Audio, VFX, etc.). When a camera move coincides with ambient sound and dialogue, each event glides along its own track without colliding or pushing other elements out of the way.
- **Category Filters**: You can mute or isolate specific categories directly from the timeline header. If you only want to focus on camera choreography or check dialogue timing, you can filter out the noise in one click.
- **Zoom Presets (`4s` | `8s` | `16s`)**: You can quickly switch between three calibrated time windows: a tight 4-second view for fast dialogue, an 8-second standard view, or a 16-second overview to see the general pacing across the whole scene.

---

## 2. Making Edit Mode Less Painful

The new timeline made watching scenes much calmer and easier to follow. But watching was only half the equation. The moment you spotted a cue that was mistimed and tried to fix it, you hit the second big headache: the editor.

In earlier versions, editing cues was frustrating. Worst of all: clicking "Edit" reloaded the video player, cutting your audio and kicking you back to `0:00`. If you spent a minute hunting for an exact timestamp, having it reset was maddening.

To fix this, I rebuilt Edit Mode into a dedicated **3-panel workspace**:

---

<!-- ========================================== -->
<!-- MEDIA: Image 3 (3-Panel Edit Workstation)   -->
<!-- ========================================== -->
> 🖼️ **Image Placeholder: 3-Panel Edit Workstation**  
> **Original URL:** `https://substack-post-media.s3.amazonaws.com/public/images/sceneflow-edit-mode-workspace.png`  
> **Description:** Screenshot of desktop Edit Mode showing the 3-panel layout: Video preview and time-clustered cues on the left, script canvas in the center, and the Cue Inspector on the right with timing steppers and loop controls.

---

### What Changed in the Editing Flow:

1. **No More 0:00 Resets**: The video player is now shared between Playback and Edit modes. You can flip between them instantly without losing your timestamp or cutting audio.
2. **Timing Steppers & Loop Preview**:
   - The Cue Inspector has `-0.1s`, `+0.1s`, `-0.5s`, and `+0.5s` nudge buttons next to the start and end times.
   - A **Loop** button repeats the selected cue continuously. As you nudge the timing buttons, the loop boundaries update live while it plays, so you can adjust by ear until the cut feels right.
3. **Time-Clustered Cue Grid**:
   - Instead of an endless vertical list, cues close to each other are grouped under sticky timecode headers (`⏱ 00:00.0 – 00:04.5`).
   - Short camera or sound beats show up as compact mini tiles, while dialogue gets wider cards so spoken lines aren't cut off.

---

## 3. Script Editing & Daily Polish

With playback and cue timing sorted out, there was still one missing link: the script itself. If you needed to tweak prompt text, fix typos, or navigate a longer multi-scene script, working in a plain text field felt limiting.

The latest updates bring a revamped script editor and several daily quality-of-life improvements:

- **Studio Script Editor**: Opening the script editor now gives you a 3-panel view with:
  - An **automatic outline** on the left to jump directly to scenes, acts, or directives.
  - **Word wrap that respects line numbers**: wrapped lines no longer push line numbers out of alignment.
  - A **formatting guide** on the right with 1-click copy/insert snippets and live visual preview badges for screenplay elements and prompt tags.
- **Shortcuts Cheat-Sheet (<kbd>?</kbd>)**: Pressing <kbd>?</kbd> (<kbd>Shift+/</kbd>) opens a searchable list of keyboard shortcuts (<kbd>Space</kbd> to play, <kbd>V</kbd> to hide video, <kbd>Shift+R</kbd> to reset panel widths).
- **Snappier Load Times**: I trimmed the initial bundle size and smoothed out theme switching, making the app feel significantly lighter.

---

<!-- ========================================== -->
<!-- MEDIA: Image/Video 4 (Studio Script Editor) -->
<!-- ========================================== -->
> 🖼️ **Image/Video Placeholder: Studio Script Editor**  
> **Original URL / Embed ID:** `https://substack-post-media.s3.amazonaws.com/public/images/sceneflow-script-editor-modal.png`  
> **Description:** Screenshot or short video showing the Studio Script Editor: clicking outline sections on the left to jump directly to scenes, editing text with word-wrap keeping line numbers aligned, and inserting tags from the formatting guide on the right.

---

## Built Around the "Auteur Script" (And What's Next)

If some of SceneFlow's layout feels unconventional, that's because it was built specifically around the **Auteur Script**—my ongoing experiment in structuring AI video prompts. The next article will focus entirely on how that works.

The core idea is to give reasoning video models clear structural guardrails (intent, physics/logic rules, visual world) while chaining the actual timeline beats with arrows (`->`). SceneFlow has evolved directly alongside that workflow.

---

## Just an Experiment, Still Learning

SceneFlow is still very much my personal sandbox for making sense of generative video. Prompting today can feel messy—you generate a clip, squint at the video, and scrub around trying to see if the model actually listened. These updates are just my attempt to make that process feel a bit more tactile and visual.

If you're making AI scenes or working with scripts, I'd love for you to try it out and see if it fits into your workflow.

---

## Support the Project

SceneFlow is completely free and open-source. If it's useful to you, or if you want to support my ongoing experiments with SceneFlow and the Auteur Script, I set up a **[Ko-fi page](https://ko-fi.com/tarumainfo)** where you can leave a small tip. Any support helps cover hosting and means a lot!

---

## Try SceneFlow

SceneFlow runs directly in your browser with no account or sign-up needed:

- 🌐 **Web App**: [sceneflow.taruma.my.id](https://sceneflow.taruma.my.id/)
- 💻 **GitHub**: [github.com/taruma/SceneFlow](https://github.com/taruma/SceneFlow)
- 📖 **Catalogue of Examples**: [SceneFlow Catalogue](https://github.com/taruma/SceneFlow/blob/main/SCENEFLOW_CATALOGUE.md)
- ☕ **Tip on Ko-fi**: [ko-fi.com/tarumainfo](https://ko-fi.com/tarumainfo)
- 💬 **Updates on X**: [@tarumainfo](https://x.com/tarumainfo)

> 💡 **Quick Tip:** You don't need your own video or script to test this out. Just click **Library** in the top bar (or press <kbd>Shift+L</kbd>) and load any of the built-in scenes—they come completely pre-synced so you can see the timeline, zoom presets, and edit workstation in action right away!

Pick any example from the library, hit the spacebar, and explore the new timeline and editor!
