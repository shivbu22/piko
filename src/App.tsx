import React, { useEffect, useState } from 'react';
import { NotchShell } from './components/NotchShell';

export const App: React.FC = () => {
  const [isElectron, setIsElectron] = useState<boolean>(false);

  useEffect(() => {
    // Detect if running inside Electron desktop shell
    const electron =
      typeof window !== 'undefined' &&
      (Boolean((window as any).desktopAPI) ||
        (window as any).process?.type === 'renderer' ||
        navigator.userAgent.toLowerCase().includes('electron'));
    setIsElectron(electron);
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col items-center select-none font-sans overflow-hidden transition-colors ${
        isElectron ? 'bg-transparent' : 'bg-[#08090C]'
      }`}
    >
      {/* Pure Spatial Notch HUD — Zero big dashboard, zero extra chrome */}
      <NotchShell />
    </div>
  );
};
