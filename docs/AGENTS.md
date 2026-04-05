# Agent Guidelines

This document provides instructions for AI agents (or developers) who need to extend or modify the SceneFlow codebase.

## 1. Extending the Script Parser
If you need to add a new line type (e.g., `LYRICS` or `TRANSITION`):
1.  Add the new type to the `LineType` enum in `src/lib/scriptProcessor.ts`.
2.  Update the `processScript` function with the regex/logic to detect this new type.
3.  Add the corresponding Tailwind classes to the `switch` statement in `src/lib/scriptStyles.ts`.

## 2. Modifying Styles
**DO NOT** add hardcoded Tailwind classes directly into `App.tsx` for script elements.
- Always use `src/lib/scriptStyles.ts`.
- Maintain the `baseStyle` constant to ensure consistent line height and text wrapping.

## 3. Regex Standards
The parser relies on specific regex patterns. When modifying them, ensure:
- **Character Names**: Must handle trailing colons and optional whitespace.
- **Scene Headings**: Must be case-insensitive for `int.` and `ext.`.
- **Staging**: Must use lazy matching `\[\[(.*?)\]\]` to handle multiple blocks on one line.

## 4. Sync Logic Precautions
The `renderedScript` `useMemo` in `App.tsx` is performance-critical.
- Avoid adding expensive calculations inside the `processedLines.forEach` loop.
- Ensure that any new interactive elements (like buttons or spans) have a stable `key` based on `lineIdx` or `cue.id`.

## 5. Persistence Safety
When adding new fields to the application state:
- Update the `AppState` interface in `App.tsx`.
- Ensure the `INITIAL_STATE` object is updated.
- Verify that the `useEffect` responsible for `localStorage.setItem` includes the new state field in its dependency array.
