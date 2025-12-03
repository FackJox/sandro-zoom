Love this evolution – this gives us a really clean third act.

I’ll treat this as **two sections** in the framework:

- **Section 7 – SERVICES (credits on black)**
    
- **Section 8 – FINAL CONTACT (3D camera reveal)**
    

And I’ll keep:

- **Grid flip** only as the _transition_ from ABOUT → Services
    
- Services = **video intro → black screen with credits-style typography**
    
- A **final CTA line** to scroll once more
    
- Then the **final zoom-out 3D camera reveal** where we see the services block was on the camera’s screen the whole time.
    

I’ll cover:

1. Updated ABOUT → SERVICES grid transition
    
2. SERVICES layouts (mobile + desktop) + motion
    
3. SERVICES → FINAL CONTACT zoom-out
    
4. FINAL CONTACT layouts + motion
    

---

## 1. ABOUT → SERVICES – Grid Flip (updated)

We keep the same **grid shutter “BAM”**, but on the back side of the tiles is now a **single, full-screen video**, not a grid of tiles.

### Step 1 – Freeze & grid slice

- User reaches end of ABOUT (Beat 3).
    
- Entire viewport **freezes for ~60–80ms** (micro beat).
    
- Then a **4×4 or 5×4 grid** of Egg Toast lines slams into place:
    

```text
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
|    |    |    |    |
+----+----+----+----+
```

Each tile is the last ABOUT frame “cut up”.

### Step 2 – Tiles flip to reveal Services intro video

- Tiles flip on the **Y axis** in a **center-out stagger**:
    
    - Group 1: center tiles
        
    - Group 2: inner ring
        
    - Group 3: outer ring
        
- On the _back_ of every tile is the **same new frame**: a **full-screen video** (e.g. moody reel snippet or mountain shot).
    

As they finish flipping, the grid lines fade so we’re left with:

- **Full-bleed video**
    
- No grid, majority of screen is moving image
    

Pillars: **Transform (3D rotate)**, **Masking**, **Offset & Delay**, with a snappy ease (same cubic-bezier, no bounce).

---

## 2. SERVICES – “Credits on Black”

### Narrative & intent

- Emotion: **calm, serious, professional** – like end credits of a film.
    
- Majority **Black Stallion** background (video fades into it).
    
- Services lines read like **roles in a credit roll**.
    

---

### 2.1 Layout – Mobile

We break the SERVICES section into:

1. **Intro video frame**
    
2. **Credit roll panel** (majority black)
    
3. **Big CTA line** (“SCROLL FOR FINAL SHOT”)
    

#### Mobile ASCII

```text
================================================
|  SERVICES INTRO (VIDEO)                      |
|  [16:9 video frame, full-width]              |
|   - ALPINE NOIR reel snippet / mountain      |
|   - dark graded, Egg Toast frame line        |
|----------------------------------------------|
|  BLACK STALLION FULLSCREEN BACKGROUND ⚓     |
|                                              |
|          SERVICES / CREDITS                  |
|          (centered, Egg Toast label)         |
|                                              |
|          MOUNTAIN DOP                        |
|          EXPED & PRODUCT PHOTOGRAPHY         |
|          AERIAL CINEMATOGRAPHY               |
|          STOCK FOOTAGE (SHUTTERSTOCK)        |
|                                              |
|   (lines roll upward as user scrolls)        |
|                                              |
|          ────────────────                    |
|          ONE MORE SHOT ↓                     |
|          SCROLL FOR CONTACT                  |
|          ────────────────                    |
================================================
```

Notes:

- Background behind credits: **pure Black Stallion**.
    
- Text: Trade Gothic Condensed ALL CAPS in **Silverplate** or **Egg Toast** (primary lines), like film credits.
    
- You can optionally show **sub-lines** in IBM Plex (e.g., “available globally”, “licensed via Shutterstock”).
    

---

### 2.2 Layout – Desktop

Same idea, stretched out; credits still **centered on black**.

```text
================================================================================
|  TOP: INTRO VIDEO (full-width, short height)                                 |
|  +-----------------------------------------------------------------------+   |
|  |  16:9 ALPINE NOIR VIDEO (muted, loop or plays once)                  |   |
|  +-----------------------------------------------------------------------+   |
|                                                                              |
|  BELOW: FULL-WIDTH BLACK STALLION PANEL ⚓                                   |
|                                                                              |
|                                  SERVICES / CREDITS                         |
|                                  ---------------------                      |
|                                                                              |
|                                  MOUNTAIN DOP                               |
|                                  EXPED & PRODUCT PHOTOGRAPHY                |
|                                  AERIAL CINEMATOGRAPHY                      |
|                                  STOCK FOOTAGE (SHUTTERSTOCK)               |
|                                                                              |
|                         (lines scroll upward with page scroll)              |
|                                                                              |
|                                  ────────────────                            |
|                                  ONE MORE SHOT ↓                            |
|                                  SCROLL FOR FINAL CONTACT                   |
|                                  ────────────────                            |
|                                                                              |
================================================================================
```

No side-columns needed: we want **black void + centered type** to really make the credits pop.

---

### 2.3 Motion – Video → Black credits → CTA

#### A. Intro video behaviour

- When grid flips, the **video starts playing** (autoplay on desktop, tap-to-play on mobile).
    
- On scroll past ~50% of the video, it:
    
    - **Fades to black** (Video opacity → 0, Black Stallion behind it).
        
    - Optional: quick circular vignette fade (lens closing) to match our motif.
        

#### B. Credit roll behaviour

- Credit lines behave like **manual credits**, synced to scroll:
    
    - Lines are initially “off-screen” below.
        
    - As user scrolls down, they **translate upward** (bottom → center → top).
        
    - Easing: use `brand-enter` curve but keep it subtle.
        
- We can treat each line as a **beat** with tight stagger:
    
    - “MOUNTAIN DOP” enters center.
        
    - A bit more scroll → it moves up, “EXPED & PRODUCT PHOTOGRAPHY” takes center, etc.
        

Think of the **center of the viewport** as the “hero line” zone.

Pillars: **Transform (Y translate), Easing, Offset & Delay, Fade.**

#### C. CTA line

- The final lines “ONE MORE SHOT ↓ / SCROLL FOR FINAL CONTACT”:
    
    - When reach near bottom of Services section, they **fade in from 0 to 1** and gently **track in** from below (`+10px → 0`).
        
    - They stay fixed in the center for a short scroll range to clearly invite the user.
        

No extra animation loops; just a strong static text.

---

## 3. SERVICES → FINAL CONTACT – 3D Camera Reveal

Now the fun one: the **final zoom out** where we see that the services credits were actually on a camera screen.

### Concept

- At the bottom of the SERVICES section, the credit text currently fills the screen on black.
    
- As the user scrolls further:
    
    - The **entire Services section** (credits on black) shrinks and skews, sliding down-right.
        
    - A 3D camera body comes into view; the shrinking rectangle becomes the **camera’s rear LCD**.
        

It should feel like:

> “You’ve been reading off the camera monitor this whole time. Now step back and see the camera and the world it’s pointed at.”

### Step-by-step motion

1. **Lock the final frame**
    
    - When the CTA line is at center and the user begins to scroll:
        
        - Freeze the scrolling of credits; treat the **whole viewport** as a single flat plane.
            
2. **3D zoom-out & drift (down-right)**
    
    - That plane (credits-on-black) becomes a **3D card**:
        
        - Use `transform: perspective(...) rotateX(...) rotateY(...) translateZ(...)`.
            
    - Animate:
        
        - **Scale**: 1.0 → ~0.4
            
        - **Translation**: center → **down-right** corner of the viewport.
            
        - **Rotation**: small rotateY (e.g. 15°) and rotateX (−10°) so it looks like a camera LCD angled toward us.
            
3. **Reveal the camera & scene**
    
    - As the services card shrinks and moves:
        
        - A **3D camera model** (or a flat illustration with 3D-ish shading) fades/animates in behind it:
            
            - The shrinking services rectangle **snaps perfectly into place** as the back screen of the camera.
                
            - Around it, the camera body appears: housing, buttons, lens.
                
    - Behind the camera, a **full-bleed scene** appears:
        
        - e.g. a dramatic mountain shot or behind-the-scenes frame of the DP filming.
            
4. **Stabilise into FINAL CONTACT layout**
    
    - Once the camera is fully in place (bottom-right-ish), motion eases to a stop.
        
    - Scroll is pinned briefly so user can take it in.
        

Pillars: **Transform (3D), Zoom, Masking, Fade, Dimension.**  
Still using our `brand-enter` curve (no bounce).

---

## 4. FINAL CONTACT – Layouts & Motion

### 4.1 Mobile Layout

On mobile we simplify the camera but keep the idea.

```text
================================================
| BG: FULL-SCREEN MOUNTAIN / BTS SCENE         |
| (very subtle motion / parallax)             |
|                                              |
|   FINAL CONTACT TEXT ⚓                       |
|   +--------------------------------------+   |
|   | If you have a story to tell          |   |
|   | please get in touch.                 |   |
|   |                                      |   |
|   | +447880352909                        |   |
|   | sandro.gromen-hayes@live.com         |   |
|   +--------------------------------------+   |
|                                              |
|   [CAMERA OVERLAY BELOW / TO SIDE]           |
|   +------------------------------+           |
|   |  [small camera body]        |           |
|   |  [LCD showing tiny          |           |
|   |   SERVICES credits frame]   |           |
|   +------------------------------+           |
================================================
```

- The services block is now a **mini screen** on the little camera illustration at lower-right/bottom.
    
- Contact text sits **above** the camera, over the scene, as you specified.
    

### 4.2 Desktop Layout

We can lean into the 3D effect more here.

```text
================================================================================
| BG: CINEMATIC SCENE (FULL WIDTH)                                              |
|  - Could be evening mountain, heli, or DP filming                            |
|  - Very slow parallax / camera move                                          |
|                                                                              |
| [LEFT / CENTER]: FINAL CONTACT TEXT ⚓                                        |
| +--------------------------------------------------------------------------+ |
| | If you have a story to tell please get in touch.                         | |
| |                                                                          | |
| | +44 7880 352909                                                          | |
| | sandro.gromen-hayes@live.com                                             | |
| +--------------------------------------------------------------------------+ |
|                                                                              |
| [BOTTOM-RIGHT]: 3D CAMERA OBJECT                                          |
|  - Angled slightly toward viewer                                           |
|  - Rear LCD shows the SERVICES credits block (still or tiny scroll)       |
|                                                                              |
================================================================================
```

Camera object:

- Could be:
    
    - A **Three.js model** in WebGL, or
        
    - A Spline object, or
        
    - A detailed SVG/PNG with subtle position/scale parallax.
        
- The LCD texture is the final frame of the services credits.
    

---

### 4.3 Final Contact motion

- After the 3D reveal settles:
    
    - The **contact text** fades in from 0 → 1 with a short rise (`+10px → 0`).
        
    - The camera may have a **tiny idle motion**:
        
        - Slow vertical bob or breathing.
            
        - Lens glass might catch a very subtle animated reflection.
            
- Optionally, when user moves mouse (desktop):
    
    - The camera **parallaxes** a few degrees with pointer (like a real physical object reacting).
        
- No more big transitions; this is the **final frame**.
    

Pillars: **Fade, Transform (small), Parallax, Dimension.**  
Everything is slow and confident.

---

### 4.4 End-state check against your criteria

- ✅ Grid flip is **only** the ABOUT → SERVICES transition.
    
- ✅ On the other side of grid: a **video**, then we fade to **majority black** for services.
    
- ✅ Services text **pops on black**, styled like **credits rolling** (centered, scrolled, capitalised).
    
- ✅ End of services: big CTA line telling user to **scroll one more time**.
    
- ✅ Final zoom-out: services content **stays visible**, but shrinks down-right into 3D camera screen.
    
- ✅ Final contact text sits **above the camera**, overlaying the 3D scene the camera points at.
    

If you like, next step we could:

- Turn this into a **section-by-section storyboard checklist** (one row per section, with columns for _layout_, _motion_, _tools / implementation notes_), or
    
- Start translating key parts into **dev-ready motion specs** (timings, curves, triggers) for GSAP / Framer / Three.js.