import React, { useEffect } from 'react';
import { 
  Info, 
  X, 
  ExternalLink, 
  Github, 
  BookOpen, 
  Coffee, 
  Keyboard, 
  FileCode2, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import metadata from '../../metadata.json';
import { cn } from '../lib/utils';
import { UI_TOKENS } from '../styles/tokens/ui';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppInfoModal({ isOpen, onClose }: AppInfoModalProps) {
  // Handle escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const version = metadata?.version || '2.1.1';
  const appName = metadata?.name || 'SceneFlow';
  const author = (metadata as Record<string, unknown>)?.author as string || 'Taruma Sakti';
  const authorUrl = (metadata as Record<string, unknown>)?.authorUrl as string || 'https://linktr.ee/tarumainfo';
  const description = metadata?.description || 
    'SceneFlow bridges the gap between scripts and AI video generation with real-time synchronization, staging blocks, and precision timing controls.';

  const docLinks = [
    {
      label: 'GitHub Repository',
      url: 'https://github.com/taruma/SceneFlow',
      icon: Github,
      tag: 'Source',
      color: 'hover:border-stone-400 hover:bg-stone-50 text-stone-800',
    },
    {
      label: 'Documentation & Guide',
      url: 'https://github.com/taruma/SceneFlow#readme',
      icon: BookOpen,
      tag: 'Docs',
      color: 'hover:border-blue-300 hover:bg-blue-50/50 text-blue-700',
    },
    {
      label: 'Release Notes (Changelog)',
      url: 'https://github.com/taruma/SceneFlow/blob/main/CHANGELOG.md',
      icon: FileCode2,
      tag: `v${version}`,
      color: 'hover:border-purple-300 hover:bg-purple-50/50 text-purple-700',
    },
    {
      label: 'Support on Ko-fi',
      url: 'https://ko-fi.com/tarumainfo',
      icon: Coffee,
      tag: 'Support',
      color: 'hover:border-[#FF5E5B]/40 hover:bg-[#FF5E5B]/10 text-[#FF5E5B]',
    },
  ];

  const shortcuts = [
    { key: 'Space / K', desc: 'Play / Pause playback' },
    { key: '← / →', desc: 'Seek -5s / +5s' },
    { key: 'J / L', desc: 'Seek -5s / +5s' },
    { key: 'Esc', desc: 'Close active modal' },
  ];

  return (
    <div 
      className={UI_TOKENS.modal.overlayHeavy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn(UI_TOKENS.modal.containerMd, "max-h-[90vh] flex flex-col")}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={UI_TOKENS.iconWrapper.dark}>
              <Info size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-stone-900">{appName}</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-900 text-white rounded-md">
                  v{version}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  by
                </span>
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-stone-700 hover:text-stone-900 hover:underline uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                >
                  {author}
                  <ExternalLink size={9} className="text-stone-400" />
                </a>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className={UI_TOKENS.button.iconCloseSquare}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide">
          {/* Hero Card */}
          <div className="p-5 bg-gradient-to-br from-stone-50 to-stone-100/60 border border-stone-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/SCENEFLOW_TAG_B.png"
                  alt="SceneFlow Logo"
                  className="h-6 w-auto object-contain pointer-events-none"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>MIT License</span>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-stone-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Resource & Documentation Badges */}
          <div className="space-y-2.5">
            <span className={UI_TOKENS.input.label}>Documentation & Resources</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {docLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white shadow-2xs transition-all active:scale-98 group cursor-pointer",
                      link.color
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent size={16} className="shrink-0 text-stone-500 group-hover:text-current transition-colors" />
                      <span className="text-xs font-semibold truncate text-stone-700 group-hover:text-current">
                        {link.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 group-hover:bg-current/10 text-stone-500 group-hover:text-current transition-colors">
                        {link.tag}
                      </span>
                      <ExternalLink size={12} className="text-stone-300 group-hover:text-current transition-colors" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Features & Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-stone-700">
                <Layers size={14} className="text-stone-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Key Capabilities</span>
              </div>
              <ul className="text-xs text-stone-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  Real-time script & YouTube sync
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Multi-action staging blocks
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  Per-category timing offset controls
                </li>
              </ul>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-stone-700">
                <Keyboard size={14} className="text-stone-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Quick Shortcuts</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-stone-600">
                {shortcuts.map((s) => (
                  <div key={s.key} className="flex flex-col">
                    <span className="font-mono font-bold text-[10px] text-stone-800 bg-white border border-stone-200 rounded px-1.5 py-0.5 w-fit shadow-2xs">
                      {s.key}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-0.5">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span className="font-mono font-semibold text-stone-500">{appName} v{version}</span>
            <span>•</span>
            <span>by</span>
            <a
              href={authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-stone-600 hover:text-stone-900 hover:underline transition-colors"
            >
              {author}
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
