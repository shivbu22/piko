import React, { useEffect, useState } from 'react';
import { AudioEngine } from '../audio/AudioEngine';

interface WaveformVisualizerProps {
  audioEngine: AudioEngine;
  isRecording: boolean;
  isPaused: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioEngine,
  isRecording,
  isPaused,
}) => {
  const [bars, setBars] = useState<number[]>(new Array(16).fill(0.12));

  useEffect(() => {
    let animId: number;

    const tick = () => {
      const data = audioEngine.getWaveformData();
      setBars(data);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [audioEngine]);

  return (
    <div className="relative flex items-center gap-[3px] h-8 px-2 select-none" title="Live audio input waveform">
      {bars.map((height, i) => {
        const isSpike = height > 0.5;
        const normalizedH = Math.max(4, height * 26);

        // Fluid color gradient
        const barColor = isPaused
          ? 'rgba(157, 163, 174, 0.35)'
          : isSpike
          ? 'linear-gradient(180deg, #FF9E7D 0%, #E07A5F 100%)'
          : 'linear-gradient(180deg, #E07A5F 0%, #C9664E 100%)';

        return (
          <div
            key={i}
            className="relative flex flex-col items-center justify-center w-[3px]"
          >
            {/* Primary Upward Bar */}
            <div
              className="w-full rounded-full transition-all duration-75"
              style={{
                height: `${normalizedH}px`,
                background: barColor,
                boxShadow: isRecording && !isPaused && isSpike ? '0 0 10px rgba(224, 122, 95, 0.7)' : 'none',
                transform: `scaleY(${isPaused ? 0.35 : 1})`,
                transformOrigin: 'center',
              }}
            />

            {/* Subtle Caustic Sub-surface Reflection */}
            <div
              className="w-full rounded-full opacity-20 pointer-events-none mt-[1px]"
              style={{
                height: `${Math.max(2, normalizedH * 0.35)}px`,
                background: barColor,
                filter: 'blur(1px)',
                transform: `scaleY(${isPaused ? 0.2 : 0.6})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
