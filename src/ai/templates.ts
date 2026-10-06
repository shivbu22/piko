import { MeetingTemplateId } from '../types';

export interface MeetingTemplate {
  id: MeetingTemplateId;
  name: string;
  description: string;
  icon: string;
  focusPrompt: string;
  pipPersonality: string;
  suggestedOutfit: string;
}

export const MEETING_TEMPLATES: MeetingTemplate[] = [
  {
    id: 'standup',
    name: 'Daily Standup',
    description: 'Fast blockers, yesterday’s progress, and today’s commitments.',
    icon: '⚡',
    focusPrompt: 'Focus on what was done, what is planned next, and any blockers mentioned.',
    pipPersonality: 'Energetic & Crisp — Keeps things brief, tracks blockers immediately.',
    suggestedOutfit: 'headphones'
  },
  {
    id: '1-on-1',
    name: '1-on-1 Sync',
    description: 'Career growth, feedback, personal check-in, and private commitments.',
    icon: '🤝',
    focusPrompt: 'Focus on morale, interpersonal feedback, personal goals, and private action points.',
    pipPersonality: 'Empathetic & Attentive — Emphasizes mutual agreements and personal milestones.',
    suggestedOutfit: 'glasses'
  },
  {
    id: 'client-call',
    name: 'Client Call',
    description: 'Client requirements, delivery commitments, scope changes, and deliverables.',
    icon: '💼',
    focusPrompt: 'Extract client expectations, scope commitments, due dates, and action items for the team.',
    pipPersonality: 'Professional & Thorough — Flags any scope drift or critical client deadlines.',
    suggestedOutfit: 'chef'
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm Session',
    description: 'Unfiltered ideas, divergent suggestions, innovative angles, and creative concepts.',
    icon: '💡',
    focusPrompt: 'Highlight creative ideas, divergent concepts, proposed hypotheses, and experiment plans.',
    pipPersonality: 'Celebratory & Inspiring — Bounces excitedly with creative ideas and highlights sparks.',
    suggestedOutfit: 'party'
  },
  {
    id: 'interview',
    name: 'Candidate Interview',
    description: 'Candidate background, technical competencies, role fit, and evaluation score.',
    icon: '🎯',
    focusPrompt: 'Summarize candidate background, demonstrated competencies, answers to core questions, and red flags.',
    pipPersonality: 'Objective & Focused — Records exact candidate answers and structured pros/cons.',
    suggestedOutfit: 'wizard'
  },
  {
    id: 'general',
    name: 'General Discussion',
    description: 'Balanced summary with key decisions and actionable deliverables.',
    icon: '💬',
    focusPrompt: 'Extract general context, agreements, and prioritized tasks.',
    pipPersonality: 'Calm & Balanced — Tracks all general items with clear prioritization.',
    suggestedOutfit: 'default'
  },
  {
    id: 'executive',
    name: 'Executive Briefing',
    description: 'High-level business decisions, timeline shifts, and budget impact.',
    icon: '📊',
    focusPrompt: 'Extract strategic alignment, organizational impact, financial notes, and executive mandates.',
    pipPersonality: 'Direct & Concise — Omits small talk; surfaces bottom-line decisions and deadlines.',
    suggestedOutfit: 'glasses'
  }
];
