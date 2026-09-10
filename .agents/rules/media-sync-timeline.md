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

## 5. Timeline Density & Geometry Synchronization
- Support `TimelineDensity` (`'comfortable' | 'compact'`) across timeline components for dynamic vertical scaling (32px vs 24px track heights).
- Ensure category headers on `TimelineLane` handle both active/idle and muted/hidden visual states when wired to visibility toggles.
- **Strict Geometry Coupling**: Always pass `density` down to `TimelineCueBlock` so that vertical offsets (`subLaneIndex * step + padding`) and block heights (18px vs 22px) match `TimelineLane`'s track container height, preventing sub-lane clipping or row jumping.

## 6. Responsive Split Pane & Drag Performance
- Keep panel split logic desktop-only (`hidden lg:flex`); mobile/tablet devices must always stack vertically (`flex-col`) with full width (`w-full`).
- **Zero-Latency Dragging**: Temporarily suppress all CSS transitions across panels during active drag operations via the global `.is-resizing-split` class on `document.body`.
- **Hardware VSync Throttling**: Always clamp pointermove updates to display refresh intervals using `requestAnimationFrame`.
- **Decoupled Persistence**: Never invoke synchronous disk I/O (`localStorage.setItem`) inside continuous mousemove/pointermove loops. Update in-memory state during drag, and commit to storage only upon pointer release (`commitSplitRatio`).

## 7. Vertical Video Resizing & Aspect Ratio Invariants
- Direct vertical manipulation via `VideoSplitDivider.tsx` takes precedence over percentage-based width sliders.
- **Aspect Ratio Integrity**: Combine `height: ${videoHeight}px` with `aspectRatio: '16 / 9'` and `maxWidth: '100%'` on the video container to ensure no lateral empty gutters and zero distortion.
- **Drag Performance & IFrame Guard**: Leverage pointer capture and `.is-resizing-split` to prevent YouTube iframe event absorption during vertical drags.
- **Unified Reset State**: The header "Reset View" action must reset both the horizontal panel split (42%) and vertical video height (240px) in lockstep.

## 8. Header Layout Stability & Studio VU Meter Invariants
- **Zero-Layout-Shift Indicator Strips**: In high-frequency playback headers, never render variable-length arrays of cue instance dots that cause horizontal layout jitter. Implement fixed-slot category strips (`COLORS` order) that illuminate dynamically via `resolveCueColor()`.
- **Numeric Tabular Width Isolation**: Any numeric counter that transitions between single and double digits during playback must be wrapped in a dedicated fixed-width slot (`min-w-[14px] font-mono tabular-nums text-center`) to ensure zero pixel shift.
- **Collapsible Secondary Filters**: The category filter bar must support smooth collapsing (`sceneflow_highlight_filter_expanded`) to maximize vertical space for timeline tracks, with an active indicator pip displayed on the toggle button when categories are muted.

