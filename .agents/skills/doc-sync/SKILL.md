---
name: doc-sync
description: >-
  Synchronizes project documentation (CHANGELOG.md, docs/AGENTS.md, .agents/rules/, 
  docs/ARCHITECTURE.md, and docs/FUNCTIONALITY.md) based on recent git changes.
  Triggered when the user invokes /doc-sync or asks to update documentation/changelog.
---

# Documentation Sync Workflow (`/doc-sync`)

This skill automates the synchronized updating of SceneFlow's documentation suite whenever architectural, feature, or refactoring changes are made in the codebase.

## 1. Inspect Recent Changes
1. Run `git status -s` and `git diff` to inspect pending or staged modifications.
2. If working directory is clean, run `git log -n 1 --stat` and `git diff HEAD~1 HEAD` to inspect the most recent commit.
3. Identify:
   - **Architectural / Component changes**: New components, extracted sub-components, or decoupled containers.
   - **State / Hook changes**: State schema updates, new props, hook return signatures.
   - **User-facing changes**: Visual controls, density options, keyboard shortcuts, or UI improvements.

## 2. Target Documentation Suite

Apply targeted, synchronized updates across the following files:

| File | Scope & Guidelines |
| :--- | :--- |
| **`CHANGELOG.md`** | Add bullet points under `## [<version>-dev] - Unreleased` using standard Keep a Changelog categories (`### Added`, `### Fixed`, `### Refactored`, `### Changed`). |
| **`docs/AGENTS.md`** | Update architectural invariants, state contracts, storage keys, or modular sub-package rules in Section 8 (or relevant sections). |
| **`.agents/rules/*.md`** | Update relevant domain rule files (e.g. `media-sync-timeline.md`) with any new invariants or container separation rules. |
| **`docs/ARCHITECTURE.md`** | Update component counts (e.g. in UI Layer diagram), component descriptions in Section 5, or data flow diagrams. |
| **`docs/FUNCTIONALITY.md`** | Update user-facing feature descriptions, heuristic tables, or control options in Section 4 or relevant feature sections. |

> [!IMPORTANT]
> **Strict Exclusion**: **NEVER** edit files under `docs/release_notes/`. Release notes are reserved strictly for official tagged production releases.

## 3. Verification & Reporting
1. Run `npm run lint` (`tsc --noEmit`) to ensure no syntax errors were introduced.
2. Provide a concise summary of the exact sections updated across each documentation file.
3. Optionally offer a commit message formatted for the documentation updates.
