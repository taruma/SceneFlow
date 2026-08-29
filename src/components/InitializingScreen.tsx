import React from 'react';
import { Loader2 } from 'lucide-react';

export function InitializingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-app gap-6">
      <img 
        src="/SCENEFLOW_TAG_B.png" 
        alt="SceneFlow Logo" 
        referrerPolicy="no-referrer"
        className="logo-light h-12 lg:h-16 w-auto object-contain animate-pulse selection:bg-transparent pointer-events-none"
      />
      <img 
        src="/SCENEFLOW_TAG_WHITE.png" 
        alt="SceneFlow Logo" 
        referrerPolicy="no-referrer"
        className="logo-dark h-12 lg:h-16 w-auto object-contain animate-pulse selection:bg-transparent pointer-events-none"
      />
      <div className="flex items-center gap-2 text-text-faint">
        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
        <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest font-bold">Initializing System...</p>
      </div>
    </div>
  );
}
