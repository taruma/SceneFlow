import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Video, Activity, Layers, Filter } from 'lucide-react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { ActiveHighlightsPanelProps, HighlightViewMode, TimelineZoomPreset, TimelineHeightMode } from './types';
import { HighlightFilterBar } from './HighlightFilterBar';
import { HighlightTimelineView } from './views/HighlightTimelineView';
import { HighlightCardsView } from './views/HighlightCardsView';

const STORAGE_KEY = 'sceneflow_highlight_view_mode';
const FILTER_STORAGE_KEY = 'sceneflow_highlight_filter_expanded';
const ZOOM_STORAGE_KEY = 'sceneflow_timeline_zoom_preset';
const HEIGHT_STORAGE_KEY = 'sceneflow_timeline_height_mode';

/**
 * Top-level Active Highlights Panel orchestrator.
 *
 * Features:
 * - Segmented view mode switcher: [ 📊 Timeline | 🗂 Cards (Legacy) ] with persistent localStorage memory.
 * - Timeline track height mode switcher [ Flex | Fixed ] with persistent localStorage memory.
 * - Timeline window zoom presets [ 4s | 8s | 16s ] to the left of filters (in Timeline mode).
 * - Live category filter bar with theme-resolved color pips and active pulse effects.
 * - Zero-layout-shift Multi-Track Sync Timeline (default modern view).
 * - Preserved Classic Cards list (legacy view).
 */
export const ActiveHighlightsPanel: React.FC<ActiveHighlightsPanelProps> = ({
  cues,
  settings,
  isCueVisible,
  activeCueTypes,
  hiddenCueTypes,
  toggleCueTypeVisibility,
  scriptThemeId,
  cuePaletteProfile = 'standard',
  currentTime = 0,
  isPlaying = false,
  onSeekTo,
  onSeekCue,
  viewMode: controlledMode,
  onViewModeChange,
  onCueClick,
  density,
  zoomPreset: controlledZoom,
  onZoomPresetChange,
  heightMode: controlledHeightMode,
  onHeightModeChange,
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);

  // Persistent track height mode state (default to 'flexible')
  const [internalHeightMode, setInternalHeightMode] = useState<TimelineHeightMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(HEIGHT_STORAGE_KEY);
      if (saved === 'fixed' || saved === 'flexible') return saved as TimelineHeightMode;
    }
    return 'flexible';
  });

  // Persistent zoom preset state (default to '8s')
  const [internalZoom, setInternalZoom] = useState<TimelineZoomPreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ZOOM_STORAGE_KEY);
      if (saved === '4s' || saved === '8s' || saved === '16s') return saved as TimelineZoomPreset;
    }
    return '8s';
  });

  // Persistent view mode state (default to 'timeline')
  const [internalMode, setInternalMode] = useState<HighlightViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'timeline' || saved === 'cards') return saved;
    }
    return 'timeline';
  });

  // Persistent filter bar visibility state (default to collapsed for optimal vertical space)
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FILTER_STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  const toggleFilterExpanded = () => {
    setIsFilterExpanded(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(FILTER_STORAGE_KEY, String(next));
      }
      return next;
    });
  };

  const activeMode = controlledMode || internalMode;
  const activeZoom = controlledZoom || internalZoom;
  const activeHeightMode = controlledHeightMode || internalHeightMode;

  const handleModeSwitch = (newMode: HighlightViewMode) => {
    setInternalMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    onViewModeChange?.(newMode);
  };

  const handleZoomPresetChange = (preset: TimelineZoomPreset) => {
    setInternalZoom(preset);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ZOOM_STORAGE_KEY, preset);
    }
    onZoomPresetChange?.(preset);
  };

  const handleHeightModeChange = (mode: TimelineHeightMode) => {
    setInternalHeightMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(HEIGHT_STORAGE_KEY, mode);
    }
    onHeightModeChange?.(mode);
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState<boolean>(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < 560);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Memoize visible cues for counter and legacy cards view
  const visibleCues = useMemo(() => {
    const filtered = (cues || []).filter(isCueVisible);
    const categoryOrder = COLORS.map(c => c.type);

    return [...filtered].sort((a, b) => {
      const orderA = categoryOrder.indexOf(a.type || 'dialogue');
      const orderB = categoryOrder.indexOf(b.type || 'dialogue');
      return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
    });
  }, [cues, isCueVisible]);

  // Modular Control Elements
  const activeCountBadge = (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-xs select-none transition-all duration-200 shrink-0",
        visibleCues.length > 0
          ? "bg-surface-subtle border-border-main text-text-muted"
          : "bg-surface-subtle/60 border-border-subtle text-text-faint"
      )}
      title={
        visibleCues.length > 0
          ? `${visibleCues.length} active cue${visibleCues.length === 1 ? '' : 's'} across active categories`
          : 'No active cues at current timestamp'
      }
    >
      <span className="text-[9px] font-black tracking-wider uppercase leading-none flex items-center gap-1">
        <span>Active:</span>
        <span className="font-mono tabular-nums inline-block min-w-[12px] text-center font-bold text-text-main">
          {visibleCues.length}
        </span>
      </span>

      {/* Fixed 8-Slot Category LED Indicator Strip */}
      <div className="flex items-center gap-1 pl-1 border-l border-border-subtle">
        {COLORS.map(color => {
          const isMuted = hiddenCueTypes.has(color.type);
          const isActive = !isMuted && activeCueTypes.has(color.type);
          const themed = resolveCueColor(color.type);

          return (
            <span
              key={color.type}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200 shrink-0",
                isActive
                  ? "ring-1 ring-black/15 dark:ring-white/25 scale-110 shadow-xs"
                  : isMuted
                  ? "bg-border-subtle/40 opacity-25"
                  : "bg-border-main/60 opacity-40 hover:opacity-75"
              )}
              style={{
                backgroundColor: isActive ? `rgb(${themed.rgb})` : undefined,
              }}
              title={
                isMuted
                  ? `${color.type.toUpperCase()} (Muted in filters)`
                  : isActive
                  ? `${color.type.toUpperCase()} (Active now)`
                  : `${color.type.toUpperCase()} (Inactive)`
              }
            />
          );
        })}
      </div>
    </div>
  );

  const trackHeightControl = (
    <div 
      className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs"
      title="Track height mode: Flex (dynamic height) or Fixed (pre-allocated height)"
    >
      {(['flexible', 'fixed'] as const).map(mode => (
        <button
          key={mode}
          type="button"
          onClick={() => handleHeightModeChange(mode)}
          title={mode === 'fixed' 
            ? "Fixed height: Lock tracks to maximum possible cue overlaps (zero layout shift)" 
            : "Flexible height: Expand tracks dynamically only when overlapping cues are visible"
          }
          className={cn(
            "px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded transition-all select-none border",
            activeHeightMode === mode
              ? "bg-surface text-text-main border-border-main shadow-xs"
              : "text-text-muted hover:text-text-main border-transparent"
          )}
        >
          {mode === 'flexible' ? 'Flex' : 'Fixed'}
        </button>
      ))}
    </div>
  );

  const zoomControl = (
    <div 
      className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs"
      title="Timeline visible window duration"
    >
      {(['4s', '8s', '16s'] as const).map(preset => (
        <button
          key={preset}
          type="button"
          onClick={() => handleZoomPresetChange(preset)}
          title={`Zoom: ${preset} window`}
          className={cn(
            "px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded transition-all select-none border",
            activeZoom === preset
              ? "bg-surface text-text-main border-border-main shadow-xs"
              : "text-text-muted hover:text-text-main border-transparent"
          )}
        >
          {preset}
        </button>
      ))}
    </div>
  );

  const filterToggleControl = (
    <button
      type="button"
      onClick={toggleFilterExpanded}
      title={isFilterExpanded ? "Hide category filters" : "Show category filters"}
      aria-expanded={isFilterExpanded}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all select-none border shadow-xs",
        isFilterExpanded
          ? "bg-surface text-text-main border-border-main"
          : "bg-surface-subtle hover:bg-surface text-text-muted hover:text-text-main border-border-subtle hover:border-border-main"
      )}
    >
      <Filter size={10} className={hiddenCueTypes.size > 0 ? "text-blue-500" : ""} />
      <span className="leading-none hidden sm:inline">Filters</span>
      {hiddenCueTypes.size > 0 && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"
          title={`${hiddenCueTypes.size} category filter${hiddenCueTypes.size === 1 ? '' : 's'} muted`}
        />
      )}
    </button>
  );

  const viewModeControl = (
    <div className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs shrink-0">
      <button
        type="button"
        onClick={() => handleModeSwitch('timeline')}
        title="Multi-Track Sync Timeline"
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none border",
          activeMode === 'timeline'
            ? "bg-surface text-text-main border-border-main shadow-xs"
            : "text-text-muted hover:text-text-main border-transparent"
        )}
      >
        <Activity size={10} className="shrink-0" />
        <span className="leading-none hidden sm:inline">Timeline</span>
      </button>
      <button
        type="button"
        onClick={() => handleModeSwitch('cards')}
        title="Classic Cards (Legacy)"
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none border",
          activeMode === 'cards'
            ? "bg-surface text-text-main border-border-main shadow-xs"
            : "text-text-muted hover:text-text-main border-transparent"
        )}
      >
        <Layers size={10} className="shrink-0" />
        <span className="leading-none hidden sm:inline">Cards</span>
      </button>
    </div>
  );

  return (
    <div ref={panelRef} className="hidden lg:flex flex-col flex-1 mt-1 animate-in fade-in slide-in-from-left-4 duration-500 min-h-0">
      {/* Adaptive Header: Single unified row when wide (>= 560px), Two-tier when narrow (< 560px) */}
      {!isNarrow ? (
        /* Wide Mode: Single unified row */
        <div className="flex items-center justify-between mb-2.5 gap-2 animate-in fade-in duration-200">
          {/* Left: Section Title + Live Active Count & Colored Cue Dots */}
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-1.5 shrink-0")}>
              <Video size={14} className="text-text-muted shrink-0" />
              <span className="truncate">Highlights</span>
            </h3>

            {/* Active Count Badge with Studio VU Meter */}
            {activeCountBadge}
          </div>

          {/* Right: Height Mode (Timeline) + Zoom Presets (Timeline) + Filter Toggle + Segmented View Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {activeMode === 'timeline' && trackHeightControl}
            {activeMode === 'timeline' && zoomControl}
            {filterToggleControl}
            {viewModeControl}
          </div>
        </div>
      ) : (
        /* Narrow Mode (< 560px): Two-Tier Layout */
        <div className="space-y-2 mb-2 animate-in fade-in duration-200">
          {/* Tier 1: Section Title + Active Count + View Mode Switcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-1.5 shrink-0")}>
                <Video size={14} className="text-text-muted shrink-0" />
                <span className="truncate">Highlights</span>
              </h3>
              {activeCountBadge}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeMode === 'cards' && filterToggleControl}
              {viewModeControl}
            </div>
          </div>

          {/* Tier 2: Timeline Sub-Toolbar (Zoom on left, Height Mode & Filters on right) */}
          {activeMode === 'timeline' && (
            <div className="flex items-center justify-between px-0.5 gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-faint select-none shrink-0">
                  Zoom:
                </span>
                {zoomControl}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {trackHeightControl}
                {filterToggleControl}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Category Legend & Filter Controls */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isFilterExpanded
            ? "max-h-32 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <HighlightFilterBar
          activeCueTypes={activeCueTypes}
          hiddenCueTypes={hiddenCueTypes}
          onToggleCueType={toggleCueTypeVisibility}
          resolveCueColor={resolveCueColor}
        />
      </div>

      {/* View Presentation Switcher */}
      {activeMode === 'timeline' ? (
        <HighlightTimelineView
          currentTime={currentTime}
          isPlaying={isPlaying}
          cues={cues}
          settings={settings}
          hiddenCueTypes={hiddenCueTypes}
          resolveCueColor={resolveCueColor}
          onSeekCue={onSeekCue || onCueClick}
          onSeekTo={onSeekTo}
          density={density}
          onToggleCueType={toggleCueTypeVisibility}
          zoomPreset={activeZoom}
          heightMode={activeHeightMode}
        />
      ) : (
        <HighlightCardsView
          visibleCues={visibleCues}
          resolveCueColor={resolveCueColor}
          onCueClick={onSeekCue || onCueClick}
        />
      )}
    </div>
  );
};
