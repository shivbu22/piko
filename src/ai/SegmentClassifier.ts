// Nook — Real-Time Meeting Segment Highlighting Classifier
// Classifies spoken sentences into:
// 1. Critical Parts (Decisions, Blockers, Critical Agreements)
// 2. Necessary Things (Action Items, Tasks, Deadlines, Commitments)
// 3. Remembered Parts (Retained Knowledge, Key Context, Pinned Insights)

import { SegmentHighlightType } from '../types';

export interface SegmentClassification {
  highlightType?: SegmentHighlightType;
  highlightCategory?: string;
}

export function classifySegment(text: string): SegmentClassification {
  const lower = text.toLowerCase().trim();
  if (!lower) return {};

  // 1. Critical Parts (Key decisions, blockers, risks, explicit agreements, approvals)
  if (
    /(?:decided|agreed|concluded|approved|we decided|we agreed|let's go with|chosen|blocker|showstopper|critical|danger|must not|never|vital requirement|non-negotiable|fatal|pivot)/i.test(
      lower
    )
  ) {
    return {
      highlightType: 'critical',
      highlightCategory: '⚡ Critical Part / Decision',
    };
  }

  // 2. Remembered Parts (Important context, retained knowledge, pinned facts, rules)
  if (
    /(?:remember|keep in mind|note that|takeaway|don't forget|important context|crucial point|pinned|memory|always keep|rule is|lesson|learned that|convention)/i.test(
      lower
    )
  ) {
    return {
      highlightType: 'remembered',
      highlightCategory: '🧠 Remembered Knowledge',
    };
  }

  // 3. Necessary Things (Action items, commitments, deliverables, due dates, tasks)
  if (
    /(?:i will|we will|i need to|we need to|have to|\bmust\b\s+(?:finish|complete|implement|fix|deliver|ship|send|verify|do|update|be done)|action item|todo|assign|by tomorrow|by monday|by tuesday|by wednesday|by thursday|by friday|by next week|due date|deliverable|finish|prepare|ship|send)/i.test(
      lower
    )
  ) {
    return {
      highlightType: 'necessary',
      highlightCategory: '🎯 Necessary Action',
    };
  }

  return {};
}
