import React, { memo } from 'react';
import { Clock } from 'lucide-react';
import { formatPrecisionTimecode } from '../../lib/utils';

export interface CueTimingInputsProps {
  startTime?: number;
  endTime?: number;
  startIndex?: number;
  endIndex?: number;
  onStartTimeChange: (time: number | undefined) => void;
  onEndTimeChange: (time: number | undefined) => void;
  onStartIndexChange: (index: number | undefined) => void;
  onEndIndexChange: (index: number | undefined) => void;
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
        <div className="flex items-center justify-between">
          <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">Start Time</label>
          {startTime !== undefined && !isNaN(startTime) && (
            <span className="text-[9px] font-mono font-bold text-blue-500">{formatPrecisionTimecode(startTime)}</span>
          )}
        </div>
        <div className="flex gap-1">
          <input 
            type="number"
            step="0.1"
            min="0"
            value={startTime !== undefined ? startTime : ''}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === '') {
                onStartTimeChange(undefined);
              } else {
                const parsed = parseFloat(raw);
                onStartTimeChange(isNaN(parsed) ? undefined : parsed);
              }
            }}
            placeholder="0.0"
            className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-border-main transition-colors"
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
        <div className="flex items-center justify-between">
          <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">End Time</label>
          {endTime !== undefined && !isNaN(endTime) && (
            <span className="text-[9px] font-mono font-bold text-blue-500">{formatPrecisionTimecode(endTime)}</span>
          )}
        </div>
        <div className="flex gap-1">
          <input 
            type="number"
            step="0.1"
            min="0"
            value={endTime !== undefined ? endTime : ''}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === '') {
                onEndTimeChange(undefined);
              } else {
                const parsed = parseFloat(raw);
                onEndTimeChange(isNaN(parsed) ? undefined : parsed);
              }
            }}
            placeholder="0.0"
            className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-border-main transition-colors"
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
          value={startIndex !== undefined ? startIndex : ''}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === '') {
              onStartIndexChange(undefined);
            } else {
              const parsed = parseInt(raw, 10);
              onStartIndexChange(isNaN(parsed) ? undefined : Math.max(0, parsed));
            }
          }}
          placeholder="0"
          className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-border-main transition-colors"
        />
      </div>

      {/* End Index */}
      <div className="space-y-1">
        <label className="text-[8px] uppercase tracking-widest text-text-faint font-black">End Index</label>
        <input 
          type="number"
          min="0"
          value={endIndex !== undefined ? endIndex : ''}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === '') {
              onEndIndexChange(undefined);
            } else {
              const parsed = parseInt(raw, 10);
              onEndIndexChange(isNaN(parsed) ? undefined : Math.max(0, parsed));
            }
          }}
          placeholder="0"
          className="w-full bg-surface border border-border-main rounded-lg px-1.5 py-1 text-text-main font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-border-main transition-colors"
        />
      </div>
    </div>
  );
});

CueTimingInputs.displayName = 'CueTimingInputs';
