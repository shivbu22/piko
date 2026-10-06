# Versioned Implementation Roadmap (ROADMAP.md)
## Nook — The Invisible, Local-First AI Meeting Companion

**Document Version:** 1.0.0  
**Planning Horizon:** Version 1.0 (Core MVP) through Version 3.5 (Ecosystem Maturity)  
**Status:** Approved / Active Plan  
**Author:** Senior Product Manager & Technical Lead  

---

### 1. Phase Overview & Strategic Milestones

```
[Phase 0: Foundation & Spikes] (Weeks 1 - 3)
  ├── Hardware Notch Spikes (NSPanel & Screen Geometry)
  ├── Audio Loopback Capture Proof-of-Concept (ScreenCaptureKit)
  └── cute-mascot SwiftUI Metal Port Spike
       │
       v
[Phase 1: Version 1.0 Core MVP] (Weeks 4 - 8)
  ├── Local Recording & Dual-channel Audio Mixing
  ├── Embedded Whisper.cpp Transcription (Metal GPU)
  ├── Basic Ollama Summary & Action Item Extraction
  └── Collapsed / Expanded Notch Shell with Resting Pip
       │
       v
[Phase 2: Version 2.0 Spatial Interaction] (Weeks 9 - 14)
  ├── Full 6-State Spatial Notch State Machine
  ├── 3x3 Dynamic Pip Sprite Engine with Mouse Vector Tracking
  ├── Interactive Action Items Checklist inside Notch Drawer
  ├── Drag & Drop Audio File Ingestion
  └── Meeting Templates Engine (1:1, Standup, Review)
       │
       v
[Phase 3: Version 3.0 Ambient Intelligence] (Weeks 15 - 22)
  ├── Multi-Meeting Semantic Memory (sqlite-vec + RRF Hybrid)
  ├── Conversational Cross-Meeting Chat Drawer ("Ask Pip")
  ├── Local Low-Power Wake-Word Detection ("Hey Pip")
  ├── Interactive Visual Waveform Timeline Scrubber
  ├── Custom Pip Outfit & Cosmetic Layering Engine
  └── Sandboxed Local JavaScript Plugin System (Obsidian/Notes)
       │
       v
[Phase 4: Version 3.5 Optimization & Cross-Platform] (Weeks 23+)
  ├── Tauri 2 Packaging for Windows 11 & Linux Desktops
  ├── Zero-Copy Metal Unified Memory Optimizations
  └── Multi-Speaker Diarization Neural Enhancements
```

---

### 2. Detailed Deliverables & Exit Criteria by Phase

#### Phase 0: Foundations & Technical Spikes (Weeks 1–3)
- **Deliverables:**
  - `spk-01`: Standalone macOS `NSPanel` app demonstrating seamless anchoring to MacBook Pro hardware notch and floating fallback pill on external displays.
  - `spk-02`: Audio capture spike capturing simultaneous system audio loopback (`ScreenCaptureKit`) and mic input (`AVAudioEngine`) into a normalized 16kHz Float32 ring buffer.
  - `spk-03`: SwiftUI `Canvas` prototype loading cute-mascot 3×3 sprite sheets and successfully slicing frames according to mouse vector coordinates.
  - `spk-04`: Embedded Whisper.cpp compilation test running `ggml-base.en` with Metal acceleration on Apple Silicon.
- **Exit Criteria:** Sub-100ms notch mount latency; clean 16kHz audio recording verification; zero audio driver installation required.

#### Phase 1: Version 1.0 — Core MVP (Weeks 4–8)
- **Deliverables:**
  - One-click record toggle via `Cmd+Shift+Space` or clicking the notch.
  - Streaming live transcription rendered directly in the notch wings.
  - Automatic post-meeting executive summary and bulleted action items generated via local Ollama (`llama3.2:3b`).
  - SQLite persistence layer storing meetings, raw transcripts, and summaries in `~/Library/Application Support/Nook/nook.db`.
  - Pip mascot rendering basic `idle` and `listening` states.
- **Exit Criteria:** Successfully transcribe and summarize a 30-minute real-world meeting with zero cloud network traffic; idle memory `< 120 MB`.

#### Phase 2: Version 2.0 — Spatial Interaction & Delight (Weeks 9–14)
- **Deliverables:**
  - Implementation of full liquid glass design language with specular highlights, Gaussian blur, and fluid spring physics.
  - Full 3×3 emotional reactions engine for Pip (`reactions.png`), including eye sparkles, celebration animations, and thinking loops.
  - Interactive Action Items checklist inside the expanded notch drawer with local status toggles (`pending` / `completed`).
  - Meeting Templates selector (`1-on-1`, `Daily Standup`, `Design Critique`, `Executive Briefing`).
  - Universal Drag & Drop ingestion zone allowing external audio files (`.mp3`, `.wav`, `.m4a`) to be dropped onto the notch for automatic batch processing.
- **Exit Criteria:** 60/120 FPS frame rate consistency during all notch morphing animations; full keyboard navigation support across the drawer.

#### Phase 3: Version 3.0 — Ambient Intelligence & Memory (Weeks 15–22)
- **Deliverables:**
  - Semantic vector search powered by embedded `sqlite-vec` and local embeddings (`nomic-embed-text`).
  - Cross-Meeting Conversational Chat flyout allowing queries across historical meeting records.
  - Local wake-word engine ("Hey Pip") running on ambient low-power VAD and acoustic model.
  - Visual timeline mode featuring a scrubbable audio waveform with speaker turns and action item pins.
  - Custom Pip outfits system (Detective Hat, Coffee Mug, Focus Headband, Wizard Hat) with dynamic layered sprite compositing.
  - Sandboxed QuickJS plugin system with pre-built export plugins for Obsidian vaults and Apple Notes.
  - Focus Mode / Do Not Disturb system synchronization.
- **Exit Criteria:** Querying across 50 historical meetings returns relevant citations in `< 2.5 seconds`; wake-word false trigger rate `< 1` per 8-hour workday.

#### Phase 4: Version 3.5 — Optimization & Cross-Platform (Weeks 23+)
- **Deliverables:**
  - Tauri 2 cross-platform packaging with Rust backend for Windows 11 (WASAPI audio loopback) and Linux (PipeWire).
  - WebKit/Canvas sprite renderer matching native macOS visual parity.
  - Zero-copy Metal buffer optimizations reducing unified memory overhead during long (>2 hour) meetings.
  - Advanced local neural speaker diarization isolating multiple remote meeting participants.

---

### 3. Version 3 Feature Priority & Impact Matrix

| Feature | Engineering Complexity | User Delight & Impact | Priority Rank | Target Sprint |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Meeting Semantic Memory** | High (Vector indexing + RRF) | Transformative (Total recall) | **P0 (Critical)** | Sprint 15–16 |
| **Cross-Meeting Chat ("Ask Pip")** | High (Context assembly + LLM) | Transformative (Primary interface) | **P0 (Critical)** | Sprint 16–17 |
| **Interactive Visual Timeline** | Medium (Waveform rendering) | High (Scrubbing efficiency) | **P1 (High)** | Sprint 17–18 |
| **Local Wake-Word ("Hey Pip")** | High (False positive tuning) | High (Frictionless hands-free) | **P1 (High)** | Sprint 18–19 |
| **Custom Pip Outfit System** | Low–Medium (Asset compositing) | Very High (Delight & affinity) | **P1 (High)** | Sprint 19–20 |
| **Drag & Drop Audio Ingestion** | Low (File parsing + queueing) | High (Utility for voice memos) | **P2 (Medium)** | Sprint 20 |
| **Meeting Templates Engine** | Low (Prompt customization) | Medium (Structuring output) | **P2 (Medium)** | Sprint 20–21 |
| **Local Plugin System (Obsidian)** | Medium (QuickJS sandbox) | High (Ecosystem lock-in) | **P2 (Medium)** | Sprint 21–22 |
| **Smart Proactive Reminders** | Medium (EventKit integration) | Medium (Pre-meeting prep) | **P3 (Nice-to-have)** | Sprint 22 |

---

### 4. Release Gates & Verification Criteria

1. **Air-Gap Verification Gate:** Before any production release tag, the release binary is executed on an isolated Mac with Wi-Fi, Ethernet, and Bluetooth disabled. The binary must record, transcribe, summarize, and query historical data without fatal errors or hung threads.
2. **Privacy Audit Gate:** Continuous execution monitored via network egress packet capture (`tcpdump` and Little Snitch). Exactly zero IP packets may leave the loopback interface (`127.0.0.1`).
3. **Thermal & Battery Gate:** A 60-minute continuous recording and transcription session on an M-series MacBook Air must not cause CPU throttling or battery consumption exceeding 10%.
4. **Accessibility Conformance Gate:** Full keyboard navigation traversal and VoiceOver narration must pass automated audit checks without missing accessibility labels.
