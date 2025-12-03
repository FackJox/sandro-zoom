Nice, let’s give the **ABOUT ME** section the same cinematic, lens-driven treatment and keep moving through the framework.

We’ll do:

1. Narrative + motion intent
    
2. Entry transition from PHOTO → ABOUT (centered lens)
    
3. Mobile & desktop layouts
    
4. In-section motion between the 3 beats
    
5. Exit transition to SERVICES
    

---

## 1. Narrative & Motion Intent – ABOUT ME

**Beats:**

1. **Front-line perspective** – “I’ve been there when history was made.”
    
2. **Origin story (City → Army → Mountains)** – “How I became this person.”
    
3. **Values & ongoing work** – “Why I do it, and what I care about.”
    

**Emotion:**

- Grounded and honest, not self-mythologising.
    
- Still cinematic, but now **closer, human, reflective**.
    

**Motion level:**

- **Level 2** – expressive but calmer than the Netflix / film sections.
    

**Camera metaphor:**

- From PHOTO: lens zooms **off the numbers and into the narrator**.
    
- Inside ABOUT: like **three scenes of a documentary** – cut between front-line archive, gritty city/army footage, and more hopeful mountain/human shots.
    

---

## 2. Entry Transition – PHOTO → ABOUT ME (centered lens, complimenting Hero)

We already specified a stats→about lens idea; now let’s pin it down clearly and keep it **dead-center in the viewport**.

### Starting state

- We’re on **UNSUCCESSFUL CLIMBS** panel (last stats panel), centered card over basecamp BG.
    

### Transition steps

1. **Card freeze & center emphasis**
    
    - The stats card is in the middle of the screen.
        
    - The basecamp BG continues a slow, subtle pan.
        
2. **Circular focus ring on the stats copy**
    
    - A clean Egg Toast circle ◯ appears in the **center of the viewport**, over the middle of the card.
        
    - Everything outside the circle slightly darkens and blurs (focus on the circle).
        
3. **Text crossfade inside the circle**
    
    - Inside the circle, the stats text fades out.
        
    - Replaced by the first line of ABOUT copy:
        
        > “Over the past decade I’ve documented some of the biggest stories from the world of high altitude mountaineering.”
        
    - Outside the circle, the stats card is still visible, fading.
        
4. **Lens zoom into story**
    
    - The circle then **expands** to fill the screen (`Zoom + Masking`):
        
        - While it expands, the basecamp clip crossfades to a **front-line perspective image/video** (e.g. climbers on summit, or raw handheld shot).
            
    - As the circle fills viewport, its edges snap to a rectangle, revealing the **ABOUT ME layout**.
        

Result: we’ve zoomed from **numbers** into **the person behind them**, with the same centered lens language we started at the hero.

---

## 3. Layout – ABOUT ME (Mobile First)

We’ll treat each beat as a **full-screen scrollytelling panel**.

### 3.1 Mobile – Beat 1: Front-line Perspective

```text
================================================
| LABEL ROW                                    |
|  ABOUT ME  —  FRONT-LINE PERSPECTIVE        |
|  (Trade Gothic, Egg Toast, thin rule)        |
|----------------------------------------------|
| BG: FRONT-LINE FOOTAGE                      |
|  - Still or subtle clip from Everest/K2,    |
|    or summit shot with climber(s)           |
|  - Darkened with gradient for text legibility|
|                                              |
| TEXT PANEL ⚓                                 |
| +----------------------------------------+  |
| | Over the past decade I’ve documented   | |
| | some of the biggest stories from the   | |
| | world of high altitude mountaineering.| |
| |                                        | |
| | I stood on the highest peak in         | |
| | Afghanistan... (rest of paragraph)     | |
| +----------------------------------------+  |
|                                              |
| [SCROLL HINT: NEXT STORY]                    |
|   ● Front-line   ○ Origin   ○ Values         |
================================================
```

### 3.2 Mobile – Beat 2: Origin (City → Army → Mountains)

```text
================================================
| ABOUT ME  —  ORIGIN STORY                   |
|----------------------------------------------|
| BG: CITY / ARMY / TRANSITIONAL FOOTAGE      |
|  - e.g. Katmandu temple, Birmingham night   |
|    streets, army scenes (subtle, slow)      |
|                                              |
| TEXT PANEL ⚓                                 |
| +----------------------------------------+  |
| | A winding path brought me to the       | |
| | mountains. After dropping out of uni  | |
| | I spent 3 years in Birmingham filming | |
| | raves, music videos and weddings.     | |
| |                                        | |
| | Wanting to see more of the world I    | |
| | joined the British army reserve...    | |
| +----------------------------------------+  |
|                                              |
| [○ Front-line   ● Origin   ○ Values]         |
================================================
```

### 3.3 Mobile – Beat 3: Values & Ongoing Work

```text
================================================
| ABOUT ME  —  VALUES & WORK                  |
|----------------------------------------------|
| BG: MORE HUMAN SHOT                         |
|  - maybe camp with people, community, or    |
|    sunrise over mountains                    |
|                                              |
| TEXT PANEL ⚓                                 |
| +----------------------------------------+  |
| | With feeling and fortitude I have the  | |
| | experience to bring human stories from | |
| | the world’s most inhumane corners.     | |
| |                                        | |
| | Stories from the mountains and the     | |
| | people in between                      | |
| | are slowly being collected             | |
| | on my YouTube channel.                 | |
| +----------------------------------------+  |
|                                              |
| [○ Front-line   ○ Origin   ● Values]         |
================================================
```

Note that line break:

> “Stories from the mountains and the people in between / are slowly being collected…”

…is perfect for a **tiny intra-panel motion** (we’ll handle that in motion).

---

## 4. Layout – ABOUT ME (Desktop)

Same vertical **3-beat structure**, but for each beat we go to a **two-column** composition with center gravity.

### 4.1 Desktop – Beat 1: Front-line

```text
================================================================================
|  ABOUT ME  —  FRONT-LINE PERSPECTIVE                   ◯ (small lens bug)   |
|  ------------------------------------------------------------------------    |
|                                                                              |
|  [LEFT COLUMN: BG VISUAL]                [RIGHT COLUMN: TEXT PANEL ⚓]        |
|  +----------------------------------+    +----------------------------------+ |
|  | FULL-HEIGHT VIDEO/STILL         |    | Over the past decade I’ve       | |
|  | (Everest/K2 summit or similar)  |    | documented some of the biggest  | |
|  | dark overlay at left edge       |    | stories from the world of high  | |
|  +----------------------------------+    | altitude mountaineering.        | |
|                                         |                                  | |
|                                         | I stood on the highest peak in   | |
|                                         | Afghanistan... etc.             | |
|                                         +----------------------------------+ |
|                                                                              |
|                              [● Front-line   ○ Origin   ○ Values]            |
================================================================================
```

### 4.2 Desktop – Beat 2: Origin

Same structure, different BG:

```text
================================================================================
|  ABOUT ME  —  ORIGIN STORY                               ◯ lens bug         |
|  ------------------------------------------------------------------------    |
|                                                                              |
|  [LEFT: CITY/ARMY VIDEO/STILL]           [RIGHT: TEXT PANEL ⚓]              |
|                                                                              |
|                              [○ Front-line   ● Origin   ○ Values]           |
================================================================================
```

### 4.3 Desktop – Beat 3: Values

```text
================================================================================
|  ABOUT ME  —  VALUES & ONGOING WORK                        ◯ lens bug       |
|  ------------------------------------------------------------------------    |
|                                                                              |
|  [LEFT: HUMAN/MOUNTAIN BG]                [RIGHT: TEXT PANEL ⚓]             |
|                                                                              |
|                              [○ Front-line   ○ Origin   ● Values]           |
================================================================================
```

The composition is always **balanced around center**: lens transitions happen in the middle and content sits left/right but still anchored to the center axis.

---

## 5. In-section Motion – Between the 3 Beats

We want the transitions between beats to feel like **focus pulls between scenes** in one documentary, not entirely separate worlds.

### 5.1 Scroll behaviour

- Section behaves like a **pinned scrollytelling chapter**:
    
    - Scroll 0–33% → Beat 1
        
    - 33–66% → Beat 2
        
    - 66–100% → Beat 3
        

At each boundary, we use a **centered lens effect**, consistent with previous sections.

### 5.2 Beat 1 → Beat 2 (Front-line → Origin)

1. **Soft focus on current scene**
    
    - As user approaches the boundary:
        
        - A subtle circular blur appears in center over Beat 1 text.
            
        - The BG video/still begins to **tilt/pan** slightly as if the camera is being repositioned.
            
2. **Lens pan / refocus**
    
    - A circular focus ring appears in the center:
        
        - Inside: the city/army BG (Beat 2) starts to fade in.
            
        - Outside: the front-line BG fades out.
            
    - The text inside the circle crossfades:
        
        - First sentence of Beat 1 → first line of Beat 2.
            
3. **Settle into Beat 2**
    
    - Circle expands to full view, edges snap to the new two-column layout.
        
    - Beat 2 text lines slide up with small stagger; BG continues a slow, more subtle motion.
        

### 5.3 Beat 2 → Beat 3 (Origin → Values)

Same general pattern, but emotion shifts from **gritty origin** → **aspirational values**:

- Inside the center ring:
    
    - Army/city imagery fades to more open, airy mountain/human shot.
        
    - Text crossfades from origin paragraphs → values content.
        
- That “Stories from the mountains and the people in between / are slowly being collected…” moment:
    
    - Line 1 (“Stories from the mountains and the people in between”) **fades in first**.
        
    - On slight downward scroll, line 2 (“are slowly being collected on my Youtube channel.”) slides up from below (`Offset & Delay`) with our `brand-enter` easing.
        

**Pillars in ABOUT:**

- **Easing:** always our `cubic-bezier(0.19, 1, 0.22, 1)` (no bounce).
    
- **Fade & Transform:** text and panels.
    
- **Masking:** circular transitions, crossfades in the center.
    
- **Zoom & Dimension:** lens metaphor.
    
- **Parallax (subtle):** slow BG pans; foreground text stays crisp.
    

---

## 6. Exit Transition – ABOUT → SERVICES

Now we need to hand off from “who I am” to “what I offer” with the same **centered lens zoom** and a sense of leaving the story & moving to clear options.

### Starting point

We’re at the end of Beat 3 – Values & ongoing work. Text is visible, BG is calm.

### Steps

1. **Tighten focus on the final lines**
    
    - The last two lines (“Stories from the mountains…” + “…on my Youtube channel”) become slightly brighter and sharper.
        
    - A circular ring appears around the **middle of the text block**, centered in viewport.
        
2. **Zoom out on the narrative**
    
    - The text inside the circle starts to **scale down** slightly and soften.
        
    - Behind the text, we see a faint **grid** and labels (“MOUNTAIN DOP”, “EXPED & PRODUCT PHOTOGRAPHY”, etc.) fade in as ghosted content.
        
3. **Crossfade into Services grid**
    
    - As the circle continues to zoom:
        
        - ABOUT text fades out inside the circle.
            
        - Service labels fade in more clearly.
            
        - The “Stories from the mountains…” line lingers slightly longer, then dissolves.
            
4. **Circle expands into SERVICES layout**
    
    - The circle expands to full viewport again:
        
        - Now what’s visible is a **clean grid of service cards** on Black Stallion / Black Pearl, with Egg Toast headings.
            

This tells the story:

> We zoom out from the person’s story to see the **structured ways you can work with them**.

---

## 7. Check against your constraints

- ✅ Transition from films to stats was central & lens-based; now stats → about → services are all **centered zooms** too.
    
- ✅ ABOUT maintains **lens/camera language**, but feels more human and calmer.
    
- ✅ The design remains **cohesive across mobile and desktop** – same stacking, just more room & two-column expansions.
    
- ✅ The narrative flow is clear: Films → Stats → About → Services.
    

---

Next, we can run the same treatment on **SERVICES**:

- Mobile + desktop card layouts (MOUNTAIN DOP, EXPED & PRODUCT PHOTOGRAPHY, AERIAL CINEMATOGRAPHY, STOCK FOOTAGE)
    
- How the cards animate in as scroll steps
    
- The final lens-style transition into the **CONTACT** section.