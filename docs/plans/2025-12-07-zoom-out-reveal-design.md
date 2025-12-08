# Zoom-Out Reveal Transition System

## Overview

This document describes the architecture for scroll-driven "zoom-out" transitions between sections. The effect creates depth by having sections appear to be layered behind the current view, revealed as the camera pulls back.

**Applies to these transitions:**
- BigFilm → FilmStories
- FilmStories → PhotoStats
- PhotoStats → About

**Other transitions use different patterns:**
- Hero → Logos: Metadata morph + lens detach
- Logos → BigFilm: Netflix logo mask expands (portal zoom IN)
- About → Services: Grid flip transition
- Services → FinalContact: CTA portal

---

## Mental Model

Imagine looking through a camera viewfinder:
1. Current section fills the viewport
2. On scroll, the view "zooms out" (camera pulls back)
3. Current section contracts to a circle in the center
4. Behind it, the next section is revealed
5. The previous section (remnant from last transition) shrinks to nothing

**Three layers visible during any transition:**
- **Remnant (N-2):** Small circle from previous transition → shrinks to nothing
- **Current (N-1):** Full viewport → contracts to small center circle
- **Incoming (N):** Revealed behind current, elements parallax into position

---

## Visual Diagram

```
Progress 0% of transition:
┌────────────────────────────┐
│ ┌──┐                       │
│ │◯ │ ← Remnant (shrinking) │
│ └──┘                       │
│ ┌────────────────────────┐ │
│ │                        │ │
│ │   Current Section      │ │ ← Full viewport
│ │                        │ │
│ └────────────────────────┘ │
│   [Incoming hidden behind] │
└────────────────────────────┘

Progress 50% of transition:
┌────────────────────────────┐
│  ·  ← Remnant (tiny)       │
│      ┌──────────┐          │
│      │ Current  │          │ ← Contracting circle
│      │ Section  │          │
│      └──────────┘          │
│  [Incoming Section visible │
│   around the circle,       │
│   elements parallaxing in] │
└────────────────────────────┘

Progress 100% of transition:
┌────────────────────────────┐
│      ┌──┐                  │
│      │◯ │ ← Current now    │
│      └──┘   remnant        │
│                            │
│   Incoming Section         │ ← Now full viewport
│   (elements settled)       │
│                            │
└────────────────────────────┘
```

---

## Mask Behavior

**Direction:** Contracts from edge to center using **torus (donut) mask**

**Torus Mask Pattern:**
The incoming section background is revealed through an expanding ring (annulus) as the current section contracts. The ring starts thin at the edge and thickens as the center hole closes.

```
Start (0%):                    Progress (50%):                End (100%):
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│░░░░░░░░░░░░░░░░░░│          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│          │                  │
│░┌──────────────┐░│          │▓▓┌──────────┐▓▓▓▓│          │                  │
│░│              │░│          │▓▓│          │▓▓▓▓│          │    ┌─┐           │
│░│   Current    │░│ → thin   │▓▓│ Current  │▓▓▓▓│ → thick  │    │◯│ remnant   │
│░│   Section    │░│   ring   │▓▓│          │▓▓▓▓│   ring   │    └─┘           │
│░│              │░│          │▓▓└──────────┘▓▓▓▓│          │   Incoming       │
│░└──────────────┘░│          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│          │   (full)         │
│░░░░░░░░░░░░░░░░░░│          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│          │                  │
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

**CSS mask-image animation (not clipPath):**
```typescript
// Torus mask using radial-gradient
function getTorusMask(innerRadius: number, outerRadius: number): string {
  return `radial-gradient(
    circle at 50% 50%,
    transparent 0%,
    transparent ${innerRadius}%,
    black ${innerRadius}%,
    black ${outerRadius}%,
    transparent ${outerRadius}%
  )`;
}

// Animation parameters:
// Start: inner=140%, outer=150% (thin ring at edge)
// End:   inner=0%,   outer=100% (filled circle, no hole)

// Inner shrinks FASTER than outer → ring thickens as it contracts
```

**Remnant mask (after transition):**
```typescript
// Small visible circle in center
getTorusMask(0, 12) // No hole, 12% radius circle
```

---

## Parallax Elements

Incoming section elements start **oversized** (behind the camera) and shrink into position as the view pulls back.

**Animation:**
```
Start: scale: 1.2, y: -40px  (too close, slightly elevated)
End:   scale: 1.0, y: 0      (correct position)
Rate:  0.85x of mask contraction (lags behind for depth)
Ease:  brandEase
Stagger: 60-80ms between elements
```

**Per-transition parallax targets:**

| Transition | Parallax Elements |
|------------|-------------------|
| BigFilm → FilmStories | Video viewport, story title, body text, step indicator |
| FilmStories → PhotoStats | Stats card, heading, step indicator |
| PhotoStats → About | Beat panel, media column, section label |

---

## Z-Index Layering

```
z-10: Lens Bug (persistent, never masked)
z-3:  Remnant section (shrinking to nothing)
z-2:  Current section (contracting)
z-1:  Incoming section (revealed behind)
z-0:  Background
```

**Dynamic role assignment:**
Sections change z-index as they transition roles:
- Incoming → Current → Remnant → Gone

---

## Persistent Elements

**Lens Bug only.** Lives outside section stack, never masked.

- Position: Top-right corner (after Hero detachment)
- During transitions: Subtle rotation (5-10°) or scale blip (1.0 → 1.04 → 1.0)
- Purpose: Acknowledge the "cut" without competing

**Section labels are NOT persistent** - they live inside sections and get masked with section content.

---

## Timeline Structure

### Scroll Ranges

```typescript
// Section segments (vh units)
bigFilm:      { start: 440,  duration: 300 }   // 440-740vh
filmStories:  { start: 740,  duration: 260 }   // 740-1000vh
photoStats:   { start: 1000, duration: 160 }   // 1000-1160vh
about:        { start: 1160, duration: 300 }   // 1160-1460vh
```

### Transition Zones (last 15% of each section)

| Transition | Scroll Range | What Happens |
|------------|--------------|--------------|
| BigFilm exit | 695-740vh | BigFilm contracts, FilmStories parallax in |
| FilmStories exit | 961-1000vh | BigFilm remnant disappears, FilmStories contracts, PhotoStats parallax in |
| PhotoStats exit | 1136-1160vh | FilmStories remnant disappears, PhotoStats contracts, About parallax in |

### Master Timeline Labels

```typescript
masterTimeline
  // BigFilm → FilmStories
  .addLabel('bigFilm-exit', 695)
  .addLabel('filmStories-parallax', 695)

  // FilmStories → PhotoStats
  .addLabel('bigFilm-remnant-gone', 961)
  .addLabel('filmStories-exit', 961)
  .addLabel('photoStats-parallax', 961)

  // PhotoStats → About
  .addLabel('filmStories-remnant-gone', 1136)
  .addLabel('photoStats-exit', 1136)
  .addLabel('about-parallax', 1136)
```

---

## Implementation Plan

### 1. New Module: `src/lib/motion/zoomOutTransition.ts`

```typescript
export interface ZoomOutTransitionConfig {
  // Section elements
  exitingSection: HTMLElement;
  incomingSection: HTMLElement;
  remnantSection: HTMLElement | null;

  // Parallax targets in incoming section
  parallaxTargets: HTMLElement[];

  // Lens bug for blip animation
  lensBug: HTMLElement | null;

  // Timing
  scrollStart: number;  // vh where transition begins
  scrollEnd: number;    // vh where transition completes
}

export interface ZoomOutTransitions {
  bigFilmToFilmStories: ZoomOutTransitionConfig;
  filmStoriesToPhotoStats: ZoomOutTransitionConfig;
  photoStatsToAbout: ZoomOutTransitionConfig;
}

export function buildZoomOutTimeline(
  config: ZoomOutTransitionConfig
): gsap.core.Timeline;

export function attachZoomOutTransitions(
  transitions: ZoomOutTransitions,
  masterTimeline: gsap.core.Timeline
): void;
```

### 2. Modify `masterScroll.ts`

Add transition orchestration:

```typescript
// Track section roles for z-index management
export type SectionRole = 'remnant' | 'current' | 'incoming' | 'inactive';

// Zoom-out transition boundaries
export const ZOOM_OUT_BOUNDARIES = [
  { from: 'bigFilm', to: 'filmStories', at: 740 },
  { from: 'filmStories', to: 'photoStats', at: 1000 },
  { from: 'photoStats', to: 'about', at: 1160 }
] as const;

// Update section roles based on scroll position
function updateSectionRoles(scrollVH: number): Map<SectionName, SectionRole>;
```

### 3. Section Component Changes

Each section in the zoom-out chain needs:

**CSS initial state:**
```css
.section {
  position: absolute;
  inset: 0;
  clip-path: circle(150% at 50% 50%);  /* starts full */
  opacity: 0;
  visibility: hidden;
}
```

**Export parallax targets:**
```svelte
<script>
  // Expose refs for master timeline
  export function getParallaxTargets(): HTMLElement[] {
    return [viewport, titleRef, bodyRef, indicatorRef].filter(Boolean);
  }
</script>
```

**Remove event-driven patterns:**
- Delete `receivePortalIntro()` method
- Delete exit event dispatchers
- Visibility controlled by scroll position, not events

### 4. Extract Lens Bug

Move from section components to `MainScroll.svelte`:

```svelte
<!-- MainScroll.svelte -->
<div class="section-stack">
  <HeroSection />
  <LogosSection />
  <BigFilmSection />
  <FilmStoriesSection />
  <PhotoStatsSection />
  <AboutSection />
  <ServicesSection />
  <FinalContactSection />
</div>

<!-- Persistent layer - outside section stack -->
<div class="persistent-layer">
  <LensBadge bind:this={lensBugRef} persistent={true} />
</div>
```

### 5. Simplify `+page.svelte`

Remove event cascade:

```svelte
<!-- DELETE these -->
function handleFilmExit() { ... }
function handleFilmStoriesExit() { ... }
function handleStatsExit() { ... }

on:film:exit={handleFilmExit}
on:filmStories:exit={handleFilmStoriesExit}
on:stats:exit={handleStatsExit}
```

---

## What Stays the Same

- `SECTION_SEGMENTS` scroll ranges
- Individual section internal animations (card swaps, text reveals, beat transitions)
- Other transition patterns:
  - Hero → Logos (metadata morph)
  - Logos → BigFilm (Netflix expand)
  - About → Services (grid flip)
  - Services → FinalContact (CTA portal)

---

## Verification Checklist

- [ ] On page load, only Hero visible
- [ ] Scroll to BigFilm exit: BigFilm contracts, FilmStories parallax in
- [ ] Scroll to FilmStories exit: BigFilm remnant disappears, FilmStories contracts, PhotoStats parallax in
- [ ] Scroll to PhotoStats exit: FilmStories remnant disappears, PhotoStats contracts, About parallax in
- [ ] Lens bug stays visible throughout, does blip on each transition
- [ ] Scroll backward: transitions reverse smoothly
- [ ] No event cascade on page load
- [ ] Section labels masked with section content
