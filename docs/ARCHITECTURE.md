# Architecture

The project follows a modular 3-layer architecture to separate script processing logic from UI rendering.

## 1. Logic Layer (`src/lib/scriptProcessor.ts`)
The "Brain" of the application. It is responsible for:
- **Scanning raw text**: Iterating through the script line-by-line.
- **Semantic Detection**: Using regex and heuristics to classify lines as `heading`, `name`, `speech`, `action`, `note`, `effect`, or `separator`.
- **Dialogue Context**: Identifying which character is speaking and linking their name to the subsequent speech blocks.
- **Position Mapping**: Calculating the exact start and end character indices for every line to ensure sync cues remain accurate.
- **Staging Extraction**: Identifying `[[STAGING]]` blocks and extracting them into interactive markers.

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

## Data Flow Diagram
1. **Raw Text** (Input)
2. → `scriptProcessor.ts` (Parses into `ProcessedLine[]`)
3. → `App.tsx` (Combines with `Cues[]` and `currentTime`)
4. → `scriptStyles.ts` (Applies CSS classes)
5. → **Interactive UI** (Output)
