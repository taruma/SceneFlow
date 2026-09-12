import React, { memo } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  getLineClass, 
  getScriptThemeStyles, 
  getScriptTheme, 
  getCueColorForTheme,
  type ScriptThemeId,
  type CuePaletteProfile
} from '../../lib/scriptStyles';
import { calculateCuePlaybackOpacity, isCueActive } from '../../lib/cueUtils';
import type { ProcessedLine } from '../../lib/scriptProcessor';
import type { StagingBlock } from '../../lib/scriptParser';
import type { Cue, TimingSettings } from '../../types/script';

export interface ScriptLineProps {
  lineData: ProcessedLine;
  cues: Cue[];
  mode: 'edit' | 'playback';
  currentTime: number;
  settings?: Record<string, TimingSettings>;
  hiddenCueTypes: Set<string>;
  scriptThemeId: ScriptThemeId;
  cuePaletteProfile: CuePaletteProfile;
  playerState: number;
  isDesktop: boolean;
  selection?: { start: number; end: number; text: string } | null;
  editingCueId?: string;
  onSelectStaging: (block: StagingBlock) => void;
  onSelectCue: (cue: Cue) => void;
  onOverlapPicker: (cues: Cue[], pos: { x: number; y: number }) => void;
}

/**
 * Pure helper to format brief segments (waterfall indents & bold anchors).
 */
function formatBriefSegment(text: string, isLineStart = false): React.ReactNode {
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
  let match: RegExpExecArray | null;
  
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
}

function ScriptLineComponent({
  lineData,
  cues,
  mode,
  currentTime,
  settings,
  hiddenCueTypes,
  scriptThemeId,
  cuePaletteProfile,
  playerState,
  isDesktop,
  selection,
  editingCueId,
  onSelectStaging,
  onSelectCue,
  onOverlapPicker,
}: ScriptLineProps) {
  const { text: line, type, lineIdx, lineStart, lineEnd, isStaging, stagingMarker } = lineData;
  const trimmed = line.trim();
  const themeStyles = getScriptThemeStyles(scriptThemeId);

  // Staging badge marker node
  const stagingNode = stagingMarker ? (
    <div key={`staging-${lineIdx}`} className={themeStyles.stagingContainer}>
      {stagingMarker.blocks.map((block, bIdx) => (
        <button
          key={bIdx}
          onClick={() => {
            if (playerState !== 1) {
              onSelectStaging(block);
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
  ) : null;

  // If this line is part of a staging block, only render the staging container (if any)
  if (isStaging) {
    return stagingNode;
  }

  // Handle special structural elements
  if (type === 'separator') {
    return (
      <>
        {stagingNode}
        <hr className={themeStyles.separator} />
      </>
    );
  }

  if (type === 'part-separator' || type === 'roman-title') {
    return (
      <>
        {stagingNode}
        <div
          data-line-start={lineStart}
          data-line-end={lineEnd}
          data-line-idx={lineIdx}
          className={themeStyles.titleContainer}
        >
          <div className={themeStyles.titleLine} />
          <span className={themeStyles.titleText}>{trimmed}</span>
          <div className={themeStyles.titleLine} />
        </div>
      </>
    );
  }

  const className = getLineClass(lineData, scriptThemeId);

  const isCueVisible = (c: Cue) => {
    if (hiddenCueTypes.has(c.type || 'dialogue')) return false;
    return isCueActive(c, currentTime, settings);
  };

  // Filter cues for visibility and compute opacities
  const lineCues = (mode === 'edit' ? cues : cues.filter(isCueVisible)).map(cue => {
    let opacity = 1;
    if (mode === 'playback') {
      opacity = calculateCuePlaybackOpacity(cue, currentTime, settings);
    } else {
      // In edit mode, non-active cues are faded but visible
      const isActive = currentTime >= cue.startTime && currentTime <= cue.endTime;
      const isEditing = editingCueId === cue.id;
      opacity = isEditing ? 1 : (isActive ? 0.8 : 0.4);
    }

    return {
      ...cue,
      start: Math.max(0, cue.startIndex - lineStart),
      end: Math.min(line.length, cue.endIndex - lineStart),
      opacity,
    };
  });

  // Add temporary selection in edit mode
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
      opacity: 1,
    } as any);
  }

  if (lineCues.length === 0) {
    const displayValue = type === 'name' ? trimmed.slice(0, -1) : line;
    const finalDisplayValue = lineData.isBrief ? formatBriefSegment(displayValue, true) : displayValue;

    return (
      <>
        {stagingNode}
        <div
          data-line-start={lineStart}
          data-line-end={lineEnd}
          data-line-idx={lineIdx}
          className={cn("whitespace-pre-wrap min-h-[1em]", className)}
        >
          {finalDisplayValue}
        </div>
      </>
    );
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

    const isTemp = segmentCues.some(c => c.id === 'temp-selection');
    const editingCue = segmentCues.find(c => c.id === editingCueId);
    const primaryCue = editingCue || segmentCues[0];

    const activeTheme = getScriptTheme(scriptThemeId);
    const themedColor = getCueColorForTheme(primaryCue.type || primaryCue.colorClass || '', scriptThemeId, cuePaletteProfile);

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
            onSelectCue(actualCues[0]);
          } else if (actualCues.length > 1) {
            onOverlapPicker(
              actualCues as Cue[],
              { x: e.clientX, y: e.clientY }
            );
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
          transition: mode === 'playback' && !isTemp ? 'background-color 100ms linear, box-shadow 100ms linear' : 'none',
          ...(activeTheme.isDark && finalOpacity > 0.08 ? {
            boxShadow: primaryCue.type === 'dialogue'
              ? `0 0 0 1px rgba(253, 224, 71, 0.45), 0 0 6px rgba(253, 224, 71, 0.18)`
              : `0 0 1px rgba(${rgb}, 0.6)`
          } : {})
        }}
      >
        {finalDisplayValue}
        {segmentCues.length > 1 && mode === 'edit' && !isTemp && (
          <span
            className="absolute -top-1 -right-1 w-2 h-2 bg-stone-900 rounded-full border border-white shadow-sm z-20"
            title="Multiple cues overlap here"
          />
        )}
      </span>
    );
  }

  return (
    <>
      {stagingNode}
      <div
        data-line-start={lineStart}
        data-line-end={lineEnd}
        data-line-idx={lineIdx}
        className={cn("whitespace-pre-wrap min-h-[1em]", className)}
      >
        {segments.length > 0 ? segments : (type === 'name' ? trimmed.slice(0, -1) : line)}
      </div>
    </>
  );
}

function areScriptLinePropsEqual(prev: ScriptLineProps, next: ScriptLineProps): boolean {
  if (
    prev.lineData !== next.lineData ||
    prev.cues !== next.cues ||
    prev.mode !== next.mode ||
    prev.hiddenCueTypes !== next.hiddenCueTypes ||
    prev.scriptThemeId !== next.scriptThemeId ||
    prev.cuePaletteProfile !== next.cuePaletteProfile ||
    prev.isDesktop !== next.isDesktop ||
    prev.settings !== next.settings
  ) {
    return false;
  }

  // Staging button disabled state depends on playerState (disabled when 1)
  if (prev.lineData.stagingMarker && (prev.playerState === 1) !== (next.playerState === 1)) {
    return false;
  }

  // Edit mode checks
  if (next.mode === 'edit') {
    if (prev.playerState !== next.playerState) return false;
    if (prev.editingCueId !== next.editingCueId) return false;

    const { lineStart, lineEnd } = next.lineData;
    const prevOverlaps = Boolean(prev.selection && prev.selection.start < lineEnd && prev.selection.end > lineStart);
    const nextOverlaps = Boolean(next.selection && next.selection.start < lineEnd && next.selection.end > lineStart);
    if (prevOverlaps !== nextOverlaps) return false;
    if (nextOverlaps) {
      if (
        prev.selection?.start !== next.selection?.start ||
        prev.selection?.end !== next.selection?.end ||
        prev.selection?.text !== next.selection?.text
      ) {
        return false;
      }
    }
  }

  // If this line has NO overlapping cues, currentTime never affects it
  if (next.cues.length === 0) {
    return true;
  }

  if (prev.currentTime === next.currentTime) {
    return true;
  }

  // Check if any cue on this line had an active state or opacity change
  const prevTime = prev.currentTime;
  const nextTime = next.currentTime;

  for (let i = 0; i < next.cues.length; i++) {
    const cue = next.cues[i];

    if (next.mode === 'edit') {
      const wasActive = prevTime >= cue.startTime && prevTime <= cue.endTime;
      const isActive = nextTime >= cue.startTime && nextTime <= cue.endTime;
      if (wasActive !== isActive) return false;
    } else {
      const wasActive = isCueActive(cue, prevTime, prev.settings);
      const isActive = isCueActive(cue, nextTime, next.settings);
      if (wasActive !== isActive) return false;

      // If either active, check opacity delta
      if (wasActive || isActive) {
        const prevOpacity = calculateCuePlaybackOpacity(cue, prevTime, prev.settings);
        const nextOpacity = calculateCuePlaybackOpacity(cue, nextTime, next.settings);
        if (Math.abs(prevOpacity - nextOpacity) > 0.005) return false;
      }
    }
  }

  return true;
}

export const ScriptLine = memo(ScriptLineComponent, areScriptLinePropsEqual);
