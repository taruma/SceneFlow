import React from 'react';
import { 
  Upload, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Wand2, 
  Bookmark, 
  Plus, 
  Undo2, 
  Redo2, 
  ListTree, 
  TextWrap, 
  X 
} from 'lucide-react';
import { CORE_DIRECTIVE_PRESETS } from '../types';
import { cn } from '../../../lib/utils';

interface ScriptEditorToolbarProps {
  showToc: boolean;
  onToggleToc: () => void;
  tocCount: number;
  wordWrap: boolean;
  onToggleWordWrap: () => void;
  onWrapSelection: (tagName: string) => void;
  onWrapBrief: () => void;
  customTags: string[];
  onRemoveCustomTag: (tag: string) => void;
  onAddCustomTag: () => void;
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onCopy: () => void;
  copied: boolean;
  onCleanFormat: () => void;
  onClear: () => void;
}

export function ScriptEditorToolbar({
  showToc,
  onToggleToc,
  tocCount,
  wordWrap,
  onToggleWordWrap,
  onWrapSelection,
  onWrapBrief,
  customTags,
  onRemoveCustomTag,
  onAddCustomTag,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  fileInputRef,
  onFileInputChange,
  onExport,
  onCopy,
  copied,
  onCleanFormat,
  onClear,
}: ScriptEditorToolbarProps) {
  return (
    <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between gap-2 shrink-0 flex-wrap bg-surface text-xs">
      
      {/* Left Group: Outline Toggle & Wrap in Staging Labels */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Outline / TOC Toggle Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleToc}
          title={showToc ? "Hide Outline" : "Show Outline"}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xs active:scale-95 mr-0.5",
            showToc
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-black"
              : "bg-surface-muted hover:bg-surface-hover text-text-muted hover:text-text-main border-border-subtle"
          )}
        >
          <ListTree size={12} className={showToc ? "text-purple-600 dark:text-purple-400" : "text-text-faint"} />
          <span>Outline</span>
          {tocCount > 0 && (
            <span className="ml-0.5 text-[8.5px] px-1 py-0.2 rounded bg-surface border border-border-subtle text-text-faint font-mono">
              {tocCount}
            </span>
          )}
        </button>

        {/* Word Wrap Toggle Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleWordWrap}
          title={wordWrap ? "Disable Word Wrap (Alt+Z)" : "Enable Word Wrap (Alt+Z)"}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xs active:scale-95 mr-1",
            wordWrap
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-black"
              : "bg-surface-muted hover:bg-surface-hover text-text-muted hover:text-text-main border-border-subtle"
          )}
        >
          <TextWrap size={12} className={wordWrap ? "text-purple-600 dark:text-purple-400" : "text-text-faint"} />
          <span>Wrap</span>
        </button>

        <div className="w-px h-3.5 bg-border-subtle mx-0.5 hidden sm:block" />

        {/* Staging & Brief Containers */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onWrapSelection('STAGING')}
          title="Wrap selected text in [[STAGING]]...[[/STAGING]] container"
          className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-mono font-bold transition-all shadow-2xs active:scale-95"
        >
          [[STAGING]]
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onWrapBrief}
          title="Wrap selection in [<BRIEF>]...[</BRIEF>] or insert brief sequence template"
          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-mono font-bold transition-all shadow-2xs active:scale-95"
        >
          [&lt;BRIEF&gt;]
        </button>

        <div className="w-px h-3.5 bg-border-subtle mx-0.5 hidden sm:block" />

        <span className="text-[9px] font-black uppercase tracking-widest text-text-faint flex items-center gap-1 mr-0.5">
          <Bookmark size={10} className="text-purple-500" />
          Tags:
        </span>

        {/* Core Directives */}
        {CORE_DIRECTIVE_PRESETS.map((tag) => (
          <button
            key={tag}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onWrapSelection(tag)}
            title={`Wrap selected text in [[${tag}]]...[[/${tag}]]`}
            className="px-2 py-1 bg-surface-muted hover:bg-surface-hover hover:border-purple-500/40 text-text-body hover:text-purple-600 dark:hover:text-purple-400 rounded-lg text-[10px] font-mono font-bold transition-all border border-border-subtle shadow-2xs active:scale-95"
          >
            [[{tag}]]
          </button>
        ))}

        {/* User-Stored Custom Tags */}
        {customTags.map((tag) => (
          <div key={tag} className="group/tag inline-flex items-center">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onWrapSelection(tag)}
              title={`Wrap selection in [[${tag}]]...[[/${tag}]]`}
              className="px-2 py-1 bg-surface-muted hover:bg-surface-hover hover:border-purple-500/40 text-text-body hover:text-purple-600 dark:hover:text-purple-400 rounded-l-lg text-[10px] font-mono font-bold transition-all border-y border-l border-border-subtle shadow-2xs active:scale-95"
            >
              [[{tag}]]
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCustomTag(tag);
              }}
              title={`Remove [[${tag}]] from your saved tags`}
              className="px-1 py-1 bg-surface-muted hover:bg-red-500/15 text-text-faint hover:text-red-500 border border-border-subtle border-l-0 rounded-r-lg transition-colors text-[9px]"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {/* Add Custom Tag Button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onAddCustomTag}
          title="Add a custom tag and save it to your toolbar"
          className="flex items-center gap-1 px-2 py-1 bg-surface-muted hover:bg-surface-hover text-text-muted hover:text-text-main rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-border-subtle shadow-2xs active:scale-95"
        >
          <Plus size={10} />
          <span>Tag...</span>
        </button>
      </div>

      {/* Right Group: Undo/Redo, Import, Export, Copy & Cleanup */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover disabled:opacity-25 disabled:pointer-events-none rounded-lg transition-colors"
        >
          <Undo2 size={14} />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover disabled:opacity-25 disabled:pointer-events-none rounded-lg transition-colors"
        >
          <Redo2 size={14} />
        </button>

        <div className="w-px h-3.5 bg-border-subtle mx-1" />

        <input 
          type="file"
          ref={fileInputRef}
          onChange={onFileInputChange}
          accept=".fountain,.txt,.md,.fdx"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Import script text from file"
          className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Upload size={14} />
        </button>

        <button
          type="button"
          onClick={onExport}
          title="Download script (.txt)"
          className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Download size={14} />
        </button>

        <button
          type="button"
          onClick={onCopy}
          title="Copy script to clipboard"
          className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors relative"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied && (
            <span className="absolute -top-7 right-0 px-2 py-0.5 bg-surface-dark text-surface-light text-[9px] font-bold rounded shadow-lg animate-in fade-in slide-in-from-bottom-1">
              Copied!
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onCleanFormat}
          title="Format whitespace (trims trailing spaces, collapses extra blank lines)"
          className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
        >
          <Wand2 size={14} />
        </button>

        <button
          type="button"
          onClick={onClear}
          title="Clear editor text"
          className="p-1.5 text-text-faint hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
