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
- **Absolute Pixel Minimum Constraint (`MIN_PANEL_PIXEL_WIDTH = 380`)**: Pointer dragging and keyboard adjustments calculate `effectiveMinRatio = Math.max(minRatio, (380 / windowWidth) * 100)` to guarantee the left playback column cannot be collapsed into an unusable micro-sliver on smaller desktop screens (1024px–1366px).
- **Window-Bound Pointer Tracking & Gesture Safety**: Split and resizer drag listeners (`pointermove`, `pointerup`, `pointercancel`) must be subscribed to `window` rather than confined to the drag handle element, with `touch-none` (`touch-action: none`) declared to prevent Windows Precision Touchpad and touch gestures from firing premature `pointercancel` aborts.
- **Zero-Latency Dragging**: Temporarily suppress all CSS transitions across panels during active drag operations via the global `.is-resizing-split` class on `document.body`.
- **Hardware VSync Throttling**: Always clamp pointermove updates to display refresh intervals using `requestAnimationFrame`.
- **Decoupled Persistence**: Never invoke synchronous disk I/O (`localStorage.setItem`) inside continuous mousemove/pointermove loops. Update in-memory state during drag, and commit to storage only upon pointer release (`commitSplitRatio`).

## 7. Vertical Video Resizing & Aspect Ratio Invariants
- Direct vertical manipulation via `VideoSplitDivider.tsx` takes precedence over percentage-based width sliders.
- **Aspect Ratio Integrity**: Combine `height: ${videoHeight}px` with `aspectRatio: '16 / 9'` and `maxWidth: '100%'` on the video container to ensure no lateral empty gutters and zero distortion.
- **Drag Performance, IFrame Guard & Deadband Elimination**: Leverage window-level pointer event subscriptions, explicit pointer capture fallbacks, and `.is-resizing-split` to prevent YouTube iframe event absorption during vertical drags. Re-anchor the drag origin when reaching min (160px) or max (480px) constraints to eliminate boundary deadbands when reversing direction.
- **Unified Reset State**: The header "Reset View" action must reset both the horizontal panel split (65%) and vertical video height (220px) in lockstep.

## 8. Header Layout Stability & Adaptive Two-Tier Toolbar Invariants
- **Adaptive Toolbar Architecture**: High-frequency headers must dynamically adapt to container width via `ResizeObserver` (560px threshold). When wide ($\ge 560\text{px}$), all controls are consolidated into a single unified row (`Highlights` + VU meter on left; Track Height + Zoom + Filters + View Switcher on right), reserving maximum vertical headroom for timeline tracks. When dragged narrow ($< 560\text{px}$), the header automatically transforms into a Two-Tier layout (Tier 1: Title + VU meter + View Switcher; Tier 2: Zoom + Track Height + Filters) to eliminate button collisions and text squishing.
- **Compact Track Header Geometry (`w-18` / 72px)**: Category headers on `TimelineLane` must use compact fixed widths (`w-18` with `text-[8.5px]`) to maximize the available horizontal timeline track canvas for cue blocks.
- **Zero-Layout-Shift Indicator Strips**: In high-frequency playback headers, never render variable-length arrays of cue instance dots that cause horizontal layout jitter. Implement fixed-slot category strips (`COLORS` order) that illuminate dynamically via `resolveCueColor()`.
- **Numeric Tabular Width Isolation**: Any numeric counter that transitions between single and double digits during playback must be wrapped in a dedicated fixed-width slot (`min-w-[14px] font-mono tabular-nums text-center`) to ensure zero pixel shift.
- **Collapsible Secondary Filters**: The category filter bar must support smooth collapsing (`sceneflow_highlight_filter_expanded`) to maximize vertical space for timeline tracks, with an active indicator pip displayed on the toggle button when categories are muted.

## 9. Timeline Zoom Presets & Adaptive Timecode Intervals
- **Bounded Presets Over Freeform Zoom**: Bounded presets (`'4s' | '8s' | '16s'`) must be used for visible window durations rather than unconstrained continuous scroll/pinch zoom, ensuring visual stability and predictable sub-lane allocation.
- **Adaptive Timecode Intervals (LOD)**: `useTimelineWindow.ts` must generate ticks with adaptive spacing (1s intervals for `4s`/`8s`, 2s step with 4s major labels for `16s`) to prevent DOM element bloat and label crowding.
- **Narrow Block Label Elision**: When blocks become narrow pills (`widthPercent < 3.5%`) at wide zoom levels, omit the text snippet and center the category pip to eliminate awkward character clipping, preserving full details in the hover tooltip.

## 10. Timeline Track Height Invariants (Fixed vs. Flexible)
- **Per-Category Max Pre-Allocation**: In `fixed` mode, track heights lock to the maximum simultaneous cues for that category across the entire script (`globalMaxSubLane + 1`), permanently rendering sub-lane dividers without vertical layout shifts.
- **Empty Lane Geometry Preservation**: `TimelineLane` must accept `totalSubLanes` at the category level so tracks maintain their pre-allocated height and sub-lane guide lines even when no cues are visible in the rolling window.

## 11. Collapsible Video Player & Background Playback Invariants
- **Zero-Height Audio & Sync Continuity**: When collapsing the video player in Playback mode (`PlaybackLeftPanel.tsx`), **never** unmount the `<YouTube>` component. Use zero-height clipping styles (`h-0 min-h-0 max-h-0 opacity-0 pointer-events-none !m-0 !p-0 overflow-hidden`) so the iframe context remains attached, audio continues playing, and real-time timeline playhead/cue synchronization persists for screen recording.
- **Resizer Divider Suppression**: Conditionally omit `VideoSplitDivider` when the video player is collapsed so no orphaned resize handles float above the timeline.
- **Dual Control & Quick Toggle**: Provide an interactive header toggle button (`[ Hide Video ]` ⇋ `[ Show Video ]`) alongside the global keyboard shortcut (`KeyV` / <kbd>V</kbd>) with animated status badge (`Video Hidden`).
- **Unified View Reset**: `isViewCustomized` and `resetViewLayout` must track `isVideoCollapsed`, ensuring clicking "Reset View" restores the video player to default visibility.

## 12. Persistent Playback Header Transport Controls
- **Unobstructed Transport Access**: Transport controls (`Play`, `Pause`, `Replay from 0:00`) must live in the persistent `PlaybackLeftPanel` header, ensuring media playback is fully controllable even when the video player is collapsed or obstructed.
- **Immediate State Synchronization**: The Play/Pause button dynamically renders based on `playerState === 1`, displaying stateful colors (vibrant accent when playing) and updating in lockstep with global keyboard shortcuts (<kbd>Space</kbd> / <kbd>K</kbd>).
- **Explicit Replay Semantics**: Replay must invoke `seekTo(0, true, true)` to immediately jump to `0:00` and trigger playback without paused-seek suppression guards interfering.
- **Viewport Fluidity**: Button labels must gracefully collapse to compact icon buttons on narrow viewports (`hidden sm:inline`), ensuring zero header wrapping.

## 13. Playback Loop Render Performance & Auto-Scroll Invariants
- **Decoupled Text Processing**: Never trigger screenplay text parsing (`processScript`) inside high-frequency playback renders. Wrap parsing in `useMemo(..., [state.scriptText])` so regex tokenization runs strictly upon script load or text edit.
- **$O(1)$ Line Cue Pre-Indexing**: Pre-index overlapping cues by line index (`cuesByLineIndex = useMemo(..., [state.cues, processedLines])`) and provide a stable empty array reference for cue-less lines to eliminate $O(\text{lines} \times \text{cues})$ array scans on each 100ms tick.
- **Line-Level Render Isolation (`ScriptLine`)**: Delegate screenplay line rendering to `<ScriptLine />` wrapped in `React.memo` with `areScriptLinePropsEqual`. Lines with no cues (~95% of a screenplay) must immediately skip re-rendering on playback ticks. Lines with cues must only re-render when a cue on that line changes active status or exceeds a 0.005 opacity transition delta.
- **Analog Cue Highlight Transitions**: Apply linear CSS transitions (`transition: background-color 100ms linear, box-shadow 100ms linear`) strictly during playback mode (`mode === 'playback' && !isTemp`). This offloads color and glow fading between 100ms timer ticks directly to the GPU compositor for smooth analog illumination without CPU load.
- **VSync-Aligned Auto-Scrolling & Deadband Guard**: In `useAutoScroll`, always schedule layout queries and smooth scrolling via `requestAnimationFrame` with a cancellation cleanup ref (`rafRef`). Never use arbitrary `setTimeout` delays, and enforce a 10px deadband threshold (`Math.abs(container.scrollTop - targetScrollTop) > 10`) before calling `scrollTo` to eliminate micro-jitter when consecutive cues reside on the same line.
- **Dormant Calculations**: In `HighlightTimelineView`, short-circuit `activeCuesUnderPlayhead` during playback when `selectedCue === null` to eliminate redundant cue array filtering while `PausedInspectorCard` is unmounted.
- **Reference-Stable Category Sets**: In `App.tsx`, preserve `activeCueTypes` `Set` reference equality across 100ms timer ticks when active category members have not changed, preventing spurious re-renders across the left playback panel tree.
