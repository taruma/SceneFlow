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
  Bot
} from 'lucide-react';
import { Cue } from '../types/script';
import { sanitizeCues } from '../lib/cueUtils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { cn } from '../lib/utils';
import cuesSchemaJson from '../schemas/cues.schema.json';

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
  const [activeTab, setActiveTab] = useState<'data' | 'schema'>('data');
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
                          "text-[7.5px] font-mono font-bold uppercase px-1 py-0.2 rounded border tracking-wider",
                          field.requirement === 'Required' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
                          field.requirement === 'Optional' && "bg-surface-muted text-text-faint border-border-subtle"
                        )}>
                          {field.requirement}
                        </span>
                        <span className="text-[7.5px] font-mono uppercase bg-surface-muted px-1 py-0.2 rounded text-text-faint border border-border-subtle">
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
                            "text-[7.5px] font-mono font-bold uppercase px-1 py-0.2 rounded border tracking-wider",
                            field.requirement === 'Auto-Calc' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
                            field.requirement === 'Legacy' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
                            field.requirement === 'Optional' && "bg-surface-muted text-text-faint border-border-subtle"
                          )}>
                            {field.requirement}
                          </span>
                          <span className="text-[7.5px] font-mono uppercase bg-surface-muted px-1 py-0.2 rounded text-text-faint border border-border-subtle">
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
            <div className="px-4 py-2 border-b border-border-subtle flex items-center justify-between gap-3 shrink-0 flex-wrap bg-surface">
              {/* Toggle: JSON Data <-> Gemini Schema */}
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
                  <Braces size={12} className={activeTab === 'data' ? "text-blue-500" : "text-text-faint"} />
                  <span>JSON Data</span>
                  <span className="text-[9px] font-mono font-bold text-text-faint bg-surface-subtle px-1.5 py-0.2 rounded-full ml-0.5">
                    {lineCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schema')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                    activeTab === 'schema'
                      ? "bg-surface text-text-main shadow-xs border border-border-subtle/60"
                      : "text-text-muted hover:text-text-main"
                  )}
                >
                  <Bot size={12} className={activeTab === 'schema' ? "text-purple-500" : "text-text-faint"} />
                  <span>Gemini Schema</span>
                </button>
              </div>

              {/* Right Side Header Controls */}
              {activeTab === 'data' ? (
                <div className="flex items-center gap-2">
                  {/* Live Validation Pill */}
                  {validationResult.isValid ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
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
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold">
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
                      "flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 border shadow-2xs",
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
                    onClick={handleCopySchema}
                    title="Copy Gemini JSON Schema to clipboard"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-2xs",
                      copiedSchema
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-purple-600 hover:bg-purple-700 text-white border-purple-600/30 shadow-purple-600/20"
                    )}
                  >
                    {copiedSchema ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
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
              <div className="p-4 flex-1 flex flex-col min-h-0 bg-surface">
                <div className="flex-1 min-h-0 relative rounded-xl border border-border-subtle bg-surface-subtle overflow-hidden flex flex-col shadow-inner">
                  <div className="flex items-center justify-between px-3.5 py-1.5 bg-surface border-b border-border-subtle text-[10px] text-text-faint font-mono shrink-0">
                    <span>schema.json</span>
                    <button
                      type="button"
                      onClick={handleCopySchema}
                      className="hover:text-text-main flex items-center gap-1 font-sans text-[10px] font-bold transition-colors"
                    >
                      {copiedSchema ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      <span>{copiedSchema ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="w-full flex-1 p-3.5 font-mono text-[10.5px] text-text-body overflow-auto custom-scrollbar leading-relaxed select-text">
                    {GEMINI_CUE_SCHEMA}
                  </pre>
                </div>
              </div>
            )}

            {/* Right Column Footer */}
            <div className="px-5 py-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-between gap-4 shrink-0">
              <p className="text-[11px] text-text-muted hidden sm:block">
                Applying updates will replace current project cues.
              </p>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-main text-xs font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!validationResult.isValid || validationResult.count === 0}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-md",
                    validationResult.isValid && validationResult.count > 0
                      ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                      : "bg-blue-500/40 opacity-50 cursor-not-allowed shadow-none"
                  )}
                >
                  Apply Cues ({validationResult.count})
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
