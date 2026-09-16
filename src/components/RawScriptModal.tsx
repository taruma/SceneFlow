import React, { useState, useRef, useCallback, useDeferredValue } from 'react';
import { UI_TOKENS } from '../styles/tokens/ui';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { 
  RawScriptModalProps,
  TocItem,
  useScriptHistory,
  useWordWrap,
  useScriptOutline,
  useCustomTags,
  ScriptModalHeader,
  ScriptOutlineSidebar,
  ScriptEditorToolbar,
  ScriptEditorCanvas,
  ScriptEditorFooter,
  ScriptFormattingGuide,
} from './raw-script';

export type { TocItem, RawScriptModalProps } from './raw-script';

export function RawScriptModal({
  isOpen,
  onClose,
  scriptText,
  onSaveScript,
  onChangeScriptText,
  activeCuesCount = 0,
}: RawScriptModalProps) {
  const [autoRealign, setAutoRealign] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Undo / Redo history engine
  const {
    draftText,
    setDraftText,
    canUndo,
    canRedo,
    pushHistory,
    handleUndo,
    handleRedo,
    handleTextareaChange,
    handleKeyDown: historyKeyDown,
    lastTypingTimeoutRef,
  } = useScriptHistory({
    initialText: scriptText,
    isOpen,
    textareaRef,
    lineNumbersRef,
  });

  // Word wrap (soft wrap) and gutter height measurement
  const {
    wordWrap,
    toggleWordWrap,
    lineHeights,
    mirrorWidth,
    mirrorRef,
    lines,
    lineCount,
    lineNumbersText,
  } = useWordWrap({
    draftText,
    textareaRef,
  });

  // Apply Changes (via Apply button or Ctrl+Enter)
  const handleApply = useCallback(() => {
    if (onSaveScript) {
      onSaveScript(draftText, autoRealign);
    } else if (onChangeScriptText) {
      onChangeScriptText(draftText);
    }
    onClose();
  }, [draftText, autoRealign, onSaveScript, onChangeScriptText, onClose]);

  // Handle keydown with Alt+Z word wrap toggle + history shortcuts + Ctrl+Enter save
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleApply();
      return;
    }
    if (e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      toggleWordWrap();
      return;
    }
    historyKeyDown(e);
  }, [handleApply, toggleWordWrap, historyKeyDown]);

  // Outline parsing decoupled from critical render path via React 19 concurrent transition
  const deferredDraftText = useDeferredValue(draftText);

  // Collapsible hierarchical outline
  const {
    showToc,
    setShowToc,
    activeTocId,
    collapsedSectionIds,
    tocItems,
    visibleTocItems,
    descendantCountMap,
    collapsibleItemIds,
    areAllCollapsed,
    toggleSectionCollapse,
    toggleCollapseAll,
    handleNavigateToSection,
  } = useScriptOutline({
    draftText: deferredDraftText,
    wordWrap,
    lineHeights,
    textareaRef,
    lineNumbersRef,
  });

  const handleToggleToc = useCallback(() => setShowToc(prev => !prev), [setShowToc]);
  const handleToggleGuide = useCallback(() => setShowGuide(prev => !prev), []);
  const handleCloseGuide = useCallback(() => setShowGuide(false), []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  }, []);

  // Persistent Custom Tags kit & staging insertion
  const {
    customTags,
    removeCustomTag,
    handleWrapSelection,
    handleWrapBrief,
    handleCustomTagPrompt,
  } = useCustomTags({
    textareaRef,
    lineNumbersRef,
    lastTypingTimeoutRef,
    setDraftText,
    pushHistory,
  });

  const isDirty = draftText !== (scriptText || '');

  // Insert snippet from formatting guide directly into editor
  const handleInsertSnippet = useCallback((snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? draftText.length;
    const end = textarea.selectionEnd ?? draftText.length;
    const before = draftText.substring(0, start);
    const after = draftText.substring(end);
    const newText = before + snippet + after;
    const newPos = start + snippet.length;

    setDraftText(newText);
    pushHistory(newText, newPos, newPos, textarea.scrollTop);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    });
  }, [draftText, setDraftText, pushHistory]);

  // File Import Logic
  const handleFileImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setDraftText(text);
        pushHistory(text, 0, 0, 0);
      }
    };
    reader.readAsText(file);
  }, [setDraftText, pushHistory]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    e.target.value = '';
  }, [handleFileImport]);

  // Drag and Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  }, [handleFileImport]);

  // Export File (.txt with timestamp and 4-digit identifier)
  const handleExport = useCallback(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const identifier = Math.floor(1000 + Math.random() * 9000);
    const filename = `script_${timestamp}_${identifier}.txt`;

    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [draftText]);

  // Copy to Clipboard
  const handleCopy = useCallback(() => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(draftText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }, [draftText]);

  // Format / Clean Whitespace
  const handleCleanFormat = useCallback(() => {
    const prevScrollTop = textareaRef.current?.scrollTop ?? 0;
    const cleaned = draftText
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    setDraftText(cleaned);
    pushHistory(cleaned, 0, 0, prevScrollTop);

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = prevScrollTop;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = prevScrollTop;
      }
    });
  }, [draftText, setDraftText, pushHistory]);

  // Clear Editor (revertible via Revert Draft or Undo)
  const handleClear = useCallback(() => {
    setDraftText('');
    pushHistory('', 0, 0, 0);
  }, [setDraftText, pushHistory]);

  // Reset to Saved Script
  const handleReset = useCallback(() => {
    const saved = scriptText || '';
    setDraftText(saved);
    pushHistory(saved, 0, 0, 0);
  }, [scriptText, setDraftText, pushHistory]);

  // Close & Discard Draft
  const handleClose = useCallback(() => {
    setDraftText(scriptText || '');
    onClose();
  }, [scriptText, onClose, setDraftText]);

  useEscapeKey(handleClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className={UI_TOKENS.modal.overlayHeavy}>
      <div className="bg-surface w-[96vw] max-w-7xl h-[90vh] md:h-[92vh] rounded-[1.75rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border-main text-text-main flex flex-col will-change-[transform,opacity]">
        
        {/* Modal Header */}
        <ScriptModalHeader isDirty={isDirty} onClose={handleClose} />

        {/* Toolbar: Outline Toggle, Wrap Tags, Undo/Redo & File Actions */}
        <ScriptEditorToolbar
          showToc={showToc}
          onToggleToc={handleToggleToc}
          tocCount={tocItems.length}
          wordWrap={wordWrap}
          onToggleWordWrap={toggleWordWrap}
          showGuide={showGuide}
          onToggleGuide={handleToggleGuide}
          onWrapSelection={handleWrapSelection}
          onWrapBrief={handleWrapBrief}
          customTags={customTags}
          onRemoveCustomTag={removeCustomTag}
          onAddCustomTag={handleCustomTagPrompt}
          canUndo={canUndo}
          onUndo={handleUndo}
          canRedo={canRedo}
          onRedo={handleRedo}
          fileInputRef={fileInputRef}
          onFileInputChange={handleFileInputChange}
          onExport={handleExport}
          onCopy={handleCopy}
          copied={copied}
          onCleanFormat={handleCleanFormat}
          onClear={handleClear}
        />

        {/* Modal Workstation: Table of Contents Sidebar + Script Editor + Formatting Guide */}
        <div className="flex-1 flex min-h-0 overflow-hidden divide-x divide-border-subtle">
          
          {/* Left Column: Outline Sidebar */}
          <ScriptOutlineSidebar
            showToc={showToc}
            tocItems={tocItems}
            visibleTocItems={visibleTocItems}
            activeTocId={activeTocId}
            descendantCountMap={descendantCountMap}
            collapsibleItemIds={collapsibleItemIds}
            areAllCollapsed={areAllCollapsed}
            collapsedSectionIds={collapsedSectionIds}
            toggleSectionCollapse={toggleSectionCollapse}
            toggleCollapseAll={toggleCollapseAll}
            handleNavigateToSection={handleNavigateToSection}
          />

          {/* Center Column: Script Editor Canvas with Line Numbers */}
          <ScriptEditorCanvas
            textareaRef={textareaRef}
            lineNumbersRef={lineNumbersRef}
            mirrorRef={mirrorRef}
            draftText={draftText}
            onTextChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            wordWrap={wordWrap}
            lines={lines}
            lineHeights={lineHeights}
            lineNumbersText={lineNumbersText}
            mirrorWidth={mirrorWidth}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {/* Right Column: Formatting Guide Sidebar */}
          <ScriptFormattingGuide
            isOpen={showGuide}
            onClose={handleCloseGuide}
            onInsertSnippet={handleInsertSnippet}
          />

        </div>

        {/* Bottom Footer Bar */}
        <ScriptEditorFooter
          isDirty={isDirty}
          onReset={handleReset}
          lineCount={lineCount}
          charCount={draftText.length}
          wordWrap={wordWrap}
          onToggleWordWrap={toggleWordWrap}
          activeCuesCount={activeCuesCount}
          autoRealign={autoRealign}
          onToggleAutoRealign={setAutoRealign}
          onClose={handleClose}
          onApply={handleApply}
        />

      </div>
    </div>
  );
}
