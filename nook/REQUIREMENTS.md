# Nook – Functional & Non-Functional Requirements

**Version:** 3.0  
**Last Updated:** 2026-10-06

## Functional Requirements

### FR-1 Recording
- FR-1.1 One-click / hotkey start recording from collapsed notch
- FR-1.2 Live waveform visualization
- FR-1.3 Real-time local transcription
- FR-1.4 Pause / Resume / Discard
- FR-1.5 Automatic stop & process on user command

### FR-2 Summarization & Action Items
- FR-2.1 Automatic summary generation using local LLM
- FR-2.2 Extraction of actionable items with owners and due dates when possible
- FR-2.3 Persistent action items across sessions
- FR-2.4 Ability to mark action items as done (with Pip celebration)

### FR-3 Memory & Navigation
- FR-3.1 Multi-meeting memory (last 10+ meetings)
- FR-3.2 Quick switcher inside the notch
- FR-3.3 “Continue from last meeting” suggestion

### FR-4 Chat
- FR-4.1 Chat with current meeting
- FR-4.2 Cross-meeting chat with citations
- FR-4.3 Streaming responses

### FR-5 Voice
- FR-5.1 Offline wake word “Hey Pip”
- FR-5.2 Voice commands for core actions

### FR-6 Templates & Insights
- FR-6.1 Meeting templates (Standup, 1:1, Client Call, etc.)
- FR-6.2 Soft meeting score and weekly insights

### FR-7 Mascot & Interaction
- FR-7.1 Full Pip animation set
- FR-7.2 Cursor tracking and boop interactions
- FR-7.3 Outfit system
- FR-7.4 Drag-and-drop files/notes onto notch

### FR-8 System
- FR-8.1 Global hotkey
- FR-8.2 Focus mode integration
- FR-8.3 Export (Markdown, PDF)
- FR-8.4 Simple local plugin API

## Non-Functional Requirements

- NFR-1 Privacy: Zero data leaves the device unless user explicitly exports
- NFR-2 Performance: All animations 60 fps
- NFR-3 Reliability: Crash rate < 0.5%
- NFR-4 Accessibility: Full VoiceOver / screen reader support
- NFR-5 Storage: User can change data directory
- NFR-6 Licensing: MIT + proper attribution to cute-mascot
