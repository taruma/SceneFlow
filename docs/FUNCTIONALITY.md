# Functionality

SceneFlow is a specialized tool for synchronizing video playback with a written script.

## 1. Script Parsing
The app automatically formats raw text into a professional screenplay layout using the following heuristics:
- **Scene Headings**: Lines starting with `INT.` or `EXT.` are bolded and given a gray background.
- **Character Names**: Lines in ALL CAPS ending with a colon (e.g., `JOHN:`) are centered and bolded.
- **Dialogue**: Lines following a character name are centered and narrowed.
- **Parentheticals**: Text inside `(...)` is italicized and faded.
- **Actions**: Standard narrative text is rendered in a serif-like font.

## 2. Staging System
Special blocks of text wrapped in double brackets `[[STAGING]]` are treated as "off-script" metadata.
- **Hiding**: These blocks are removed from the main script flow to keep it clean.
- **Markers**: A floating "STAGING" badge is placed at the line where the block was found.
- **Modal**: Clicking the badge opens a modal containing the hidden text (e.g., camera directions, lighting notes).

## 3. Syncing System (Cues)
The core feature of the app is the ability to create "Cues."
- **Creation**: Highlight text in the script and click "Add Cue" to link it to the current video time.
- **Highlighting**: As the video plays, the corresponding text in the script highlights in real-time.
- **Overlaps**: Multiple cues can overlap on the same text. An indicator (dot) appears in Edit mode to help manage these.
- **Alignment**: An "Align" tool automatically fixes script indices if the text is modified.
- **Duplicate Text Resolution**: When multiple identical strings exist in the script (e.g., "WIDE SHOT"), users can use the "Find Alternative" button in the Edit Cue UI to browse all occurrences and snap the cue to the correct one.
- **Auto-Scroll**: The script automatically scrolls to keep the active cue in view.
  - **Focus Modes**: Users can multi-select specific cue types to follow (e.g., only Dialogue and Action).
  - **Priority Logic**: When multiple cues are active, the system prioritizes the most recently started cue among the selected types.
- **Creative Briefs**: Use `[<BRIEF>]` and `[</BRIEF>]` tags for technical directives.
  - **Monospace style**: Distinguishes technical data from script text.
  - **Step-Formatting**: Every `->` triggers a newline and indentation.
  - **Anchor Bold**: Brackets `[...]` are automatically bolded within briefs.
  - **Sync-Ready**: Cues and highlighting remain fully functional inside brief blocks.
- **Timing Settings**: Fine-tune when highlights appear and disappear.
  - **Offsets**: Supports both positive (extra buffer) and negative (early/shorter appearance) values.
  - **Calculation**: Final visibility = Cue Time ± (Global Offset + Category Offset).

## 4. Modes
- **Playback Mode**: A clean, distraction-free view for watching the video and reading the script.
- **Edit Mode**: An interactive workspace for adjusting cues, editing script text, and managing settings.

## 5. Persistence & Sharing
All work is automatically saved to the browser's `localStorage`. Users can also:
- **Export**: Download the project as a JSON file.
- **Import**: Upload a previously exported JSON file to resume work.
- **Library**: Load pre-configured examples from the built-in library.
- **Query Parameters**: Load specific examples or remote projects directly via URL.
  - `?example=ID`: Loads a built-in example (e.g., `mosaic`, `expansion`).
  - `?project=URL`: Loads a JSON project from a remote, CORS-enabled server.
- **Remote Loading**: When loading via URL, a confirmation dialog appears with integrated error handling to prevent accidental data loss and provide feedback on failed fetches.
