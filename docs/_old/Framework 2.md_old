Nice, let’s move into **Section 3 – Big Film Story (FILM: 14 Peaks + K2)** and run the framework on it.

We’ll:

1. Lock the **layout** (mobile → tablet/desktop)
    
2. Define **Entry / In-between / Focus / Exit** motion
    
3. Map a **scroll timeline** inside the section
    
4. Integrate the **persistent lens circle** and the **portal zoom** from Logos → FILM
    

---

## 3. BIG FILM STORY – Layout

### Concept

- This section is a **3-step scrollytelling sequence**:
    
    1. Netflix / 14 Peaks
        
    2. K2 Winter Expedition
        
    3. K2 Summit still (visual anchor)
        
- Pattern: **Pinned video frame** + **scrolling yellow slab** with copy.
    
- The persistent **◯ lens** now lives as a **small HUD bug** in a corner – present but not competing.
    

---

### 3.1 Mobile layout (portrait)

Think of this as one tall section with **3 vertical steps**; the video frame is pinned for each step.

#### Overall mobile structure

```text
================================================
| SECTION LABEL BAND                            |
|  FILM                                         |
|  (Egg Toast text, thin frame line)            |
|----------------------------------------------|
| PINNED VIDEO FRAME                            |
|  [ 2.39:1 LETTERBOX VIDEO ]                   |
|  (top ~45–55% of viewport)                    |
|   - Step 1: 14 Peaks trailer                  |
|   - Step 2: K2 Winter footage                 |
|   - Step 3: K2 summit still                   |
|                                              |
|  ◯ small lens bug (top-right corner)         |
|                                              |
| SCROLLING SLAB (changes per step)            |
|  +----------------------------------------+  |
|  | CARD CONTENT (depends on step)        |  |
|  +----------------------------------------+  |
|                                              |
================================================
```

#### Card content per step (slab area)

**Step 1 – Netflix / 14 Peaks**

```text
+----------------------------------------+
| Netflix / 14 Peaks                     |
| (Trade Gothic Next, Egg Toast label)  |
|----------------------------------------|
| I worked as lead cinematographer on    |
| Netflix's smash hit 14 Peaks. I shot   |
| most of the drone footage along with   |
| key scenes including the intro, Nims   |
| visiting his family and the K2 drama.  |
+----------------------------------------+
```

**Step 2 – K2 Winter Expedition**

```text
+----------------------------------------+
| K2 Winter Expedition                   |
|----------------------------------------|
| I then worked as DOP on the first      |
| successful K2 winter expedition.       |
+----------------------------------------+
```

**Step 3 – K2 Summit Visual Anchor**

```text
+----------------------------------------+
| K2 SUMMIT 2022                         |
|----------------------------------------|
| Sunset on K2 winter, 2020 (1).jpg      |
| [small line of metadata: altitude,     |
|  temperature, lens]                    |
+----------------------------------------+
```

The user scrolls; the **slab** changes content and slight position, while the **video frame crossfades** per step.

---

### 3.2 Tablet layout

Same logic, more breathing room:

```text
============================================================
|  FILM                                                    |
|  ─────────────────────────────────────────────────────    |
|                                                          |
|  [ PINNED 2.39:1 VIDEO FRAME ]                           |
|   (fills width, sits slightly above center)              |
|    ◯ lens bug top-right                                  |
|                                                          |
|  +----------------------------------------------+        |
|  |  CARD SLAB (14 Peaks / K2 / Summit)         |        |
|  |  (wider, more margins)                      |        |
|  +----------------------------------------------+        |
|                                                          |
============================================================
```

---

### 3.3 Desktop layout

On desktop we _widen_ into a side-by-side layout but keep the same visual hierarchy.

```text
================================================================================
|                           FILM                                               |
|                           ─────────────────────────────                      |
|                                                                              |
|  [ LEFT COLUMN: PINNED VIDEO FRAME ]      [ RIGHT COLUMN: CARD SLAB ]        |
|  --------------------------------------------------------------------        |
|  |  [ 2.39:1 VIDEO ]                    | +----------------------------+ |   |
|  |   Step 1: 14 Peaks trailer           | | Netflix / 14 Peaks         | |   |
|  |   Step 2: K2 Winter footage          | |----------------------------| |   |
|  |   Step 3: K2 summit still            | | copy...                    | |   |
|  |                                      | +----------------------------+ |   |
|  |  ◯ small lens bug top-right corner   | (changes content step 2/3)     |   |
|  --------------------------------------------------------------------        |
|                                                                              |
================================================================================
```

- The **pinned frame** is ~40–50% of width, aligned left.
    
- The **slab** scrolls in the right column, swapping content on each step.
    
- This keeps the video **dominant** on larger screens.
    

---

## 4. Motion storyboard – FILM section

Using framework’s **Entry / In-between / Focus / Exit**.

### 4.1 Entry (Logos → FILM)

We already set up the portal logic; let’s detail it.

**From Logos section:**

1. Netflix logo in the logo band is wrapped in a **circular mask**.
    
2. As user scrolls:
    
    - Logo strip and background **zoom out** (`scale 1.0 → 0.9`).
        
    - The **Netflix circle** ◯ **expands** (`scale 1.0 → ~6–8`) until it fills the screen.
        
3. The expanded circle becomes the **video frame mask** for the FILM hero:
    
    - Within it, a frame from **14 Peaks trailer** freezes for a beat, then begins playing.
        
4. The circle’s edges “snap” into a **rectangular 2.39:1 frame** (Morph + Mask):
    
    - Edges straighten; Egg Toast frame line appears.
        
5. The **FILM** heading slides in from left with `brand-enter` easing.
    

**Pillars:** Zoom, Masking, Morph, Transform, Fade, Easing.

Notation:

- ⚡ trigger: On Scroll at end of logos band
    
- ⚓ anchor: Netflix logo → becomes video frame
    
- 🎭 direction: circle expands then rectifies into a horizontal frame
    

---

### 4.2 Focus (within FILM section – the 3 steps)

We’ll define what happens as the user scrolls through this section.

#### Scroll Timeline (within this section)

- **0–30%**: Step 1 – Netflix / 14 Peaks
    
- **30–65%**: Step 2 – K2 Winter Expedition
    
- **65–100%**: Step 3 – K2 Summit 2022
    

#### Step 1 – 14 Peaks

- Video: starts playing 14 Peaks trailer loop (muted, or with click-to-unmute).
    
- Slab: slides up from bottom (mobile) or from right (desktop) with Fade + Transform, ~260ms.
    
- Lens bug:
    
    - Small ◯ in top-right of video; showreel footage inside is **desaturated and slowed** (as discussed).
        

#### Step 2 – K2 Winter

At ~30% scroll:

- Video:
    
    - **Crossfade / hard cinematic cut** from 14 Peaks trailer to **K2 Winter footage** (Everest/K2 material).
        
    - Use 450–550ms fade or a one-frame hard cut depending how aggressive you want it.
        
- Slab:
    
    - Current 14 Peaks card slides up & fades (`brand-exit`), next card slides in from below:
        
        - Offset & Delay on lines (50–80ms).
            
    - Layout stays consistent.
        

#### Step 3 – K2 Summit visual anchor

At ~65% scroll:

- Video:
    
    - Crossfade to **K2 Summit still** (or very subtle motion: slow zoom in).
        
    - Add subtle **Egg Toast frame line** around frame to mark “anchor” moment.
        
- Slab:
    
    - Card 3 slides in with title “K2 SUMMIT 2022”, metadata row slides in after 80ms.
        
- Lens ◯:
    
    - Could very gently drift in parallax relative to video as user scrolls (1–2px offset),
        
    - But motion remains **Level 1** here (minimal).
        

---

### 4.3 Exit (FILM → next FILM stories section)

At bottom of Step 3:

1. **Portal zoom out again:**
    
    - Whole FILM layout (frame + slab) scales down slightly and darkens.
        
    - The K2 Summit frame shrinks toward a grid of future stories.
        
2. **Morph of FILM label ⚓:**
    
    - FILM heading slides upward and becomes a **sticky label** at the top of the next section (still “FILM”, but now over the grid of Sasha/Grace/Afghanistan cards).
        
3. **Zoom into next card:**
    
    - From that grid, we zoom back in on **Sasha / No Days Off** card, which fills the viewport and becomes the first card of Section 4.
        

Pillars: Zoom, Transform, Parallax (background grid), Morph.

---

## 5. Motion notation summary for this section

You could annotate your storyboard like:

- **Frame 1 (Entry)**
    
    - ⚓ Netflix logo → FILM frame
        
    - 🎭 ◯ expands (zoom in) → rectifies into 2.39:1
        
    - Pillars: Zoom + Masking + Morph
        
    - Duration: ~500ms
        
- **Frame 2 (Focus – Step 1)**
    
    - 📦 FG: slab, text; MG: video frame; BG: dark field
        
    - ◯ lens bug: scaled down, desaturated
        
    - Scroll 0–30%: slab intact, 14 Peaks playing
        
- **Frame 3 (Focus – Step 2)**
    
    - ⚡ scroll 30%
        
    - Video crossfade to K2 Winter; slab swap with slide-up/down
        
- **Frame 4 (Focus – Step 3)**
    
    - ⚡ scroll 65%
        
    - Video crossfade to summit still; frame line appears; card 3 slides in
        
- **Frame 5 (Exit)**
    
    - Portal zoom out; FILM label sticks; zoom into Sasha card grid
        

---

If this all feels right, next step is to run **the same treatment for Section 4 (Sasha / Grace / Afghanistan)**:

- Mobile & desktop layouts for the scrollytelling cards
    
- How the portal zoom carries from K2 Summit → Sasha
    
- Where we reuse slabs, circles, and frame lines so it all feels like one continuous reel.