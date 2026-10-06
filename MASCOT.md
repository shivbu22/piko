# Nook – Mascot Ecosystem & Character Roster

**Version:** 3.1.0  
**Attribution & Base System:** Derived from and inspired by [r2dapps/cute-mascot](https://github.com/r2dapps/cute-mascot) and `page-mascot`.

---

## 1. Mascot Roster & Superpowers

All characters are procedurally rendered in high-definition dynamic Canvas2D with spring physics, cursor gaze tracking, and real-time meeting superpowers.

| Mascot | Species | Accent Color | Superpower Ability | Custom Voice Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Pip** | Mochi Dumpling | `#E07A5F` (Coral) | **Action Item Hunter:** Automatically highlights and extracts high-urgency checkboxes and deadlines from meetings. | Pitch: 1.25, Rate: 1.05 |
| **Kiko** | Kitsune Fox | `#FF8A00` (Amber) | **Instant TL;DR:** Synthesizes bulleted recaps under 60 seconds with 3 key decisions. | Pitch: 1.15, Rate: 1.12 |
| **Milo** | Calico Boba Cat | `#F4A261` (Warm Honey) | **Focus Shield (DND):** Blocks distractions and silences notifications during intense sprints. | Pitch: 1.35, Rate: 1.00 |
| **Boba** | Matcha Tree Frog | `#52B788` (Matcha Green) | **Energy & Hydration Chime:** Gentle mindfulness and posture check-ins every 45 minutes of meeting time. | Pitch: 1.05, Rate: 1.15 |
| **Nori** | Tuxedo Penguin | `#4EA8DE` (Glacier Blue) | **Obsidian Markdown Sync:** One-click two-way vault syncing with frontmatter and YAML tags. | Pitch: 0.95, Rate: 1.08 |
| **Aero** | Cyber Orb Drone | `#9D4EDD` (Neon Violet) | **Ollama Deep Synthesis:** Activates local LLM multi-pass debate to extract hidden risks and sentiment. | Pitch: 1.45, Rate: 1.20 |
| **Nova** | Cosmic Star Bunny | `#FF70A6` (Starlight Pink) | **Brainstorm Spark:** Generates creative follow-up questions and divergent ideas on any agenda item. | Pitch: 1.40, Rate: 1.10 |

---

## 2. 9-State Emotional Reaction Engine

Each character features 9 distinct procedural emotional reactions:

```
+------------------+------------------+------------------+
|      Blink       |    Love (Heart)  | Sparkle (Celebrate)|
+------------------+------------------+------------------+
|  Surprise (Alert)|       Wink       |      Blush       |
+------------------+------------------+------------------+
|   Sleepy (Zzz)   |   Dizzy (Spiral) |   Think (Ponder) |
+------------------+------------------+------------------+
```

### Reaction Triggers:
1. **Idle:** Smooth breathing oscillation, eye blinking at Poisson intervals.
2. **Listening:** Ear/antenna perk, rhythmic bobbing to audio waveform amplitude.
3. **Thinking:** Eye orbit, subtle luminescent aura, pulsing glow.
4. **Talking:** Jaw and eye tracking speech cadence.
5. **Alert / Surprise:** Eye widening (O_O), sudden vertical hop.
6. **Celebrating:** Confetti burst, double bounce, sparkle stars.
7. **Sleeping:** Closed curved eyes with drifting "Zzz" particles.
8. **Dizzy:** Spiral pupil rotations on rapid mouse clicks.
9. **Blush / Love:** Floating hearts and rosier cheek blushes on booping.

---

## 3. Interactive Mascot Studio

The Mascot Studio is accessible directly from the Notch drawer:
- **Tab 1: Mascot Roster:** Live 42px interactive canvas preview for all 7 mascots, equip button, and 1-click active superpower activation.
- **Tab 2: Powers & Voice:** Ability breakdown, live 9-expression test bench, and Web Speech Synthesis voice tester with species-tuned pitch & speed.
- **Tab 3: Wardrobe:** Seasonal accessories and outfits (Chef Hat, Studio Headphones, Wizard Cap, Glasses, Winter Scarf, Party Crown, Sleep Cap).

---

## 4. Architectural Highlights
- **Procedural Canvas2D (`PipCanvas.tsx`):** Zero sprite sheet pixelation or download lag; renders with device pixel ratio scaling (`window.devicePixelRatio`).
- **Spring Physics (`PipEngine.ts`):** Velocity damping and squish deformation on cursor dragging and poke gestures.
- **Persistence (`StorageEngine.ts`):** Active species and outfit are saved locally to `localStorage` (`nook_mascot_species_v3`).
- **Zero Network Egress:** 100% offline, local-first execution.

---

## 5. LLM Gesture Protocol & Conversational Training

The mascot companion responds to chat with full physical Canvas expressions and voice synthesis via the **Gesture Protocol**:

| User Chat Trigger | LLM Gesture Tag | Physical Canvas Reaction | Voice Tone |
| :--- | :--- | :--- | :--- |
| `"hii"`, `"hello"`, `"hey"`, greetings | `[gesture:celebrate]` | Happy arc eyes, victory double-bounce, waving | High & cheerful chime |
| `"love you"`, `"thanks"`, compliments | `[gesture:love]` | Heart Eyes (`❤️`), deep pink cheek glow, bounce | Warm & loving |
| `"you're cute"`, `"sweet"`, flattery | `[gesture:blush]` | Radiant peach blush cheek spots, squishy boop | Shy & playful |
| `"urgent"`, `"deadline"`, `"asap"` | `[gesture:alert]` | Wide surprise eyes (`O_O`), vertical alertness hop | Fast & alert |
| Questions, memory search, tasks | `[gesture:think]` | Upward pondering gaze, thinking cycle | Thoughtful & calm |
| `"goodnight"`, `"bye"`, `"sleep"` | `[gesture:sleep]` | Sleep crescents, floating `Zzz` bubbles | Soft & drowsy |
| `"spin"`, `"dizzy"`, jokes | `[gesture:dizzy]` | Cartoon spiral pupils (`🌀`), rapid squish spin | Silly & playful |

### Training Assets Included:
- **`train_llm_gestures/train_gestures_dataset.jsonl`**: Curated multi-turn training dataset.
- **`train_llm_gestures/Modelfile`**: Ready-to-build Ollama model specification (`ollama create nook-mascot -f ./Modelfile`).
- **`train_llm_gestures/train_lora.py`**: PyTorch + HuggingFace PEFT LoRA fine-tuning script.
- **`train_llm_gestures/test_gesture_runner.py`**: Validation runner for gesture extraction and reaction dispatch.

