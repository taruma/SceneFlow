import React, { memo } from 'react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { CuePaletteProfile } from '../../styles';
import { cn } from '../../lib/utils';

export interface CueTypeSelectorProps {
  selectedType?: string;
  selectedColorClass?: string;
  onSelectType: (type: string, colorClass: string) => void;
  scriptThemeId?: string;
  cuePaletteProfile?: CuePaletteProfile;
}

export const CueTypeSelector: React.FC<CueTypeSelectorProps> = memo(({
  selectedType,
  selectedColorClass,
  onSelectType,
  scriptThemeId,
  cuePaletteProfile = 'standard',
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);

  return (
    <div className="flex flex-wrap gap-1.5">
      {COLORS.map(color => {
        const themed = resolveCueColor(color.type);
        const isSelected = selectedType ? selectedType === color.type : selectedColorClass === color.class;

        return (
          <button
            key={color.class}
            type="button"
            onClick={() => onSelectType(color.type, color.class)}
            title={color.type}
            className={cn(
              "px-2 py-1 rounded-md transition-all border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
              isSelected 
                ? "border-btn-primary-bg scale-105 shadow-sm opacity-100 bg-surface font-bold ring-1 ring-btn-primary-bg text-text-main" 
                : "border-border-main bg-surface-subtle opacity-70 hover:opacity-100 hover:bg-surface text-text-body"
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
  );
});

CueTypeSelector.displayName = 'CueTypeSelector';
