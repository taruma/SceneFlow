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
- **Duplicate Text Resolution**: When multiple identical strings exist in the script (e.g., "WIDE SHOT"), users can use the "Find Alternative" button in the Edit Cue UI to browse all occurrences and snap the cue to the correct one. The system automatically ignores text matches inside `[[STAGING]]` blocks and system tags like `[<BRIEF>]` to ensure alignment only targets visible screenplay content, while allowing functional notes like `[INTENT]` to remain visible.
- **Auto-Scroll**: The script automatically scrolls to keep the active cue in view.
  - **Focus Modes**: Users can multi-select specific cue types to follow (e.g., only Dialogue and Action).
  - **Priority Logic**: When multiple cues are active, the system prioritizes the most recently started cue among the selected types.
  - **Enhanced Viewport Alignment**:
    - **Desktop View**: The screen auto-scrolls to position the active cue slightly above the center (35% from the top of the container) so users can see upcoming lines and surrounding context.
    - **Mobile/Tablet View**: The screen auto-scrolls to position the active cue directly in the center of the viewport for comfortable reading.
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
- **GUIDE (Quick Start)**: Every fresh installation or "Blank" project loads the SceneFlow GUIDE—an interactive tutorial that explains formatting, staging, and cue management through narrative examples.
- **Export**: Download the project as a JSON file.
- **Import**: Upload a previously exported JSON file to resume work.
- **Library Catalogue**: An immersive, built-in portal containing a fully-categorized selection of pre-configured scripts, interactive examples, and cinematic portfolios:
  - **Category Segments**:
    - **Featured**: Highly recommended or award-nominated scripts highlighted as core workspace showcases (e.g., *The Expansion*, *Frog Invasion*, *Elemental Forces*, *Fractures*, *Old Growth*, *Forgotten*).
    - **AI Short Film**: High-concept cinematic narratives demonstrating advanced AI-assisted screenplay layouts (e.g., *The Expansion*, *Intent Over Rules*, *Mosaic*, *Frog Invasion*, *The Distance*).
    - **The Written Motion (TWM)**: The complete five-volume series (Volumes 1-5, including *The Breaking Point*, *Elemental Forces*, *Kinetic*, *Wayfarers*, *Fractures*) styled with detailed cues and motion directives.
    - **AI Clips**: Short-form cinematic scripts and dialogue-focused technical vignettes (e.g., *Wild Kinship*, *These Lamps*, *Musical Lipsync*, *Let's Learn VFX*, *Table Four*, *Lucas & Mark*).
    - **FRAME Series**: An expressive visual compilation demonstrating atmospheric transitions, lighting, and environmental camera techniques (including *Distant*, *Wandering Souls*, *Relics of Time*, *Where Am I?*, *Old Growth*, *Forgotten*, *Samsara*, *Still, Restless*).
  - **Advanced Portal Utilities**:
    - **Dynamic "Featured" Curations**: A curated segment gathering flagged screenplays via simple database/schema properties.
    - **Default Sorting & Interactive Controls**: By default, screenplays are sorted chronologically by release date (newest first). Users can dynamically toggle the sort order or method using a compact UI selector (Latest, Oldest, or Alphabetical A-Z) next to the match count. Restricted/work-in-progress scripts (which do not have playable paths) are always pushed to the bottom of the listings under all sorting configurations to prioritize active content.
    - **Subtle Visual Highlights**: Featured scripts render with high-contrast amber/gold undertone gradients, stylized glow on mouse hover, dedicated tag layouts, and animated golden sparkle badge indicators both in the Featured tab and their default list sections.
    - **Real-time Global Search**: Instantly filters across script titles, descriptions, volume indices, release dates, and technical tagging arrays.
    - **Category Sidebar Navigation**: Reactive navigation featuring custom category symbols (Compass, Film, Notebook, Clapperboard, Book-Open) and automatic category item counters.
    - **Smart Interface Indicators**: Released screenplays highlight with responsive pointer translations and arrow indicators; draft/experimental scripts display a visual Lock icon and a subdued color scheme to prevent interaction.
    - **Volume & Tag Badging**: Renders custom metadata badges highlighting release dates, specific volume series, and structural metadata tags (such as `classic auteur`, `visual exploration`, or `nano banana pro`).
- **Query Parameters**: Load specific examples or remote projects directly via URL.
  - `?example=ID`: Loads a built-in example (e.g., `mosaic`, `expansion`, `guide`).
  - `?project=URL`: Loads a JSON project from a remote, CORS-enabled server.
- **Remote Loading**: When loading via URL, a confirmation dialog appears with integrated error handling to prevent accidental data loss and provide feedback on failed fetches.
