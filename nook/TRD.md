# Nook – Technical Requirements Document (TRD)

**Version:** 3.0  
**Last Updated:** 2026-10-06

## 1. Technical Goals
- Deliver a native-feeling notch experience with 60 fps animations.
- Support fully offline operation after initial model download.
- Keep binary size and memory footprint reasonable.
- Make the mascot system extensible and easy to re-skin.
- Ensure all user data remains under user control.

## 2. Platform Support
- **Primary:** macOS 14+ (native SwiftUI + NSPanel for perfect notch behavior)
- **Secondary:** Windows 10/11 and Linux (Tauri 2 transparent always-on-top window)

## 3. Performance Requirements
- Notch expand/collapse animation ≤ 300 ms
- Live transcription latency < 800 ms
- Summary generation for 30-min meeting < 25 seconds on M1/M2/Ryzen 7 class hardware
- Memory usage (idle) < 150 MB
- CPU usage (idle) < 2%

## 4. Security & Privacy Requirements
- No network requests except optional model download (user-initiated)
- No telemetry of any kind
- All data stored in a single user-controlled directory
- Audio files and transcripts encrypted at rest (optional passphrase)
- Models run exclusively on-device

## 5. Offline Capabilities
- Full recording, transcription, summarization, search, and chat must work with zero network after models are present.

## 6. Model Management
- Primary: Ollama
- Fallback: llama.cpp / MLX
- Transcription: Whisper.cpp or faster-whisper
- Embeddings: nomic-embed-text or equivalent small model
- One-click model download and switching from inside the notch settings

## 7. Mascot Integration
- Base engine adapted from https://github.com/r2dapps/cute-mascot
- Custom Pip character using standard 3×3 sprite sheets
- Support for additional reaction states beyond the original set

## 8. Constraints & Assumptions
- User has enough disk space for models (3–8 GB)
- Microphone permission is granted
- On macOS, Accessibility / Screen Recording permissions may be required for advanced features
