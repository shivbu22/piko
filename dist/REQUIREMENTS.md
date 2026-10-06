# Requirements Specification (REQUIREMENTS.md)
## Nook — The Invisible, Local-First AI Meeting Companion

**Document Version:** 1.0.0  
**Target Release:** Version 3.0  
**Status:** Approved / Testable Specification  

---

### 1. Functional Requirements (FR)

#### 1.1 Audio Ingestion & Pre-processing Subsystem
- **FR-001 [Audio Sources]:** The system shall capture simultaneous dual-channel audio consisting of the local microphone input and system output audio loopback via macOS `ScreenCaptureKit` without requiring third-party kernel extensions or virtual audio devices.
- **FR-002 [Sampling & Mixing]:** The system shall downsample, mix, and normalize all incoming audio channels into a unified 16,000 Hz, 16-bit mono PCM stream in memory.
- **FR-003 [Voice Activity Detection (VAD)]:** The system shall execute real-time energy and neural VAD on incoming audio buffers, discarding silence intervals exceeding 750 milliseconds from the ASR processing queue.
- **FR-004 [Audio Buffering & Persistence]:** The system shall persist the raw recorded audio session as an encrypted or user-accessible compressed AAC/M4A file stored in `~/Library/Application Support/Nook/recordings/{session_id}.m4a`.
- **FR-005 [Hardware Mute Detection]:** The system shall detect system microphone hardware mute states and display an immediate visual mute indicator in the notch interface within 50ms.

#### 1.2 Transcription & ASR Subsystem (Whisper.cpp)
- **FR-006 [Local Transcription]:** The system shall execute automatic speech recognition exclusively on the local machine using embedded `Whisper.cpp` compiled with Apple Metal GPU acceleration.
- **FR-007 [Streaming Partial Results]:** The system shall emit interim transcript tokens to the UI with a latency not exceeding 1.2 seconds from the utterance conclusion.
- **FR-008 [Timestamp Alignment]:** Each transcribed segment shall record explicit millisecond-accurate start and end timestamps (`start_ms`, `end_ms`) mapped directly to the audio session offset.
- **FR-009 [Speaker Diarization Heuristics]:** The system shall differentiate between local mic utterances (tagged as "You / Host") and system loopback utterances (tagged as "Remote Speaker") based on input stream source routing.
- **FR-010 [Multilingual Transcription]:** The system shall auto-detect spoken language or allow manual override across English, Spanish, German, French, Japanese, and Mandarin Chinese.

#### 1.3 LLM Synthesis & Knowledge Extraction Subsystem (Ollama)
- **FR-011 [Automated Post-Meeting Synthesis]:** Upon session termination, the system shall assemble the complete transcript and trigger local LLM synthesis via Ollama (`127.0.0.1:11434`) without user intervention.
- **FR-012 [Structured JSON Extraction]:** The system shall enforce a strict JSON output schema from the LLM containing:
  1. `executive_summary` (string, max 3 paragraphs)
  2. `key_decisions` (array of strings)
  3. `action_items` (array of objects: `{task: string, owner: string, due_date: string, priority: string}`)
  4. `topics_discussed` (array of strings)
- **FR-013 [Action Item State Management]:** The system shall maintain an interactive checklist where users can toggle action items between `pending`, `in_progress`, and `completed`.
- **FR-014 [Transcript Search & Edit]:** Users shall be able to perform regex or fuzzy search across the transcript text and manually edit transcription errors with instant database updates.

#### 1.4 Spatial Notch Interface & Shell
- **FR-015 [Dynamic Display Adaptation]:** The notch interface shall adapt dynamically to display hardware:
  - If MacBook Pro with hardware notch: Snaps directly below the camera housing, expanding symmetrically left and right.
  - If external monitor or non-notched Mac: Renders as a floating "dynamic island" pill centered at `Y = 12pt` from top screen boundary.
- **FR-016 [State Machine Transitions]:** The interface shall support 6 distinct structural states: `Collapsed Pill`, `Compact Active (Recording)`, `Expanded Wings (Live Stream)`, `Full Drawer (Notes & Memory)`, `Chat Flyout`, and `Snooze/Minimized`.
- **FR-017 [Hotkeys & Global Triggers]:** The system shall register global keyboard shortcuts:
  - `Cmd + Shift + Space`: Toggle Recording Start / Stop
  - `Cmd + Shift + N`: Expand / Collapse Nook Drawer
  - `Cmd + Shift + K`: Open "Ask Pip" Cross-Meeting Search
- **FR-018 [Window Level & Focus Management]:** The notch panel shall float at `NSWindow.Level.statusBar` or `.floating`, remaining visible above full-screen spaces without stealing keyboard focus unless explicitly interacted with.

#### 1.5 Pip Mascot Engine
- **FR-019 [Sprite Sheet Rendering]:** The mascot subsystem shall render Pip using 3×3 grid sprite sheets (`directions.png` and `reactions.png`) slicing 128×128 pixel cells at a configurable frame rate (default 12 FPS).
- **FR-020 [Cursor Tracking]:** Pip's eyes and directional posture shall dynamically face the active cursor coordinates based on 8-direction vector calculations when within 400pt of the notch.
- **FR-021 [Emotional State Mapping]:** The system shall dynamically trigger Pip's emotional reactions based on:
  - Audio amplitude spikes (`surprised`)
  - Long silences during meetings (`thinking` / `head-tilt`)
  - Task completion clicks (`celebrate` / `sparkles`)
  - Recording initiation (`listening` / `headphones`)
  - Inactivity > 15 minutes (`sleeping` / `zzz bubbles`)

---

### 2. Version 3 (V3) Specific Requirements

- **V3-001 [Multi-Meeting Semantic Memory]:** The system shall embed all meeting summaries and transcript chunks using local vector embeddings (`nomic-embed-text`) stored in `sqlite-vec`, enabling semantic retrieval across historical meetings.
- **V3-002 [Cross-Meeting Conversational Chat]:** Users shall be able to converse with Pip via a dedicated chat drawer, asking multi-hop questions spanning meetings from different dates (e.g., "Compare the pricing discussed with Acme last month to today's call").
- **V3-003 [Local Voice Commands ("Hey Pip")]:** The system shall execute an always-on, low-power local wake-word detector (energy `< 0.5% CPU`). Upon detecting "Hey Pip", the system shall chime softly, open the notch, and process the subsequent voice instruction.
- **V3-004 [Meeting Templates Engine]:** The system shall offer configurable prompt templates for distinct meeting types: `1-on-1`, `Daily Standup`, `Executive Briefing`, `Design Critique`, and `Customer Discovery`, altering the structure of the LLM synthesis.
- **V3-005 [Interactive Visual Timeline Scrubber]:** The expanded drawer shall feature an audio waveform timeline displaying speaker turns, energy levels, and key decision pins, allowing users to scrub and playback corresponding audio segments.
- **V3-006 [Smart Proactive Reminders]:** Pip shall evaluate upcoming calendar events (via local EventKit integration) and pending action items, gently nudging the user 5 minutes prior to relevant meetings with unaddressed tasks from previous syncs.
- **V3-007 [System Focus Mode Integration]:** The system shall synchronize with macOS Focus / Do Not Disturb states. When Focus is active, Pip puts on a focus headband, mutes notification audio, and suppresses ambient animations.
- **V3-008 [Custom Pip Outfit System]:** Users shall be able to equip Pip with cosmetic accessories (Detective Hat, Coffee Mug, Focus Headband, Wizard Hat, Cozy Beanie). The engine shall layer outfit sprite overlays onto Pip's directional and reaction frames.
- **V3-009 [Universal Drag & Drop Ingestion]:** Users shall be able to drag audio files (`.mp3`, `.wav`, `.m4a`, `.aac`, `.flac`) or Markdown notes directly onto the collapsed notch to initiate automatic batch transcription and summarization.
- **V3-010 [Local Plugin Sandbox]:** The system shall provide an isolated JavaScript/QuickJS plugin runtime with hooks: `onMeetingEnd(sessionData)`, `onActionItemCreated(item)`, and `customExporter(format)`. Initial built-in plugins include: Obsidian Vault Exporter, Apple Notes Bridge, and Local Webhook Dispatcher.
- **V3-011 [Air-Gap Verification]:** The system shall function flawlessly in airplane mode with all networking adapters disabled.

---

### 3. Non-Functional Requirements (NFR)

#### 3.1 Performance Requirements
- **NFR-001 [Cold Start Time]:** The application shall initialize, mount the notch panel, and display Pip's idle frame within `< 450 ms` from process invocation.
- **NFR-002 [Frame Rate Integrity]:** All notch liquid morphing transitions and Pip sprite animations shall render at a stable `60 FPS` on 60Hz displays and `120 FPS` on Apple ProMotion displays without micro-stutter.
- **NFR-003 [Memory Ceilings]:**
  - Idle state: Resident Memory `< 120 MB`.
  - Active Recording + Whisper Base: Resident Memory `< 800 MB`.
- **NFR-004 [Battery Efficiency]:** Active background recording and transcription shall consume `< 8%` battery per hour on an M2/M3 MacBook Air.

#### 3.2 Privacy & Security Requirements
- **NFR-005 [Zero Telemetry Guarantee]:** The application binary shall contain zero tracking SDKs, analytics endpoints, or external network pings. The binary must pass automated network egress gate checks (`0 outbound packets`).
- **NFR-006 [Local Data Storage Encryption]:** All database files and cached audio recordings must support optional AES-256 encryption at rest utilizing credentials derived from the OS Keychain.
- **NFR-007 [Microphone Transparency]:** The macOS system microphone recording indicator (orange dot) must be accurately displayed by the OS whenever Nook captures audio.

#### 3.3 Reliability & Resilience
- **NFR-008 [Crash Recovery & Data Persistence]:** In the event of a sudden kernel panic, system shutdown, or power loss during an active meeting, the audio buffer and streaming transcript must be flushed to disk every 5 seconds, ensuring zero loss of prior conversation data.
- **NFR-009 [Daemon Health & Reconnect]:** If the local Ollama daemon crashes or restarts, Nook shall implement exponential backoff reconnection attempts without crashing the UI.

#### 3.4 Accessibility (a11y) & Usability
- **NFR-010 [Full Keyboard Operability]:** All interactive elements inside the expanded notch and drawer must be fully navigable via keyboard (`Tab`, `Shift+Tab`, `Return`, `Esc`).
- **NFR-011 [VoiceOver Accessibility]:** Every state change, Pip reaction, and transcript segment shall expose appropriate `NSAccessibility` / Accessibility labels and live region announcements.
- **NFR-012 [Contrast Compliance]:** Text elements across both dark and light modes shall comply with WCAG 2.1 AA standards (minimum contrast ratio `4.5:1` for regular text, `3:1` for large text).
