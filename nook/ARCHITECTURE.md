# Nook – System Architecture

**Version:** 3.0  
**Last Updated:** 2026-10-06

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Nook Notch UI Layer                     │
│          (SwiftUI NSPanel / Tauri Transparent Window)       │
├──────────────────────┬──────────────────────────────────────┤
│   Mascot Engine      │         Feature Modules              │
│ (adapted cute-mascot)│  • Recording Controller              │
│  • Pip Sprites       │  • Transcription Service             │
│  • Animations        │  • LLM Summarizer                    │
│  • Physics & Boops   │  • RAG / Chat Engine                 │
│                      │  • Action Item Tracker               │
│                      │  • Voice Command Listener            │
└──────────────────────┴──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Local Services                          │
│  • Audio Capture (cpal / AVAudioEngine)                     │
│  • Whisper.cpp / faster-whisper                             │
│  • Ollama / llama.cpp / MLX                                 │
│  • Embedding Model                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Storage Layer                           │
│  SQLite (notes, action items, embeddings, metadata)         │
│  Audio files + Pip sprites + user outfits                   │
│  User-controlled directory                                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Component Breakdown
- **Notch UI**: Handles all visual states, morphing, and user input
- **Mascot Engine**: Loads 3×3 sheets, plays animations, cursor tracking, boop physics
- **Audio Pipeline**: Capture → real-time transcription → storage
- **AI Pipeline**: Transcription text → LLM summary + action items → embeddings for RAG
- **Data Store**: Single SQLite database + file system for media

## 3. Data Flow (Recording → Result)
1. User triggers recording from notch
2. Audio captured and streamed to transcription service
3. Live transcript shown in notch + Pip recording animation
4. On stop → full transcript sent to local LLM
5. Summary + action items generated and stored
6. Notch switches to Result state + Pip success animation
7. Embeddings created for future semantic search / chat

## 4. Storage Layout (User-controlled directory)
```
Nook/
├── notes.db
├── audio/
├── models/
├── pip/
│   ├── directions.png
│   ├── reactions.png
│   └── outfits/
└── plugins/
```

## 5. Key Technical Decisions
- Prefer native macOS notch (best UX)
- Fall back to Tauri 2 for cross-platform
- Keep mascot system compatible with cute-mascot sprite format for easy community contributions
- All AI inference stays on-device
