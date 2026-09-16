import React, { useState, useMemo } from 'react';
import { 
  Keyboard, 
  Search, 
  X, 
  Play, 
  Sliders, 
  FileText, 
  CheckSquare, 
  Split, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { cn } from '../lib/utils';
import { 
  SHORTCUT_CATEGORIES, 
  ShortcutCategoryId, 
  searchShortcuts, 
  getShortcutDisplayKeys,
  isMacUser
} from '../constants/shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<ShortcutCategoryId, LucideIcon> = {
  playback: Play,
  studio: Sliders,
  editor: FileText,
  inspector: CheckSquare,
  dividers: Split,
  general: HelpCircle,
};

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<ShortcutCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isMac = useMemo(() => isMacUser(), []);

  useEscapeKey(onClose, isOpen);

  const filteredShortcuts = useMemo(() => {
    const results = searchShortcuts(searchQuery);
    if (activeCategory === 'all') return results;
    return results.filter((s) => s.category === activeCategory);
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      className={UI_TOKENS.modal.overlayHeavy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-label="Keyboard Shortcuts"
        className={cn(
          UI_TOKENS.modal.containerLg, 
          "h-[620px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-border-subtle bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className={UI_TOKENS.iconWrapper.dark}>
              <Keyboard size={20} className="text-btn-primary-text" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-text-main">
                  Keyboard Shortcuts
                </h2>
                <kbd className={cn(UI_TOKENS.badge.shortcut, "text-[10px] px-1.5 py-0.5")}>
                  ?
                </kbd>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Quick reference guide for fast script synchronization & editing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
            title="Close (Esc)"
            aria-label="Close keyboard shortcuts dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="px-6 py-3 border-b border-border-subtle bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 group">
            <Search 
              size={13} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-text-main transition-colors pointer-events-none" 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, keys, or contexts..."
              className={cn(
                UI_TOKENS.input.baseText,
                "w-full pl-8.5 pr-8 py-1.5 text-xs bg-surface-subtle focus:bg-surface"
              )}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main p-0.5"
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 select-none",
                activeCategory === 'all'
                  ? "bg-btn-primary-bg text-btn-primary-text shadow-xs"
                  : "text-text-muted hover:text-text-main hover:bg-surface-hover"
              )}
            >
              All
            </button>
            {SHORTCUT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 select-none",
                    isSelected
                      ? "bg-btn-primary-bg text-btn-primary-text shadow-xs"
                      : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                  )}
                >
                  <Icon size={11} className={isSelected ? "text-btn-primary-text" : "text-text-faint"} />
                  <span>{cat.tabLabel || cat.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Shortcut Cards Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {filteredShortcuts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredShortcuts.map((shortcut) => {
                const CategoryIcon = CATEGORY_ICONS[shortcut.category];
                const displayKeys = getShortcutDisplayKeys(shortcut, isMac);

                return (
                  <div
                    key={shortcut.id}
                    className="p-3.5 rounded-xl border border-border-subtle bg-surface-subtle/50 hover:bg-surface-subtle hover:border-border-main transition-all flex flex-col justify-between gap-2.5 group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon size={12} className="text-text-faint shrink-0" />
                          <h3 className="text-xs font-bold text-text-main group-hover:text-btn-primary-bg dark:group-hover:text-text-main transition-colors">
                            {shortcut.label}
                          </h3>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">
                          {shortcut.description}
                        </p>
                      </div>

                      {/* Keys Display */}
                      <div className="flex items-center gap-1 shrink-0">
                        {displayKeys.map((key, idx) => (
                          <React.Fragment key={`${key}-${idx}`}>
                            {idx > 0 && (
                              <span className="text-[9px] font-mono text-text-faint/60">+</span>
                            )}
                            <kbd className="font-mono font-bold text-[11px] text-text-main bg-surface border border-border-main rounded-md px-2 py-0.5 shadow-2xs">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata Badges */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle/40 text-[9.5px]">
                      {shortcut.context ? (
                        <span className="text-text-faint font-medium truncate">
                          {shortcut.context}
                        </span>
                      ) : (
                        <span />
                      )}

                      {shortcut.aliases && shortcut.aliases.length > 0 && (
                        <span className="text-text-faint font-mono shrink-0">
                          Alt: {shortcut.aliases.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Keyboard size={32} className="mx-auto text-text-faint/60" />
              <p className="text-xs font-bold text-text-muted">No shortcuts found</p>
              <p className="text-[11px] text-text-faint">
                Try searching for a different keyword like "playback", "wrap", or "cue"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-between shrink-0 text-[11px] text-text-faint">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className={UI_TOKENS.badge.shortcut}>?</kbd>
            <span>anytime to toggle this guide</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-btn-primary-bg hover:bg-btn-primary-hover text-btn-primary-text rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
