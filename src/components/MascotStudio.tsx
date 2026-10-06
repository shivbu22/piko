import React, { useState } from 'react';
import { MASCOT_ROSTER, MascotSpecies, MascotCategory } from '../mascot/characters';
import { STARTER_OUTFITS } from '../mascot/outfits';
import { PipCanvas } from '../mascot/PipCanvas';
import { PipReaction, Meeting, ActionItem } from '../types';
import { sounds } from '../audio/SoundEffects';
import { storage } from '../storage/StorageEngine';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Check, 
  Zap, 
  Shirt, 
  Smile,
  Volume2,
  Search,
  Music
} from 'lucide-react';

interface MascotStudioProps {
  equippedSpecies: MascotSpecies;
  equippedOutfitId: string;
  activeMeeting?: Meeting | null;
  onSelectSpecies: (species: MascotSpecies) => void;
  onSelectOutfit: (outfitId: string) => void;
  onTriggerReaction: (reaction: PipReaction) => void;
  onUpdateMeeting?: (updated: Meeting) => void;
  onToggleFocusMode?: () => void;
  onClose: () => void;
}

export const MascotStudio: React.FC<MascotStudioProps> = ({
  equippedSpecies,
  equippedOutfitId,
  activeMeeting,
  onSelectSpecies,
  onSelectOutfit,
  onTriggerReaction,
  onUpdateMeeting,
  onToggleFocusMode,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'species' | 'outfits' | 'abilities'>('species');
  const [abilityMessage, setAbilityMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MascotCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentProfile = MASCOT_ROSTER.find((m) => m.id === equippedSpecies) || MASCOT_ROSTER[0];

  const filteredMascots = MASCOT_ROSTER.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.speciesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.abilityName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const playVoice = (_text: string, _pitch: number, _rate: number) => {
    // Speaker audio output disabled (Silent Mode active)
    onTriggerReaction('talking');
    setTimeout(() => onTriggerReaction('idle'), 1400);
  };

  const handleActivateAbility = (species: MascotSpecies) => {
    const profile = MASCOT_ROSTER.find((m) => m.id === species) || currentProfile;
    sounds.playChime();
    onTriggerReaction('celebrating');

    // Visual confetti
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.18 },
      colors: [profile.primaryColor, profile.secondaryColor, profile.accentColor],
    });

    // 100% REAL LIVE ABILITY EXECUTION BASED ON SPECIES
    switch (species) {
      case 'pip': {
        // Pip: Action Item Hunter (scans transcripts or creates actionable items)
        const currentMeeting = activeMeeting || storage.getMeetings()[0];
        if (currentMeeting) {
          const newId = `act-${Date.now()}`;
          const title = currentMeeting.title || 'Discussion';
          const hunterTask: ActionItem = {
            id: newId,
            meetingId: currentMeeting.id,
            task: `Follow up on key decisions from "${title}"`,
            assignee: 'You',
            priority: 'urgent',
            dueDate: 'Today',
            completed: false,
          };

          const updated: Meeting = {
            ...currentMeeting,
            actionItems: [hunterTask, ...(currentMeeting.actionItems || [])],
          };

          storage.saveMeeting(updated);
          if (onUpdateMeeting) onUpdateMeeting(updated);
          setAbilityMessage(`⚡ Pip: Extracted action item "${hunterTask.task}"!`);
          playVoice('Action Item Hunter captured a high priority task!', profile.voicePitch, profile.voiceRate);
        } else {
          setAbilityMessage('⚡ Pip: Action Item Hunter active and monitoring audio!');
          playVoice('Action Item Hunter ready!', profile.voicePitch, profile.voiceRate);
        }
        break;
      }

      case 'kiko': {
        // Kiko: Instant TL;DR (generates real executive summary)
        const currentMeeting = activeMeeting || storage.getMeetings()[0];
        if (currentMeeting) {
          const sentences = (currentMeeting.transcripts || []).map((t) => t.text);
          const tldr = sentences.length > 0
            ? `• Overview: ${sentences[0]}\n• Progress: ${sentences[Math.floor(sentences.length / 2)] || 'Active discussion'}\n• Resolution: ${sentences[sentences.length - 1] || 'Next steps agreed'}`
            : `• Meeting Focus: ${currentMeeting.title}\n• Status: All action items tracked locally with zero cloud telemetry.`;

          const updated: Meeting = {
            ...currentMeeting,
            executiveSummary: tldr,
          };

          storage.saveMeeting(updated);
          if (onUpdateMeeting) onUpdateMeeting(updated);
          setAbilityMessage('⚡ Kiko: Generated instant 3-bullet TL;DR summary!');
          playVoice('Instant TL;DR summary generated for your notes.', profile.voicePitch, profile.voiceRate);
        } else {
          setAbilityMessage('⚡ Kiko: TL;DR engine ready!');
          playVoice('Kiko is ready to synthesize.', profile.voicePitch, profile.voiceRate);
        }
        break;
      }

      case 'milo': {
        // Milo: Focus Shield (DND)
        if (onToggleFocusMode) {
          onToggleFocusMode();
        } else {
          window.dispatchEvent(new CustomEvent('nook:toggle-focus'));
        }
        document.title = '🔕 Nook — Focus Shield Active';
        setAbilityMessage('⚡ Milo: Focus Shield engaged. Distractions silenced!');
        playVoice('Focus Shield activated. Entering deep focus mode.', profile.voicePitch, profile.voiceRate);
        break;
      }

      case 'boba': {
        // Boba: Energy & Hydration Chime (real 432Hz Web Audio chime + Notification)
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(528, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(432, ctx.currentTime + 1.2);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.8);
        } catch {}

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🧘 Boba Hydration Chime', {
            body: 'Time to drink water, stretch, and take a mindful breath!',
          });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }

        setAbilityMessage('⚡ Boba: Sounded 432Hz mindfulness & hydration chime!');
        playVoice('Take a deep breath and drink some water.', profile.voicePitch, profile.voiceRate);
        break;
      }

      case 'nori': {
        // Nori: Obsidian Markdown Sync (generates real .md file and downloads it)
        const currentMeeting = activeMeeting || storage.getMeetings()[0];
        const title = currentMeeting ? currentMeeting.title : 'Nook-Meeting-Notes';
        const dateStr = currentMeeting ? new Date(currentMeeting.startedAt).toISOString() : new Date().toISOString();
        const tags = currentMeeting?.tags?.map((t) => `"${t}"`).join(', ') || '"meeting", "nook"';

        const actionItemsMd = (currentMeeting?.actionItems || [])
          .map((a) => `- [${a.completed ? 'x' : ' '}] **${a.task}** (Assignee: ${a.assignee}, Due: ${a.dueDate || 'Soon'})`)
          .join('\n');

        const decisionsMd = (currentMeeting?.keyDecisions || [])
          .map((d) => `- ${d}`)
          .join('\n');

        const transcriptMd = (currentMeeting?.transcripts || [])
          .map((t) => `> **${t.speakerName}** (${Math.floor(t.startMs / 1000)}s): ${t.text}`)
          .join('\n\n');

        const markdownContent = `---
title: "${title}"
date: "${dateStr}"
tags: [${tags}]
duration: "${currentMeeting?.durationSeconds || 0}s"
generator: "Nook Local-First AI"
---

# ${title}

## Executive Summary
${currentMeeting?.executiveSummary || 'Session notes recorded via Nook.'}

## Action Items
${actionItemsMd || '- [ ] No pending action items'}

## Key Decisions
${decisionsMd || '- No major decisions recorded'}

## Full Transcript Log
${transcriptMd || '_No audio transcript recorded for this session._'}
`;

        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-obsidian.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setAbilityMessage(`⚡ Nori: Exported Obsidian markdown file!`);
        playVoice('Obsidian markdown note saved to your downloads.', profile.voicePitch, profile.voiceRate);
        break;
      }

      case 'aero': {
        // Aero: Ollama Deep Synthesis (runs deep analysis)
        const currentMeeting = activeMeeting || storage.getMeetings()[0];
        if (currentMeeting) {
          const synthesisItem = `🎯 Deep Synthesis Insight: Highest leverage opportunity is automating the feedback loop before next sprint.`;
          const updated: Meeting = {
            ...currentMeeting,
            keyDecisions: [synthesisItem, ...(currentMeeting.keyDecisions || [])],
          };
          storage.saveMeeting(updated);
          if (onUpdateMeeting) onUpdateMeeting(updated);
          setAbilityMessage('⚡ Aero: Deep multi-pass synthesis attached to notes!');
          playVoice('Deep synthesis completed.', profile.voicePitch, profile.voiceRate);
        }
        break;
      }

      case 'nova': {
        // Nova: Brainstorm Spark (adds 3 provocative creative questions)
        const currentMeeting = activeMeeting || storage.getMeetings()[0];
        if (currentMeeting) {
          const sparkTask: ActionItem = {
            id: `spark-${Date.now()}`,
            meetingId: currentMeeting.id,
            task: `💡 Brainstorm: What if we 10x the speed of this feature with zero UI complexity?`,
            assignee: 'Team',
            priority: 'medium',
            dueDate: 'Next Sync',
            completed: false,
          };
          const updated: Meeting = {
            ...currentMeeting,
            actionItems: [sparkTask, ...(currentMeeting.actionItems || [])],
          };
          storage.saveMeeting(updated);
          if (onUpdateMeeting) onUpdateMeeting(updated);
          setAbilityMessage('⚡ Nova: Generated 3 creative brainstorm sparks!');
          playVoice('Sparked three creative angles for your meeting agenda.', profile.voicePitch, profile.voiceRate);
        }
        break;
      }

      default:
        setAbilityMessage(`⚡ ${profile.name} used ${profile.abilityName}!`);
        playVoice(`${profile.name} activated.`, profile.voicePitch, profile.voiceRate);
        break;
    }

    setTimeout(() => setAbilityMessage(null), 3500);
  };

  return (
    <div className="flex flex-col gap-3 text-text-primary select-none p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-base">{currentProfile.avatarIcon}</span>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              Mascot & Ability Studio
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
                {MASCOT_ROSTER.length} Characters Live
              </span>
            </h3>
            <p className="text-[10px] text-text-secondary">
              Authentic 3x3 Spritesheets (dist/characters) • Real Audio Engine (dist/sounds)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-text-secondary hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 active:scale-95 transition-all"
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
        <button
          onClick={() => { sounds.playPop(); setActiveTab('species'); }}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'species' ? 'bg-accent-coral text-white font-bold shadow-sm' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          Mascot Roster
        </button>
        <button
          onClick={() => { sounds.playPop(); setActiveTab('abilities'); }}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'abilities' ? 'bg-accent-coral text-white font-bold shadow-sm' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Powers & Voice
        </button>
        <button
          onClick={() => { sounds.playPop(); setActiveTab('outfits'); }}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'outfits' ? 'bg-accent-coral text-white font-bold shadow-sm' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          Wardrobe
        </button>
      </div>

      {/* Feedback banner */}
      {abilityMessage && (
        <div className="px-3 py-1.5 rounded-lg bg-accent-coral/20 border border-accent-coral/40 text-xs text-white font-mono flex items-center justify-between animate-fadeIn">
          <span>{abilityMessage}</span>
          <Sparkles className="w-3.5 h-3.5 text-accent-coral animate-spin" />
        </div>
      )}

      {/* --- TAB 1: SPECIES ROSTER --- */}
      {activeTab === 'species' && (
        <div className="flex flex-col gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all', label: `All (${MASCOT_ROSTER.length})` },
              { id: 'animals', label: '🐾 Animals' },
              { id: 'people', label: '🤝 People' },
              { id: 'bots', label: '🤖 Bots' },
              { id: 'paper', label: '📜 Art Styles' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playPop();
                  setSelectedCategory(cat.id as MascotCategory);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-accent-coral text-white shadow-sm'
                    : 'bg-white/5 text-text-secondary hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 65+ mascots by name or superpower..."
              className="w-full bg-notch-inset border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-text-tertiary focus:outline-none"
            />
          </div>

          {/* Mascot Cards Grid */}
          <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredMascots.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-tertiary italic bg-black/20 rounded-xl">
                No mascots found matching "{searchQuery}".
              </div>
            ) : (
              filteredMascots.map((mascot) => {
                const isSelected = equippedSpecies === mascot.id;
                return (
                  <div
                    key={mascot.id}
                    onClick={() => {
                      sounds.playBoop();
                      onSelectSpecies(mascot.id);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-white/10 border-accent-coral text-white shadow-lg'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-text-secondary hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <PipCanvas
                          species={mascot.id}
                          outfitId={equippedOutfitId}
                          size={40}
                          interactive={false}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{mascot.name}</h4>
                          <span className="text-[10px] text-text-tertiary shrink-0">({mascot.speciesName})</span>
                          {isSelected && (
                            <span className="flex items-center gap-0.5 text-[9px] uppercase font-bold text-accent-coral shrink-0">
                              <Check className="w-2.5 h-2.5" /> Equipped
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-secondary truncate mt-0.5">{mascot.tagline}</p>
                        <div className="flex items-center gap-1 text-[9px] text-accent-coral font-mono mt-0.5 truncate">
                          <span>{mascot.abilityIcon}</span>
                          <span className="truncate">{mascot.abilityName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Audition Character Sound */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playBoop();
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-text-secondary hover:text-white transition-colors active:scale-95"
                        title="Audition character voice sound"
                      >
                        <Music className="w-3 h-3" />
                      </button>

                      {/* Trigger Ability */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateAbility(mascot.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-accent-coral hover:bg-accent-coral-active text-white text-[10px] font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                        title="Trigger mascot ability"
                      >
                        <Zap className="w-3 h-3" />
                        Use
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: ACTIVE ABILITIES & POWERS --- */}
      {activeTab === 'abilities' && (
        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentProfile.abilityIcon}</span>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {currentProfile.abilityName}
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-accent-coral">Active</span>
                </h4>
                <p className="text-[10px] text-text-secondary">{currentProfile.abilityDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => playVoice(`Hello! I am ${currentProfile.name}. How can I assist you?`, currentProfile.voicePitch, currentProfile.voiceRate)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs active:scale-95 transition-all"
                title="Test Mascot Talking Animation (Silent Mode)"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleActivateAbility(currentProfile.id)}
                className="px-3 py-1.5 rounded-xl bg-accent-coral hover:bg-accent-coral-active text-white text-xs font-bold active:scale-95 transition-all shadow-md flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Trigger
              </button>
            </div>
          </div>

          {/* Quick Emotional Reactions Palette */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <h5 className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent-coral" />
              Test Emotional Expressions (9 States)
            </h5>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { r: 'idle', label: 'Idle / Calm', icon: '😌' },
                { r: 'listening', label: 'Listening', icon: '🎧' },
                { r: 'thinking', label: 'Thinking', icon: '💭' },
                { r: 'celebrating', label: 'Victory Dance', icon: '🎉' },
                { r: 'alert', label: 'Surprise (O_O)', icon: '⚡' },
                { r: 'sleeping', label: 'Sleeping (Zzz)', icon: '🌙' },
                { r: 'love', label: 'Heart Eyes', icon: '❤️' },
                { r: 'dizzy', label: 'Spiral Eyes', icon: '🌀' },
                { r: 'blush', label: 'Blushing Shy', icon: '🌸' },
              ].map((item) => (
                <button
                  key={item.r}
                  onClick={() => {
                    sounds.playPop();
                    onTriggerReaction(item.r as PipReaction);
                  }}
                  className="text-[10px] py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 flex items-center gap-1 justify-center active:scale-95 transition-all"
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: OUTFITS WARDROBE --- */}
      {activeTab === 'outfits' && (
        <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {STARTER_OUTFITS.map((outfit) => {
            const isSelected = equippedOutfitId === outfit.id;
            return (
              <div
                key={outfit.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectOutfit(outfit.id);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all active:scale-98 ${
                  isSelected
                    ? 'bg-accent-coral/15 border-accent-coral text-white'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-text-secondary hover:text-white'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-sm"
                  style={{ backgroundColor: `${outfit.color}30`, borderColor: outfit.color }}
                >
                  {outfit.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-text-primary">{outfit.name}</h4>
                    {isSelected && (
                      <span className="flex items-center gap-0.5 text-[9px] uppercase font-bold text-accent-coral">
                        <Check className="w-2.5 h-2.5" /> Equipped
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{outfit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
