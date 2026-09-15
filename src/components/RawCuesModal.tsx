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
  Code2,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Cue } from '../types/script';
import { sanitizeCues } from '../lib/cueUtils';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { cn } from '../lib/utils';

interface RawCuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCuesText: string;
  onChangeRawCuesText: (text: string) => void;
  onSave: (cuesOverride?: Cue[]) => void;
}

const EXAMPLE_CUE_SCHEMA = `[
  {
    "id": "cue_01",
    "type": "dialogue",
    "selectedText": "I think we need to talk about what happened.",
    "startTime": 14.5,
    "endTime": 18.2,
    "startIndex": 120,
    "endIndex": 164
  }
]`;

interface CueSchemaField {
  name: string;
  type: string;
  requirement: 'Required' | 'Optional' | 'Auto-Calc';
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
    name: 'type',
    type: 'string',
    requirement: 'Optional',
    desc: 'Category: dialogue, action, scene, character, parenthetical, transition, shot. Defaults to "dialogue".',
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
        wasProjectObject: false,
      };
    }

    try {
      const parsed = JSON.parse(trimmed);
      let extracted: any[] | null = null;
      let wasProjectObject = false;

      if (Array.isArray(parsed)) {
        extracted = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.cues)) {
        extracted = parsed.cues;
        wasProjectObject = true;
      } else {
        return {
          isValid: false,
          error: 'Expected a JSON array ([...]) or a project object ({ cues: [...] }).',
          cues: [] as Cue[],
          count: 0,
          wasProjectObject: false,
        };
      }

      const sanitized = sanitizeCues(extracted);
      return {
        isValid: true,
        error: null,
        cues: sanitized,
        count: sanitized.length,
        wasProjectObject,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: err?.message || 'Invalid JSON syntax.',
        cues: [] as Cue[],
        count: 0,
        wasProjectObject: false,
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
      <div className="bg-surface w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border-main text-text-main h-[88vh] max-h-[820px] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-subtle shrink-0">
          <div className="flex items-center gap-3.5">
            <div className={UI_TOKENS.iconWrapper.blue}>
              <Braces size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                Cues JSON Editor
              </h2>
              <p className="text-[10px] font-bold text-text-faint uppercase tracking-wider">
                SceneFlow Cue Schema & Direct JSON Import
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Close modal"
            className={UI_TOKENS.button.iconCloseSquare}
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Workstation Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border-subtle">
          
          {/* Left Column: Schema Reference & Educational Guide */}
          <div className="w-full md:w-80 lg:w-96 bg-surface-subtle/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-5 space-y-4">
            
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500 shrink-0" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-text-main">
                  Schema Reference
                </h3>
                <p className="text-[10px] text-text-muted">
                  How SceneFlow structures sync cues
                </p>
              </div>
            </div>

            {/* Overview Card */}
            <div className="p-3 bg-surface rounded-2xl border border-border-subtle text-[11px] text-text-muted leading-relaxed space-y-1.5 shadow-2xs">
              <p className="font-semibold text-text-main flex items-center gap-1.5">
                <Code2 size={12} className="text-blue-500" />
                <span>Array&lt;Cue&gt; Structure</span>
              </p>
              <p>
                Each cue maps a highlighted screenplay section to a video timecode window. Both standalone arrays and full project JSON files are supported.
              </p>
            </div>

            {/* Essential Fields */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-faint">
                  Essential Fields
                </span>
                <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                  2 required
                </span>
              </div>
              <div className="space-y-1.5">
                {ESSENTIAL_FIELDS.map((field) => (
                  <div 
                    key={field.name}
                    className="p-2.5 rounded-xl bg-surface border border-border-subtle space-y-1 shadow-2xs text-[11px]"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
                        {field.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25">
                          {field.requirement}
                        </span>
                        <span className="text-[8px] font-mono uppercase bg-surface-muted px-1.5 py-0.5 rounded text-text-faint border border-border-subtle">
                          {field.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-muted text-[10px] leading-snug">
                      {field.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible Optional & Auto-Calc Fields */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsOptionalFieldsOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle hover:bg-surface-hover text-text-main text-xs transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-faint group-hover:text-text-main transition-colors">
                    Optional & Auto-Calc Fields
                  </span>
                  <span className="text-[9px] font-mono bg-surface-muted text-text-faint px-1.5 py-0.2 rounded-full font-bold">
                    {OPTIONAL_FIELDS.length}
                  </span>
                </div>
                {isOptionalFieldsOpen ? (
                  <ChevronUp size={13} className="text-text-faint group-hover:text-text-main" />
                ) : (
                  <ChevronDown size={13} className="text-text-faint group-hover:text-text-main" />
                )}
              </button>

              {isOptionalFieldsOpen && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                  {OPTIONAL_FIELDS.map((field) => (
                    <div 
                      key={field.name}
                      className="p-2.5 rounded-xl bg-surface border border-border-subtle space-y-1 shadow-2xs text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
                          {field.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={cn(
                            "text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border tracking-wider",
                            field.requirement === 'Auto-Calc' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
                            field.requirement === 'Optional' && "bg-surface-muted text-text-faint border-border-subtle"
                          )}>
                            {field.requirement}
                          </span>
                          <span className="text-[8px] font-mono uppercase bg-surface-muted px-1.5 py-0.5 rounded text-text-faint border border-border-subtle">
                            {field.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-muted text-[10px] leading-snug">
                        {field.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Example JSON Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-text-faint">
                  Example Payload
                </span>
                <div className="flex items-center gap-1.5">
                  {rawCuesText.trim() === '' && (
                    <button
                      type="button"
                      onClick={handleInsertTemplate}
                      title="Load example payload into editor"
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <FileText size={10} />
                      Insert
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyExample}
                    title="Copy example to clipboard"
                    className="text-[10px] font-bold text-text-muted hover:text-text-main flex items-center gap-1"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check size={10} className="text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={10} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-surface border border-border-subtle rounded-xl font-mono text-[10px] text-text-muted overflow-x-auto leading-relaxed custom-scrollbar shadow-2xs">
                {EXAMPLE_CUE_SCHEMA}
              </pre>
            </div>

            {/* Tip Footer */}
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 text-[10px] text-text-muted space-y-1">
              <p className="font-bold text-blue-600 dark:text-blue-400">💡 Import Tip</p>
              <p className="leading-snug">
                Pasting a full project JSON (`{'{ youtubeId, scriptText, cues }'}`) will automatically extract the cues array without errors.
              </p>
            </div>

          </div>

          {/* Right Column: Code Editor & Live Controls */}
          <div className="flex-1 flex flex-col min-h-0 bg-surface overflow-hidden">
            
            {/* Editor Action Toolbar */}
            <div className="px-6 py-3 border-b border-border-subtle flex items-center justify-between gap-3 shrink-0 flex-wrap bg-surface">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-text-main">
                  JSON Data
                </span>
                <span className="text-[10px] font-mono font-bold text-text-faint bg-surface-muted px-2 py-0.5 rounded-full">
                  {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Live Validation Pill */}
                {validationResult.isValid ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-bold">
                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                    <span>
                      {validationResult.count} {validationResult.count === 1 ? 'cue' : 'cues'} ready
                    </span>
                    {validationResult.wasProjectObject && (
                      <span className="text-[9px] font-mono uppercase bg-emerald-500/20 px-1 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                        From Project
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[11px] font-bold">
                    <AlertCircle size={13} />
                    <span className="truncate max-w-[200px] sm:max-w-[280px]" title={validationResult.error || 'Invalid JSON'}>
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
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-2xs",
                    formatSuccess
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-surface-subtle hover:bg-surface-hover border-border-subtle text-text-muted hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  {formatSuccess ? <Check size={13} /> : <Sparkles size={13} />}
                  <span>{formatSuccess ? 'Formatted' : 'Format JSON'}</span>
                </button>
              </div>
            </div>

            {/* Code Editor Body */}
            <div className="p-6 flex-1 flex flex-col min-h-0 bg-surface">
              <textarea
                value={rawCuesText}
                onChange={(e) => onChangeRawCuesText(e.target.value)}
                className="w-full flex-1 min-h-[280px] bg-surface-subtle border-2 border-border-subtle rounded-2xl p-4 lg:p-5 font-mono text-xs text-text-body focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed custom-scrollbar"
                placeholder={EXAMPLE_CUE_SCHEMA}
                spellCheck={false}
              />
            </div>

            {/* Right Column Footer */}
            <div className="px-6 py-4 border-t border-border-subtle bg-surface-subtle flex items-center justify-between gap-4 shrink-0">
              <p className="text-xs text-text-muted hidden sm:block">
                Applying updates will replace all current project cues.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-border-main bg-surface hover:bg-surface-hover text-text-main text-xs font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!validationResult.isValid || validationResult.count === 0}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-md",
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
