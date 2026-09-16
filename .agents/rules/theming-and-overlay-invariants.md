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
- **App Shell Theme Selector**: The header's `[ ⚙️ Settings ▾ ]` dropdown (`SettingsMenuDropdown.tsx`) houses a direct 4-option grid selector (`Auto`, `Light`, `Warm`, `Dark`) mapped directly to `setThemeMode` from `useAppShellTheme` with accessible `role="radiogroup"` and `role="radio"` semantics.
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

## 4. Cue Palette Profiles & Color Vision Accessibility Invariants
SceneFlow supports selectable cue palette profiles (`CuePaletteProfile`: `'standard' | 'protanopia'`) to ensure distinct visual legibility across all categories regardless of color vision capability:
1. **Red-Green Color Vision Deficiency (CVD) Invariant**:
   - In Protanopia (diminished L-cones) and Deuteranopia (diminished M-cones), red and green sensitivities are compressed. Standard purple/indigo (Shot) and blue (Action) collapse into indistinguishable blue tones when luminance levels match ($L^* \approx 50$).
   - **Remapping Guard**: In the `protanopia` profile, **Shot** is strictly remapped away from the blue/indigo spectrum to **Deep Wine / Burgundy** (`rgb(136, 19, 55)` in light paper / `rgb(225, 29, 72)` in dark paper). This produces a distinct dark chocolate-wine tone ($L^* \approx 25$) that provides stark luminance and chromatic separation against Cobalt Blue Action ($L^* \approx 50$).
   - **Complementary Vibrancy**: VFX is elevated to high-luminance Ice Aqua (`rgb(103, 232, 249)` in dark themes, $L^* \approx 85$) and Transition to warm Vermilion Coral (`rgb(234, 88, 12)`), preventing overlap across all 8 categories.
2. **Dynamic Resolution Invariant**:
   - Any component or hook resolving cue colors (`useScriptTheme`, `getCueColorForTheme`, `resolveCueColor`) must accept and forward the active `paletteProfile` and `scriptThemeId`.
   - Never render category color dots or selection pills with static Tailwind classes (`color.class`); always resolve dynamically via `themed.dotColor` or `rgb(${themed.rgb})` with `scriptThemeId` and `cuePaletteProfile` calibration to ensure consistency across light, warm, dark, and CVD-safe modes.
3. **Backward Compatibility Invariant**:
   - Historical script JSON files and local states containing legacy Tailwind classes (`bg-purple-400/50`, `bg-pink-400/50`, `bg-blue-400/50`, `bg-green-400/50`) must always be normalized via `LEGACY_CLASS_MAP` in `cueUtils.ts` and `cues.ts` without data loss.

## 5. Token Pairing & Surface Contrast Invariants
- **Primary Button Inversion**: `--btn-primary-text` is specifically paired with `--btn-primary-bg`. In dark mode, primary action buttons invert to light backgrounds (`#f5f5f4`), causing `--btn-primary-text` to become dark (`#1c1917`).
- **Surface Isolation Guard**: Never use `text-btn-primary-text` inside permanently dark surfaces such as `bg-surface-dark` (e.g., permanently dark indicators or overlays), as this creates near-black on black contrast failure (~1.1:1). Always use explicit `text-white` or tokens coupled with the appropriate surface background.
- **Translucent Accent Surfaces Invariant**: Container panels designed with chromatic emphasis or callouts (such as the General Master Offset card in `TimingSettingsModal`) must strictly utilize alpha-translucent tokens (`bg-blue-500/10`, `border-blue-500/20`) rather than opaque static light-mode fills (`bg-blue-50`, `border-blue-100`). This ensures callout cards produce an ambient accent wash on light surfaces while naturally illuminating as a sleek, low-glare dark navy container in dark and pure black modes without inverting nested input contrast.

## 6. Translucent Ambient Gradient Opacity Calibration Invariants
When rendering directional translucent gradient washes or ambient color overlays across variable theme surfaces (Studio Crisp white, Parchment warm sepia, Midnight Slate, and OLED pure black):
1. **Perceptual Invisibility Floor (`< 8%`)**:
   - Alpha opacities under 8% on the leading edge are virtually imperceptible in standard desktop and laptop display conditions against neutral surfaces.
   - Never use opacity multipliers that scale effective gradient colors below 8% unless the intended effect is complete transparency.
2. **Secondary Ambient Wash (`14%–16% → 4%–5%`)**:
   - For secondary, co-active, or non-focused items (such as secondary active cues in multi-cue playback), calibrate the leading edge to `14%–16%` falling off to `4%–5%` on the trailing edge.
   - This provides an immediate, unmistakable category tint that communicates active status without edge borders, outer glow shadows, or text legibility penalties.
3. **Primary Focus Wash (`22%–25% → 6%–7%`)**:
   - For primary focus items (such as the primary active cue driving auto-scroll), calibrate the leading edge to `22%–25%` falling off to `6%–7%`.
   - Pair with an active category border (`rgba(rgb, 0.65)`), outer glow halo (`0 0 10px rgba(rgb, 0.3)`), and expanded theme stripe (`w-1.5`) to establish definitive visual primacy over secondary items.

## 7. Category-Harmonized Interactive States Invariant
When rendering selectable, clickable, or active items that possess a category color (cues, cards, timeline blocks, tags):
1. **No Static Accent Rings**: Never hardcode generic blue borders (`border-blue-500`, `ring-blue-500`) for active or selected states on categorized domain entities.
2. **Dynamic RGB Derivation**:
   - Selected Border: `borderColor: rgba(${themed.rgb}, 0.7)` with `boxShadow: 0 0 0 1px rgba(${themed.rgb}, 0.5)`.
   - Active Playback Border/Glow: `borderColor: rgba(${themed.rgb}, 0.55)` with `boxShadow: 0 0 8px rgba(${themed.rgb}, 0.25), 0 0 0 1px rgba(${themed.rgb}, 0.3)`.
3. **Theme & CVD Profile Compatibility**: Deriving from `themed.rgb` guarantees that interactive selection states remain visually harmonious across Light, Warm, Dark, and Protanopia-safe palettes without secondary color collisions.

## 8. Instant Theme Switching & Transition Suppression Invariant
When updating themes, modes, or canvas modifiers:
1. **Zero Persistent Color Transitions**: Never attach long or persistent CSS color transitions (`transition: background-color 0.25s`, `transition-colors duration-200`) to `body`, `.script-paper-container`, or workstation panel containers. Simultaneous full-script React reconciliation and CSS variable recalculation cause severe main-thread frame drops and transition judder.
2. **Momentary Transition Suppression (`disableTransitionsTemporarily`)**:
   - Whenever updating theme mode (`setThemeMode`), screenplay theme preset (`setScriptThemeId`), or canvas modifiers (`setPureBlackMode`), invoke `disableTransitionsTemporarily()` from `src/hooks/useAppShellTheme.ts`.
   - This momentarily adds `.disable-theme-transitions` (forcing `transition: none !important;` across all DOM nodes and pseudo-elements), triggers a synchronous layout flush (`void root.offsetHeight`), and removes the class via double `requestAnimationFrame`.
   - This ensures theme switches are instantaneous cuts while preserving snappy interactive button hover and click micro-animations (`active:scale-95`).


