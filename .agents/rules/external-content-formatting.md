---
description: Formatting rules and link discipline for external platform outputs (GitHub PRs, issues, commits, release notes).
---

# External Content Formatting & Link Discipline

When generating content intended to be copied, committed, or submitted to external platforms (such as GitHub Pull Requests, Issue descriptions, Conventional Commits, or Release Notes):

1. **Zero `file:///` Links**: Never include `file:///` URLs or local absolute paths (e.g. `e:/_github/...` or `C:\Users\...`).
2. **Repository-Relative Paths**: Reference files strictly using clean repository-relative paths inside inline code backticks:
   - ✅ `src/components/AppHeader.tsx`
   - ✅ `src/hooks/useScriptPreferences.ts`
   - ❌ `[AppHeader.tsx](file:///e:/_github/Screenplay-Sync/src/components/AppHeader.tsx)`
3. **Platform-Safe Markdown**: Ensure tables, alert syntax, and keyboard shortcuts (`<kbd>`) adhere to standard GitHub-Flavored Markdown (GFM).
