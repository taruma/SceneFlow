---
description: Architectural invariants and playback rules for media timeline synchronization, YouTube iframe state management, and multi-track rendering in SceneFlow.
---

# Media Timeline Synchronization & Playback Invariants

When developing or modifying playback, cue synchronization, or timeline visualization in SceneFlow, strictly observe these core principles:

## 1. The Dual-Time Principle
Distinguish between **Physical Media Time** and **Perceptual Activation Buffers**:
- **Physical Media Time (`[startTime, endTime]`)**:
  - Always governs timeline block placement (`leftPercent`, `widthPercent`), timecode rulers, duration calculations, and sub-lane collision intervals.
  - Never physically expand or shift timeline blocks using `before`/`after` offsets; doing so distorts the true audio timing and corrupts track geometry.
- **Perceptual Activation Buffers (`isCueActive(cue, currentTime, settings)`)**:
  - Always governs visual activation states: cue illumination rings, glowing lane indicator dots, inspector card docking, and screenplay text highlighting.

## 2. YouTube IFrame API `seekTo()` State Preservation
YouTube's iframe player tends to auto-play unbuffered video when `seekTo(seconds, true)` is called on a paused player:
1. **Dual Pause**: Enforce `player.pauseVideo()` before and after `player.seekTo()`.
2. **Auto-Expiring Guard**: If using a flag to intercept unwanted `BUFFERING (3) -> PLAYING (1)` transitions, always wrap it in an auto-expiring timer (e.g., 600ms). Never leave a seek-pause flag armed indefinitely, or users will experience the "ghost pause" bug requiring two clicks to play.
3. **Explicit Playback Intent**: Clear the suppression flag immediately on all deliberate play triggers (`playVideo`, `togglePlayPause`, or explicit "Replay" actions).

## 3. Deterministic Sub-Lane Allocation
- When multiple cues overlap within the same category track, compute sub-lane indices **globally** across the entire script using greedy interval scheduling.
- Never calculate sub-lane packing dynamically inside a rolling/sliding time window, as this causes cue blocks to juggle or swap rows when neighboring cues enter or exit the viewport.

## 4. Playback Left Panel Isolation
- Strictly decouple Playback mode (`src/components/playback/PlaybackLeftPanel.tsx`) from Edit mode in `App.tsx`.
- Never couple playback containers to edit-mode sticky scroll animations or form styles.

## 5. Timeline Density & Category Visibility
- Support `TimelineDensity` (`'comfortable' | 'compact'`) across timeline components for dynamic vertical scaling (32px vs 24px track heights).
- Ensure category headers on `TimelineLane` handle both active/idle and muted/hidden visual states when wired to visibility toggles.
