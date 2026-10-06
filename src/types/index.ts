// Core type definitions for Nook and Pip

export type NotchState = 
  | 'collapsed'          // S-0: Minimal pill flush with notch
  | 'compact'            // S-1: Active hover pill with Pip & Quick Rec
  | 'recording'          // S-2: Expanded wings with live waveform, Pip listening & streaming text
  | 'drawer'             // S-3: Full drawer with summary, action items, timeline
  | 'chat'               // S-4: "Ask Pip" conversational memory flyout
  | 'focus';             // S-5: Focus / Snooze mode with sleeping Pip

export type PipDirection = 
  | 'up-left' | 'up' | 'up-right'
  | 'left' | 'center' | 'right'
  | 'down-left' | 'down' | 'down-right';

export type PipReaction = 
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'talking'
  | 'alert'
  | 'celebrating'
  | 'sleeping'
  | 'busy'
  | 'confused'
  | 'love'
  | 'dizzy'
  | 'blush';

export interface PipOutfit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface ActionItem {
  id: string;
  meetingId: string;
  task: string;
  assignee: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  completedAt?: number;
}

export type SegmentHighlightType = 'critical' | 'necessary' | 'remembered';

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  speaker: 'host' | 'remote' | string;
  speakerName: string;
  startMs: number;
  endMs: number;
  text: string;
  highlightType?: SegmentHighlightType;
  highlightCategory?: string; // e.g., '⚡ Critical Decision', '🎯 Action Task', '🧠 Remembered Fact'
}

export type MeetingTemplateId = 
  | 'standup'
  | '1-on-1'
  | 'client-call'
  | 'brainstorm'
  | 'interview'
  | 'design-review'
  | 'general'
  | 'executive';

export interface SpeakerStats {
  speakerName: string;
  speakerId: string;
  totalTimeMs: number;
  percentage: number;
  turnsCount: number;
}

export interface Meeting {
  id: string;
  title: string;
  templateType: MeetingTemplateId;
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;
  executiveSummary: string;
  keyDecisions: string[]; // Critical Parts (Decisions, Blockers, Approvals)
  actionItems: ActionItem[]; // Necessary Things (Tasks, Owners, Deadlines)
  rememberedParts?: string[]; // Remembered Parts (Key Learnings, Pinned Memory Facts)
  criticalPoints?: string[]; // Explicit Critical Warnings / Decisions
  transcripts: TranscriptSegment[];
  sentimentScore: number;
  meetingScore?: number; // 0-100 Soft Effectiveness Score
  speakerStats?: SpeakerStats[];
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pip';
  text: string;
  timestamp: number;
  gesture?: PipReaction;
  citations?: {
    meetingId: string;
    meetingTitle: string;
    quote: string;
  }[];
}

declare global {
  interface Window {
    desktopAPI?: {
      getPlatformInfo: () => Promise<{ platform: string; isMac: boolean; isWindows: boolean; isPackaged: boolean }>;
      setWindowSize: (width: number, height: number) => void;
      minimize: () => void;
      quit: () => void;
      onRecordHotkey: (callback: () => void) => void;
      onDrawerHotkey: (callback: () => void) => void;
      onChatHotkey: (callback: () => void) => void;
    };
  }
}
