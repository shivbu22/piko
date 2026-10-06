import React, { useState, useEffect, useRef } from 'react';
import { NotchState, PipReaction, Meeting, TranscriptSegment, MeetingTemplateId } from '../types';
import { PipCanvas } from '../mascot/PipCanvas';
import { WaveformVisualizer } from './WaveformVisualizer';
import { FullDrawer } from './FullDrawer';
import { ChatFlyout } from './ChatFlyout';
import { MascotStudio } from './MascotStudio';
import { MascotSpecies, MASCOT_ROSTER } from '../mascot/characters';
import { DropZoneOverlay } from './DropZoneOverlay';
import { SettingsModal } from './SettingsModal';
import { AudioEngine } from '../audio/AudioEngine';
import { OllamaEngine } from '../ai/OllamaEngine';
import { storage } from '../storage/StorageEngine';
import { sounds } from '../audio/SoundEffects';
import { wakeWord } from '../audio/WakeWordEngine';
import { classifySegment } from '../ai/SegmentClassifier';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  Square, 
  Pause, 
  Play, 
  MessageSquare, 
  ChevronDown, 
  Shirt, 
  Moon, 
  Sun,
  X,
  Settings,
  Sparkles,
  Plus
} from 'lucide-react';

interface NotchShellProps {
  onNotify?: (message: string) => void;
}

export const NotchShell: React.FC<NotchShellProps> = () => {
  const [notchState, setNotchState] = useState<NotchState>('compact');
  const [pipReaction, setPipReaction] = useState<PipReaction>('idle');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [latestTokens, setLatestTokens] = useState<string>('Listening to meeting audio...');
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [currentTranscripts, setCurrentTranscripts] = useState<TranscriptSegment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [showOutfitPicker, setShowOutfitPicker] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showQuickNoteInput, setShowQuickNoteInput] = useState<boolean>(false);
  const [quickNoteText, setQuickNoteText] = useState<string>('');
  const [equippedSpecies, setEquippedSpecies] = useState<MascotSpecies>(
    (storage.getEquippedSpecies() as MascotSpecies) || 'pip'
  );
  const [equippedOutfit, setEquippedOutfit] = useState<string>(storage.getEquippedOutfit());
  const [activeTemplate, setActiveTemplate] = useState<MeetingTemplateId>('general');
  const [isPipTalking, setIsPipTalking] = useState<boolean>(false);
  const [isHardwareNotch, setIsHardwareNotch] = useState<boolean>(true);

  const audioEngineRef = useRef<AudioEngine>(new AudioEngine());
  const ollamaEngineRef = useRef<OllamaEngine>(new OllamaEngine());
  const timerIntervalRef = useRef<number | null>(null);

  // Gesture Tracking Ref
  const pointerGestureRef = useRef<{ startY: number; startX: number; timer: number | null }>({
    startY: 0,
    startX: 0,
    timer: null,
  });

  // Initialize from storage or default meeting
  useEffect(() => {
    const meetings = storage.getMeetings();
    if (meetings.length > 0) {
      setActiveMeeting(meetings[0]);
    }
  }, []);

  // Ambient Wake-Word Engine & Offline Voice Command Listener
  useEffect(() => {
    const unsubscribe = wakeWord.onCommand((cmd) => {
      sounds.playWakeWord();
      if (cmd === 'start-meeting') {
        if (!isRecording) toggleRecord();
      } else if (cmd === 'summarize') {
        if (isRecording) stopAndSummarize();
      } else if (cmd === 'action-items' || cmd === 'open-notes') {
        setNotchState('drawer');
      } else if (cmd === 'focus') {
        setNotchState('focus');
      } else {
        setPipReaction('listening');
        setNotchState('chat');
      }
    });

    const settings = storage.getSettings();
    if (settings.wakeWordEnabled !== false) {
      wakeWord.startListening();
    }

    return () => {
      unsubscribe();
      wakeWord.stopListening();
    };
  }, [isRecording]);

  // Global hotkeys handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQuickNoteInput) {
          setShowQuickNoteInput(false);
          return;
        }
        if (showSettings) {
          setShowSettings(false);
          return;
        }
        if (showOutfitPicker) {
          setShowOutfitPicker(false);
          return;
        }
        if (notchState === 'drawer' || notchState === 'chat') {
          sounds.playPop();
          setNotchState('compact');
        } else if (notchState === 'compact') {
          sounds.playPop();
          setNotchState('collapsed');
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        toggleRecord();
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        sounds.playPop();
        setNotchState((prev) => (prev === 'drawer' ? 'compact' : 'drawer'));
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        sounds.playPop();
        setNotchState((prev) => (prev === 'chat' ? 'compact' : 'chat'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notchState, isRecording, showSettings, showOutfitPicker, showQuickNoteInput]);

  // Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const toggleRecord = async () => {
    if (!isRecording) {
      // Pause ambient wake-word listening to avoid microphone hardware contention
      wakeWord.stopListening();

      sounds.playRecordStart();
      setIsRecording(true);
      setIsPaused(false);
      setShowQuickNoteInput(false);
      setQuickNoteText('');
      setElapsedSec(0);
      setPipReaction('listening');
      setNotchState('recording');
      setCurrentTranscripts([]);
      setLatestTokens('Listening... Speak into your microphone');

      await audioEngineRef.current.startRecording(
        (segment) => {
          setCurrentTranscripts((prev) => [...prev, segment]);
          setLatestTokens(
            segment.highlightCategory
              ? `${segment.highlightCategory}: "${segment.text}"`
              : segment.text
          );
          if (segment.highlightType === 'critical') {
            setPipReaction('alert');
            setTimeout(() => setPipReaction('listening'), 1200);
          } else if (segment.highlightType === 'necessary') {
            setPipReaction('thinking');
            setTimeout(() => setPipReaction('listening'), 1000);
          } else if (segment.highlightType === 'remembered') {
            setPipReaction('celebrating');
            setTimeout(() => setPipReaction('listening'), 1000);
          }
        },
        (volume) => {
          if (volume > 0.6) {
            setPipReaction('alert');
            setTimeout(() => setPipReaction('listening'), 800);
          }
        },
        (interimText) => {
          if (interimText) {
            setLatestTokens(interimText);
          }
        }
      );
    } else {
      sounds.playRecordStop();
      stopAndSummarize();
    }
  };

  const stopAndSummarize = async () => {
    audioEngineRef.current.stopRecording();
    setIsRecording(false);
    setIsPaused(false);
    setShowQuickNoteInput(false);
    setPipReaction('thinking');
    setLatestTokens('Synthesizing notes from live audio...');

    const newMeetingId = `mtg-${Date.now()}`;
    const normalizedTranscripts: TranscriptSegment[] = currentTranscripts.map((t) => ({
      ...t,
      meetingId: newMeetingId,
    }));

    const synthesis = await ollamaEngineRef.current.summarizeMeeting(
      newMeetingId,
      activeTemplate,
      normalizedTranscripts
    );

    const newMeeting: Meeting = {
      id: newMeetingId,
      title: synthesis.title,
      templateType: activeTemplate,
      startedAt: Date.now() - (elapsedSec || 1) * 1000,
      endedAt: Date.now(),
      durationSeconds: Math.max(1, elapsedSec),
      executiveSummary: synthesis.executiveSummary,
      keyDecisions: synthesis.keyDecisions,
      criticalPoints: synthesis.criticalPoints,
      actionItems: synthesis.actionItems,
      rememberedParts: synthesis.rememberedParts,
      transcripts: normalizedTranscripts,
      sentimentScore: 0.95,
      tags: synthesis.tags,
    };

    storage.saveMeeting(newMeeting);
    setActiveMeeting(newMeeting);
    setNotchState('drawer');
    setPipReaction('celebrating');
    sounds.playChime();

    // Resume wake-word engine if enabled in settings
    const settings = storage.getSettings();
    if (settings.wakeWordEnabled !== false) {
      wakeWord.startListening();
    }

    confetti({
      particleCount: 36,
      spread: 70,
      origin: { y: 0.12 },
      colors: ['#F5E6D3', '#F2C4A8', '#E07A5F', '#34C759'],
    });

    setTimeout(() => {
      setPipReaction('idle');
    }, 2800);
  };

  const handleToggleActionItem = (meetingId: string, itemId: string) => {
    const newState = storage.toggleActionItem(meetingId, itemId);
    if (activeMeeting) {
      const updated = {
        ...activeMeeting,
        actionItems: (activeMeeting.actionItems || []).map((a) =>
          a.id === itemId ? { ...a, completed: newState } : a
        ),
      };
      setActiveMeeting(updated);
    }
    if (newState) {
      setPipReaction('celebrating');
      setTimeout(() => setPipReaction('idle'), 2200);
    }
  };

  const handleSelectOutfit = (outfitId: string) => {
    sounds.playPop();
    setEquippedOutfit(outfitId);
    storage.setEquippedOutfit(outfitId);
    setPipReaction('celebrating');
    setTimeout(() => setPipReaction('idle'), 1800);
  };

  const handleSelectSpecies = (speciesId: MascotSpecies) => {
    sounds.playPop();
    setEquippedSpecies(speciesId);
    storage.setEquippedSpecies(speciesId);
    setPipReaction('celebrating');
    setTimeout(() => setPipReaction('idle'), 1800);
  };

  // Global window event listeners (enables menu bar and desktop dock triggers)
  useEffect(() => {
    const onToggleRecord = () => { toggleRecord(); };
    const onToggleDrawer = () => {
      sounds.playPop();
      setShowSettings(false);
      setShowOutfitPicker(false);
      setNotchState((prev) => (prev === 'drawer' ? 'compact' : 'drawer'));
    };
    const onToggleChat = () => {
      sounds.playPop();
      setShowSettings(false);
      setShowOutfitPicker(false);
      setNotchState((prev) => (prev === 'chat' ? 'compact' : 'chat'));
    };
    const onOpenSettings = () => {
      sounds.playPop();
      setNotchState('drawer');
      setShowOutfitPicker(false);
      setShowSettings(true);
    };
    const onOpenOutfits = () => {
      sounds.playPop();
      setNotchState('drawer');
      setShowSettings(false);
      setShowOutfitPicker(true);
    };
    const onBoopPip = () => {
      sounds.playChime();
      setPipReaction('celebrating');
      setTimeout(() => setPipReaction('idle'), 1600);
    };
    const onToggleFocus = () => {
      sounds.playPop();
      setNotchState((prev) => (prev === 'focus' ? 'compact' : 'focus'));
    };
    const onToggleHardware = () => {
      sounds.playPop();
      setIsHardwareNotch((prev) => !prev);
    };
    const onCollapse = () => {
      sounds.playPop();
      setNotchState('compact');
      setShowSettings(false);
      setShowOutfitPicker(false);
    };

    window.addEventListener('nook:toggle-record', onToggleRecord);
    window.addEventListener('nook:toggle-drawer', onToggleDrawer);
    window.addEventListener('nook:toggle-chat', onToggleChat);
    window.addEventListener('nook:open-settings', onOpenSettings);
    window.addEventListener('nook:open-outfits', onOpenOutfits);
    window.addEventListener('nook:boop-pip', onBoopPip);
    window.addEventListener('nook:toggle-focus', onToggleFocus);
    window.addEventListener('nook:toggle-hardware', onToggleHardware);
    window.addEventListener('nook:collapse', onCollapse);

    return () => {
      window.removeEventListener('nook:toggle-record', onToggleRecord);
      window.removeEventListener('nook:toggle-drawer', onToggleDrawer);
      window.removeEventListener('nook:toggle-chat', onToggleChat);
      window.removeEventListener('nook:open-settings', onOpenSettings);
      window.removeEventListener('nook:open-outfits', onOpenOutfits);
      window.removeEventListener('nook:boop-pip', onBoopPip);
      window.removeEventListener('nook:toggle-focus', onToggleFocus);
      window.removeEventListener('nook:toggle-hardware', onToggleHardware);
      window.removeEventListener('nook:collapse', onCollapse);
    };
  }, [isRecording, isPaused]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      sounds.playRecordStart();
      const file = files[0];
      setNotchState('recording');
      setLatestTokens(`Ingesting file: ${file.name}...`);
      setPipReaction('busy');

      try {
        if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.vtt')) {
          const content = await file.text();
          const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
          const segments: TranscriptSegment[] = lines.slice(0, 30).map((line, idx) => {
            const classification = classifySegment(line);
            return {
              id: `seg-file-${Date.now()}-${idx}`,
              meetingId: 'current',
              speaker: 'remote',
              speakerName: 'Document Source',
              startMs: idx * 2500,
              endMs: (idx + 1) * 2500,
              text: line,
              highlightType: classification.highlightType,
              highlightCategory: classification.highlightCategory,
            };
          });
          setCurrentTranscripts(segments);
          setLatestTokens(`Loaded ${segments.length} lines from ${file.name}`);
        } else {
          audioEngineRef.current.injectRealSegment(`[Ingested media asset: ${file.name}]`, 'File System');
        }
      } catch (err) {
        console.warn('File ingestion error:', err);
      }

      setTimeout(() => {
        stopAndSummarize();
      }, 1500);
    }
  };

  // Dynamic Island vs Hardware Notch Geometry Helpers
  const getShellGeometryStyle = (state: NotchState, isHardware: boolean): React.CSSProperties => {
    if (!isHardware) {
      switch (state) {
        case 'collapsed':
          return { width: '160px', height: '36px' };
        case 'compact':
          return { width: '380px', height: '48px' };
        case 'recording':
          return { width: 'min(92vw, 520px)', height: '56px' };
        case 'focus':
          return { width: '144px', height: '34px' };
        case 'drawer':
          return { width: 'min(92vw, 700px)', maxWidth: 'min(92vw, 700px)', maxHeight: 'min(86vh, 580px)', height: 'auto' };
        case 'chat':
          return { width: 'min(90vw, 540px)', maxWidth: 'min(90vw, 540px)', maxHeight: 'min(82vh, 520px)', height: 'auto' };
        default:
          return { width: '380px', height: '48px' };
      }
    } else {
      switch (state) {
        case 'collapsed':
          return { width: '160px', height: '34px' };
        case 'compact':
          return { width: '368px', height: '46px' };
        case 'recording':
          return { width: 'min(92vw, 500px)', height: '54px' };
        case 'focus':
          return { width: '140px', height: '32px' };
        case 'drawer':
          return { width: 'min(92vw, 700px)', maxWidth: 'min(92vw, 700px)', maxHeight: 'min(86vh, 580px)', height: 'auto' };
        case 'chat':
          return { width: 'min(90vw, 532px)', maxWidth: 'min(90vw, 532px)', maxHeight: 'min(82vh, 500px)', height: 'auto' };
        default:
          return { width: '368px', height: '46px' };
      }
    }
  };

  const getShellGeometryClass = (state: NotchState, isHardware: boolean) => {
    if (!isHardware) {
      // Dynamic Island Mode: True continuous symmetrical pill / squircle
      switch (state) {
        case 'collapsed':
          return 'rounded-island-pill';
        case 'compact':
          return 'rounded-island-pill';
        case 'recording':
          return 'rounded-island-pill';
        case 'focus':
          return 'rounded-island-pill';
        case 'drawer':
          return 'rounded-island-expanded mt-1';
        case 'chat':
          return 'rounded-island-expanded mt-1';
        default:
          return 'rounded-island-pill';
      }
    } else {
      // MacBook Hardware Notch Mode: Docked flush to top bezel with concave SVG fillet ears
      switch (state) {
        case 'collapsed':
          return 'rounded-t-none rounded-b-notch-collapsed';
        case 'compact':
          return 'rounded-t-none rounded-b-notch-compact';
        case 'recording':
          return 'rounded-t-none rounded-b-notch-recording';
        case 'focus':
          return 'rounded-t-none rounded-b-notch-collapsed';
        case 'drawer':
          return 'rounded-b-notch-drawer mt-2';
        case 'chat':
          return 'rounded-b-notch-drawer mt-2';
        default:
          return 'rounded-t-none rounded-b-notch-compact';
      }
    }
  };

  return (
    <>
      {/* Hardware Screen Top Bezel (Active in MacBook Notch Mode) */}
      {isHardwareNotch && (
        <div className="fixed top-0 inset-x-0 h-[2px] bg-[#0A0B10] pointer-events-none z-40 border-b border-white/[0.06]" />
      )}

      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none transition-all duration-300 w-full max-w-[94vw] ${
          isHardwareNotch ? 'pt-0' : 'pt-3.5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ transformOrigin: 'top center' }}
      >
        {/* Notch Outer Unclipped Positioning Anchor */}
        <div className="relative flex items-start justify-center">
          {/* Authentic Hardware Bezel Curved Ears (Mac Fillets) - Positioned Outside Clipped Container */}
          {isHardwareNotch && notchState !== 'drawer' && notchState !== 'chat' && (
            <>
              {/* Left Fillet Ear (Tangent G2 Bezier) */}
              <div className="absolute top-0 right-full w-[14px] h-[14px] pointer-events-none z-50" title="MacBook Bezel Curvature (Fillet Left)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M0 0 H14 V14 C14 6.268 7.732 0 0 0 Z" fill="#0A0B10" />
                  <path d="M0 0 C7.732 0 14 6.268 14 14" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1" fill="none" />
                </svg>
              </div>

              {/* Right Fillet Ear (Tangent G2 Bezier) */}
              <div className="absolute top-0 left-full w-[14px] h-[14px] pointer-events-none z-50" title="MacBook Bezel Curvature (Fillet Right)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M14 0 H0 V14 C0 6.268 6.268 0 14 0 Z" fill="#0A0B10" />
                  <path d="M14 0 C6.268 0 0 6.268 0 14" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1" fill="none" />
                </svg>
              </div>
            </>
          )}

          {/* Liquid Glass Notch Housing with Gesture & Wheel Controls */}
          <div
            onWheel={(e) => {
              if (notchState === 'compact' && e.deltaY > 20) {
                sounds.playPop();
                setNotchState('drawer');
              } else if (notchState === 'drawer' && e.deltaY < -20) {
                const target = e.target as HTMLElement;
                if (target && target.scrollTop <= 0) {
                  sounds.playPop();
                  setNotchState('compact');
                }
              }
            }}
            onPointerDown={(e) => {
              pointerGestureRef.current.startY = e.clientY;
              pointerGestureRef.current.startX = e.clientX;
              if (pointerGestureRef.current.timer) clearTimeout(pointerGestureRef.current.timer);
              pointerGestureRef.current.timer = window.setTimeout(() => {
                // Long-press: Mascot joy celebration
                sounds.playChime();
                setPipReaction('celebrating');
                setTimeout(() => setPipReaction('idle'), 1600);
              }, 520);
            }}
            onPointerMove={(e) => {
              const deltaX = Math.abs(e.clientX - pointerGestureRef.current.startX);
              const deltaY = Math.abs(e.clientY - pointerGestureRef.current.startY);
              if (deltaX > 10 || deltaY > 10) {
                if (pointerGestureRef.current.timer) {
                  clearTimeout(pointerGestureRef.current.timer);
                  pointerGestureRef.current.timer = null;
                }
              }
            }}
            onPointerUp={(e) => {
              if (pointerGestureRef.current.timer) {
                clearTimeout(pointerGestureRef.current.timer);
                pointerGestureRef.current.timer = null;
              }
              const deltaY = e.clientY - pointerGestureRef.current.startY;
              if (deltaY < -25 && notchState !== 'recording') {
                // Swipe Up: Start new recording
                sounds.playPop();
                toggleRecord();
              } else if (deltaY > 25 && notchState === 'compact') {
                // Swipe Down: Expand drawer
                sounds.playPop();
                setNotchState('drawer');
              }
            }}
            className={`relative notch-morph-transition overflow-hidden flex flex-col ${getShellGeometryClass(
              notchState,
              isHardwareNotch
            )} ${
              isRecording
                ? 'recording-glow bg-[#0A0B10]'
                : isHardwareNotch
                ? 'hardware-notch-specular bg-[#0A0B10]/95 backdrop-blur-2xl'
                : 'dynamic-island-specular bg-black/95 backdrop-blur-3xl'
            }`}
            style={{
              ...getShellGeometryStyle(notchState, isHardwareNotch),
              transformOrigin: 'top center',
            }}
          >
            <DropZoneOverlay isDraggingOver={isDraggingOver} />

            {/* Specular Liquid Top Sheen Line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-30" />

            {/* --- STATE 0: COLLAPSED --- */}
            {notchState === 'collapsed' && (
              <div
                onClick={() => { sounds.playPop(); setNotchState('compact'); }}
                className="w-full h-full flex items-center justify-center gap-2 cursor-pointer group px-2"
              >
                <PipCanvas
                  species={equippedSpecies}
                  reaction={pipReaction}
                  outfitId={equippedOutfit}
                  size={30}
                  className="translate-y-0.5 group-hover:scale-110 transition-transform"
                />
                <span className="text-[11px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                  {MASCOT_ROSTER.find((m) => m.id === equippedSpecies)?.name || 'Nook'}
                </span>
              </div>
            )}

            {/* --- STATE 1: COMPACT ACTIVE --- */}
            {notchState === 'compact' && (
              <div className="w-full h-full flex items-center justify-between px-3">
                {/* Left: Mascot & Interactive Customizer */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    onClick={() => {
                      sounds.playChime();
                      setPipReaction('celebrating');
                      setTimeout(() => setPipReaction('idle'), 1600);
                    }}
                    onDoubleClick={() => {
                      sounds.playPop();
                      setShowSettings(false);
                      setShowOutfitPicker(true);
                      setNotchState('drawer');
                    }}
                    className="relative shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/[0.08] transition-all cursor-pointer group/avatar shadow-inner"
                    title="Click to boop • Double-click for Mascot Studio"
                  >
                    <PipCanvas
                      species={equippedSpecies}
                      reaction={pipReaction}
                      outfitId={equippedOutfit}
                      size={34}
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0A0B10] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  </div>

                  <div className="flex flex-col min-w-0 pr-1 select-none">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span 
                        onClick={() => {
                          sounds.playPop();
                          setShowSettings(false);
                          setShowOutfitPicker(true);
                          setNotchState('drawer');
                        }}
                        className="text-[12px] font-bold tracking-tight text-white truncate max-w-[105px] cursor-pointer hover:text-accent-coral transition-colors"
                        title="Click to customize mascot"
                      >
                        {MASCOT_ROSTER.find((m) => m.id === equippedSpecies)?.name || 'Pip'}
                      </span>
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white/60 border border-white/10 tracking-wider shrink-0">
                        {MASCOT_ROSTER.find((m) => m.id === equippedSpecies)?.category || 'Companion'}
                      </span>
                    </div>
                    <span 
                      className="text-[10px] text-text-secondary truncate max-w-[125px] font-medium leading-tight"
                      title={MASCOT_ROSTER.find((m) => m.id === equippedSpecies)?.tagline || 'Ready to listen'}
                    >
                      {activeMeeting && (activeMeeting.actionItems || []).filter((a) => !a.completed).length > 0
                        ? `🎯 ${(activeMeeting.actionItems || []).filter((a) => !a.completed).length} open tasks`
                        : 'Ready to listen'}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Actions (shrink-0 ensures no buttons are ever compressed or pushed off) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={toggleRecord}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-accent-coral to-[#FF5E62] hover:brightness-110 text-white text-[11px] font-semibold shadow-[0_2px_8px_rgba(255,107,107,0.3)] transition-all hover:scale-105 active:scale-95"
                    title="Start Recording (Cmd+Shift+Space / Swipe Up)"
                  >
                    <Mic className="w-3 h-3" />
                    <span>Record</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setShowSettings(false);
                      setShowOutfitPicker(true);
                      setNotchState('drawer');
                    }}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-pink-300 hover:text-pink-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    title="Mascot Roster & Wardrobe Studio"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => { sounds.playPop(); setNotchState('chat'); }}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-text-secondary hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    title="Ask Mascot (Cmd+Shift+K)"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.playPop();
                      setShowOutfitPicker(false);
                      setShowSettings(false);
                      setNotchState('drawer');
                    }}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-text-secondary hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    title="Open Notes Drawer (Cmd+Shift+N)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STATE 2: EXPANDED RECORDING WINGS --- */}
            {notchState === 'recording' && (
              <div className="w-full h-full flex items-center justify-between px-4">
                {/* Left Wing: Waveform */}
                <div className="flex items-center gap-2 w-[140px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <WaveformVisualizer
                    audioEngine={audioEngineRef.current}
                    isRecording={isRecording}
                    isPaused={isPaused}
                  />
                </div>

                {/* Center: Mascot Listening */}
                <div className="flex items-center gap-2">
                  <PipCanvas
                    species={equippedSpecies}
                    reaction="listening"
                    outfitId={equippedOutfit}
                    size={40}
                  />
                  <div className="flex flex-col text-center">
                    <span className="text-xs font-mono font-bold text-accent-coral">
                      {formatTimer(elapsedSec)}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-text-tertiary">
                      {isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                </div>

                {/* Right Wing: Streaming Preview & Controls */}
                <div className="flex items-center gap-2 max-w-[240px]">
                  {showQuickNoteInput ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (quickNoteText.trim()) {
                          sounds.playPop();
                          audioEngineRef.current.injectRealSegment(quickNoteText.trim());
                          setLatestTokens(quickNoteText.trim());
                          setQuickNoteText('');
                          setShowQuickNoteInput(false);
                        }
                      }}
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={quickNoteText}
                        onChange={(e) => setQuickNoteText(e.target.value)}
                        placeholder="Type note..."
                        className="w-24 bg-notch-inset border border-white/20 rounded-lg px-2 py-1 text-[11px] text-white placeholder-text-tertiary focus:outline-none focus:border-accent-coral"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 rounded-lg bg-accent-coral hover:bg-accent-coral-active text-white text-[10px] font-bold active:scale-95"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickNoteInput(false);
                          setQuickNoteText('');
                        }}
                        className="p-1 rounded-lg text-text-tertiary hover:text-white text-[10px]"
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 text-right overflow-hidden">
                        <div className="flex items-center justify-end gap-1.5 text-[9px] font-mono leading-none mb-0.5">
                          {currentTranscripts.some((t) => t.highlightType === 'critical') && (
                            <span className="text-rose-400 font-bold">
                              ⚡{currentTranscripts.filter((t) => t.highlightType === 'critical').length}
                            </span>
                          )}
                          {currentTranscripts.some((t) => t.highlightType === 'necessary') && (
                            <span className="text-amber-400 font-bold">
                              🎯{currentTranscripts.filter((t) => t.highlightType === 'necessary').length}
                            </span>
                          )}
                          {currentTranscripts.some((t) => t.highlightType === 'remembered') && (
                            <span className="text-indigo-400 font-bold">
                              🧠{currentTranscripts.filter((t) => t.highlightType === 'remembered').length}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary truncate italic">
                          "{latestTokens}"
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          sounds.playPop();
                          setShowQuickNoteInput(true);
                        }}
                        className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors active:scale-95 shrink-0"
                        title="Add typed note directly to meeting"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      sounds.playPop();
                      if (isPaused) {
                        audioEngineRef.current.resumeRecording();
                        setIsPaused(false);
                      } else {
                        audioEngineRef.current.pauseRecording();
                        setIsPaused(true);
                      }
                    }}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors active:scale-95 shrink-0"
                    title={isPaused ? 'Resume' : 'Pause'}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={stopAndSummarize}
                    className="w-7 h-7 rounded-full bg-red-500/85 hover:bg-red-500 text-white flex items-center justify-center transition-colors active:scale-95 shrink-0"
                    title="Stop & Generate Note"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            )}

            {/* --- STATE 3: FULL DRAWER --- */}
            {notchState === 'drawer' && (
              <div className="p-5 flex flex-col h-full w-full min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <PipCanvas
                      species={equippedSpecies}
                      reaction={pipReaction}
                      outfitId={equippedOutfit}
                      size={36}
                      onBoop={() => {
                        sounds.playChime();
                        setPipReaction('celebrating');
                        setTimeout(() => setPipReaction('idle'), 1500);
                      }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Nook Notes & Action Items</h3>
                      <p className="text-[11px] text-text-secondary">
                        Local-first memory • Zero telemetry
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { sounds.playPop(); setShowSettings(false); setShowOutfitPicker(!showOutfitPicker); }}
                      className={`p-1.5 rounded-lg transition-colors active:scale-95 ${
                        showOutfitPicker ? 'bg-accent-coral text-white' : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white'
                      }`}
                      title="Mascot Roster & Wardrobe Studio"
                    >
                      <Shirt className="w-4 h-4 text-accent-coral" />
                    </button>

                    <button
                      onClick={() => { sounds.playPop(); setShowOutfitPicker(false); setShowSettings(!showSettings); }}
                      className={`p-1.5 rounded-lg transition-colors active:scale-95 ${
                        showSettings ? 'bg-accent-coral text-white' : 'bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white'
                      }`}
                      title="Nook Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => { sounds.playPop(); setNotchState('chat'); }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors active:scale-95"
                      title="Ask Mascot"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => { sounds.playPop(); setNotchState('compact'); }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors active:scale-95"
                      title="Collapse"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showSettings ? (
                  <SettingsModal
                    onClose={() => setShowSettings(false)}
                    isHardwareNotch={isHardwareNotch}
                    onToggleHardwareNotch={(isHw) => setIsHardwareNotch(isHw)}
                  />
                ) : showOutfitPicker ? (
                  <MascotStudio
                    equippedSpecies={equippedSpecies}
                    equippedOutfitId={equippedOutfit}
                    activeMeeting={activeMeeting}
                    onSelectSpecies={handleSelectSpecies}
                    onSelectOutfit={handleSelectOutfit}
                    onTriggerReaction={(r) => {
                      setPipReaction(r);
                      setTimeout(() => setPipReaction('idle'), 2500);
                    }}
                    onUpdateMeeting={(updated) => setActiveMeeting(updated)}
                    onToggleFocusMode={() => setNotchState((prev) => (prev === 'focus' ? 'compact' : 'focus'))}
                    onClose={() => setShowOutfitPicker(false)}
                  />
                ) : (
                  <FullDrawer
                    meeting={activeMeeting}
                    onToggleActionItem={handleToggleActionItem}
                    onSelectTemplate={setActiveTemplate}
                    activeTemplate={activeTemplate}
                    onSelectMeeting={(m) => setActiveMeeting(m)}
                    onDeleteMeeting={(id) => {
                      storage.deleteMeeting(id);
                      const remaining = storage.getMeetings();
                      setActiveMeeting(remaining[0] || null);
                    }}
                    onOpenSettings={() => setShowSettings(true)}
                  />
                )}
              </div>
            )}

            {/* --- STATE 4: CHAT FLYOUT --- */}
            {notchState === 'chat' && (
              <div className="p-5 flex flex-col h-full w-full min-w-0 max-w-full overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <PipCanvas
                      species={equippedSpecies}
                      reaction={pipReaction !== 'idle' ? pipReaction : (isPipTalking ? 'talking' : 'idle')}
                      outfitId={equippedOutfit}
                      size={34}
                    />
                    <span className="text-xs font-bold text-text-primary">
                      Ask {MASCOT_ROSTER.find((m) => m.id === equippedSpecies)?.name || 'Pip'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { sounds.playPop(); setNotchState('drawer'); }}
                      className="text-xs text-text-secondary hover:text-white px-2 py-1 rounded bg-white/5 active:scale-95"
                    >
                      View Notes
                    </button>
                    <button
                      onClick={() => { sounds.playPop(); setNotchState('compact'); }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <ChatFlyout
                  ollamaEngine={ollamaEngineRef.current}
                  historicalTranscripts={activeMeeting?.transcripts || []}
                  equippedSpecies={equippedSpecies}
                  onPipTalkingChange={setIsPipTalking}
                  onTriggerGesture={(gesture) => {
                    setPipReaction(gesture);
                    setTimeout(() => {
                      setPipReaction('idle');
                    }, 3500);
                  }}
                  onSelectMeeting={(mId) => {
                    const m = storage.getMeetingById(mId);
                    if (m) {
                      setActiveMeeting(m);
                      setNotchState('drawer');
                    }
                  }}
                />
              </div>
            )}

            {/* --- STATE 5: FOCUS MODE --- */}
            {notchState === 'focus' && (
              <div
                onClick={() => { sounds.playPop(); setNotchState('compact'); }}
                className="w-full h-full flex items-center justify-center gap-2 px-3 cursor-pointer group"
                title="Focus Mode active. Click to awaken."
              >
                <PipCanvas
                  species={equippedSpecies}
                  reaction="sleeping"
                  outfitId="focus"
                  size={26}
                />
                <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary flex items-center gap-1 transition-colors">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  Focus Mode
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mode, Ambient Wake & Curvature Tactile Control Island */}
        <div className="flex items-center gap-2 mt-2 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/10 text-[11px] text-text-secondary opacity-80 hover:opacity-100 transition-opacity shadow-lg">
          {/* Toggle between Island & Hardware */}
          <button
            onClick={() => {
              sounds.playPop();
              setIsHardwareNotch(!isHardwareNotch);
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium transition-colors active:scale-95"
            title="Switch between Dynamic Island (Floating Pill) and MacBook Hardware Notch (Docked Bezel)"
          >
            {isHardwareNotch ? '💻 MacBook Notch' : '🏝️ Dynamic Island'}
          </button>

          <span className="text-white/20">•</span>

          {/* Wake Word Trigger Button */}
          <button
            onClick={() => {
              wakeWord.notifyTrigger('wake', 'Hey Pip');
            }}
            className="hover:text-accent-coral transition-colors flex items-center gap-1 active:scale-95 text-text-primary"
            title="Simulate saying 'Hey Pip' hands-free"
          >
            <Sparkles className="w-3 h-3 text-accent-coral" />
            "Hey Pip"
          </button>

          <span className="text-white/20">•</span>

          {/* DND / Focus Toggle */}
          <button
            onClick={() => {
              sounds.playPop();
              setNotchState(notchState === 'focus' ? 'compact' : 'focus');
            }}
            className="hover:text-white transition-colors flex items-center gap-1 active:scale-95"
            title="Toggle Focus / Sleep Mode"
          >
            {notchState === 'focus' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
            {notchState === 'focus' ? 'Awaken' : 'Focus'}
          </button>

          <span className="text-white/20">•</span>

          {/* Record Hotkey Hint */}
          <span className="font-mono text-[10px] text-accent-coral flex items-center gap-1">
            <kbd className="px-1 py-0.2 rounded bg-white/10 text-white font-mono text-[9px]">⌘⇧␣</kbd>
            Record
          </span>
        </div>
      </div>
    </>
  );
};
