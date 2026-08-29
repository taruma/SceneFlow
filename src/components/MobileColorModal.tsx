import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Palette, Sun, Moon, Coffee, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { SCRIPT_THEMES, type ScriptThemeId, type ScriptTheme } from '../lib/scriptStyles';
import { useEscapeKey } from '../hooks/useEscapeKey';
import type { AppThemeMode, AppThemeCategory } from '../hooks/useAppShellTheme';

interface MobileColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ScriptThemeId;
  onSelectTheme: (themeId: ScriptThemeId) => void;
  themeMode?: AppThemeMode;
  setThemeMode?: (mode: AppThemeMode) => void;
  effectiveThemeCategory?: AppThemeCategory;
}

const THEME_MODE_OPTIONS: Array<{
  id: AppThemeMode;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: 'auto', label: 'Auto', icon: Sparkles },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'warm', label: 'Warm', icon: Coffee },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export function MobileColorModal({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  themeMode = 'auto',
  setThemeMode,
  effectiveThemeCategory = 'light',
}: MobileColorModalProps) {
  useEscapeKey(onClose, isOpen);

  const themeList: ScriptTheme[] = Object.values(SCRIPT_THEMES);
  const currentTheme = SCRIPT_THEMES[currentThemeId] || SCRIPT_THEMES['studio-light'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-h-[88vh] bg-surface border-t border-border-main rounded-t-2xl flex flex-col overflow-hidden text-text-main shadow-2xl"
          >
            {/* Sheet Handle */}
            <div className="pt-2.5 pb-1 flex justify-center items-center">
              <div className="w-10 h-1 bg-surface-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-btn-primary-bg text-btn-primary-text rounded-lg shadow-xs">
                  <Palette size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-text-main">
                    Visual Themes
                  </h2>
                  <p className="text-[10px] text-text-muted font-mono">
                    App shell & screenplay appearance
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-text-faint hover:text-text-main rounded-full bg-surface-muted hover:bg-surface-hover active:scale-95 transition-all"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-dark-scrollbar p-4 space-y-4">
              {/* App Shell Mode Selector */}
              {setThemeMode && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-faint">
                      App Shell Mode
                    </span>
                    <span className="text-[9px] font-mono text-text-muted">
                      {themeMode === 'auto'
                        ? `Auto (Synced with ${effectiveThemeCategory})`
                        : `Locked to ${themeMode.toUpperCase()}`}
                    </span>
                  </div>

                  {/* 4-Pill Segmented Control */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-surface-muted rounded-xl border border-border-main">
                    {THEME_MODE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = themeMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setThemeMode(opt.id)}
                          className={cn(
                            'py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95',
                            isSelected
                              ? 'bg-btn-primary-bg text-btn-primary-text shadow-sm'
                              : 'text-text-muted hover:text-text-main'
                          )}
                        >
                          <Icon size={12} className={isSelected && opt.id === 'auto' ? 'text-amber-400' : ''} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Screenplay Paper Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-faint">
                    Screenplay Paper Presets
                  </span>
                  <span className="text-[9px] font-mono text-text-faint">
                    {themeList.length} Presets
                  </span>
                </div>

                <div className="space-y-2">
                  {themeList.map((theme) => {
                    const isSelected = theme.id === currentThemeId;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onSelectTheme(theme.id);
                        }}
                        className={cn(
                          'w-full p-3 rounded-xl border text-left transition-all relative group active:scale-[0.99] flex items-center justify-between gap-3',
                          theme.paperBg,
                          theme.paperBorder,
                          theme.textColor,
                          isSelected ? 'ring-2 ring-btn-primary-bg shadow-sm' : 'hover:shadow-xs'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            {theme.category === 'dark' && <Moon size={12} className="opacity-80 shrink-0" />}
                            {theme.category === 'warm' && <Coffee size={12} className="opacity-80 shrink-0" />}
                            {theme.category === 'light' && <Sun size={12} className="opacity-80 shrink-0" />}
                            <span className="font-bold text-xs truncate">
                              {theme.name}
                            </span>
                            <span
                              className={cn(
                                'text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded font-semibold shrink-0',
                                theme.category === 'dark'
                                  ? 'bg-stone-800 text-stone-200'
                                  : theme.category === 'warm'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-stone-200/80 text-stone-700'
                              )}
                            >
                              {theme.category}
                            </span>
                          </div>
                          <p className="text-[10.5px] opacity-75 line-clamp-1 leading-normal font-sans">
                            {theme.description}
                          </p>
                        </div>

                        {/* Selection checkmark */}
                        <div className="shrink-0 flex items-center justify-center">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-btn-primary-bg text-btn-primary-text flex items-center justify-center shadow-xs">
                              <Check size={13} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-current opacity-20 group-hover:opacity-40" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="p-3 border-t border-border-subtle bg-surface-subtle text-center shrink-0 flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-text-faint truncate">
                Active: <strong className="text-text-main">{currentTheme.name}</strong>
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-btn-primary-bg text-btn-primary-text font-bold text-xs hover:bg-btn-primary-hover active:scale-95 transition-all shadow-sm shrink-0"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
