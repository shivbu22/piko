// Nook — Cross-Meeting Conversational Chat Flyout ("Ask Pip" / Companion)
// Gesture-Trained Multi-Turn Model with Physical Animations & Voice

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, PipReaction } from '../types';
import { OllamaEngine } from '../ai/OllamaEngine';
import { storage } from '../storage/StorageEngine';
import { sounds } from '../audio/SoundEffects';
import { MascotSpecies, MASCOT_ROSTER } from '../mascot/characters';
import { 
  Send, 
  Bot, 
  User, 
  Bookmark, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Heart,
  Moon,
  AlertTriangle,
  Smile,
  Compass
} from 'lucide-react';

interface ChatFlyoutProps {
  ollamaEngine: OllamaEngine;
  historicalTranscripts?: unknown[];
  equippedSpecies?: MascotSpecies;
  onPipTalkingChange: (isTalking: boolean) => void;
  onTriggerGesture?: (gesture: PipReaction) => void;
  onSelectMeeting?: (meetingId: string) => void;
}

export const ChatFlyout: React.FC<ChatFlyoutProps> = ({
  ollamaEngine,
  equippedSpecies = 'pip',
  onPipTalkingChange,
  onTriggerGesture,
  onSelectMeeting,
}) => {
  const activeMascot = MASCOT_ROSTER.find((m) => m.id === equippedSpecies) || MASCOT_ROSTER[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'pip',
      text: `Hi! I'm ${activeMascot.name}. Say "hii", tell me I'm cute, or ask about past meeting tasks and decisions!`,
      timestamp: Date.now(),
      gesture: 'celebrating',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    sounds.playPop();

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    onPipTalkingChange(true);

    try {
      const allMeetings = storage.getMeetings();
      const allTranscripts = allMeetings.flatMap((m) => m.transcripts || []);

      // 1. Process response through LLM Gesture Engine (Ollama or local fallback)
      const res = await ollamaEngine.chatWithMascot(
        text,
        activeMascot.name,
        activeMascot.speciesName,
        allTranscripts
      );

      // 2. Trigger physical mascot reaction on canvas
      if (res.gesture && onTriggerGesture) {
        onTriggerGesture(res.gesture);
      }

      // 3. Silent mode: visual mouth movement without speaker audio output
      setTimeout(() => onPipTalkingChange(false), 1200);

      const pipMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'pip',
        text: res.cleanText,
        gesture: res.gesture,
        timestamp: Date.now(),
        citations: res.citations,
      };

      sounds.playChime();
      setMessages((prev) => [...prev, pipMsg]);
      setIsTyping(false);
    } catch (err) {
      console.error('Mascot chat error:', err);
      setIsTyping(false);
      onPipTalkingChange(false);
    }
  };

  const renderGestureBadge = (gesture?: PipReaction) => {
    if (!gesture || gesture === 'idle') return null;
    switch (gesture) {
      case 'celebrating':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/30">
            <Smile className="w-2.5 h-2.5" />
            👋 Wave & Bounce
          </span>
        );
      case 'love':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold border border-rose-500/30">
            <Heart className="w-2.5 h-2.5" />
            ❤️ Heart Eyes
          </span>
        );
      case 'blush':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono text-[9px] font-bold border border-pink-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            🌸 Warm Blush
          </span>
        );
      case 'alert':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[9px] font-bold border border-red-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            ⚡ Priority Alert
          </span>
        );
      case 'thinking':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold border border-blue-500/30">
            <Compass className="w-2.5 h-2.5" />
            💭 Memory Search
          </span>
        );
      case 'sleeping':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold border border-indigo-500/30">
            <Moon className="w-2.5 h-2.5" />
            🌙 Nighty Night
          </span>
        );
      case 'dizzy':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            🌀 Spun Around
          </span>
        );
      default:
        return null;
    }
  };

  const QUICK_QUESTIONS = [
    'Hii! 👋',
    "You're so cute! 🌸",
    'Love you! ❤️',
    'Spin around! 🌀',
    'Pending action items? 🎯',
    'Goodnight! 🌙',
  ];

  return (
    <div className="flex flex-col h-full text-text-primary select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent-coral/20 flex items-center justify-center text-accent-coral">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              Ask {activeMascot.name}
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-accent-coral/20 text-accent-coral">
                {activeMascot.speciesName}
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-status-success-green/20 text-status-success-green">
                Gesture Trained
              </span>
            </h3>
            <p className="text-[10px] text-text-secondary">Physical animations • Silent Mode (No Speaker Audio)</p>
          </div>
        </div>
        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[#34C759] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          100% Offline
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 max-h-[260px] min-h-[180px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'pip' && (
              <div className="w-5 h-5 rounded-full bg-accent-coral/20 border border-accent-coral/30 flex items-center justify-center shrink-0 mt-0.5 text-accent-coral">
                <Sparkles className="w-3 h-3" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-accent-coral text-white rounded-tr-none'
                  : 'bg-notch-elevated border border-white/10 text-text-primary rounded-tl-none'
              }`}
            >
              {/* Gesture Badge if triggered */}
              {msg.sender === 'pip' && msg.gesture && msg.gesture !== 'idle' && (
                <div className="mb-1.5">
                  {renderGestureBadge(msg.gesture)}
                </div>
              )}

              <p className="text-xs leading-normal">{msg.text}</p>

              {/* Citations Card */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] font-bold text-accent-coral uppercase tracking-wider flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    Citations ({msg.citations.length})
                  </span>
                  {msg.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectMeeting && onSelectMeeting(cite.meetingId)}
                      className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] hover:border-accent-coral/30 cursor-pointer transition-colors group/cite"
                      title="Click to jump to this meeting"
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold text-text-secondary group-hover/cite:text-white">
                        <span>{cite.meetingTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-accent-coral opacity-0 group-hover/cite:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-text-tertiary italic mt-0.5 truncate">
                        {cite.quote}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5 text-white">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <div className="w-5 h-5 rounded-full bg-accent-coral/20 flex items-center justify-center text-accent-coral">
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
            <span className="italic font-mono text-[11px]">{activeMascot.name} is thinking & reacting...</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggested Quick Gesture Prompts */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-text-secondary hover:text-white transition-colors border border-white/5 active:scale-95"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-white/5"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Chat with ${activeMascot.name} ("hii", "you're cute", or ask tasks)...`}
          className="flex-1 bg-notch-inset border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-tertiary focus:outline-none focus:border-accent-coral/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="w-8 h-8 rounded-xl bg-accent-coral hover:bg-accent-coral-active disabled:opacity-40 text-white flex items-center justify-center transition-colors active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
