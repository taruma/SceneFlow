import React, { useState, useEffect, useRef, useMemo } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Edit2, Download, Upload, Plus, Trash2, X, Check, FileText, Video, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
}

interface AppState {
  youtubeId: string;
  scriptText: string;
  cues: Cue[];
}

const DEFAULT_SCRIPT = `INT. COFFEE SHOP - DAY

DAVE (30s, tired) sits at a corner table. He stares at a cold cup of coffee.

DAVE
(to himself)
Why did I come here?

A WAITRESS approaches.

WAITRESS
Refill?

Dave looks up. He slowly lowers his head.

DAVE
No. I'm good.

He stands up and leaves.`;

const COLORS = [
  { name: 'Blue', class: 'bg-blue-400/50', rgb: '96, 165, 250' },
  { name: 'Yellow', class: 'bg-yellow-400/50', rgb: '250, 204, 21' },
  { name: 'Green', class: 'bg-green-400/50', rgb: '74, 222, 128' },
  { name: 'Red', class: 'bg-red-400/50', rgb: '248, 113, 113' },
  { name: 'Purple', class: 'bg-purple-400/50', rgb: '192, 132, 252' },
  { name: 'Gray', class: 'bg-gray-400/50', rgb: '156, 163, 175' },
];

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
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      youtubeId: 'dQw4w9WgXcQ', // Default video
      scriptText: DEFAULT_SCRIPT,
      cues: [],
    };
  });

  const [mode, setMode] = useState<'playback' | 'edit'>('playback');
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isCuesModalOpen, setIsCuesModalOpen] = useState(false);
  const [rawCuesText, setRawCuesText] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [newCue, setNewCue] = useState<Partial<Cue>>({
    colorClass: COLORS[0].class,
  });

  const [isAligning, setIsAligning] = useState(false);
  const [alignSuccess, setAlignSuccess] = useState(false);

  const scriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('screenplay_sync_state', JSON.stringify(state));
  }, [state]);

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

  const onReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 1) { // Playing
      startTimer();
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

  // Handle text selection in Edit Mode
  const handleSelection = () => {
    if (mode !== 'edit') return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      return;
    }

    const text = sel.toString().trim();
    if (!text) return;

    console.log("Selection captured:", text);

    // Normalize text for searching (handle browser-specific whitespace/newlines)
    const fullText = state.scriptText;
    
    // Try exact match first
    let startIndex = fullText.indexOf(text);
    
    // If not found, try matching with normalized whitespace
    if (startIndex === -1) {
      const normalizedSearch = text.replace(/\s+/g, ' ');
      const normalizedFull = fullText.replace(/\s+/g, ' ');
      const normIndex = normalizedFull.indexOf(normalizedSearch);
      
      if (normIndex !== -1) {
        // Find approximate index in original text
        // This is a fallback
        startIndex = fullText.toLowerCase().indexOf(text.toLowerCase());
      }
    }
    
    if (startIndex !== -1) {
      console.log("Text found in script at index:", startIndex);
      setSelection({
        text,
        start: startIndex,
        end: startIndex + text.length,
      });
      setNewCue(prev => ({
        ...prev,
        selectedText: text,
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

    const cue: Cue = {
      id: generateId(),
      selectedText: newCue.selectedText,
      startIndex: newCue.startIndex!,
      endIndex: newCue.endIndex!,
      startTime: newCue.startTime,
      endTime: newCue.endTime,
      colorClass: newCue.colorClass || COLORS[0].class,
    };

    setState(prev => ({
      ...prev,
      cues: [...prev.cues, cue],
    }));
    setSelection(null);
    setNewCue({ colorClass: COLORS[0].class });
    console.log("Cue saved successfully:", cue);
  };

  const deleteCue = (id: string) => {
    setState(prev => ({
      ...prev,
      cues: prev.cues.filter(c => c.id !== id),
    }));
  };

  const realignCues = () => {
    setIsAligning(true);
    
    // Simulate a brief delay for visual feedback
    setTimeout(() => {
      let lastIndex = 0;
      let alignedCount = 0;
      
      const updatedCues = state.cues.map(cue => {
        // 1. Try exact match starting from lastIndex (sequential dialogue)
        let newStart = state.scriptText.indexOf(cue.selectedText, lastIndex);
        
        // 2. If not found, try exact match from beginning
        if (newStart === -1) {
          newStart = state.scriptText.indexOf(cue.selectedText);
        }
        
        // 3. Fallback: Normalized whitespace match
        if (newStart === -1) {
          const normalizedSearch = cue.selectedText.replace(/\s+/g, ' ').toLowerCase();
          const normalizedFull = state.scriptText.replace(/\s+/g, ' ').toLowerCase();
          const normIndex = normalizedFull.indexOf(normalizedSearch);
          
          if (normIndex !== -1) {
            // Find approximate index in original text
            newStart = state.scriptText.toLowerCase().indexOf(cue.selectedText.toLowerCase());
          }
        }
        
        if (newStart !== -1) {
          const newEnd = newStart + cue.selectedText.length;
          lastIndex = newEnd;
          alignedCount++;
          return { ...cue, startIndex: newStart, endIndex: newEnd };
        }
        return cue;
      });
      
      setState(prev => ({ ...prev, cues: updatedCues }));
      setIsAligning(false);
      setAlignSuccess(true);
      setTimeout(() => setAlignSuccess(false), 2000);
      console.log(`Cues realigned: ${alignedCount} of ${state.cues.length} updated.`);
    }, 600);
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
        setState(json);
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
      cuesCount: state.cues.length,
      hasSelection: !!selection,
      currentTime
    });
  }, [mode, state.cues.length, selection, currentTime]);

  // Rendering the screenplay with highlights
  const renderedScript = useMemo(() => {
    const activeCues = state.cues.filter(c => currentTime >= c.startTime - 1 && currentTime <= c.endTime + 2);
    const lines = state.scriptText.split('\n');
    
    let currentPos = 0;
    return lines.map((line, lineIdx) => {
      const lineStart = currentPos;
      const lineEnd = currentPos + line.length;
      currentPos += line.length + 1; // +1 for the newline character

      let className = "mb-1";
      const trimmed = line.trim();
      
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 0) {
        if (trimmed.startsWith('INT.') || trimmed.startsWith('EXT.')) {
          className = "font-bold mt-4 mb-2 uppercase text-stone-900 tracking-tight"; // Scene Heading
        } else {
          className = "text-center mt-3 mb-0.5 uppercase w-full text-stone-900 font-bold tracking-wide"; // Character Name
        }
      } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        className = "text-center italic mb-0.5 text-stone-500 px-8 text-[13px]"; // Parenthetical
      } else if (trimmed.length > 0 && lineIdx > 0 && lines[lineIdx-1].trim() === lines[lineIdx-1].trim().toUpperCase() && lines[lineIdx-1].trim().length > 0) {
        className = "px-8 mb-2 text-stone-800 text-center leading-snug"; // Dialogue
      } else {
        className = "mb-2 text-stone-700 leading-snug"; // Action
      }

      // Find cues that overlap with this line
      const lineCues = activeCues
        .filter(cue => cue.startIndex < lineEnd && cue.endIndex > lineStart)
        .map(cue => {
          const opacity = (() => {
            if (currentTime < cue.startTime) {
              // Fade in: from 0 at startTime-1 to 1 at startTime
              return Math.max(0, Math.min(1, currentTime - (cue.startTime - 1)));
            } else if (currentTime > cue.endTime) {
              // Fade out: from 1 at endTime to 0 at endTime+2
              return Math.max(0, Math.min(1, 1 - (currentTime - cue.endTime) / 2));
            }
            return 1;
          })();
          
          return {
            id: cue.id,
            colorClass: cue.colorClass,
            start: Math.max(0, cue.startIndex - lineStart),
            end: Math.min(line.length, cue.endIndex - lineStart),
            opacity
          };
        });

      // Add temporary selection if in edit mode
      if (mode === 'edit' && selection && selection.start < lineEnd && selection.end > lineStart) {
        lineCues.push({
          id: 'temp-selection',
          colorClass: '',
          start: Math.max(0, selection.start - lineStart),
          end: Math.min(line.length, selection.end - lineStart),
          opacity: 1
        });
      }

      if (lineCues.length === 0) {
        return (
          <div key={lineIdx} className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
            {line}
          </div>
        );
      }

      // Sort and merge overlapping ranges for this line
      // For simplicity, we'll just sort and take the most relevant ones
      lineCues.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

      const segments: React.ReactNode[] = [];
      let lastIdx = 0;

      lineCues.forEach(cue => {
        // Skip if this cue is entirely within a previously processed range
        if (cue.start < lastIdx) {
          if (cue.end > lastIdx) {
            // Partial overlap - we could handle this but for now we skip to avoid broken HTML
            // In a screenplay sync tool, overlapping cues on the same line are rare
          }
          return;
        }

        // Add text before the highlight
        if (cue.start > lastIdx) {
          segments.push(line.substring(lastIdx, cue.start));
        }

        // Add the highlighted span
        const colorInfo = COLORS.find(c => c.class === cue.colorClass);
        const isTemp = cue.id === 'temp-selection';
        const rgb = isTemp ? '191, 219, 254' : (colorInfo?.rgb || '156, 163, 175');
        const opacity = isTemp ? 0.5 : ((cue as any).opacity * 0.5);

        segments.push(
          <span 
            key={cue.id} 
            className={cn(
              "transition-all duration-300 rounded-sm px-0.5 text-stone-900",
              isTemp && "ring-2 ring-blue-400 ring-inset"
            )}
            style={{ backgroundColor: `rgba(${rgb}, ${opacity})` }}
          >
            {line.substring(cue.start, cue.end)}
          </span>
        );
        lastIdx = cue.end;
      });

      // Add remaining text
      if (lastIdx < line.length) {
        segments.push(line.substring(lastIdx));
      }

      return (
        <div key={lineIdx} className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
          {segments}
        </div>
      );
    });
  }, [state.scriptText, state.cues, currentTime, selection, mode]);

  const canSave = newCue.selectedText && newCue.startTime !== undefined && newCue.endTime !== undefined;

  return (
    <div className="flex flex-col h-screen bg-stone-100 text-stone-900 font-sans overflow-hidden selection:bg-blue-100">
      {/* Header */}
      <header className={cn(
        "h-16 border-b border-stone-200 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0 z-40 shadow-sm transition-all",
        mode === 'playback' && "hidden lg:flex"
      )}>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-stone-900 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
            <Video size={16} className="text-white lg:hidden" />
            <Video size={20} className="text-white hidden lg:block" />
          </div>
          <div>
            <h1 className="text-sm lg:text-lg font-bold tracking-tight text-stone-900 leading-none">Screenplay Sync</h1>
            <p className="hidden sm:block text-[9px] lg:text-[10px] text-stone-400 uppercase tracking-widest mt-1">Production Tool v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-xl shadow-inner animate-in fade-in zoom-in duration-500">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Current Time</span>
            <span className="text-lg font-mono font-bold text-white w-16 text-right">{currentTime.toFixed(1)}s</span>
          </div>

          <div className="flex bg-stone-100 p-1 rounded-lg lg:rounded-xl ring-1 ring-stone-200 scale-90 lg:scale-100">
            <button
              onClick={() => setMode('playback')}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                mode === 'playback' ? "bg-white shadow-md text-stone-900" : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Play size={14} className={mode === 'playback' ? "fill-current" : ""} /> Playback
            </button>
            <button
              onClick={() => setMode('edit')}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                mode === 'edit' ? "bg-white shadow-md text-stone-900" : "text-stone-500 hover:text-stone-700"
              )}
            >
              <Edit2 size={14} /> Edit
            </button>
          </div>
          
          <div className="h-8 w-px bg-stone-200 mx-2" />
          
          <div className="flex gap-2">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-200">
              <Upload size={16} /> Import
              <input type="file" accept=".json" onChange={importJson} className="hidden" />
            </label>
            <button
              onClick={exportJson}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-200"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </header>

      <main className={cn(
        "flex flex-1 flex-col lg:flex-row overflow-hidden",
        mode === 'playback' && "overflow-y-auto lg:overflow-hidden"
      )}>
        {/* Left Panel: Media & Controls */}
        <div className={cn(
          "flex flex-col border-stone-200 bg-white transition-all duration-500",
          mode === 'edit' 
            ? "w-full lg:w-1/2 border-r p-4 lg:p-10 gap-6 lg:gap-8 overflow-y-auto" 
            : "w-full lg:w-1/2 border-r p-0 lg:p-10 gap-0 lg:gap-6 lg:overflow-y-auto sticky top-0 z-30 shadow-md lg:shadow-none"
        )}>
          {/* Video Player Section */}
          <section className={cn("space-y-4", mode === 'playback' && "space-y-4 lg:space-y-6")}>
            {mode === 'edit' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
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

            <div className={cn("flex items-center justify-between", mode === 'playback' && "hidden lg:flex", mode === 'edit' && "flex")}>
               <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                <Video size={14} /> {mode === 'edit' ? 'Media Preview' : 'Now Playing'}
              </h2>
            </div>
            
            <div className={cn(
              "aspect-video bg-stone-900 overflow-hidden shadow-2xl ring-1 ring-stone-200 relative group",
              mode === 'edit' ? "rounded-3xl" : "rounded-none lg:rounded-3xl"
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
                    {state.cues.filter(c => currentTime >= c.startTime && currentTime <= c.endTime).length} active
                  </span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                  {state.cues.filter(c => currentTime >= c.startTime && currentTime <= c.endTime).map(cue => (
                    <div key={cue.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className={cn("w-1.5 h-8 rounded-full shrink-0", cue.colorClass)} />
                      <p className="text-sm font-serif italic text-stone-700 line-clamp-2">"{cue.selectedText}"</p>
                    </div>
                  ))}
                  {state.cues.filter(c => currentTime >= c.startTime && currentTime <= c.endTime).length === 0 && (
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
            <section className="animate-in fade-in duration-500">
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
                <button 
                  onClick={() => setIsScriptModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm"
                >
                  <Edit2 size={10} /> Edit Raw
                </button>
              </div>
            </section>
          )}

          {/* Edit Mode Controls - Moved Cue Creation to Right Panel */}
          {mode === 'edit' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Cue List */}
              <div className="space-y-4">
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
                    {state.cues.length > 0 && (
                      <button
                        onClick={realignCues}
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
                    <span className="text-[10px] font-bold text-stone-300 bg-stone-100 px-2 py-0.5 rounded uppercase">{state.cues.length} total</span>
                  </div>
                </div>
                <div className="grid gap-3">
                  {state.cues.map(cue => (
                    <div key={cue.id} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={cn("w-1.5 h-10 rounded-full shrink-0", cue.colorClass)} />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-bold text-stone-800 italic leading-tight break-words">"{cue.selectedText}"</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{cue.startTime.toFixed(1)}s</span>
                            <div className="w-2 h-px bg-stone-200" />
                            <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">{cue.endTime.toFixed(1)}s</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCue(cue.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {state.cues.length === 0 && (
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
          mode === 'edit' ? "w-full lg:w-1/2 h-full" : "w-full lg:w-1/2 flex-1"
        )}>
          <div className={cn(
            "h-16 border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0 z-20",
            mode === 'playback' ? "h-12 lg:hidden sticky top-0 shadow-sm" : "h-16"
          )}>
            <div className="flex items-center gap-2 lg:gap-3">
              <FileText size={16} className="text-stone-400" />
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-stone-400">Script Preview</span>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              {mode === 'playback' && (
                <button 
                  onClick={() => setMode('edit')}
                  className="lg:hidden flex items-center gap-1 px-2 py-1 bg-stone-100 rounded text-[10px] font-bold text-stone-600"
                >
                  <Edit2 size={10} /> Edit
                </button>
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
                        <Plus size={16} className="text-blue-500" />
                        <h3 className="text-sm font-bold text-stone-800">New Sync Cue</h3>
                      </div>
                      <button 
                        onClick={() => {
                          setSelection(null);
                          setNewCue({ colorClass: COLORS[0].class });
                        }}
                        className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-600 underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Selected Text</p>
                      <p className="text-xs font-mono line-clamp-1 text-stone-600 italic">"{selection.text}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Start Time</label>
                        <div className="flex gap-1">
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            value={newCue.startTime ?? ''}
                            onChange={(e) => setNewCue(prev => ({ ...prev, startTime: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-stone-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setNewCue(prev => ({ ...prev, startTime: player?.getCurrentTime() || 0 }))}
                            className="bg-stone-100 hover:bg-stone-200 p-1.5 rounded-lg text-blue-500 transition-colors"
                          >
                            <Clock size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">End Time</label>
                        <div className="flex gap-1">
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            value={newCue.endTime ?? ''}
                            onChange={(e) => setNewCue(prev => ({ ...prev, endTime: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-stone-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setNewCue(prev => ({ ...prev, endTime: player?.getCurrentTime() || 0 }))}
                            className="bg-stone-100 hover:bg-stone-200 p-1.5 rounded-lg text-blue-500 transition-colors"
                          >
                            <Clock size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1.5">
                        {COLORS.map(color => (
                          <button
                            key={color.class}
                            onClick={() => setNewCue(prev => ({ ...prev, colorClass: color.class }))}
                            className={cn(
                              "w-5 h-5 rounded-full transition-all border-2",
                              color.class,
                              newCue.colorClass === color.class ? "border-stone-900 scale-110" : "border-transparent opacity-40 hover:opacity-100"
                            )}
                          />
                        ))}
                      </div>
                      <button
                        onClick={saveCue}
                        disabled={!canSave}
                        className={cn(
                          "px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2",
                          canSave 
                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" 
                            : "bg-stone-100 text-stone-300 cursor-not-allowed"
                        )}
                      >
                        <Check size={14} /> Save Cue
                      </button>
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
              "flex-1 overflow-y-auto font-serif text-[14px] leading-snug scroll-smooth scrollbar-hide",
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
              
              <div className="relative z-10">
                {renderedScript}
              </div>
            </div>
          </div>
        </div>
      </main>

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
    </div>
  );
}
