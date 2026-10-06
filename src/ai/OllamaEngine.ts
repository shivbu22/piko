import { ActionItem, TranscriptSegment, PipReaction } from '../types';
import { MEETING_TEMPLATES } from './templates';

export interface SynthesisResult {
  title: string;
  executiveSummary: string;
  keyDecisions: string[]; // Critical Parts (Decisions, Approvals)
  actionItems: ActionItem[]; // Necessary Things (Tasks, Deliverables, Due Dates)
  rememberedParts: string[]; // Remembered Parts (Key Learnings, Pinned Memory Facts)
  criticalPoints: string[]; // Critical Blockers & Warnings
  tags: string[];
}

export class OllamaEngine {
  private endpoint: string = 'http://localhost:11434';
  private isOllamaConnected: boolean = false;
  private availableModels: string[] = [];

  constructor() {
    this.checkConnection();
  }

  public async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.availableModels = (data.models || []).map((m: { name: string }) => m.name);
        this.isOllamaConnected = true;
        return true;
      }
    } catch {
      this.isOllamaConnected = false;
    }
    return false;
  }

  public getStatus() {
    return {
      connected: this.isOllamaConnected,
      models: this.availableModels,
    };
  }

  public async summarizeMeeting(
    meetingId: string,
    templateType: string,
    transcripts: TranscriptSegment[]
  ): Promise<SynthesisResult> {
    const fullText = transcripts.map((t) => `${t.speakerName}: "${t.text}"`).join('\n');
    const template = MEETING_TEMPLATES.find((t) => t.id === templateType) || MEETING_TEMPLATES[0];

    // If local Ollama is active and models exist, query real local LLM
    if (this.isOllamaConnected && this.availableModels.length > 0 && transcripts.length > 0) {
      try {
        const model =
          this.availableModels.find(
            (m) => m.includes('llama3') || m.includes('qwen') || m.includes('mistral') || m.includes('phi')
          ) || this.availableModels[0];

        const prompt = `You are a real-time meeting intelligence companion.
Analyze the following transcript from a real meeting.
Focus: ${template.focusPrompt}

Transcript:
${fullText}

Return a STRICT JSON object only:
{
  "title": "Concise descriptive title of what was discussed (4-7 words)",
  "executiveSummary": "Accurate summary of what was actually said",
  "keyDecisions": ["Critical decision 1", "Critical decision 2"],
  "criticalPoints": ["Critical blocker or high-risk point"],
  "rememberedParts": ["Important context or key takeaway to remember long-term"],
  "actionItems": [
    {
      "task": "Specific task mentioned",
      "assignee": "Person responsible or 'You'",
      "priority": "low" | "medium" | "high" | "urgent",
      "dueDate": "Mentioned deadline or 'Soon'"
    }
  ],
  "tags": ["keyword1", "keyword2"]
}`;

        const res = await fetch(`${this.endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt,
            format: 'json',
            stream: false,
          }),
        });

        if (res.ok) {
          const raw = await res.json();
          const parsed = JSON.parse(raw.response);

          return {
            title: parsed.title || this.extractTitleFromTranscripts(transcripts),
            executiveSummary:
              parsed.executiveSummary || this.generateDeterministicSummary(transcripts),
            keyDecisions: parsed.keyDecisions || this.extractKeyDecisions(transcripts),
            criticalPoints: parsed.criticalPoints || this.extractCriticalPoints(transcripts),
            rememberedParts: parsed.rememberedParts || this.extractRememberedParts(transcripts),
            actionItems: (parsed.actionItems || []).map(
              (
                ai: {
                  task: string;
                  assignee?: string;
                  priority?: 'low' | 'medium' | 'high' | 'urgent';
                  dueDate?: string;
                },
                idx: number
              ) => ({
                id: `act-${Date.now()}-${idx}`,
                meetingId,
                task: ai.task,
                assignee: ai.assignee || 'You',
                priority: ai.priority || 'medium',
                dueDate: ai.dueDate || 'Soon',
                completed: false,
              })
            ),
            tags: parsed.tags || ['meeting', 'notes'],
          };
        }
      } catch (err) {
        console.warn('Ollama query error, using local real NLP synthesis engine:', err);
      }
    }

    // Deterministic real NLP analysis on ACTUAL transcripts (no mock data!)
    return this.generateDeterministicSynthesis(meetingId, templateType, transcripts);
  }

  // Real deterministic NLP extraction on spoken words
  private generateDeterministicSynthesis(
    meetingId: string,
    _templateType: string,
    transcripts: TranscriptSegment[]
  ): SynthesisResult {
    if (!transcripts || transcripts.length === 0) {
      return {
        title: 'Spoken Voice Note',
        executiveSummary:
          'Session concluded without speech transcripts detected. You can speak into your microphone or type action items directly.',
        keyDecisions: [],
        actionItems: [],
        rememberedParts: [],
        criticalPoints: [],
        tags: ['voice-memo', 'notes'],
      };
    }

    const actionItems = this.extractActionItems(meetingId, transcripts);
    const keyDecisions = this.extractKeyDecisions(transcripts);
    const rememberedParts = this.extractRememberedParts(transcripts);
    const criticalPoints = this.extractCriticalPoints(transcripts);
    const summary = this.generateDeterministicSummary(transcripts);
    const title = this.extractTitleFromTranscripts(transcripts);
    const tags = this.extractTags(transcripts);

    return {
      title,
      executiveSummary: summary,
      keyDecisions,
      actionItems,
      rememberedParts,
      criticalPoints,
      tags,
    };
  }

  public extractActionItems(meetingId: string, transcripts: TranscriptSegment[]): ActionItem[] {
    const actionItems: ActionItem[] = [];
    const commitmentRegex =
      /(?:i will|we will|i need to|we need to|have to|must|should|todo|action item|assign|follow up with|make sure to|remember to|finish|complete|implement|fix|prepare|send|write|email|call)\s+([^.!?\n]+)/gi;
    const dueDateRegex =
      /(?:by|before|due)\s+(tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|end of day|[a-z]+ \d{1,2})/i;

    let idCounter = 1;
    for (const seg of transcripts) {
      const text = seg.text;
      let match: RegExpExecArray | null;

      while ((match = commitmentRegex.exec(text)) !== null) {
        const fullClause = match[0].trim();
        const taskText = match[1].trim();

        if (taskText.length > 3) {
          const dueMatch = taskText.match(dueDateRegex) || text.match(dueDateRegex);
          const dueDate = dueMatch ? dueMatch[1] : 'Soon';
          const isUrgent = /urgent|asap|today|immediately/i.test(text);

          actionItems.push({
            id: `act-${Date.now()}-${idCounter++}`,
            meetingId,
            task: `${fullClause.charAt(0).toUpperCase() + fullClause.slice(1)}`,
            assignee: seg.speakerName.includes('You') ? 'You' : seg.speakerName,
            priority: isUrgent ? 'urgent' : 'medium',
            dueDate,
            completed: false,
          });
        }
      }
    }

    return actionItems;
  }

  public extractKeyDecisions(transcripts: TranscriptSegment[]): string[] {
    const decisions: string[] = [];
    const decisionRegex =
      /(?:decided|agreed|concluded|approved|chosen|we agreed that|we decided to|let's go with)\s+([^.!?\n]+)/gi;

    for (const seg of transcripts) {
      let match: RegExpExecArray | null;
      while ((match = decisionRegex.exec(seg.text)) !== null) {
        const d = match[0].trim();
        if (d.length > 5) {
          decisions.push(d.charAt(0).toUpperCase() + d.slice(1));
        }
      }
    }

    // If no explicit decision words, take first high-value sentence
    if (decisions.length === 0 && transcripts.length > 0) {
      const firstSubstantial = transcripts.find((t) => t.text.length > 20);
      if (firstSubstantial) {
        decisions.push(`Key discussion point: "${firstSubstantial.text}"`);
      }
    }

    return decisions.slice(0, 4);
  }

  public extractRememberedParts(transcripts: TranscriptSegment[]): string[] {
    const remembered: string[] = [];
    const rememberRegex =
      /(?:remember that|keep in mind|note that|takeaway is|important to remember|don't forget|key insight|crucial context|rule is|always keep|pinned:?|lesson learned)\s+([^.!?\n]+)/gi;

    for (const seg of transcripts) {
      let match: RegExpExecArray | null;
      while ((match = rememberRegex.exec(seg.text)) !== null) {
        const item = match[0].trim();
        if (item.length > 6) {
          remembered.push(item.charAt(0).toUpperCase() + item.slice(1));
        }
      }
    }

    // Fallback: extract any segments explicitly tagged as remembered
    if (remembered.length === 0) {
      const tagged = transcripts.filter((t) => t.highlightType === 'remembered');
      if (tagged.length > 0) {
        remembered.push(...tagged.map((t) => t.text).slice(0, 3));
      } else if (transcripts.length > 1) {
        const substantial = transcripts.slice(1).find((t) => t.text.length > 25);
        if (substantial) {
          remembered.push(`Key memory retained: "${substantial.text}"`);
        }
      }
    }

    return remembered.slice(0, 4);
  }

  public extractCriticalPoints(transcripts: TranscriptSegment[]): string[] {
    const critical: string[] = [];
    const critRegex =
      /(?:critical|blocker|risk|showstopper|must not|danger|urgent priority|vital requirement|non-negotiable|fatal)\s+([^.!?\n]+)/gi;

    for (const seg of transcripts) {
      let match: RegExpExecArray | null;
      while ((match = critRegex.exec(seg.text)) !== null) {
        const item = match[0].trim();
        if (item.length > 6) {
          critical.push(item.charAt(0).toUpperCase() + item.slice(1));
        }
      }
    }

    // Fallback: check segments explicitly tagged as critical
    if (critical.length === 0) {
      const tagged = transcripts.filter((t) => t.highlightType === 'critical');
      if (tagged.length > 0) {
        critical.push(...tagged.map((t) => t.text).slice(0, 3));
      }
    }

    return critical.slice(0, 3);
  }

  public generateTLDR(transcripts: TranscriptSegment[]): string {
    if (!transcripts || transcripts.length === 0) {
      return 'No meeting audio recorded yet. Speak into the microphone to generate a live TL;DR.';
    }

    const sentences = transcripts
      .map((t) => t.text.trim())
      .filter((t) => t.length > 0);

    if (sentences.length <= 2) {
      return `TL;DR: ${sentences.join(' ')}`;
    }

    const first = sentences[0];
    const middle = sentences[Math.floor(sentences.length / 2)];
    const last = sentences[sentences.length - 1];

    return `• Core Topic: ${first}\n• Progress: ${middle}\n• Conclusion: ${last}`;
  }

  public generateBrainstormSpark(transcripts: TranscriptSegment[]): string[] {
    const defaultSparks = [
      'What is the highest risk obstacle standing in the way of this objective?',
      'If we had to deliver this in half the time, what is the single essential feature?',
      'How does this decision scale for long-term user retention?',
    ];

    if (!transcripts || transcripts.length === 0) return defaultSparks;

    const keywords = this.extractTags(transcripts);
    const mainTopic = keywords[0] || 'the project';

    return [
      `How can we simplify the execution of ${mainTopic} for maximum speed?`,
      `What happens if the primary assumption around ${mainTopic} changes next week?`,
      `Who is the primary person impacted by this decision and what feedback would they give?`,
    ];
  }

  private generateDeterministicSummary(transcripts: TranscriptSegment[]): string {
    if (transcripts.length === 0) {
      return 'No transcript content recorded.';
    }

    const wordCount = transcripts.reduce(
      (acc, t) => acc + t.text.split(/\s+/).filter(Boolean).length,
      0
    );
    const speakers = Array.from(new Set(transcripts.map((t) => t.speakerName)));

    const snippet = transcripts
      .slice(0, 3)
      .map((t) => t.text)
      .join(' ');

    return `Meeting with ${speakers.join(', ')} recorded across ${transcripts.length} spoken segments (${wordCount} total words). Primary discussion points covered: "${snippet.substring(0, 200)}${snippet.length > 200 ? '...' : ''}"`;
  }

  private extractTitleFromTranscripts(transcripts: TranscriptSegment[]): string {
    if (transcripts.length === 0) return 'Spoken Voice Note';

    const firstText = transcripts[0].text;
    const words = firstText.split(/\s+/).slice(0, 6).join(' ');
    return words.length > 0 ? words : 'Team Sync';
  }

  private extractTags(transcripts: TranscriptSegment[]): string[] {
    const text = transcripts.map((t) => t.text.toLowerCase()).join(' ');
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'have', 'from', 'what', 'your', 'about', 'just', 'like', 'will', 'with'
    ]);

    const words = text
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const freq: Record<string, number> = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }

    const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
    return sorted.slice(0, 4).length > 0 ? sorted.slice(0, 4) : ['notes', 'nook'];
  }

  // Cross-meeting conversational search ("Ask Mascot")
  public async queryMemory(
    query: string,
    historicalTranscripts: TranscriptSegment[]
  ): Promise<{ answer: string; citations: { meetingId: string; meetingTitle: string; quote: string }[] }> {
    const qLower = query.toLowerCase().trim();
    if (!qLower) {
      return {
        answer: 'Please enter a search phrase or question about your meeting memories.',
        citations: [],
      };
    }

    const queryWords = qLower.split(/\s+/).filter((w) => w.length > 2);

    // Score transcripts by match frequency
    const matches = historicalTranscripts
      .map((t) => {
        const textLower = t.text.toLowerCase();
        let score = 0;
        if (textLower.includes(qLower)) score += 10;
        for (const w of queryWords) {
          if (textLower.includes(w)) score += 2;
        }
        return { segment: t, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    if (matches.length > 0) {
      const best = matches[0].segment;
      return {
        answer: `From your meeting records, ${best.speakerName} noted: "${best.text}".`,
        citations: matches.slice(0, 3).map((m) => ({
          meetingId: m.segment.meetingId,
          meetingTitle: 'Meeting Transcript Record',
          quote: `"${m.segment.text}"`,
        })),
      };
    }

    return {
      answer: `I searched across your recorded meeting notes for "${query}", but found no matching statements. Try searching for specific words you spoke during the session.`,
      citations: [],
    };
  }

  // Conversational mascot chat with Gesture Protocol ([gesture:celebrate], [gesture:love], etc.)
  public async chatWithMascot(
    userText: string,
    mascotName: string = 'Pip',
    speciesName: string = 'Dumpling',
    historicalTranscripts: TranscriptSegment[] = []
  ): Promise<{ text: string; cleanText: string; gesture: PipReaction; citations?: { meetingId: string; meetingTitle: string; quote: string }[] }> {
    // 1. If local Ollama is connected, query real model with Gesture Protocol
    if (this.isOllamaConnected && this.availableModels.length > 0) {
      try {
        const model =
          this.availableModels.find((m) => m.includes('nook') || m.includes('llama') || m.includes('qwen') || m.includes('mistral')) ||
          this.availableModels[0];

        const prompt = `You are ${mascotName}, an intelligent and lovable local desktop mascot (${speciesName}).
GESTURE PROTOCOL: You MUST start your response with an exact gesture tag:
[gesture:celebrate] for greetings (hi, hii, hello, hey), celebration, or wins
[gesture:love] for compliments, gratitude, or love (thanks, love you, awesome)
[gesture:blush] for cute remarks, flattery, or shy moments
[gesture:alert] for urgent issues, deadlines, or warnings
[gesture:think] for questions, searching memory, or problem solving
[gesture:sleep] for goodbyes, goodnight, or rest
[gesture:dizzy] for funny, spinning, or chaotic remarks
[gesture:idle] for calm, neutral answers

User said: "${userText}"
Respond warmly in 1-2 sentences:`;

        const res = await fetch(`${this.endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, prompt, stream: false }),
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data.response?.trim() || '';
          if (raw) {
            return this.parseGestureResponse(raw);
          }
        }
      } catch (err) {
        console.warn('Ollama chat query error, using local companion gesture engine:', err);
      }
    }

    // 2. High-speed local companion gesture & intent engine
    return this.evaluateLocalGestureResponse(userText, mascotName, historicalTranscripts);
  }

  private parseGestureResponse(raw: string): { text: string; cleanText: string; gesture: PipReaction } {
    const match = raw.match(/\[gesture:([a-z]+)\]/i);
    let gesture: PipReaction = 'idle';
    if (match) {
      const tag = match[1].toLowerCase();
      if (tag === 'celebrate') gesture = 'celebrating';
      else if (tag === 'love') gesture = 'love';
      else if (tag === 'blush') gesture = 'blush';
      else if (tag === 'alert') gesture = 'alert';
      else if (tag === 'think') gesture = 'thinking';
      else if (tag === 'sleep') gesture = 'sleeping';
      else if (tag === 'dizzy') gesture = 'dizzy';
    }

    const cleanText = raw.replace(/\[gesture:[a-z]+\]/gi, '').trim();
    return {
      text: raw,
      cleanText: cleanText || raw,
      gesture,
    };
  }

  private evaluateLocalGestureResponse(
    userText: string,
    mascotName: string,
    historicalTranscripts: TranscriptSegment[]
  ): { text: string; cleanText: string; gesture: PipReaction; citations?: { meetingId: string; meetingTitle: string; quote: string }[] } {
    const textLower = userText.toLowerCase().trim();

    // A. Greetings: hii, hi, hello, hey, yo, good morning, etc.
    if (/(^|\b)(hii+|hi|hello|hey|heyy+|yo|howdy|good morning|good afternoon|good evening|sup)(\b|!|\?|$)/i.test(textLower)) {
      const greetings = [
        `Hiii there! 👋 Super happy to see you! How can I help with your notes today?`,
        `Hello! ✨ I'm all ears right on your notch! Ready to assist whenever you need.`,
        `Hey hey! 🌟 Great having you here! What are we working on right now?`,
      ];
      const chosen = greetings[Math.floor(Math.random() * greetings.length)];
      return {
        text: `[gesture:celebrate] ${chosen}`,
        cleanText: chosen,
        gesture: 'celebrating',
      };
    }

    // B. Love & Gratitude: love you, thank you, thanks, awesome
    if (/(love you|thank you|thanks|thx|awesome|you are the best|great job|amazing)/i.test(textLower)) {
      const chosen = `I love you too! ❤️ Thank you for keeping me on your screen. You're doing amazing today!`;
      return {
        text: `[gesture:love] ${chosen}`,
        cleanText: chosen,
        gesture: 'love',
      };
    }

    // C. Cute & Compliments: cute, adorable, sweet
    if (/(cute|adorable|sweet|pretty|precious)/i.test(textLower)) {
      const chosen = `Aww, thank you! 🌸 That made my cheeks glow warm peach! You're pretty awesome yourself.`;
      return {
        text: `[gesture:blush] ${chosen}`,
        cleanText: chosen,
        gesture: 'blush',
      };
    }

    // D. Urgent / Alert / Deadlines
    if (/(urgent|deadline|asap|critical|emergency|alert)/i.test(textLower)) {
      const chosen = `Whoa, high priority alert detected! ⚡ Let's track that deadline and make sure nothing slips.`;
      return {
        text: `[gesture:alert] ${chosen}`,
        cleanText: chosen,
        gesture: 'alert',
      };
    }

    // E. Goodnight / Bye / Rest
    if (/(goodnight|bye|bye bye|see ya|sleep|good night|resting)/i.test(textLower)) {
      const chosen = `Goodnight! 🌙 Rest well and recharge. I'll stay cozy in focus sleep mode until you awaken me!`;
      return {
        text: `[gesture:sleep] ${chosen}`,
        cleanText: chosen,
        gesture: 'sleeping',
      };
    }

    // F. Spin / Dizzy / Silliness
    if (/(spin|dizzy|whee+|turn around|rotate)/i.test(textLower)) {
      const chosen = `Wheeeee! 🌀 Spin spin spin! Okay, feeling a little dizzy now, but that was so fun!`;
      return {
        text: `[gesture:dizzy] ${chosen}`,
        cleanText: chosen,
        gesture: 'dizzy',
      };
    }

    // G. Search or Meeting Question
    const memResult = this.queryMemoryQuick(textLower, historicalTranscripts);
    if (memResult.matches.length > 0) {
      const best = memResult.matches[0];
      const answer = `Thinking... 💭 In your recorded meetings, ${best.speakerName} noted: "${best.text}".`;
      return {
        text: `[gesture:think] ${answer}`,
        cleanText: answer,
        gesture: 'thinking',
        citations: memResult.matches.slice(0, 2).map((m) => ({
          meetingId: m.meetingId,
          meetingTitle: 'Meeting Transcript Record',
          quote: `"${m.text}"`,
        })),
      };
    }

    // H. Default companion reply
    const fallback = `I'm ${mascotName}, right here on your desktop notch! You can dictate meeting points, ask about past decisions, or trigger mascot powers.`;
    return {
      text: `[gesture:celebrate] ${fallback}`,
      cleanText: fallback,
      gesture: 'celebrating',
    };
  }

  private queryMemoryQuick(query: string, historicalTranscripts: TranscriptSegment[]): { matches: TranscriptSegment[] } {
    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (queryWords.length === 0 || historicalTranscripts.length === 0) return { matches: [] };

    const matches = historicalTranscripts
      .map((t) => {
        const textLower = t.text.toLowerCase();
        let score = 0;
        if (textLower.includes(query)) score += 10;
        for (const w of queryWords) {
          if (textLower.includes(w)) score += 2;
        }
        return { segment: t, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((m) => m.segment);

    return { matches };
  }
}
