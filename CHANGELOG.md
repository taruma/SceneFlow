# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0-dev] - Unreleased

### Added
- **Additional Example Projects**: Added new short-form AI clip examples to the built-in catalogue.
- **Visual System Token Harmonization (`src/styles/tokens/ui.ts` & `src/index.css`)**:
  - Expanded and centralized `UI_TOKENS` into standard design token groups covering:
    - **`layout`**: App header, script headers (playback & edit modes), panel frames, and section titles.
    - **`modal`**: Overlays (`overlay`, `overlayHeavy`, `overlayHighZ`), responsive modal containers (`containerSm`, `containerMd`, `containerLg`, `containerXl`, `containerLibrary`, `containerStaging`), standard headers (`header`, `headerSubtle`), footers, and padding tokens (`dialogPad`, `bodyPad`).
    - **`dropdown`**: Focus mode and width/scroll preset dropdown menus (`menu`, `menuWide`), dropdown headers, header titles, items, and active item highlights.
    - **`button`**: Primary, primary blue, secondary, secondary wide, danger, header icon action buttons (`headerIconButton`, `headerIconButtonActive`), mode switchers (`modeSwitchContainer`, `modeSwitchActive`, `modeSwitchInactive`), sort toggles (`sortButtonActive`, `sortButtonInactive`), action pills, support pills, and close buttons (`iconClose`, `iconCloseSquare`, `iconCloseSm`).
    - **`input`**: Search inputs, multiline textareas, code textareas, number boxes, and label tokens.
    - **`panel`**: Data banners, cards, interactive cue cards (`cardInteractive`, `cardInteractiveActive`), empty placeholders, and legend containers (`legendContainer`).
    - **`badge`**: Counter tags, timestamp pills, and header current time badges (`currentTimePill`).
- **Comprehensive CSS Palette Variables (`src/index.css`)**:
  - Defined semantic CSS custom properties (`--app-bg`, `--surface`, `--surface-subtle`, `--surface-muted`, `--surface-hover`, `--surface-dark`, `--border-main`, `--border-subtle`, `--border-subtle-trans`, `--text-main`, `--text-body`, `--text-muted`, `--text-faint`, `--text-placeholder`, `--overlay-bg`, `--overlay-heavy`, `--color-support`, `--color-support-hover`) mapped directly into Tailwind CSS v4's `@theme` directive.

### Changed
- **Component Design Token Alignment**:
  - Refactored all application shell components to consistently consume centralized `UI_TOKENS` rather than ad-hoc inline classes:
    - [`AppHeader.tsx`](file:///e:/_github/Screenplay-Sync/src/components/AppHeader.tsx) — aligned mode switcher, header action icon buttons, and Current Time badge.
    - [`ScriptHeaderControls.tsx`](file:///e:/_github/Screenplay-Sync/src/components/ScriptHeaderControls.tsx) — aligned Auto-Scroll focus, Script Width, and Scroll Focus dropdown menus.
    - [`LibraryModal.tsx`](file:///e:/_github/Screenplay-Sync/src/components/LibraryModal.tsx) — aligned modal frame container, header, search bar, and sort selector buttons.
    - [`StagingModal.tsx`](file:///e:/_github/Screenplay-Sync/src/components/StagingModal.tsx) — aligned modal container, header, and footer controls.
    - [`CueEditorForm.tsx`](file:///e:/_github/Screenplay-Sync/src/components/CueEditorForm.tsx) — aligned editor container, empty selection placeholder, and input labels.
    - [`ActiveHighlightsPanel.tsx`](file:///e:/_github/Screenplay-Sync/src/components/ActiveHighlightsPanel.tsx) — aligned section titles, category filters, and empty highlight state.
    - [`TimelineCuesPanel.tsx`](file:///e:/_github/Screenplay-Sync/src/components/TimelineCuesPanel.tsx) — aligned section titles, cue category legend container, and interactive cards.
    - [`TimingSettingsModal.tsx`](file:///e:/_github/Screenplay-Sync/src/components/TimingSettingsModal.tsx) — aligned heavy backdrop overlay and dialog container.
- **Zero Visual Regression**: Preserved exact color, spacing, radius, shadow, and typography fidelity across desktop and mobile viewports.
- **Strict Theme Scope Isolation**: Maintained complete separation between the Screenplay Paper Canvas engine (`themes.ts`, `cues.ts`, `typography.ts`, `helpers.ts`) and the outer App Shell Chrome (`ui.ts`, `index.css`), preparing the application for seamless dark/light mode toggling.

## [2.0.0] - 2026-08-26

### Added
- **Script Theme System**: Introduced a customizable theme engine for the script viewer, allowing users to toggle between six distinct visual presets via the new `ScriptColorModal` component:
  - Three light/warm themes: *Studio Crisp* (default), *Warm Parchment* (sepia-toned), *Retro Newspaper* (high-contrast print).
  - Three dark themes: *Midnight Slate* (refined dark), *OLED Black* (pure black for power-saving displays), *Cyber Matrix* (neon-accented terminal aesthetic).
  - Each theme provides a complete styling package covering paper surface, borders, shadows, headers, separators, staging badges, punch holes, brief cards, and cue highlight spectrums — all dynamically applied through `getScriptThemeStyles()` and `getCueColorForTheme()` in `src/styles/`.
  - The theme modal includes a live preview inspector comparing theme properties side-by-side and a full eight-category cue highlight spectrum rendered per theme.
  - Theme preference persists to `localStorage` and can be reset to default with a single click.
- **Modular Screenplay & UI Design Token Architecture (`src/styles/`)**: Centralized design tokens, theme definitions, and styling helpers into a modular package:
  - `src/styles/tokens/ui.ts` — centralized `UI_TOKENS` providing reusable Tailwind class bundles for modal overlays, dialog containers, buttons (primary, secondary, danger, header controls, action pills), form controls (inputs, textareas, code boxes, search, labels), icon badge wrappers, panel banners, theme swatches, and alert cards.
  - `src/styles/tokens/cues.ts` — defines theme-calibrated cue highlight palettes (`CUE_THEME_COLORS`), fallback color definitions, and `getCueColorForTheme()`.
  - `src/styles/tokens/themes.ts` — defines 6 visual themes (`SCRIPT_THEMES`), `SCRIPT_THEME_MAP`, default theme configuration, and category groupings (`light`, `warm`, `dark`).
  - `src/styles/tokens/typography.ts` — provides `getScriptThemeStyles(themeId)` generating theme-specific typography, headings, title lines, staging badges, and cue wrapper styles.
  - `src/styles/helpers.ts` — color manipulation and inline styling utilities (`hexToRgba`, `createCueBadgeStyle`, `createInlineCueStyle`).
  - `src/styles/index.ts` — unified barrel export providing clean access to all tokens, theme maps, and helpers.
- **Theme Resolution Hook & Custom Hook Barrel (`useScriptTheme`)**:
  - `src/hooks/useScriptTheme.ts` — added a dedicated custom hook that encapsulates active theme metadata, memoized computed theme styles, dynamic cue color resolution (`resolveCueColor`), active theme ID, and `isDark` boolean state.
  - `src/hooks/index.ts` — introduced a canonical barrel export consolidating all 8 custom hooks.
- **Configurable Screenplay Width Presets**: Added five adjustable reading-column widths for the script preview panel in playback mode, selectable via a desktop-only dropdown:
  - *Narrow* (384px), *Compact* (448px), *Standard* (576px, default), *Wide* (768px), and *Expanded* (1024px).
  - Preference persists to `localStorage` and each preset includes a descriptive label visible in the dropdown.
- **Scroll Focus Alignment Presets**: Added three configurable auto-scroll anchor positions during playback, controlling where the active cue line rests vertically within the viewport:
  - *Top (35%)* — positions the active line near the top for anticipation reading.
  - *Center (50%)* — balanced midpoint alignment.
  - *Bottom (35%)* — positions the active line lower for reflection reading.
  - Switching presets immediately re-scrolls to the current active cue for instant feedback; preference persists to `localStorage`.
- **Custom React Hook Architecture**: Extracted application business logic, playback controls, and editor state from `App.tsx` into a modular suite of eight custom hooks in `src/hooks/`:
  - `useScriptStorage` — encapsulates state initialization, initial default script loading (`scene_frequency.json`), `localStorage` persistence (`screenplay_sync_state`), starter blank script loading (`blank.json`), and CORS-aware remote project loading (`?project=URL`) with error handling.
  - `useYouTubePlayer` — encapsulates YouTube IFrame Player instance binding, playback state synchronization, a 100ms interval timer for high-frequency time tracking (`currentTime`), and video transport actions (`playVideo`, `pauseVideo`, `togglePlayPause`, `seekTo`, `jumpBy`).
  - `useScriptPreferences` — manages reading-column width presets, auto-scroll focus anchor presets, script theme selection, and cue category visibility filtering with automatic `localStorage` synchronization (`sceneflow_script_theme`, `sceneflow_script_width_preset`, `sceneflow_scroll_focus_preset`).
  - `useAutoScroll` — manages real-time screenplay auto-scrolling during playback, active cue selection (prioritizing newest start time and script position), multi-target type filtering, and smooth ratio-based viewport alignment (desktop configurable anchor vs mobile center alignment).
  - `useCueEditor` — encapsulates cue authoring, range selection, in-place text editing, duplicate occurrence lookup, cue deletion with confirmation dialogs, and video timeline seeking.
  - `useCueAlignment` — manages automated and manual cue realignment against edited screenplay text with visual status indicators (`isAligning`, `alignSuccess`).
  - `useKeyboardShortcuts` — handles global playback hotkeys (Space for play/pause, ArrowLeft/Right for 5s jumps) with input element gating, modal bypass, and responsive desktop layout detection.
  - `useScriptTheme` — provides dynamic theme resolution, computed theme class bundles, `resolveCueColor` mapping, and dark mode detection.
- **Dedicated Cue Utilities Module (`src/lib/cueUtils.ts`)**: Extracted core cue processing, alignment, search, validation, and ID sanitization logic into pure functions:
  - `sanitizeCues` — ID deduplication and normalization engine that guarantees unique React keys, infers missing `type`/`colorClass` fields bidirectionally on load, and injects UUID-fallback IDs for malformed cues.
  - `findTextInScript` — three-tier text search (exact match, normalized whitespace/quotes regex, case-insensitive fallback) used by the cue editor to map user selections to character offsets.
  - `findAlternativeLocations` — proximity-aware regex search returning all matching text occurrences with surrounding 25-character context snippets while skipping hidden `[[STAGING]]` blocks.
  - `realignCuesList` — chronological cue alignment engine that recalculates character offset boundaries (`startIndex`, `endIndex`) against updated script text using proximity matching and fallback heuristics while excluding staging blocks.
  - `getCueTimingOffsets` — aggregates per-type and global lead-in/tail-out timing offsets.
  - `isCueActive` — high-frequency check determining if a cue falls within the active playback time window.
  - `calculateCuePlaybackOpacity` — calculates dynamic fade-in and fade-out opacity values during playback offsets.
  - `exportStateToJsonFile` — triggers client-side formatted JSON state downloads.
  - `validateImportedScriptJson` — validates, normalizes, and injects default fallbacks for imported project files.
- **Centralized Script Constants (`src/constants/script.ts`)**: Created a dedicated module consolidating immutable application constants:
  - `COLORS` — eight standardized cue element categories with types, RGB color strings, and fallback classes.
  - `DEFAULT_SETTINGS` — baseline timing configurations for general and cue-specific offsets (`before: 0, after: 0`).
  - `SCRIPT_WIDTH_PRESETS` — configuration for the five reading width presets (`narrow`, `compact`, `standard`, `wide`, `full`).
  - `SCROLL_FOCUS_PRESETS` — configuration for the three auto-scroll anchor presets (`top`, `center`, `bottom`).
- **Comprehensive Domain Types (`src/types/script.ts`)**: Consolidated domain interfaces and state definitions:
  - Added `Cue`, `TimingSettings`, `ColorCategory`, `AppState`, `ScriptWidthPresetId`, `ScriptWidthPreset`, `ScrollFocusPresetId`, `ScrollFocusPreset`, `TextSelection`, `DeleteConfirmationState`, `ResetConfirmationState`, `OverlapPickerState`, `AlternativeLocation`, and `AppMode`.
- **Shared Utility Module (`src/lib/utils.ts`)**: Extracted reusable utility functions from `App.tsx` into a dedicated module:
  - `cn()` — safe Tailwind CSS class merging using `clsx` + `tailwind-merge` for conditional and dynamic class composition.
  - `extractYoutubeId()` — robust YouTube URL/id parser supporting `youtu.be`, `watch?v=`, `embed/`, `shorts/`, and plain ID formats.
  - `generateId()` — UUID generator utilizing `crypto.randomUUID()` with fallback generation for consistent entity identifiers.
- **Mobile-Responsive Library Modal**: Designed a purpose-built `MobileLibraryModal` component tailored for smaller screens, providing a native-feeling category browsing experience distinct from the desktop `LibraryModal`. The desktop and mobile modals are mutually exclusive based on viewport width.
- **Ko-fi Support Link**: Added a Ko-fi donation link (`https://ko-fi.com/tarumainfo`) with a themed coffee icon to the mobile header, alongside a Library access button for consistent discoverability across devices.
- **Vercel Analytics Integration**: Integrated `@vercel/analytics` to capture and report audience traffic insights in production, complementing the existing Vercel Speed Insights for Web Vitals tracking.
- **Manual Cue Text Editing**: Designed and integrated a monospace textarea inside the Edit Sync Cue panel allowing users to directly edit a cue's selected text in-place. This provides a clean way to perform manual key-value corrections or alignment adjustments without raw JSON editing, integrating seamlessly with the Align and Find Alternative engines.
- **Mobile Staging Overlay Visibility**: Enabled the staging block overlay and badge for mobile and tablet devices, offering access to behind-the-scenes camera staging instructions on all device widths.
- **Global Library Filter Settings**: Added support for `hideFromAll` metadata in example sections within `examples.ts`. This allows specific sections (e.g., "AI Clips") to be kept out of the unified "All Works" view to reduce noise and emphasize high-priority curations like "AI Scenes" and "The Written Motion".
- **Dynamic Category Badges**: Added contextual section indicators inside screenplay cards in the Library view. These badges dynamically reference which section a screenplay belongs to, complete with matching category-themed icons (e.g., Compass, Notebook, Film) for quick identification. Badges are automatically suppressed when browsing within their own specific category to prevent redundant labeling.
- **Expanded Example Library**: Added seven new screenplay examples across multiple categories:
  - *Scene Frequency* — a full-featured guide script showcasing timing cues and staging blocks, now the default example loaded on first visit.
  - *Museum* — a live-action-to-2D-animation transformation scene set in a gallery environment.
  - *Still Here* — an atmospheric narrative scene with layered environmental cues.
  - *The Magic Card* — a ritualistic cinematic clip involving golden seals and floating mystical cards.
  - *Wonder (Volume 6)* — the sixth installment of "The Written Motion" series, in both edited and uncut versions.
  - *What We Leave (Volume 7)* — the seventh installment of "The Written Motion" series.
  - *A Duet of Distance* — a music-driven piece exploring the tension between tradition and regret.
  - Reorganized *Table Four* and *Flat Frog Problems* out of the AI Clips section and into the Auteur Scene & Brief section to better reflect their production complexity.
  - Reclassified *Duet of Distance* from AI Clips to Auteur Scene & Brief and added a `music` tag.
- **Branded Loading & Initialization Screen**: Replaced the generic spinner with a branded `InitializingScreen` component displaying the SceneFlow logo (`SCENEFLOW_TAG_B.png`) with a subtle pulse animation and monospace status text, providing a polished first-load experience.
- **Application Icons & PWA Assets**: Added a complete set of favicon and PWA (Progressive Web App) assets for improved cross-browser compatibility and "Add to Home Screen" support:
  - `favicon.ico` (multi-resolution ICO), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, and `android-chrome-512x512.png`.
  - `site.webmanifest` with standalone display mode, theme color, and icon definitions.
  - Updated `index.html` to reference all icon formats and the web manifest.
- **Custom Dark Scrollbar Styling**: Added a dedicated `.custom-dark-scrollbar` CSS utility for dark-themed modals, providing a styled scrollbar (thin, with `stone-900` track and `stone-700` thumb) that matches the dark modal aesthetic on desktop browsers.

### Changed
- **Architectural Modernization & App.tsx Refactoring**: Deconstructed the monolithic `App.tsx` into a lightweight orchestrator by delegating state, side effects, and domain logic to the custom hook suite (8 custom hooks) and 18 modular sub-components:
  - App shell components: `AppHeader` (global navigation, logo, time display, mode toggle), `InitializingScreen` (branded loading splash), `YoutubeSourceInput` (video ID parser input).
  - Edit-mode components: `ScriptManagementBar` (line count & raw script access), `CueEditorForm` (cue authoring/editing form with text, type, timing, and location fields), `TimelineCuesPanel` (chronological cue list with color legend, raw JSON access, Align button), `RawScriptModal`, `RawCuesModal`.
  - Playback-mode components: `ScriptHeaderControls` (auto-scroll toggle, target-type multi-select, width preset, scroll focus preset), `ActiveHighlightsPanel` (desktop sidebar with per-type filter chips and active highlight cards).
  - Shared modals: `OverlapPicker`, `DeleteConfirmationModal`, `ResetConfirmationModal`, `TimingSettingsModal`, `ScriptColorModal`, `LibraryModal`, `MobileLibraryModal`, and `StagingModal`.
  - New utility modules: `src/lib/cueUtils.ts` (cue processing, alignment, active states, JSON import/export) and `src/lib/utils.ts` (`cn`, `extractYoutubeId`, `generateId`).
  - Clear separation of concerns between presentation layer, state management layer, and persistence/transport layer.
  - Refactored UI sub-components to consume centralized `UI_TOKENS` from `src/styles/tokens/ui.ts` and `useScriptTheme` for unified styling.
  - Updated `TimingSettingsModal` to consume centralized types and constants directly from `types/script.ts` and `constants/script.ts`.
- **UI Design Tokens Migration**: Refactored modals (`ScriptColorModal`, `TimingSettingsModal`, `ResetConfirmationModal`, `DeleteConfirmationModal`, `RawScriptModal`, `RawCuesModal`), panels (`ScriptManagementBar`, `ActiveHighlightsPanel`, `TimelineCuesPanel`), inputs (`YoutubeSourceInput`), and forms (`CueEditorForm`) to consume centralized tokens from `UI_TOKENS` for consistent surface, input, badge, button, and typography styling.
- **Deduplicated Reset Confirmation State**: Consolidated and standardized the `ResetConfirmationState` interface inside `src/types/script.ts`, removing duplicate interface declarations across modal components.
- **Staging Parser Robustness**: Improved `parseScriptWithStaging()` in `src/lib/scriptParser.ts` to match inner staging labels (`[[LABEL]]...[[/LABEL]]`) against trimmed lines (`trimmedLine`), preventing leading/trailing whitespace formatting issues from breaking staging block extraction.
- **Backwards-Compatible Style Layer**: Refactored `src/lib/scriptStyles.ts` to re-export from the modular `src/styles/` design token modules (`tokens/cues`, `tokens/themes`, `tokens/typography`, `tokens/ui`, `helpers`), maintaining backwards compatibility across the application.
- **Centralized Cue Sanitization Pipeline**: Retrofitted `useScriptStorage` so all five data-load paths (localStorage restore, default project load, blank script, example library selection, and remote project fetch) route through `sanitizeCues()` for deterministic ID deduplication and `type`/`colorClass` normalization. Raw-cues JSON import via `RawCuesModal` also now applies `sanitizeCues()` on paste, ensuring every ingress point sanitizes cue data consistently.
- **Metadata & Deployment Configuration**: Updated `metadata.json` to version `2.0.0-dev` and registered `"MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"` to declare the application's server-side Gemini API capability for deployment environments.
- **Cue Type & Color Normalization**: Refactored cue state management to standardize the relationship between cue `type` and `colorClass`:
  - Made `colorClass` optional on the `Cue` interface; styles are now dynamically derived from the `type` field using `getCueColorForTheme()`, which resolves theme-appropriate RGB colors.
  - Updated cue creation workflow to default `type` to `'dialogue'` and derive `colorClass` bidirectionally — if only `colorClass` is present, the type is inferred; if only `type` is present, the correct color class is assigned.
  - Migrated all cue rendering (sidebar list, inline script segments, type-selector buttons) from static Tailwind color classes to dynamic inline `style` attributes using theme-resolved RGB values, ensuring consistency across the six script themes.
- **Brief Block Rendering Enhancements**: Improved the visual presentation and parsing of Auteur Brief segments:
  - Added intelligent waterfall formatting that converts `->` sequences into indented hierarchical lines, with special handling to prevent blank leading lines at segment boundaries.
  - Suppressed rendering of empty whitespace lines within brief blocks via `scriptProcessor.ts`, eliminating ghost empty cards.
  - Applied styled card containers to brief segments with theme-aware backgrounds, borders, and badge styling for clearer visual hierarchy.
- **Anchor Badge Simplification**: Simplified inline anchor rendering (`[...]` brackets) from styled span badges to standard `<b>` bold text, reducing visual complexity while preserving emphasis. (Styled badges were temporarily implemented then replaced with the simpler bold approach for cleaner readability.)
- **Adaptive Staging Badge Design**: Tailored the staging block layout specifically for mobile screens to conserve space without impacting structural layouts or desktop styling:
  - Downscaled the badge font sizes, icon sizes, padding, and gaps on mobile viewports for a compact, neat appearance.
  - Adjusted mobile container margins to gracefully flow beneath screenplay headings.
  - Updated the staging container to use `flex-wrap` for responsive badge overflow handling.
- **Example Data Reorganization**: Moved all JSON example files from the root `public/` directory into dedicated subdirectories:
  - Standard examples into `public/examples/`.
  - AI clip-specific examples into `public/examples/ai_clips/`.
  - Updated all path references in `examples.ts` and application logic accordingly.
- **Guide Script Replacement**: Renamed the "blank" starter script to "guide script" (`blank.json`) to better reflect its role as an instructional reference. The guide script now defaults to playback mode on load and automatically re-aligns cues.
- **Default Example Update**: Changed the default example project from "The Expansion" to "Scene Frequency" (`scene_frequency`), providing a more comprehensive guide script on first visit.
- **Video Player Styling**: Refined the visual appearance of the YouTube video container by updating background colors and adjusting iframe framing for a more polished, edge-to-edge presentation.
- **Settings Icon Update**: Replaced the generic settings gear icon with a Clock icon (`Clock` from lucide-react) to better represent the timing-focused nature of the settings panel.
- **Mobile Header Enhancements**: Replaced the mobile edit-mode toggle with a Library access button (`Book` icon) and a Ko-fi support link (`Coffee` icon), providing quicker navigation and community support access on small screens. The mode indicator badge ("Playback" / "Edit") is now hidden on mobile to conserve header space.
- **Updated Example Metadata**: Revised tags, featured flags, and release dates across the example catalogue:
  - Demoted several items from `featured: true` to `false` (The Expansion, Intent Over Rules, Reality-Bending Video, Afraid, Not About Fish, Duet of Distance, Still Restless) to refresh the featured curation.
  - Added `music` tag to *Vibe Shift* and *A Duet of Distance*.
  - Cleaned up inconsistent tag metadata across the library.
- **Comprehensive Documentation Synchronization**: Refreshed and synchronized project documentation across `docs/` and `README.md` to reflect all architectural, stack, and domain model changes:
  - `docs/AGENTS.md` — updated parsing and styling guidelines to reference `src/styles/` design tokens and `useScriptTheme`.
  - `docs/ARCHITECTURE.md` — documented 5-layer system architecture (Presentation Layer with 18 modular sub-components, State & Hooks Layer with 8 custom hooks, Visuals Layer with `src/styles/` design tokens, Utility Layer, and Processing Layer), ASCII data flow diagrams, theme engine, width/scroll presets, and the dark scrollbar utility.
  - `docs/FUNCTIONALITY.md` — expanded library catalogue section with FRAME Series entries, hideFromAll filtering, adaptive section badges, 6 script themes, reading width and focus presets, and in-place cue editing.
  - `docs/TECH_STACK.md` — updated React version to 19, TypeScript to 5.8, Vite to 6, Tailwind CSS to v4 with `@theme` variables, centralized UI tokens, Motion animation library (`motion/react`), Lucide React, and `@vercel/analytics` / `@vercel/speed-insights`.
  - `README.md` — replaced SVG logo reference with PNG, expanded the example loading table with all 20+ examples categorized by section, and updated the query parameter documentation.

### Removed
- **Obsolete AST Block Parser & Types**: Removed dead `parseScriptToBlocks()` function and `ScriptBlock` / `ScriptBlockType` types from `src/lib/scriptParser.ts` and `src/types/script.ts`, simplifying `parseScriptWithStaging()` to return `{ originalLines, stagingLineIndices, stagingMarkers }`.
- **Legacy Static Theme Export**: Removed obsolete `SCRIPT_STYLES` static fallback export from typography tokens in favor of dynamic theme resolution.
- **Dead Code & Props in Components**: Pruned unused destructured variables (e.g. `setAltLocations`), dead props (e.g. `cueTypes={COLORS}` on `ScriptHeaderControls`), debugging `console.log` state monitoring `useEffect` in `App.tsx`, and unused imports across modal components.

### Fixed
- **Mobile Script Width Selector**: Hid the page width preset dropdown on non-desktop screens to prevent UI crowding and improve layout flow for mobile staging badges.
- **Brief Block Empty Line Filtering**: Empty or whitespace-only lines inside brief blocks are now filtered out during script processing, preventing ghost empty cards from rendering in the script view.
- **Waterfall Formatting Edge Cases**: Improved the `formatBriefSegment` function to correctly handle `->` sequences at line starts without introducing unintended blank leading lines, and cleaned up double-newline artifacts from raw text that already contained line breaks before waterfall markers.

## [1.4.0] - 2026-05-26

### Added
- **Library Catalogue Optimizations**: Designed a highly polished, fully responsive, and structured library portal built for discovering diverse examples:
  - **Mobile & Tablet Display Optimization**: Optimized sizes, spacing, and scroll behaviors for mobile and tablet users. Introduced a smooth horizontal-scrolling category navigation bar, responsive dialogue sizing, auto-wrapping sorting selector controls, touch-friendly scroll wrappers, and hid physical keyboard shortcut hints on smaller viewports.
  - **Dynamic "Featured" Curations**: Highlighted standout screenplays dynamically based on schema properties, emphasizing them with beautiful visual markers, unique hover effects, and special animated badges.
  - **Chronological Sorting & Controls**: Enabled sorting of lists chronologically (by latest or oldest release dates) or alphabetically. Restricted or draft scripts are automatically pinned at the lowest priority.
  - **Expanded Library Content**: Shipped with an increased collection of built-in scripts, multi-volume narrative series, and educational templates.
  - **Real-time Global Search**: Smooth instantaneous scanning across screenplay titles, summaries, series volumes, and custom metadata badges.
  - **Interactive Staging Overlay**: Integrated an isolated drawer for examining behind-the-scenes camera instructions, prompt hierarchies, and visual styles.

### Changed
- **Modular Component Separation**: Partitioned the codebase to isolate modal interfaces into `/src/components/LibraryModal.tsx` and `/src/components/StagingModal.tsx` components for improved system testability and cleaner core lifecycle handlers.

## [1.3.1] - 2026-05-24

### Changed
- **Responsive Auto-Scroll Alignment**: Replaced standard `scrollIntoView` centering with a precise scroll calculation that positions active cues 35% from the container top on desktop displays (leaving preceding context visible while making upcoming lines easily readable). Tablet/phone displays continue to target native horizontal/vertical centering for maximum mobile screen economy.

## [1.3.0] - 2026-05-15

### Added
- **Official SceneFlow GUIDE**: Released a comprehensive, interactive quick-start guide as the default "Blank" script project.
- **Library Expansion (The Wanderer Multiverse)**: Added **Volume 4 (Wayfarers)** and **Volume 5 (Fractures)** to the example library, showcasing auteur brief prompting.
- **Library "Getting Started" Section**: Added a dedicated section in the example library for high-priority tutorials.

### Changed
- **Rebranded Blank Script**: The initial workspace now serves as a narrative tutorial on "Cinematic Synchronization" and "Auteur Prompting," featuring a complete breakdown of formatting rules and cue management.
- **Interactive Mosaic Example**: Integrated a deep-dive walkthrough of the "Mosaic" scene within the GUIDE to demonstrate complex staging and dual-character synchronization.

## [1.2.5] - 2026-05-15

### Changed
- **Script Note Visibility**: Refined the bracketed tag logic to ensure that functional notes like `[INTENT]` or `[CUT TO: MEDIUM SHOT]` remain visible and properly formatted in the script preview, while preserving the hidden state of system-level tags like `[<BRIEF>]` and `[[STAGING]]`.

## [1.2.4] - 2026-04-28

### Changed
- **Alignment Refinement**: Updated the alignment and "Find Alternative" engines to strictly ignore text matches within `[[STAGING]]` blocks. This ensures cues never accidentally snap to hidden prompt data that isn't visible in the screenplay preview.

## [1.2.3] - 2026-04-25

### Added
- **Alternative Location Finder**: Resolved the "Duplicate Text" issue. When a cue points to text that appears multiple times in the script (e.g., "WIDE SHOT"), you can now click "Find Alternative" in the edit panel to see all occurrences and manually snap the cue to the correct location.
- **Robust Matching Engine**: Updated the finder to use the same proximity-aware regex logic as the alignment tool. It now handles whitespace variations, different quote types, and provides a "partial match" fallback if the full string isn't found.
- **Contextual Snippets**: The finder provides text snippets for each match to help identify the correct scene/block.

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
