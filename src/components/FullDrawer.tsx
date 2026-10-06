// Nook — Full Notes Drawer & Interactive Multi-Meeting Hub
// 100% Local-first, Obsidian-ready Markdown exports, interactive timeline scrubber, and action items manager

import React, { useState, useEffect } from 'react';
import { Meeting, MeetingTemplateId } from '../types';
import { TimelineScrubber } from './TimelineScrubber';
import { MEETING_TEMPLATES } from '../ai/templates';
import { storage } from '../storage/StorageEngine';
import { sounds } from '../audio/SoundEffects';
import { pluginEngine } from '../plugins/PluginEngine';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  ListTodo, 
  Clock, 
  Sparkles, 
  Download, 
  User, 
  Calendar,
  Layers,
  Search,
  Plus,
  Share2,
  FolderOpen,
  ChevronRight,
  TrendingUp,
  Settings,
  Trash2,
  Zap,
  Target,
  Brain,
  Bookmark,
  Mic,
  Award,
  BarChart3
} from 'lucide-react';

interface FullDrawerProps {
  meeting: Meeting | null;
  onToggleActionItem: (meetingId: string, itemId: string) => void;
  onSelectTemplate: (templateId: MeetingTemplateId) => void;
  activeTemplate: MeetingTemplateId;
  onSelectMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
  onOpenSettings?: () => void;
}

export const FullDrawer: React.FC<FullDrawerProps> = ({
  meeting,
  onToggleActionItem,
  onSelectTemplate,
  activeTemplate,
  onSelectMeeting,
  onDeleteMeeting,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'timeline' | 'meetings' | 'templates' | 'insights'>('summary');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('You');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [pluginStatus, setPluginStatus] = useState<string | null>(null);
  const [transcriptFilter, setTranscriptFilter] = useState<'all' | 'critical' | 'necessary' | 'remembered'>('all');
  const [meetingList, setMeetingList] = useState<Meeting[]>(() => storage.getMeetings());

  useEffect(() => {
    setMeetingList(storage.getMeetings());
  }, [meeting]);

  const allMeetings = meetingList;
  const otherRecentMeeting = allMeetings.find((m) => m.id !== meeting?.id);
  const unfinishedInOther = otherRecentMeeting
    ? (otherRecentMeeting.actionItems || []).filter((a) => !a.completed).length
    : 0;

  const handleRunPlugin = async (pluginId: string) => {
    if (!meeting) return;
    sounds.playPop();
    const res = await pluginEngine.runPlugin(pluginId, meeting);
    setPluginStatus(res.message);
    if (res.success) sounds.playChime();
    setTimeout(() => setPluginStatus(null), 3500);
  };

  if (!meeting) {
    return (
      <div className="p-8 text-center text-text-primary select-none flex flex-col items-center justify-center h-full">
        <Sparkles className="w-10 h-10 text-accent-coral mb-3 animate-pulse" />
        <h3 className="text-sm font-bold text-white">No active meeting selected</h3>
        <p className="text-xs text-text-tertiary mt-1 max-w-xs">
          Start recording from the notch, pick a template, or restore sample meeting records.
        </p>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => {
              sounds.playRecordStart();
              window.dispatchEvent(new CustomEvent('nook:toggle-record'));
            }}
            className="px-3.5 py-1.5 rounded-xl bg-accent-coral hover:bg-accent-coral-active text-white text-xs font-bold transition-all active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5" />
            Quick Record
          </button>

          <button
            onClick={() => {
              sounds.playChime();
              storage.resetToDefaults();
              const defaults = storage.getMeetings();
              setMeetingList(defaults);
              if (onSelectMeeting && defaults.length > 0) {
                onSelectMeeting(defaults[0]);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-xs font-medium transition-all active:scale-95 border border-white/10"
          >
            Load Sample Meetings
          </button>
        </div>
      </div>
    );
  }

  const handleActionClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    sounds.playChime();
    onToggleActionItem(meeting.id, itemId);

    confetti({
      particleCount: 28,
      spread: 55,
      origin: { y: 0.15 },
      colors: ['#F5E6D3', '#F2C4A8', '#E07A5F', '#34C759'],
    });
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    sounds.playPop();
    storage.addActionItem(meeting.id, {
      task: newTaskText.trim(),
      assignee: newTaskAssignee,
      priority: newTaskPriority,
      dueDate: 'Soon',
    });

    setNewTaskText('');
    setShowNewTaskForm(false);
    // Refresh active meeting in state
    const refreshed = storage.getMeetingById(meeting.id);
    if (refreshed && onSelectMeeting) {
      onSelectMeeting(refreshed);
    }
  };

  const handleExportMarkdown = () => {
    sounds.playPop();
    const md = `---
title: "${meeting.title}"
date: ${new Date(meeting.startedAt).toISOString()}
template: ${meeting.templateType}
duration: ${Math.floor(meeting.durationSeconds / 60)} minutes
sentiment: ${(meeting.sentimentScore * 100).toFixed(0)}%
tags: [${(meeting.tags || []).join(', ')}]
---

# ${meeting.title}

> **Date:** ${new Date(meeting.startedAt).toLocaleString()}  
> **Template:** ${meeting.templateType.toUpperCase()}  
> **Duration:** ${Math.floor(meeting.durationSeconds / 60)}m ${meeting.durationSeconds % 60}s  
> **Engine:** Local Whisper.cpp + Ollama (Zero Telemetry)

## Executive Summary
${meeting.executiveSummary}

## ⚡ Critical Parts & Key Decisions
${[...(meeting.criticalPoints || []), ...(meeting.keyDecisions || [])].map((d) => `- [CRITICAL] ${d}`).join('\n')}

## 🎯 Necessary Things & Action Items
${(meeting.actionItems || []).map((a) => `- [${a.completed ? 'x' : ' '}] **${a.task}** (Owner: ${a.assignee}${a.dueDate ? `, Due: ${a.dueDate}` : ''}) [Priority: ${a.priority}]`).join('\n')}

## 🧠 Remembered Parts & Retained Knowledge
${(meeting.rememberedParts || []).map((r) => `- [REMEMBERED] ${r}`).join('\n')}

## 📝 Highlighted Transcript Log
${(meeting.transcripts || []).map((t) => `**${t.speakerName}** (${Math.floor(t.startMs / 1000)}s)${t.highlightCategory ? ` [${t.highlightCategory}]` : ''}:  \n"${t.text}"`).join('\n\n')}

---
*Created with Nook — Desktop Notch Companion*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    sounds.playPop();
    navigator.clipboard.writeText(
      `*${meeting.title}*\n\n${meeting.executiveSummary}\n\nDecisions:\n${(meeting.keyDecisions || []).map((d) => `• ${d}`).join('\n')}`
    );
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 1500);
  };

  const completedCount = (meeting.actionItems || []).filter((a) => a.completed).length;

  const filteredMeetings = allMeetings.filter((m) =>
    m.title.toLowerCase().includes(meetingSearch.toLowerCase()) ||
    m.templateType.toLowerCase().includes(meetingSearch.toLowerCase()) ||
    (m.tags || []).some((t) => t.toLowerCase().includes(meetingSearch.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full w-full min-w-0 max-w-full overflow-hidden text-text-primary select-none">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-white/5">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight text-white truncate">
              {meeting.title}
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-coral/15 text-accent-coral border border-accent-coral/25 shrink-0">
              {meeting.templateType}
            </span>
          </div>

          <p className="text-[11px] text-text-secondary mt-0.5 font-mono flex items-center gap-2">
            <span>{new Date(meeting.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span>{Math.floor(meeting.durationSeconds / 60)} min session</span>
            <span>•</span>
            <span className="text-[#34C759]">100% Offline</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-text-secondary hover:text-white transition-all border border-white/10 active:scale-95"
            title="Copy summary to clipboard"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedNotification ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-coral/20 hover:bg-accent-coral/30 text-xs font-medium text-accent-coral transition-all border border-accent-coral/30 active:scale-95"
            title="Export to Obsidian-compatible Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            Export MD
          </button>

          {onOpenSettings && (
            <button
              onClick={() => { sounds.playPop(); onOpenSettings(); }}
              className="flex items-center gap-1 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-text-secondary hover:text-white transition-all border border-white/10 active:scale-95"
              title="Open Nook Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Multi-Meeting Memory: "Continue from last meeting" Suggestion Banner */}
      {otherRecentMeeting && (
        <div
          onClick={() => {
            sounds.playPop();
            if (onSelectMeeting) onSelectMeeting(otherRecentMeeting);
          }}
          className="mb-2 px-3 py-1.5 rounded-xl bg-accent-coral/10 hover:bg-accent-coral/20 border border-accent-coral/30 cursor-pointer flex items-center justify-between transition-all group active:scale-[0.99]"
          title="Jump directly to previous meeting in history"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-accent-coral shrink-0 group-hover:rotate-12 transition-transform" />
            <div className="truncate text-xs">
              <span className="text-accent-coral font-bold mr-1">Continue from last meeting:</span>
              <span className="text-white font-medium truncate">{otherRecentMeeting.title}</span>
              {unfinishedInOther > 0 && (
                <span className="ml-1.5 text-[10px] text-amber-300 font-mono">
                  ({unfinishedInOther} pending)
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-accent-coral font-semibold group-hover:underline shrink-0 ml-2">
            Switch →
          </span>
        </div>
      )}

      {/* 2. Simple Local Plugin Bar & Execution Status */}
      <div className="flex items-center justify-between gap-2 px-2.5 py-1 bg-black/40 rounded-xl mb-2.5 border border-white/5 text-[11px]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-text-tertiary flex items-center gap-1 font-mono text-[10px]">
            <Zap className="w-3 h-3 text-accent-coral" /> Plugins:
          </span>
          <button
            onClick={() => handleRunPlugin('plugin-obsidian')}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] transition-colors active:scale-95"
            title="Export directly into Obsidian Vault markdown"
          >
            💎 Obsidian
          </button>
          <button
            onClick={() => handleRunPlugin('plugin-todotxt')}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] transition-colors active:scale-95"
            title="Export open tasks to Todo.txt standard"
          >
            📋 Todo.txt
          </button>
          <button
            onClick={() => handleRunPlugin('plugin-shortcuts')}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] transition-colors active:scale-95"
            title="Trigger local OS Shortcuts / Webhook"
          >
            ⚡ Shortcuts
          </button>
        </div>
        {pluginStatus && (
          <span className="text-[10px] text-status-success-green font-mono truncate animate-fadeIn">
            ✓ {pluginStatus}
          </span>
        )}
      </div>

      {/* Segmented Tab Pill Controller */}
      <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl mb-3 border border-white/5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { sounds.playPop(); setActiveTab('summary'); }}
          className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
            activeTab === 'summary'
              ? 'bg-accent-coral text-white shadow-[0_2px_10px_rgba(224,122,95,0.35)]'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Summary
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('actions'); }}
          className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
            activeTab === 'actions'
              ? 'bg-accent-coral text-white shadow-[0_2px_10px_rgba(224,122,95,0.35)]'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          Actions ({completedCount}/{(meeting.actionItems || []).length})
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('timeline'); }}
          className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-accent-coral text-white shadow-[0_2px_10px_rgba(224,122,95,0.35)]'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Timeline
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('insights'); }}
          className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
            activeTab === 'insights'
              ? 'bg-accent-coral text-white shadow-[0_2px_10px_rgba(224,122,95,0.35)]'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Insights
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('meetings'); }}
          className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
            activeTab === 'meetings'
              ? 'bg-accent-coral text-white shadow-[0_2px_10px_rgba(224,122,95,0.35)]'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          History ({allMeetings.length})
        </button>

        <button
          onClick={() => { sounds.playPop(); setActiveTab('templates'); }}
          className={`flex items-center gap-1.5 flex-1 justify-center py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 shrink-0 ${
            activeTab === 'templates'
              ? 'bg-accent-coral text-white shadow-[0_2px_10px_rgba(224,122,95,0.35)]'
              : 'text-text-secondary hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Templates
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 max-h-[360px] w-full min-w-0 max-w-full overflow-x-hidden">
        {/* --- TAB 1: EXECUTIVE SUMMARY --- */}
        {activeTab === 'summary' && (
          <div className="space-y-3.5">
            {/* Executive Overview */}
            <div className="p-3.5 rounded-xl bg-notch-inset border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent-coral flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Summary
              </h4>
              <p className="text-xs text-text-primary leading-relaxed break-words">
                {meeting.executiveSummary}
              </p>
            </div>

            {/* 1. Critical Parts & Key Decisions */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2.5 shadow-[0_0_15px_rgba(244,63,94,0.12)]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  ⚡ Critical Parts & Key Decisions ({[...(meeting.criticalPoints || []), ...(meeting.keyDecisions || [])].length})
                </h4>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Critical
                </span>
              </div>
              <ul className="space-y-1.5">
                {[...(meeting.criticalPoints || []), ...(meeting.keyDecisions || [])].map((item, i) => (
                  <li key={i} className="text-xs text-text-primary flex items-start gap-2 bg-black/40 p-2 rounded-lg border border-white/5 w-full min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-medium break-words min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Necessary Things & Action Items */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 shadow-[0_0_15px_rgba(245,158,11,0.12)]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  🎯 Necessary Things & Tasks ({(meeting.actionItems || []).length})
                </h4>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="text-[9px] font-mono text-amber-300 hover:underline"
                >
                  View All ({meeting.actionItems?.length || 0}) →
                </button>
              </div>
              <ul className="space-y-1.5">
                {(meeting.actionItems || []).slice(0, 3).map((act) => (
                  <li
                    key={act.id}
                    onClick={(e) => handleActionClick(e, act.id)}
                    className="text-xs text-text-primary flex items-center justify-between gap-2 bg-black/40 p-2 rounded-lg border border-white/5 cursor-pointer hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {act.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                      )}
                      <span className={`truncate ${act.completed ? 'line-through text-text-tertiary' : 'font-medium'}`}>
                        {act.task}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-tertiary shrink-0 font-mono">
                      {act.assignee}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Remembered Parts & Retained Memory */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2.5 shadow-[0_0_15px_rgba(99,102,241,0.12)]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  🧠 Remembered Parts & Knowledge Retention ({(meeting.rememberedParts || []).length})
                </h4>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 flex items-center gap-1">
                  <Bookmark className="w-2.5 h-2.5" />
                  Pinned
                </span>
              </div>
              <ul className="space-y-1.5">
                {(meeting.rememberedParts || []).map((rem, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed text-indigo-100">{rem}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sentiment & Tags Footer */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px]">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <TrendingUp className="w-3.5 h-3.5 text-status-success-green" />
                <span>Meeting Alignment: <strong className="text-white">{((meeting.sentimentScore || 0.9) * 100).toFixed(0)}%</strong></span>
              </div>

              <div className="flex items-center gap-1">
                {(meeting.tags || []).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-text-tertiary font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: ACTION ITEMS CHECKLIST --- */}
        {activeTab === 'actions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">
                Click any checkbox to celebrate completion with Pip!
              </span>

              <button
                onClick={() => { sounds.playPop(); setShowNewTaskForm(!showNewTaskForm); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-coral/20 hover:bg-accent-coral/30 text-accent-coral text-xs font-semibold transition-colors active:scale-95"
              >
                <Plus className="w-3 h-3" />
                Add Action Item
              </button>
            </div>

            {/* Inline Add Task Form */}
            {showNewTaskForm && (
              <form onSubmit={handleAddNewTask} className="p-3 rounded-xl bg-black/50 border border-accent-coral/30 space-y-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Task description (e.g. Test sqlite-vec build)..."
                  className="w-full bg-notch-inset border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      placeholder="Assignee (You)"
                      className="w-24 bg-notch-inset border border-white/10 rounded-md px-2 py-1 text-[11px] text-white"
                    />
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="bg-notch-inset border border-white/10 rounded-md px-2 py-1 text-[11px] text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowNewTaskForm(false)}
                      className="px-2.5 py-1 rounded-md text-xs text-text-secondary hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-md bg-accent-coral text-white text-xs font-semibold active:scale-95"
                    >
                      Save Item
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Action Items List */}
            <div className="space-y-2 w-full min-w-0">
              {(meeting.actionItems || []).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => handleActionClick(e, item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 w-full min-w-0 overflow-hidden ${
                    item.completed
                      ? 'bg-black/20 border-white/5 opacity-60'
                      : 'bg-notch-inset border-white/10 hover:border-white/20'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-accent-coral">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-status-success-green" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-tertiary hover:text-accent-coral" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p
                      className={`text-xs font-medium leading-snug break-words ${
                        item.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                      }`}
                    >
                      {item.task}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-text-tertiary" />
                        {item.assignee}
                      </span>
                      {item.dueDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-text-tertiary" />
                            {item.dueDate}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span
                        className={`font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          item.priority === 'urgent'
                            ? 'bg-red-500/20 text-red-400'
                            : item.priority === 'high'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-white/5 text-text-tertiary'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: VISUAL TIMELINE SCRUBBER --- */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <TimelineScrubber
              durationSeconds={meeting.durationSeconds}
              transcripts={meeting.transcripts}
              actionItems={meeting.actionItems}
            />

            {/* Transcript turns with Intelligent Highlight Tagging */}
            {(() => {
              const allSegs = meeting.transcripts || [];
              const critCount = allSegs.filter((t) => t.highlightType === 'critical').length;
              const necCount = allSegs.filter((t) => t.highlightType === 'necessary').length;
              const remCount = allSegs.filter((t) => t.highlightType === 'remembered').length;

              const visibleSegs = allSegs.filter((t) => {
                if (transcriptFilter === 'all') return true;
                return t.highlightType === transcriptFilter;
              });

              return (
                <div className="p-3.5 rounded-xl bg-notch-inset border border-white/5 space-y-3 w-full min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Speech Transcripts ({allSegs.length} turns)
                    </h4>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      onClick={() => setTranscriptFilter('all')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 active:scale-95 ${
                        transcriptFilter === 'all'
                          ? 'bg-accent-coral text-white'
                          : 'bg-white/5 text-text-secondary hover:text-white border border-white/5'
                      }`}
                    >
                      All ({allSegs.length})
                    </button>
                    <button
                      onClick={() => setTranscriptFilter('critical')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 active:scale-95 flex items-center gap-1 ${
                        transcriptFilter === 'critical'
                          ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      ⚡ Critical ({critCount})
                    </button>
                    <button
                      onClick={() => setTranscriptFilter('necessary')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 active:scale-95 flex items-center gap-1 ${
                        transcriptFilter === 'necessary'
                          ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                      }`}
                    >
                      <Target className="w-2.5 h-2.5" />
                      🎯 Necessary ({necCount})
                    </button>
                    <button
                      onClick={() => setTranscriptFilter('remembered')}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 active:scale-95 flex items-center gap-1 ${
                        transcriptFilter === 'remembered'
                          ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                          : 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/20'
                      }`}
                    >
                      <Brain className="w-2.5 h-2.5" />
                      🧠 Remembered ({remCount})
                    </button>
                  </div>

                  {/* List of Transcript Turns */}
                  <div className="space-y-2.5">
                    {visibleSegs.length === 0 ? (
                      <div className="p-4 text-center text-text-tertiary text-xs italic bg-black/20 rounded-xl">
                        No segments categorized under "{transcriptFilter}" for this session.
                      </div>
                    ) : (
                      visibleSegs.map((seg) => {
                        const isCritical = seg.highlightType === 'critical';
                        const isNecessary = seg.highlightType === 'necessary';
                        const isRemembered = seg.highlightType === 'remembered';

                        return (
                          <div
                            key={seg.id}
                            className={`text-xs p-3 rounded-xl border transition-all w-full min-w-0 overflow-hidden ${
                              isCritical
                                ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.12)]'
                                : isNecessary
                                ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.12)]'
                                : isRemembered
                                ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]'
                                : 'bg-black/30 border-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-accent-coral">{seg.speakerName}</span>
                                {isCritical && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold border border-rose-500/30">
                                    <Zap className="w-2.5 h-2.5" />
                                    ⚡ Critical Part
                                  </span>
                                )}
                                {isNecessary && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
                                    <Target className="w-2.5 h-2.5" />
                                    🎯 Necessary Action
                                  </span>
                                )}
                                {isRemembered && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold border border-indigo-500/30">
                                    <Brain className="w-2.5 h-2.5" />
                                    🧠 Remembered Memory
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-text-tertiary">
                                {Math.floor(seg.startMs / 1000)}s - {Math.floor(seg.endMs / 1000)}s
                              </span>
                            </div>
                            <p className={`leading-relaxed break-words ${
                              isCritical || isNecessary || isRemembered
                                ? 'text-white font-medium'
                                : 'text-text-secondary'
                            }`}>
                              {seg.text}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- TAB: MEETING INSIGHTS & WEEKLY SOFT SCORE --- */}
        {activeTab === 'insights' && (
          <div className="space-y-3.5">
            {/* Soft Meeting Score Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-black/40 to-accent-coral/10 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Meeting Effectiveness Score
                    </h4>
                    <span className="text-[10px] text-text-tertiary">
                      Gentle, non-judgmental productivity evaluation
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-extrabold text-amber-300 font-mono">
                    {meeting.meetingScore || 94}
                  </span>
                  <span className="text-xs text-text-tertiary font-mono">/100</span>
                </div>
              </div>

              {/* Dimension Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-text-tertiary block">Decisiveness</span>
                  <span className="text-xs font-bold text-status-success-green font-mono">98%</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-text-tertiary block">Action Clarity</span>
                  <span className="text-xs font-bold text-accent-coral font-mono">95%</span>
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] text-text-tertiary block">Pacing</span>
                  <span className="text-xs font-bold text-indigo-300 font-mono">90%</span>
                </div>
              </div>
            </div>

            {/* Weekly Gentle Insights from Pip */}
            <div className="p-4 rounded-xl bg-notch-inset border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-coral" />
                  Weekly Gentle Insights from Pip
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-coral/20 text-accent-coral font-semibold">
                  This Week
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                "You've had <strong className="text-white">{allMeetings.length} recorded sessions</strong> this week, completing <strong className="text-status-success-green">{completedCount} key action items</strong>! Your most focused meeting was <em className="text-white">'{meeting.title}'</em>. You're staying concise and keeping decisions clear. Remember to take a quick breather before your next sync!"
              </p>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-text-secondary">
                  <BarChart3 className="w-3.5 h-3.5 text-accent-coral" />
                  <span>Total meeting time this week:</span>
                  <strong className="text-white font-mono">
                    {Math.round(allMeetings.reduce((acc, m) => acc + (m.durationSeconds || 0), 0) / 60)} mins
                  </strong>
                </div>

                <button
                  onClick={() => {
                    sounds.playChime();
                    confetti({
                      particleCount: 40,
                      spread: 60,
                      origin: { y: 0.2 },
                      colors: ['#E07A5F', '#52B788', '#F4A261', '#4EA8DE'],
                    });
                  }}
                  className="px-2.5 py-1 rounded-md bg-accent-coral/20 hover:bg-accent-coral/30 text-accent-coral text-[10px] font-bold active:scale-95 transition-colors"
                >
                  Celebrate Progress 🎉
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: MULTI-MEETING ARCHIVE & HISTORY --- */}
        {activeTab === 'meetings' && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={meetingSearch}
                onChange={(e) => setMeetingSearch(e.target.value)}
                placeholder="Search past meetings by title or tag..."
                className="w-full bg-notch-inset border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-text-tertiary focus:outline-none"
              />
            </div>

            {/* History Management Header */}
            <div className="flex items-center justify-between text-[11px] text-text-secondary px-1">
              <span>{filteredMeetings.length} saved meetings</span>
              {allMeetings.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playPop();
                    storage.clearAllMeetings();
                    setMeetingList([]);
                    if (onSelectMeeting) onSelectMeeting(null as any);
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear All History
                </button>
              )}
            </div>

            {/* Meeting List */}
            <div className="space-y-2 w-full min-w-0">
              {filteredMeetings.map((m) => {
                const isSelected = m.id === meeting.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      sounds.playPop();
                      if (onSelectMeeting) onSelectMeeting(m);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between w-full min-w-0 overflow-hidden ${
                      isSelected
                        ? 'bg-accent-coral/15 border-accent-coral/50'
                        : 'bg-notch-inset border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <h5 className="text-xs font-bold text-white truncate min-w-0">{m.title}</h5>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent-coral text-white font-semibold shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-secondary truncate min-w-0">
                        {m.executiveSummary}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-text-tertiary">
                        <span>{new Date(m.startedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{Math.floor(m.durationSeconds / 60)} min</span>
                        <span>•</span>
                        <span>{m.templateType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playPop();
                          if (onDeleteMeeting) {
                            onDeleteMeeting(m.id);
                            setMeetingList(storage.getMeetings());
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-tertiary hover:text-red-400 transition-colors active:scale-95"
                        title="Delete this meeting record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 5: TEMPLATES SELECTOR --- */}
        {activeTab === 'templates' && (
          <div className="space-y-2.5">
            <span className="text-xs text-text-secondary">
              Select an LLM prompt specialization template:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {MEETING_TEMPLATES.map((tpl) => {
                const isSelected = tpl.id === activeTemplate;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      sounds.playPop();
                      onSelectTemplate(tpl.id as any);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-accent-coral/15 border-accent-coral'
                        : 'bg-notch-inset border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-white">{tpl.name}</h4>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-coral" />
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary">{tpl.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
