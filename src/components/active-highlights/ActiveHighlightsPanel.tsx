import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Activity, Layers, Filter, UnfoldVertical, FoldVertical } from 'lucide-react';
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
 * - Timeline track height mode toggle [ ↕ Fixed | ↕ Flex ] with persistent localStorage memory.
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
  const [isCompactTitle, setIsCompactTitle] = useState<boolean>(false);
  const [isCompactControls, setIsCompactControls] = useState<boolean>(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setIsCompactTitle(width < 610);
        setIsCompactControls(width < 490);
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
    <button
      type="button"
      onClick={() => handleHeightModeChange(activeHeightMode === 'fixed' ? 'flexible' : 'fixed')}
      title={
        activeHeightMode === 'fixed'
          ? "Track Height: Fixed (locking tracks to max overlaps for zero layout shift). Click for flexible."
          : "Track Height: Flexible (dynamic expansion based on visible cues). Click for fixed."
      }
      aria-label={`Toggle track height mode: currently ${activeHeightMode}`}
      className={cn(
        "flex items-center gap-1 px-1.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all select-none border shadow-xs active:scale-95 shrink-0",
        activeHeightMode === 'fixed'
          ? "bg-surface text-text-main border-border-main"
          : "bg-surface-subtle hover:bg-surface text-text-muted hover:text-text-main border-border-subtle hover:border-border-main"
      )}
    >
      {activeHeightMode === 'fixed' ? (
        <UnfoldVertical size={11} className="shrink-0 text-blue-500" />
      ) : (
        <FoldVertical size={11} className="shrink-0 text-text-muted" />
      )}
      {!isCompactTitle && (
        <span className="leading-none">{activeHeightMode === 'fixed' ? 'Fixed' : 'Flex'}</span>
      )}
    </button>
  );

  const zoomControl = (
    <div 
      className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs shrink-0"
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
        "flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all select-none border shadow-xs shrink-0 active:scale-95",
        isFilterExpanded
          ? "bg-surface text-text-main border-border-main"
          : "bg-surface-subtle hover:bg-surface text-text-muted hover:text-text-main border-border-subtle hover:border-border-main"
      )}
    >
      <Filter size={10} className={hiddenCueTypes.size > 0 ? "text-blue-500" : ""} />
      {!isCompactControls && (
        <span className="leading-none">Filters</span>
      )}
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
          "flex items-center gap-1 px-1.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none border",
          activeMode === 'timeline'
            ? "bg-surface text-text-main border-border-main shadow-xs"
            : "text-text-muted hover:text-text-main border-transparent"
        )}
      >
        <Activity size={10} className="shrink-0" />
        {!isCompactControls && (
          <span className="leading-none">Timeline</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => handleModeSwitch('cards')}
        title="Classic Cards (Legacy)"
        className={cn(
          "flex items-center gap-1 px-1.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all select-none border",
          activeMode === 'cards'
            ? "bg-surface text-text-main border-border-main shadow-xs"
            : "text-text-muted hover:text-text-main border-transparent"
        )}
      >
        <Layers size={10} className="shrink-0" />
        {!isCompactControls && (
          <span className="leading-none">Cards</span>
        )}
      </button>
    </div>
  );

  return (
    <div ref={panelRef} className="hidden lg:flex flex-col flex-1 mt-1 min-h-0">
      {/* Highlights Header: Always a single unified row (Stepped adaptive labels) */}
      <div className="flex items-center justify-between mb-2.5 gap-1.5 sm:gap-2 animate-in fade-in duration-200 min-w-0">
        {/* Left: Section Title (Icon + optional label) + Preserved Live Active Count & Colored Cue Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0">
          <div 
            className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-1.5 shrink-0")}
            title="Highlights & Cue Timeline"
          >
            <Sparkles size={13} className="text-text-muted shrink-0" />
            {!isCompactTitle && (
              <span className="truncate">Highlights</span>
            )}
          </div>

          {/* Active Count Badge with Studio VU Meter (Preserved) */}
          {activeCountBadge}
        </div>

        {/* Right: Height Mode (Timeline) + Zoom Presets (Timeline) + Filter Toggle + Segmented View Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {activeMode === 'timeline' && trackHeightControl}
          {activeMode === 'timeline' && zoomControl}
          {filterToggleControl}
          {viewModeControl}
        </div>
      </div>

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
