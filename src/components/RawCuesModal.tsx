import React, { useState, useMemo, useCallback } from 'react';
import { 
  Braces, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Copy, 
  Check, 
  FileText,
  ChevronDown,
  ChevronUp,
  Bot,
  ExternalLink,
  Code2,
  Columns,
  ArrowRight
} from 'lucide-react';
import { Cue } from '../types/script';
import { sanitizeCues } from '../lib/cueUtils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { cn } from '../lib/utils';
import cuesSchemaJson from '../schemas/cues.schema.json';
import { CUES_SYNC_PROMPT } from '../schemas/cues.prompt';

interface RawCuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCuesText: string;
  onChangeRawCuesText: (text: string) => void;
  onSave: (cuesOverride?: Cue[]) => void;
}

const EXAMPLE_CUE_SCHEMA = `[
  {
    "type": "dialogue",
    "selectedText": "We need to talk.",
    "startTime": 14.5,
    "endTime": 18.2
  }
]`;

const GEMINI_CUE_SCHEMA = JSON.stringify(cuesSchemaJson, null, 2);

interface CueSchemaField {
  name: string;
  type: string;
  requirement: 'Required' | 'Optional' | 'Auto-Calc' | 'Legacy';
  desc: string;
}

const ESSENTIAL_FIELDS: CueSchemaField[] = [
  {
    name: 'startTime / endTime',
    type: 'number',
    requirement: 'Required',
    desc: 'Timeline boundaries in seconds (e.g. 14.5). Essential for playback sync and timeline tracks.',
  },
  {
    name: 'selectedText',
    type: 'string',
    requirement: 'Required',
    desc: 'Screenplay text excerpt to highlight on the paper canvas and align character offsets.',
  },
  {
    name: 'type',
    type: 'string',
    requirement: 'Optional',
    desc: 'Category: dialogue, action, shot, camera, audio, vfx, etc. Defaults to "dialogue" if omitted.',
  },
];

const OPTIONAL_FIELDS: CueSchemaField[] = [
  {
    name: 'startIndex / endIndex',
    type: 'number',
    requirement: 'Auto-Calc',
    desc: 'Character offsets in script. If omitted, [↺ Resync] auto-calculates them from selectedText.',
  },
  {
    name: 'id',
    type: 'string',
    requirement: 'Optional',
    desc: 'Unique cue ID (e.g. "cue_01"). If omitted, SceneFlow auto-generates a unique ID.',
  },
  {
    name: 'colorClass',
    type: 'string',
    requirement: 'Legacy',
    desc: 'Legacy Tailwind class. Modern SceneFlow dynamically themes highlights based on "type".',
  },
  {
    name: 'speaker',
    type: 'string | null',
    requirement: 'Optional',
    desc: 'Optional speaker name for prefix tag chips (e.g. "MARK").',
  },
];

export function RawCuesModal({
  isOpen,
  onClose,
  rawCuesText,
  onChangeRawCuesText,
  onSave,
}: RawCuesModalProps) {
  useEscapeKey(onClose, isOpen);

  const [formatSuccess, setFormatSuccess] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'prompt-schema'>('data');
  const [promptSchemaView, setPromptSchemaView] = useState<'prompt' | 'schema' | 'split'>('prompt');
  const [isOptionalFieldsOpen, setIsOptionalFieldsOpen] = useState(false);

  // Live validation of the JSON input
  const validationResult = useMemo(() => {
    const trimmed = rawCuesText.trim();
    if (!trimmed) {
      return {
        isValid: false,
        error: 'JSON data is empty.',
        cues: [] as Cue[],
        count: 0,
        wasObjectWrapper: false,
      };
    }

    try {
      const parsed = JSON.parse(trimmed);
      let extracted: any[] | null = null;
      let wasObjectWrapper = false;

      if (Array.isArray(parsed)) {
        extracted = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.cues)) {
        extracted = parsed.cues;
        wasObjectWrapper = true;
      } else {
        return {
          isValid: false,
          error: 'Expected a JSON array ([...]) or wrapped cues object ({ cues: [...] }).',
          cues: [] as Cue[],
          count: 0,
          wasObjectWrapper: false,
        };
      }

      const sanitized = sanitizeCues(extracted);
      return {
        isValid: true,
        error: null,
        cues: sanitized,
        count: sanitized.length,
        wasObjectWrapper,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: err?.message || 'Invalid JSON syntax.',
        cues: [] as Cue[],
        count: 0,
        wasObjectWrapper: false,
      };
    }
  }, [rawCuesText]);

  // Format / Prettify action
  const handleFormatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(rawCuesText.trim());
      const target = Array.isArray(parsed) 
        ? parsed 
        : (parsed && typeof parsed === 'object' && Array.isArray(parsed.cues) ? parsed.cues : parsed);
      
      const formatted = JSON.stringify(target, null, 2);
      onChangeRawCuesText(formatted);
      setFormatSuccess(true);
      setTimeout(() => setFormatSuccess(false), 1500);
    } catch {
      // Cannot format invalid JSON
    }
  }, [rawCuesText, onChangeRawCuesText]);

  // Copy Schema Example
  const handleCopyExample = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(EXAMPLE_CUE_SCHEMA).then(() => {
        setCopiedTemplate(true);
        setTimeout(() => setCopiedTemplate(false), 1500);
      });
    }
  }, []);

  // Copy Gemini Structured Output Schema
  const handleCopySchema = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(GEMINI_CUE_SCHEMA).then(() => {
        setCopiedSchema(true);
        setTimeout(() => setCopiedSchema(false), 1500);
      });
    }
  }, []);

  // Copy Sync Prompt
  const handleCopyPrompt = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(CUES_SYNC_PROMPT).then(() => {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 1500);
      });
    }
  }, []);

  // Insert template when empty
  const handleInsertTemplate = useCallback(() => {
    onChangeRawCuesText(EXAMPLE_CUE_SCHEMA);
  }, [onChangeRawCuesText]);

  const handleSave = useCallback(() => {
    if (!validationResult.isValid || validationResult.count === 0) return;
    onSave(validationResult.cues);
  }, [validationResult, onSave]);

  if (!isOpen) return null;

  const lineCount = rawCuesText.split('\n').length;

  return (
    <div 
      className={UI_TOKENS.modal.overlayHeavy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface w-full max-w-5xl rounded-[1.75rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border-main text-text-main h-[80vh] max-h-[740px] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Braces size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-text-main flex items-center gap-2">
                Cues JSON Editor
              </h2>
              <p className="text-[9px] font-bold text-text-faint uppercase tracking-wider">
                Screenplay Sync Cues
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Close modal"
            className="p-1.5 text-text-faint hover:text-text-main hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-Column Workstation Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border-subtle">
          
          {/* Left Column: Schema Reference & Educational Guide */}
          <div className="w-full md:w-72 lg:w-80 bg-surface-subtle/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-3.5 space-y-2.5">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-blue-500 shrink-0" />
                <h3 className="text-[11px] font-black uppercase tracking-wider text-text-main">
                  Schema Reference
                </h3>
              </div>
              <span className="text-[8.5px] font-mono text-text-faint uppercase bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                Array&lt;Cue&gt;
              </span>
            </div>

            {/* Compact Overview Card */}
            <div className="p-2.5 bg-surface rounded-xl border border-border-subtle text-[10px] text-text-muted leading-snug shadow-2xs">
              <p>
                Accepts direct arrays <code className="text-[9px] text-blue-500 font-mono">[...]</code> or wrapped objects <code className="text-[9px] text-blue-500 font-mono">{'{ cues: [...] }'}</code>.
              </p>
            </div>

            {/* Essential Fields */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-faint">
                  Essential Fields
                </span>
                <span className="text-[8.5px] font-mono text-text-faint font-bold uppercase tracking-wider">
                  3 core fields
                </span>
              </div>
              <div className="space-y-1">
                {ESSENTIAL_FIELDS.map((field) => (
                  <div 
                    key={field.name}
                    className="p-2 rounded-xl bg-surface border border-border-subtle space-y-0.5 shadow-2xs text-[10px]"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate text-[10.5px]">
                        {field.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={cn(
                          "text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md border tracking-wider",
                          field.requirement === 'Required' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
                          field.requirement === 'Optional' && "bg-surface-muted text-text-faint border-border-subtle"
                        )}>
                          {field.requirement}
                        </span>
                        <span className="text-[8.5px] font-mono uppercase bg-surface-muted px-1.5 py-0.5 rounded-md text-text-faint border border-border-subtle">
                          {field.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-muted text-[9.5px] leading-tight">
                      {field.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Optional & Auto-Calc Fields */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsOptionalFieldsOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl bg-surface border border-border-subtle hover:bg-surface-hover text-text-main text-[10px] transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-black uppercase tracking-wider text-text-faint group-hover:text-text-main transition-colors text-[9px]">
                    Optional & Auto-Calc Fields
                  </span>
                  <span className="text-[8px] font-mono bg-surface-muted text-text-faint px-1.5 py-0.2 rounded-full font-bold">
                    {OPTIONAL_FIELDS.length}
                  </span>
                </div>
                {isOptionalFieldsOpen ? (
                  <ChevronUp size={11} className="text-text-faint group-hover:text-text-main" />
                ) : (
                  <ChevronDown size={11} className="text-text-faint group-hover:text-text-main" />
                )}
              </button>

              {isOptionalFieldsOpen && (
                <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
                  {OPTIONAL_FIELDS.map((field) => (
                    <div 
                      key={field.name}
                      className="p-2 rounded-xl bg-surface border border-border-subtle space-y-0.5 shadow-2xs text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate text-[10.5px]">
                          {field.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={cn(
                            "text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md border tracking-wider",
                            field.requirement === 'Auto-Calc' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
                            field.requirement === 'Legacy' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
                            field.requirement === 'Optional' && "bg-surface-muted text-text-faint border-border-subtle"
                          )}>
                            {field.requirement}
                          </span>
                          <span className="text-[8.5px] font-mono uppercase bg-surface-muted px-1.5 py-0.5 rounded-md text-text-faint border border-border-subtle">
                            {field.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-muted text-[9.5px] leading-tight">
                        {field.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Example Snippet */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-faint">
                  Quick Example
                </span>
                <div className="flex items-center gap-1.5">
                  {rawCuesText.trim() === '' && (
                    <button
                      type="button"
                      onClick={handleInsertTemplate}
                      title="Load example payload into editor"
                      className="text-[9px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                    >
                      <FileText size={9} />
                      Insert
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyExample}
                    title="Copy example payload to clipboard"
                    className="text-[9px] font-bold text-text-muted hover:text-text-main flex items-center gap-0.5"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check size={9} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={9} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-2 bg-surface border border-border-subtle rounded-xl font-mono text-[9px] text-text-muted leading-tight overflow-hidden shadow-2xs">
                {EXAMPLE_CUE_SCHEMA}
              </pre>
            </div>

          </div>

          {/* Right Column: Code Editor & Live Controls / Gemini Schema */}
          <div className="flex-1 flex flex-col min-h-0 bg-surface overflow-hidden">
            
            {/* Action Toolbar with Tab Toggle */}
            <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between gap-3 shrink-0 flex-wrap bg-surface">
              {/* Main Tab Toggle: JSON Data <-> Sync Prompt & Schema */}
              <div className="flex items-center gap-1 bg-surface-muted p-0.5 rounded-xl border border-border-subtle shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('data')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                    activeTab === 'data'
                      ? "bg-surface text-text-main shadow-xs border border-border-subtle/60"
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  <Braces size={13} className={activeTab === 'data' ? "text-blue-500" : "text-text-faint"} />
                  <span>JSON Data</span>
                  <span className="text-[9px] font-mono font-bold text-text-faint bg-surface-subtle px-1.5 py-0.2 rounded-full ml-0.5">
                    {lineCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prompt-schema')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                    activeTab === 'prompt-schema'
                      ? "bg-surface text-text-main shadow-xs border border-border-subtle/60"
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  <Bot size={13} className={activeTab === 'prompt-schema' ? "text-blue-500" : "text-text-faint"} />
                  <span>Sync Prompt & Schema</span>
                </button>
              </div>

              {/* Right Side Header Controls */}
              {activeTab === 'data' ? (
                <div className="flex items-center gap-2">
                  {/* Live Validation Pill */}
                  {validationResult.isValid ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10.5px] font-bold">
                      <CheckCircle2 size={12} className="stroke-[2.5]" />
                      <span>
                        {validationResult.count} {validationResult.count === 1 ? 'cue' : 'cues'} ready
                      </span>
                      {validationResult.wasObjectWrapper && (
                        <span className="text-[8px] font-mono uppercase bg-emerald-500/20 px-1 py-0.2 rounded text-emerald-700 dark:text-emerald-300">
                          {'{ cues } detected'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10.5px] font-bold">
                      <AlertCircle size={12} />
                      <span className="truncate max-w-[180px] sm:max-w-[240px]" title={validationResult.error || 'Invalid JSON'}>
                        {validationResult.error || 'Invalid JSON'}
                      </span>
                    </div>
                  )}

                  {/* Prettify Button */}
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    disabled={!validationResult.isValid}
                    title="Format & indent JSON to 2 spaces"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-2xs",
                      formatSuccess
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-surface-subtle hover:bg-surface-hover border-border-subtle text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    {formatSuccess ? <Check size={12} /> : <Sparkles size={12} />}
                    <span>{formatSuccess ? 'Formatted' : 'Format JSON'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('data')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-surface-subtle transition-all"
                  >
                    <span>Edit JSON</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Main Panel Content */}
            {activeTab === 'data' ? (
              <div className="p-4 flex-1 flex flex-col min-h-0 bg-surface">
                <textarea
                  value={rawCuesText}
                  onChange={(e) => onChangeRawCuesText(e.target.value)}
                  className="w-full flex-1 min-h-[220px] bg-surface-subtle border border-border-subtle rounded-xl p-3.5 font-mono text-xs text-text-body focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed custom-scrollbar"
                  placeholder={EXAMPLE_CUE_SCHEMA}
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="p-4 flex-1 flex flex-col min-h-0 bg-surface gap-3 overflow-hidden">
                {/* Clean, Non-Crowded Gemini Setup Guide */}
                <div className="p-3 bg-surface-subtle/70 rounded-xl border border-border-subtle shrink-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Bot size={14} className="text-blue-500 shrink-0" />
                        <span className="text-xs font-bold text-text-main">
                          Gemini Setup Guide
                        </span>
                      </div>
                      <span className="text-text-faint">·</span>
                      <span className="text-[11px] text-text-muted">
                        Draft baseline — adapt rules and categories to your script
                      </span>
                    </div>

                    {/* Direct Links to Public Files */}
                    <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                      <a
                        href="/sync-prompt.txt"
                        target="_blank"
                        rel="noreferrer"
                        title="Open standalone sync-prompt.txt"
                        className="flex items-center gap-1 text-text-muted hover:text-text-main transition-colors whitespace-nowrap"
                      >
                        <FileText size={11} className="text-text-faint" />
                        <span>sync-prompt.txt</span>
                        <ExternalLink size={10} className="text-text-faint" />
                      </a>
                      <span className="text-border-main">|</span>
                      <a
                        href="/schema.json"
                        target="_blank"
                        rel="noreferrer"
                        title="Open standalone schema.json"
                        className="flex items-center gap-1 text-text-muted hover:text-text-main transition-colors whitespace-nowrap"
                      >
                        <Code2 size={11} className="text-text-faint" />
                        <span>schema.json</span>
                        <ExternalLink size={10} className="text-text-faint" />
                      </a>
                    </div>
                  </div>

                  {/* 3 Step Linear Flow (No heavy nested cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1.5 border-t border-border-subtle/70 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-md bg-surface border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0 font-mono mt-0.5">
                        1
                      </span>
                      <div>
                        <p className="font-bold text-text-main">Set System Prompt</p>
                        <p className="text-text-muted text-[10px] leading-relaxed">
                          Paste the prompt into Gemini's <em>System Instructions</em>. Provide your video and wrap the script in <code className="text-blue-500 font-mono">&lt;ScriptText&gt;</code>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-md bg-surface border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0 font-mono mt-0.5">
                        2
                      </span>
                      <div>
                        <p className="font-bold text-text-main">Set Output Schema</p>
                        <p className="text-text-muted text-[10px] leading-relaxed">
                          In Gemini's <em>Structured Output</em> setting (or API <code className="font-mono text-blue-500">responseSchema</code>), supply the cues schema.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-md bg-surface border border-border-subtle flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0 font-mono mt-0.5">
                        3
                      </span>
                      <div>
                        <p className="font-bold text-text-main">Import Cues</p>
                        <p className="text-text-muted text-[10px] leading-relaxed">
                          Run Gemini, copy the JSON response, and paste it into <strong>JSON Data</strong> to preview and apply your synced cues.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-view Switcher & Actions Toolbar */}
                <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
                  {/* Segmented control for Prompt / Schema / Split */}
                  <div className="flex items-center gap-1 bg-surface-muted p-0.5 rounded-xl border border-border-subtle shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPromptSchemaView('prompt')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                        promptSchemaView === 'prompt'
                          ? "bg-surface text-text-main shadow-xs border border-border-subtle/60"
                          : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <FileText size={12} className={promptSchemaView === 'prompt' ? "text-blue-500" : "text-text-faint"} />
                      <span>Sync Prompt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptSchemaView('schema')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                        promptSchemaView === 'schema'
                          ? "bg-surface text-text-main shadow-xs border border-border-subtle/60"
                          : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <Code2 size={12} className={promptSchemaView === 'schema' ? "text-blue-500" : "text-text-faint"} />
                      <span>Gemini Schema</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptSchemaView('split')}
                      title="View side-by-side"
                      className={cn(
                        "hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                        promptSchemaView === 'split'
                          ? "bg-surface text-text-main shadow-xs border border-border-subtle/60"
                          : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <Columns size={12} className={promptSchemaView === 'split' ? "text-blue-500" : "text-text-faint"} />
                      <span>Split</span>
                    </button>
                  </div>

                  {/* Contextual Copy Button */}
                  <div className="flex items-center gap-2">
                    {promptSchemaView === 'prompt' && (
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-2xs",
                          copiedPrompt
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-surface hover:bg-surface-hover border-border-subtle text-text-main"
                        )}
                      >
                        {copiedPrompt ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copiedPrompt ? 'Copied Prompt' : 'Copy Prompt'}</span>
                      </button>
                    )}

                    {promptSchemaView === 'schema' && (
                      <button
                        type="button"
                        onClick={handleCopySchema}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-2xs",
                          copiedSchema
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-surface hover:bg-surface-hover border-border-subtle text-text-main"
                        )}
                      >
                        {copiedSchema ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copiedSchema ? 'Copied Schema' : 'Copy Schema'}</span>
                      </button>
                    )}

                    {promptSchemaView === 'split' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyPrompt}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border border-border-subtle bg-surface hover:bg-surface-hover text-text-main"
                        >
                          {copiedPrompt ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          <span>{copiedPrompt ? 'Copied Prompt' : 'Copy Prompt'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopySchema}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border border-border-subtle bg-surface hover:bg-surface-hover text-text-main"
                        >
                          {copiedSchema ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          <span>{copiedSchema ? 'Copied Schema' : 'Copy Schema'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Container Workspace */}
                <div className="flex-1 min-h-0">
                  {promptSchemaView === 'prompt' && (
                    <div className="h-full flex flex-col rounded-xl border border-border-subtle bg-surface-subtle overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface border-b border-border-subtle text-[11px] text-text-faint font-mono shrink-0">
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-blue-500" />
                          <span className="font-bold text-text-main font-sans text-xs">Sync Prompt Instructions</span>
                          <span>(sync-prompt.txt)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPrompt}
                          className="hover:text-text-main flex items-center gap-1 font-sans text-xs font-bold transition-colors text-text-muted"
                        >
                          {copiedPrompt ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span className={copiedPrompt ? "text-emerald-500" : ""}>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="w-full flex-1 p-4 font-mono text-xs text-text-body overflow-auto custom-scrollbar leading-relaxed whitespace-pre-wrap select-text">
                        {CUES_SYNC_PROMPT}
                      </pre>
                    </div>
                  )}

                  {promptSchemaView === 'schema' && (
                    <div className="h-full flex flex-col rounded-xl border border-border-subtle bg-surface-subtle overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface border-b border-border-subtle text-[11px] text-text-faint font-mono shrink-0">
                        <div className="flex items-center gap-2">
                          <Code2 size={12} className="text-blue-500" />
                          <span className="font-bold text-text-main font-sans text-xs">Gemini Structured Output Schema</span>
                          <span>(schema.json)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopySchema}
                          className="hover:text-text-main flex items-center gap-1 font-sans text-xs font-bold transition-colors text-text-muted"
                        >
                          {copiedSchema ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          <span className={copiedSchema ? "text-emerald-500" : ""}>{copiedSchema ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="w-full flex-1 p-4 font-mono text-xs text-text-body overflow-auto custom-scrollbar leading-relaxed select-text">
                        {GEMINI_CUE_SCHEMA}
                      </pre>
                    </div>
                  )}

                  {promptSchemaView === 'split' && (
                    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Left: Prompt */}
                      <div className="flex flex-col min-h-0 rounded-xl border border-border-subtle bg-surface-subtle overflow-hidden shadow-inner">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-b border-border-subtle text-[10.5px] text-text-faint font-mono shrink-0">
                          <div className="flex items-center gap-1.5">
                            <FileText size={11} className="text-blue-500" />
                            <span className="font-bold text-text-main font-sans text-xs">Sync Prompt</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyPrompt}
                            className="hover:text-text-main flex items-center gap-1 font-sans text-xs font-bold transition-colors text-text-muted"
                          >
                            {copiedPrompt ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            <span className={copiedPrompt ? "text-emerald-500" : ""}>{copiedPrompt ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="w-full flex-1 p-3 font-mono text-[10.5px] text-text-body overflow-auto custom-scrollbar leading-relaxed whitespace-pre-wrap select-text">
                          {CUES_SYNC_PROMPT}
                        </pre>
                      </div>

                      {/* Right: Schema */}
                      <div className="flex flex-col min-h-0 rounded-xl border border-border-subtle bg-surface-subtle overflow-hidden shadow-inner">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-b border-border-subtle text-[10.5px] text-text-faint font-mono shrink-0">
                          <div className="flex items-center gap-1.5">
                            <Code2 size={11} className="text-blue-500" />
                            <span className="font-bold text-text-main font-sans text-xs">Gemini Schema</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopySchema}
                            className="hover:text-text-main flex items-center gap-1 font-sans text-xs font-bold transition-colors text-text-muted"
                          >
                            {copiedSchema ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                            <span className={copiedSchema ? "text-emerald-500" : ""}>{copiedSchema ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="w-full flex-1 p-3 font-mono text-[10.5px] text-text-body overflow-auto custom-scrollbar leading-relaxed select-text">
                          {GEMINI_CUE_SCHEMA}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Context-Aware Modal Footer */}
            <div className="px-5 py-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-between gap-4 shrink-0">
              {activeTab === 'data' ? (
                <>
                  <p className="text-[11px] text-text-muted hidden sm:block">
                    Applying updates will replace current project cues.
                  </p>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-main text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!validationResult.isValid || validationResult.count === 0}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-sm whitespace-nowrap",
                        validationResult.isValid && validationResult.count > 0
                          ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                          : "bg-blue-500/40 opacity-50 cursor-not-allowed shadow-none"
                      )}
                    >
                      Apply Cues ({validationResult.count})
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] text-text-muted hidden sm:block">
                    Ready with your Gemini output? Paste it into JSON Data to review and apply.
                  </p>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-main text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('data')}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-blue-500/20 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>Go to JSON Data</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
