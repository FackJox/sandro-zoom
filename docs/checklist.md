Here’s a **section-by-section implementation checklist** for the whole scrollytelling experience, tuned for **SvelteKit + Threlte + GSAP (ScrollTrigger)** and optional **TSL/GLSL**.

Use this as your build spec.

---

## 0. Global Setup (Project-wide)

-  **Install & wire core libs**
    
    -  `gsap` + `ScrollTrigger` (and optionally `ScrollToPlugin`).
        
    -  `@threlte/core` (and whichever renderer helpers you like).
        
    -  Optional smooth scroll: roll your own or use a small lib; let ScrollTrigger drive updates.
        
-  **Define global motion tokens**
    
    -  Easing:
        
        - `brandEnter = cubic-bezier(0.19, 1, 0.22, 1);`
            
    -  Durations:
        
        - Micro UI: `220–260ms`
            
        - Section transitions: `320–420ms`
            
        - Hero / film beats: `450–600ms`
            
    -  Levels:
        
        - L1 = subtle; L2 = noticeable; L3 = signature.
            
-  **Page structure**
    
    -  Wrap page in a `MainScroll` Svelte component.
        
    -  Create one Svelte component per **major section**:
        
        - `<HeroSection />`
            
        - `<LogosSection />`
            
        - `<BigFilmSection />`
            
        - `<FilmStoriesSection />`
            
        - `<PhotoStatsSection />`
            
        - `<AboutSection />`
            
        - `<ServicesSection />`
            
        - `<FinalContactSection />`
            
    -  Give each a top-level container with a unique `id` for ScrollTrigger.
        
-  **ScrollTrigger baseline**
    
    -  Register `ScrollTrigger` in a root `onMount`.
        
    -  For each section component, expose a `setupScrollTriggers()` function or set them up in `onMount` using refs.
        
-  **Shared UI bits**
    
    -  Implement reusable:
        
        - Lens circle element (`<LensBug />`).
            
        - Egg Toast frame line component (`<FrameBorder />`).
            
        - Section label component (e.g. `PHOTO — ALTITUDE LOG`).
            

---

## 1. HERO – Showreel + Slab + Lens

### Layout (Svelte)

-  Full-bleed container with **video BG** (showreel).
    
-  Centered **Egg Toast slab** containing:
    
    -  `sandrogh`
        
    -  `HIGH ALTITUDE & HOSTILE ENVIRONMENT`
        
    -  Short intro body text.
        
-  **Lens badge**: Egg Toast circle overlapping slab.
    
-  **Metadata strip** anchored to bottom:
    
    - `ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTOGRAPHY`.
        
-  Scroll hint below.
    

### Motion

**On load**

-  Video fades in from black + tiny push-in (`scale 1.02 → 1.0`).
    
-  Slab masked up from bottom (Y transform + opacity).
    
-  Lens circle scales from `0.8 → 1.0` (brandEnter).
    
-  Copy lines staggered (40–60ms).
    

**Idle**

-  Very slow BG pan or push-in (GSAP tween loop).
    
-  Lens badge and slab: tiny parallax on scroll (Y offset a few px).
    

**Hero → Logos (first scroll)**

-  Create a ScrollTrigger that:
    
    -  At ~70% hero scroll:
        
        -  Scales whole hero container `1.0 → 0.9`, darkens slightly.
            
        -  Detaches lens circle and drifts it upward / slightly right (FG parallax).
            
        -  Animates **metadata strip** from bottom → center and stretches it into full-width band.
            
        -  Morphs metadata text → first logo texts (e.g. `Berghaus`, `Osprey`).
            
-  Use GSAP timeline with:
    
    -  `ScrollTrigger.scrub: true` or short scrub for smoothness.
        
    -  Stagger text opacity changes for metadata→logos.
        

---

## 2. SOCIAL PROOF – Logos Strip

### Layout

-  Centered full-width band (Black Pearl) for logos strip.
    
-  Logos in a single row (wrap for mobile).
    
-  Optional small lens chip on left edge of band.
    

### Motion

**Entry (from hero)**

-  Metadata→logos morph already handled in Hero timeline; ensure:
    
    -  Band comes to rest centered; hero background dims/fades.
        

**Within section**

-  Subtle **auto-marquee** or scroll-linked horizontal pan of logos.
    
-  Slight parallax of band vs page on scroll.
    

**Logos → Big Film (FILM)**

-  Identify **Netflix logo** element.
    
-  On ScrollTrigger near bottom of logos:
    
    -  Spawn **circular mask** centered on Netflix logo:
        
        -  Circle grows to cover viewport (GSAP scale + clip-path or WebGL circle mask).
            
        -  Crossfade inside circle from Netflix logo → 14 Peaks still/first video frame.
            
    -  Fade rest of logos band to black.
        
-  Land with full-screen FILM intro state.
    

---

## 3. BIG FILM STORY – Netflix 14 Peaks + K2

### Layout

-  Section label: `FILM — HIGH ALTITUDE FEATURES`.
    
-  **Card viewport** pinned on scroll:
    
    - Card 1: 14 Peaks trailer video + copy.
        
    - Card 2: K2 Winter expedition video + copy.
        
    - Card 3: K2 Summit still + copy.
        
-  Card step indicator (`1 / 2 / 3` or dots).
    
-  Small lens bug in corner.
    

### Motion

**Card transitions (scroll-stepped)**

-  Pin section with ScrollTrigger; map scroll 0–1 to:
    
    -  Segment 0–⅓: Card 1
        
    -  ⅓–⅔: Card 2
        
    -  ⅔–1: Card 3
        
-  Between cards:
    
    -  Apply **circular iris** transition:
        
        -  Circle mask shrinks slightly on current video, then crossfades to next video inside circle, then expands to full rect.
            
    -  Stagger title + body fade/slide (`y: 10 → 0`).
        
    -  Step indicator updates with quick bar/mask wipe.
        

**Big Film → Film Stories**

-  At end of Card 3:
    
    -  Animate card viewport scaling down to center (~0.9).
        
    -  Duplicate frames into a horizontal strip of 3.
        
    -  Show hint of **next 3 frames** (Sasha/Grace/Afghanistan) to the right.
        
    -  Focus ring moves along strip to Sasha frame.
        
    -  On landing over Sasha: circle expands to full viewport and crossfades into Film Stories Section initial state.
        

---

## 4. FILM STORIES – Sasha / Grace / Afghanistan

### Layout

-  Section label: `FILM — FIELD STORIES`.
    
-  One **viewport card per story**, scroll-stepped:
    
    - Story 1: Sasha / No Days Off (Red Bull YT).
        
    - Story 2: Grace.
        
    - Story 3: Afghanistan / Charles Schwab Noshaq.
        
-  Progress dots: `Sasha / Grace / Afghanistan`.
    
-  Lens bug (subdued) top-right.
    

### Motion

**Entry (from Big Film)**

-  Focus ring landing over Sasha frame; circle expand → Video 1 full width.
    

**Within section**

-  Pin section, map scroll segments to 3 stories.
    
-  For each story transition:
    
    -  Simulate **lens pan along a strip**:
        
        -  Behind card, conceptually slide a 3-frame strip; new story slides into position.
            
        -  Focus ring moves from current to next frame.
            
    -  Crossfade videos inside ring, then snap to full rect.
        
    -  Update dots and titles with fade/slide.
        

**Film Stories → Photo/Stats**

-  On final Afghanistan segment end:
    
    -  Scale latest video card down to center (~0.8).
        
    -  Draw concentric circles around it (lens rings).
        
    -  Shrink cards into a vertical strip on one side (left).
        
    -  On other side, fade in a small stats card (Successful climbs).
        
    -  Focus ring slides to stats card; zoom into that card → full viewport for PhotoStats Section.
        

---

## 5. PHOTO + CLIMBING CRED – Stats

### Layout

-  Section label: `PHOTO — ALTITUDE LOG`.
    
-  Basecamp drone BG (video or still) with dark overlay.
    
-  Centered stats card (mobile: full-width).
    
    - Panel 1: `SUCCESSFUL CLIMBS` w/ grouped heights.
        
    - Panel 2: `UNSUCCESSFUL CLIMBS` w/ grouped heights.
        
-  Toggle indicator (`● Successful / ○ Unsuccessful` etc.).
    

### Motion

**Entry**

-  From Film Stories, stats card scales in from center; basecamp BG crossfades behind.
    

**Panel toggle (scroll)**

-  Pin section with ScrollTrigger.
    
-  Scroll progress 0–½ = Successful panel, ½–1 = Unsuccessful.
    
-  At mid-point:
    
    -  Circular focus over card center.
        
    -  Crossfade text inside circle from Successful → Unsuccessful.
        
-  Indicators flip active dot via mask.
    

**Photo → About**

-  At end of Unsuccessful panel:
    
    -  Focus ring over center card.
        
    -  Text inside circle crossfades from stats → first ABOUT line.
        
    -  BG crossfades from basecamp to front-line shot.
        
    -  Circle expands to full screen, card edges vanish → AboutSection initial state.
        

---

## 6. ABOUT ME – 3 Beats

### Layout

-  3 beats, each full-screen:
    
    1. **Front-line perspective**
        
    2. **Origin (City → Army → Mountains)**
        
    3. **Values & ongoing work**
        
-  Each beat:
    
    - BG image/video (frontline / city/army / human mountains).
        
    - Text block (IBM Plex) in card or right column (desktop).
        

### Motion

**Entry**

-  Circle from Photo expands to show Beat 1 BG + text.
    

**Beat transitions (1→2, 2→3)**

-  Pin section and segment scroll 0–⅓, ⅓–⅔, ⅔–1.
    
-  At each boundary:
    
    -  Soft blur + circular focus over center.
        
    -  BG inside circle crossfades to next scene.
        
    -  First line of new beat crossfades in circle.
        
    -  Circle expands to fill; text panel slides up into place.
        

**Nice micro-moment**

-  For final beat line break:
    
    - Line 1 fades in.
        
    - On small scroll delta, line 2 slides up into place.
        

**About → Services**

-  As user nears end of Beat 3:
    
    -  Micro pause (no scroll) while we:
        
        -  Overlay Egg Toast grid lines (4×4 or 5×4).
            
        -  Convert entire viewport into grid of tiles.
            

---

## 7. ABOUT → SERVICES – Grid Flip “BAM”

### Motion

-  Entire ABOUT frame sliced into tiles (CSS grid, individual divs, or WebGL quad grid).
    
-  Staggered **Y-axis flips** center-out:
    
    - Each tile’s front = ABOUT content slice; back = next Services intro video.
        
-  After flip completes:
    
    - Grid lines fade.
        
    - User now sees full-screen **Services intro video**.
        

Use GSAP timeline (short duration ~0.4–0.6s) with per-tile stagger (50–80ms).

---

## 8. SERVICES – Intro Video → Credits on Black

### Layout

-  Top: Intro video frame (full width).
    
-  Below: **full-viewport Black Stallion** panel with centered credits:
    
    - `SERVICES / CREDITS`
        
    - `MOUNTAIN DOP`
        
    - `EXPED & PRODUCT PHOTOGRAPHY`
        
    - `AERIAL CINEMATOGRAPHY`
        
    - `STOCK FOOTAGE (SHUTTERSTOCK)`
        
-  At bottom: CTA text line:
    
    - `ONE MORE SHOT ↓`
        
    - `SCROLL FOR FINAL CONTACT`
        

### Motion

**Video**

-  On grid flip completion, video auto-plays.
    
-  Scroll past mid-point:
    
    - Fade video to black (maybe radial/lens vignette).
        
    - Reveal black credit panel.
        

**Credit roll**

-  Pin Services section.
    
-  Map scroll to vertical translation of each service line:
    
    - Lines start below fold.
        
    - As scroll progresses, each line moves into center “hero line” position, then moves past.
        
-  Use brandEnter easing but subtle; no bounce.
    

**CTA**

-  When last credit line passes through center:
    
    - CTA lines fade/slide in from below and stay pinned briefly.
        
-  Create a ScrollTrigger that, once user scrolls beyond CTA, kicks off the final 3D camera reveal.
    

---

## 9. SERVICES → FINAL CONTACT – 3D Camera Zoom-out

### Motion (Threlte / GSAP)

-  Freeze credit roll; treat black credits panel as one **card**.
    
-  Use a Threlte scene or CSS 3D:
    
    -  Animate card:
        
        - Scale `1.0 → ~0.4`
            
        - Translate to bottom-right
            
        - Rotate slightly (rotateY ~15°, rotateX ~−10°).
            
-  At same time:
    
    -  Fade in camera body model behind/around card.
        
    -  Snap card into place as **rear LCD** texture of camera.
        
    -  Fade in mountain/BTS scene as backdrop behind camera.
        

Implementation notes:

- Threlte:
    
    - Plane geometry for screen with `servicesTexture`.
        
    - Rest of camera as GLTF or procedural geometry.
        
- GSAP:
    
    - Animate camera & screen transform via `useFrame` hook or GSAP/Three integration.
        

Pin this entire animation with ScrollTrigger (`scrub: true` or short scrub window) for full control.

---

## 10. FINAL CONTACT – End Frame

### Layout

-  Full-viewport scene:
    
    - BG: cinematic mountain or behind-the-scenes scene.
        
    - Foreground: camera object in lower-right; services credits visible on its LCD.
        
    - Left/center: **Final contact text block**:
        
        - “If you have a story to tell please get in touch.”
            
        - Phone + email.
            

### Motion

-  When 3D camera transforms finish:
    
    -  Fade/slide contact text in (`y: 10 → 0`, brandEnter).
        
-  Subtle idle:
    
    -  Tiny camera bob or parallax with pointer (desktop).
        
    -  Very slow BG motion (pan or zoom).
        
-  No further transitions; allow scroll to end at a minimal footer if needed.
    

---

## Shader / TSL / GLSL Hooks (Optional Targets)

Where shaders would be especially nice:

-  **Circular masks / iris transitions**
    
    - Use radial mask in a full-screen quad; drive radius by GSAP timeline.
        
-  **Grid flip**
    
    - Render a subdivided plane; flip quads via vertex shader and stagger offset.
        
-  **Lens blur / vignette**
    
    - Centered blur for focus transitions (Photo→About, Beat transitions).
        
-  **Final 3D scene**
    
    - Lens flares, subtle film grain, or chromatic aberration on the camera scene.
        

---

If you want, I can next turn any one of these sections (e.g. Hero + Hero→Logos transition) into a **concrete Svelte/GSAP pseudo-implementation** so you’ve got an exact starting template.