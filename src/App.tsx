import React, { useState, useEffect, useRef, useMemo } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Edit2, Download, Upload, Plus, Trash2, X, Check, FileText, Video, Clock, RefreshCw, Loader2, Settings, ChevronDown, ChevronUp, Book, Target, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EXAMPLE_SECTIONS } from './examples';
import { processScript, type LineType, type ProcessedLine } from './lib/scriptProcessor';
import { getLineClass, SCRIPT_STYLES } from './lib/scriptStyles';
import { StagingModal } from './components/StagingModal';

// Utility to extract YouTube ID from various URL formats
function extractYoutubeId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[8].length === 11) ? match[8] : url;
}

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Cue {
  id: string;
  selectedText: string;
  startIndex: number;
  endIndex: number;
  startTime: number;
  endTime: number;
  colorClass: string;
  type?: string;
}

interface TimingSettings {
  before: number;
  after: number;
}

interface AppState {
  youtubeId: string;
  scriptText: string;
  cues: Cue[];
  settings?: Record<string, TimingSettings>;
}

const COLORS = [
  { type: 'dialogue', class: 'bg-yellow-400/50', rgb: '250, 204, 21' },
  { type: 'action', class: 'bg-blue-400/50', rgb: '96, 165, 250' },
  { type: 'camera', class: 'bg-green-400/50', rgb: '74, 222, 128' },
  { type: 'shot', class: 'bg-purple-400/50', rgb: '192, 132, 252' },
  { type: 'audio', class: 'bg-orange-400/50', rgb: '251, 146, 60' },
  { type: 'vfx', class: 'bg-cyan-400/50', rgb: '34, 211, 238' },
  { type: 'transition', class: 'bg-pink-400/50', rgb: '244, 114, 182' },
  { type: 'environment', class: 'bg-slate-400/50', rgb: '148, 163, 184' },
];

const DEFAULT_SETTINGS: Record<string, TimingSettings> = {
  general: { before: 0, after: 0 },
  ...Object.fromEntries(COLORS.map(c => [
    c.type, 
    { before: 0, after: 0 }
  ]))
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('screenplay_sync_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure it has required properties
        return {
          youtubeId: parsed.youtubeId || 'dQw4w9WgXcQ',
          scriptText: parsed.scriptText || '',
          cues: Array.isArray(parsed.cues) ? parsed.cues.map((c: any) => {
            if (!c.type && c.colorClass) {
              const colorInfo = COLORS.find(col => col.class === c.colorClass);
              return { ...c, type: colorInfo?.type || 'dialogue' };
            }
            return c;
          }) : [],
          settings: parsed.settings || DEFAULT_SETTINGS,
        };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      youtubeId: '', // Will be loaded from example_the_expansion.json
      scriptText: '',
      cues: [],
      settings: DEFAULT_SETTINGS,
    };
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const [mode, setMode] = useState<'playback' | 'edit'>('playback');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCuesModalOpen, setIsCuesModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [autoScrollTargets, setAutoScrollTargets] = useState<string[]>(['dialogue']);
  const [isAutoScrollDropdownOpen, setIsAutoScrollDropdownOpen] = useState(false);
  const [lastScrolledCueId, setLastScrolledCueId] = useState<string | null>(null);
  const [rawCuesText, setRawCuesText] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<number>(-1);
  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [newCue, setNewCue] = useState<Partial<Cue>>({
    colorClass: COLORS[0].class,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; cue: Cue | null }>({
    isOpen: false,
    cue: null,
  });
  const [resetConfirmation, setResetConfirmation] = useState<{ 
    isOpen: boolean; 
    type: 'settings' | 'data' | 'blank' | 'example' | 'remote' | null;
    examplePath?: string;
    exampleTitle?: string;
    remoteUrl?: string;
    error?: string | null;
  }>({
    isOpen: false,
    type: null,
    error: null,
  });
  const [overlapPicker, setOverlapPicker] = useState<{ isOpen: boolean; cues: Cue[]; position: { x: number; y: number } }>({
    isOpen: false,
    cues: [],
    position: { x: 0, y: 0 },
  });

  const [isAligning, setIsAligning] = useState(false);
  const [alignSuccess, setAlignSuccess] = useState(false);
  const [leftPanelScroll, setLeftPanelScroll] = useState(0);
  const [hiddenCueTypes, setHiddenCueTypes] = useState<Set<string>>(new Set());
  const [videoWidth, setVideoWidth] = useState(100); // Percentage of container width
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [activeStaging, setActiveStaging] = useState<{ label: string; content: string } | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCueTypes = useMemo(() => {
    const active = new Set<string>();
    (state.cues || []).forEach(c => {
      const typeSettings = state.settings?.[c.type || ''] || DEFAULT_SETTINGS.general;
      const generalSettings = state.settings?.['general'] || DEFAULT_SETTINGS.general;
      const totalBefore = (typeSettings.before || 0) + (generalSettings.before || 0);
      const totalAfter = (typeSettings.after || 0) + (generalSettings.after || 0);
      if (currentTime >= c.startTime - totalBefore && currentTime <= c.endTime + totalAfter) {
        active.add(c.type || 'dialogue');
      }
    });
    return active;
  }, [state.cues, state.settings, currentTime]);

  const scriptRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Save to localStorage on state change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('screenplay_sync_state', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // Auto-scroll logic
  useEffect(() => {
    if (mode === 'playback' && isAutoScrollEnabled) {
      const activeCues = (state.cues || []).filter(c => {
        // Filter by selected focus types
        if (!autoScrollTargets.includes(c.type || 'dialogue')) return false;
        
        const typeSettings = state.settings?.[c.type || ''] || DEFAULT_SETTINGS.general;
        const generalSettings = state.settings?.['general'] || DEFAULT_SETTINGS.general;
        const totalBefore = (typeSettings.before || 0) + (generalSettings.before || 0);
        const totalAfter = (typeSettings.after || 0) + (generalSettings.after || 0);
        return currentTime >= c.startTime - totalBefore && currentTime <= c.endTime + totalAfter;
      });

      const activeCue = activeCues.length > 0
        ? activeCues.reduce((best, current) => {
            if (!best) return current;
            
            // Prioritize by most recent start time (the one that started last)
            if (current.startTime > best.startTime) return current;
            
            // If same start time, prioritize by position in script (further down)
            if (current.startTime === best.startTime && (current.startIndex || 0) > (best.startIndex || 0)) return current;
            
            return best;
          }, null as Cue | null)
        : null;

      if (activeCue && activeCue.id !== lastScrolledCueId) {
        const element = document.getElementById(`cue-${activeCue.id}`);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 50);
          setLastScrolledCueId(activeCue.id);
        }
      } else if (!activeCue) {
        setLastScrolledCueId(null);
      }
    }
  }, [currentTime, mode, isAutoScrollEnabled, state.cues, state.settings, lastScrolledCueId, autoScrollTargets]);

  // Initial load of default data if no local storage
  useEffect(() => {
    const saved = localStorage.getItem('screenplay_sync_state');
    if (!saved) {
      fetch('/example_the_expansion.json')
        .then(res => res.json())
        .then(data => {
          setState(data);
          setIsInitialized(true);
        })
        .catch(err => {
          console.error("Failed to load default script", err);
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, []);

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

  useEffect(() => {
    const handleClickOutside = () => {
      if (overlapPicker.isOpen) setOverlapPicker(prev => ({ ...prev, isOpen: false }));
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [overlapPicker.isOpen]);

  // YouTube Player Event Handlers
  useEffect(() => {
    setPlayer(null);
  }, [state.youtubeId]);

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

  const resetState = () => {
    fetch('/example_the_expansion.json')
      .then(res => res.json())
      .then(data => {
        const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
        setState(finalData);
        localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
        setMode('playback');
        setCurrentTime(0);
        setResetConfirmation({ isOpen: false, type: null, error: null });
      })
      .catch(err => {
        console.error("Failed to reset to default script", err);
        localStorage.removeItem('screenplay_sync_state');
        window.location.reload();
      });
  };

  const loadBlank = () => {
    fetch('/blank.json')
      .then(res => res.json())
      .then(data => {
        const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
        setState(finalData);
        localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
        setMode('edit');
        setCurrentTime(0);
        setResetConfirmation({ isOpen: false, type: null, error: null });
      })
      .catch(err => {
        console.error("Failed to load blank script", err);
        alert("Failed to load blank script.");
      });
  };

  const loadExample = (path: string) => {
    fetch(path)
      .then(res => res.json())
      .then(data => {
        const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
        setState(finalData);
        localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
        setMode('playback');
        setCurrentTime(0);
        setResetConfirmation({ isOpen: false, type: null, error: null });
        setIsLibraryOpen(false);
        // Realign cues after loading to ensure indices are correct
        realignCues(finalData);
      })
      .catch(err => {
        console.error("Failed to load example", err);
        alert("Failed to load example.");
      });
  };

  const [isRemoteLoading, setIsRemoteLoading] = useState(false);

  const loadRemoteProject = (url: string) => {
    setIsRemoteLoading(true);
    setResetConfirmation(prev => ({ ...prev, error: null }));
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Basic validation
        if (!data.youtubeId || !data.scriptText) {
          throw new Error("Invalid project format: missing youtubeId or scriptText");
        }

        const finalData = { ...data, settings: data.settings || DEFAULT_SETTINGS };
        setState(finalData);
        localStorage.setItem('screenplay_sync_state', JSON.stringify(finalData));
        setMode('playback');
        setCurrentTime(0);
        setResetConfirmation({ isOpen: false, type: null, error: null });
        setIsLibraryOpen(false);
        // Realign cues after loading
        realignCues(finalData);
      })
      .catch(err => {
        console.error("Failed to load remote project", err);
        setResetConfirmation(prev => ({ 
          ...prev, 
          error: `${err.message}. This might be due to CORS restrictions if the server doesn't allow cross-origin requests.` 
        }));
      })
      .finally(() => {
        setIsRemoteLoading(false);
      });
  };

  const toggleCueTypeVisibility = (type: string) => {
    setHiddenCueTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const isCueVisible = (c: Cue) => {
    if (hiddenCueTypes.has(c.type || 'dialogue')) return false;
    const typeSettings = state.settings?.[c.type || ''] || DEFAULT_SETTINGS.general;
    const generalSettings = state.settings?.['general'] || DEFAULT_SETTINGS.general;
    const totalBefore = (typeSettings.before || 0) + (generalSettings.before || 0);
    const totalAfter = (typeSettings.after || 0) + (generalSettings.after || 0);
    return currentTime >= c.startTime - totalBefore && currentTime <= c.endTime + totalAfter;
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setPlayerState(event.target.getPlayerState());
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    setPlayerState(event.data);
    if (event.data === 1) { // Playing
      startTimer();
      setActiveStaging(null); // Auto-close staging modal on play
    } else {
      stopTimer();
    }
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      if (player) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, [player]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        isScriptModalOpen ||
        isCuesModalOpen
      ) {
        return;
      }

      if (!player) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          const playerState = player.getPlayerState();
          if (playerState === 1) { // Playing
            player.pauseVideo();
          } else {
            player.playVideo();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          const backTime = Math.max(0, player.getCurrentTime() - 5);
          player.seekTo(backTime, true);
          setCurrentTime(backTime);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const forwardTime = player.getCurrentTime() + 5;
          player.seekTo(forwardTime, true);
          setCurrentTime(forwardTime);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, isScriptModalOpen, isCuesModalOpen]);

  // Handle text selection in Edit Mode
  const handleSelection = () => {
    if (mode !== 'edit') return;
    const sel = window.getSelection();
    
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      if (overlapPicker.isOpen) setOverlapPicker(prev => ({ ...prev, isOpen: false }));
      return;
    }

    const text = sel.toString();
    if (!text.trim()) return;

    console.log("Selection captured:", text);

    const fullText = state.scriptText;
    
    // Try exact match first
    let startIndex = fullText.indexOf(text);
    
    // If not found, try matching with normalized whitespace and quotes
    if (startIndex === -1) {
      const normalizedSearch = text.replace(/\s+/g, ' ').replace(/['’]/g, "'").trim();
      const normalizedFull = fullText.replace(/\s+/g, ' ').replace(/['’]/g, "'");
      const normIndex = normalizedFull.indexOf(normalizedSearch);
      
      if (normIndex !== -1) {
        // Fallback to regex search for more flexibility
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
        const regex = new RegExp(escaped, 'gi');
        const match = regex.exec(fullText);
        if (match) {
          startIndex = match.index;
        } else {
          // Last resort: case-insensitive search
          startIndex = fullText.toLowerCase().indexOf(text.toLowerCase().trim());
        }
      }
    }
    
    if (startIndex !== -1) {
      console.log("Text found in script at index:", startIndex);
      const actualText = fullText.substring(startIndex, startIndex + text.length);
      setSelection({
        text: actualText,
        start: startIndex,
        end: startIndex + text.length,
      });
      setNewCue(prev => ({
        ...prev,
        selectedText: actualText,
        startIndex: startIndex,
        endIndex: startIndex + text.length,
      }));
    } else {
      console.warn("Text not found in raw scriptText. Selection might span across complex formatting or have different whitespace.");
    }
  };

  const saveCue = () => {
    if (!newCue.selectedText || newCue.startTime === undefined || newCue.endTime === undefined) {
      console.error("Cannot save cue: missing data", newCue);
      return;
    }

    const colorInfo = COLORS.find(c => c.class === (newCue.colorClass || COLORS[0].class));
    const cue: Cue = {
      id: newCue.id || generateId(),
      selectedText: newCue.selectedText,
      startIndex: newCue.startIndex!,
      endIndex: newCue.endIndex!,
      startTime: newCue.startTime,
      endTime: newCue.endTime,
      colorClass: newCue.colorClass || COLORS[0].class,
      type: colorInfo?.type || 'dialogue',
    };

    setState(prev => {
      const existingIdx = (prev.cues || []).findIndex(c => c.id === cue.id);
      let newCues = [...(prev.cues || [])];
      if (existingIdx >= 0) {
        newCues[existingIdx] = cue;
      } else {
        newCues.push(cue);
      }
      return { ...prev, cues: newCues };
    });
    
    setSelection(null);
    setNewCue({ colorClass: COLORS[0].class });
    console.log("Cue saved successfully:", cue);
  };

  const cancelEdit = () => {
    setSelection(null);
    setNewCue({ colorClass: COLORS[0].class });
  };

  const deleteCue = (id: string) => {
    const cueToDelete = (state.cues || []).find(c => c.id === id);
    if (cueToDelete) {
      setDeleteConfirmation({ isOpen: true, cue: cueToDelete });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirmation.cue) {
      const id = deleteConfirmation.cue.id;
      setState(prev => ({
        ...prev,
        cues: (prev.cues || []).filter(c => c.id !== id),
      }));
      if (newCue.id === id) {
        cancelEdit();
      }
      setDeleteConfirmation({ isOpen: false, cue: null });
    }
  };

  const realignCues = (targetState?: AppState) => {
    // If targetState is an event (from onClick), ignore it
    const actualState = (targetState && typeof targetState === 'object' && 'cues' in targetState) ? (targetState as AppState) : state;
    
    if (!actualState || !actualState.cues || actualState.cues.length === 0) {
      console.warn("No cues to realign");
      return;
    }
    
    setIsAligning(true);
    
    // Use a small delay for visual feedback if it's a manual click
    const isManual = !targetState || !('cues' in targetState);
    const delay = isManual ? 600 : 0;
    
    console.log("Aligning cues. Manual:", isManual, "Cues count:", (actualState.cues || []).length);
    
    setTimeout(() => {
      let lastIndex = 0;
      let alignedCount = 0;
      
      // Sort cues by startTime before aligning to ensure sequential search works correctly
      // and the final list is chronologically ordered for easier troubleshooting
      const sortedCues = [...(actualState.cues || [])].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
      
      const updatedCues = sortedCues.map(cue => {
        const searchText = cue.selectedText.trim();
        if (!searchText) return cue;

        // Escape special characters for regex
        const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Replace any whitespace with \s+ and quotes with a character class
        const regexStr = escapedSearch.replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
        
        try {
          const regex = new RegExp(regexStr, 'gi');
          const matches: { index: number, length: number }[] = [];
          let m;
          while ((m = regex.exec(actualState.scriptText)) !== null) {
            matches.push({ index: m.index, length: m[0].length });
          }

          if (matches.length > 0) {
            // Reference point: prefer existing index if valid, otherwise use lastIndex
            const referenceIndex = (cue.startIndex !== undefined && cue.startIndex >= 0) ? cue.startIndex : lastIndex;
            
            // Find the match closest to our reference point
            const bestMatch = matches.reduce((prev, curr) => {
              return Math.abs(curr.index - referenceIndex) < Math.abs(prev.index - referenceIndex) ? curr : prev;
            });

            const newStart = bestMatch.index;
            const newEnd = newStart + bestMatch.length;
            lastIndex = newEnd;
            alignedCount++;
            return { ...cue, startIndex: newStart, endIndex: newEnd };
          }
          
          // 3. Last resort: try matching just the first 15 characters if the full text is not found
          // (Useful if the script text was edited significantly)
          const shortSearch = searchText.substring(0, 15).trim();
          if (shortSearch.length >= 5) {
            const shortEscaped = shortSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+').replace(/['’]/g, "['’]");
            const shortRegex = new RegExp(shortEscaped, 'gi');
            
            const shortMatches: { index: number, length: number }[] = [];
            let sm;
            while ((sm = shortRegex.exec(actualState.scriptText)) !== null) {
              shortMatches.push({ index: sm.index, length: sm[0].length });
            }

            if (shortMatches.length > 0) {
              const referenceIndex = (cue.startIndex !== undefined && cue.startIndex >= 0) ? cue.startIndex : lastIndex;
              const bestShortMatch = shortMatches.reduce((prev, curr) => {
                return Math.abs(curr.index - referenceIndex) < Math.abs(prev.index - referenceIndex) ? curr : prev;
              });

              const newStart = bestShortMatch.index;
              const newEnd = newStart + searchText.length; // Approximate
              lastIndex = newEnd;
              alignedCount++;
              return { ...cue, startIndex: newStart, endIndex: newEnd };
            }
          }
        } catch (e) {
          console.error("Regex error during alignment:", e);
        }

        console.warn(`Could not align cue: "${searchText}"`);
        return cue;
      });
      
      setState(prev => ({ ...prev, cues: updatedCues }));
      setIsAligning(false);
      
      if (isManual) {
        setAlignSuccess(true);
        setTimeout(() => setAlignSuccess(false), 2000);
      }
      console.log(`Cues realigned: ${alignedCount} of ${actualState.cues.length} updated.`);
    }, delay);
  };

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "screenplay_sync.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic validation to prevent crashes
        const validatedJson = {
          youtubeId: json.youtubeId || 'dQw4w9WgXcQ',
          scriptText: json.scriptText || '',
          cues: Array.isArray(json.cues) ? json.cues.map((c: any) => {
            if (!c.type && c.colorClass) {
              const colorInfo = COLORS.find(col => col.class === c.colorClass);
              return { ...c, type: colorInfo?.type || 'dialogue' };
            }
            return c;
          }) : [],
          settings: json.settings || DEFAULT_SETTINGS,
        };

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
    
    // Use the new processor to handle all structural and semantic logic
    const processedLines = processScript(scriptText);
    const scriptElements: React.ReactNode[] = [];

    processedLines.forEach((lineData) => {
      const { text: line, type, lineIdx, lineStart, lineEnd, isStaging, stagingMarker } = lineData;
      const trimmed = line.trim();

      // Check for staging markers at this line
      if (stagingMarker) {
        scriptElements.push(
          <div key={`staging-${lineIdx}`} className={SCRIPT_STYLES.stagingContainer}>
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
                  SCRIPT_STYLES.stagingBadgeBase,
                  playerState === 1 ? SCRIPT_STYLES.stagingBadgeDisabled : SCRIPT_STYLES.stagingBadgeActive
                )}
              >
                <Info size={10} className="text-stone-400" />
                <span className={SCRIPT_STYLES.stagingBadgeText}>
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
        scriptElements.push(<hr key={lineIdx} className={SCRIPT_STYLES.separator} />);
        return;
      }

      if (type === 'part-separator' || type === 'roman-title') {
        scriptElements.push(
          <div key={lineIdx} className={SCRIPT_STYLES.titleContainer}>
            <div className={SCRIPT_STYLES.titleLine} />
            <span className={SCRIPT_STYLES.titleText}>{trimmed}</span>
            <div className={SCRIPT_STYLES.titleLine} />
          </div>
        );
        return;
      }

      const className = getLineClass(lineData);

      // Filter cues that overlap with this line
      const lineCues = (mode === 'edit' ? cues : cues.filter(isCueVisible))
        .filter(cue => cue.startIndex < lineEnd && cue.endIndex > lineStart)
        .map(cue => {
          let opacity = 1;
          if (mode === 'playback') {
            const typeSettings = state.settings?.[cue.type || ''] || DEFAULT_SETTINGS.general;
            const generalSettings = state.settings?.['general'] || DEFAULT_SETTINGS.general;
            const totalBefore = (typeSettings.before || 0) + (generalSettings.before || 0);
            const totalAfter = (typeSettings.after || 0) + (generalSettings.after || 0);

            if (currentTime < cue.startTime) {
              opacity = totalBefore > 0 ? Math.max(0, Math.min(1, (currentTime - (cue.startTime - totalBefore)) / totalBefore)) : 1;
            } else if (currentTime > cue.endTime) {
              opacity = totalAfter > 0 ? Math.max(0, Math.min(1, 1 - (currentTime - cue.endTime) / totalAfter)) : 1;
            }
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
        scriptElements.push(
          <div key={lineIdx} className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
            {type === 'name' ? trimmed.slice(0, -1) : line}
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

        if (segmentCues.length === 0) {
          segments.push(displayValue);
          continue;
        }

        // If multiple cues, we pick the most "important" one for the primary color
        // but we'll indicate overlap visually
        const isTemp = segmentCues.some(c => c.id === 'temp-selection');
        const editingCue = segmentCues.find(c => c.id === newCue.id);
        const primaryCue = editingCue || segmentCues[0];
        
        const colorInfo = COLORS.find(c => 
          c.class === primaryCue.colorClass || 
          (primaryCue.colorClass && c.class.startsWith(primaryCue.colorClass.split('/')[0]))
        );
        
        const rgb = isTemp ? '191, 219, 254' : (colorInfo?.rgb || '156, 163, 175');
        const maxOpacity = Math.max(...segmentCues.map(c => (c as any).opacity || 0));
        const finalOpacity = isTemp ? 0.5 : maxOpacity * 0.5;

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
                const cue = actualCues[0];
                setNewCue(cue);
                setSelection({ text: cue.selectedText, start: cue.startIndex, end: cue.endIndex });
                if (player) player.seekTo(cue.startTime, true);
              } else if (actualCues.length > 1) {
                setOverlapPicker({
                  isOpen: true,
                  cues: actualCues as Cue[],
                  position: { x: e.clientX, y: e.clientY }
                });
              }
            }}
            className={cn(
              SCRIPT_STYLES.cueBase,
              mode === 'edit' && !isTemp && SCRIPT_STYLES.cueEdit,
              isTemp && SCRIPT_STYLES.cueTemp,
              editingCue && SCRIPT_STYLES.cueEditing
            )}
            style={{ backgroundColor: `rgba(${rgb}, ${finalOpacity})` }}
          >
            {displayValue}
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
  }, [state.scriptText, state.cues, currentTime, selection, mode, newCue.id, player, playerState]);

  const canSave = newCue.selectedText && newCue.startTime !== undefined && newCue.endTime !== undefined && newCue.startIndex !== undefined && newCue.endIndex !== undefined;

  if (!isInitialized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-100 gap-4">
        <Loader2 className="w-10 h-10 text-stone-400 animate-spin" />
        <p className="text-stone-500 font-mono text-sm animate-pulse">Initializing SceneFlow...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-stone-100 text-stone-900 font-sans overflow-hidden selection:bg-blue-100">
      {/* Header */}
      <header className={cn(
        "h-16 border-b border-stone-200 bg-white flex items-center justify-between px-2 lg:px-6 shrink-0 z-40 shadow-sm transition-all",
        mode === 'playback' && "hidden lg:flex"
      )}>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-stone-900 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lg:w-6 lg:h-6">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="m10 13 3 2-3 2v-4Z" fill="white" />
            </svg>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm lg:text-base xl:text-lg font-black tracking-tight text-stone-900 leading-none uppercase italic">SceneFlow</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="hidden xl:block text-[10px] text-stone-400 uppercase tracking-widest font-bold">Script-to-Video Sync</p>
              <div className="w-1 h-1 rounded-full bg-stone-200 hidden xl:block" />
              <a 
                href="https://x.com/tarumainfo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[9px] lg:text-[10px] text-stone-500 font-mono hover:underline decoration-stone-400 underline-offset-2"
              >
                <span className="hidden sm:inline xl:hidden">by @tarumainfo</span>
                <span className="hidden xl:inline">by Taruma Sakti</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-1 lg:gap-1.5 mr-1 xl:mr-2">
            <button 
              onClick={() => setResetConfirmation({ isOpen: true, type: 'blank', error: null })}
              title="New Blank Project"
              className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm"
            >
              <Plus size={12} /> <span className="hidden xl:inline">Blank</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                title="Example Library"
                className={cn(
                  "flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border shadow-sm",
                  isLibraryOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white hover:bg-stone-50 text-stone-600 border-stone-200"
                )}
              >
                <Book size={12} /> <span className="hidden xl:inline">Library</span>
                <ChevronDown size={10} className={cn("transition-transform duration-200", isLibraryOpen && "rotate-180")} />
              </button>
              
              {isLibraryOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none" 
                    onClick={() => setIsLibraryOpen(false)} 
                  />
                  <div className="fixed lg:absolute top-1/2 lg:top-full left-1/2 lg:left-auto lg:right-0 -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 lg:translate-y-0 mt-0 lg:mt-2 w-[calc(100%-2rem)] max-w-sm lg:w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 lg:slide-in-from-top-2 duration-200">
                    <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
                      {EXAMPLE_SECTIONS.map((section, sectionIdx) => (
                        <div key={section.label} className={cn(sectionIdx > 0 && "border-t border-stone-100")}>
                          <div className="p-3 bg-stone-50/50">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{section.label}</p>
                          </div>
                          <div className="p-1.5">
                            {section.items.map(example => (
                              <button
                                key={example.id}
                                onClick={() => {
                                  setResetConfirmation({ 
                                    isOpen: true, 
                                    type: 'example', 
                                    examplePath: example.path, 
                                    exampleTitle: example.title,
                                    error: null,
                                  });
                                  setIsLibraryOpen(false);
                                }}
                                className="w-full flex flex-col items-start gap-0.5 p-2.5 hover:bg-stone-50 rounded-xl transition-colors group text-left"
                              >
                                <span className="text-xs font-bold text-stone-900 group-hover:text-stone-900">{example.title}</span>
                                <span className="text-[10px] text-stone-400 font-medium">{example.description}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
              onClick={() => setIsSettingsOpen(true)}
              className={cn(
                "p-2 rounded-lg transition-all border shadow-sm active:scale-95",
                isSettingsOpen ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 hover:text-stone-700 border-stone-200"
              )}
              title="Timing Settings"
            >
              <Settings size={18} />
            </button>
          </div>
          
          <div className="hidden lg:block h-8 w-px bg-stone-200 mx-2" />
          
          <div className="hidden lg:flex gap-1">
            <label className="cursor-pointer flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 rounded-lg transition-all border border-transparent hover:border-stone-200">
              <Upload size={14} /> <span className="hidden xl:inline">Open Sync</span>
              <input type="file" accept=".json" onChange={importJson} className="hidden" />
            </label>
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 px-2 py-1.5 xl:px-2.5 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 rounded-lg transition-all border border-transparent hover:border-stone-200"
            >
              <Download size={14} /> <span className="hidden xl:inline">Save Sync</span>
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
            <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black flex items-center gap-2">
                  <Video size={12} /> YouTube Source
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    player ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                  )} />
                </label>
                {state.youtubeId && extractYoutubeId(state.youtubeId) !== state.youtubeId && (
                  <span className="text-[9px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    ID: {extractYoutubeId(state.youtubeId)}
                  </span>
                )}
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={state.youtubeId}
                  onChange={(e) => setState(prev => ({ ...prev, youtubeId: e.target.value }))}
                  className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-300 transition-all font-mono text-sm"
                  placeholder="Paste YouTube URL or Video ID"
                />
                <Video size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
                {state.youtubeId && (
                  <button 
                    onClick={() => setState(prev => ({ ...prev, youtubeId: '' }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
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
              "aspect-video bg-stone-900 overflow-hidden shadow-2xl ring-1 ring-stone-200 relative group transition-all duration-500 origin-top-left pointer-events-auto",
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
                className="w-full h-full"
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
                          <span className={cn("absolute inset-0 opacity-30 animate-pulse", color.class)} />
                        )}
                        <div className={cn("w-2 h-2 rounded-full shrink-0", isHidden ? "bg-stone-200" : color.class)} />
                        {color.type}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                  {(state.cues || []).filter(isCueVisible).sort((a, b) => {
                    const order = COLORS.map(c => c.type);
                    return order.indexOf(a.type || 'dialogue') - order.indexOf(b.type || 'dialogue');
                  }).map(cue => (
                    <div key={cue.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden">
                      <div className={cn("w-1.5 h-8 rounded-full shrink-0", cue.colorClass)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif italic text-stone-700 line-clamp-2">"{cue.selectedText}"</p>
                        {cue.type && (
                          <span className="absolute top-1 right-2 text-[8px] font-black uppercase tracking-widest text-stone-300">
                            {cue.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
            <section className="animate-in fade-in duration-500 mb-10">
              <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100 shadow-sm">
                    <FileText size={14} className="text-stone-400" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-stone-400 leading-none mb-1">Screenplay Data</h2>
                    <p className="text-[10px] font-bold text-stone-600 leading-none">
                      {state.scriptText.split('\n').length} lines loaded
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsScriptModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm"
                  >
                    <Edit2 size={10} /> Edit Raw
                  </button>
                </div>
              </div>
            </section>
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
                   {(state.cues || []).map(cue => (
                    <div 
                      key={cue.id} 
                      onClick={() => {
                        setNewCue(cue);
                        setSelection({ text: cue.selectedText, start: cue.startIndex, end: cue.endIndex });
                        if (player) player.seekTo(cue.startTime, true);
                      }}
                      className={cn(
                        "flex items-center justify-between p-4 bg-stone-50 border rounded-2xl group hover:bg-white hover:shadow-md transition-all relative overflow-hidden cursor-pointer",
                        newCue.id === cue.id ? "border-stone-900 ring-1 ring-stone-900 bg-white shadow-md" : "border-stone-200"
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn("w-1.5 h-10 rounded-full shrink-0", cue.colorClass)} />
                        <div className="flex flex-col flex-1 min-w-0">
                          {cue.type && (
                            <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md w-fit mb-1", cue.colorClass, "bg-opacity-20 text-stone-600")}>
                              {cue.type}
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
                  ))}
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
              <FileText size={16} className="text-stone-400" />
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-stone-400">Script Preview</span>
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
                    onClick={() => setMode('edit')}
                    className="lg:hidden flex items-center gap-1 px-2 py-1 bg-stone-100 rounded text-[10px] font-bold text-stone-600"
                  >
                    <Edit2 size={10} /> Edit
                  </button>
                </div>
              )}
              <div className={cn(
                "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                mode === 'edit' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
              )}>
                {mode === 'edit' ? 'Edit' : 'Playback'}
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

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Selected Text</p>
                      <p className="text-xs font-mono line-clamp-1 text-stone-600 italic">"{selection.text}"</p>
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
                        {COLORS.map(color => (
                          <button
                            key={color.class}
                            onClick={() => setNewCue(prev => ({ ...prev, colorClass: color.class }))}
                            title={color.type}
                            className={cn(
                              "px-2 py-1 rounded-md transition-all border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                              color.class,
                              newCue.colorClass === color.class 
                                ? "border-stone-900 scale-105 shadow-sm opacity-100" 
                                : "border-transparent opacity-40 hover:opacity-80"
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-stone-900/20" />
                            {color.type}
                          </button>
                        ))}
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
              "max-w-xl mx-auto bg-white shadow-lg ring-1 ring-stone-200 min-h-full rounded-sm relative",
              mode === 'edit' ? "p-6 md:p-8" : "p-8 lg:p-12"
            )}>
              {/* Page punch holes effect - even more subtle */}
              <div className="absolute left-2 top-12 flex flex-col gap-8 opacity-5">
                <div className="w-2 h-2 rounded-full bg-stone-400 shadow-inner" />
                <div className="w-2 h-2 rounded-full bg-stone-400 shadow-inner" />
                <div className="w-2 h-2 rounded-full bg-stone-400 shadow-inner" />
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

      {/* Raw Script Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 lg:p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200">
                    <FileText size={24} className="text-stone-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">Raw Screenplay</h3>
                    <p className="text-xs text-stone-400 uppercase tracking-[0.2em] font-black">Initial Input & Bulk Edit</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsScriptModalOpen(false)}
                  className="p-3 hover:bg-stone-100 rounded-full transition-colors active:scale-90"
                >
                  <X size={24} className="text-stone-400" />
                </button>
              </div>
              
              <textarea
                value={state.scriptText}
                onChange={(e) => setState(prev => ({ ...prev, scriptText: e.target.value }))}
                className="w-full h-96 px-6 py-5 bg-stone-50 border border-stone-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all font-mono text-sm resize-none leading-relaxed"
                placeholder="Paste your screenplay here..."
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsScriptModalOpen(false)}
                  className="px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Raw Cues Modal */}
      {isCuesModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 lg:p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                    <Clock size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-stone-900">Edit Raw Cues</h2>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">JSON Format</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCuesModalOpen(false)}
                  className="p-3 hover:bg-stone-100 rounded-2xl text-stone-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">JSON Data</label>
                <textarea
                  value={rawCuesText}
                  onChange={(e) => setRawCuesText(e.target.value)}
                  className="w-full h-[400px] bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 font-mono text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder='[ { "id": "...", "selectedText": "...", "startTime": 0, "endTime": 10, ... } ]'
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setIsCuesModalOpen(false)}
                  className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRawCues}
                  className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Overlap Picker Menu */}
      {overlapPicker.isOpen && (
        <div 
          className="fixed z-[100] bg-white border border-stone-200 rounded-xl shadow-2xl p-1.5 min-w-[160px] animate-in zoom-in-95 duration-200"
          style={{ left: overlapPicker.position.x, top: overlapPicker.position.y }}
        >
          <div className="px-3 py-2 border-b border-stone-100 mb-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Select Cue to Edit</p>
          </div>
          {overlapPicker.cues.map(cue => (
            <button
              key={cue.id}
              onClick={() => {
                setNewCue(cue);
                setSelection({ text: cue.selectedText, start: cue.startIndex, end: cue.endIndex });
                if (player) player.seekTo(cue.startTime, true);
                setOverlapPicker({ ...overlapPicker, isOpen: false });
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-stone-50 rounded-lg transition-colors text-left group"
            >
              <div className={cn("w-2 h-2 rounded-full", cue.colorClass)} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">{cue.type}</p>
                <p className="text-[9px] text-stone-400 font-mono italic truncate">"{cue.selectedText}"</p>
              </div>
            </button>
          ))}
          <button 
            onClick={() => setOverlapPicker({ ...overlapPicker, isOpen: false })}
            className="w-full mt-1 px-3 py-1.5 text-[10px] font-bold text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all text-center"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200">
            <div className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Delete Sync Cue?</h3>
                <p className="text-sm text-stone-500 mt-2">This action cannot be undone. Are you sure you want to remove this cue?</p>
              </div>
              
              {deleteConfirmation.cue && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Cue Content</p>
                  <p className="text-xs italic text-stone-600 line-clamp-2">"{deleteConfirmation.cue.selectedText}"</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, cue: null })}
                  className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Reset Confirmation Modal */}
      {resetConfirmation.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200">
            <div className="p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                <RefreshCw size={24} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {resetConfirmation.type === 'settings' ? 'Reset Timing Settings?' : 
                   resetConfirmation.type === 'blank' ? 'Load Blank Script?' : 
                   resetConfirmation.type === 'example' ? `Load "${resetConfirmation.exampleTitle}"?` : 
                   resetConfirmation.type === 'remote' ? 'Load Remote Project?' : 'Reset All Data?'}
                </h3>
                <p className="text-sm text-stone-500 mt-2">
                  {resetConfirmation.type === 'settings' ? 'This will restore all timing buffers to their factory default values.' : 
                   resetConfirmation.type === 'blank' ? 'This will delete all current cues and start a fresh project.' : 
                   resetConfirmation.type === 'example' ? `This will replace your current script and cues with the "${resetConfirmation.exampleTitle}" demo.` :
                   resetConfirmation.type === 'remote' ? `This will replace your current project with data from: ${resetConfirmation.remoteUrl}. Only load links from sources you trust.` :
                   'This will delete all cues and restore the original demo script.'}
                </p>

                {resetConfirmation.error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-left animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-red-500">
                        <Info size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Load Error</p>
                        <p className="text-sm text-red-600 leading-relaxed">{resetConfirmation.error}</p>
                      </div>
                      <button 
                        onClick={() => setResetConfirmation(prev => ({ ...prev, error: null }))}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  disabled={isRemoteLoading}
                  onClick={() => setResetConfirmation({ isOpen: false, type: null, error: null })}
                  className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  disabled={isRemoteLoading}
                  onClick={() => {
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
                  className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRemoteLoading && <Loader2 size={16} className="animate-spin" />}
                  {resetConfirmation.error ? 'Try Again' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Timing Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200">
            <div className="p-8 lg:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-900/20">
                    <Settings size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-stone-900">Timing Settings</h2>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Adjust highlight visibility buffers</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 hover:bg-stone-100 rounded-2xl text-stone-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* General Master Control - Highlighted */}
                <div className="md:col-span-3 p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      <span className="text-xs font-black uppercase tracking-widest text-blue-600">General Master Offset</span>
                    </div>
                    <p className="text-[10px] font-bold text-blue-400 italic">Adds extra time to ALL categories globally</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Global Before (s)</label>
                      <input 
                        type="number" step="0.1"
                        value={state.settings?.general?.before ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setState(prev => ({
                            ...prev,
                            settings: { ...prev.settings, general: { ...prev.settings?.general!, before: val } }
                          }));
                        }}
                        className="w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Global After (s)</label>
                      <input 
                        type="number" step="0.1"
                        value={state.settings?.general?.after ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setState(prev => ({
                            ...prev,
                            settings: { ...prev.settings, general: { ...prev.settings?.general!, after: val } }
                          }));
                        }}
                        className="w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Specific Category Grid */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COLORS.map(color => (
                    <div key={color.type} className="p-4 bg-stone-50 border border-stone-100 rounded-2xl space-y-3 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", color.class)} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">{color.type}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-stone-400">Before (s)</label>
                          <input 
                            type="number" step="0.1"
                            value={state.settings?.[color.type]?.before ?? 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setState(prev => ({
                                ...prev,
                                settings: { ...prev.settings, [color.type]: { ...prev.settings?.[color.type]!, before: val } }
                              }));
                            }}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-stone-400">After (s)</label>
                          <input 
                            type="number" step="0.1"
                            value={state.settings?.[color.type]?.after ?? 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setState(prev => ({
                                ...prev,
                                settings: { ...prev.settings, [color.type]: { ...prev.settings?.[color.type]!, after: val } }
                              }));
                            }}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button 
                  onClick={() => setResetConfirmation({ isOpen: true, type: 'settings', error: null })}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={12} /> Reset to Defaults
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
