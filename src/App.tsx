import React, { useState, useEffect, useRef, useMemo } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Edit2, Download, Upload, Plus, Trash2, X, Check, FileText, Video, Clock, RefreshCw, Loader2, Settings, ChevronDown, ChevronUp, Book, Target, Info, Search, FolderOpen, Heart, Coffee, MoveHorizontal, AlignVerticalJustifyCenter, Palette } from 'lucide-react';
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
import { cn, extractYoutubeId, generateId } from './lib/utils';
import { useScriptStorage } from './hooks/useScriptStorage';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useScriptPreferences } from './hooks/useScriptPreferences';
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
      setState(prev => ({ ...prev, cues: parsedCues }));
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
      <header className={cn(
        "h-16 border-b border-stone-200 bg-white flex items-center justify-between px-3 lg:px-6 shrink-0 z-40 shadow-sm transition-all",
        mode === 'playback' && "hidden lg:flex"
      )}>
        <div className="flex items-center gap-2 lg:gap-3">
          <img 
            src="/SCENEFLOW_TAG_B.png" 
            alt="SceneFlow Logo" 
            referrerPolicy="no-referrer"
            className="h-8 lg:h-9 w-auto object-contain selection:bg-transparent pointer-events-none"
          />
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-1 lg:gap-1.5 mr-1 xl:mr-2">
            <button 
              onClick={() => setResetConfirmation({ isOpen: true, type: 'blank', error: null })}
              title="New Official Guide"
              className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm"
            >
              <Plus size={12} /> <span className="hidden xl:inline">Guide</span>
            </button>
            
            <button 
              onClick={() => setIsLibraryOpen(true)}
              title="Example Library Catalog"
              className={cn(
                "flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border shadow-sm",
                isLibraryOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white hover:bg-stone-50 text-stone-600 border-stone-200"
              )}
            >
              <Book size={12} /> <span className="hidden xl:inline">Library</span>
            </button>

            <a 
              href="https://ko-fi.com/tarumainfo"
              target="_blank"
              rel="noopener noreferrer"
              title="Support on Ko-fi"
              className="flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 bg-[#FF5E5B] hover:bg-[#e04e4b] text-white shadow-sm"
            >
              <Coffee size={12} /> <span className="hidden xl:inline">Support</span>
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 xl:px-4 py-2 bg-stone-900 rounded-xl shadow-inner animate-in fade-in zoom-in duration-500">
            <span className="hidden xl:inline text-[10px] font-black text-stone-500 uppercase tracking-widest">Current Time</span>
            <span className="text-base xl:text-lg font-mono font-bold text-white w-12 xl:w-16 text-right">{currentTime.toFixed(1)}s</span>
          </div>

          <div className="flex bg-stone-100 p-0.5 lg:p-1 rounded-lg lg:rounded-xl ring-1 ring-stone-200 scale-90 xl:scale-100">
            <button
              onClick={() => setMode('playback')}
              className={cn(
                "px-2 lg:px-3 xl:px-5 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 lg:gap-2",
                mode === 'playback' ? "bg-white shadow-md text-stone-900" : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Play size={12} className={mode === 'playback' ? "fill-current" : ""} /> Playback
            </button>
            <button
              onClick={() => setMode('edit')}
              className={cn(
                "px-2 lg:px-3 xl:px-5 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs xl:text-sm font-semibold transition-all flex items-center gap-1 lg:gap-2",
                mode === 'edit' ? "bg-white shadow-md text-stone-900" : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Edit2 size={12} /> Edit
            </button>
          </div>
          
          <div className="relative hidden lg:block">
            <button
              id="script-theme-header-button"
              onClick={() => setIsColorModalOpen(true)}
              className={cn(
                "p-2 rounded-lg transition-all border shadow-sm active:scale-95 flex items-center justify-center",
                isColorModalOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 hover:text-stone-700 border-stone-200"
              )}
              title="Script Color & Theme Presets"
            >
              <Palette size={18} />
            </button>
          </div>

          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
                isSettingsOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 hover:text-stone-700 border-stone-200"
              )}
              title="Timing Settings"
            >
              <Clock size={18} />
            </button>
          </div>
          
          <div className="hidden lg:block h-8 w-px bg-stone-200 mx-2" />
          
          <div className="flex items-center gap-1">
            <label
              title="Open Sync (.json)"
              className="cursor-pointer p-2 rounded-lg text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 shadow-sm transition-all active:scale-95 flex items-center justify-center"
            >
              <FolderOpen size={18} />
              <input type="file" accept=".json" onChange={importJson} className="hidden" />
            </label>
            <button
              onClick={exportJson}
              title="Save Sync (.json)"
              className="p-2 rounded-lg text-stone-500 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 shadow-sm transition-all active:scale-95 flex items-center justify-center"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </header>

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
              <div className="hidden lg:flex flex-col flex-1 mt-10 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                    <Video size={14} /> Active Highlights
                  </h3>
                  <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded uppercase">
                    {(state.cues || []).filter(isCueVisible).length} active
                  </span>
                </div>

                {/* Legend / Filter */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {COLORS.map(color => {
                    const isActive = activeCueTypes.has(color.type);
                    const isHidden = hiddenCueTypes.has(color.type);
                    const themed = getCueColorForTheme(color.type, scriptThemeId);
                    return (
                      <button
                        key={color.type}
                        onClick={() => toggleCueTypeVisibility(color.type)}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border relative overflow-hidden",
                          isHidden 
                            ? "bg-stone-50 border-stone-100 text-stone-300 opacity-60" 
                            : "bg-white border-stone-200 text-stone-500 hover:border-stone-300 shadow-sm",
                          isActive && !isHidden && "bg-stone-50"
                        )}
                      >
                        {isActive && !isHidden && (
                          <span 
                            className="absolute inset-0 opacity-30 animate-pulse" 
                            style={{ backgroundColor: `rgb(${themed.rgb})` }}
                          />
                        )}
                        <div 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: isHidden ? undefined : `rgb(${themed.rgb})` }} 
                        />
                        {color.type}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                  {(state.cues || []).filter(isCueVisible).sort((a, b) => {
                    const order = COLORS.map(c => c.type);
                    return order.indexOf(a.type || 'dialogue') - order.indexOf(b.type || 'dialogue');
                  }).map(cue => {
                    const themed = getCueColorForTheme(cue.type || cue.colorClass || '', scriptThemeId);
                    return (
                      <div key={cue.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden">
                        <div 
                          className="w-1.5 h-8 rounded-full shrink-0" 
                          style={{ backgroundColor: `rgb(${themed.rgb})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-serif italic text-stone-700 line-clamp-2">"{cue.selectedText}"</p>
                          {cue.type && (
                            <span className="absolute top-1 right-2 text-[8px] font-black uppercase tracking-widest text-stone-300">
                              {cue.type}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(state.cues || []).filter(isCueVisible).length === 0 && (
                    <div className="h-32 border-2 border-dashed border-stone-100 rounded-3xl flex items-center justify-center">
                      <p className="text-xs text-stone-300 italic">No active highlights at this time</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Script Management Section - Only in Edit Mode */}
          {mode === 'edit' && (
            <ScriptManagementBar
              lineCount={state.scriptText.split('\n').length}
              onOpenRawScriptModal={() => setIsScriptModalOpen(true)}
            />
          )}

          {/* Edit Mode Controls - Moved Cue Creation to Right Panel */}
          {mode === 'edit' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-4">
              {/* Cue List */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Timeline Cues</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRawCuesText(JSON.stringify(state.cues, null, 2));
                          setIsCuesModalOpen(true);
                        }}
                        title="Edit raw JSON cues"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        <Edit2 size={10} /> Raw
                      </button>
                      {(state.cues || []).length > 0 && (
                        <button
                          onClick={() => realignCues()}
                          disabled={isAligning}
                          title="Re-align cues with script text"
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                            alignSuccess 
                              ? "bg-green-50 border-green-100 text-green-600" 
                              : "bg-stone-100 border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-200"
                          )}
                        >
                          {isAligning ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : alignSuccess ? (
                            <Check size={10} />
                          ) : (
                            <RefreshCw size={10} />
                          )}
                          {alignSuccess ? 'Aligned' : 'Align'}
                        </button>
                      )}
                      <span className="text-[10px] font-bold text-stone-300 bg-stone-100 px-2 py-0.5 rounded uppercase">{(state.cues || []).length} total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                    {COLORS.map(color => (
                      <div key={color.type} className="flex items-center gap-1.5">
                        <div className={cn("w-2.5 h-2.5 rounded-full", color.class)} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{color.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                 <div className="grid gap-3">
                   {(state.cues || []).map(cue => {
                    const cueType = cue.type || (cue.colorClass ? COLORS.find(c => c.class === cue.colorClass)?.type : 'dialogue') || 'dialogue';
                    const colorClass = cue.colorClass || COLORS.find(c => c.type === cueType)?.class || COLORS[0].class;
                    const themed = getCueColorForTheme(cueType, scriptThemeId);
                    return (
                    <div 
                      key={cue.id} 
                      onClick={() => selectCueForEdit(cue)}
                      className={cn(
                        "flex items-center justify-between p-4 bg-stone-50 border rounded-2xl group hover:bg-white hover:shadow-md transition-all relative overflow-hidden cursor-pointer",
                        newCue.id === cue.id ? "border-stone-900 ring-1 ring-stone-900 bg-white shadow-md" : "border-stone-200"
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div 
                          className="w-1.5 h-10 rounded-full shrink-0" 
                          style={{ backgroundColor: `rgb(${themed.rgb})` }} 
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          {cueType && (
                            <span 
                              className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md w-fit mb-1 border"
                              style={{ 
                                backgroundColor: `rgba(${themed.rgb}, 0.15)`,
                                borderColor: `rgba(${themed.rgb}, 0.3)`,
                                color: themed.textColorClass.includes('text-amber-100') ? '#b45309' : undefined
                              }}
                            >
                              {cueType}
                            </span>
                          )}
                          <span className="text-sm font-bold text-stone-800 italic leading-tight break-words">"{cue.selectedText}"</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{cue.startTime.toFixed(1)}s</span>
                            <div className="w-2 h-px bg-stone-200" />
                            <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{cue.endTime.toFixed(1)}s</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCue(cue.id);
                          }}
                          className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );})}
                  {(state.cues || []).length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-[2rem] bg-stone-50/50">
                      <p className="text-sm text-stone-400 font-medium italic">No cues created yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Panel: The Screenplay */}
        <div className={cn(
          "bg-stone-50 flex flex-col overflow-hidden relative transition-all duration-500",
          mode === 'edit' ? "hidden lg:flex w-full lg:w-1/2 h-full" : "w-full lg:w-1/2 flex-1"
        )}>
          <div className={cn(
            "h-16 border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0 z-20",
            mode === 'playback' ? "h-12 sticky top-0 shadow-sm" : "h-16"
          )}>
            <div className="flex items-center gap-2 lg:gap-3">
              <FileText size={16} className="text-stone-400 shrink-0" />
              <span className="hidden sm:inline text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-stone-400">Script Preview</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              {mode === 'playback' && (
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-l-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border-y border-l shadow-sm",
                        isAutoScrollEnabled ? "bg-blue-500 text-white border-blue-600" : "bg-white text-stone-400 border-stone-200 hover:text-stone-600"
                      )}
                      title={isAutoScrollEnabled ? "Auto-scroll enabled" : "Auto-scroll disabled"}
                    >
                      <Target size={10} className={cn(isAutoScrollEnabled && "animate-pulse")} />
                      <span className="hidden sm:inline">Auto-Scroll</span>
                    </button>
                    <button
                      onClick={() => setIsAutoScrollDropdownOpen(!isAutoScrollDropdownOpen)}
                      className={cn(
                        "px-1 py-1 rounded-r-lg border-y border-r shadow-sm transition-all active:scale-95",
                        isAutoScrollEnabled ? "bg-blue-600 text-white border-blue-700" : "bg-white text-stone-400 border-stone-200 hover:text-stone-600"
                      )}
                    >
                      <ChevronDown size={10} className={cn("transition-transform duration-200", isAutoScrollDropdownOpen && "rotate-180")} />
                    </button>

                    {isAutoScrollDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsAutoScrollDropdownOpen(false)} 
                        />
                        <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                          <div className="p-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Focus Mode</p>
                            <button 
                              onClick={() => {
                                const allTypes = COLORS.map(c => c.type);
                                if (autoScrollTargets.length === allTypes.length) {
                                  setAutoScrollTargets(['dialogue']);
                                } else {
                                  setAutoScrollTargets(allTypes);
                                }
                              }}
                              className="text-[8px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-tighter"
                            >
                              {autoScrollTargets.length === COLORS.length ? 'Reset' : 'Select All'}
                            </button>
                          </div>
                          <div className="p-1 max-h-64 overflow-y-auto">
                            {COLORS.map(color => {
                              const isSelected = autoScrollTargets.includes(color.type);
                              return (
                                <button
                                  key={color.type}
                                  onClick={() => {
                                    setAutoScrollTargets(prev => {
                                      if (isSelected) {
                                        // Don't allow removing the last one
                                        if (prev.length === 1) return prev;
                                        return prev.filter(t => t !== color.type);
                                      } else {
                                        return [...prev, color.type];
                                      }
                                    });
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-colors capitalize",
                                    isSelected ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", color.class)} />
                                    {color.type}
                                  </div>
                                  {isSelected && <Check size={10} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="h-4 w-px bg-stone-200 mx-1 hidden lg:block" />
                  <button 
                    onClick={() => setIsLibraryOpen(true)}
                    className="lg:hidden flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-[10px] font-bold text-stone-700 transition-colors"
                  >
                    <Book size={10} /> Library
                  </button>
                  <a 
                    href="https://ko-fi.com/tarumainfo"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Support on Ko-fi"
                    className="lg:hidden flex items-center justify-center px-1.5 py-1 bg-[#FF5E5B] hover:bg-[#e04e4b] text-white rounded transition-colors"
                  >
                    <Coffee size={10} />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "hidden sm:block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                  mode === 'edit' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                )}>
                  {mode === 'edit' ? 'Edit' : 'Playback'}
                </div>

                {/* Page Width Preset Selector (Playback mode on Desktop only) */}
                {mode === 'playback' && (
                  <div className="relative hidden lg:flex items-center">
                    <button
                      id="script-preview-width-control"
                      onClick={() => setIsWidthDropdownOpen(!isWidthDropdownOpen)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-tight transition-all active:scale-95 shadow-sm",
                        isWidthDropdownOpen 
                          ? "bg-stone-900 text-white border-stone-900" 
                          : "bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-stone-300"
                      )}
                      title={`Script Width: ${SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.label || 'Standard'}`}
                    >
                      <MoveHorizontal size={11} className="text-stone-400 shrink-0" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500 font-semibold">
                        {SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.label}
                      </span>
                      <ChevronDown size={10} className={cn("text-stone-400 transition-transform duration-200", isWidthDropdownOpen && "rotate-180")} />
                    </button>

                    {isWidthDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsWidthDropdownOpen(false)} 
                        />
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                          <div className="p-2.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Script Width</p>
                            <span className="text-[8px] font-mono text-stone-400 font-medium">5 Presets</span>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            {SCRIPT_WIDTH_PRESETS.map((preset, index) => {
                              const isSelected = scriptWidthPreset === preset.id;
                              const isDefault = preset.id === 'standard';
                              return (
                                <button
                                  key={preset.id}
                                  id={`script-width-preset-${preset.id}`}
                                  onClick={() => {
                                    setScriptWidthPreset(preset.id);
                                    if (typeof localStorage !== 'undefined') {
                                      localStorage.setItem('sceneflow_script_width_preset', preset.id);
                                    }
                                    setIsWidthDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors group",
                                    isSelected 
                                      ? "bg-stone-900 text-white" 
                                      : "text-stone-700 hover:bg-stone-100"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {/* Visual width representation bars */}
                                    <div className="w-8 flex items-center justify-center">
                                      <div 
                                        className={cn(
                                          "h-1.5 rounded-full transition-all",
                                          isSelected ? "bg-white" : "bg-stone-300 group-hover:bg-stone-500"
                                        )}
                                        style={{ width: `${30 + index * 16}%` }}
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold leading-none">{preset.label}</span>
                                        {isDefault && (
                                          <span className={cn(
                                            "text-[8px] px-1 py-0.2 rounded font-medium",
                                            isSelected ? "bg-stone-800 text-stone-300" : "bg-stone-200 text-stone-600"
                                          )}>
                                            Default
                                          </span>
                                        )}
                                      </div>
                                      <span className={cn(
                                        "text-[9px] font-mono leading-tight mt-0.5",
                                        isSelected ? "text-stone-300" : "text-stone-400"
                                      )}>
                                        {preset.desc}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && <Check size={12} className="shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Scroll Focus Line Selector (Playback mode on Desktop only) */}
                {mode === 'playback' && (
                  <div className="relative hidden lg:flex items-center">
                    <button
                      id="script-preview-scroll-focus-control"
                      onClick={() => setIsScrollFocusDropdownOpen(!isScrollFocusDropdownOpen)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-tight transition-all active:scale-95 shadow-sm",
                        isScrollFocusDropdownOpen 
                          ? "bg-stone-900 text-white border-stone-900" 
                          : "bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:border-stone-300"
                      )}
                      title={`Scroll Focus Position: ${SCROLL_FOCUS_PRESETS.find(p => p.id === scrollFocusPreset)?.label || 'Top (35%)'}`}
                    >
                      <AlignVerticalJustifyCenter size={11} className="text-stone-400 shrink-0" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-stone-500 font-semibold">
                        {SCROLL_FOCUS_PRESETS.find(p => p.id === scrollFocusPreset)?.shortLabel}
                      </span>
                      <ChevronDown size={10} className={cn("text-stone-400 transition-transform duration-200", isScrollFocusDropdownOpen && "rotate-180")} />
                    </button>

                    {isScrollFocusDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsScrollFocusDropdownOpen(false)} 
                        />
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                          <div className="p-2.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Focus Line</p>
                            <span className="text-[8px] font-mono text-stone-400 font-medium">Viewport Focus</span>
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            {SCROLL_FOCUS_PRESETS.map((preset) => {
                              const isSelected = scrollFocusPreset === preset.id;
                              const isDefault = preset.id === 'top';
                              return (
                                <button
                                  key={preset.id}
                                  id={`script-scroll-focus-${preset.id}`}
                                  onClick={() => applyScrollFocus(preset.id)}
                                  className={cn(
                                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors group",
                                    isSelected 
                                      ? "bg-stone-900 text-white" 
                                      : "text-stone-700 hover:bg-stone-100"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {/* Visual vertical position representation bar */}
                                    <div className={cn(
                                      "w-4 h-6 rounded border flex flex-col justify-between p-0.5 transition-all shrink-0",
                                      isSelected ? "border-stone-700 bg-stone-800" : "border-stone-200 bg-stone-50 group-hover:border-stone-300"
                                    )}>
                                      <div 
                                        className={cn(
                                          "w-full h-1 rounded-sm transition-all",
                                          preset.id === 'top' ? (isSelected ? "bg-amber-400" : "bg-blue-500") : "opacity-0"
                                        )} 
                                      />
                                      <div 
                                        className={cn(
                                          "w-full h-1 rounded-sm transition-all",
                                          preset.id === 'center' ? (isSelected ? "bg-amber-400" : "bg-blue-500") : "opacity-0"
                                        )} 
                                      />
                                      <div 
                                        className={cn(
                                          "w-full h-1 rounded-sm transition-all",
                                          preset.id === 'bottom' ? (isSelected ? "bg-amber-400" : "bg-blue-500") : "opacity-0"
                                        )} 
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold leading-none">{preset.label}</span>
                                        {isDefault && (
                                          <span className={cn(
                                            "text-[8px] px-1 py-0.2 rounded font-medium",
                                            isSelected ? "bg-stone-800 text-stone-300" : "bg-stone-200 text-stone-600"
                                          )}>
                                            Default
                                          </span>
                                        )}
                                      </div>
                                      <span className={cn(
                                        "text-[9px] font-mono leading-tight mt-0.5",
                                        isSelected ? "text-stone-300" : "text-stone-400"
                                      )}>
                                        {preset.desc}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && <Check size={12} className="shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="lg:hidden flex items-center gap-1 px-2 py-1 bg-stone-900 rounded-lg shadow-inner">
                <span className="text-[8px] font-black text-stone-500 uppercase">Time</span>
                <span className="text-xs font-mono font-bold text-white w-10 text-right">{currentTime.toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Create Cue Section - Moved to Right Panel in Edit Mode */}
          {mode === 'edit' && (
            <div className="bg-white border-b border-stone-200 p-4 lg:p-6 shrink-0 z-10 shadow-sm animate-in slide-in-from-top duration-500">
              <div className="max-w-xl mx-auto">
                {!selection ? (
                  <div className="py-4 text-center border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50/50">
                    <p className="text-xs text-stone-400 font-medium italic">Highlight text in the script below to create a sync cue.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {newCue.id ? <Edit2 size={16} className="text-amber-500" /> : <Plus size={16} className="text-blue-500" />}
                        <h3 className="text-sm font-bold text-stone-800">{newCue.id ? 'Edit Sync Cue' : 'New Sync Cue'}</h3>
                      </div>
                      <button 
                        onClick={cancelEdit}
                        className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-600 underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Selected Text</p>
                        <button 
                          onClick={findAlternativeLocations}
                          className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-stone-400 hover:text-blue-500 transition-colors"
                        >
                          <Search size={10} /> {altLocations ? 'Refresh' : 'Find Alternative'}
                        </button>
                      </div>
                      <textarea
                        value={newCue.selectedText || ''}
                        onChange={(e) => {
                          const text = e.target.value;
                          setNewCue(prev => ({ ...prev, selectedText: text }));
                          setSelection(s => s ? { ...s, text } : { text, start: newCue.startIndex || 0, end: newCue.endIndex || 0 });
                        }}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-stone-800 font-mono text-xs min-h-[60px] focus:outline-none focus:ring-1 focus:ring-stone-500 transition-all duration-200 hover:border-stone-300"
                        placeholder="Edit cue text..."
                      />
                      
                      {altLocations && altLocations.length > 1 && (
                        <div className="pt-2 mt-2 border-t border-stone-200">
                          <p className="text-[8px] text-stone-400 uppercase tracking-widest mb-1">Alternative Locations ({altLocations.length})</p>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {altLocations.map((loc, i) => {
                              const isCurrent = loc.start === newCue.startIndex;
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setNewCue(prev => ({ ...prev, startIndex: loc.start, endIndex: loc.end }));
                                    setSelection(s => s ? { ...s, start: loc.start, end: loc.end } : null);
                                  }}
                                  className={cn(
                                    "w-full text-left p-1.5 rounded text-[9px] font-mono transition-all border",
                                    isCurrent 
                                      ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" 
                                      : "bg-white border-stone-200 text-stone-500 hover:bg-stone-100"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="opacity-60 text-[7px]">Offset: {loc.start}</span>
                                    {isCurrent && <Check size={8} />}
                                  </div>
                                  <div className="truncate">{loc.context}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-stone-400 font-black">Start Time</label>
                        <div className="flex gap-1">
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            value={newCue.startTime ?? ''}
                            onChange={(e) => setNewCue(prev => ({ ...prev, startTime: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-1.5 py-1 text-stone-800 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setNewCue(prev => ({ ...prev, startTime: player?.getCurrentTime() || 0 }))}
                            className="bg-stone-100 hover:bg-stone-200 p-1 rounded-lg text-blue-500 transition-colors"
                          >
                            <Clock size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-stone-400 font-black">End Time</label>
                        <div className="flex gap-1">
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            value={newCue.endTime ?? ''}
                            onChange={(e) => setNewCue(prev => ({ ...prev, endTime: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-1.5 py-1 text-stone-800 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setNewCue(prev => ({ ...prev, endTime: player?.getCurrentTime() || 0 }))}
                            className="bg-stone-100 hover:bg-stone-200 p-1 rounded-lg text-blue-500 transition-colors"
                          >
                            <Clock size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-stone-400 font-black">Start Index</label>
                        <input 
                          type="number"
                          min="0"
                          value={newCue.startIndex ?? ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setNewCue(prev => {
                              const updated = { ...prev, startIndex: val };
                              if (updated.endIndex !== undefined && updated.startIndex !== undefined) {
                                const text = state.scriptText.substring(updated.startIndex, updated.endIndex);
                                updated.selectedText = text;
                                setSelection(s => s ? { ...s, text, start: updated.startIndex!, end: updated.endIndex! } : null);
                              }
                              return updated;
                            });
                          }}
                          className="w-full bg-white border border-stone-200 rounded-lg px-1.5 py-1 text-stone-800 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase tracking-widest text-stone-400 font-black">End Index</label>
                        <input 
                          type="number"
                          min="0"
                          value={newCue.endIndex ?? ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setNewCue(prev => {
                              const updated = { ...prev, endIndex: val };
                              if (updated.endIndex !== undefined && updated.startIndex !== undefined) {
                                const text = state.scriptText.substring(updated.startIndex, updated.endIndex);
                                updated.selectedText = text;
                                setSelection(s => s ? { ...s, text, start: updated.startIndex!, end: updated.endIndex! } : null);
                              }
                              return updated;
                            });
                          }}
                          className="w-full bg-white border border-stone-200 rounded-lg px-1.5 py-1 text-stone-800 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {COLORS.map(color => {
                          const themed = getCueColorForTheme(color.type, scriptThemeId);
                          const isSelected = newCue.type ? newCue.type === color.type : newCue.colorClass === color.class;
                          return (
                            <button
                              key={color.class}
                              onClick={() => setNewCue(prev => ({ ...prev, colorClass: color.class, type: color.type }))}
                              title={color.type}
                              className={cn(
                                "px-2 py-1 rounded-md transition-all border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                isSelected 
                                  ? "border-stone-900 scale-105 shadow-sm opacity-100 bg-white font-bold ring-1 ring-stone-900" 
                                  : "border-stone-200 bg-stone-50 opacity-70 hover:opacity-100 hover:bg-white"
                              )}
                            >
                              <div 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: `rgb(${themed.rgb})` }} 
                              />
                              {color.type}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        {newCue.id && (
                          <button
                            onClick={() => deleteCue(newCue.id!)}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                            title="Delete Cue"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={saveCue}
                          disabled={!canSave}
                          className={cn(
                            "px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
                            canSave 
                              ? (newCue.id ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md" : "bg-blue-500 hover:bg-blue-600 text-white shadow-md")
                              : "bg-stone-100 text-stone-300 cursor-not-allowed"
                          )}
                        >
                          <Check size={14} /> {newCue.id ? 'Update Cue' : 'Save Cue'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              getScriptTheme(scriptThemeId).paperBg,
              getScriptTheme(scriptThemeId).paperBorder,
              getScriptTheme(scriptThemeId).paperShadow,
              getScriptTheme(scriptThemeId).textColor,
              mode === 'edit' 
                ? "max-w-xl p-6 md:p-8" 
                : cn(
                    SCRIPT_WIDTH_PRESETS.find(p => p.id === scriptWidthPreset)?.widthClass || "max-w-xl",
                    "p-8 lg:p-12"
                  )
            )}>
              {/* Page punch holes effect */}
              <div className="absolute left-2 top-12 flex flex-col gap-8 opacity-20">
                <div className={cn("w-2 h-2 rounded-full shadow-inner", getScriptTheme(scriptThemeId).punchHoleBg)} />
                <div className={cn("w-2 h-2 rounded-full shadow-inner", getScriptTheme(scriptThemeId).punchHoleBg)} />
                <div className={cn("w-2 h-2 rounded-full shadow-inner", getScriptTheme(scriptThemeId).punchHoleBg)} />
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
