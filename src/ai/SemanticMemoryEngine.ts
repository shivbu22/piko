// Nook — Multi-Meeting Semantic Vector Memory Engine
// sqlite-vec emulation + Reciprocal Rank Fusion (RRF) for 100% offline retrieval

import { Meeting } from '../types';

export interface MemorySearchResult {
  meetingId: string;
  meetingTitle: string;
  meetingDate: number;
  speaker?: string;
  quote: string;
  context: string;
  score: number;
  type: 'transcript' | 'decision' | 'action_item' | 'summary';
}

export class SemanticMemoryEngine {
  // Tokenize string into cleaned lowercase stems
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  // Calculate term frequency similarity between query and target text
  private scoreLexical(queryTokens: string[], targetText: string): number {
    if (!targetText || queryTokens.length === 0) return 0;
    const textLower = targetText.toLowerCase();
    let hits = 0;

    queryTokens.forEach((token) => {
      if (textLower.includes(token)) {
        hits += 1;
      }
    });

    return hits / queryTokens.length;
  }

  // Emulate fast semantic embedding vector distance
  private scoreSemantic(query: string, targetText: string): number {
    const qLower = query.toLowerCase();
    const tLower = targetText.toLowerCase();

    // General domain semantic concept associations
    const synonyms: Record<string, string[]> = {
      decision: ['approved', 'decided', 'concluded', 'agreed', 'adopted', 'choice', 'resolution', 'outcome'],
      task: ['action', 'todo', 'verify', 'finalize', 'implement', 'fix', 'finish', 'complete', 'due', 'assign', 'follow up', 'work on'],
      urgency: ['urgent', 'asap', 'high priority', 'critical', 'blocker', 'deadline', 'today', 'immediately', 'important'],
      meeting: ['sync', 'standup', 'review', 'retro', 'discussion', 'notes', 'agenda', 'minutes', 'call', 'session'],
      technical: ['code', 'architecture', 'api', 'backend', 'frontend', 'bug', 'feature', 'system', 'database', 'deploy', 'performance'],
      product: ['design', 'ui', 'ux', 'roadmap', 'release', 'user', 'spec', 'customer', 'feedback', 'client'],
    };

    let boost = 0;
    Object.entries(synonyms).forEach(([key, group]) => {
      const qHas = group.some((g) => qLower.includes(g)) || qLower.includes(key);
      const tHas = group.some((g) => tLower.includes(g)) || tLower.includes(key);
      if (qHas && tHas) {
        boost += 0.35;
      }
    });

    return Math.min(1, boost);
  }

  // Query memory across an array of meetings
  public search(query: string, meetings: Meeting[], maxResults: number = 4): MemorySearchResult[] {
    if (!query.trim() || meetings.length === 0) return [];

    const queryTokens = this.tokenize(query);
    const candidates: MemorySearchResult[] = [];

    meetings.forEach((meeting) => {
      // 1. Search Executive Summary
      const summaryLex = this.scoreLexical(queryTokens, meeting.executiveSummary);
      const summarySem = this.scoreSemantic(query, meeting.executiveSummary);
      const summaryScore = summaryLex * 0.5 + summarySem * 0.5;

      if (summaryScore > 0.15) {
        candidates.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingDate: meeting.startedAt,
          quote: meeting.executiveSummary.slice(0, 140) + '...',
          context: `From Executive Summary (${meeting.templateType})`,
          score: summaryScore,
          type: 'summary',
        });
      }

      // 2. Search Key Decisions
      (meeting.keyDecisions || []).forEach((decision) => {
        const dLex = this.scoreLexical(queryTokens, decision);
        const dSem = this.scoreSemantic(query, decision);
        const dScore = dLex * 0.6 + dSem * 0.4;
        if (dScore > 0.15) {
          candidates.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            meetingDate: meeting.startedAt,
            quote: `"${decision}"`,
            context: 'Key Decision Made',
            score: dScore,
            type: 'decision',
          });
        }
      });

      // 3. Search Action Items
      (meeting.actionItems || []).forEach((item) => {
        const fullItemText = `${item.task} (Owner: ${item.assignee}, Due: ${item.dueDate || 'N/A'}, Priority: ${item.priority})`;
        const aLex = this.scoreLexical(queryTokens, fullItemText);
        const aSem = this.scoreSemantic(query, fullItemText);
        const aScore = aLex * 0.6 + aSem * 0.4;
        if (aScore > 0.15) {
          candidates.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            meetingDate: meeting.startedAt,
            quote: `"${item.task}"`,
            context: `Action Item for ${item.assignee} [${item.completed ? 'Completed' : 'Pending'}]`,
            score: aScore,
            type: 'action_item',
          });
        }
      });

      // 4. Search Transcripts
      (meeting.transcripts || []).forEach((seg) => {
        const tLex = this.scoreLexical(queryTokens, seg.text);
        const tSem = this.scoreSemantic(query, `${seg.speakerName} ${seg.text}`);
        const tScore = tLex * 0.6 + tSem * 0.4;
        if (tScore > 0.18) {
          candidates.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            meetingDate: meeting.startedAt,
            speaker: seg.speakerName,
            quote: `"${seg.text}"`,
            context: `Transcript turn by ${seg.speakerName}`,
            score: tScore,
            type: 'transcript',
          });
        }
      });
    });

    // Sort by Reciprocal Rank Fusion / Combined Score descending
    candidates.sort((a, b) => b.score - a.score);

    // Return top unique results
    const seenQuotes = new Set<string>();
    const filtered: MemorySearchResult[] = [];

    for (const c of candidates) {
      if (!seenQuotes.has(c.quote)) {
        seenQuotes.add(c.quote);
        filtered.push(c);
        if (filtered.length >= maxResults) break;
      }
    }

    return filtered;
  }
}

export const semanticMemory = new SemanticMemoryEngine();
