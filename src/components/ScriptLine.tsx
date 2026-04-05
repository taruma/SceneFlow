
import React from 'react';
import { cn } from '../lib/utils';
import { ScriptCue } from '../types/script';

interface ScriptLineProps {
  line: string;
  lineStart: number;
  lineEnd: number;
  cues: ScriptCue[];
  isCueVisible: (cue: any) => boolean;
  mode: 'playback' | 'edit';
  currentTime: number;
  settings?: any;
  newCueId?: string;
  selection?: { start: number; end: number; text: string } | null;
  onCueClick?: (cues: ScriptCue[], event: React.MouseEvent) => void;
  className?: string;
  isName?: boolean;
}

export const ScriptLine: React.FC<ScriptLineProps> = ({
  line,
  lineStart,
  lineEnd,
  cues,
  isCueVisible,
  mode,
  currentTime,
  settings,
  newCueId,
  selection,
  onCueClick,
  className,
  isName
}) => {
  const COLORS = [
    { type: 'dialogue', rgb: '250, 204, 21' },
    { type: 'action', rgb: '96, 165, 250' },
    { type: 'camera', rgb: '74, 222, 128' },
    { type: 'shot', rgb: '192, 132, 252' },
    { type: 'audio', rgb: '251, 146, 60' },
    { type: 'vfx', rgb: '34, 211, 238' },
    { type: 'transition', rgb: '244, 114, 182' },
    { type: 'environment', rgb: '148, 163, 184' },
  ];

  const DEFAULT_SETTINGS = { before: 0, after: 0 };

  // Filter cues that overlap with this line
  const lineCues = (mode === 'edit' ? cues : cues.filter(isCueVisible))
    .filter(cue => cue.startIndex < lineEnd && cue.endIndex > lineStart)
    .map(cue => {
      let opacity = 1;
      if (mode === 'playback') {
        const typeSettings = settings?.[cue.type || ''] || DEFAULT_SETTINGS;
        const generalSettings = settings?.['general'] || DEFAULT_SETTINGS;
        const totalBefore = (typeSettings.before || 0) + (generalSettings.before || 0);
        const totalAfter = (typeSettings.after || 0) + (generalSettings.after || 0);

        if (currentTime < cue.startTime) {
          opacity = totalBefore > 0 ? Math.max(0, Math.min(1, (currentTime - (cue.startTime - totalBefore)) / totalBefore)) : 1;
        } else if (currentTime > cue.endTime) {
          opacity = totalAfter > 0 ? Math.max(0, Math.min(1, 1 - (currentTime - cue.endTime) / totalAfter)) : 1;
        }
      } else {
        const isActive = currentTime >= cue.startTime && currentTime <= cue.endTime;
        const isEditing = newCueId === cue.id;
        opacity = isEditing ? 1 : (isActive ? 0.8 : 0.4);
      }
      
      return {
        ...cue,
        start: Math.max(0, cue.startIndex - lineStart),
        end: Math.min(line.length, cue.endIndex - lineStart),
        opacity
      };
    });

  // Add temporary selection
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
    return (
      <div className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
        {isName ? line.trim().replace(/:$/, '') : line}
      </div>
    );
  }

  // Split line into segments
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
    const displayValue = (isName && end === line.length) 
      ? segmentText.replace(/:$/, '') 
      : segmentText;
    const segmentCues = lineCues.filter(c => c.start <= start && c.end >= end);

    if (segmentCues.length === 0) {
      segments.push(displayValue);
      continue;
    }

    const isTemp = segmentCues.some(c => c.id === 'temp-selection');
    const editingCue = segmentCues.find(c => c.id === newCueId);
    const primaryCue = editingCue || segmentCues[0];
    
    const colorInfo = COLORS.find(c => 
      c.type === primaryCue.type || 
      (primaryCue.colorClass && c.type === primaryCue.type)
    );
    
    const rgb = isTemp ? '191, 219, 254' : (colorInfo?.rgb || '156, 163, 175');
    const maxOpacity = Math.max(...segmentCues.map(c => (c as any).opacity || 0));
    const finalOpacity = isTemp ? 0.5 : maxOpacity * 0.5;

    const scrollCue = segmentCues.find(c => c.type === 'dialogue' && c.startIndex === lineStart + start);
    const idToUse = scrollCue ? `cue-${scrollCue.id}` : (primaryCue.id ? `cue-${primaryCue.id}` : undefined);

    segments.push(
      <span 
        key={`${start}`}
        id={idToUse}
        onClick={(e) => {
          if (mode !== 'edit' || isTemp || !onCueClick) return;
          e.stopPropagation();
          onCueClick(segmentCues.filter(c => c.id !== 'temp-selection') as ScriptCue[], e);
        }}
        className={cn(
          "transition-all duration-300 rounded-sm px-0.5 text-stone-900 relative group",
          mode === 'edit' && !isTemp && "cursor-pointer hover:ring-1 hover:ring-stone-400",
          isTemp && "ring-2 ring-blue-400 ring-inset",
          editingCue && "ring-2 ring-stone-900 ring-inset z-10 shadow-sm"
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

  return (
    <div className={cn("whitespace-pre-wrap min-h-[1em]", className)}>
      {segments}
    </div>
  );
};
