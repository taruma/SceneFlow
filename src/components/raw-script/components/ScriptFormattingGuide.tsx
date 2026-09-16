import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  Copy, 
  Check, 
  CornerDownLeft
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface FormattingRule {
  id: string;
  category: 'screenplay' | 'staging' | 'brief';
  title: string;
  syntax: string;
  description: string;
  snippet: string;
  previewBadge: React.ReactNode;
}

export const FORMATTING_RULES: FormattingRule[] = [
  {
    id: 'scene-heading',
    category: 'screenplay',
    title: 'Scene Heading',
    syntax: 'INT. / EXT.',
    description: 'Triggers full-width shaded heading banner with bold uppercase text.',
    snippet: 'INT. UNIVERSITY LAB - NIGHT\n\n',
    previewBadge: (
      <div className="w-full px-2 py-1 rounded bg-surface-dark/15 dark:bg-surface-dark/50 border border-border-main text-[9px] font-bold uppercase tracking-tight text-text-main truncate">
        INT. LAB - NIGHT
      </div>
    ),
  },
  {
    id: 'part-banner',
    category: 'screenplay',
    title: 'Part Divider',
    syntax: 'PART <number>',
    description: 'Renders centered title banner flanked by horizontal accent lines.',
    snippet: 'PART 1\n\n',
    previewBadge: (
      <div className="w-full flex items-center gap-1.5 py-0.5 text-center">
        <div className="h-px flex-1 bg-border-main" />
        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-text-main">
          PART 1
        </span>
        <div className="h-px flex-1 bg-border-main" />
      </div>
    ),
  },
  {
    id: 'roman-title',
    category: 'screenplay',
    title: 'Roman Chapter',
    syntax: 'I. TITLE',
    description: 'Roman numeral in ALL CAPS followed by blank line. Renders flanked title.',
    snippet: 'I. THE AWAKENING\n\n',
    previewBadge: (
      <div className="w-full flex items-center gap-1.5 py-0.5 text-center">
        <div className="h-px flex-1 bg-border-main" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-main">
          I. THE PROLOGUE
        </span>
        <div className="h-px flex-1 bg-border-main" />
      </div>
    ),
  },
  {
    id: 'divider-rule',
    category: 'screenplay',
    title: 'Section Divider',
    syntax: '---',
    description: 'Three hyphens render a subtle thematic dividing rule.',
    snippet: '\n---\n\n',
    previewBadge: (
      <div className="w-full py-0.5">
        <hr className="border-t border-border-main" />
      </div>
    ),
  },
  {
    id: 'character-cue',
    category: 'screenplay',
    title: 'Character & Dialogue',
    syntax: 'NAME: (ALL CAPS)',
    description: 'Colon is auto-trimmed; name is centered & bold; speech is centered 75% width.',
    snippet: 'FRANK:\nAre we really doing this?\n\n',
    previewBadge: (
      <div className="w-full text-center py-1 bg-surface-muted/50 rounded-md">
        <div className="text-[9px] font-bold uppercase text-text-main">FRANK</div>
        <div className="text-[8.5px] italic text-text-muted">"Are we really doing this?"</div>
      </div>
    ),
  },
  {
    id: 'parenthetical',
    category: 'screenplay',
    title: 'Parenthetical',
    syntax: '(direction)',
    description: 'Inside dialogue: centered italic note. Standalone: italic action line.',
    snippet: '(sighing, looking away)\n',
    previewBadge: (
      <div className="w-full text-center text-[8.5px] italic text-text-muted">
        (sighing, looking away)
      </div>
    ),
  },
  {
    id: 'camera-shot',
    category: 'screenplay',
    title: 'Camera / Beat Note',
    syntax: '[CLOSE-UP]',
    description: 'Enclosed in square brackets. Renders monospace uppercase tracking note.',
    snippet: '[CLOSE-UP – GROUND LEVEL]\n',
    previewBadge: (
      <div className="font-mono text-[8.5px] uppercase tracking-wider text-text-muted">
        [CLOSE-UP – GROUND LEVEL]
      </div>
    ),
  },
  {
    id: 'sound-fx',
    category: 'screenplay',
    title: 'SFX / VFX Cue',
    syntax: 'SFX: ... / VFX: ...',
    description: 'Starts with SFX: or VFX:. Renders italicized effect cue.',
    snippet: 'SFX: Distant thunder rumbling\n',
    previewBadge: (
      <div className="text-[8.5px] italic text-text-muted">
        SFX: Distant thunder rumbling
      </div>
    ),
  },
  {
    id: 'staging-container',
    category: 'staging',
    title: 'Staging Block',
    syntax: '[[STAGING]]',
    description: 'Raw text hidden; rendered as interactive pill badges opening Staging Inspector.',
    snippet: '[[STAGING]]\n[[INTENT]]\nEmotional weight and unspoken grief.\n[[/INTENT]]\n[[/STAGING]]\n\n',
    previewBadge: (
      <div className="flex items-center gap-1">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase">
          <span className="w-1 h-1 rounded-full bg-purple-500" />
          INTENT
        </span>
        <span className="text-[8px] text-text-faint">(badge replaces raw text)</span>
      </div>
    ),
  },
  {
    id: 'core-directives',
    category: 'staging',
    title: 'Core Directives',
    syntax: '[[INTENT / LOGIC / ...]]',
    description: 'INTENT (subtext), LOGIC (continuity), AESTHETIC (look), OPENING (first frame).',
    snippet: '[[INTENT]]\nTwo mathematicians facing reality.\n[[/INTENT]]\n',
    previewBadge: (
      <div className="flex items-center gap-1 flex-wrap">
        <span className="px-1.5 py-0.2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[7.5px] font-black uppercase">INTENT</span>
        <span className="px-1.5 py-0.2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[7.5px] font-black uppercase">LOGIC</span>
        <span className="px-1.5 py-0.2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[7.5px] font-black uppercase">AESTHETIC</span>
      </div>
    ),
  },
  {
    id: 'brief-sequence',
    category: 'brief',
    title: 'Multi-Camera Brief',
    syntax: '[<BRIEF>]',
    description: 'Dashed card box. "->" automatically indents; "[CAM]" becomes bold anchor.',
    snippet: '[<BRIEF>]\n[CAM 01] Wide basketball court -> \n[CAM 02] Tight tracking profile -> \n[CAM 03] Low angle profile\n[</BRIEF>]\n\n',
    previewBadge: (
      <div className="w-full font-mono text-[8px] border border-dashed border-amber-500/40 rounded p-1 bg-amber-500/5 text-text-body space-y-0.5">
        <div><b className="text-text-main">[CAM 01]</b> Wide stage -&gt;</div>
        <div className="pl-2 text-text-muted">-&gt; <b className="text-text-main">[CAM 02]</b> CU Orbit</div>
      </div>
    ),
  },
];

interface ScriptFormattingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (snippet: string) => void;
}

export function ScriptFormattingGuide({
  isOpen,
  onClose,
  onInsertSnippet,
}: ScriptFormattingGuideProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'screenplay' | 'staging' | 'brief'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRules = useMemo(() => {
    return FORMATTING_RULES.filter(rule => {
      if (activeCategory !== 'all' && rule.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rule.title.toLowerCase().includes(q) ||
          rule.syntax.toLowerCase().includes(q) ||
          rule.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleCopy = (rule: FormattingRule) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(rule.snippet).then(() => {
        setCopiedId(rule.id);
        setTimeout(() => setCopiedId(null), 1500);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 sm:w-72 bg-surface-subtle/30 flex flex-col shrink-0 overflow-hidden border-l border-border-subtle animate-in slide-in-from-right-2 duration-200 text-xs">
      
      {/* Header (Exact h-9 to lock horizon with Outline and Editor) */}
      <div className="h-9 px-3 border-b border-border-subtle bg-surface-subtle/50 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5 text-text-muted">
          <BookOpen size={12} className="text-purple-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-main">
            Guide
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close Formatting Guide"
          className="p-1 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Compact Search & Category Filters */}
      <div className="p-2 border-b border-border-subtle space-y-1.5 shrink-0 bg-surface/40">
        <div className="relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter formatting..."
            className="w-full pl-6 pr-2 py-0.5 text-[10px] rounded-md bg-surface border border-border-subtle text-text-main placeholder-text-faint focus:outline-none focus:border-purple-500/50 transition-colors font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main"
            >
              <X size={10} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'screenplay', label: 'Script' },
            { id: 'staging', label: 'Tags' },
            { id: 'brief', label: 'Briefs' },
          ].map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as any)}
                className={cn(
                  "flex-1 py-0.5 text-center rounded text-[9px] font-bold uppercase tracking-wider transition-all border",
                  isActive
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    : "bg-surface-muted/60 text-text-muted hover:text-text-main border-border-subtle/50 hover:bg-surface-hover"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules List (Compact & Scannable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {filteredRules.length > 0 ? (
          filteredRules.map(rule => {
            const isCopied = copiedId === rule.id;
            return (
              <div
                key={rule.id}
                className="p-2 rounded-lg border border-border-subtle bg-surface/60 hover:border-purple-500/30 transition-all space-y-1.5 group shadow-2xs"
              >
                {/* Rule Header: Title + Action Buttons */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-text-main tracking-tight truncate">
                    {rule.title}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onInsertSnippet(rule.snippet)}
                      title="Insert template snippet into script editor at cursor"
                      className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[8.5px] font-bold uppercase transition-transform active:scale-95"
                    >
                      <CornerDownLeft size={8} />
                      <span>Insert</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(rule)}
                      title="Copy syntax template to clipboard"
                      className="p-0.5 rounded hover:bg-surface-hover text-text-faint hover:text-text-main transition-colors"
                    >
                      {isCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                    </button>
                  </div>
                </div>

                {/* Syntax Code Pill */}
                <code className="block text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-surface-muted/40 px-1.5 py-0.5 rounded border border-border-subtle/50 truncate">
                  {rule.syntax}
                </code>

                {/* One-Line Description */}
                <p className="text-[9px] leading-tight text-text-muted">
                  {rule.description}
                </p>

                {/* Mini Preview Appearance */}
                <div className="pt-1 border-t border-border-subtle/50">
                  {rule.previewBadge}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center space-y-1 text-text-faint">
            <p className="text-[10px] font-bold text-text-muted">No rules found</p>
            <p className="text-[9px]">Try searching for "dialogue", "scene", or "brief".</p>
          </div>
        )}
      </div>

    </div>
  );
}
