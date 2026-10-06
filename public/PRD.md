# Product Requirements Document (PRD)
## Nook — The Invisible, Local-First AI Meeting Companion

**Document Version:** 1.0.0  
**Target Release:** Version 3.0  
**Status:** Approved / Production-Ready  
**Author:** Senior Product Management & Architecture Lead  

---

### 1. Vision & Core Value Proposition

**Vision Statement**  
Nook transforms everyday meeting capture from an obtrusive, anxiety-inducing administrative burden into an ambient, delightful desktop experience. By living entirely inside the desktop display notch and powered by an expressive dumpling mascot named **Pip**, Nook operates without floating toolbars, bulky application windows, or intrusive cloud meeting bots.

**Core Value Proposition**  
- **100% Local & Zero Telemetry:** Audio, transcripts, vector embeddings, and LLM inferences never leave the host machine. Zero accounts, zero cloud dependencies, zero enterprise surveillance liability.
- **Pure Notch-First Spatial Interface:** Eliminates traditional window management. Nook expands organically from the hardware display notch (or a floating dynamic island pill on non-notched screens) when needed and collapses flush into the bezel when idle.
- **Ambient Intelligence with Personality:** Pip (personalized from the open-source `cute-mascot` system) acts as an empathetic co-pilot that listens, reacts to meeting sentiment, takes notes, reminds the user of pending commitments, and wears user-customizable outfits.
- **Instantaneous Multi-Meeting Synthesis:** Provides cross-meeting semantic recall and natural language querying ("Hey Pip, what did Alex agree to build last Tuesday?") directly from the notch.

---

### 2. Target Users & Personas

| Persona | Role & Work Environment | Primary Pain Points | How Nook Solves It |
| :--- | :--- | :--- | :--- |
| **Dr. Elena Vance** | Senior Staff Engineer (Remote, macOS) | Constant back-to-back technical reviews; cloud bot recording tools (e.g., Otter, Fireflies) are banned under company IP policy; forgets action items buried in terminal sessions. | 100% offline Whisper.cpp + Ollama processing compliant with strict enterprise IP; action items persist in local SQLite; zero cloud bot joining the call. |
| **Marcus Chen** | Agency Founder & Design Director | High-context client calls; hates cluttered UI covering Figma and design canvases; traditional apps distract clients and disrupt flow. | Invisible notch footprint; liquid-glass aesthetics complement macOS design; instant drag-and-drop transcript export to client Markdown deliverables. |
| **Amina Al-Mansoor** | Product Lead & Scrum Master | Runs 6–8 meetings daily; manually tracking action items across fragmented Jira tickets and Apple Notes causes cognitive exhaustion. | Automated action item extraction categorized by assignee; visual timeline scrubber for quick re-listening; Pip notifies before next standup with overdue items. |
| **Julian Keller** | Privacy Researcher & Security Auditor | Deep skepticism of AI apps phoning home; inspects outgoing network sockets; needs auditable open storage formats. | Fully offline architecture; inspectable SQLite database with open schema; zero cloud API keys needed; model weights stored locally. |

---

### 3. Problem Statement

1. **The Invasive Meeting Bot Dilemma:** Current AI meeting tools inject artificial participants ("Elena's Notetaker Bot") into Zoom/Google Meet calls, creating social awkwardness, consent friction, and immediate security rejections from enterprise infosec teams.
2. **Window Management Fatigue:** Modern knowledge workers already juggle dozens of open tabs, IDEs, Slack, and Figma. Having another full-window application for notes clutters screen real estate and interrupts deep focus.
3. **Data Sovereignty & Compliance Risks:** Transmitting confidential internal discussions, legal negotiations, and intellectual property to third-party SaaS LLMs violates data sovereignty mandates (GDPR, HIPAA, SOC 2, proprietary NDAs).
4. **Sterile, Lifeless Utility Tools:** Existing utility tools are cold, utilitarian, and forgettable. Users abandon them because they feel like tedious administrative software rather than an engaging partner.

---

### 4. Product Principles

1. **Zero Leaks, Zero Telemetry:** Privacy is non-negotiable. Nook shall never initiate an unrequested outbound network call. All inference happens on local hardware (Metal/Vulkan/CPU).
2. **Invisible by Default:** If Nook does not have active utility to deliver, it collapses into the hardware bezel. No desktop icons, no persistent canvas windows, no dock badges unless explicitly configured.
3. **Delightful Anthropomorphism via Pip:** The interface is not just an audio meter; it is an organic companion. Pip's micro-expressions build emotional connection, signal system state intuitively, and reduce meeting fatigue.
4. **Frictionless Spatial Interaction:** Interacting with Nook should take sub-second muscle memory: hover to expand, drag-and-drop to ingest, hotkey to command, voice prompt to recall.
5. **Radical Data Portability:** User data is stored in standard SQLite and plain Markdown. Users can open, query, back up, or delete their raw database at any time using external tools.

---

### 5. Detailed User Stories

#### 5.1 Capture & Real-time Transcription (Epic 1)
- **US-1.1:** *As a user on a video call, I want to click the collapsed notch or press `Cmd+Shift+Space` so that Nook immediately begins recording both system loopback audio and my microphone without joining a bot to the call.*
  - **Acceptance Criteria:** Audio recording begins within <100ms; Pip transitions from `idle` to `listening` (putting on tiny headphones); waveform animation pulses in the notch wing.
- **US-1.2:** *As a meeting participant, I want real-time local transcription displayed discreetly in the expanded notch wings so that I can verify that my speech is captured accurately.*
  - **Acceptance Criteria:** Real-time stream generated by local Whisper.cpp with streaming latency under 1.2s; text renders in SF Pro Text with high contrast.
- **US-1.3:** *As a user in a sensitive meeting, I want to tap a physical hardware mute or notch button so that transcription immediately pauses without losing prior context.*
  - **Acceptance Criteria:** Pip displays `shushing` / `snooze` reaction; audio buffer immediately flushes; visual red slash indicator appears over mic icon.

#### 5.2 Synthesis, Action Items & Memory (Epic 2)
- **US-2.1:** *As a meeting owner ending a call, I want Nook to automatically synthesize the transcript using a local LLM so that I receive an executive summary, key decisions, and prioritized action items within 15 seconds.*
  - **Acceptance Criteria:** Processing runs automatically via local Ollama; summary structured into *Executive Overview*, *Decisions Made*, and *Action Items (with detected Owner & Due Date)*; SQLite stores the result.
- **US-2.2:** *As a project lead, I want action items to persist in an actionable checklist inside the notch so that I can check them off without switching to an external task manager.*
  - **Acceptance Criteria:** Clicking the Action Items tab reveals interactive checkboxes; checking an item triggers Pip's `celebrate` animation and persists state in SQLite.
- **US-2.3:** *As a knowledge worker juggling multiple projects, I want cross-meeting memory so that I can ask Pip questions across all historical meetings.*
  - **Acceptance Criteria:** Entering "What budget did Sarah approve for Q3?" queries local vector embeddings and returns the exact citation, meeting title, date, and transcript quote.

#### 5.3 Mascot Interaction & Voice Commands (Epic 3)
- **US-3.1:** *As a hands-free user during coding or drafting, I want to say "Hey Pip, take a note" or "Hey Pip, who has the follow-up?" so that Nook wakes up without mouse interaction.*
  - **Acceptance Criteria:** Local wake-word engine detects "Hey Pip" with <3% false positives; Pip's eyes widen, ears perk, and notch expands smoothly to receive voice query.
- **US-3.2:** *As an engaged user, I want Pip to display mood-based animations corresponding to meeting sentiment (e.g., curious when a question is asked, surprised during high audio volume, relaxed during steady dialogue).*
  - **Acceptance Criteria:** Sprite manager updates Pip's active reaction state from `reactions.png` based on heuristic sentiment and audio energy analysis.
- **US-3.3:** *As a user who appreciates customization, I want to dress Pip in different unlockable or selectable outfits (e.g., Detective, Coffee Lover, Focus Headband) so that the app feels deeply personal.*
  - **Acceptance Criteria:** Outfit selection dialog rendered inside expanded notch; selected outfit renders composite overlay sprites onto Pip across all animations.

#### 5.4 Spatial Notch Experience & Workflow Integration (Epic 4)
- **US-4.1:** *As a user reviewing a past meeting, I want an interactive visual timeline mode showing audio energy, speaker changes, and key decision pins so that I can scrub directly to critical moments.*
  - **Acceptance Criteria:** Horizontal timeline renders with waveform bars; pins mark action items; dragging playhead synchronizes transcript view and local audio playback.
- **US-4.2:** *As a user with pre-recorded audio or external voice memos, I want to drag an MP3/M4A/WAV file directly onto the notch so that Nook ingests, transcribes, and summarizes it immediately.*
  - **Acceptance Criteria:** Notch expands into a glowing drop zone on drag hover; dropping file triggers background Whisper.cpp pipeline with a progress ring around Pip.
- **US-4.3:** *As a user running Obsidian or Apple Notes, I want a simple local plugin system so that summaries and action items automatically sync to my local Markdown vault on meeting completion.*
  - **Acceptance Criteria:** Sandboxed plugin script executes post-processing hook; writes formatted Markdown file to user-specified local folder path.

---

### 6. Success Metrics & Key Performance Indicators (KPIs)

| Metric | Target Goal | Measurement Method |
| :--- | :--- | :--- |
| **Privacy Integrity** | **0 bytes** sent to external WAN | Monitored via Little Snitch / Wireshark integration test suites |
| **Notch Activation Latency** | **< 16ms** (60 FPS / 120 FPS ProMotion) | Native CoreAnimation frame rendering benchmarks |
| **Transcription Latency** | **< 1.2x real-time** on Apple Silicon (M1+) | Audio stream buffer timestamp vs transcript emission timestamp |
| **Summary Generation Speed** | **< 20 seconds** for a 30-minute meeting | Local Ollama inference time on 8B quantized model (e.g. Llama 3.2 3B/8B) |
| **Wake Word False Trigger Rate** | **< 1 false positive** per 8-hour workday | Ambient acoustic validation dataset test |
| **Memory Footprint (Idle)** | **< 120 MB RAM** (Notch UI + Mascot Engine) | Activity Monitor Resident Memory Size |
| **Daily Active Retention (D30)** | **> 65%** | Anonymized local persistence check (user-observable days active) |

---

### 7. Out of Scope (Non-Goals)

- **Cloud Sync & Remote Backup:** Nook will not provide managed cloud hosting, user sync accounts, or centralized login portals. Users can sync their local SQLite file via iCloud Drive, Dropbox, or Git if they choose.
- **Live Meeting Bot Joining:** Nook will never join Google Meet, Zoom, or Teams as a virtual SIP/WebRTC participant bot. All capture is performed via native macOS loopback audio.
- **Complex Multi-Tenancy & Team Dashboards:** Nook is a personal executive assistant. Team rollups and enterprise team dashboards are excluded from the core product architecture.
- **Proprietary Closed File Formats:** No binary proprietary note archives. All data remains accessible in plain SQLite tables and Markdown exports.
