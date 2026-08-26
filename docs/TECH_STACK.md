# Tech Stack

SceneFlow is built with a modern, lightweight, and performant web stack designed for real-time video synchronization, deterministic text parsing, and fluid cross-device interaction.

---

## 1. Core Framework & Build Tooling

- **React 19 (`react`, `react-dom: ^19.0.0`)**: Powers declarative UI rendering, concurrent features, and reactive component lifecycles.
- **TypeScript 5.8 (`typescript: ~5.8.2`)**: Provides strict type safety across cue structures, processed screenplay lines, staging markers, theme tokens, and component props.
- **Vite 6 (`vite: ^6.2.0`, `@vitejs/plugin-react: ^5.0.4`)**: Build tool and local development server with instant Hot Module Replacement (HMR) and optimized rollup production bundles.
- **TSX (`tsx: ^4.21.0`)**: TypeScript execution runtime for auxiliary scripts.

---

## 2. Styling, UI, & Typography

- **Tailwind CSS v4 (`tailwindcss: ^4.1.14`, `@tailwindcss/vite: ^4.1.14`)**: Utility-first CSS framework utilizing modern CSS `@theme` variables:
  - `--font-sans`: `"Inter", ui-sans-serif, system-ui, sans-serif`
  - `--font-serif`: `"Libre Baskerville", serif`
  - `--font-mono`: `"JetBrains Mono", monospace`
- **Modular Design Token Engine (`src/styles/`)**: Centralized design tokens and theme packages:
  - `UI_TOKENS` (`src/styles/tokens/ui.ts`): Uniform Tailwind class definitions for modal surfaces, overlays, buttons, inputs, icon wrappers, swatches, and alerts.
  - Theme Tokens (`src/styles/tokens/themes.ts`, `cues.ts`, `typography.ts`, `helpers.ts`): Theme-calibrated color palettes and typography rules.
- **clsx (`^2.1.1`) & tailwind-merge (`^3.5.0`)**: Utility functions merged via `cn()` in `src/lib/utils.ts` to safely combine dynamic and conditional Tailwind classes without collisions.
- **Motion (`motion: ^12.23.24`)**: Modern animation engine (from the creators of Framer Motion) providing spring physics for dialog transitions, overlay backdrops, and mobile bottom-sheet drawers (`motion/react`).
- **Lucide React (`lucide-react: ^0.546.0`)**: Icon library powering navigation, playback controls, category badges, and modal actions.
- **Google Fonts**:
  - *Inter*: Standard UI controls, navigation labels, and timing indicators.
  - *Libre Baskerville*: Screenplay body, character names, and dialogue.
  - *JetBrains Mono*: Technical notes, timecodes, JSON raw views, and Auteur Brief directives.
- **Custom Scrollbar Utilities**:
  - `.custom-dark-scrollbar`: Thin styled scrollbars for dark modal drawers.
  - `.scrollbar-hide` / `.no-scrollbar`: Cross-browser utility to suppress scrollbars while preserving touch and trackpad scrollability.

---

## 3. Video Integration

- **react-youtube (`^10.1.0`)**: React wrapper around the YouTube IFrame Player API enabling:
  - Programmatic playback control (play, pause, seek).
  - High-frequency time tracking (100ms polling loop).
  - Event listener synchronization for player state changes (`onStateChange`, `onReady`).

---

## 4. State Management, Persistence, & Data Fetching

- **React Hooks**: Local component state orchestrated via `useState`, `useEffect`, `useRef`, and memoized highlighting through `useMemo`. Eight modular custom hooks (`useScriptStorage`, `useYouTubePlayer`, `useScriptPreferences`, `useAutoScroll`, `useCueEditor`, `useCueAlignment`, `useKeyboardShortcuts`, `useScriptTheme`) with a unified `src/hooks/index.ts` barrel encapsulate state lifecycle, playback control, theme resolution, and side effects, keeping `App.tsx` as a lightweight orchestrator.
- **LocalStorage**: Client-side persistence for:
  - `'screenplay_sync_state'`: Video source, screenplay raw text, cues array, and timing offsets.
  - `'sceneflow_script_theme'`: Active script viewer theme ID (`ScriptThemeId`).
  - `'sceneflow_script_width_preset'`: Desktop reading width preset (`ScriptWidthPresetId`).
  - `'sceneflow_scroll_focus_preset'`: Desktop auto-scroll viewport anchor (`ScrollFocusPresetId`).
- **Fetch API**: Asynchronously retrieves built-in JSON examples and remote projects.
- **URLSearchParams**: Parses query parameters (`?example=ID`, `?project=URL`) on initial boot, with automatic URL cleanup using `window.history.replaceState`.

---

## 5. Analytics & Performance Monitoring

- **Vercel Speed Insights (`@vercel/speed-insights: ^2.0.0`)**: Real-time Web Vitals and performance monitoring in production environments.
- **Vercel Analytics (`@vercel/analytics: ^2.0.1`)**: Privacy-friendly audience and traffic insights for production deployments.

---

## 6. Progressive Web App & Static Assets

- **PWA Web Manifest (`public/site.webmanifest`)**: Standalone display configuration with theme colors and application metadata.
- **Icon Suite**: Multi-resolution icons including `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), and Android Chrome icons (192×192, 512×512).

---

## 7. Additional Dependencies

- **dotenv (`^17.2.3`)**: Environment variable loader for configuration management.
- **express (`^4.21.2`) & `@types/express` (`^4.17.21`)**: Lightweight HTTP server utilities for preview or self-hosted deployment environments.
- **@google/genai (`^1.29.0`)**: Official Google Gen AI SDK for AI workflow integrations.

