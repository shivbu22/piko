import React from 'react';
import { UploadCloud, Music } from 'lucide-react';

interface DropZoneOverlayProps {
  isDraggingOver: boolean;
}

export const DropZoneOverlay: React.FC<DropZoneOverlayProps> = ({ isDraggingOver }) => {
  if (!isDraggingOver) return null;

  return (
    <div className="absolute inset-0 bg-accent-coral/20 backdrop-blur-md rounded-[28px] border-2 border-dashed border-accent-coral flex flex-col items-center justify-center z-50 animate-pulse pointer-events-none p-4 text-center">
      <div className="w-12 h-12 rounded-full bg-accent-coral/30 flex items-center justify-center text-white mb-2 shadow-lg shadow-accent-coral/20">
        <UploadCloud className="w-6 h-6 animate-bounce" />
      </div>
      <p className="text-xs font-bold text-white drop-shadow">
        Drop audio or note here!
      </p>
      <p className="text-[10px] text-white/80 mt-0.5 flex items-center gap-1">
        <Music className="w-3 h-3" />
        Pip will transcribe & summarize locally
      </p>
    </div>
  );
};
