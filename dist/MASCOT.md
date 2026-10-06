# Nook – Mascot Specification (Pip)

**Version:** 3.0  
**Last Updated:** 2026-10-06

## 1. Character Overview
- **Name:** Pip
- **Personality:** Quiet, helpful, slightly shy, warm, and encouraging
- **Visual Style:** Soft, round, cream + soft peach dumpling/mochi-like creature with big shiny eyes and tiny arms
- **Role:** Emotional center of the entire Nook experience

## 2. Source & Personalization
Base system: [https://github.com/r2dapps/cute-mascot](https://github.com/r2dapps/cute-mascot)

We personalize it completely for Nook by creating a custom character named **Pip** using the standard 3×3 sprite sheet format.

**Required Attribution:**  
Credit must be given to r2dapps/cute-mascot and its dependencies (including page-mascot) in the About screen, README, and any distribution materials.

## 3. Required Sprite Sheets

### directions.png (9 frames – Look Directions)
```
+---------------+---------------+---------------+
|    Up-Left    |      Up       |   Up-Right    |
+---------------+---------------+---------------+
|     Left      | Center (Idle) |     Right     |
+---------------+---------------+---------------+
|   Down-Left   |     Down      |  Down-Right   |
+---------------+---------------+---------------+
```

### reactions.png (9 frames – Emotional Reactions)
```
+---------------+---------------+---------------+
| Blink / Calm  |     Heart     |    Sparkle    |
+---------------+---------------+---------------+
|   Surprise    |  Wink / Smile |     Blush     |
+---------------+---------------+---------------+
| Sleepy (Zzz)  |     Dizzy     |   Delighted   |
+---------------+---------------+---------------+
```

## 4. Ready-to-Use AI Image Prompts

### Prompt for directions.png
```
A high-resolution 3x3 sprite sheet on a solid pure magenta (#FF00FF) background containing exactly 9 equal-sized square frames of the same cute soft cream and peach dumpling-like chibi creature named Pip.
The character must stay in the exact same spot in each frame, only turning their head and eyes to look in 9 directions matching a 3x3 grid:
Row 1: [Top-Left: looking up-left], [Top-Center: looking straight up], [Top-Right: looking up-right]
Row 2: [Mid-Left: looking left], [Mid-Center: looking directly forward at camera], [Mid-Right: looking right]
Row 3: [Bottom-Left: looking down-left], [Bottom-Center: looking straight down], [Bottom-Right: looking down-right]
Consistent character design: soft round cream body (#F5E6D3) with soft peach accents (#F2C4A8), big shiny gentle eyes, tiny arms, clean outlines, chibi style, neatly aligned on a strict 3x3 grid with no overlapping frames and no text or borders.
```

### Prompt for reactions.png
```
A high-resolution 3x3 sprite sheet on a solid pure magenta (#FF00FF) background containing exactly 9 equal-sized square frames of the same cute soft cream and peach dumpling-like chibi creature named Pip expressing 9 distinct emotional reactions:
Row 1: [Top-Left: neutral blinking eyes], [Top-Center: floating pink love hearts with happy closed-eye smile], [Top-Right: sparkling excited eyes with golden glimmers]
Row 2: [Mid-Left: surprised gasp with wide round eyes (O_O)], [Mid-Center: playful cute wink with slight smile], [Mid-Right: deep blushing cheeks, shy happy smile]
Row 3: [Bottom-Left: peaceful sleeping (Zzz float)], [Bottom-Center: dizzy cartoon spiral eyes], [Bottom-Right: joyful radiant laugh / delighted wide grin]
Consistent character design matching Pip (cream body, peach accents, big eyes, tiny arms), clean outlines, no borders between cells, perfectly aligned 3x3 grid, zero text.
```

## 5. Animation & Trigger List

| State / Trigger          | Animation Description                          |
|--------------------------|------------------------------------------------|
| Idle (collapsed)         | Slow blink, soft breathing, occasional stretch |
| Hover                    | Eyes look at cursor, soft blush, tiny wave     |
| Recording                | Ears/corners perk up, rhythmic bounce          |
| Thinking / Summarizing   | Eyes close or spiral, soft glow, orbiting notes|
| Success                  | Happy jump + sparkles + tiny dance             |
| Error                    | Body droops, head shake, sad expression        |
| Boop / Poke              | Squish physics + reaction from reactions.png   |
| Action Item Reminder     | Gentle attention-seeking bounce                |
| Focus Mode / Sleep       | Sleepy animation with Zzz                      |
| Outfit Change            | Quick happy spin or sparkle                    |

## 6. Personality System (Version 3)
- Remembers last 5–10 meetings
- Mood states: Energetic, Focused, Sleepy, Celebratory
- Contextual reactions (“You left 4 action items last time…”)
- Supports unlockable outfits (glasses, scarf, seasonal hats, etc.)
