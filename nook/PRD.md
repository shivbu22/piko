# Nook – Product Requirements Document (PRD)

**Version:** 3.0  
**Status:** Final for Development  
**Last Updated:** 2026-10-06

## 1. Vision
Nook is a privacy-first, local-only AI note-taker that lives entirely inside a futuristic desktop notch.  
There is no traditional application window or dashboard. All interaction happens through an elegant, expandable notch powered by a highly animated mascot named **Pip**.

Nook records meetings, transcribes them locally, summarizes with a local LLM, extracts and tracks action items, and allows rich conversation with past meetings — all while keeping every piece of data on the user’s machine.

**Tagline:** “Your meetings live in the notch.”

## 2. Goals
- Deliver a delightful, always-available meeting companion that feels magical and native.
- Guarantee complete privacy (zero cloud, zero telemetry, zero accounts).
- Make capturing and reviewing meetings faster than any traditional note-taking app.
- Create an emotional connection through the mascot Pip.
- Remain fully functional offline after the first model download.

## 3. Target Users
- Knowledge workers, founders, and managers who attend many meetings.
- Privacy-conscious professionals who refuse to send meeting audio to the cloud.
- Developers and power users who love local-first tools and beautiful desktop experiences.
- macOS users as primary audience (Windows/Linux as secondary).

## 4. Problem Statement
Existing AI meeting tools either:
- Require cloud processing (privacy risk), or
- Are heavy desktop applications that interrupt workflow.

Users need a lightweight, always-present, private way to capture and extract value from meetings without breaking focus.

## 5. Product Principles
1. Notch-first (no traditional windows)
2. Local-first & offline-capable
3. Emotionally delightful through Pip
4. Calm and non-intrusive
5. Extremely fast to start a meeting (≤ 2 interactions)
6. Open source and transparent

## 6. Key User Stories

**As a user, I want to:**
- Start recording a meeting instantly from the notch so I never miss the beginning.
- See a live transcript and waveform while recording.
- Have Pip automatically summarize the meeting and extract action items when I stop.
- Ask questions about past meetings directly inside the notch.
- Receive gentle reminders about unfinished action items from Pip.
- Use voice commands (“Hey Pip, start meeting”).
- Switch between recent meetings without leaving the notch.
- Drag files onto the notch to add context to the next meeting.
- Keep everything completely private and offline.

## 7. Success Metrics
- Time from launch to first recording < 10 seconds
- Percentage of meetings that receive a summary > 90%
- User retention (weekly active) > 40% after 30 days
- Average action-item completion rate (self-reported)
- Qualitative feedback on Pip’s cuteness and usefulness

## 8. Out of Scope (v3)
- Cloud sync
- Multi-user collaboration
- Mobile app (beyond possible future companion)
- Real-time multi-speaker translation
- Integration with proprietary cloud AI providers
