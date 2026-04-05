# Functionality

SceneFlow is a specialized tool for synchronizing video playback with a written script.

## 1. Script Parsing
The app automatically formats raw text into a professional screenplay layout using the following heuristics:
- **Scene Headings**: Lines starting with `INT.` or `EXT.` are bolded and given a gray background.
- **Character Names**: Lines in ALL CAPS ending with a colon (e.g., `JOHN:`) are centered and bolded.
- **Dialogue**: Lines following a character name are centered and narrowed.
- **Parentheticals**: Text inside `(...)` is italicized and faded.
- **Actions**: Lines in ALL CAPS (no colon) are bolded and uppercase.
- **Notes**: Text inside `[...]` is rendered in a small monospace font.
- **Effects**: Lines starting with `SFX:` or `VFX:` are italicized and faded.
- **Separators**: A line with exactly `---` creates a horizontal divider.
- **Part/Roman Titles**: Lines like `PART 1` or `I. TITLE` are centered with decorative lines.

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
- **Auto-Scroll**: The script automatically scrolls to keep the active dialogue in view.

## 4. Modes
- **Playback Mode**: A clean, distraction-free view for watching the video and reading the script.
- **Edit Mode**: An interactive workspace for adjusting cues, editing script text, and managing settings.

## 5. Persistence
All work is automatically saved to the browser's `localStorage`. Users can also:
- **Export**: Download the project as a JSON file.
- **Import**: Upload a previously exported JSON file to resume work.
- **Library**: Load pre-configured examples from the built-in library.
