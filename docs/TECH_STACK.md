# Tech Stack

This project is built with a modern, lightweight, and performant stack designed for real-time video synchronization and text processing.

## Core Framework
- **React 18**: Used for UI components and state management.
- **Vite**: The build tool and development server, providing fast HMR and optimized production builds.

## Styling & UI
- **Tailwind CSS**: Utility-first CSS framework for all styling.
- **Lucide React**: A comprehensive icon library used for all UI icons.
- **clsx & tailwind-merge**: Utilities for conditionally applying Tailwind classes without conflicts.
- **Google Fonts**: Uses "Inter" for UI and "JetBrains Mono" for technical data/notes.

## Video Integration
- **react-youtube**: A thin wrapper around the YouTube IFrame Player API, allowing programmatic control (play, pause, seek) and event monitoring (onStateChange).

## State Management & Persistence
- **React Hooks**: `useState`, `useEffect`, `useRef`, and `useMemo` for local component state.
- **LocalStorage**: Used to persist the script text, video ID, and sync cues between browser sessions.

## Analytics & Performance
- **Vercel Speed Insights**: Integrated to monitor real-time performance and Web Vitals in production.

## Utilities
- **Regex-based Parsing**: Custom heuristics for identifying script elements (headings, dialogue, names).
- **JSON-based Examples**: External JSON files used to load pre-configured script/video pairs.
