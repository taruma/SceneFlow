import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from 'react';
import YouTube from 'react-youtube';
import { Video } from 'lucide-react';
import { EXAMPLE_SECTIONS } from './examples';
import { processScript } from './lib/scriptProcessor';
import { realignCuesList } from './lib/cueUtils';
import { ScriptLine } from './components/script/ScriptLine';
import { InitializingScreen } from './components/InitializingScreen';
import { OverlapPicker } from './components/OverlapPicker';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ResetConfirmationModal } from './components/ResetConfirmationModal';
import { AppHeader, type HeaderMenuId } from './components/AppHeader';
// Lazy-loaded secondary dialogs to optimize initial bundle size
const StagingModal = lazy(() => import('./components/StagingModal').then(m => ({ default: m.StagingModal })));
const LibraryModal = lazy(() => import('./components/LibraryModal').then(m => ({ default: m.LibraryModal })));
const MobileLibraryModal = lazy(() => import('./components/MobileLibraryModal').then(m => ({ default: m.MobileLibraryModal })));
const RawScriptModal = lazy(() => import('./components/RawScriptModal').then(m => ({ default: m.RawScriptModal })));
const RawCuesModal = lazy(() => import('./components/RawCuesModal').then(m => ({ default: m.RawCuesModal })));
const TimingSettingsModal = lazy(() => import('./components/TimingSettingsModal').then(m => ({ default: m.TimingSettingsModal })));
const ScriptColorModal = lazy(() => import('./components/ScriptColorModal').then(m => ({ default: m.ScriptColorModal })));
const MobileColorModal = lazy(() => import('./components/MobileColorModal').then(m => ({ default: m.MobileColorModal })));
const AppInfoModal = lazy(() => import('./components/AppInfoModal').then(m => ({ default: m.AppInfoModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
import { WorkstationLeftPanel } from './components/left-panel';
import { EditRightPanel, CueEditorForm, CueEditorProvider, type CueEditorContextValue } from './components/edit';
import { SplitPaneDivider, InspectorSplitDivider } from './components/common';
import { ScriptHeaderControls } from './components/ScriptHeaderControls';
import { cn, extractYoutubeId } from './lib/utils';
import { UI_TOKENS } from './styles/tokens/ui';
import { useScriptStorage } from './hooks/useScriptStorage';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { 
  useScriptPreferences,
  SCRIPT_PREFERENCES_STORAGE_KEYS,
  MIN_EDIT_SPLIT_RATIO,
  MAX_EDIT_SPLIT_RATIO,
  MIN_SPLIT_RATIO,
  MAX_SPLIT_RATIO,
} from './hooks/useScriptPreferences';
import { useScriptTheme } from './hooks/useScriptTheme';
import { useAppShellTheme } from './hooks/useAppShellTheme';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useCueEditor } from './hooks/useCueEditor';
import { useCueAlignment } from './hooks/useCueAlignment';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { Cue, AppMode, ResetConfirmationState } from './types/script';
import { 
  COLORS, 
  DEFAULT_SETTINGS, 
  SCRIPT_WIDTH_PRESETS,
  DEFAULT_SCROLL_FOCUS_PRESET_ID,
  getScriptWidthPreset 
} from './constants/script';
import {
  sanitizeCues,
  isCueActive,
  exportStateToJsonFile,
  validateImportedScriptJson
} from './lib/cueUtils';

export default function App() {
  const [activeStaging, setActiveStaging] = useState<{ label: string; content: string } | null>(null);
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(SCRIPT_PREFERENCES_STORAGE_KEYS.APP_MODE);
      if (saved === 'playback' || saved === 'edit') {
        return saved;
      }
    }
    return 'playback';
  });

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SCRIPT_PREFERENCES_STORAGE_KEYS.APP_MODE, newMode);
    }
  }, []);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCuesModalOpen, setIsCuesModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activeHeaderMenu, setActiveHeaderMenu] = useState<HeaderMenuId | null>(null);
  const [rawCuesText, setRawCuesText] = useState("");

  const scriptRef = useRef<HTMLDivElement>(null);

  const {
    state,
    setState,
    isInitialized,
    isRemoteLoading,
    resetToDefault,
    loadBlank: loadBlankStorage,
    loadGuide: loadGuideStorage,
    loadExample: loadExampleStorage,
    loadRemoteProject: loadRemoteProjectStorage,
  } = useScriptStorage();

  const {
    player,
    playerState,
    currentTime,
    setCurrentTime,
    duration,
    onReady,
    onStateChange,
    togglePlayPause,
    jumpBy,
    seekTo,
    resetPlayback,
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
    scrollFocusPreset,
    setScrollFocusPreset,
    isScriptPreferencesCustomized,
    resetScriptPreferences,
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
    editSplitRatio,
    setEditSplitRatio,
    commitEditSplitRatio,
    inspectorRatio,
    setInspectorRatio,
    commitInspectorRatio,
    resetInspectorRatio,
    inspectorWidth,
    setInspectorWidth,
    commitInspectorWidth,
    resetInspectorWidth,
    resetViewLayout,
    isViewCustomized,
    isVideoCollapsed,
    toggleVideoCollapsed,
    pureBlackMode,
    setPureBlackMode,
  } = useScriptPreferences(mode);

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
    overlapPicker,
    setOverlapPicker,
    handleSelection,
    saveCue,
    cancelEdit,
    findAlternativeLocations,
    deleteCue,
    confirmDelete,
    selectCueForEdit,
    canSave,
    isDirty,
    dismissIfClean,
  } = useCueEditor({
    scriptText: state.scriptText,
    cues: state.cues,
    setState,
    mode,
    player,
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const handleScriptMouseUp = useCallback(() => {
    handleSelection();
    if (mode === 'edit') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim()) {
        setIsInspectorOpen(true);
      }
    }
  }, [handleSelection, mode]);

  const handleScriptClick = useCallback((e: React.MouseEvent) => {
    if (mode !== 'edit') return;

    // If overlap picker was open, let its own click-outside handler dismiss it without closing cue edit
    if (overlapPicker.isOpen) return;

    // Ignore clicks on buttons, inputs, links, or staging markers
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, [role="button"], a, input, textarea, select, [data-prevent-dismiss]')) {
      return;
    }

    // Ignore if there is an active text drag selection
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && Boolean(sel.toString().trim())) {
      return;
    }

    // Safely dismiss back to idle overview if no changes were made
    dismissIfClean();
  }, [mode, overlapPicker.isOpen, dismissIfClean]);

  const [resetConfirmation, setResetConfirmation] = useState<ResetConfirmationState>({
    isOpen: false,
    type: null,
    error: null,
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
    isShortcutsModalOpen ||
    isScriptModalOpen ||
    isCuesModalOpen ||
    isLibraryOpen ||
    activeStaging ||
    deleteConfirmation.isOpen ||
    resetConfirmation.isOpen ||
    overlapPicker.isOpen
  );

  const handleResetView = useCallback(() => {
    resetViewLayout(mode);
    if (mode === 'edit') {
      setIsInspectorOpen(true);
    }
  }, [resetViewLayout, mode]);

  const toggleHeaderMenu = useCallback((menuId: HeaderMenuId) => {
    setActiveHeaderMenu(prev => prev === menuId ? null : menuId);
  }, []);

  const { isDesktop } = useKeyboardShortcuts({
    player,
    togglePlayPause,
    jumpBy,
    onToggleVideo: toggleVideoCollapsed,
    onOpenColors: () => setIsColorModalOpen(true),
    onOpenTiming: () => setIsSettingsOpen(true),
    onResetView: handleResetView,
    onOpenShortcuts: () => setIsShortcutsModalOpen(true),
    onToggleFileMenu: () => toggleHeaderMenu('file'),
    onOpenRawScript: () => handleOpenRawScriptModal(),
    onOpenRawCues: () => handleOpenRawCuesModal(),
    onOpenLibrary: () => setIsLibraryOpen(true),
    disabled: isAnyModalOpen,
  });

  const {
    isAutoScrollEnabled,
    setIsAutoScrollEnabled,
    autoScrollTargets,
    setAutoScrollTargets,
    isAutoScrollDropdownOpen,
    setIsAutoScrollDropdownOpen,
    lastScrolledCueId,
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

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const lastScrolledCueIdRef = useRef(lastScrolledCueId);
  lastScrolledCueIdRef.current = lastScrolledCueId;
  const cuesRef = useRef(state.cues);
  cuesRef.current = state.cues;
  const settingsRef = useRef(state.settings);
  settingsRef.current = state.settings;

  // Seamlessly align screenplay to current playback position when transitioning into Edit mode
  useEffect(() => {
    if (mode === 'edit' && scriptRef.current && isDesktop) {
      const cues = cuesRef.current || [];
      const curTime = currentTimeRef.current;
      const lastId = lastScrolledCueIdRef.current;
      const curSettings = settingsRef.current;

      const targetCue = (lastId && cues.find(c => c.id === lastId))
        || cues.find(c => isCueActive(c, curTime, curSettings))
        || cues.filter(c => c.startTime <= curTime).sort((a, b) => b.startTime - a.startTime)[0];

      if (targetCue) {
        requestAnimationFrame(() => {
          const container = scriptRef.current;
          if (!container) return;
          const targetElement = document.getElementById(`cue-${targetCue.id}`) ||
            (Array.from(container.querySelectorAll('[data-line-start]')) as HTMLElement[]).find(el => {
              const start = parseInt(el.getAttribute('data-line-start') || '-1', 10);
              const end = parseInt(el.getAttribute('data-line-end') || '-1', 10);
              return start <= targetCue.startIndex && end >= targetCue.startIndex;
            });

          if (targetElement) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = targetElement.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
            const targetScrollTop = Math.max(0, relativeTop - (containerRect.height / 2) + (elementRect.height / 2));
            container.scrollTo({
              top: targetScrollTop,
              behavior: 'instant',
            });
          }
        });
      }
    }
  }, [mode, isDesktop]);

  const isEffectiveViewCustomized = isViewCustomized || (mode === 'edit' && !isInspectorOpen);

  const isPreferencesCustomized = 
    themeMode !== 'auto' ||
    isScriptPreferencesCustomized ||
    isEffectiveViewCustomized;

  const handleResetAllPreferences = useCallback(() => {
    setThemeMode('auto');
    resetScriptPreferences();
    applyScrollFocus(DEFAULT_SCROLL_FOCUS_PRESET_ID);
    handleResetView();
  }, [setThemeMode, resetScriptPreferences, applyScrollFocus, handleResetView]);


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

  const saveRawCues = (cuesOverride?: Cue[]) => {
    try {
      let finalCues: Cue[];
      if (cuesOverride && Array.isArray(cuesOverride)) {
        finalCues = cuesOverride;
      } else {
        const parsed = JSON.parse(rawCuesText);
        const extracted = Array.isArray(parsed)
          ? parsed
          : (parsed && typeof parsed === 'object' && Array.isArray(parsed.cues) ? parsed.cues : null);
        if (!extracted) throw new Error("Must be an array or contain a cues array");
        finalCues = sanitizeCues(extracted);
      }
      setState(prev => ({ ...prev, cues: finalCues }));
      setIsCuesModalOpen(false);
    } catch (err) {
      console.error("Failed to save cues JSON:", err);
    }
  };

  const resetState = async () => {
    try {
      resetPlayback();
      await resetToDefault();
      setMode('playback');
      setResetConfirmation({ isOpen: false, type: null, error: null });
    } catch (err) {
      console.error("Failed to reset to default script", err);
    }
  };

  const createNewProject = async () => {
    try {
      resetPlayback();
      await loadBlankStorage();
      setMode('edit');
      setResetConfirmation({ isOpen: false, type: null, error: null });
    } catch (err) {
      console.error("Failed to create new project", err);
    }
  };

  const loadGuide = async () => {
    try {
      resetPlayback();
      const finalData = await loadGuideStorage();
      setMode('playback');
      setResetConfirmation({ isOpen: false, type: null, error: null });
      realignCues(finalData);
    } catch (err) {
      alert("Failed to load starter guide.");
    }
  };

  const loadExample = async (path: string) => {
    try {
      resetPlayback();
      const finalData = await loadExampleStorage(path);
      setMode('playback');
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
      resetPlayback();
      const finalData = await loadRemoteProjectStorage(url);
      setMode('playback');
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

  const exportJson = useCallback(() => {
    exportStateToJsonFile(state);
  }, [state]);

  const importJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validatedJson = validateImportedScriptJson(json);

        resetPlayback();
        setState(validatedJson);
        // Automatically trigger alignment after import
        realignCues(validatedJson);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }, [realignCues, setState, resetPlayback]);

  const handleNewProject = useCallback(() => {
    setResetConfirmation({ isOpen: true, type: 'new', error: null });
  }, [setResetConfirmation]);

  const handleOpenGuide = useCallback(() => {
    setResetConfirmation({ isOpen: true, type: 'guide', error: null });
  }, [setResetConfirmation]);

  // Memoize script parsing independently of currentTime
  const processedLines = useMemo(() => {
    return processScript(state.scriptText || "");
  }, [state.scriptText]);

  const handleOpenRawScriptModal = useCallback(() => {
    setIsScriptModalOpen(true);
  }, []);

  const handleSaveScript = useCallback((newScriptText: string, shouldRealign?: boolean) => {
    if (shouldRealign && state.cues && state.cues.length > 0) {
      const { updatedCues } = realignCuesList(state.cues, newScriptText);
      setState(prev => ({ ...prev, scriptText: newScriptText, cues: updatedCues }));
    } else {
      setState(prev => ({ ...prev, scriptText: newScriptText }));
    }
  }, [state.cues, setState]);

  const handleOpenRawCuesModal = useCallback(() => {
    setRawCuesText(JSON.stringify(state.cues, null, 2));
    setIsCuesModalOpen(true);
  }, [state.cues]);

  const handleChangeYoutubeId = useCallback((value: string) => {
    setState(prev => ({ ...prev, youtubeId: value }));
  }, [setState]);

  const handleClearYoutubeId = useCallback(() => {
    setState(prev => ({ ...prev, youtubeId: '' }));
  }, [setState]);

  const handleReplay = useCallback(() => {
    seekTo(0, true, true);
  }, [seekTo]);

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

  const handleSelectCueForEdit = useCallback((cue: Cue) => {
    selectCueForEdit(cue);
    setIsInspectorOpen(true);

    // Cross-panel auto-center: smoothly scroll script container to the selected cue
    if (scriptRef.current) {
      const container = scriptRef.current;
      const lineElements = Array.from(container.querySelectorAll('[data-line-start]')) as HTMLElement[];
      const targetElement = document.getElementById(`cue-${cue.id}`) ||
        lineElements.find(el => {
          const start = parseInt(el.getAttribute('data-line-start') || '-1', 10);
          const end = parseInt(el.getAttribute('data-line-end') || '-1', 10);
          return start <= cue.startIndex && end >= cue.startIndex;
        });

      if (targetElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
        const targetScrollTop = Math.max(0, relativeTop - (containerRect.height / 2) + (elementRect.height / 2));
        
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [selectCueForEdit, scriptRef]);

  // Rendering the screenplay with memoized ScriptLine components
  const renderedScript = useMemo(() => {
    return processedLines.map((lineData) => {
      const lineCues = cuesByLineIndex.get(lineData.lineIdx) || EMPTY_CUES_ARRAY;
      return (
        <ScriptLine
          key={lineData.lineIdx}
          lineData={lineData}
          cues={lineCues}
          mode={mode}
          currentTime={lineCues.length > 0 ? currentTime : 0}
          settings={state.settings}
          hiddenCueTypes={hiddenCueTypes}
          scriptThemeId={scriptThemeId}
          cuePaletteProfile={cuePaletteProfile}
          playerState={playerState}
          isDesktop={isDesktop}
          selection={selection}
          editingCueId={newCue.id}
          onSelectStaging={setActiveStaging}
          onSelectCue={handleSelectCueForEdit}
          onOverlapPicker={handleOverlapPicker}
        />
      );
    });
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
    handleSelectCueForEdit,
    handleOverlapPicker,
  ]);

  // Consolidate cue authoring context to eliminate prop-drilling
  const cueEditorContextValue = useMemo<CueEditorContextValue>(() => ({
    newCue,
    setNewCue,
    selection,
    setSelection,
    altLocations,
    findAlternativeLocations,
    cancelEdit,
    saveCue,
    deleteCue,
    canSave,
    isDirty,
    dismissIfClean,
    scriptText: state.scriptText,
    scriptThemeId,
    cuePaletteProfile,
    player,
    widthClass: getScriptWidthPreset(scriptWidthPreset).widthClass,
    selectCueForEdit: handleSelectCueForEdit,
  }), [
    newCue,
    setNewCue,
    selection,
    setSelection,
    altLocations,
    findAlternativeLocations,
    cancelEdit,
    saveCue,
    deleteCue,
    canSave,
    isDirty,
    dismissIfClean,
    state.scriptText,
    scriptThemeId,
    cuePaletteProfile,
    player,
    scriptWidthPreset,
    handleSelectCueForEdit,
  ]);

  // Memoize layout panel styles so playback currentTime updates never bust React.memo
  const leftPanelStyle = useMemo(
    () => {
      if (!isDesktop) return undefined;
      const ratio = mode === 'edit' ? editSplitRatio : splitRatio;
      return { width: `${ratio}%` };
    },
    [isDesktop, mode, editSplitRatio, splitRatio]
  );

  const rightPanelStyle = useMemo(
    () => (isDesktop ? { width: `${100 - splitRatio}%` } : undefined),
    [isDesktop, splitRatio]
  );

  if (!isInitialized) {
    return <InitializingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-app text-text-main font-sans overflow-hidden">
      {/* Header */}
      <AppHeader
        mode={mode}
        setMode={setMode}
        isLibraryOpen={isLibraryOpen}
        setIsLibraryOpen={setIsLibraryOpen}
        onNewProject={handleNewProject}
        onOpenGuide={handleOpenGuide}
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
        onSetThemeMode={setThemeMode}
        isViewCustomized={isEffectiveViewCustomized}
        onResetView={handleResetView}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        scriptWidthPreset={scriptWidthPreset}
        setScriptWidthPreset={setScriptWidthPreset}
        scrollFocusPreset={scrollFocusPreset}
        applyScrollFocus={applyScrollFocus}
        isPreferencesCustomized={isPreferencesCustomized}
        onResetAll={handleResetAllPreferences}
        onOpenRawCuesModal={handleOpenRawCuesModal}
        onOpenRawScriptModal={handleOpenRawScriptModal}
        isCuesModalOpen={isCuesModalOpen}
        isScriptModalOpen={isScriptModalOpen}
        activeMenu={activeHeaderMenu}
        onToggleMenu={toggleHeaderMenu}
        onCloseMenu={() => setActiveHeaderMenu(null)}
      />

      <CueEditorProvider value={cueEditorContextValue}>
        <main className={cn(
          "flex flex-1 flex-col lg:flex-row overflow-hidden",
          mode === 'playback' && "overflow-y-auto lg:overflow-hidden"
        )}>
        {/* Left Panel: Unified Media Viewport & Workstation (Playback vs Edit) */}
        <WorkstationLeftPanel
          mode={mode}
          youtubeId={state.youtubeId}
          onChangeYoutubeId={handleChangeYoutubeId}
          onClearYoutubeId={handleClearYoutubeId}
          hasPlayer={!!player}
          videoHeight={videoHeight}
          setVideoHeight={setVideoHeight}
          commitVideoHeight={commitVideoHeight}
          isVideoCollapsed={isVideoCollapsed}
          onToggleVideoCollapsed={toggleVideoCollapsed}
          onTogglePlayPause={togglePlayPause}
          onReplay={handleReplay}
          isDesktop={isDesktop}
          playerState={playerState}
          currentTime={currentTime}
          duration={duration}
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
          selectedCueId={newCue.id}
          onSelectCue={handleSelectCueForEdit}
          onDeleteCue={deleteCue}
          onOpenRawCuesModal={handleOpenRawCuesModal}
          onRealignCues={realignCues}
          isAligning={isAligning}
          alignSuccess={alignSuccess}
          style={leftPanelStyle}
        />

        {/* Desktop Resizable Split Pane Divider */}
        {isDesktop && (
          <SplitPaneDivider
            splitRatio={mode === 'edit' ? editSplitRatio : splitRatio}
            onSplitChange={mode === 'edit' ? setEditSplitRatio : setSplitRatio}
            onSplitCommit={mode === 'edit' ? commitEditSplitRatio : commitSplitRatio}
            minRatio={mode === 'edit' ? MIN_EDIT_SPLIT_RATIO : MIN_SPLIT_RATIO}
            maxRatio={mode === 'edit' ? MAX_EDIT_SPLIT_RATIO : MAX_SPLIT_RATIO}
            onReset={handleResetView}
          />
        )}

        {/* Center Panel: The Screenplay */}
        <div 
          style={mode === 'playback' ? rightPanelStyle : undefined}
          className={cn(
            UI_TOKENS.layout.rightPanelBase,
            isScriptPureBlack && "!bg-black",
            mode === 'edit' ? "hidden lg:flex flex-1 min-w-0 h-full" : "w-full flex-1"
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
            scriptThemeId={scriptThemeId}
            cuePaletteProfile={cuePaletteProfile}
            lineCount={processedLines.length}
            onOpenRawScriptModal={handleOpenRawScriptModal}
            activeCueStatus={!selection ? 'idle' : (newCue.id ? 'editing' : 'drafting')}
            isInspectorOpen={isInspectorOpen}
            onToggleInspector={() => setIsInspectorOpen(prev => !prev)}
          />

          <div 
            ref={scriptRef}
            onClick={handleScriptClick}
            onMouseUp={handleScriptMouseUp}
            className={cn(
              "flex-1 overflow-y-auto font-serif text-[14px] leading-snug scrollbar-hide",
              isScriptPureBlack && "bg-black",
              mode === 'edit' ? "p-2 md:p-4" : "p-4 lg:p-10"
            )}
          >
            <div className={cn(
              "script-paper-container mx-auto min-h-full rounded-sm relative transition-colors duration-200",
              isScriptPureBlack ? "!bg-black !shadow-none" : cn(activeTheme.paperBg, activeTheme.paperShadow),
              activeTheme.paperBorder,
              activeTheme.textColor,
              getScriptWidthPreset(scriptWidthPreset).widthClass,
              mode === 'edit' ? "p-6 md:p-8" : "p-8 lg:p-12"
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

        {/* Right Panel: Dedicated Cue Inspector in Edit Mode (Desktop Only) */}
        {mode === 'edit' && isDesktop && isInspectorOpen && (
          <>
            <InspectorSplitDivider
              ratio={inspectorRatio}
              onRatioChange={setInspectorRatio}
              onRatioCommit={commitInspectorRatio}
              onReset={handleResetView}
            />
            <EditRightPanel
              isOpen={isInspectorOpen}
              ratio={inspectorRatio}
              onClose={() => setIsInspectorOpen(false)}
              cues={state.cues}
              processedLines={processedLines}
              scriptThemeId={scriptThemeId}
              cuePaletteProfile={cuePaletteProfile}
            />
          </>
        )}
      </main>
    </CueEditorProvider>

      <Suspense fallback={null}>
        {/* Staging Modal */}
        <StagingModal
          isOpen={!!activeStaging}
          onClose={() => setActiveStaging(null)}
          label={activeStaging?.label || ""}
          content={activeStaging?.content || ""}
        />

        {/* Examples Library Modal (Desktop vs Mobile) */}
        {isDesktop ? (
          <LibraryModal
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            onOpenGuide={() => setResetConfirmation({ isOpen: true, type: 'guide', error: null })}
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
        ) : (
          <MobileLibraryModal
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            onOpenGuide={() => setResetConfirmation({ isOpen: true, type: 'guide', error: null })}
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
        )}

        {/* Raw Script Modal */}
        <RawScriptModal
          isOpen={isScriptModalOpen}
          onClose={() => setIsScriptModalOpen(false)}
          scriptText={state.scriptText}
          onSaveScript={handleSaveScript}
          activeCuesCount={state.cues?.length || 0}
        />

        {/* Raw Cues Modal */}
        <RawCuesModal
          isOpen={isCuesModalOpen}
          onClose={() => setIsCuesModalOpen(false)}
          rawCuesText={rawCuesText}
          onChangeRawCuesText={setRawCuesText}
          onSave={saveRawCues}
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

        {/* Script Color & Theme Modal (Desktop vs Mobile) */}
        {isDesktop ? (
          <ScriptColorModal
            isOpen={isColorModalOpen}
            onClose={() => setIsColorModalOpen(false)}
            currentThemeId={scriptThemeId}
            onSelectTheme={setScriptThemeId}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            effectiveThemeCategory={effectiveCategory}
            pureBlackMode={pureBlackMode}
            setPureBlackMode={setPureBlackMode}
            cuePaletteProfile={cuePaletteProfile}
            onSelectPaletteProfile={setCuePaletteProfile}
          />
        ) : (
          <MobileColorModal
            isOpen={isColorModalOpen}
            onClose={() => setIsColorModalOpen(false)}
            currentThemeId={scriptThemeId}
            onSelectTheme={setScriptThemeId}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            effectiveThemeCategory={effectiveCategory}
            pureBlackMode={pureBlackMode}
            setPureBlackMode={setPureBlackMode}
            cuePaletteProfile={cuePaletteProfile}
            onSelectPaletteProfile={setCuePaletteProfile}
          />
        )}

        {/* App Info / About Modal */}
        <AppInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        />

        {/* Keyboard Shortcuts Palette / Guide Modal */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
        />
      </Suspense>
    </div>
  );
}
