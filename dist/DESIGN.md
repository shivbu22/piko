# UI/UX Design Specification (DESIGN.md)
## Nook — The Invisible, Local-First AI Meeting Companion

**Document Version:** 1.0.0  
**Design Language:** Futuristic Liquid Glass (Dark Mode Primary)  
**Target Release:** Version 3.0  
**Author:** Design Lead & Interface Architect  

---

### 1. Design Philosophy & Aesthetic Pillars

1. **Futuristic Liquid Glass:** The notch does not feel like an opaque rectangular modal; it appears as an organic, viscous liquid glass bubble adhering to the hardware screen bezel. It features multi-layered specular highlights, backdrop Gaussian blur, and a sub-surface refraction glow.
2. **Spatial Restraint (Invisible by Default):** UI controls only materialize when invoked. The default resting state takes zero functional screen estate away from work.
3. **Warm Anthropomorphism via Pip:** Nook avoids cold, clinical enterprise AI styling. Pip brings warmth, tactile squishiness, and delight through subtle micro-animations that make meeting capture feel human.
4. **Instant Tactile Feedback:** Every interaction has an immediate visual and haptic-style response: springs with physical momentum, fluid liquid morphing, and gentle glowing pulses.

---

### 2. Notch Architecture & Spatial States (State Machine)

The Nook interface operates as a deterministic 6-state spatial state machine.

```
       +---------------------------------------------------+
       |              STATE 0: COLLAPSED PILL              |
       |  Hardware Notch: Flush with Bezel (0pt visible)   |
       |  Floating Mode:  160pt x 34pt subtle black pill   |
       +---------------------------------------------------+
             |                                       ^
    Hover or | Hotkey                       Mouse Out| (if no active session)
             v                                       |
       +---------------------------------------------------+
       |             STATE 1: COMPACT ACTIVE               |
       |  Pip centered + Status Pill + Rec Ready Button     |
       |  Dimensions: 220pt x 42pt                         |
       +---------------------------------------------------+
             |                                       ^
     Click Rec /                             Stop Rec|
      Mic Active                                     |
             v                                       |
       +---------------------------------------------------+
       |          STATE 2: EXPANDED RECORDING              |
       |  Left Wing: Live Waveform | Center: Pip Listening  |
       |  Right Wing: Streaming Words + Elapsed Timer      |
       |  Dimensions: 460pt x 52pt                         |
       +---------------------------------------------------+
             |                                       ^
     Click Drawer /                          Collapse| Button
      Meeting Finished                               |
             v                                       |
       +---------------------------------------------------+
       |             STATE 3: FULL DRAWER                  |
       |  Multi-tab: Summary | Action Items | Timeline     |
       |  Dimensions: 640pt x 480pt                        |
       +---------------------------------------------------+
             |                                       ^
     Click "Ask Pip" /                       Back to | Drawer
      Hotkey Cmd+Shift+K                             |
             v                                       |
       +---------------------------------------------------+
       |             STATE 4: CHAT FLYOUT                  |
       |  Conversational Pip Q&A + Historical Memory Graph  |
       |  Dimensions: 520pt x 440pt                        |
       +---------------------------------------------------+

       [STATE 5: MINIMIZED / FOCUS MODE]
       - System DND active: Pip snoozes with headband.
       - Dimensions: 120pt x 28pt (Ultra-compact indicator).
```

#### Detailed State Geometry & Specs

| State ID | State Name | Dimensions (W × H) | Corner Radius | Visual Elements Present |
| :--- | :--- | :--- | :--- | :--- |
| **S-0** | Collapsed Pill | 160pt × 34pt (Floating) / 0pt (Hardware Notch flush) | 17pt | Seamless with MacBook bezel; Pip peeks down 4pt on hover. |
| **S-1** | Compact Active | 220pt × 42pt | 21pt | Pip centered, subtle audio ready dot, quick record trigger icon (`#E07A5F`). |
| **S-2** | Expanded Recording | 460pt × 52pt | 26pt | Live 16-bar stereo audio waveform (left), Pip with headphones (center), streaming real-time tokens + timer (right). |
| **S-3** | Full Drawer | 640pt × 480pt | 28pt | Segmented tab bar, markdown summary pane, interactive action checklist, scrubbable audio timeline. |
| **S-4** | Chat Flyout | 520pt × 440pt | 28pt | Pip avatar in corner, message bubbles, citation cards, local prompt input pill with mic trigger. |
| **S-5** | Focus / Snooze | 120pt × 28pt | 14pt | Sleepy Pip face, soft purple/slate ambient indicator, notification suppression badge. |

---

### 3. Layout, Spacing & Grid System

- **Base Unit:** 4pt grid system with 8pt standard structural rhythm.
- **Padding Tokens:**
  - Micro: `4pt` (badge and tag insets)
  - Small: `8pt` (button inner padding, icon gaps)
  - Medium: `16pt` (card interior padding, wing margins)
  - Large: `24pt` (drawer sections, modal headers)
  - Screen Edge Margins: `12pt` top inset on non-notched displays.
- **Corner Curvature:** Apple `Continuous` corner style (Squircle) applied across all panels. No sharp chamfers or circular pills when expanded.
- **Backdrop Blur Material:**
  - Dark Mode: `NSVisualEffectView.Material.hudWindow` with 40pt Gaussian blur and 75% dark tint.
  - Light Mode: `NSVisualEffectView.Material.headerView` with 50pt Gaussian blur and 60% white tint.

---

### 4. Color System

#### 4.1 Primary & Surface Palette (Dark Mode Primary)

```css
/* Dark Mode Base Tokens */
--bg-notch-surface:       rgba(13, 14, 18, 0.82);   /* Ultra-deep OLED obsidian glass */
--bg-notch-elevated:      rgba(26, 28, 36, 0.75);   /* Card surfaces inside drawer */
--bg-notch-inset:         rgba(8, 9, 12, 0.60);    /* Input boxes & timeline tracks */
--border-glass-specular:  rgba(255, 255, 255, 0.12);/* Liquid top specular rim */
--border-glass-subtle:    rgba(255, 255, 255, 0.06);/* Inner separator lines */

/* Text & Foreground Tokens */
--text-primary:           #F7F8F8;                  /* Pure crisp heading white */
--text-secondary:         #9EA3AE;                  /* Muted metadata & secondary labels */
--text-tertiary:          #656976;                  /* Timestamp & inactive indicators */

/* Accent & Status Colors */
--accent-coral:           #E07A5F;                  /* Primary brand glow & record button */
--accent-coral-glow:      rgba(224, 122, 95, 0.28); /* Ambient liquid backlight */
--accent-coral-active:    #D1694E;                  /* Pressed state */
--status-recording-red:   #FF453A;                  /* Live microphone indicator */
--status-success-green:   #34C759;                  /* Completed action items */
--status-focus-indigo:    #6366F1;                  /* Focus mode glow */
```

#### 4.2 Light Mode Secondary Palette

```css
/* Light Mode Base Tokens */
--bg-notch-surface:       rgba(255, 255, 255, 0.85);/* Frosted milk glass */
--bg-notch-elevated:      rgba(245, 245, 247, 0.80);
--bg-notch-inset:         rgba(230, 232, 236, 0.65);
--border-glass-specular:  rgba(255, 255, 255, 0.90);
--border-glass-subtle:    rgba(0, 0, 0, 0.08);

--text-primary:           #1D1D1F;
--text-secondary:         #6E6E73;
--text-tertiary:          #86868B;
--accent-coral:           #D86B50;
--accent-coral-glow:      rgba(216, 107, 80, 0.20);
```

#### 4.3 Pip Mascot Palette Tokens

```css
--pip-cream-body:         #F5E6D3;  /* Base dumpling skin */
--pip-peach-shading:      #F2C4A8;  /* Sub-surface cheek and belly shadow */
--pip-blush-coral:        #F7A072;  /* Cheerful cheek blush spots */
--pip-eye-pupil:          #1A1A24;  /* Deep anime glossy eye pupil */
--pip-eye-sparkle:        #FFFFFF;  /* Crisp ocular light reflections */
--pip-accessory-coral:    #E07A5F;  /* Tiny headphones, bow ties, headbands */
```

---

### 5. Typography

**Type Family:** System San Francisco (`SF Pro Display`, `SF Pro Text`, `SF Pro Rounded`) exclusively.

| Token | Family | Weight | Size | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `notch-display-lg` | SF Pro Display | Bold (700) | 22pt | 28pt | -0.4pt | Meeting titles in Full Drawer |
| `notch-display-md` | SF Pro Display | Semibold (600) | 16pt | 22pt | -0.2pt | Section headers, modal titles |
| `notch-body` | SF Pro Text | Regular (400) | 13pt | 18pt | 0.0pt | Summaries, transcripts, chat text |
| `notch-body-bold` | SF Pro Text | Medium (500) | 13pt | 18pt | 0.0pt | Action item tasks, button text |
| `notch-caption` | SF Pro Text | Regular (400) | 11pt | 14pt | +0.1pt | Timestamps, speaker badges |
| `pip-speech-bubble` | SF Pro Rounded | Semibold (600) | 12pt | 16pt | -0.1pt | Pip dialogue, playful tooltips |
| `notch-mono-timer` | SF Pro Text | Medium (500) | 12pt | 14pt | Monospaced | Meeting elapsed recording clock |

---

### 6. Motion, Animation & Fluid Physics

All transitions utilize continuous CoreAnimation / SwiftUI spring mechanics rather than linear easings to emulate realistic surface tension.

#### Animation Tokens
- **Spring Liquid Morph:** `response: 0.42s`, `dampingFraction: 0.78`, `blendDuration: 0.15s`  
  *Used for:* Notch expansion from Collapsed Pill into Expanded Recording wings.
- **Drawer Slide & Bloom:** `response: 0.50s`, `dampingFraction: 0.82`, `blendDuration: 0.20s`  
  *Used for:* Opening State 3 (Full Drawer).
- **Pip Micro-Bounces:** `response: 0.28s`, `dampingFraction: 0.65`  
  *Used for:* Pip emotion switches, task completion cheer.
- **Waveform Pulse:** Interpolated 60 FPS frame refresh using audio RMS energy smoothing filter (`alpha = 0.35`).

---

### 7. Interaction Model

#### 7.1 Mouse & Gesture Interactions
- **Hover on Collapsed Notch:** Expands 4pt revealing Pip's glistening eyes peeking downward. If held for 350ms, morphs into State 1 (Compact Active).
- **Click on Pip:** Toggles the quick-action radial popover (Record / Search / Outfits / Mute).
- **Drag & Drop Target:** Dragging an audio file or markdown note over the top notch triggers an iridescent glowing border (`#E07A5F`); dropping starts ingestion.
- **Scroll Wheel over Timeline:** Scrubs backwards/forwards through audio with magnetic snap-to-speech-turns.

#### 7.2 Global Keyboard Shortcuts
- `Cmd + Shift + Space`: Primary Record Toggle (Start / Stop).
- `Cmd + Shift + N`: Open / Close Full Drawer.
- `Cmd + Shift + K`: Open "Ask Pip" Multi-Meeting Memory.
- `Escape`: Instantly collapses any expanded notch back to Collapsed Pill.

---

### 8. Micro-Interactions & Empty States

1. **Pip Peek:** When the user enters an active Zoom/Meet window, Pip peeks from the notch, tilting their head with a subtle question mark bubble: *"Record this?"*
2. **Audio Waveform Energy:** The recording wings don't use boring flat bars. They render liquid audio droplets that swell and glow in coral `#E07A5F` when human voice frequencies are active.
3. **Empty Notes State:** When no meetings exist, Pip sits on a tiny drawing pad holding a pencil, looking curiously at the user with the prompt: *"Waiting for your first meeting... Drop an audio file or click Record!"*
4. **Task Check-off Celebration:** Clicking an action item checkbox causes Pip to jump, emit 4 tiny pastel star particles, and emit a soft bamboo-style chime.
