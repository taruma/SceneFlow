/**
 * Single Source of Truth: Keyboard Shortcuts Registry
 * 
 * Provides centralized metadata for all keyboard shortcuts in SceneFlow.
 * Used for:
 * - Keyboard Shortcuts Help Palette (triggered via '?')
 * - AppInfoModal shortcuts table
 * - Menu item badges and tooltip hints
 * - Platform-aware key combination formatting
 */

export type ShortcutCategoryId = 
  | 'playback'
  | 'studio'
  | 'editor'
  | 'inspector'
  | 'dividers'
  | 'general';

export interface ShortcutCategory {
  id: ShortcutCategoryId;
  label: string;
  description: string;
  iconName: 'Play' | 'Sliders' | 'FileText' | 'CheckSquare' | 'Split' | 'HelpCircle';
}

export interface ShortcutItem {
  id: string;
  category: ShortcutCategoryId;
  label: string;
  description: string;
  /** Primary keys for display/documentation */
  keys: {
    win: string[];
    mac: string[];
  };
  /** Contextual note when the shortcut is available */
  context?: string;
  /** Key alias hints (e.g. ['Space', 'K']) */
  aliases?: string[];
}

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    id: 'playback',
    label: 'Playback & Media',
    description: 'Control YouTube video transport, seek time, and layout',
    iconName: 'Play',
  },
  {
    id: 'studio',
    label: 'Studio Preferences',
    description: 'Customize colors, timings, and viewport layout',
    iconName: 'Sliders',
  },
  {
    id: 'editor',
    label: 'Screenplay Editor',
    description: 'Directorial markup, undo/redo history, and word wrap',
    iconName: 'FileText',
  },
  {
    id: 'inspector',
    label: 'Cue Inspector',
    description: 'Fast cue authoring, save, and draft cancellation',
    iconName: 'CheckSquare',
  },
  {
    id: 'dividers',
    label: 'Splitters & Layout',
    description: 'Resize panels and dividers via keyboard',
    iconName: 'Split',
  },
  {
    id: 'general',
    label: 'General & Navigation',
    description: 'Modal dismissal, quick cheat-sheet, and search',
    iconName: 'HelpCircle',
  },
];

export const SHORTCUTS_REGISTRY: ShortcutItem[] = [
  // --- Playback & Media ---
  {
    id: 'playback.playPause',
    category: 'playback',
    label: 'Play / Pause',
    description: 'Toggle video playback between play and pause states',
    keys: {
      win: ['Space'],
      mac: ['Space'],
    },
    aliases: ['K'],
    context: 'Requires loaded video player',
  },
  {
    id: 'playback.seekBackward',
    category: 'playback',
    label: 'Seek Backward 5s',
    description: 'Jump playhead back 5 seconds',
    keys: {
      win: ['←'],
      mac: ['←'],
    },
    aliases: ['J'],
    context: 'Requires loaded video player',
  },
  {
    id: 'playback.seekForward',
    category: 'playback',
    label: 'Seek Forward 5s',
    description: 'Jump playhead forward 5 seconds',
    keys: {
      win: ['→'],
      mac: ['→'],
    },
    aliases: ['L'],
    context: 'Requires loaded video player',
  },
  {
    id: 'playback.toggleVideo',
    category: 'playback',
    label: 'Toggle Video Visibility',
    description: 'Collapse or expand the video player panel',
    keys: {
      win: ['V'],
      mac: ['V'],
    },
    context: 'Desktop & tablet layouts',
  },

  // --- Studio Preferences ---
  {
    id: 'studio.colors',
    category: 'studio',
    label: 'Script Paper & Colors',
    description: 'Open theme presets, paper tint, and cue color customization',
    keys: {
      win: ['Shift', 'C'],
      mac: ['Shift', 'C'],
    },
    context: 'Global',
  },
  {
    id: 'studio.timing',
    category: 'studio',
    label: 'Timing & Durations',
    description: 'Open default duration preferences and auto-scroll speeds',
    keys: {
      win: ['Shift', 'T'],
      mac: ['Shift', 'T'],
    },
    context: 'Global',
  },
  {
    id: 'studio.resetLayout',
    category: 'studio',
    label: 'Reset View Layout',
    description: 'Restore default split ratios, panel widths, and video height',
    keys: {
      win: ['Shift', 'R'],
      mac: ['Shift', 'R'],
    },
    context: 'Global',
  },

  // --- Screenplay Editor ---
  {
    id: 'editor.undo',
    category: 'editor',
    label: 'Undo Edit',
    description: 'Revert last edit in the script canvas',
    keys: {
      win: ['Ctrl', 'Z'],
      mac: ['⌘', 'Z'],
    },
    context: 'Inside Raw Script Editor',
  },
  {
    id: 'editor.redo',
    category: 'editor',
    label: 'Redo Edit',
    description: 'Reapply reverted edit in the script canvas',
    keys: {
      win: ['Ctrl', 'Y'],
      mac: ['⌘', 'Shift', 'Z'],
    },
    aliases: ['Ctrl+Shift+Z'],
    context: 'Inside Raw Script Editor',
  },
  {
    id: 'editor.wordWrap',
    category: 'editor',
    label: 'Toggle Word Wrap',
    description: 'Toggle between soft line wrap and horizontal scrolling',
    keys: {
      win: ['Alt', 'Z'],
      mac: ['Option', 'Z'],
    },
    context: 'Inside Raw Script Editor',
  },
  {
    id: 'editor.apply',
    category: 'editor',
    label: 'Apply & Save Script',
    description: 'Commit changes and realign active cue anchors',
    keys: {
      win: ['Ctrl', 'Enter'],
      mac: ['⌘', 'Enter'],
    },
    context: 'Inside Raw Script Editor',
  },

  // --- Cue Inspector ---
  {
    id: 'inspector.saveCue',
    category: 'inspector',
    label: 'Save / Update Cue',
    description: 'Commit current draft cue into the sync timeline',
    keys: {
      win: ['Ctrl', 'Enter'],
      mac: ['⌘', 'Enter'],
    },
    context: 'Inside Cue Inspector Form',
  },
  {
    id: 'inspector.cancelDraft',
    category: 'inspector',
    label: 'Cancel Draft',
    description: 'Discard cue draft changes and clear text selection',
    keys: {
      win: ['Esc'],
      mac: ['Esc'],
    },
    context: 'Inside Cue Inspector Form',
  },

  // --- Splitters & Layout ---
  {
    id: 'dividers.videoHeight',
    category: 'dividers',
    label: 'Adjust Video Height',
    description: 'Increase or decrease player height by 10px',
    keys: {
      win: ['↑', '↓'],
      mac: ['↑', '↓'],
    },
    context: 'When Video Split Divider is focused',
  },
  {
    id: 'dividers.splitRatio',
    category: 'dividers',
    label: 'Adjust Split Ratio',
    description: 'Shift screenplay / video split ratio by 1%',
    keys: {
      win: ['←', '→'],
      mac: ['←', '→'],
    },
    context: 'When Split Divider is focused',
  },
  {
    id: 'dividers.resetSplit',
    category: 'dividers',
    label: 'Reset Divider Split',
    description: 'Snap focused divider back to default measurement',
    keys: {
      win: ['Enter'],
      mac: ['Enter'],
    },
    aliases: ['Home'],
    context: 'When any Split Divider is focused',
  },

  // --- General & Navigation ---
  {
    id: 'general.shortcutsModal',
    category: 'general',
    label: 'Keyboard Shortcuts Help',
    description: 'Open the comprehensive keyboard shortcuts cheat-sheet',
    keys: {
      win: ['?'],
      mac: ['?'],
    },
    aliases: ['Shift+/'],
    context: 'Global',
  },
  {
    id: 'general.closeModal',
    category: 'general',
    label: 'Close Active Modal / Menu',
    description: 'Dismiss open dialogs, drawers, popups, or search bars',
    keys: {
      win: ['Esc'],
      mac: ['Esc'],
    },
    context: 'Global',
  },
  {
    id: 'general.cardSelect',
    category: 'general',
    label: 'Select Cue / Section',
    description: 'Activate focused cue card, timeline block, or outline section',
    keys: {
      win: ['Enter'],
      mac: ['Enter'],
    },
    aliases: ['Space'],
    context: 'When list card or outline row is focused',
  },
];

/**
 * Returns true if the client OS is detected as macOS.
 */
export function isMacUser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * Returns keys formatted for the client platform.
 */
export function getShortcutDisplayKeys(shortcut: ShortcutItem, isMac?: boolean): string[] {
  const mac = isMac !== undefined ? isMac : isMacUser();
  return mac ? shortcut.keys.mac : shortcut.keys.win;
}

/**
 * Filter shortcuts by a category.
 */
export function getShortcutsByCategory(categoryId: ShortcutCategoryId): ShortcutItem[] {
  return SHORTCUTS_REGISTRY.filter((item) => item.category === categoryId);
}

/**
 * Search shortcuts across label, description, and keys.
 */
export function searchShortcuts(query: string): ShortcutItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return SHORTCUTS_REGISTRY;

  return SHORTCUTS_REGISTRY.filter((item) => {
    return (
      item.label.toLowerCase().includes(clean) ||
      item.description.toLowerCase().includes(clean) ||
      item.context?.toLowerCase().includes(clean) ||
      item.keys.win.some((k) => k.toLowerCase().includes(clean)) ||
      item.keys.mac.some((k) => k.toLowerCase().includes(clean)) ||
      item.aliases?.some((a) => a.toLowerCase().includes(clean))
    );
  });
}
