Nice, this is the fun one. We’ll stay in the framework and do **Phase 3 for Section 3: Big Film Story (FILM)**, with:

- Mobile → desktop ASCII layouts
    
- Entry transition from Logos → FILM using **lens / circular zoom**
    
- Internal scrollytelling (Card 1–3)
    
- Exit transition FILM → next FILM section, again with lens-style zoom out
    

I’ll keep calling out the pillars + notation (⚓, 🎭, 📦, ⚡).

---

# Phase 3 – Section 3: Big Film Story (FILM)

## 3.1 Narrative + Motion Intent

**Narrative goal:**  
“This is the _big_ credit moment: Netflix 14 Peaks + K2. It should feel like dropping into the reel.”

**Emotion:**  
Cinematic, serious, “this is where you realise he’s the real deal.”

**Motion level:**  
**Level 3 (signature)** – this is one of the main set pieces.

**Camera metaphor:**

- Logos → FILM: **lens zooms into a Netflix frame**.
    
- Inside FILM: each card feels like a **shot on a timeline**.
    
- FILM → next FILM section: **lens zooms back out**, showing cards as frames in a strip, then dives into next set.
    

---

## 3.2 Entry Transition – Logos → FILM (lens zoom)

Starting point: we ended Section 2 with the logos strip centered; Netflix logo is somewhere on that strip; our small ◯ “lens bug” exists in the corner.

### Lens-style portal

**On scroll past the logo band:**

1. **Circle iris appears over Netflix logo**
    
    - A circular mask (EGG TOAST ring) grows around the Netflix logo.
        
    - The rest of the logos strip fades slightly.
        
2. **Lens zoom in**
    
    - The circle **expands** to fill the screen (`Zoom + Masking`).
        
    - Inside the circle, we crossfade from **Netflix logo** → **14 Peaks still / video frame**.
        
    - Thin **ring UI** (like lens barrel) appears around edge: small tick marks, “14 PEAKS / NETFLIX” text.
        
3. **Landing in FILM**
    
    - Circle stops expanding once it fills viewport; edges square off quickly (iris opens → full sensor).
        
    - The FILM layout we’re about to define comes into view.
        

Pillars: **Zoom, Masking, Transform, Fade**, `brand-enter` easing.

Notation:

- ⚡ On Scroll (end of logos).
    
- ⚓ circle mask + Netflix element.
    
- 🎭 circle growth arrows.
    
- 📦 FG: lens ring, MG: 14 Peaks frame, BG: old logos band fading.
    

---

## 3.3 FILM Layout – Mobile

We’ll treat this section as a **pinned scrollytelling sequence** of 3 cards.

```text
================================================
|  LABEL ROW                                   |
|  FILM  —  HIGH ALTITUDE FEATURES            |
|  (Trade Gothic, Egg Toast, thin frame line) |
|----------------------------------------------|
|  CARD VIEWPORT (pinned) ⚓                   |
|  +----------------------------------------+  |
|  | [ CARD 1 - NETFLIX 14 PEAKS ]         |  |
|  | [16:9 VIDEO THUMB / YT EMBED]         |  |
|  |                                        | |
|  |  14 PEAKS: NOTHING IS IMPOSSIBLE       | |
|  |  I worked as lead cinematographer      | |
|  |  ... K2 drama etc.                    |  |
|  +----------------------------------------+  |
|                                              |
|  [ SCROLL PROGRESS INDICATOR ]              |
|   • Card 1   ○ Card 2   ○ Card 3            |
|                                              |
|  (Small ◯ lens bug in top-right corner)     |
================================================
```

**Scroll behaviour (mobile):**

- Section is **pinned**; as you scroll, we **swap cards** 1→2→3 (like slides).
    
- Card 1: Netflix 14 Peaks trailer (or looping clip).
    
- Card 2: K2 Winter Expedition (video).
    
- Card 3: K2 Summit still (photographic anchor).
    

Each card is essentially:

```text
+----------------------------------------+
| [VIDEO / STILL]                        |
|----------------------------------------|
| TITLE (Trade Gothic)                   |
| BODY COPY (IBM Plex Sans)             |
+----------------------------------------+
```

The little ◯ lens bug sits top-right, small and subdued.

---

## 3.4 FILM Layout – Desktop

Desktop is the **same basic idea**, expanded horizontally (no new design language).

```text
================================================================================
|  TOP ROW                                                                     |
|  FILM  —  HIGH ALTITUDE FEATURES                 ◯ (small lens bug)         |
|  ------------------------------------------------------------------------    |
|                                                                              |
|  +-----------------------------------------------------------+  +---------+ |
|  | [CARD VIDEO/STILL ⚓ ]                                    |  |         | |
|  |  - 14 Peaks trailer (YouTube)                            |  |  CARD   | |
|  |  - 16:9, framed with thin Egg Toast outline              |  |  STEPS  | |
|  +-----------------------------------------------------------+  |         | |
|                                                                |  1 ■     | |
|                                                                |  2 □     | |
|                                                                |  3 □     | |
|                                                                +---------+ |
|                                                                              |
|  [TITLE - Trade Gothic Condensed]                                             |
|   NETFLIX — 14 PEAKS                                                          |
|                                                                              |
|  [BODY - IBM Plex Sans]                                                       |
|   I worked as lead cinematographer on...                                     |
|                                                                              |
================================================================================
```

Variation: on desktop you might place the **card step indicator** (1/2/3) and a short annotation block on the side; the video stays primary.

---

## 3.5 In-section motion: cards as shots on a timeline

We want the whole thing to feel like **the camera lens zooms between shots**.

### Scroll steps (mobile & desktop)

As user scrolls:

1. **Card 1 → Card 2 (14 Peaks → K2 Winter)**
    
2. **Card 2 → Card 3 (K2 Winter → K2 Summit still)**
    

For each step:

#### A. Iris / lens zoom transition

- We overlay a **circular mask** centered on the video frame:
    
    - Circle shrinks slightly (`scale 1.0 → 0.8`) as if the lens is zooming out.
        
    - Inside, we briefly see a **wider framing** (out-zoom) of the current shot.
        
- At the **turnover point**:
    
    - Circle quickly **snaps open** into the next shot:
        
        - Quick crossfade from 14 Peaks → K2 video inside the circle.
            
    - Then the frame returns to full-rectangular view.
        

It’s like a micro “iris transition”, but tight and fast (220–260ms).

#### B. Card body motion

- Title and body text:
    
    - **Fade/slide up** (`Offset & Delay`) after the new video has landed.
        
    - Stagger: 50–80ms between lines.
        
- Step indicator:
    
    - “1 ■ 2 □ 3 □” → active step flips from 1 to 2 with a fast **mask wipe**.
        

#### C. Lens bug behaviour

- The persistent ◯ bug:
    
    - During card transitions, it might do a subtle **rotation** or **tiny scale blip** (like a record light reacting).
        
    - But: low-key, desaturated, Level 1 motion—all attention remains on main card.
        

**Pillars in this section:**

- Easing (our `brand-enter` curve)
    
- Transform & Zoom (card-level lens zoom)
    
- Masking (iris effect)
    
- Fade (headlines / body)
    
- Offset & Delay (copy & indicators)
    

---

## 3.6 Exit Transition – FILM → FILM STORIES (Sasha / Grace / Afghanistan)

We want the zoom-out between sections to feel like a **lens zooming back** from this Netflix/K2 sequence into the wider reel of stories.

### Step-by-step lens zoom out

1. **Zoom out from the active card**
    
    - As user scrolls past the end of Card 3:
        
        - The whole Card 3 viewport **scales down** (0.9) into the center.
            
        - A **series of concentric circles** (like lens rings) appear as thin outlines around it in Egg Toast / Silverplate.
            
2. **Reveal the reel strip**
    
    - While still zooming out:
        
        - The three cards (14 Peaks / K2 / K2 Summit) **shrink into a horizontal strip** (like frames on a film strip) across the center.
            
        - You glimpse other frames starting to appear on the strip (Sasha, Grace, Afghanistan thumbs in grayscale).
            
3. **Dive into next story set**
    
    - Our camera / viewport then **pans + zooms into** the region of the strip where Sasha’s frame is:
        
        - That frame moves toward full-screen.
            
        - A circular mask briefly **highlights** it like a focus pull:
            
            - Outer area blurred, Sasha frame sharp.
                
    - The strip fades away as we arrive in **Section 4: Film Stories** with Sasha as the new card 1.
        

Visually: you zoom out to see the whole reel, then push back in on the next cluster.

Pillars: **Zoom, Transform, Masking, Parallax**, with concentric circles as explicit “lens UI”.

Notation for storyboard:

- FILM Section Exit:
    
    - ⚓: active card viewport.
        
    - 🎭: arrows showing scale down + horizontal collapse into strip.
        
    - Sketch concentric circles around shrinking cards.
        
    - Circle pick-out on Sasha frame with “portal into Film Stories” note.
        

---

## Quick recap of lens integration so far

- **Hero → Logos:** metadata strip morph + lens circle drifting, portal zoom.
    
- **Logos → FILM:** circular mask over Netflix logo expanding to full-screen 14 Peaks frame.
    
- **Within FILM:** card transitions use **quick circular iris zoom** between 14 Peaks / K2 / K2 Summit.
    
- **FILM → Film Stories:** cards shrink into a reel; concentric circles appear (lens rings), then we zoom back in on the next story.
    

Everything tracks the idea:

> “The whole scrollytelling experience feels like a camera lens zooming out and reframing, not just a static scrollbar.”

---

If you’re happy with this FILM section, next we can run the same pattern on **Section 4: Film Stories (Sasha / Grace / Afghanistan)**—still lens-driven, but a bit more human and emotional in pacing.