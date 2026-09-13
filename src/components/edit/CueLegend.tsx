import React, { memo } from 'react';
import { COLORS } from '../../constants/script';
import { useScriptTheme } from '../../hooks/useScriptTheme';
import { CuePaletteProfile } from '../../styles';
import { UI_TOKENS } from '../../styles/tokens/ui';

export interface CueLegendProps {
  scriptThemeId: string;
  cuePaletteProfile?: CuePaletteProfile;
}

export const CueLegend: React.FC<CueLegendProps> = memo(({
  scriptThemeId,
  cuePaletteProfile = 'standard',
}) => {
  const { resolveCueColor } = useScriptTheme(scriptThemeId as any, cuePaletteProfile);

  return (
    <div className={UI_TOKENS.panel.legendContainer}>
      {COLORS.map(color => {
        const themed = resolveCueColor(color.type);
        return (
          <div key={color.type} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full shadow-2xs shrink-0" 
              style={{ backgroundColor: themed.dotColor }}
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-text-faint">
              {color.type}
            </span>
          </div>
        );
      })}
    </div>
  );
});

CueLegend.displayName = 'CueLegend';
