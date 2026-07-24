# Architecture

The project follows a modular 3-layer architecture to separate script processing logic from UI rendering.

## 1. Logic Layer (`src/lib/scriptProcessor.ts`, `src/lib/scriptParser.ts`, and `src/lib/utils.ts`)
The "Brain" of the application. It is responsible for:
- **Scanning raw text**: Iterating through the script line-by-line.
- **Semantic Detection**: Using regex and heuristics to classify lines as `heading`, `name`, `speech`, `action`, `note`, `effect`, `separator`, `part-separator`, `roman-title`, `parenthetical`, or `default`.
- **Dialogue Context**: Identifying which character is speaking and linking their name to the subsequent speech blocks.
- **Position Mapping**: Calculating the exact start and end character indices for every line to ensure sync cues remain accurate.
- **Staging Extraction**: Identifying `[[STAGING]]` blocks and extracting them into interactive markers.
- **Brief Block Detection**: Recognizing `[<BRIEF>]` and `[</BRIEF>]` tagged blocks for technical directives with monospace styling.

The `scriptParser.ts` sub-module provides:
- **Staging Block Parsing** (`parseScriptWithStaging`): Extracts `[[STAGING]]` blocks and their `[[LABEL]]`...`[[/LABEL]]` sub-blocks, returning a map of staging markers and line indices to hide.
- **Block-Level Parsing** (`parseScriptToBlocks`): Converts raw text into structured `ScriptBlock` objects with types defined in `src/types/script.ts`.

## 2. Visuals Layer (`src/lib/scriptStyles.ts`)
The "Designer" of the application. It is responsible for:
- **Style Mapping**: Taking a `ProcessedLine` object and returning the appropriate Tailwind CSS classes.
- **Centralized Constants**: Storing all visual implementation details (colors, margins, font sizes) in one place.
- **Interactive States**: Defining the look of active vs. inactive sync highlights (Cues).

## 3. UI Layer (`src/App.tsx`)
The "Stage" where everything comes together. It is responsible for:
- **State Orchestration**: Managing the relationship between the YouTube player and the script preview.
- **Sync Engine**: Using a `useMemo` hook to calculate which parts of the script should be highlighted based on the current video time.
- **User Interaction**: Handling text selection, cue creation, and mode switching (Playback vs. Edit).
- **External Data Integration**: Detecting query parameters (`example`, `project`) on mount and fetching remote JSON data using the Fetch API.
- **Persistence**: Saving and loading data from `localStorage`.
- **Modular Sub-components** (extracted from `App.tsx` for separation of concerns):
  - **Library Catalogue** (`src/components/LibraryModal.tsx`): Handles categorized navigation, real-time search filtering, tag styling, and modal transition states (powered by static schema collections in `src/examples.ts`).
  - **Staging Panel** (`src/components/StagingModal.tsx`): Displays isolated staging directives and hidden script metadata (e.g. character directives, technical briefings, and camera directions) in a clean dialog overlay.
  - **Initializing Screen** (`src/components/InitializingScreen.tsx`): Branded loading spinner displayed during application bootstrap before data is ready.
  - **YouTube Source Input** (`src/components/YoutubeSourceInput.tsx`): Video URL/ID input field with connection status indicator and automatic ID extraction badge.
  - **Script Management Bar** (`src/components/ScriptManagementBar.tsx`): Displays loaded line count with an "Edit Raw" action button to open the raw script editor.
  - **Raw Script Modal** (`src/components/RawScriptModal.tsx`): Full-screen dialog for bulk editing the raw screenplay text.
  - **Raw Cues Modal** (`src/components/RawCuesModal.tsx`): Full-screen dialog for editing cue data in raw JSON format.
  - **Overlap Picker** (`src/components/OverlapPicker.tsx`): Floating context menu allowing users to select among multiple overlapping cues at the same script position.
  - **Delete Confirmation Modal** (`src/components/DeleteConfirmationModal.tsx`): Confirmation dialog with cue content preview before permanent deletion.
- **Type Definitions** (`src/types/script.ts`): Provides the `ScriptBlock` and `ScriptBlockType` type system used by the block-level parser, as well as the `Cue` interface used for sync cue data across all components.
- **Shared Utilities** (`src/lib/utils.ts`): Provides `cn` (Tailwind class merging via `clsx` + `tailwind-merge`) and `extractYoutubeId` (YouTube URL → video ID parsing), consumed by `App.tsx` and component modules.

## Data Flow Diagram
1. **Raw Text** (Input)
2. → `scriptParser.ts` (`parseScriptWithStaging` extracts staging blocks and markers)
3. → `scriptProcessor.ts` (`processScript` parses into `ProcessedLine[]`)
4. → `App.tsx` (Combines with `Cues[]` and `currentTime`)
5. → `scriptStyles.ts` (Applies CSS classes)
6. → **Interactive UI** (Output)
