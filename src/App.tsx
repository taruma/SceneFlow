import React, { useState, useEffect, useRef, useMemo } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Video, Info } from 'lucide-react';
import { EXAMPLE_SECTIONS } from './examples';
import { processScript, type LineType, type ProcessedLine } from './lib/scriptProcessor';
import { 
  getLineClass, 
  getScriptThemeStyles, 
  getScriptTheme, 
  DEFAULT_SCRIPT_THEME_ID, 
  type ScriptThemeId,
  getCueColorForTheme,
  CUE_THEME_COLORS
} from './lib/scriptStyles';
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
import { AppHeader } from './components/AppHeader';
import { ActiveHighlightsPanel } from './components/ActiveHighlightsPanel';
import { TimelineCuesPanel } from './components/TimelineCuesPanel';
import { ScriptHeaderControls } from './components/ScriptHeaderControls';
import { CueEditorForm } from './components/CueEditorForm';
import { cn, extractYoutubeId, generateId } from './lib/utils';
import { useScriptStorage } from './hooks/useScriptStorage';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useScriptPreferences } from './hooks/useScriptPreferences';
import { useScriptTheme } from './hooks/useScriptTheme';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useCueEditor } from './hooks/useCueEditor';
import { useCueAlignment } from './hooks/useCueAlignment';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import type { 
  Cue, 
  TimingSettings, 
  AppState, 
  ScriptWidthPresetId, 
  ScrollFocusPresetId,
  TextSelection,
  DeleteConfirmationState,
  ResetConfirmationState,
  OverlapPickerState,
  AlternativeLocation,
  AppMode
} from './types/script';
import { 
  COLORS, 
  DEFAULT_SETTINGS, 
  SCRIPT_WIDTH_PRESETS, 
  SCROLL_FOCUS_PRESETS 
} from './constants/script';
import {
  sanitizeCues,
  isCueActive,
  calculateCuePlaybackOpacity,
  exportStateToJsonFile,
  validateImportedScriptJson
} from './lib/cueUtils';

export type { Cue, TimingSettings, AppState, ScriptWidthPresetId, ScrollFocusPresetId, AlternativeLocation, AppMode };

export default function App() {
  const [activeStaging, setActiveStaging] = useState<{ label: string; content: string } | null>(null);
  const [mode, setMode] = useState<AppMode>('playback');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCuesModalOpen, setIsCuesModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    seekTo,
    playVideo,
    pauseVideo,
    togglePlayPause,
    jumpBy,
  } = useYouTubePlayer({
    youtubeId: state.youtubeId,
    onPlay: () => setActiveStaging(null),
  });

  const {
    videoWidth,
    setVideoWidth,
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
    isColorModalOpen,
    setIsColorModalOpen,
    hiddenCueTypes,
    toggleCueTypeVisibility,
  } = useScriptPreferences();

  const { theme: activeTheme, resolveCueColor } = useScriptTheme(scriptThemeId);

  const { isDesktop } = useKeyboardShortcuts({
    player,
    togglePlayPause,
    jumpBy,
    disabled: isScriptModalOpen || isCuesModalOpen,
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

  const {
    selection,
    setSelection,
    newCue,
    setNewCue,
    altLocations,
    setAltLocations,
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

  const activeCueTypes = useMemo(() => {
    const active = new Set<string>();
    (state.cues || []).forEach(c => {
      if (isCueActive(c, currentTime, state.settings)) {
        active.add(c.type || 'dialogue');
      }
    });
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

  // Debugging state changes
  useEffect(() => {
    console.log("Current App State:", {
      mode,
      cuesCount: state?.cues?.length || 0,
      hasSelection: !!selection,
      currentTime
    });
  }, [mode, state?.cues?.length, selection, currentTime]);

  // Rendering the screenplay with highlights
  const renderedScript = useMemo(() => {
    const cues = state.cues || [];
    const scriptText = state.scriptText || "";
    const themeStyles = getScriptThemeStyles(scriptThemeId);
    
    // Use the new processor to handle all structural and semantic logic
    const processedLines = processScript(scriptText);
    const scriptElements: React.ReactNode[] = [];

    const formatBriefSegment = (text: string, isLineStart = false) => {
      // 1. Waterfall: replace -> with \n    -> 
      let waterfalled = text.replace(/[ \t]*->[ \t]*/g, "\n    -> ");
      
      // If at the start of the line or segment, avoid creating an unnecessary blank line at top
      if (isLineStart) {
        waterfalled = waterfalled.replace(/^\n\s*-> /, "    -> ");
      }

      // Clean up any double newlines created if the raw text already had \n before ->
      waterfalled = waterfalled.replace(/\n\s*\n\s*-> /g, "\n    -> ");
      
      // 2. Bold Anchors: wrap [...] in <b>
      const result: React.ReactNode[] = [];
      const regex = /\[([^\]]+)\]/g;
      let lastIndex = 0;
      let match;
      
      while ((match = regex.exec(waterfalled)) !== null) {
        if (match.index > lastIndex) {
          result.push(waterfalled.substring(lastIndex, match.index));
        }
        result.push(<b key={match.index}>[{match[1]}]</b>);
        lastIndex = regex.lastIndex;
      }
      
      if (lastIndex < waterfalled.length) {
        result.push(waterfalled.substring(lastIndex));
      }
      
      return result.length > 0 ? result : waterfalled;
    };

    processedLines.forEach((lineData) => {
      const { text: line, type, lineIdx, lineStart, lineEnd, isStaging, stagingMarker } = lineData;
      const trimmed = line.trim();

      // Check for staging markers at this line
      if (stagingMarker) {
        scriptElements.push(
          <div key={`staging-${lineIdx}`} className={themeStyles.stagingContainer}>
            {stagingMarker.blocks.map((block, bIdx) => (
              <button
                key={bIdx}
                onClick={() => {
                  if (playerState !== 1) {
                    setActiveStaging(block);
                  }
                }}
                disabled={playerState === 1}
                className={cn(
                  themeStyles.stagingBadgeBase,
                  playerState === 1 ? themeStyles.stagingBadgeDisabled : themeStyles.stagingBadgeActive
                )}
              >
                <Info size={isDesktop ? 10 : 8} className={themeStyles.stagingBadgeIcon} />
                <span className={themeStyles.stagingBadgeText}>
                  {block.label}
                </span>
              </button>
            ))}
          </div>
        );
      }

      // If this line is part of a staging block, we don't render it
      if (isStaging) {
        return;
      }

      // Handle special structural elements
      if (type === 'separator') {
        scriptElements.push(<hr key={lineIdx} className={themeStyles.separator} />);
        return;
      }

      if (type === 'part-separator' || type === 'roman-title') {
        scriptElements.push(
          <div key={lineIdx} className={themeStyles.titleContainer}>
            <div className={themeStyles.titleLine} />
            <span className={themeStyles.titleText}>{trimmed}</span>
            <div className={themeStyles.titleLine} />
          </div>
        );
        return;
      }

      const className = getLineClass(lineData, scriptThemeId);

      // Filter cues that overlap with this line
      const lineCues = (mode === 'edit' ? cues : cues.filter(isCueVisible))
        .filter(cue => cue.startIndex < lineEnd && cue.endIndex > lineStart)
        .map(cue => {
          let opacity = 1;
          if (mode === 'playback') {
            opacity = calculateCuePlaybackOpacity(cue, currentTime, state.settings);
          } else {
            // In edit mode, non-active cues are faded but visible
            const isActive = currentTime >= cue.startTime && currentTime <= cue.endTime;
            const isEditing = newCue.id === cue.id;
            opacity = isEditing ? 1 : (isActive ? 0.8 : 0.4);
          }
          
          return {
            ...cue,
            start: Math.max(0, cue.startIndex - lineStart),
            end: Math.min(line.length, cue.endIndex - lineStart),
            opacity
          };
        });

      // Add temporary selection if in edit mode
      if (mode === 'edit' && selection && selection.start < lineEnd && selection.end > lineStart) {
        lineCues.push({
          id: 'temp-selection',
          selectedText: selection.text,
          startIndex: selection.start,
          endIndex: selection.end,
          startTime: 0,
          endTime: 0,
          colorClass: '',
          start: Math.max(0, selection.start - lineStart),
          end: Math.min(line.length, selection.end - lineStart),
          opacity: 1
        } as any);
      }

      if (lineCues.length === 0) {
        const displayValue = type === 'name' ? trimmed.slice(0, -1) : line;
        const finalDisplayValue = lineData.isBrief ? formatBriefSegment(displayValue, true) : displayValue;
        
        scriptElements.push(
          <div key={lineIdx} className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
            {finalDisplayValue}
          </div>
        );
        return;
      }

      // Split line into segments based on cue boundaries
      const points = new Set<number>([0, line.length]);
      lineCues.forEach(cue => {
        points.add(cue.start);
        points.add(cue.end);
      });
      const sortedPoints = Array.from(points).sort((a, b) => a - b);
      
      const segments: React.ReactNode[] = [];
      for (let i = 0; i < sortedPoints.length - 1; i++) {
        const start = sortedPoints[i];
        const end = sortedPoints[i + 1];
        const segmentText = line.substring(start, end);
        const displayValue = (type === 'name' && end === line.length) 
          ? segmentText.replace(/:$/, '') 
          : segmentText;
          
        const segmentCues = lineCues.filter(c => c.start <= start && c.end >= end);
        const finalDisplayValue = lineData.isBrief ? formatBriefSegment(displayValue, start === 0) : displayValue;

        if (segmentCues.length === 0) {
          segments.push(finalDisplayValue);
          continue;
        }

        // If multiple cues, we pick the most "important" one for the primary color
        // but we'll indicate overlap visually
        const isTemp = segmentCues.some(c => c.id === 'temp-selection');
        const editingCue = segmentCues.find(c => c.id === newCue.id);
        const primaryCue = editingCue || segmentCues[0];
        
        const activeTheme = getScriptTheme(scriptThemeId);
        const themedColor = getCueColorForTheme(primaryCue.type || primaryCue.colorClass || '', scriptThemeId);
        
        const rgb = isTemp 
          ? (activeTheme.isDark ? '56, 189, 248' : (activeTheme.category === 'warm' ? '120, 160, 200' : '191, 219, 254')) 
          : themedColor.rgb;
        const maxOpacity = Math.max(...segmentCues.map(c => (c as any).opacity || 0));
        const finalOpacity = isTemp ? (activeTheme.isDark ? 0.4 : 0.5) : maxOpacity * themedColor.baseOpacity;

        const scrollCue = segmentCues.find(c => c.type === 'dialogue' && c.startIndex === lineStart + start);
        const idToUse = scrollCue ? `cue-${scrollCue.id}` : (primaryCue.id ? `cue-${primaryCue.id}` : undefined);

        segments.push(
          <span 
            key={`${lineIdx}-${start}`}
            id={idToUse}
            onClick={(e) => {
              if (mode !== 'edit' || isTemp) return;
              e.stopPropagation();
              
              const actualCues = segmentCues.filter(c => c.id !== 'temp-selection');
              if (actualCues.length === 1) {
                selectCueForEdit(actualCues[0]);
              } else if (actualCues.length > 1) {
                setOverlapPicker({
                  isOpen: true,
                  cues: actualCues as Cue[],
                  position: { x: e.clientX, y: e.clientY }
                });
              }
            }}
            className={cn(
              themeStyles.cueBase,
              mode === 'edit' && !isTemp && themeStyles.cueEdit,
              isTemp && themeStyles.cueTemp,
              editingCue && themeStyles.cueEditing,
              themedColor.textColorClass
            )}
            style={{ 
              backgroundColor: `rgba(${rgb}, ${finalOpacity})`,
              ...(activeTheme.isDark && finalOpacity > 0.08 ? {
                boxShadow: primaryCue.type === 'dialogue'
                  ? `0 0 0 1px rgba(253, 224, 71, 0.45), 0 0 6px rgba(253, 224, 71, 0.18)`
                  : `0 0 1px rgba(${rgb}, 0.6)`
              } : {})
            }}
          >
            {finalDisplayValue}
            {segmentCues.length > 1 && mode === 'edit' && !isTemp && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-stone-900 rounded-full border border-white shadow-sm z-20" title="Multiple cues overlap here" />
            )}
          </span>
        );
      }

      scriptElements.push(
        <div key={lineIdx} className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
          {segments.length > 0 ? segments : (type === 'name' ? trimmed.slice(0, -1) : line)}
        </div>
      );
    });

    return scriptElements;
  }, [state.scriptText, state.cues, currentTime, selection, mode, newCue.id, player, playerState, isDesktop, scriptThemeId]);

  const canSave = newCue.selectedText && newCue.startTime !== undefined && newCue.endTime !== undefined && newCue.startIndex !== undefined && newCue.endIndex !== undefined;

  if (!isInitialized) {
    return <InitializingScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-stone-100 text-stone-900 font-sans overflow-hidden selection:bg-blue-100">
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
        importJson={importJson}
        exportJson={exportJson}
      />

      <main className={cn(
        "flex flex-1 flex-col lg:flex-row overflow-hidden",
        mode === 'playback' && "overflow-y-auto lg:overflow-hidden"
      )}>
        {/* Left Panel: Media & Controls */}
        <div 
          ref={leftPanelRef}
          onScroll={(e) => setLeftPanelScroll(e.currentTarget.scrollTop)}
          className={cn(
            "flex flex-col border-stone-200 bg-white transition-all duration-500",
            mode === 'edit' 
              ? "w-full lg:w-1/2 border-r p-4 lg:p-10 overflow-y-auto scrollbar-hide" 
              : "w-full lg:w-1/2 border-r p-0 lg:p-10 gap-0 lg:gap-6 lg:overflow-y-auto scrollbar-hide sticky top-0 z-30 shadow-md lg:shadow-none"
          )}
        >
          {/* YouTube Source Input - Not Sticky in Edit Mode */}
          {mode === 'edit' && (
            <YoutubeSourceInput
              youtubeId={state.youtubeId}
              onChange={(value) => setState(prev => ({ ...prev, youtubeId: value }))}
              onClear={() => setState(prev => ({ ...prev, youtubeId: '' }))}
              hasPlayer={!!player}
            />
          )}

          {/* Video Player Section - Sticky in Edit Mode */}
          <section className={cn(
            "transition-all duration-300 z-30 sticky top-0", 
            mode === 'playback' && "space-y-4 lg:space-y-6",
            mode === 'edit' && "-mx-4 lg:-mx-10 px-4 lg:px-10",
            mode === 'edit' && leftPanelScroll <= 80 && "bg-white border-b border-stone-100 pb-6 mb-8 space-y-4",
            mode === 'edit' && leftPanelScroll > 80 && "bg-transparent pointer-events-none space-y-0 pb-0 mb-0"
          )}>
            <div className={cn(
              "flex items-center justify-between transition-all duration-300", 
              mode === 'playback' && "hidden lg:flex", 
              mode === 'edit' && "flex",
              mode === 'edit' && leftPanelScroll > 80 && "opacity-0 h-0 overflow-hidden mb-0"
            )}>
               <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                <Video size={14} /> {mode === 'edit' ? 'Media Preview' : 'Now Playing'}
              </h2>
              {mode === 'playback' && isDesktop && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">Size</span>
                  <input 
                    type="range" 
                    min="40" 
                    max="100" 
                    step="5"
                    value={videoWidth}
                    onChange={(e) => setVideoWidth(parseInt(e.target.value))}
                    className="w-24 h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-400 hover:accent-stone-600 transition-all"
                  />
                  <span className="text-[9px] font-mono font-bold text-stone-400 w-8">{videoWidth}%</span>
                </div>
              )}
            </div>
            
            <div className={cn(
              "aspect-video bg-black overflow-hidden shadow-2xl ring-1 ring-stone-900/10 relative group transition-all duration-500 origin-top-left pointer-events-auto",
              mode === 'edit' ? "rounded-3xl" : "rounded-none lg:rounded-3xl",
              mode === 'edit' && leftPanelScroll > 80 && "w-1/2 rounded-2xl shadow-2xl scale-90 -translate-y-2"
            )}
            style={mode === 'playback' && isDesktop ? { width: `${videoWidth}%`, margin: '0 auto' } : {}}
            >
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
            
            {mode === 'playback' && (
              <ActiveHighlightsPanel
                cues={state.cues}
                isCueVisible={isCueVisible}
                activeCueTypes={activeCueTypes}
                hiddenCueTypes={hiddenCueTypes}
                toggleCueTypeVisibility={toggleCueTypeVisibility}
                scriptThemeId={scriptThemeId}
              />
            )}
          </section>

          {/* Script Management Section - Only in Edit Mode */}
          {mode === 'edit' && (
            <ScriptManagementBar
              lineCount={state.scriptText.split('\n').length}
              onOpenRawScriptModal={() => setIsScriptModalOpen(true)}
            />
          )}

          {/* Edit Mode Controls */}
          {mode === 'edit' && (
            <TimelineCuesPanel
              cues={state.cues}
              scriptThemeId={scriptThemeId}
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
          )}
        </div>

        {/* Right Panel: The Screenplay */}
        <div className={cn(
          "bg-stone-50 flex flex-col overflow-hidden relative transition-all duration-500",
          mode === 'edit' ? "hidden lg:flex w-full lg:w-1/2 h-full" : "w-full lg:w-1/2 flex-1"
        )}>
          <ScriptHeaderControls
            mode={mode}
            isAutoScrollEnabled={isAutoScrollEnabled}
            setIsAutoScrollEnabled={setIsAutoScrollEnabled}
            isAutoScrollDropdownOpen={isAutoScrollDropdownOpen}
            setIsAutoScrollDropdownOpen={setIsAutoScrollDropdownOpen}
            autoScrollTargets={autoScrollTargets}
            setAutoScrollTargets={setAutoScrollTargets}
            setIsLibraryOpen={setIsLibraryOpen}
            scriptWidthPreset={scriptWidthPreset}
            setScriptWidthPreset={setScriptWidthPreset}
            isWidthDropdownOpen={isWidthDropdownOpen}
            setIsWidthDropdownOpen={setIsWidthDropdownOpen}
            scrollFocusPreset={scrollFocusPreset}
            applyScrollFocus={applyScrollFocus}
            isScrollFocusDropdownOpen={isScrollFocusDropdownOpen}
            setIsScrollFocusDropdownOpen={setIsScrollFocusDropdownOpen}
            currentTime={currentTime}
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
              player={player}
            />
          )}
          
          <div 
            ref={scriptRef}
            onMouseUp={handleSelection}
            className={cn(
              "flex-1 overflow-y-auto font-serif text-[14px] leading-snug scrollbar-hide",
              mode === 'edit' ? "p-2 md:p-4" : "p-4 lg:p-10"
            )}
          >
            <div className={cn(
              "mx-auto min-h-full rounded-sm relative transition-all duration-300",
              activeTheme.paperBg,
              activeTheme.paperBorder,
              activeTheme.paperShadow,
              activeTheme.textColor,
              mode === 'edit' 
                ? "max-w-xl p-6 md:p-8" 
                : cn(
                    SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.widthClass || "max-w-xl",
                    "p-8 lg:p-12"
                  )
            )}>
              {/* Page punch holes effect */}
              <div className="absolute left-2 top-12 flex flex-col gap-8 opacity-20">
                <div className={cn("w-2 h-2 rounded-full shadow-inner", activeTheme.punchHoleBg)} />
                <div className={cn("w-2 h-2 rounded-full shadow-inner", activeTheme.punchHoleBg)} />
                <div className={cn("w-2 h-2 rounded-full shadow-inner", activeTheme.punchHoleBg)} />
              </div>
              
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
        cueTypes={COLORS}
      />
    </div>
  );
}
