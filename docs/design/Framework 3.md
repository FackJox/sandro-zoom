Nice, let’s keep the reel rolling 🎥

We’re now in **Section 4: FILM STORIES (Sasha / Grace / Afghanistan)** and we’ll keep:

- The **lens / circular camera language**
    
- The **portal zoom out → zoom in** scrollytelling
    
- **Mobile-first**, then expand to desktop using the _same_ structural idea
    

We’ll follow the framework: narrative → layout → motion → transitions.

---

# Phase 3 – Section 4: Film Stories (Sasha / Grace / Noshaq)

## 3.1 Narrative & Motion Intent

**Stories in this section:**

- Sasha / _No Days Off_ – Red Bull TV
    
- Grace – mental health, community
    
- Afghanistan / Charles Schwab – Noshaq commercial
    

**Narrative goal:**

- Move from **famous + spectacular** (Netflix/K2) into **human, intimate, gritty**.
    
- Still cinematic, but closer, more emotional.
    

**Motion level:**  
**Level 2.5** – still strong, but slightly calmer than the Netflix block.

**Camera metaphor:**

- Coming off the “big reel” of Netflix/K2, we **zoom back in** on three “character stories.”
    
- Each feels like a **shot on a separate track**: we pan/zoom laterally along a strip of faces/places.
    

---

## 3.2 Entry Transition – From FILM (14 Peaks/K2) into Film Stories

We already zoomed out from FILM into a horizontal **frame strip**. Now we:

1. **See the wider reel:**
    
    - The 14 Peaks / K2 / K2 Summit frames are on the left side of a horizontal strip.
        
    - On the right side of the strip, we see 3 more frames: **Sasha, Grace, Afghanistan** thumbnails.
        
2. **Lens focus pull:**
    
    - A **circular focus ring** (Egg Toast outline) slides along the strip from the K2 frame to the **Sasha frame**.
        
    - As it moves:
        
        - The frame under the ring is sharp; everything else is slightly blurred (Masking + Blur).
            
    - When the circle rests on Sasha:
        
        - The ring **tightens** and we zoom into that circle until it fills the screen → Section 4, Card 1.
            
3. **Landing in Film Stories:**
    
    - The circle expands to full viewport; edges snap to rectangle (like before).
        
    - The Sasha layout appears.
        

Pillars: **Zoom, Masking, Transform, Fade**, plus a bit of **Dimension (focus depth)**.

---

## 3.3 Layout – Mobile (Sasha / Grace / Afghanistan)

Each story is a **scroll step**: one view per screen, with emphasis on **video**.

```text
================================================
| LABEL ROW                                    |
|  FILM  —  FIELD STORIES                      |
|  (Egg Toast, thin frame line)                |
|----------------------------------------------|
|  STORY 1 – SASHA ⚓                           |
|  +----------------------------------------+  |
|  | [VIDEO: NO DAYS OFF]                  |  |
|  | (16:9, YouTube embed / clip)          |  |
|  +----------------------------------------+  |
|  | TITLE: SASHA / NO DAYS OFF            |  |
|  | BODY: In 2022 I filmed episode 1...   |  |
|  +----------------------------------------+  |
|                                              |
|  [SCRUB / PROGRESS]                          |
|   ● Sasha   ○ Grace   ○ Afghanistan          |
|                                              |
|  ◯ small lens bug in top-right corner       |
================================================
(Scroll → Grace)
================================================
| FILM  —  FIELD STORIES                      |
|----------------------------------------------|
|  STORY 2 – GRACE ⚓                          |
|  +----------------------------------------+  |
|  | [VIDEO: STORY OF GRACE]                |  |
|  +----------------------------------------+  |
|  | GRACE / MENTAL HEALTH                  |  |
|  | I directed, shot and edited...         |  |
|  +----------------------------------------+  |
|  [● ○ ○ indicators updated]                 |
|  ◯ lens bug                                 |
================================================
(Scroll → Afghanistan)
================================================
| FILM  —  FIELD STORIES                      |
|----------------------------------------------|
|  STORY 3 – AFGHANISTAN ⚓                    |
|  +----------------------------------------+  |
|  | [VIDEO: CHARLES SCHWAB AFGHANISTAN]    |  |
|  +----------------------------------------+  |
|  | AFGHANISTAN / CHARLES SCHWAB           |  |
|  | Filmed during one of six trips...      |  |
|  +----------------------------------------+  |
|  [● ● ● or bar at 100%]                    |
|  ◯ lens bug                                 |
================================================
```

Each “card” fully occupies the viewport; user scrolls to move 1 → 2 → 3.

---

## 3.4 Layout – Desktop

Same structure, more horizontal air; video still primary.

```text
================================================================================
|  TOP ROW: LABEL + MICRO NAV + LENS BUG                                      |
|  FILM  —  FIELD STORIES                          ◯ (small lens bug)         |
|  ------------------------------------------------------------------------    |
|                                                                              |
|  +-----------------------------------------------------------+  +---------+ |
|  | [VIDEO PLAYER ⚓]                                         |  | STORY   | |
|  |  - No Days Off / Grace / Afghanistan videos              |  | INFO    | |
|  |  - 16:9 with Egg Toast frame line                        |  |         | |
|  +-----------------------------------------------------------+  | TITLE   | |
|                                                                | -------- | |
|                                                                | Body     | |
|                                                                | text     | |
|                                                                +---------+ |
|                                                                              |
|  [SCROLL / STEP INDICATOR]                                                   |
|  ● Sasha      ○ Grace      ○ Afghanistan                                     |
|                                                                              |
================================================================================
(Then same layout for Grace, then Afghanistan, as user scrolls)
```

Optional variation: on very wide screens, you can hint at the **next** story by showing a **faint, blurred preview thumbnail** sliding in from right (but still subordinate to current video).

---

## 3.5 In-section motion: scrollytelling as a lens pan between stories

We keep the **camera metaphor** but dial up **character & emotion**.

### Scroll behaviour (mobile + desktop)

We pin the section (or move in discrete steps):

- Scroll from 0 → 33% of section: **Sasha** in focus
    
- 33 → 66%: **Grace**
    
- 66 → 100%: **Afghanistan**
    

### Transition pattern between stories

For each step (Sasha → Grace, Grace → Afghanistan):

1. **Lens pan across a 3-frame strip**
    
    - Behind the current video, we imagine a **horizontal strip** of the 3 story frames.
        
    - As user crosses threshold:
        
        - The current frame **shifts sideways** (like a dolly):
            
            - For Sasha → Grace: slide left
                
            - For Grace → Afghanistan: slide left again.
                
        - A **circular focus ring** appears centered on the upcoming story frame.
            
2. **Focus ring & zoom**
    
    - Focus ring (Egg Toast) zooms slightly in on the upcoming frame:
        
        - Circle shrinks (zoom out), revealing more context inside.
            
        - Then the circle **lifts away** as the frame expands to full-rect view:
            
            - Just like a focus pull moving from face A → face B.
                
3. **UI + text**
    
    - Story label (“SASHA / NO DAYS OFF”) **crossfades** to the next story’s title.
        
    - Copy slides up with **Offset & Delay** and `brand-enter` curve.
        
    - The indicator on bottom:
        
        - Dot for Sasha → Grace → Afghanistan flips active with a **hard mask wipe**.
            

Pillars: **Transform, Zoom, Masking, Fade, Offset & Delay, Parallax** (slight parallax if we show the background basecamp / mountains behind video).

### Lens circle behaviour in this section

- ◯ lens bug is present but **very subdued**:
    
    - Same position across cards (top-right).
        
    - Footage inside: either:
        
        - Very slow loop of showreel, or
            
        - Static, slightly blurred still (like a viewfinder HUD).
            
    - Every time you cross a story boundary, it might:
        
        - Do a subtle 5–10° **rotation** or 1–2% **scale blip**, like a record light acknowledging a cut.
            

This keeps the lens motif alive without competing with the main videos.

---

## 3.6 Exit Transition – Film Stories → Photo + Climbing Cred

Next section is **PHOTO** with successful vs unsuccessful climbs and basecamp drone background. The emotion shifts to **credibility + humility**.

We want the **lens zoom out** to emphasise:  
“You’ve seen the films. Now look at the stats.”

### Step-by-step lens exit

1. **Zoom out from last story (Afghanistan)**
    
    - As scroll passes last portion of Afghanistan card:
        
        - The entire video card **scales down** to center (~0.8).
            
        - A set of **concentric circles** appear around it, like aperture blades / lens rings.
            
        - The background darkens to Black Stallion with a hint of **basecamp drone footage** starting to appear.
            
2. **Turn stories into a strip**
    
    - Afghanistan, Grace, and Sasha frames **shrink into a vertical strip** on the left or right:
        
        - Think of them as three stacked tiles, tinted slightly, labelled FILM.
            
        - The strip drifts to one side (left) as we zoom out.
            
3. **Zoom into stats block**
    
    - On the opposite side, a block of text representing **SUCCESSFUL CLIMBS** starts as a small card.
        
    - The lens effect:
        
        - A circular focus ring moves from the story strip to the stats block.
            
        - As it rests over the stats:
            
            - The stats block scales up to fill viewport (Portal Zoom in).
                
            - The vertical film strip fades back, but doesn’t vanish instantly—lingers slightly like an afterimage.
                
4. **Landing in PHOTO section**
    
    - We arrive at a **full-viewport PHOTO section** with:
        
        - Basecamp drone video/still as BG.
            
        - `PHOTO — SUCCESSFUL CLIMBS` heading.
            
        - Vertical stats layout (we’ll define this next section).
            

Pillars: **Zoom, Transform, Masking, Dimension**, with **lens rings** as a clear motif.

Notation for storyboard:

- FILM Stories Exit:
    
    - ⚓: current video frame.
        
    - 🎭: arrows showing scale down and slide into vertical strip.
        
    - Concentric circle sketches around it.
        
    - Focus ring arrow from story strip → stats block.
        

---

## Quick recap of this section

- **Layout**: same stack pattern on all breakpoints (video primary, text below/side, progress dots).
    
- **Transitions**:
    
    - From FILM: focus ring slides along strip to Sasha, then zooms into circle → first story.
        
    - Within section: horizontal “lens pan” with circular focus between Sasha → Grace → Afghanistan.
        
    - To PHOTO: zoom out, stories become a side strip, lens moves to stats, zoom in.
        

If you’re good with this, next we’ll run the framework over **Section 5: PHOTO + Climbing Cred** and define:

- Mobile + desktop layouts for successful vs unsuccessful climbs
    
- How basecamp drone video works as BG
    
- The lens-based zoom out/in to About Me after stats.
