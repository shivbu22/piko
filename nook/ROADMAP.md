# Nook – Versioned Implementation Roadmap

**Version:** 3.0  
**Last Updated:** 2026-10-06

## Phase 0 – Foundation (2–3 weeks)
**Goal:** Project skeleton + basic notch + Pip loading

- Repository setup + MIT license
- Basic transparent always-on-top notch window (macOS first)
- Load and display Pip from 3×3 sprite sheets (cute-mascot compatible)
- Global hotkey (⌘⇧N)
- Basic idle + hover animations
- Settings for data directory

**Deliverable:** Clickable notch with living Pip

## Phase 1 – MVP (4–5 weeks)
**Goal:** Core recording → summary loop

- Microphone capture + live waveform
- Real-time local transcription (Whisper.cpp)
- Stop → automatic summary + action items (Ollama)
- Result view inside notch
- Basic Pip state animations (Recording, Thinking, Success)
- Simple export (Markdown)
- Full offline support after model download

**Deliverable:** Usable local meeting note-taker in the notch

## Phase 2 – Memory & Delight (3–4 weeks)
**Goal:** Make it sticky and emotionally engaging

- Multi-meeting memory + quick switcher
- Persistent action items with completion tracking
- Chat with current note (basic RAG)
- Improved Pip personality reactions
- Drag & drop files onto notch
- Focus mode detection (Pip sleeps)

**Deliverable:** Nook feels like a real companion

## Phase 3 – Version 3 Features (5–7 weeks)
**Goal:** Power features while staying notch-first

- Offline voice commands (“Hey Pip…”)
- Meeting templates
- Visual Timeline mode
- Cross-meeting chat with citations
- Custom Pip outfits system
- Soft meeting insights & weekly summary
- Simple local plugin API
- Advanced gestures (swipe, etc.)

**Deliverable:** Feature-complete Version 3

## Phase 4 – Polish & Public Release (2–3 weeks)
- Performance optimization (60 fps guaranteed)
- Accessibility (VoiceOver)
- Packaging (notarized macOS app, Windows/Linux builds)
- Comprehensive README + attribution to cute-mascot
- Demo video + website
- Public launch

## Priority Order for Version 3 Features
1. Persistent Action Items + Reminders
2. Multi-meeting Memory
3. Voice Commands
4. Cross-meeting Chat
5. Timeline View
6. Outfits
7. Plugins
8. Insights
