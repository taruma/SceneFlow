import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import YouTube from 'react-youtube';
import { Video } from 'lucide-react';
import { EXAMPLE_SECTIONS } from './examples';
import { processScript } from './lib/scriptProcessor';
import { ScriptLine } from './components/script/ScriptLine';
import { StagingModal } from './components/StagingModal';
import { LibraryModal } from './components/LibraryModal';
import { MobileLibraryModal } from './components/MobileLibraryModal';
import { InitializingScreen } from './components/InitializingScreen';
import { YoutubeSourceInput } from './components/YoutubeSourceInput';
import { ScriptManagementBar } from './components/ScriptManagementBar';
import { RawScriptModal } from './components/RawScriptModal';
import { RawCuesModal } from './components/RawCuesModal';
import { OverlapPicker } from './components/OverlapPicker';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ResetConfirmationModal } from './components/ResetConfirmationModal';
import { TimingSettingsModal } from './components/TimingSettingsModal';
import { ScriptColorModal } from './components/ScriptColorModal';
import { MobileColorModal } from './components/MobileColorModal';
import { AppInfoModal } from './components/AppInfoModal';
import { AppHeader } from './components/AppHeader';
import { PlaybackLeftPanel } from './components/playback/PlaybackLeftPanel';
import { SplitPaneDivider } from './components/common/SplitPaneDivider';
import { ActiveHighlightsPanel } from './components/ActiveHighlightsPanel';
import { TimelineCuesPanel } from './components/TimelineCuesPanel';
import { ScriptHeaderControls } from './components/ScriptHeaderControls';
import { CueEditorForm } from './components/CueEditorForm';
import { cn, extractYoutubeId } from './lib/utils';
import { UI_TOKENS } from './styles/tokens/ui';
import { useScriptStorage } from './hooks/useScriptStorage';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useScriptPreferences } from './hooks/useScriptPreferences';
import { useScriptTheme } from './hooks/useScriptTheme';
import { useAppShellTheme } from './hooks/useAppShellTheme';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useCueEditor } from './hooks/useCueEditor';
import { useCueAlignment } from './hooks/useCueAlignment';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { Cue, AppMode } from './types/script';
import { 
  COLORS, 
  DEFAULT_SETTINGS, 
  SCRIPT_WIDTH_PRESETS 
} from './constants/script';
import {
  sanitizeCues,
  isCueActive,
  exportStateToJsonFile,
  validateImportedScriptJson
} from './lib/cueUtils';

export default function App() {
  const [activeStaging, setActiveStaging] = useState<{ label: string; content: string } | null>(null);
  const [mode, setMode] = useState<AppMode>('playback');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCuesModalOpen, setIsCuesModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [rawCuesText, setRawCuesText] = useState("");
  const [leftPanelScroll, setLeftPanelScroll] = useState(0);

  const scriptRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  const {
    state,
    setState,
    isInitialized,
    isRemoteLoading,
    resetToDefault,
    loadBlank: loadBlankStorage,
    loadExample: loadExampleStorage,
    loadRemoteProject: loadRemoteProjectStorage,
  } = useScriptStorage();

  const {
    player,
    playerState,
    currentTime,
    setCurrentTime,
    onReady,
    onStateChange,
    togglePlayPause,
    jumpBy,
    seekTo,
  } = useYouTubePlayer({
    youtubeId: state.youtubeId,
    onPlay: () => setActiveStaging(null),
  });

  const {
    videoHeight,
    setVideoHeight,
    commitVideoHeight,
    scriptWidthPreset,
    setScriptWidthPreset,
    isWidthDropdownOpen,
    setIsWidthDropdownOpen,
    scrollFocusPreset,
    setScrollFocusPreset,
    isScrollFocusDropdownOpen,
    setIsScrollFocusDropdownOpen,
    scriptThemeId,
    setScriptThemeId,
    cuePaletteProfile,
    setCuePaletteProfile,
    isColorModalOpen,
    setIsColorModalOpen,
    hiddenCueTypes,
    toggleCueTypeVisibility,
    splitRatio,
    setSplitRatio,
    commitSplitRatio,
    resetViewLayout,
    isViewCustomized,
    isVideoCollapsed,
    toggleVideoCollapsed,
    pureBlackMode,
    setPureBlackMode,
  } = useScriptPreferences();

  const { theme: activeTheme } = useScriptTheme(scriptThemeId, cuePaletteProfile);
  const {
    themeMode,
    setThemeMode,
    cycleThemeMode,
    effectiveCategory,
  } = useAppShellTheme(scriptThemeId);

  const isScriptPureBlack = pureBlackMode && activeTheme.category === 'dark';
  const isShellPureBlack = pureBlackMode && effectiveCategory === 'dark';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isScriptPureBlack) {
        document.documentElement.setAttribute('data-pure-black-script', 'true');
        document.body.setAttribute('data-pure-black-script', 'true');
      } else {
        document.documentElement.removeAttribute('data-pure-black-script');
        document.body.removeAttribute('data-pure-black-script');
      }

      if (isShellPureBlack) {
        document.documentElement.setAttribute('data-pure-black-shell', 'true');
        document.body.setAttribute('data-pure-black-shell', 'true');
      } else {
        document.documentElement.removeAttribute('data-pure-black-shell');
        document.body.removeAttribute('data-pure-black-shell');
      }
    }
  }, [isScriptPureBlack, isShellPureBlack]);

  const {

    selection,
    setSelection,
    newCue,
    setNewCue,
    altLocations,
    deleteConfirmation,
    setDeleteConfirmation,
    resetConfirmation,
    setResetConfirmation,
    overlapPicker,
    setOverlapPicker,
    handleSelection,
    saveCue,
    cancelEdit,
    findAlternativeLocations,
    deleteCue,
    confirmDelete,
    selectCueForEdit,
  } = useCueEditor({
    scriptText: state.scriptText,
    cues: state.cues,
    setState,
    mode,
    player,
  });

  const {
    isAligning,
    alignSuccess,
    realignCues,
  } = useCueAlignment({
    state,
    setState,
  });

  // Master disabled check for global playback keyboard shortcuts
  const isAnyModalOpen = Boolean(
    isColorModalOpen ||
    isSettingsOpen ||
    isInfoModalOpen ||
    isScriptModalOpen ||
    isCuesModalOpen ||
    isLibraryOpen ||
    activeStaging ||
    deleteConfirmation.isOpen ||
    resetConfirmation.isOpen ||
    overlapPicker.isOpen
  );

  const { isDesktop } = useKeyboardShortcuts({
    player,
    togglePlayPause,
    jumpBy,
    onToggleVideo: mode === 'playback' ? toggleVideoCollapsed : undefined,
    disabled: isAnyModalOpen,
  });

  const {
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    autoScrollTargets,
    setAutoScrollTargets,
    isAutoScrollDropdownOpen,
    setIsAutoScrollDropdownOpen,
    applyScrollFocus,
  } = useAutoScroll({
    scriptRef,
    cues: state.cues,
    settings: state.settings,
    currentTime,
    mode,
    isDesktop,
    scrollFocusPreset,
    onScrollFocusChange: setScrollFocusPreset,
  });


  const prevActiveCueTypesRef = useRef<Set<string>>(new Set());
  const activeCueTypes = useMemo(() => {
    const active = new Set<string>();
    (state.cues || []).forEach(c => {
      if (isCueActive(c, currentTime, state.settings)) {
        active.add(c.type || 'dialogue');
      }
    });

    const prev = prevActiveCueTypesRef.current;
    if (prev.size === active.size) {
      let isSame = true;
      for (const t of active) {
        if (!prev.has(t)) {
          isSame = false;
          break;
        }
      }
      if (isSame) {
        return prev;
      }
    }

    prevActiveCueTypesRef.current = active;
    return active;
  }, [state.cues, state.settings, currentTime]);

  // Handle example and project query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const exampleId = params.get('example');
    const projectUrl = params.get('project');
    
    if (exampleId) {
      // Find the matching example in EXAMPLE_SECTIONS
      let foundExample = null;
      for (const section of EXAMPLE_SECTIONS) {
        foundExample = section.items.find(item => item.id === exampleId);
        if (foundExample) break;
      }

      if (foundExample) {
        setResetConfirmation({
          isOpen: true,
          type: 'example',
          examplePath: foundExample.path,
          exampleTitle: foundExample.title,
          error: null,
        });
      }
    } else if (projectUrl) {
      // Basic URL validation
      try {
        new URL(projectUrl);
        setResetConfirmation({
          isOpen: true,
          type: 'remote',
          remoteUrl: projectUrl,
          error: null,
        });
      } catch (e) {
        console.error("Invalid project URL provided in query parameter", projectUrl);
      }
    }

    if (exampleId || projectUrl) {
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const saveRawCues = () => {
    try {
      const parsedCues = JSON.parse(rawCuesText);
      if (!Array.isArray(parsedCues)) throw new Error("Must be an array");
      setState(prev => ({ ...prev, cues: sanitizeCues(parsedCues) }));
      setIsCuesModalOpen(false);
    } catch (err) {
      alert("Invalid JSON format for cues. Please check your syntax.");
    }
  };

  const resetState = async () => {
    try {
      await resetToDefault();
      setMode('playback');
      setCurrentTime(0);
      setResetConfirmation({ isOpen: false, type: null, error: null });
    } catch (err) {
      console.error("Failed to reset to default script", err);
    }
  };

  const loadBlank = async () => {
    try {
      const finalData = await loadBlankStorage();
      setMode('playback');
      setCurrentTime(0);
      setResetConfirmation({ isOpen: false, type: null, error: null });
      realignCues(finalData);
    } catch (err) {
      alert("Failed to load blank script.");
    }
  };

  const loadExample = async (path: string) => {
    try {
      const finalData = await loadExampleStorage(path);
      setMode('playback');
      setCurrentTime(0);
      setResetConfirmation({ isOpen: false, type: null, error: null });
      setIsLibraryOpen(false);
      realignCues(finalData);
    } catch (err) {
      alert("Failed to load example.");
    }
  };

  const loadRemoteProject = async (url: string) => {
    setResetConfirmation(prev => ({ ...prev, error: null }));
    try {
      const finalData = await loadRemoteProjectStorage(url);
      setMode('playback');
      setCurrentTime(0);
      setResetConfirmation({ isOpen: false, type: null, error: null });
      setIsLibraryOpen(false);
      realignCues(finalData);
    } catch (err: any) {
      setResetConfirmation(prev => ({
        ...prev,
        error: err.message,
      }));
    }
  };

  const isCueVisible = (c: Cue) => {
    if (hiddenCueTypes.has(c.type || 'dialogue')) return false;
    return isCueActive(c, currentTime, state.settings);
  };

  const exportJson = () => {
    exportStateToJsonFile(state);
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validatedJson = validateImportedScriptJson(json);

        setState(validatedJson);
        // Automatically trigger alignment after import
        realignCues(validatedJson);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Memoize script parsing independently of currentTime
  const processedLines = useMemo(() => {
    return processScript(state.scriptText || "");
  }, [state.scriptText]);

  // Pre-index cues by overlapping line index to avoid O(N * M) filtering on every render tick
  const cuesByLineIndex = useMemo(() => {
    const map = new Map<number, Cue[]>();
    const cues = state.cues || [];
    if (cues.length === 0 || processedLines.length === 0) return map;

    processedLines.forEach((lineData) => {
      const overlapping = cues.filter(
        cue => cue.startIndex < lineData.lineEnd && cue.endIndex > lineData.lineStart
      );
      if (overlapping.length > 0) {
        map.set(lineData.lineIdx, overlapping);
      }
    });
    return map;
  }, [state.cues, processedLines]);

  const EMPTY_CUES_ARRAY: Cue[] = useMemo(() => [], []);

  const handleOverlapPicker = useCallback((cues: Cue[], pos: { x: number; y: number }) => {
    setOverlapPicker({
      isOpen: true,
      cues,
      position: pos,
    });
  }, [setOverlapPicker]);

  // Rendering the screenplay with memoized ScriptLine components
  const renderedScript = useMemo(() => {
    return processedLines.map((lineData) => (
      <ScriptLine
        key={lineData.lineIdx}
        lineData={lineData}
        cues={cuesByLineIndex.get(lineData.lineIdx) || EMPTY_CUES_ARRAY}
        mode={mode}
        currentTime={currentTime}
        settings={state.settings}
        hiddenCueTypes={hiddenCueTypes}
        scriptThemeId={scriptThemeId}
        cuePaletteProfile={cuePaletteProfile}
        playerState={playerState}
        isDesktop={isDesktop}
        selection={selection}
        editingCueId={newCue.id}
        onSelectStaging={setActiveStaging}
        onSelectCue={selectCueForEdit}
        onOverlapPicker={handleOverlapPicker}
      />
    ));
  }, [
    processedLines,
    cuesByLineIndex,
    EMPTY_CUES_ARRAY,
    mode,
    currentTime,
    state.settings,
    hiddenCueTypes,
    scriptThemeId,
    cuePaletteProfile,
    playerState,
    isDesktop,
    selection,
    newCue.id,
    selectCueForEdit,
    handleOverlapPicker,
  ]);

  const canSave = newCue.selectedText && newCue.startTime !== undefined && newCue.endTime !== undefined && newCue.startIndex !== undefined && newCue.endIndex !== undefined;

  if (!isInitialized) {
    return <InitializingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-app text-text-main font-sans overflow-hidden">
      {/* Header */}
      <AppHeader
        mode={mode}
        setMode={setMode}
        currentTime={currentTime}
        isLibraryOpen={isLibraryOpen}
        setIsLibraryOpen={setIsLibraryOpen}
        onOpenGuide={() => setResetConfirmation({ isOpen: true, type: 'blank', error: null })}
        isColorModalOpen={isColorModalOpen}
        setIsColorModalOpen={setIsColorModalOpen}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isInfoModalOpen={isInfoModalOpen}
        setIsInfoModalOpen={setIsInfoModalOpen}
        importJson={importJson}
        exportJson={exportJson}
        themeMode={themeMode}
        effectiveThemeCategory={effectiveCategory}
        onCycleThemeMode={cycleThemeMode}
        isViewCustomized={isViewCustomized}
        onResetView={resetViewLayout}
      />

      <main className={cn(
        "flex flex-1 flex-col lg:flex-row overflow-hidden",
        mode === 'playback' && "overflow-y-auto lg:overflow-hidden"
      )}>
        {/* Left Panel: Media & Controls */}
        {mode === 'playback' ? (
          <PlaybackLeftPanel
            youtubeId={state.youtubeId}
            videoHeight={videoHeight}
            setVideoHeight={setVideoHeight}
            commitVideoHeight={commitVideoHeight}
            isVideoCollapsed={isVideoCollapsed}
            onToggleVideoCollapsed={toggleVideoCollapsed}
            onTogglePlayPause={togglePlayPause}
            onReplay={() => seekTo(0, true, true)}
            isDesktop={isDesktop}
            playerState={playerState}
            currentTime={currentTime}
            onReady={onReady}
            onStateChange={onStateChange}
            seekTo={seekTo}
            cues={state.cues}
            settings={state.settings}
            isCueVisible={isCueVisible}
            activeCueTypes={activeCueTypes}
            hiddenCueTypes={hiddenCueTypes}
            toggleCueTypeVisibility={toggleCueTypeVisibility}
            scriptThemeId={scriptThemeId}
            cuePaletteProfile={cuePaletteProfile}
            style={isDesktop ? { width: `${splitRatio}%` } : undefined}
          />
        ) : (
          <div 
            ref={leftPanelRef}
            onScroll={(e) => setLeftPanelScroll(e.currentTarget.scrollTop)}
            style={isDesktop ? { width: `${splitRatio}%` } : undefined}
            className={cn(
              UI_TOKENS.layout.leftPanelBase,
              "w-full border-r p-4 lg:p-10 overflow-y-auto scrollbar-hide transition-all duration-300"
            )}
          >
            {/* YouTube Source Input - Not Sticky in Edit Mode */}
            <YoutubeSourceInput
              youtubeId={state.youtubeId}
              onChange={(value) => setState(prev => ({ ...prev, youtubeId: value }))}
              onClear={() => setState(prev => ({ ...prev, youtubeId: '' }))}
              hasPlayer={!!player}
            />

            {/* Video Player Section - Sticky in Edit Mode */}
            <section className={cn(
              "transition-all duration-300 z-30 sticky top-0 -mx-4 lg:-mx-10 px-4 lg:px-10", 
              leftPanelScroll <= 80 && "bg-surface border-b border-border-subtle pb-6 mb-8 space-y-4",
              leftPanelScroll > 80 && "bg-transparent pointer-events-none space-y-0 pb-0 mb-0"
            )}>
              <div className={cn(
                "flex items-center justify-between transition-all duration-300", 
                leftPanelScroll > 80 && "opacity-0 h-0 overflow-hidden mb-0"
              )}>
                <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-text-faint flex items-center gap-2">
                  <Video size={14} /> Media Preview
                </h2>
              </div>
              
              <div className={cn(
                "aspect-video bg-black overflow-hidden shadow-2xl ring-1 ring-border-main relative group transition-all duration-500 origin-top-left pointer-events-auto rounded-3xl",
                leftPanelScroll > 80 && "w-1/2 rounded-2xl shadow-2xl scale-90 -translate-y-2"
              )}>
                <YouTube
                  key={extractYoutubeId(state.youtubeId)}
                  videoId={extractYoutubeId(state.youtubeId)}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 0,
                      modestbranding: 1,
                      rel: 0,
                      controls: 1,
                      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                    },
                  }}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  className="w-full h-full bg-black"
                  iframeClassName="w-full h-full block border-0 bg-black"
                />
              </div>
            </section>

            {/* Script Management Section - Only in Edit Mode */}
            <ScriptManagementBar
              lineCount={state.scriptText.split('\n').length}
              onOpenRawScriptModal={() => setIsScriptModalOpen(true)}
            />

            {/* Edit Mode Controls */}
            <TimelineCuesPanel
              cues={state.cues}
              scriptThemeId={scriptThemeId}
              cuePaletteProfile={cuePaletteProfile}
              selectedCueId={newCue.id}
              onSelectCue={selectCueForEdit}
              onDeleteCue={deleteCue}
              onOpenRawCuesModal={() => {
                setRawCuesText(JSON.stringify(state.cues, null, 2));
                setIsCuesModalOpen(true);
              }}
              onRealignCues={realignCues}
              isAligning={isAligning}
              alignSuccess={alignSuccess}
            />
          </div>
        )}

        {/* Desktop Resizable Split Pane Divider */}
        {isDesktop && (
          <SplitPaneDivider
            splitRatio={splitRatio}
            onSplitChange={setSplitRatio}
            onSplitCommit={commitSplitRatio}
            onReset={resetViewLayout}
          />
        )}

        {/* Right Panel: The Screenplay */}
        <div 
          style={isDesktop ? { width: `${100 - splitRatio}%` } : undefined}
          className={cn(
            UI_TOKENS.layout.rightPanelBase,
            isScriptPureBlack && "!bg-black",
            mode === 'edit' ? "hidden lg:flex w-full h-full" : "w-full flex-1"
          )}
        >
          <ScriptHeaderControls
            mode={mode}
            isAutoScrollEnabled={isAutoScrollEnabled}
            setIsAutoScrollEnabled={setIsAutoScrollEnabled}
            isAutoScrollDropdownOpen={isAutoScrollDropdownOpen}
            setIsAutoScrollDropdownOpen={setIsAutoScrollDropdownOpen}
            autoScrollTargets={autoScrollTargets}
            setAutoScrollTargets={setAutoScrollTargets}
            setIsLibraryOpen={setIsLibraryOpen}
            setIsColorModalOpen={setIsColorModalOpen}
            scriptWidthPreset={scriptWidthPreset}
            setScriptWidthPreset={setScriptWidthPreset}
            isWidthDropdownOpen={isWidthDropdownOpen}
            setIsWidthDropdownOpen={setIsWidthDropdownOpen}
            scrollFocusPreset={scrollFocusPreset}
            applyScrollFocus={applyScrollFocus}
            isScrollFocusDropdownOpen={isScrollFocusDropdownOpen}
            setIsScrollFocusDropdownOpen={setIsScrollFocusDropdownOpen}
            currentTime={currentTime}
            scriptThemeId={scriptThemeId}
            cuePaletteProfile={cuePaletteProfile}
          />

          {/* Create / Edit Cue Form in Edit Mode */}
          {mode === 'edit' && (
            <CueEditorForm
              newCue={newCue}
              setNewCue={setNewCue}
              selection={selection}
              setSelection={setSelection}
              altLocations={altLocations}
              findAlternativeLocations={findAlternativeLocations}
              cancelEdit={cancelEdit}
              saveCue={saveCue}
              deleteCue={deleteCue}
              canSave={canSave}
              scriptText={state.scriptText}
              scriptThemeId={scriptThemeId}
              cuePaletteProfile={cuePaletteProfile}
              player={player}
            />
          )}
          
          <div 
            ref={scriptRef}
            onMouseUp={handleSelection}
            className={cn(
              "flex-1 overflow-y-auto font-serif text-[14px] leading-snug scrollbar-hide",
              isScriptPureBlack && "bg-black",
              mode === 'edit' ? "p-2 md:p-4" : "p-4 lg:p-10"
            )}
          >
            <div className={cn(
              "script-paper-container mx-auto min-h-full rounded-sm relative transition-all duration-300",
              isScriptPureBlack ? "!bg-black !shadow-none" : cn(activeTheme.paperBg, activeTheme.paperShadow),
              activeTheme.paperBorder,
              activeTheme.textColor,
              mode === 'edit' 
                ? "max-w-xl p-6 md:p-8" 
                : cn(
                    SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.widthClass || "max-w-xl",
                    "p-8 lg:p-12"
                  )
            )}>
              {/* Page punch holes effect */}
              {!isScriptPureBlack && (
                <div className="script-punch-hole absolute left-2 top-12 flex flex-col gap-8 opacity-20">
                  <div className={cn("w-2 h-2 rounded-full shadow-inner", activeTheme.punchHoleBg)} />
                  <div className={cn("w-2 h-2 rounded-full shadow-inner", activeTheme.punchHoleBg)} />
                  <div className={cn("w-2 h-2 rounded-full shadow-inner", activeTheme.punchHoleBg)} />
                </div>
              )}
              
              <div className="relative z-10" style={{ paddingBottom: mode === 'playback' ? '70vh' : '0' }}>
                {renderedScript}
              </div>
            </div>
          </div>
        </div>
      </main>

      <StagingModal
        isOpen={!!activeStaging}
        onClose={() => setActiveStaging(null)}
        label={activeStaging?.label || ""}
        content={activeStaging?.content || ""}
      />

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectExample={(path, title) => {
          setResetConfirmation({ 
            isOpen: true, 
            type: 'example', 
            examplePath: path, 
            exampleTitle: title,
            error: null,
          });
        }}
      />

      <MobileLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectExample={(path, title) => {
          setResetConfirmation({ 
            isOpen: true, 
            type: 'example', 
            examplePath: path, 
            exampleTitle: title,
            error: null,
          });
        }}
      />

      {/* Raw Script Modal */}
      <RawScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        scriptText={state.scriptText}
        onChangeScriptText={(text) => setState(prev => ({ ...prev, scriptText: text }))}
      />

      {/* Raw Cues Modal */}
      <RawCuesModal
        isOpen={isCuesModalOpen}
        onClose={() => setIsCuesModalOpen(false)}
        rawCuesText={rawCuesText}
        onChangeRawCuesText={setRawCuesText}
        onSave={saveRawCues}
      />

      {/* Overlap Picker Menu */}
      <OverlapPicker
        isOpen={overlapPicker.isOpen}
        position={overlapPicker.position}
        cues={overlapPicker.cues}
        cuePaletteProfile={cuePaletteProfile}
        onSelectCue={(cue) => {
          selectCueForEdit(cue);
          setOverlapPicker({ ...overlapPicker, isOpen: false });
        }}
        onClose={() => setOverlapPicker({ ...overlapPicker, isOpen: false })}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        cue={deleteConfirmation.cue}
        onClose={() => setDeleteConfirmation({ isOpen: false, cue: null })}
        onConfirm={confirmDelete}
      />

      {/* General Reset Confirmation Modal */}
      <ResetConfirmationModal
        resetConfirmation={resetConfirmation}
        isRemoteLoading={isRemoteLoading}
        onClose={() => setResetConfirmation({ isOpen: false, type: null, error: null })}
        onClearError={() => setResetConfirmation(prev => ({ ...prev, error: null }))}
        onConfirm={() => {
          if (resetConfirmation.type === 'settings') {
            setState(prev => ({ ...prev, settings: DEFAULT_SETTINGS }));
            setResetConfirmation({ isOpen: false, type: null, error: null });
          } else if (resetConfirmation.type === 'blank') {
            loadBlank();
          } else if (resetConfirmation.type === 'data') {
            resetState();
          } else if (resetConfirmation.type === 'example' && resetConfirmation.examplePath) {
            loadExample(resetConfirmation.examplePath);
          } else if (resetConfirmation.type === 'remote' && resetConfirmation.remoteUrl) {
            loadRemoteProject(resetConfirmation.remoteUrl);
          }
        }}
      />

      {/* Timing Settings Modal */}
      <TimingSettingsModal
        isOpen={isSettingsOpen}
        settings={state.settings}
        colors={COLORS}
        scriptThemeId={scriptThemeId}
        cuePaletteProfile={cuePaletteProfile}
        onClose={() => setIsSettingsOpen(false)}
        onResetClick={() => setResetConfirmation({ isOpen: true, type: 'settings', error: null })}
        onUpdateSetting={(category, field, value) => {
          setState(prev => ({
            ...prev,
            settings: {
              ...prev.settings,
              [category]: {
                ...(prev.settings?.[category] || { before: 0, after: 0 }),
                [field]: value,
              },
            },
          }));
        }}
      />
      {/* Script Color & Theme Modal */}
      <ScriptColorModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        currentThemeId={scriptThemeId}
        onSelectTheme={(themeId) => {
          setScriptThemeId(themeId);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sceneflow_script_theme', themeId);
          }
        }}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        effectiveThemeCategory={effectiveCategory}
        pureBlackMode={pureBlackMode}
        setPureBlackMode={setPureBlackMode}
        cuePaletteProfile={cuePaletteProfile}
        onSelectPaletteProfile={setCuePaletteProfile}
      />

      {/* Mobile Script Color & Theme Drawer */}
      <MobileColorModal
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        currentThemeId={scriptThemeId}
        onSelectTheme={(themeId) => {
          setScriptThemeId(themeId);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sceneflow_script_theme', themeId);
          }
        }}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        effectiveThemeCategory={effectiveCategory}
        pureBlackMode={pureBlackMode}
        setPureBlackMode={setPureBlackMode}
        cuePaletteProfile={cuePaletteProfile}
        onSelectPaletteProfile={setCuePaletteProfile}
      />

      {/* App Info / About Modal */}
      <AppInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
