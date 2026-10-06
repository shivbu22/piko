# Technical Requirements Document (TRD)
## Nook — The Invisible, Local-First AI Meeting Companion

**Document Version:** 1.0.0  
**Target Release:** Version 3.0  
**Status:** Approved / Engineering Blueprint  
**Primary Tech Stack:** Swift 5.10 / SwiftUI + NSPanel (Primary macOS) | Tauri 2 + Rust + WebKit (Cross-Platform) | Whisper.cpp (Metal/ggml) | Ollama (Local REST API) | SQLite3 + sqlite-vec  

---

### 1. Technical Goals & Non-Negotiables

1. **Native Display Notch Geometry Snapping:** Seamless integration with MacBook Pro hardware display notches (`NSScreen.auxiliaryTopLeftArea` / `auxiliaryTopRightArea`), expanding smoothly from notch coordinates.
2. **Deterministic Offline Operation:** Zero dependence on external cloud hosts, third-party authentication services, or CDN asset hosting. The entire application bundle must function inside a complete air-gapped network environment.
3. **Sub-Second Fluid UI Responsiveness:** UI rendering must sustain 60 FPS on standard displays and 120 FPS on Apple ProMotion displays. CPU overhead during idle notch presentation must remain `< 1.5%`.
4. **Isolated Modular Architecture:** Clear decoupling between Audio Ingestion, Automatic Speech Recognition (ASR), Large Language Model (LLM) Inference, Spatial Notch UI Shell, and Pip Mascot Sprite Renderer.

---

### 2. Platform Support & Execution Targets

#### 2.1 Primary Target (Tier 1): Native macOS
- **Operating Systems:** macOS 14.0 (Sonoma) and macOS 15.0+ (Sequoia).
- **Architectures:** Apple Silicon (ARM64: M1, M2, M3, M4 variants). Intel (x86_64) supported via CPU fallback.
- **Window Management System:** `NSPanel` with `.nonactivatingPanel` style mask, level `.floating` / `.statusBar`, transparent visual effect backdrop (`NSVisualEffectView` with `.hudWindow` / `.underWindowBackground` material).
- **Display Awareness:** Dynamic screen reconfiguration listener (`NSApplication.didChangeScreenParametersNotification`). Detects physical notch height (`screen.safeAreaInsets.top`) vs. external non-notched monitors (where Nook displays as a floating pill dynamic island).

#### 2.2 Secondary / Fallback Target (Tier 2): Cross-Platform (Windows & Linux)
- **Framework:** Tauri v2.0 (Rust backend with system tray / frameless window controller + WebKit/WebView2 frontend).
- **Audio Capture:** WASAPI Loopback (Windows) / PipeWire / PulseAudio monitor (Linux).
- **Mascot Renderer:** HTML5 2D Canvas sprite-sheet engine ported directly from `cute-mascot`.

---

### 3. Performance & System Resource Budgets

| Resource / Pipeline Stage | Hard Limit (Budget) | Target (Optimal) | Mitigation Strategy if Exceeded |
| :--- | :--- | :--- | :--- |
| **Idle Memory (RAM)** | `< 150 MB` | `< 90 MB` | Background timers paused; sprite animations dropped to 1 FPS when display sleeps. |
| **Active Recording + ASR** | `< 750 MB` (Whisper Base) | `~450 MB` | Ring-buffered PCM audio frames; model kept loaded in unified memory via ggml Metal buffer. |
| **Active LLM Summarization** | Host Ollama process limits | Dependent on model | Quantized 4-bit / 8-bit model selection (`llama3.2:3b` default; fallback to `qwen2.5:1.5b` on low RAM). |
| **Idle CPU Utilization** | `< 2.0%` single core | `< 0.8%` | Sprite engine enters low-power sleep tick (1 frame every 4 seconds) during inactivity. |
| **Peak Audio-to-Transcript Lag** | `< 1500 ms` | `< 800 ms` | VAD (Voice Activity Detection) segments speech chunks into 3-second overlapping sliding windows. |
| **Notch Expansion Physics** | Sustained 60/120 FPS | Drop 0 frames | Pure CoreAnimation spring curves with hardware-accelerated layer compositing. |

---

### 4. Security, Privacy & Permissions Architecture

```
+---------------------------------------------------------------------------------+
|                                 USER HARDWARE                                   |
|                                                                                 |
|  [ Microphone ] --------+                                                       |
|                         |-> [ CoreAudio / ScreenCaptureKit ]                     |
|  [ System Loopback ] ---+          |                                            |
|                                    v                                            |
|                     [ Ring Buffer (PCM Float32) ]                               |
|                                    |                                            |
|                                    v                                            |
|                     [ Local Whisper.cpp (Metal) ]                               |
|                                    |                                            |
|                                    v (Local Plaintext / Tokens)                 |
|                     [ SQLite (Encrypted / Local DB) ] <---> [ sqlite-vec ]      |
|                                    ^                                            |
|                                    | IPC (localhost:11434 REST)                 |
|                                    v                                            |
|                     [ Local Ollama Instance (Offline) ]                         |
|                                                                                 |
|  ====================== NO OUTBOUND NETWORK CALLS ============================= |
|  [ WAN Gateway / Cloud ]   <--- BLOCKED BY DEFAULT (Zero Telemetry Enforcement) |
+---------------------------------------------------------------------------------+
```

#### 4.1 System Permissions Required
1. **Microphone Access (`kTCCServiceMicrophone`):** Explicitly requested with custom usage description explaining local-only capture.
2. **Screen & System Audio Recording (`kTCCServiceScreenCapture`):** Required by macOS `ScreenCaptureKit` to tap system audio output loopback without requiring virtual sound cards (like BlackHole).
3. **Accessibility API (`kTCCServiceAccessibility`):** Optional; requested solely for global hotkey handling and active meeting window title detection (e.g. detecting "Zoom Meeting" to trigger auto-record suggestion).

#### 4.2 Data Storage Security
- Database location: `~/Library/Application Support/Nook/nook.db`.
- User-selectable database encryption using SQLCipher (AES-256) backed by the macOS System Keychain for key derivation.
- Zero analytics, zero crash-reporting pings to external endpoints (Sentry, PostHog, or Firebase are strictly prohibited).

---

### 5. Local Model Management & Orchestration

#### 5.1 Automatic Speech Recognition (ASR): Whisper.cpp
- **Binary / Library Distribution:** Embedded as a native static C++ library with Swift C-interop bridging (`WhisperKit` / custom `libwhisper.a`).
- **GPU Acceleration:** Apple Metal Shading Language (`ggml-metal.metal`) embedded in application bundle.
- **Model Storage:** `~/Library/Application Support/Nook/models/whisper/`.
- **Default Model:** `ggml-base.en.bin` (148 MB, fastest inference, ~16x real-time on M-series chips).
- **Advanced Model Options:**
  - `ggml-small.en.bin` (465 MB) for technical jargon / diverse accents.
  - `ggml-large-v3-turbo.bin` (1.5 GB) for multilingual enterprise environments.
- **Model Downloader:** Built-in verified SHA-256 download utility with resume capability; triggers only upon first onboarding or explicit user request.

#### 5.2 Local Large Language Model: Ollama Integration
- **Connection Method:** Local HTTP IPC via `http://127.0.0.1:11434/api/`.
- **Daemon Verification:** On launch, Nook probes the Ollama daemon via `GET /api/tags`.
  - If Ollama is running: Queries available models and matches against recommended presets (`llama3.2:3b`, `mistral:7b`, `qwen2.5:3b`, `deepseek-r1:8b`).
  - If Ollama is missing: Presents a one-click setup guide within the notch drawer offering automated installation via Homebrew or bundled background helper script.
- **Inference Mode:** Streaming Server-Sent Events (`/api/generate` and `/api/chat`) with JSON schema enforcement (`format: "json"`) for deterministic extraction of action items and summaries.

---

### 6. Integration Points & Subsystem Architecture

#### 6.1 Audio Capture & Processing Pipeline
- **System Audio Ingestion:** Utilizes macOS `ScreenCaptureKit` `SCStream` capturing audio-only (`capturesAudio = true`, `capturesVideo = false`). Eliminates virtual audio driver installations.
- **Mic Ingestion:** Utilizes `AVAudioEngine` input node configured for 16,000 Hz, mono channel, 32-bit floating point PCM.
- **Mixer / Resampler:** Custom CoreAudio ring buffer mixes microphone and system loopback into a single normalized 16kHz Float32 stream.
- **Voice Activity Detection (VAD):** Employs WebRTC VAD or Silero VAD C++ port to drop silent blocks, reducing Whisper compute cycles by up to 60%.

#### 6.2 Mascot System: cute-mascot Integration
- **Upstream Origin:** Personalization of `https://github.com/r2dapps/cute-mascot`.
- **SwiftUI Rendering Engine:** Re-implements cute-mascot's DOM/Canvas 3×3 sprite sheet logic into a high-performance native SwiftUI `Canvas` view or Metal shader.
- **Sprite Slicing Specification:**
  - Standard sheet size: 384×384 pixels (comprising 9 cells of 128×128 pixels in a 3×3 grid).
  - Assets: `directions.png` (spatial orientation: down, down-left, left, up-left, up, up-right, right, down-right, center) and `reactions.png` (emotional states: idle, happy, thinking, listening, alerting, sleeping, talking, surprised, celebrating).
- **Physics & Cursor Tracking:** Mouse position tracking via `NSEvent.addLocalMonitorForEvents(matching: .mouseMoved)`. Maps cursor vector relative to notch center to one of the 8 directional sprite frames with dampening.

#### 6.3 Semantic Memory Engine
- **Vector Storage:** Embedded `sqlite-vec` extension dynamically loaded into SQLite3.
- **Embedding Generation:** Computed locally via Ollama embeddings endpoint (`POST /api/embeddings` using `nomic-embed-text` or `all-minilm`).
- **Hybrid Retrieval:** Reciprocal Rank Fusion (RRF) combining SQLite Full-Text Search (FTS5) BM25 score with vector cosine similarity.

---

### 7. Constraints & Assumptions

1. **Host Hardware Assumption:** The primary user machine is assumed to be an Apple Silicon Mac (M1 or newer with minimum 8GB Unified Memory). Intel Macs are supported with higher latency and reduced model size presets.
2. **Display Resolution Awareness:** External monitors without hardware notches require programmatic pill anchoring at top-center (`(NSScreen.main.frame.width - pillWidth) / 2`).
3. **No Network Proxy Bypass:** If the user machine is on a corporate VPN with locked-down loopback interfaces, local HTTP calls to `127.0.0.1:11434` must not be intercepted by system proxies.
4. **App Sandbox Considerations:** If distributed outside the Mac App Store (direct notarized DMG distribution), Nook can bundle Whisper.cpp and interact freely with local Ollama IPC without Sandbox entitlement limitations.
