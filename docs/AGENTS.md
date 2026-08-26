# Agent Guidelines

This document provides instructions for AI agents and developers who need to maintain, extend, or modify the SceneFlow codebase.

## 1. Extending the Script Parser & Line Types

If you need to add a new script line type (e.g., `lyrics`, `transition`, or a specialized directive):

1. **Update Line Types**: Add the new type identifier to the `LineType` union in `src/lib/scriptProcessor.ts`:
   ```typescript
   export type LineType = 
     | 'name' 
     | 'speech' 
     | 'parenthetical' 
     | 'heading' 
     | 'note' 
     | 'effect' 
     | 'separator' 
     | 'part-separator' 
     | 'roman-title' 
     | 'action' 
     | 'default'
     | 'new-type';
   ```
2. **Implement Detection Logic**: Update `processScript()` in `src/lib/scriptProcessor.ts` with regex or heuristic rules to classify the line into your new type.
3. **Map Visual Styles**: Update `getLineClass()` in `src/lib/scriptStyles.ts` to return the appropriate Tailwind CSS classes, referencing active theme tokens (e.g., `theme.textColor`, `theme.textMutedColor`).
4. **Block-Level Types (Optional)**: If the new type applies to the structured block parser used for export or AST representations, add it to `ScriptBlockType` in `src/types/script.ts` and update `parseScriptToBlocks()` in `src/lib/scriptParser.ts`.

## 2. Modifying Styles & Script Themes

**DO NOT** write hardcoded Tailwind color classes directly into `src/App.tsx` for screenplay text or cue highlights.

- **Centralized Themes**: All paper surfaces, borders, shadows, punch holes, headings, staging badges, and brief cards are configured in `SCRIPT_THEMES` within `src/lib/scriptStyles.ts`.
- **Theme Categories**: Each theme is categorized as `'light'`, `'warm'`, or `'dark'`.
- **Cue Colors**: Dynamic highlight colors are resolved via `getCueColorForTheme(typeOrClass, themeId)`. Each cue category provides theme-calibrated RGB strings (`lightRgb`, `warmRgb`, `darkRgb`) defined in `CUE_THEME_COLORS`.
- **Structural Styles**: Common structural classes (separators, title dividers, staging badges, cue base wrappers) are generated dynamically through `getScriptThemeStyles(themeId)`.
- **Base Typography**: Maintain the `baseStyle` constant (`"whitespace-pre-wrap min-h-[1em] leading-snug"`) to preserve consistent line height and wrapping behavior.

## 3. Regex & Parsing Standards

The parser relies on deterministic line-by-line regex patterns. When modifying or adding patterns, adhere to the following standards:

- **Character Names**: Must be ALL CAPS and end with a colon (`^[A-Z0-9_\s]+:$`). Dialogue lines immediately following a character line inherit character speech context.
- **Scene Headings**: Must detect case-insensitive `INT.` and `EXT.` at line start.
- **Staging Blocks**: Line-based parsing. Look for `[[STAGING]]` and `[[/STAGING]]` on their own lines, enclosing labeled sub-blocks (`[[LABEL]]...[[/LABEL]]`). Do not match staging tags inline.
- **Brief Blocks**: Match opening `[<BRIEF>]` and closing `[</BRIEF>]` tags on their own lines. Ensure whitespace-only lines inside brief blocks are skipped to prevent ghost cards.
- **Roman Numerals**: Match uppercase roman numerals with a trailing period (e.g., `^IV\.\s+.+$`) with uppercase line validation.
- **Exclusion Filters**: When implementing search or auto-alignment engines, always exclude text ranges within `[[STAGING]]` blocks so cues never snap to hidden prompt metadata.

## 4. Sync Logic & Rendering Performance

The `renderedScript` `useMemo` in `src/App.tsx` is executed frequently as playback time updates:

- **Avoid Heavy Computations**: Do not insert complex calculations or synchronous operations inside the `processedLines.forEach` loop.
- **Stable React Keys**: Ensure rendered elements have stable `key` attributes based on `lineIdx`, `cue.id`, or unique segment offsets (`${lineIdx}-${start}`).
- **Opacity Transitions**: In playback mode, opacity is calculated dynamically against per-category before/after buffers. In edit mode, non-active cues remain visible at reduced opacity (0.4) for editing affordance.

## 5. Persistence, State, & External Data

When modifying application state, storage keys, or external fetching:

- **State Schema**: Maintain the `AppState` interface in `src/types/script.ts` (`youtubeId`, `scriptText`, `cues: Cue[]`, `settings?: Record<string, TimingSettings>`).
- **LocalStorage Keys**:
  - `'screenplay_sync_state'`: Core project data (video ID, script text, cues, timing settings).
  - `'sceneflow_script_theme'`: Active script viewer theme ID (`ScriptThemeId`).
  - `'sceneflow_script_width_preset'`: Active desktop script width preset (`ScriptWidthPresetId`).
  - `'sceneflow_scroll_focus_preset'`: Active desktop auto-scroll focus anchor (`ScrollFocusPresetId`).
- **Query Parameters**: On application mount, inspect `window.location.search`:
  - `?example=ID`: Matches an example `id` from `EXAMPLE_SECTIONS` in `src/examples.ts`.
  - `?project=URL`: Loads a remote CORS-enabled JSON project.
  - Clean up query parameters immediately after detection using `window.history.replaceState`.
- **Remote Fetching**: Use the `loadRemoteProject()` pattern with error handling and confirmation modals (`ResetConfirmationModal`) to prevent unintentional data overwrite.

## 6. Responsive UI & Modal Architecture

- **Desktop vs. Mobile Modals**: Desktop browsing uses the full-featured `src/components/LibraryModal.tsx` with search, sorting, and category sidebar. Mobile devices use the touch-optimized bottom-sheet drawer `src/components/MobileLibraryModal.tsx`. Both share state and are mutually exclusive based on viewport width (`lg` breakpoint).
- **Header Adaptations**: On mobile screens, hide width selectors and edit toggles to prevent crowding, surfacing direct Library access and the Ko-fi support button.
