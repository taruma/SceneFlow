---
name: cmsg
description: >-
  Generates a concise, high-craft Conventional Commit message for recent git changes.
  Triggered when the user invokes /cmsg or requests a commit message for recent work.
---

# Commit Message Generator (`/cmsg`)

This skill inspects current git status and diffs to produce a production-ready conventional commit message following the repository's established conventions.

## Procedure

1. **Inspect Repository State**:
   - Run `git status -s` to inspect modified, staged, and untracked files.
   - Run `git diff` for unstaged changes and `git diff --cached` for staged changes.
   - If the working directory is clean, run `git log -n 1 --stat` and `git diff HEAD~1 HEAD` to inspect the most recent commit.

2. **Commit Message Conventions**:
   - Use the standard conventional commit format: `<type>(<scope optional>): <imperative summary>`
   - Common types:
     - `feat`: New user-facing or architectural capability
     - `fix`: Bug fix
     - `refactor`: Internal restructuring without behavior change
     - `docs`: Documentation, guides, or changelog updates
     - `perf`: Performance optimizations
     - `chore`: Dependency updates, build configs
   - Include concise, impactful bullet points detailing the functional and architectural changes.

3. **Output Discipline**:
   - Output **ONLY** the commit message formatted inside a single plain text code block.
   - Do **NOT** wrap with conversational filler, preambles, or explanations unless explicitly requested by the user.
