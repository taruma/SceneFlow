# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2026-04-18

### Added
- **Inline Brief Blocks**: Introduced `[<BRIEF>]`/`[</BRIEF>]` tags for technical directives and scene briefs that remain visible in the script.
- **Brief Formatting Engine**:
  - **Waterfall Indentation**: Automatically injects newlines and indents after `->` characters inside Brief blocks for better readability of action flows.
  - **Bold Anchors**: Automatically bolds text within square brackets `[...]` inside Brief blocks to create visual scanning anchors.
  - **Monospace Typography**: Brief blocks use a technical monospace font to distinguish data from dialogue.

## [1.2.2] - 2026-04-18

### Added
- **Inline Brief Blocks**: Introduced `[<BRIEF>]`/`[</BRIEF>]` tags for technical directives and scene briefs that remain visible in the script.
- **Brief Formatting Engine**:
  - **Waterfall Indentation**: Automatically injects newlines and indents after `->` characters inside Brief blocks for better readability of action flows.
  - **Bold Anchors**: Automatically bolds text within square brackets `[...]` inside Brief blocks to create visual scanning anchors.
  - **Monospace Typography**: Brief blocks use a technical monospace font to distinguish data from dialogue.

## [1.2.1] - 2026-04-16

### Enhanced
- **Flexible Timing Offsets**: Timing settings now support negative values, allowing users to "nudge" specific categories to appear faster than the global master offset.
- **Unified Defaults**: All timing settings (General and per-category) now default to `0.0s` for a cleaner out-of-the-box experience.

## [1.2.0] - 2026-04-11

### Added
- **Multi-Select Focus Modes**: Users can now select multiple cue types for the script preview to follow (e.g., track both Dialogue and Action simultaneously).
- **Most-Recent Priority**: Auto-scroll now prioritizes the most recently started cue among active ones, providing a more responsive and "live" tracking experience.
- **Chronological & Proximity Alignment**: The "Align" feature now sorts cues by time and uses proximity-aware matching. This ensures that duplicate lines are mapped to their most logical position based on time and surrounding context, rather than just the first occurrence.

## [1.1.0] - 2026-04-07

### Added
- **Remote Project Sharing via URL**: Added `?project=URL` query parameter to load JSON projects from CORS-enabled servers.
- **Example Loading via URL**: Added `?example=ID` query parameter to load built-in examples (e.g., `expansion`, `intent`, `mosaic`, `invasion`).
- **Staging Blocks & Auteur Prompting**: Implementation of `[[STAGING]]` blocks for embedding metadata (Global instructions, Lookbooks) that are hidden from the main view but accessible via a badge.
- **Vercel Speed Insights Integration**: Added performance monitoring and Web Vitals tracking.
- **Advanced Screenplay Parsing**:
  - Support for `PART` and Roman numeral titles (e.g., `PART 1`, `I. THE BEGINNING`).
  - Support for shot/camera notes in `[...]`.
  - Detection and styling for bold direction for ALL CAPS single lines.
- **Comprehensive Documentation**: Added a set of detailed documentation files in `docs/` covering agents, architecture, functionality, and tech stack.

### Changed
- **Refactored Script Processing**: Decentralized styling logic and modularized script parsing into `scriptProcessor.ts` and `scriptStyles.ts` for improved maintainability.
- **Polished UI/UX**:
  - Updated header padding and logo text visibility for better mobile responsiveness.
  - Added confirmation dialogs for remote loading to prevent accidental data loss.
  - Improved script alignment logic when text changes.
- **Updated Examples**: Revised example script texts and timing for "The Breaking Point" and other built-in scenarios.

### Fixed
- **Playback Scrolling**: Prioritizes the most recent dialogue cue for scrolling during playback. Added bottom padding to the script container to ensure the last lines can be vertically centered during auto-scroll.
- **Segment Identifiers**: Use correct scroll cue ID for segment spans spanning multiple lines in `App.tsx`.
- **Script Clarifications**: Fixed screenplay terminology in examples (e.g., "ONE-ER" clarification).

## [1.0.0] - 2026-04-02

### Added
- **Core Sync Engine**: Real-time script-to-video synchronization based on user-defined cues.
- **8 Element Types**: Support for Dialogue, Action, Camera, Shot, Audio, VFX, Transition, and Environment cue types.
- **Auto-Scroll**: Screenplay automatically follows dialogue during video playback.
- **Cue Type Filtering**: Ability to toggle visibility of specific cue categories in the script view.
- **Example Library**: Built-in demos including "Intent Over Rules" and "Mozaic" projects.
- **Keyboard Shortcuts**: Spacebar for play/pause, Arrow keys for 5s seek.
- **Project Export/Import**: JSON-based project saving and loading via local files.
- **Responsive Design**: Mobile-friendly interface with video preview width controls on desktop.
- **Automatic Persistence**: Continuous saving of work to browser's `localStorage`.

### Changed
- **Branding Update**: Rebranded from "Screenplay Sync" to "SceneFlow" with a custom SVG logo and updated metadata.

### Fixed
- **UI Spacing**: Adjusted video player margins and panel scroll behavior for a more consistent edit-mode experience.

---
*Initial Release*
