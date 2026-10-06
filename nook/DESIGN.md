# Nook – UI/UX Design Specification

**Version:** 3.0  
**Last Updated:** 2026-10-06

## 1. Design Principles
- Notch-first, never window-first
- Calm, warm, and slightly magical
- Pip is the emotional interface
- Liquid, smooth, high-quality motion
- Dark mode is the primary experience

## 2. Notch States & Transitions
1. **Collapsed** – Minimal notch, Pip partially visible, status text
2. **Recording** – Expanded with live waveform, transcript preview, timer
3. **Processing / Thinking** – Pip thinking animation + progress
4. **Result** – Summary + checkable Action Items
5. **Transcript** – Full timestamped transcript with audio scrubbing
6. **Chat** – Mini chat interface with streaming replies
7. **Timeline** – Horizontal visual timeline of the meeting
8. **Quick Actions** – Radial or vertical menu
9. **Settings** – Lightweight settings panel inside notch

All transitions use smooth liquid morphing (not simple scale).

## 3. Color Palette

### Dark Mode (Primary)
| Role              | Hex       |
|-------------------|-----------|
| Background        | `#1C1917` |
| Surface           | `#292524` |
| Primary Accent    | `#E07A5F` |
| Text Primary      | `#F5F5F4` |
| Text Secondary    | `#A8A29E` |
| Border            | `#44403C` |
| Pip Body          | `#F5E6D3` |
| Pip Accent        | `#F2C4A8` |
| Success           | `#7C9A82` |

### Light Mode (Secondary)
| Role              | Hex       |
|-------------------|-----------|
| Background        | `#FBF9F7` |
| Surface           | `#FFFFFF` |
| Primary Accent    | `#E07A5F` |
| Text Primary      | `#1C1917` |
| Text Secondary    | `#78716C` |

## 4. Typography
Use **SF Pro** exclusively (macOS system font).

- Large Title: SF Pro Display, Semibold/Bold, 22–28 pt
- Title: SF Pro Display, Semibold, 17–20 pt
- Body: SF Pro Text, Regular, 14–15 pt
- Caption: SF Pro Text, Regular, 12–13 pt
- Timestamps: SF Mono, Regular, 12 pt

## 5. Spacing & Layout
- Base unit: 8 px
- Notch corner radius: highly rounded (pill-like)
- Expanded content padding: 16–24 px
- Soft shadows only

## 6. Motion Guidelines
- Expand/collapse: ≤ 300 ms, spring physics
- Pip animations: 60 fps, rubbery/squishy feel
- Content transitions: soft cross-fade + slight scale
- Respect Reduce Motion accessibility setting

## 7. Interaction Model
- Global hotkey: ⌘⇧N or ⌃⌥N
- Single click: expand/collapse
- Drag files onto notch: attach context
- Scroll: switch views
- Swipe gestures: quick actions
- Long-press / right-click: Quick Actions menu
- Escape or click outside: collapse
