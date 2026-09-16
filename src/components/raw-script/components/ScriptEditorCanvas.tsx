import React from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ScriptEditorCanvasProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  mirrorRef: React.RefObject<HTMLDivElement | null>;
  draftText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  wordWrap: boolean;
  lines: string[];
  lineHeights: number[];
  lineNumbersText: string;
  mirrorWidth: number;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function ScriptEditorCanvas({
  textareaRef,
  lineNumbersRef,
  mirrorRef,
  draftText,
  onTextChange,
  onKeyDown,
  onScroll,
  wordWrap,
  lines,
  lineHeights,
  lineNumbersText,
  mirrorWidth,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: ScriptEditorCanvasProps) {
  return (
    <div 
      className={cn(
        "flex-1 relative flex min-h-0 bg-surface-subtle/30 overflow-hidden transition-colors",
        isDragging && "bg-purple-500/5 ring-2 ring-inset ring-purple-500/40"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/90 backdrop-blur-xs pointer-events-none">
          <div className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-purple-500 text-purple-600">
            <Upload size={32} className="animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider">Drop script file here</span>
          </div>
        </div>
      )}

      {/* Line Numbers Gutter */}
      <div 
        ref={lineNumbersRef}
        aria-hidden="true"
        className={cn(
          "w-10 sm:w-11 bg-surface-muted/40 border-r border-border-subtle/60 py-3.5 pr-2 pl-1.5 text-right select-none font-mono text-[11px] sm:text-xs leading-[19.2px] text-text-faint/50 overflow-hidden shrink-0 pointer-events-none",
          !wordWrap && "whitespace-pre"
        )}
      >
        {wordWrap ? (
          lines.map((_, i) => (
            <div 
              key={i} 
              style={{ height: `${(lineHeights[i] && lineHeights[i] > 0) ? lineHeights[i] : 19.2}px` }}
              className="leading-[19.2px]"
            >
              {i + 1}
            </div>
          ))
        ) : (
          lineNumbersText
        )}
      </div>

      {/* Hidden mirror element for measuring wrapped line heights */}
      {wordWrap && (
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className="absolute pointer-events-none invisible overflow-hidden font-mono text-[11px] sm:text-xs leading-[19.2px] whitespace-pre-wrap break-words"
          style={{
            width: mirrorWidth > 0 ? `${mirrorWidth}px` : (textareaRef.current ? `${Math.max(0, textareaRef.current.clientWidth - 28)}px` : '100%'),
            top: 0,
            left: 0,
          }}
        >
          {lines.map((line, idx) => (
            <div key={idx}>{line || '\u00A0'}</div>
          ))}
        </div>
      )}

      {/* Textarea Editor */}
      <textarea
        ref={textareaRef}
        value={draftText}
        onChange={onTextChange}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
        placeholder="Write, paste, or drop your script/brief here. Select text to wrap in [[STAGING]] or [[INTENT]] tags..."
        className={cn(
          "flex-1 w-full h-full p-3.5 bg-transparent border-0 font-mono text-[11px] sm:text-xs leading-[19.2px] text-text-main placeholder-text-placeholder focus:outline-none resize-none custom-scrollbar",
          wordWrap
            ? "whitespace-pre-wrap break-words overflow-x-hidden"
            : "whitespace-pre overflow-x-auto"
        )}
        spellCheck={false}
      />
    </div>
  );
}
