import React, { useState, useMemo, useEffect } from 'react';
import { Video, Activity, Layers, Filter } from 'lucide-react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { cn } from '../../lib/utils';
import { UI_TOKENS } from '../../styles/tokens/ui';
import { ActiveHighlightsPanelProps, HighlightViewMode, TimelineZoomPreset } from './types';
import { HighlightFilterBar } from './HighlightFilterBar';
import { HighlightTimelineView } from './views/HighlightTimelineView';
import { HighlightCardsView } from './views/HighlightCardsView';

const STORAGE_KEY = 'sceneflow_highlight_view_mode';
const FILTER_STORAGE_KEY = 'sceneflow_highlight_filter_expanded';
const ZOOM_STORAGE_KEY = 'sceneflow_timeline_zoom_preset';

/**
 * Top-level Active Highlights Panel orchestrator.
 *
 * Features:
 * - Segmented view mode switcher: [ 📊 Timeline | 🗂 Cards (Legacy) ] with persistent localStorage memory.
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
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any);

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

  return (
    <div className="hidden lg:flex flex-col flex-1 mt-1 animate-in fade-in slide-in-from-left-4 duration-500 min-h-0">
      {/* Panel Header, View Switcher, Filter Toggle & Counter */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        {/* Left: Section Title + Live Active Count & Colored Cue Dots */}
        <div className="flex items-center gap-2 min-w-0">
          <h3 className={cn(UI_TOKENS.layout.sectionTitle, "flex items-center gap-2 shrink-0")}>
            <Video size={14} /> Active Highlights
          </h3>

          {/* Active Count Badge with Studio VU Meter (Fixed-slot Category Pips) */}
          <div
            className={cn(
              "flex items-center gap-2 px-2.5 py-1 rounded-lg border shadow-xs select-none transition-all duration-200",
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
              <span className="font-mono tabular-nums inline-block min-w-[14px] text-center">
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
        </div>

        {/* Right: Zoom Presets (Timeline mode) + Filter Toggle + Segmented View Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Timeline Zoom Presets Switcher (Visible only in timeline mode, immediately to the left of filters) */}
          {activeMode === 'timeline' && (
            <div 
              className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs animate-in fade-in duration-200"
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
          )}

          {/* Category Filter Pill Bar Toggle Button */}
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

          {/* Segmented View Switcher */}
          <div className="flex items-center p-0.5 bg-surface-subtle border border-border-subtle rounded-lg shadow-xs">
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
              <Activity size={10} />
              <span className="leading-none">Timeline</span>
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
              <Layers size={10} />
              <span className="leading-none">Cards</span>
            </button>
          </div>
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
