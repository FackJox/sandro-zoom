Love these constraints – they make the system much tighter and more cinematic.

We’ll stay **in the framework** and refine **Phase 3 for Section 1 (HERO)**, then **Section 2 (Logos)**, with:

- Same core composition across **mobile → tablet → desktop**
    
- **Metadata row → logos** morph on first scroll
    
- **Vertical slabs + bold circular lens shapes**
    
- Circular **strip masks** that detach and drift in parallax
    

---

## Phase 3 – HERO (refined with your notes)

### 3.1 One cohesive layout, then scaled

Think of the hero as **three layers** stacked vertically, same on all viewports:

1. **Media layer** – full-bleed video/still
    
2. **Yellow slab & circular lens badge** – foreground UI
    
3. **Metadata strip** – anchored to bottom, later morphs to logos band
    

#### Mobile (portrait)

```text
================================================
| LAYER 1: MEDIA (BG)                          |
| [SHOWREEL VIDEO / EVEREST LOOP]              |
|  - BW / desaturated                          |
|  - subtle grain                              |
|                                              |
| LAYER 2: SLAB + LENS                         |
|  +----------------------------------------+  |
|  |  ◯  (EGG TOAST LENS BADGE)             |  |
|  |  sandrogh                              |  |
|  |  HIGH ALTITUDE &                       |  |
|  |  HOSTILE ENVIRONMENT                   |  |
|  |----------------------------------------|  |
|  |  Over the past decade I've documented  |  |
|  |  some of the biggest stories from the  |  |
|  |  world of high altitude mountaineering.|  |
|  +----------------------------------------+  |
|                                              |
| LAYER 3: METADATA STRIP  ⚓                   |
|  [ ALT ▲ 8,000M  •  K2 / EVEREST  •  DOP ]   |
|  (Egg Toast rule above, Silverplate text)    |
|                                              |
|   SCROLL ▾                                   |
================================================
```

**Circular lens nod:**

- The ◯ is a bold Egg Toast circle partially overlapping the slab edge – like a lens seal / altitude badge.
    
- Inside: small text like `◯ 4,100m` or a record dot.
    

#### Tablet (same design, more breathing room)

```text
============================================================
| [MEDIA BG FULL WIDTH]                                     |
|                                                           
|      +----------------------------------------------+     |
|      |   ◯ LENS BADGE                              |     |
|      |   sandrogh                                   |    |
|      |   HIGH ALTITUDE & HOSTILE ENVIRONMENT       |    |
|      |----------------------------------------------|    |
|      |   Over the past decade I've documented...   |    |
|      +----------------------------------------------+    |
|                                                           
|      [METADATA STRIP ⚓ ACROSS WIDTH]                     |
|      ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTO     |
|                                                           
============================================================
```

The slab stays central; tablet just increases horizontal padding and slab width.

#### Desktop (expanded, but same logic)

Rather than a completely different layout, we **stretch** the same stack into a wider composition and add side breathing space + extra vertical slab feel.

```text
================================================================================
| [FULL-WIDTH MEDIA VIDEO]                                                      |
| (mountain panorama or reel)                                                   |
|                                                                              |
|            +----------------------------------------------------------+      |
|            |   ◯ LENS BADGE (overlapping top-left of slab)            |      |
|            |   sandrogh                                               |      |
|            |   HIGH ALTITUDE & HOSTILE ENVIRONMENT                    |      |
|            |----------------------------------------------------------|      |
|            |   Over the past decade I've documented some of the       |      |
|            |   biggest stories from the world of high altitude        |      |
|            |   mountaineering.                                        |      |
|            +----------------------------------------------------------+      |
|                                                                              |
| [BOTTOM METADATA STRIP ⚓ FULL WIDTH]                                         |
| ALT ▲ 8,000M   •   EVEREST / K2   •   HIGH ALTITUDE DIRECTOR OF PHOTOGRAPHY  |
|                                                                              |
|                                 SCROLL ▾                                     |
================================================================================
```

To echo the inspo, we can:

- Extend the EGG TOAST slab **top-to-bottom** on very large screens (feels like a vertical band) while keeping slab content centered.
    
- Keep the ◯ overlapping that band consistently.
    

So phones/tablets/desktop all share:

- **Full-bleed media**
    
- **Central yellow slab with circular lens badge**
    
- **Bottom metadata strip**
    

### 3.2 HERO motion (with lens + strip-masks)

**Pillars used:** Easing, Transform/Zoom, Fade, Masking, Parallax, Dimension.

#### Entry (all viewports)

- Media:
    
    - Fade in from black, tiny push-in (`scale 1.02 → 1.0`, `brand-enter`).
        
- Slab:
    
    - Vertical **mask reveal** from bottom up (like a title card sliding into view).
        
- Lens circle:
    
    - Slight **scale-in** (0.8 → 1.0), **no bounce**, delayed ~60ms after slab (Offset & Delay).
        
- Text:
    
    - Lines fade/slide up with 40–60ms stagger.
        

Notation:

- 🎭 slab enters from bottom; text arrows up.
    
- ⚡ On Load.
    

#### Focus (idle behaviour)

- Media:
    
    - Very subtle **pan** or push-in to feel like a slow tripod adjustment.
        
- Lens circle:
    
    - On hover (desktop), micro push-in (scale 1.0 → 1.04) like a lens creep.
        
- Circular strip masks (preparing our transition pattern):
    
    - Behind the slab, 2–3 **thin circular “slices”** of video are masked out (imagine arcs/strips):
        
        - They move at slightly different speeds (`Parallax`) as user micro-scrolls within the hero.
          
- Left over circular part of the video from the Circular strip masks remains on screen, the 
            

📦 depth:

- FG: slab + text + lens circle
    
- MG: circular slices of media
    
- BG: full media plane
    

#### Exit: FIRST SCROLL → metadata → logos (with persistent lens)

**Trigger:** ⚡ On Scroll past ~70% hero height (first real scroll).

1. **Step A – Portal zoom & lens separation**
   - Entire hero (media + slab) scales down slightly (1.0 → 0.9) and darkens (Fade + Transform).
   - The ◯ lens **detaches** from the slab:
     - It drifts toward its future corner position (e.g. top-left), and also moves “back” in depth (Parallax) – scale 1.0 → 0.6.
     - The media inside the circle **zooms out** (scale 1.1 → 1.0) so more of the showreel is visible.
     - A faint circular strip mask/halo briefly expands from it, then fades, reinforcing the lens motif.

2. **Step B – Metadata strip → logos rail (⚓ shared element morph)**
   - The metadata strip ⚓ is the anchor:
     - It slides upward from the bottom edge toward the vertical center while stretching to full width.
     - Text inside crossfades from `ALT ▲ 8,000M • ...` into the first client names/logos.
     - Background of the strip shifts from Black Stallion to Black Pearl to become the logos band surface.

3. **Step C – Settle into Section 2**
   - Hero “tile” continues to scale/back off slightly in the background.
   - The ◯ lens is now **smaller, in a corner**, riding above or adjacent to the new logo strip.
   - Scroll momentum carries the user into the full Social Proof section layout.

            

Pillars in play:

- **Transform & Morph** (metadata → logos)
    
- **Masking** (circular video strips)
    
- **Parallax** (circular slices drifting slower than hero zoom)
    
- **Zoom** (portal zoom out / in)
    

Notation on storyboard:

- ⚓ metadata strip
    
- 🎭 arrow from strip at bottom → center (upwards)
    
- ◯ lens icon: arrow up + sideways drift; note “becomes floating parallax element”
    
- 📦 MG: strip, FG: logos; BG: hero tile.
    

---

## Phase 3 – Section 2: Social Proof Strip (Logos)

Now we treat the Logos strip as its own chapter with the same mobile→desktop cohesion.

### 3.3 Layout – Logos Section

#### Mobile

```text
================================================
|   (Scrolling continues from hero)            |
|                                              |
|  [LOGO STRIP CONTAINER ⚓]                    |
|  +----------------------------------------+  |
|  |  Berghaus   Osprey   RedBull TV      |  |
|  |  EPIC TV    Netflix   BBC            |  |
|  |  TNF        Black Crows  FP  Scarpa  |  |
|  +----------------------------------------+  |
|   (Horizontal auto-scroll / marquee)        |
|                                              |
|  [Optional small Egg Toast ◯ lens icon     |
|   overlapping strip edge, echoing hero]     |
|                                              |
================================================
```

Strip is ~1/3 of viewport height on mobile: feels like a **band**.

#### Tablet

```text
============================================================
| [LOGO STRIP ⚓ CENTERED]                                   |
| +------------------------------------------------------+  |
| |  Berghaus  Osprey  RedBull TV  EPIC TV  Netflix      |  |
| |  BBC  The North Face  Black Crows  FP  Scarpa        |  |
| +------------------------------------------------------+  |
|                                                          |
|  ◯ circular lens chip partially overlapping top-left    |
============================================================
```

#### Desktop

Just widen the same band and add more breathing room; still the same pattern.

```text
================================================================================
|                                                                              |
|                     +--------------------------------------------+           |
|   ◯ lens chip       |   LOGO STRIP ⚓                            |           |
|   (Egg Toast)       | Berghaus  Osprey  RedBull TV  EPIC TV     |           |
|                     | Netflix  BBC  The North Face  Black Crows |           |
|                     | FP  Scarpa                                |           |
|                     +--------------------------------------------+           |
|                                                                              |
================================================================================
```

The **strip is visually the evolved metadata line** – same thickness, same frame-line logic, just expanded.

### 3.4 Logos motion

**Entry from Hero**

We already defined the morph, but inside this section:

- Logo strip completes its morph from the metadata line and eases into its final position.
- Logos fade/slide in horizontally with small stagger.
- The ◯ lens arrives in a corner (top-left or top-right of the band), now smaller (~10–15% viewport width) and slightly desaturated, reading as a HUD/record bug rather than a second hero.


**Focus**

Options:

- The strip can auto-marquee slowly (logos moving left), or:
    
- Use **scroll-linked horizontal movement**:
    
    - As the user scrolls a bit further, the logos rail pans horizontally like a **camera pan across sponsor wall**.
      
- The strip can either auto-marquee slowly or respond to scroll with a subtle horizontal pan.
- The ◯ lens remains pinned in the corner, with the footage inside either frozen or moving very slowly (no hard cuts) so it doesn’t compete with hero videos later.


Pillars: Transform, Parallax (logos vs rail vs BG), Easing.

**Exit → FILM section (portal zoom out again)**

- At the end of the logos band:
    
    1. **Portal zoom out**:
        
        - Rail + lens chip scale down to ~0.9; the band becomes a tile on a dark field.
            
    2. **Circular strip mask transition (lens nod):**
        
        - One of the client logos (e.g. **Netflix**) is wrapped in a circular mask.
            
        - That circular masked portion **expands** to fill the viewport (Portal Zoom _in_), becoming:
            
            - A **FILM** section intro tile with Netflix 14 Peaks artwork / thumbnail.
                
    3. **FILM heading / frame line**:
        
        - As the circle fills the screen, a thin Egg Toast frame line appears around it and **FILM** label slides in from left.
            

Notation:

- ⚓ the logo strip
    
- ◯ Netflix mask: annotated as “portal into FILM > 14 Peaks”
    
- 🎭: circle expands, entire band fades away behind it.
    

---

At this point we’ve:

- Honored the framework up through **Phase 3 for Sections 1 & 2**
    
- Kept **one cohesive design** across mobile → desktop
    
- Implemented:
    
    - **Metadata → logos morph**
        
    - **Portal zoom out between sections**
        
    - **Circular lens shapes & circular strip masks that detach and parallax**
        

If you’re happy with this direction, next step in the framework is to apply the same approach to **Section 3: Big Film Story (14 Peaks + K2)**:

- Mobile + desktop ASCII
    
- Portal zoom from Logos → FILM
    
- How each card (14 Peaks / K2 / K2 Summit) scrolls as “steps” with that camera/lens motif.