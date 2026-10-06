// Nook — Persistent Local Storage Engine (SQLite / WebStorage abstraction)
// 100% Offline, Zero Telemetry, Full Multi-Meeting Support

import { ActionItem, Meeting, TranscriptSegment } from '../types';
import { classifySegment } from '../ai/SegmentClassifier';

export const SEED_MEETINGS: Meeting[] = [
  {
    id: 'meeting-seed-1',
    title: 'Nook Architecture & Mascot Review',
    templateType: 'general',
    startedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    endedAt: Date.now() - 1000 * 60 * 30,
    durationSeconds: 1800,
    executiveSummary:
      'Reviewed the local-first AI notch architecture for Nook. Validated liquid-glass morphing transitions, the cute-mascot 3×3 sprite engine adaptation for Pip, and verified strict offline zero-telemetry boundaries.',
    keyDecisions: [
      'Approved liquid-glass notch UI design with continuous squircle corners.',
      'Enforced 16kHz Float32 ring buffer to keep memory overhead below 500 MB.',
      'Adopted pure local Whisper.cpp + Ollama pipeline with zero cloud dependencies.',
    ],
    criticalPoints: [
      'Strict zero-telemetry boundary: Network egress is completely blocked in release build.',
      'Memory ceiling: Whisper.cpp ring buffer must never exceed 500 MB RAM.',
    ],
    rememberedParts: [
      'Remember that audio processing runs through a 16kHz Float32 circular buffer.',
      'Keep in mind all vector embeddings are stored in local SQLite vector storage.',
      'Pip sprite engine renders via device-pixel-ratio Canvas2D spring physics.',
    ],
    actionItems: [
      {
        id: 'act-1-1',
        meetingId: 'meeting-seed-1',
        task: 'Verify sqlite-vec extension integration and benchmark query latency',
        assignee: 'Alex (Backend)',
        dueDate: 'Thursday',
        priority: 'high',
        completed: false,
      },
      {
        id: 'act-1-2',
        meetingId: 'meeting-seed-1',
        task: 'Finalize Detective Pip and Barista outfit sprite layers',
        assignee: 'Sarah (Design)',
        dueDate: 'Tomorrow 2 PM',
        priority: 'medium',
        completed: true,
        completedAt: Date.now() - 1000 * 60 * 45,
      },
      {
        id: 'act-1-3',
        meetingId: 'meeting-seed-1',
        task: 'Package macOS test build and verify zero outbound network egress',
        assignee: 'You',
        dueDate: 'Friday',
        priority: 'urgent',
        completed: false,
      },
    ],
    transcripts: [
      {
        id: 'seg-1-1',
        meetingId: 'meeting-seed-1',
        speaker: 'host',
        speakerName: 'You (Host)',
        startMs: 1200,
        endMs: 4500,
        text: "Thanks for jumping on everyone. Today we're reviewing the local-first AI notch architecture for Nook.",
        highlightType: 'remembered',
        highlightCategory: '🧠 Remembered Scope',
      },
      {
        id: 'seg-1-2',
        meetingId: 'meeting-seed-1',
        speaker: 'remote',
        speakerName: 'Sarah (Design Lead)',
        startMs: 5000,
        endMs: 9200,
        text: "The liquid-glass look is feeling super crisp. I love how Pip peeks down from the hardware notch.",
      },
      {
        id: 'seg-1-3',
        meetingId: 'meeting-seed-1',
        speaker: 'remote',
        speakerName: 'Alex (Backend Architect)',
        startMs: 9800,
        endMs: 14500,
        text: 'Agreed. For the Whisper.cpp pipeline, we are keeping memory under 500 MB by utilizing 16kHz ring buffers.',
        highlightType: 'critical',
        highlightCategory: '⚡ Critical Architecture Rule',
      },
      {
        id: 'seg-1-4',
        meetingId: 'meeting-seed-1',
        speaker: 'host',
        speakerName: 'You (Host)',
        startMs: 15200,
        endMs: 19800,
        text: 'Alex, can you verify the sqlite-vec extension integration by Thursday so we can lock in multi-meeting memory?',
        highlightType: 'necessary',
        highlightCategory: '🎯 Necessary Action Item',
      },
    ],
    sentimentScore: 0.92,
    tags: ['Architecture', 'Pip', 'Whisper.cpp', 'Local-First'],
  },
  {
    id: 'meeting-seed-2',
    title: 'Design System & Fluid Notch Curvature Critique',
    templateType: 'design-review',
    startedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    endedAt: Date.now() - 1000 * 60 * 60 * 23,
    durationSeconds: 2400,
    executiveSummary:
      'Deep dive into notch geometric design. Evaluated physical MacBook Pro bezel fillets against the floating iPhone-style Dynamic Island pill. Finalized continuous squircle curvature tokens and multi-layer specular caustic lighting.',
    keyDecisions: [
      'Implemented unclipped SVG fillet ears for 14px MacBook hardware notch continuity.',
      'Specified 360° symmetrical pill curvature (R: 9999px) for Dynamic Island floating mode.',
      'Selected Emil Kowalski spring easing cubic-bezier(0.32, 0.72, 0, 1) for all notch expansions.',
    ],
    actionItems: [
      {
        id: 'act-2-1',
        meetingId: 'meeting-seed-2',
        task: 'Refine G2 Bézier fillet ears to eliminate negative-margin clipping',
        assignee: 'Sarah (Design)',
        dueDate: 'Done',
        priority: 'high',
        completed: true,
        completedAt: Date.now() - 1000 * 60 * 60 * 12,
      },
      {
        id: 'act-2-2',
        meetingId: 'meeting-seed-2',
        task: 'Implement dual-mode toggle switch between Hardware Notch and Dynamic Island',
        assignee: 'You',
        dueDate: 'Today',
        priority: 'urgent',
        completed: true,
        completedAt: Date.now() - 1000 * 60 * 60 * 4,
      },
    ],
    transcripts: [
      {
        id: 'seg-2-1',
        meetingId: 'meeting-seed-2',
        speaker: 'remote',
        speakerName: 'Marcus Chen (Agency Founder)',
        startMs: 2000,
        endMs: 7800,
        text: 'When we show clients this UI, the notch feels completely native. There are no clunky toolbars.',
      },
      {
        id: 'seg-2-2',
        meetingId: 'meeting-seed-2',
        speaker: 'remote',
        speakerName: 'Sarah (Design Lead)',
        startMs: 8400,
        endMs: 14200,
        text: 'We must ensure the corner curvature transitions tangentially with the physical MacBook screen bezel.',
      },
    ],
    sentimentScore: 0.96,
    tags: ['Design', 'Curvature', 'Dynamic Island', 'MacBook'],
  },
  {
    id: 'meeting-seed-3',
    title: 'Sprint 24 Planning & Whisper.cpp Optimization',
    templateType: 'standup',
    startedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    endedAt: Date.now() - 1000 * 60 * 60 * 47.5,
    durationSeconds: 1200,
    executiveSummary:
      'Sprint 24 kickoff focusing on Apple Silicon Metal acceleration for Whisper.cpp. Benchmarked ggml-base.en model inference latency at 1.1x real-time with zero thermal throttling.',
    keyDecisions: [
      'Standardized on ggml-base.en as default speech-to-text model for English transcription.',
      'Set battery threshold: pause background summarization if battery level is below 15%.',
    ],
    actionItems: [
      {
        id: 'act-3-1',
        meetingId: 'meeting-seed-3',
        task: 'Profile unified memory allocation during 2-hour continuous stress tests',
        assignee: 'Dr. Elena Vance',
        dueDate: 'Monday',
        priority: 'high',
        completed: false,
      },
      {
        id: 'act-3-2',
        meetingId: 'meeting-seed-3',
        task: 'Audit network egress logs with Little Snitch to verify 0 outbound packets',
        assignee: 'Julian Keller',
        dueDate: 'Tuesday',
        priority: 'urgent',
        completed: true,
        completedAt: Date.now() - 1000 * 60 * 60 * 20,
      },
    ],
    transcripts: [
      {
        id: 'seg-3-1',
        meetingId: 'meeting-seed-3',
        speaker: 'remote',
        speakerName: 'Dr. Elena Vance',
        startMs: 1500,
        endMs: 6000,
        text: 'Whisper.cpp Metal execution is clocking under 1.1x real-time on M2/M3 chips with zero throttling.',
      },
      {
        id: 'seg-3-2',
        meetingId: 'meeting-seed-3',
        speaker: 'remote',
        speakerName: 'Julian Keller',
        startMs: 6800,
        endMs: 11000,
        text: 'I ran packet analysis on the loopback socket. Not a single byte leaves the machine.',
      },
    ],
    sentimentScore: 0.89,
    tags: ['Whisper', 'Metal', 'Privacy', 'Performance'],
  },
  {
    id: 'meeting-seed-4',
    title: '1-on-1 Sync: Local-First Roadmap & Vector RAG',
    templateType: '1-on-1',
    startedAt: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    endedAt: Date.now() - 1000 * 60 * 60 * 71.5,
    durationSeconds: 1500,
    executiveSummary:
      'Bi-weekly 1-on-1 reviewing product roadmap velocity and user delight feedback. Discussed expanding Pip unlockable cosmetics and Obsidian vault bi-directional sync.',
    keyDecisions: [
      'Prioritized multi-meeting conversational Ask Pip flyout as top feature for Version 3.0.',
      'Approved Wizard Pip and Barista Pip outfits for the starter cosmetic catalog.',
    ],
    actionItems: [
      {
        id: 'act-4-1',
        meetingId: 'meeting-seed-4',
        task: 'Draft Obsidian markdown frontmatter schema for automatic vault exports',
        assignee: 'Amina Al-Mansoor',
        dueDate: 'Next Week',
        priority: 'medium',
        completed: false,
      },
    ],
    transcripts: [
      {
        id: 'seg-4-1',
        meetingId: 'meeting-seed-4',
        speaker: 'remote',
        speakerName: 'Amina Al-Mansoor',
        startMs: 2000,
        endMs: 6500,
        text: 'The ability to query past decisions across weeks of meetings without searching notes is game changing.',
      },
    ],
    sentimentScore: 0.94,
    tags: ['Roadmap', '1-on-1', 'Obsidian', 'Pip'],
  },
];

export class StorageEngine {
  private STORAGE_KEY_MEETINGS = 'nook_meetings_v3';
  private STORAGE_KEY_OUTFIT = 'nook_pip_outfit_v3';
  private STORAGE_KEY_SPECIES = 'nook_mascot_species_v3';
  private STORAGE_KEY_SETTINGS = 'nook_settings_v3';

  public getMeetings(): Meeting[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_MEETINGS);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((m: Meeting) => {
            const remembered = m.rememberedParts && m.rememberedParts.length > 0
              ? m.rememberedParts
              : [
                  'Stored in local semantic memory for vector recall.',
                  'Zero outbound cloud data telemetry guaranteed.',
                ];
            const critical = m.criticalPoints && m.criticalPoints.length > 0
              ? m.criticalPoints
              : (m.keyDecisions || []).slice(0, 2);

            return {
              ...m,
              keyDecisions: m.keyDecisions || [],
              criticalPoints: critical,
              actionItems: m.actionItems || [],
              rememberedParts: remembered,
              transcripts: (m.transcripts || []).map((t: TranscriptSegment) => {
                const c = classifySegment(t.text);
                return {
                  ...t,
                  highlightType: t.highlightType || c.highlightType,
                  highlightCategory: t.highlightCategory || c.highlightCategory,
                };
              }),
            };
          });
        }
      }
    } catch {
      // Fallback
    }

    // Initialize with seed meetings if storage has never been set
    this.saveAllMeetings(SEED_MEETINGS);
    return SEED_MEETINGS;
  }

  public clearAllMeetings() {
    this.saveAllMeetings([]);
  }

  public getMeetingById(id: string): Meeting | undefined {
    return this.getMeetings().find((m) => m.id === id);
  }

  public saveMeeting(meeting: Meeting) {
    const list = this.getMeetings();
    const existingIndex = list.findIndex((m) => m.id === meeting.id);
    if (existingIndex >= 0) {
      list[existingIndex] = meeting;
    } else {
      list.unshift(meeting);
    }
    this.saveAllMeetings(list);
  }

  public deleteMeeting(meetingId: string) {
    const list = this.getMeetings().filter((m) => m.id !== meetingId);
    this.saveAllMeetings(list);
  }

  private saveAllMeetings(meetings: Meeting[]) {
    localStorage.setItem(this.STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
  }

  public getAllActionItems(): ActionItem[] {
    const meetings = this.getMeetings();
    const items: ActionItem[] = [];
    meetings.forEach((m) => {
      if (m.actionItems) items.push(...m.actionItems);
    });
    return items;
  }

  public addActionItem(
    meetingId: string,
    itemData: { task: string; assignee?: string; dueDate?: string; priority?: 'low' | 'medium' | 'high' | 'urgent' }
  ): ActionItem | null {
    const meetings = this.getMeetings();
    const meeting = meetings.find((m) => m.id === meetingId) || meetings[0];
    if (!meeting) return null;

    const newItem: ActionItem = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      meetingId: meeting.id,
      task: itemData.task,
      assignee: itemData.assignee || 'You',
      dueDate: itemData.dueDate || 'Soon',
      priority: itemData.priority || 'medium',
      completed: false,
    };

    meeting.actionItems = meeting.actionItems || [];
    meeting.actionItems.unshift(newItem);
    this.saveMeeting(meeting);
    return newItem;
  }

  public toggleActionItem(meetingId: string, itemId: string): boolean {
    const meetings = this.getMeetings();
    const meeting = meetings.find((m) => m.id === meetingId);
    if (meeting && meeting.actionItems) {
      const item = meeting.actionItems.find((a) => a.id === itemId);
      if (item) {
        item.completed = !item.completed;
        item.completedAt = item.completed ? Date.now() : undefined;
        this.saveMeeting(meeting);
        return item.completed;
      }
    }
    return false;
  }

  public deleteActionItem(meetingId: string, itemId: string) {
    const meetings = this.getMeetings();
    const meeting = meetings.find((m) => m.id === meetingId);
    if (meeting && meeting.actionItems) {
      meeting.actionItems = meeting.actionItems.filter((a) => a.id !== itemId);
      this.saveMeeting(meeting);
    }
  }

  public getEquippedOutfit(): string {
    return localStorage.getItem(this.STORAGE_KEY_OUTFIT) || 'classic';
  }

  public setEquippedOutfit(outfitId: string) {
    localStorage.setItem(this.STORAGE_KEY_OUTFIT, outfitId);
  }

  public getEquippedSpecies(): string {
    return localStorage.getItem(this.STORAGE_KEY_SPECIES) || 'pip';
  }

  public setEquippedSpecies(speciesId: string) {
    localStorage.setItem(this.STORAGE_KEY_SPECIES, speciesId);
  }

  public getSettings() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY_SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return {
      notchMode: 'hardware', // 'hardware' | 'floating'
      soundEffectsEnabled: true,
      wakeWordEnabled: true,
      whisperModel: 'ggml-base.en',
      ollamaModel: 'llama3.2:3b',
      obsidianVaultPath: '~/Documents/Obsidian/WorkVault/Meetings',
      autoExportToMarkdown: true,
    };
  }

  public saveSettings(settings: Record<string, unknown>) {
    localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  public exportVaultMarkdown(): string {
    const meetings = this.getMeetings();
    return meetings
      .map((m) => {
        return `---
title: "${m.title}"
date: ${new Date(m.startedAt).toISOString()}
template: ${m.templateType}
duration_sec: ${m.durationSeconds}
tags: [${(m.tags || []).join(', ')}]
---

# ${m.title}

## Executive Summary
${m.executiveSummary}

## Key Decisions
${(m.keyDecisions || []).map((d) => `- ${d}`).join('\n')}

## Action Items
${(m.actionItems || []).map((a) => `- [${a.completed ? 'x' : ' '}] **${a.task}** (Owner: ${a.assignee}${a.dueDate ? `, Due: ${a.dueDate}` : ''})`).join('\n')}

## Transcripts
${(m.transcripts || []).map((t) => `**${t.speakerName}:** ${t.text}`).join('\n\n')}
`;
      })
      .join('\n\n---\n\n');
  }

  public exportAllJSON(): string {
    return JSON.stringify(this.getMeetings(), null, 2);
  }

  public clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY_MEETINGS);
    localStorage.removeItem(this.STORAGE_KEY_OUTFIT);
    localStorage.removeItem(this.STORAGE_KEY_SETTINGS);
  }

  public resetToDefaults() {
    this.saveAllMeetings(SEED_MEETINGS);
  }
}

export const storage = new StorageEngine();
