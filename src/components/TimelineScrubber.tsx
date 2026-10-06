// Nook — Interactive Visual Waveform Timeline Scrubber
// Synchronized audio playback, Pip mascot motion along the timeline, and speaker diarization talk-time

import React, { useState, useEffect, useRef } from 'react';
import { ActionItem, TranscriptSegment } from '../types';
import { sounds } from '../audio/SoundEffects';
import { PipCanvas } from '../mascot/PipCanvas';
import { storage } from '../storage/StorageEngine';
import { MascotSpecies } from '../mascot/characters';
import { 
  Play, 
  Pause, 
  Bookmark, 
  Clock, 
  SkipBack, 
  SkipForward, 
  User,
  Zap,
  Target,
  Brain,
  Users
} from 'lucide-react';

interface TimelineScrubberProps {
  durationSeconds: number;
  transcripts: TranscriptSegment[];
  actionItems: ActionItem[];
  equippedSpecies?: MascotSpecies;
  equippedOutfitId?: string;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  durationSeconds = 1800,
  transcripts = [],
  actionItems = [],
  equippedSpecies,
  equippedOutfitId,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(12);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const timerRef = useRef<number | null>(null);

  const activeSpecies = equippedSpecies || (storage.getEquippedSpecies() as MascotSpecies) || 'pip';
  const activeOutfit = equippedOutfitId || storage.getEquippedOutfit() || 'default';

  const safeDuration = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 60;
  const maxDuration = Math.max(safeDuration, 60);
  const progressPercent = Number.isFinite(currentTime) && maxDuration > 0
    ? Math.min(100, Math.max(0, (currentTime / maxDuration) * 100))
    : 0;

  // Playback timer ticker
  useEffect(() => {
    if (isPlaying) {
      const safeRate = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1.0;
      const intervalMs = Math.floor(1000 / safeRate);
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= maxDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackRate, maxDuration]);

  const togglePlay = () => {
    sounds.playPop();
    setIsPlaying(!isPlaying);
  };

  const skipSeconds = (delta: number) => {
    sounds.playPop();
    setCurrentTime((prev) => Math.max(0, Math.min(maxDuration, prev + delta)));
  };

  const cycleSpeed = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
    sounds.playPop();
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Find active transcript turn at current scrub time
  const currentMs = currentTime * 1000;
  const activeSegment = transcripts.find((t) => {
    return currentMs >= t.startMs && currentMs <= t.endMs + 3000;
  }) || transcripts[0];

  // Speaker Diarization Talk-Time Computation
  const speakerStats = React.useMemo(() => {
    if (!transcripts || transcripts.length === 0) return [];
    const map = new Map<string, { name: string; totalMs: number; count: number }>();
    let totalTime = 0;

    transcripts.forEach((t) => {
      const dur = Math.max(1500, (t.endMs || 0) - (t.startMs || 0));
      totalTime += dur;
      const existing = map.get(t.speakerName) || { name: t.speakerName, totalMs: 0, count: 0 };
      existing.totalMs += dur;
      existing.count += 1;
      map.set(t.speakerName, existing);
    });

    const colors = ['#E07A5F', '#52B788', '#4EA8DE', '#9D4EDD', '#F4A261'];
    return Array.from(map.values()).map((s, idx) => ({
      ...s,
      percentage: totalTime > 0 ? Math.round((s.totalMs / totalTime) * 100) : 0,
      color: colors[idx % colors.length],
    }));
  }, [transcripts]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-notch-inset rounded-2xl border border-white/5">
      {/* Top Header & Scrub Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Skip Back 10s */}
          <button
            onClick={() => skipSeconds(-10)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white flex items-center justify-center transition-colors active:scale-95"
            title="Skip back 10 seconds"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-accent-coral hover:bg-accent-coral-active text-white flex items-center justify-center transition-colors active:scale-95 shadow-sm"
            title={isPlaying ? 'Pause Audio' : 'Play Audio Simulation'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip Forward 10s */}
          <button
            onClick={() => skipSeconds(10)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white flex items-center justify-center transition-colors active:scale-95"
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Digital Timer */}
          <span className="text-xs font-mono font-bold text-text-primary ml-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent-coral" />
            {formatTime(currentTime)} <span className="text-text-tertiary">/ {formatTime(maxDuration)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono font-bold text-text-secondary hover:text-white transition-colors border border-white/5 active:scale-95"
            title="Toggle playback speed"
          >
            {playbackRate}x
          </button>

          <span className="text-[10px] font-mono text-text-tertiary px-2 py-0.5 rounded bg-black/30 border border-white/5">
            {actionItems.length} Pins
          </span>
        </div>
      </div>

      {/* Scrubbable Dynamic Waveform Track with Mascot Moving Along */}
      <div className="relative pt-6 pb-2">
        {/* Pip Mascot Moving Along the Timeline Playhead */}
        <div
          className="absolute top-0 -translate-x-1/2 z-40 transition-all duration-150 pointer-events-none flex flex-col items-center"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="transform hover:scale-125 transition-transform drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            <PipCanvas
              species={activeSpecies}
              reaction={isPlaying ? 'listening' : 'idle'}
              outfitId={activeOutfit}
              size={26}
            />
          </div>
          <div className="w-1.5 h-1 bg-accent-coral rounded-full mt-[-2px]" />
        </div>

        <div
          className="relative w-full h-14 bg-black/50 rounded-xl overflow-hidden cursor-pointer select-none border border-white/10 group hover:border-accent-coral/30 transition-colors"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (rect.width > 0) {
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              setCurrentTime(Math.floor(ratio * maxDuration));
              sounds.playPop();
            }
          }}
        >
          {/* Synthetic audio waveform bars */}
          <div className="absolute inset-0 flex items-center justify-between px-2 gap-[1.5px]">
            {Array.from({ length: 64 }).map((_, i) => {
              const h = Math.abs(Math.sin(i * 0.28) * 55 + Math.cos(i * 0.55) * 35) + 15;
              const isPassed = (i / 64) * 100 <= progressPercent;
              return (
                <div
                  key={i}
                  className="w-1 rounded-full transition-colors duration-100"
                  style={{
                    height: `${Math.min(95, Math.max(12, h))}%`,
                    backgroundColor: isPassed
                      ? 'rgba(224, 122, 95, 0.9)'
                      : 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              );
            })}
          </div>

          {/* Intelligent Highlight Pin Indicators */}
          {transcripts.filter((t) => t.highlightType).map((t, idx) => {
            const pinSec = Number.isFinite(t.startMs) ? Math.max(0, t.startMs / 1000) : 0;
            const pinPercent = maxDuration > 0
              ? Math.min(94, Math.max(6, (pinSec / maxDuration) * 100))
              : 6;
            const isCritical = t.highlightType === 'critical';
            const isNecessary = t.highlightType === 'necessary';
            const isRemembered = t.highlightType === 'remembered';

            return (
              <div
                key={t.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTime(Math.floor(pinSec));
                  sounds.playPop();
                }}
                className="absolute top-1 -translate-x-1/2 z-20 group/pin p-1 cursor-pointer"
                style={{ left: `${pinPercent}%` }}
                title={`${t.highlightCategory || 'Highlight'}: ${t.text}`}
              >
                {isCritical ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white text-[8px] flex items-center justify-center text-white font-bold shadow-[0_0_8px_rgba(244,63,94,0.9)] group-hover/pin:scale-125 transition-transform">
                    ⚡
                  </div>
                ) : isNecessary ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white text-[8px] flex items-center justify-center text-white font-bold shadow-[0_0_8px_rgba(245,158,11,0.9)] group-hover/pin:scale-125 transition-transform">
                    🎯
                  </div>
                ) : isRemembered ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-white text-[8px] flex items-center justify-center text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.9)] group-hover/pin:scale-125 transition-transform">
                    🧠
                  </div>
                ) : (
                  <Bookmark className="w-3 h-3 text-accent-coral fill-accent-coral drop-shadow-md group-hover/pin:scale-125 transition-transform" />
                )}
              </div>
            );
          })}

          {/* Playhead line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-30 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Speaker Diarization & Talk-Time Distribution Bar */}
      {speakerStats.length > 0 && (
        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-text-secondary flex items-center gap-1.5 font-semibold">
              <Users className="w-3.5 h-3.5 text-accent-coral" />
              Speaker Diarization & Talk Time
            </span>
            <span className="text-[10px] text-text-tertiary font-mono">
              {speakerStats.length} speakers identified
            </span>
          </div>

          {/* Proportional Segmented Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
            {speakerStats.map((s, idx) => (
              <div
                key={idx}
                style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                className="h-full transition-all"
                title={`${s.name}: ${s.percentage}%`}
              />
            ))}
          </div>

          {/* Speaker Percentage Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {speakerStats.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1 text-[10px] font-mono">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-white font-medium">{s.name}:</span>
                <span className="text-text-secondary font-bold">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synchronized Speaker Turn Card with Highlight Tagging */}
      {activeSegment && (
        <div
          className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
            activeSegment.highlightType === 'critical'
              ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              : activeSegment.highlightType === 'necessary'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : activeSegment.highlightType === 'remembered'
              ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
              : 'bg-black/40 border-white/5'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-accent-coral/20 border border-accent-coral/30 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-3.5 h-3.5 text-accent-coral" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-white truncate">
                  {activeSegment.speakerName}
                </span>
                {activeSegment.highlightType === 'critical' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold border border-rose-500/30">
                    <Zap className="w-2.5 h-2.5" />
                    ⚡ Critical Part
                  </span>
                )}
                {activeSegment.highlightType === 'necessary' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
                    <Target className="w-2.5 h-2.5" />
                    🎯 Necessary Action
                  </span>
                )}
                {activeSegment.highlightType === 'remembered' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold border border-indigo-500/30">
                    <Brain className="w-2.5 h-2.5" />
                    🧠 Remembered Memory
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-text-tertiary">
                {formatTime(activeSegment.startMs / 1000)}
              </span>
            </div>
            <p
              className={`text-xs leading-snug italic line-clamp-2 ${
                activeSegment.highlightType ? 'text-white font-medium not-italic' : 'text-text-secondary'
              }`}
            >
              "{activeSegment.text}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
