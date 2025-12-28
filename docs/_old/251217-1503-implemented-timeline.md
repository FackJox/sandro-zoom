# SANDRO ZOOM - SCROLLYTELLING TIMELINE

**Generated:** 2024-12-17 15:03
**Source:** Code analysis + Playwright verification

## Overview

**Total Scroll Distance:** 1960vh (21,168px at 1080p viewport)
**Sections:** 8 major sections with scroll-driven animations
**Architecture:** Fixed section stack with single master ScrollTrigger

---

## SECTION CONFIGURATION

| Section | Start | Duration | End | Visibility Start | Visibility End |
|---------|-------|----------|-----|------------------|----------------|
| hero | 0vh | 240vh | 240vh | 0vh | 440vh |
| logos | 240vh | 200vh | 440vh | 180vh | 450vh |
| bigFilm | 440vh | 300vh | 740vh | 410vh | 755vh |
| filmStories | 740vh | 260vh | 1000vh | 695vh | 1015vh |
| photoStats | 1000vh | 160vh | 1160vh | 961vh | 1175vh |
| about | 1160vh | 300vh | 1460vh | 1136vh | 1475vh |
| services | 1460vh | 300vh | 1760vh | 1460vh | 1775vh |
| finalContact | 1760vh | 200vh | 1960vh | 1715vh | 2100vh |

---

## DETAILED TIMELINE

### 1. HERO SECTION (0vh - 240vh)

**Visual Elements:**
- Full-screen mountain video/imagery
- Yellow "SANDROGH" slab (top-left)
- Lens badge with video feed (top-left, inside slab)
- Metadata strip: "ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTOGRAPHY"
- Halo ring around lens
- Copy lines with description text

**Timeline: `hero:intro` (plays on page load, 1.5s total)**

| Time | Element | Animation |
|------|---------|-----------|
| 0.0s | media | opacity: 0→1, scale: 1.02→1.0 (0.8s) |
| 0.35s | slab | yPercent: 15→0, opacity: 0→1 (0.6s) |
| 0.6s | lens | scale: 0.8→1.0, opacity: 0→1 (0.4s) |
| 0.75s | metadata | y: 20→0, opacity: 0→1 (0.4s) |
| 0.85s | copyLines | yPercent: 15→0, opacity: 0→1 (0.35s, stagger: 0.05s) |

**Timeline: `hero:morph` (progress-driven, 0-240vh)**

| Progress | Scroll | Animation |
|----------|--------|-----------|
| 0-25% | 0-60vh | Idle state, no visible change |
| 25-55% | 60-132vh | Root: scale 1.0→0.9, brightness 1.0→0.72, clipPath circle(100%→35%) |
| 25-55% | 60-132vh | Halo: opacity 0→0.6→0.9, scale 1.0→1.8→2.4 |
| 25-55% | 60-132vh | LensMedia: scale 1.1→1.0 (zoom out effect) |
| 55-80% | 132-192vh | Metadata: yPercent 0→-240, bg→blackPearl, color→eggToast, letterSpacing→0.18em |
| 75-85% | 180-204vh | Metadata: opacity 1→0 (detach) |
| 85% | 204vh | **CALLBACK:** Push logos metadata, mark lens detached, attach to 'logos' |
| 85-90% | 204-216vh | Metadata: opacity 0→1 (reattach with new style) |
| 90-100% | 216-240vh | Halo: opacity→0; Root: clipPath circle(35%→0%), opacity→0 |

**Parallax Animations (non-reduced motion):**
- Slab: yPercent 0→-4 (full duration)
- Lens idleOffset: 0→-6 (0-80% progress)
- Strips: each drifts yPercent -15×depth, xPercent ±6-8×depth, rotation ±10-12°
- Media drift: scale 1.0↔1.04 (6s continuous loop, yoyo)

**Lens Badge State:** xPercent -12, yPercent -38, scale 0.74, opacity 0.68

---

### 2. LOGOS SECTION (240vh - 440vh)

**Visual Elements:**
- Horizontal logo rail (BERGHAUS, OSPREY, RED BULL TV, NETFLIX, BBC, TNF)
- Metadata strip: "BERGHAUS • OSPREY • RED BULL TV • NETFLIX • BBC • TNF"
- Portal overlay (positioned at Netflix logo)

**Timeline: `logos:master` (progress-driven)**

| Progress | Scroll | Animation |
|----------|--------|-----------|
| 0-100% | 240-440vh | Rail: xPercent 0→-25 (continuous drift) |
| 0-60% | 240-360vh | Metadata: yPercent 0→-10, bg→blackPearl, border→eggToast |

**Timeline: `logos:portal` (built dynamically)**
- Portal positioned at Netflix logo bounding box
- Expands from 48px circle to 85vw to frame size
- Drives transition to BigFilm

**Lens Attachment:**
- Entry: attachLensToSection('logos')
- Exit (≥95%): attachLensToSection('film')
- Exit back (≤5%): attachLensToSection('hero')

**Lens Badge State:** xPercent -6, yPercent -55, scale 0.6, opacity 0.55

---

### 3. BIGFILM SECTION (440vh - 740vh)

**Visual Elements:**
- 3 film cards with video backgrounds:
  - Card 0: 14 PEAKS / NETFLIX (woman's face)
  - Card 1: K2 WINTER / EXPEDITION
  - Card 2: K2 SUMMIT / 2022
- Yellow frame slab on left side
- Metadata: "FILM — HIGH ALTITUDE FEATURES"
- Lens barrel overlay (shows during transitions)
- Concentric circle rings (exit portal)
- Preview strip (story thumbnails)

**Initial State:**
- Card 0: autoAlpha 1, clipPath circle(150%)
- Cards 1-2: autoAlpha 0, clipPath circle(0%)
- Z-index stacked (card 0 on top)

**Timeline: `big-film:pin` (progress-driven)**

| Progress | Scroll | Animation |
|----------|--------|-----------|
| **Card Transition 1 @ 30%** | | |
| 28% | 528vh | Lens barrel shows: "K2 WINTER / EXPEDITION" |
| 30% | 530vh | Card 0: clipPath circle(150%→0%), autoAlpha 1→0.35 (240ms) |
| 35% | 545vh | Card 1: clipPath circle(0%→150%), autoAlpha 0→1 (260ms) |
| 32% | 536vh | **CALLBACK:** onStepChange(1) |
| 37% | 551vh | Slab lines: yPercent 12→0, autoAlpha 0→1 (stagger 60ms) |
| 45% | 575vh | Lens barrel hides |
| **Card Transition 2 @ 65%** | | |
| 63% | 635vh | Lens barrel shows: "K2 SUMMIT / 2022" |
| 65% | 650vh | Card 1: clipPath circle(150%→0%), autoAlpha 1→0.35 (240ms) |
| 70% | 665vh | Card 2: clipPath circle(0%→150%), autoAlpha 0→1 (260ms) |
| 67% | 657vh | **CALLBACK:** onStepChange(2) |
| 72% | 672vh | Slab lines animate |
| 80% | 696vh | Lens barrel hides |

**Exit Portal (85-100%)**

| Progress | Scroll | Animation |
|----------|--------|-----------|
| 85% | 695vh | **CALLBACK:** onConcentricShow(1) - rings appear |
| 85-88% | 695-708vh | All cards: scale 1.0→0.9-0.95 (slight shrink) |
| 85-95% | 695-722vh | Concentric rings: opacity pulse 0→0.35→0, scale 0.5→1.9 |
| 87-92% | 700-714vh | Cards: scale→0.45 (dramatic shrink to film strip) |
| 90-95% | 716-728vh | Cards: arrange horizontally (xPercent offsets like film strip) |
| 90-95% | 716-728vh | Cards: border 2px coverOfNight, scale→0.35 |
| 92% | 720vh | **CALLBACK:** triggerFilmStoriesEntry() - reel animation |
| 92-97% | 720-735vh | Preview strip: opacity 0→1→0 (stories preview) |
| 95% | 728vh | Sticky label "Film — Field Stories" shows |
| 100% | 740vh | **CALLBACK:** onComplete() |

**Lens Attachment:**
- Entry: attachLensToSection('film')
- Exit (≥95%): attachLensToSection('filmStories')
- Exit back (≤5%): attachLensToSection('logos')

---

### 4. ZOOM-OUT TRANSITIONS

Three zoom-out transitions create the "camera pull-back" effect:

**Transition 1: BigFilm → FilmStories (695vh - 740vh)**

| Progress | Element | Animation |
|----------|---------|-----------|
| 0-100% | BigFilm root | clipPath: circle(150%→12%) |
| 0-100% | FilmStories parallax | scale: 1.2→1.0, y: -40→0, opacity: 0.7→1.0 |
| ~30% | Lens bug | rotation: 0→7°→0, scale: 1.0→1.02→1.0 (blip) |

**Transition 2: FilmStories → PhotoStats (961vh - 1000vh)**

| Progress | Element | Animation |
|----------|---------|-----------|
| 0-40% | BigFilm remnant | clipPath: circle(12%→0%) - disappears |
| 0-100% | FilmStories root | clipPath: circle(150%→12%) |
| 0-100% | PhotoStats parallax | scale: 1.2→1.0, y: -40→0, opacity: 0.7→1.0 |
| ~30% | Lens bug | blip animation |

**Transition 3: PhotoStats → About (1136vh - 1160vh)**

| Progress | Element | Animation |
|----------|---------|-----------|
| 0-40% | FilmStories remnant | clipPath: circle(12%→0%) |
| 0-100% | PhotoStats root | clipPath: circle(150%→12%) |
| 0-100% | About parallax | scale: 1.2→1.0, y: -40→0, opacity: 0.7→1.0 |
| ~30% | Lens bug | blip animation |

---

### 5. FILMSTORIES SECTION (740vh - 1000vh)

**Visual Elements:**
- Story grid selector (K2, 14 Peaks, etc.)
- Focus ring indicator
- Text crossfade on selection

**Timeline: `film-stories` (progress-driven)**

- Text crossfade on story change: fade out + yPercent -12, update content, slide in from yPercent 12→0
- Stagger: 60ms between title/body
- Focus ring animates to selected story position

**Lens Attachment:** Transfers between 'film' and 'filmStories'

---

### 6. PHOTOSTATS SECTION (1000vh - 1160vh)

**Visual Elements:**
- Mountain climbing statistics
- Success/fail climb stats visualization
- Night mountain scene with base camp lights

**Timeline: `photo-stats`**
- Progress-driven visibility and clip-path animations
- Handled primarily by master controller visibility system

---

### 7. ABOUT SECTION (1160vh - 1460vh)

**Visual Elements:**
- 3 beats: Basecamp, Frontline, Values
- Media transitions between beats
- Focus ring movement

**Timeline: `about` (progress-driven)**

| Beat | Progress | Content |
|------|----------|---------|
| Beat 1 | ~30% | Basecamp content |
| Beat 2 | ~63% | Frontline content |
| Beat 3 | ~90% | Values content |

**Beat Transitions:**
- Inside mask: Incoming beat fades in
- Outside mask: Outgoing beat fades out
- Focus ring: Animates to beat position (center-right of element)
- Text crossfade with slide (60ms stagger per element)

---

### 8. SERVICES SECTION (1460vh - 1760vh)

**Visual Elements:**
- Night basecamp scene
- Grid flip entry animation from About

**Timeline: `services`**
- receivePortalIntro(focusRect) triggers grid flip
- Cards reveal with stagger

---

### 9. FINALCONTACT SECTION (1760vh - 1960vh)

**Visual Elements:**
- Person portrait with smoke
- 3D camera model overlay
- Contact panel:
  - "IF YOU HAVE A STORY TO TELL PLEASE GET IN TOUCH"
  - Phone number
  - Email: sandro.gromen-hayes@live.com
  - SERVICES / CREDITS tabs
  - Service list

**Timeline: `final-contact`**
- receivePortalIntro(focusRect) triggers CTA portal
- Portal shrink animation
- CTA text reveal

---

## PERSISTENT ELEMENTS

### Lens Badge (Persistent Layer)
- Position: Fixed, top 1.5rem, right 1.5rem
- Size: 48px
- Tone: 'ghost' (screen blend mode)
- Z-index: 10 (always on top)
- Visibility: Hidden when hero owns lens, visible for all other sections

### Metadata Strip
- Transitions between sections via push/pop state system
- Hero: "ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTOGRAPHY"
- Logos: "BERGHAUS • OSPREY • RED BULL TV • NETFLIX • BBC • TNF"

---

## Z-INDEX LAYERING

| Layer | Z-Index | Usage |
|-------|---------|-------|
| lens | 10 | Persistent lens badge |
| hero | 5 | Hero during intro |
| logos | 4 | Logos above BigFilm during portal |
| remnant | 3 | Previous section's shrinking circle |
| current | 2 | Active section |
| incoming | 1 | Next section parallaxing in |
| inactive | 0 | Hidden sections |

---

## KEY ANIMATION TIMING CONSTANTS

- **Card iris transitions:** 220-260ms
- **Text stagger:** 50-80ms (using 60ms)
- **Brand easing:** `cubic-bezier(0.19, 1, 0.22, 1)`
- **Media drift:** 6s continuous loop
- **Lens blip:** rotation 7°, scale 1.02 (120ms + 180ms)
- **Zoom-out transition zone:** Last 15% of section duration
- **Parallax lag rate:** 0.85 (elements lag behind mask)

---

## VERIFIED BY PLAYWRIGHT

Console logs confirmed:
- ✅ All 8 sections registered correctly
- ✅ Zoom-out transitions fire at 695vh, 961vh, 1136vh
- ✅ Lens blip triggers at story boundaries (740vh, 803vh, 851vh)
- ✅ FPS maintained at 50-120fps throughout scroll
- ✅ Total scroll distance: 20,088px at 1080p

---

## SOURCE FILES

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/motion/masterScroll.ts` | 587 | Main scroll orchestrator |
| `src/lib/motion/sectionConfig.ts` | 24 | Section scroll segments |
| `src/lib/motion/visibilityConfig.ts` | 103 | Visibility ranges |
| `src/lib/motion/zoomOutTransition.ts` | 332 | Zoom-out reveal system |
| `src/lib/sections/HeroSection.motion.ts` | 301 | Hero intro & morph |
| `src/lib/sections/LogosSection.motion.ts` | 148 | Logo rail & portal |
| `src/lib/sections/BigFilmSection.motion.ts` | 300 | Card iris & exit portal |
| `src/lib/sections/FilmExitPortal.ts` | 215 | Concentric rings animation |
| `src/lib/motion/lensTimeline.ts` | 191 | Lens state tracking |
| `src/lib/motion/metadata.ts` | 91 | Metadata stack management |
