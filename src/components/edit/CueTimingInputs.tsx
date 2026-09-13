import React, { memo } from 'react';
import { Clock } from 'lucide-react';

export interface CueTimingInputsProps {
  startTime?: number;
  endTime?: number;
  startIndex?: number;
  endIndex?: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onStartIndexChange: (index: number) => void;
  onEndIndexChange: (index: number) => void;
  onCaptureStartTime: () => void;
  onCaptureEndTime: () => void;
}

export const CueTimingInputs: React.FC<CueTimingInputsProps> = memo(({
  startTime,
  endTime,
  startIndex,
  endIndex,
  onStartTimeChange,
  onEndTimeChange,
  onStartIndexChange,
  onEndIndexChange,
  onCaptureStartTime,
  onCaptureEndTime,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Start Time */}
      <div className="space-y-1">
        <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">Start Time</label>
        <div className="flex gap-1">
          <input 
            type="number"
            step="0.1"
            min="0"
            value={startTime ?? ''}
            onChange={(e) => onStartTimeChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={onCaptureStartTime}
            className="bg-surface-muted hover:bg-surface-hover p-1 rounded-lg text-blue-500 transition-colors"
            title="Capture current player time"
          >
            <Clock size={12} />
          </button>
        </div>
      </div>

      {/* End Time */}
      <div className="space-y-1">
        <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">End Time</label>
        <div className="flex gap-1">
          <input 
            type="number"
            step="0.1"
            min="0"
            value={endTime ?? ''}
            onChange={(e) => onEndTimeChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={onCaptureEndTime}
            className="bg-surface-muted hover:bg-surface-hover p-1 rounded-lg text-blue-500 transition-colors"
            title="Capture current player time"
          >
            <Clock size={12} />
          </button>
        </div>
      </div>

      {/* Start Index */}
      <div className="space-y-1">
        <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">Start Index</label>
        <input 
          type="number"
          min="0"
          value={startIndex ?? ''}
          onChange={(e) => onStartIndexChange(parseInt(e.target.value, 10) || 0)}
          className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* End Index */}
      <div className="space-y-1">
        <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">End Index</label>
        <input 
          type="number"
          min="0"
          value={endIndex ?? ''}
          onChange={(e) => onEndIndexChange(parseInt(e.target.value, 10) || 0)}
          className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
});

CueTimingInputs.displayName = 'CueTimingInputs';
