---
description: Universal checklist for adding or updating examples across all 4 SceneFlow categories (AI Scenes, The Written Motion, FRAME Series, AI Clips)
---

# Catalogue Examples Invariant

When adding or updating any example in SceneFlow:
1. **Asset Path**: Always verify that `path` in `src/examples.ts` matches the exact JSON filename in `public/examples/` (including subdirectories like `scenes/` or `ai_clips/`).
2. **Catalogue Sync**: Always update `SCENEFLOW_CATALOGUE.md`:
   - Increment the section count in the header: `## <Category> (N)`.
   - Insert the row into the appropriate category table in reverse-chronological order (newest `Date` first).
3. **Integrity & Lint**: Verify JSON structure and run `npm run lint` (`tsc --noEmit`).
4. **Commit Format**: Use `feat: add <Title> [<category>] example and register it in catalogue`.
