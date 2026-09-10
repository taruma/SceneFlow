---
description: Architectural rules and invariants for two-tier theming independence (App Shell vs. Script Paper) and video overlay screen recording modes in SceneFlow.
---

# Theming Independence & Video Overlay Invariants

When developing, modifying, or styling themes, modals, or visual overlays in SceneFlow, strictly observe these core principles:

## 1. Two-Tier Theming Independence Principle
SceneFlow maintains two distinct visual tiers that must never leak into or corrupt each other:
1. **App Shell Tier (`useAppShellTheme`)**:
   - Controls application chrome: Header, Left Playback Panel, Timeline container, modals, and desk surface.
   - Operates in `themeMode`: `'auto' | 'light' | 'warm' | 'dark'`.
2. **Script Paper Tier (`useScriptTheme` / `SCRIPT_THEMES`)**:
   - Controls screenplay manuscript: Paper background, borders, typography contrast, scene banners, and cue highlights.
   - Categorized into: `'light' | 'warm' | 'dark'`.

### The Independence Invariant
- When `themeMode === 'auto'`, the shell mirrors the script theme category.
- When `themeMode` is explicitly set to `'light'`, `'warm'`, or `'dark'`, **Auto Color is OFF**. In this state, the script paper tier remains 100% independent.
- **Rule**: Never evaluate the App Shell's `effectiveCategory` when determining script paper styles, Color Modal status badges, or script-specific modifiers. Always evaluate `scriptTheme.category` directly.
- **DOM Segregation**: Use separate DOM attributes (`data-pure-black-script="true"` vs. `data-pure-black-shell="true"`).

## 2. Video Compositing & Screen Recording Overlay Invariants
When implementing or modifying video overlay modes (optimized for NLE **Screen** / **Lighten** blend modes):
1. **Absolute Black (`#000000`)**: Video blend modes require literal RGB `0, 0, 0` for 100% transparency. Any off-black tint (`#0c0a09`, `#18181b`) causes a milky, washed-out rectangular box over footage.
2. **Preserve Borders, Strip Shadows**:
   - Always remove fuzzy drop shadows (`!shadow-none`) to avoid blurry edge halos in compositing.
   - Always **preserve the 1px paper border** (`activeTheme.paperBorder`) so the screenplay maintains clear structural definition.
3. **Suppress Distracting Artifacts**:
   - Hide decorative elements like paper punch holes (`display: none`).
   - Flatten scene heading banner fills to `transparent` (`script-heading-banner`).
   - Flatten brief cards to `#000000` (`script-brief-card`).
4. **Full-App Alignment for Cropped Screen Captures**:
   - Creators often record cropped sections of the timeline or filter badges. When the shell is dark, ensure timeline tracks (`.timeline-track-field`) and filter pills render on `#000000`.

## 3. Light & Warm Theme Non-Destructive Guard
- Pure black canvas is strictly an additive modifier for **dark themes**.
- Light and warm themes (*Studio Crisp*, *Warm Parchment*, *Newsprint*) must remain completely untouched regardless of whether the pure black toggle is enabled.
