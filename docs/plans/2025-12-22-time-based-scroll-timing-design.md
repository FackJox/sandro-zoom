# Time-Based Scroll Timing Architecture

## Problem Statement

Current implementation uses arbitrary scroll-triggered animations that play at inconsistent times. This leads to:

1. Motion that feels rushed or dragged depending on scroll speed
2. No connection between code values and design token specifications
3. Inconsistent experience across devices (mobile swipe vs desktop scroll)
4. Animations that fight the scroll rather than flowing with it

## Solution Overview

Define a **perfect pace**—the canonical scroll speed for an ideal viewing experience. All timing is specified in **milliseconds**, then converted to scroll positions. The scroll container height becomes a derived value based on content needs.

```
┌─────────────────────────────────────────────────────────────┐
│                    DESIGN LAYER (time-based)                │
│  • Brand durations: micro (150-200ms), standard (280-350ms) │
│  • Section transitions: cinematic (500-600ms)               │
│  • Viewing holds: time to appreciate each shot              │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    timeToScroll(ms) conversion
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  SCROLL LAYER (normalized)                  │
│  • Everything expressed as % of total scroll                │
│  • Scroll height = PERFECT_DURATION × SCROLL_SPEED          │
│  • Device-normalized via multipliers                        │
│  • Lerp smoothing for scroll start/stop                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Constants

```typescript
// src/lib/motion/timing.ts

// ============== PERFECT PACE ==============
// The canonical viewing experience at comfortable scroll speed
// If user scrolled at constant pace, full experience takes this long
export const PERFECT_DURATION_SECONDS = 120  // 2 minutes for full portfolio

// Comfortable scroll speed (research: 50-80px/s for reading)
// Slightly faster for visual content - we're viewing, not reading
const COMFORTABLE_SCROLL_SPEED = 55  // px/s

// ============== BRAND DURATION TOKENS ==============
export const BRAND_DURATIONS = {
  // Micro (focus snap, state changes)
  micro: 175,           // midpoint of 150-200ms

  // Standard (the workhorse - lens badge, metadata)
  standard: 315,        // midpoint of 280-350ms

  // Cinematic (section transitions, portal zooms)
  cinematic: 550,       // midpoint of 500-600ms
} as const

// ============== EASING TOKENS ==============
export const BRAND_EASING = {
  lockOn: 'cubic-bezier(0.19, 1.0, 0.22, 1.0)',   // fast acquire, smooth settle
  release: 'cubic-bezier(0.25, 0.0, 0.35, 1.0)',  // gentle departure
} as const

// ============== CORE CONVERSION ==============
export function timeToScroll(ms: number): number {
  return (ms / 1000) / PERFECT_DURATION_SECONDS
}

// Target scroll distance for the full experience
export const TARGET_SCROLL_DISTANCE = PERFECT_DURATION_SECONDS * COMFORTABLE_SCROLL_SPEED
// = 120 * 55 = 6600px total scroll
```

---

## Viewing Time

For visual content, we define **viewing holds**—how long each shot stays prominent:

```typescript
// Base visibility for any visual element
const VIEWING_BASE_MS = 800

// Additional time based on content complexity
const VIEWING_COMPLEXITY = {
  simple: 0,        // Logo, single element
  moderate: 400,    // Film card with title
  rich: 800,        // Full video frame with context
} as const

export function calculateViewingTime(
  complexity: keyof typeof VIEWING_COMPLEXITY
): number {
  return VIEWING_BASE_MS + VIEWING_COMPLEXITY[complexity]
}

// Examples:
// Logo in strip: 800ms
// Film card: 1200ms
// Hero with video: 1600ms
```

---

## Device Normalization

Different devices have different scroll behaviors. Normalize so the experience feels consistent:

```typescript
// src/lib/motion/scroll-config.ts

export function getDeviceScrollMultiplier(): number {
  if (typeof window === 'undefined') return 1

  const width = window.innerWidth

  // Mobile: faster swipes, shorter scroll distance needed
  if (width < 768) return 0.65

  // Tablet: moderate adjustment
  if (width < 1024) return 0.8

  // Desktop: baseline
  return 1
}

export function getScrollHeight(): number {
  return TARGET_SCROLL_DISTANCE * getDeviceScrollMultiplier()
}

// Mobile:  6600 × 0.65 = 4290px
// Tablet:  6600 × 0.80 = 5280px
// Desktop: 6600 × 1.00 = 6600px
```

---

## Scroll Velocity Lerp

Smooth the scroll velocity so animations don't jerk on start/stop:

```typescript
// src/lib/motion/scroll-lerp.ts

interface ScrollLerpState {
  currentVelocity: number
  targetVelocity: number
  smoothedProgress: number
}

const LERP_FACTORS = {
  // How quickly velocity ramps up when scroll starts
  accelerate: 0.12,

  // How quickly velocity decays when scroll stops
  decelerate: 0.08,
} as const

export function createScrollLerp() {
  let state: ScrollLerpState = {
    currentVelocity: 0,
    targetVelocity: 0,
    smoothedProgress: 0,
  }

  return {
    update(rawProgress: number, rawVelocity: number) {
      state.targetVelocity = rawVelocity

      // Lerp toward target velocity
      const lerpFactor = rawVelocity > state.currentVelocity
        ? LERP_FACTORS.accelerate
        : LERP_FACTORS.decelerate

      state.currentVelocity += (state.targetVelocity - state.currentVelocity) * lerpFactor

      // Apply smoothed velocity to progress
      state.smoothedProgress = rawProgress

      return {
        progress: state.smoothedProgress,
        velocity: state.currentVelocity,
        isSettling: Math.abs(state.targetVelocity) < 0.01 && Math.abs(state.currentVelocity) > 0.001
      }
    },

    reset() {
      state = { currentVelocity: 0, targetVelocity: 0, smoothedProgress: 0 }
    }
  }
}
```

### Integration with ScrollTrigger

```typescript
// In orchestrator setup
const scrollLerp = createScrollLerp()

ScrollTrigger.create({
  trigger: scrollContainer,
  start: 'top top',
  end: `+=${getScrollHeight()}`,
  scrub: true,
  onUpdate: (self) => {
    const { progress, velocity, isSettling } = scrollLerp.update(
      self.progress,
      self.getVelocity() / 1000
    )

    // Use smoothed progress for timeline
    masterTimeline.progress(progress)

    // Optional: reduce motion intensity when settling
    if (isSettling) {
      // Animations ease to rest naturally
    }
  }
})
```

---

## Section Definitions

Map the Framework sections to time-based durations. Scroll regions become **derived values**, not hardcoded percentages.

```typescript
// src/lib/motion/section-definitions.ts

interface SectionDefinition {
  id: string
  name: string
  transitionIn: keyof typeof BRAND_DURATIONS    // from previous section
  transitionOut: keyof typeof BRAND_DURATIONS   // to next section
  beats: BeatDefinition[]                        // internal content beats
}

interface BeatDefinition {
  id: string
  viewingTime: number        // ms - how long this beat is prominent
  hasPortalZoom?: boolean    // adds cinematic duration
  holdAfter?: number         // ms - breathing room before next beat
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: 'hero',
    name: 'Hero',
    transitionIn: 'cinematic',     // page load entry
    transitionOut: 'cinematic',    // portal zoom to Film (via Netflix logo)
    beats: [
      // Logos visible immediately in strip at bottom
      { id: 'hero:intro', viewingTime: 1600, holdAfter: 400 },
      // Logos → Metadata scan line wipe (550ms) at 50% scroll
      { id: 'hero:logos-to-metadata', viewingTime: 550 },
      // Metadata visible, idle state
      { id: 'hero:idle', viewingTime: 2000 },
      // Netflix portal zoom from metadata strip
      { id: 'hero:exit', viewingTime: 800, hasPortalZoom: true },
    ]
  },
  // NOTE: Logos section removed - absorbed into Hero
  // Social proof (client logos) now appears immediately in Hero strip
  {
    id: 'bigFilm',
    name: 'Big Film (Netflix/K2)',
    transitionIn: 'cinematic',     // iris zoom from Netflix logo in metadata strip
    transitionOut: 'cinematic',    // zoom out to reel strip
    beats: [
      // Metadata: "14 PEAKS • NETFLIX • 2021"
      { id: 'film:14peaks', viewingTime: 2400, holdAfter: 300 },
      // Iris transition + metadata update: "K2 WINTER • DISCOVERY • 2020"
      { id: 'film:k2-winter', viewingTime: 2400, holdAfter: 300 },
      // Iris transition + metadata update: "K2 SUMMIT • 2021"
      { id: 'film:k2-summit', viewingTime: 2000 },
    ]
  },
  {
    id: 'film-stories',
    name: 'Film Stories',
    transitionIn: 'cinematic',     // focus pull along strip
    transitionOut: 'cinematic',    // zoom out, lens to stats
    beats: [
      { id: 'stories:sasha', viewingTime: 2000, holdAfter: 200 },
      { id: 'stories:grace', viewingTime: 2000, holdAfter: 200 },
      { id: 'stories:afghanistan', viewingTime: 2000 },
    ]
  },
  {
    id: 'photo',
    name: 'Photo + Climbing Cred',
    transitionIn: 'cinematic',     // lens moves to stats
    transitionOut: 'standard',     // fade transition
    beats: [
      { id: 'photo:successful', viewingTime: 1800 },
      { id: 'photo:unsuccessful', viewingTime: 1800 },
    ]
  },
  {
    id: 'about',
    name: 'About Me',
    transitionIn: 'cinematic',     // centered lens zoom
    transitionOut: 'cinematic',    // grid flip
    beats: [
      { id: 'about:frontline', viewingTime: 2200, holdAfter: 200 },
      { id: 'about:origin', viewingTime: 2200, holdAfter: 200 },
      { id: 'about:values', viewingTime: 2000 },
    ]
  },
  {
    id: 'services',
    name: 'Services',
    transitionIn: 'cinematic',     // grid flip reveals video
    transitionOut: 'cinematic',    // 3D camera zoom out
    beats: [
      { id: 'services:video', viewingTime: 1400 },
      { id: 'services:credits', viewingTime: 2400 },
      { id: 'services:cta', viewingTime: 800 },
    ]
  },
  {
    id: 'contact',
    name: 'Final Contact',
    transitionIn: 'cinematic',     // 3D camera reveal
    transitionOut: 'standard',     // end state
    beats: [
      { id: 'contact:reveal', viewingTime: 1600 },
      { id: 'contact:hold', viewingTime: 2000 },
    ]
  },
]
```

---

## Duration Calculation

```typescript
function calculateBeatDuration(beat: BeatDefinition): number {
  let duration = beat.viewingTime

  if (beat.hasPortalZoom) {
    duration += BRAND_DURATIONS.cinematic
  }

  duration += beat.holdAfter ?? 0

  return duration
}

function calculateSectionDuration(section: SectionDefinition): number {
  const transIn = BRAND_DURATIONS[section.transitionIn]
  const transOut = BRAND_DURATIONS[section.transitionOut]
  const beatsDuration = section.beats.reduce(
    (sum, beat) => sum + calculateBeatDuration(beat),
    0
  )

  return transIn + beatsDuration + transOut
}

// Derive scroll regions from content
export function deriveSectionScrollRegions(): Record<string, { start: number; end: number }> {
  const durationsMs = SECTION_DEFINITIONS.map(calculateSectionDuration)
  const totalMs = durationsMs.reduce((a, b) => a + b, 0)

  const regions: Record<string, { start: number; end: number }> = {}
  let cursor = 0

  SECTION_DEFINITIONS.forEach((section, i) => {
    const proportion = durationsMs[i] / totalMs
    regions[section.id] = { start: cursor, end: cursor + proportion }
    cursor += proportion
  })

  return regions
}

// REPLACES hardcoded scroll regions
export const sectionScrollRegions = deriveSectionScrollRegions()
```

---

## Timeline Integration Helpers

Convert time-based values to scroll positions within each section's timeline:

```typescript
// src/lib/motion/timeline-helpers.ts

export function createSectionTimingHelpers(sectionId: string) {
  const region = sectionScrollRegions[sectionId]
  const sectionScrollSpan = region.end - region.start

  return {
    // Convert ms duration to section-relative scroll proportion
    dur(ms: number): number {
      const globalProportion = timeToScroll(ms)
      return globalProportion / sectionScrollSpan
    },

    // Position within section (0-1) from cumulative ms offset
    pos(cumulativeMs: number): number {
      return timeToScroll(cumulativeMs) / sectionScrollSpan
    },

    // Get section boundaries
    region,
    sectionScrollSpan,
  }
}
```

### Beat Lifecycle Helper

Standard pattern for animating content beats:

```typescript
interface BeatLifecycleOptions {
  appearAtMs: number           // cumulative ms from section start
  appearDurMs?: number         // default: BRAND_DURATIONS.standard
  viewingDurMs: number         // time beat stays prominent
  exitDurMs?: number           // default: BRAND_DURATIONS.micro
  hasPortalZoom?: boolean      // adds zoom animation
  skipExit?: boolean           // for beats that persist
}

function addBeatLifecycle(
  tl: gsap.core.Timeline,
  target: Element,
  opts: BeatLifecycleOptions,
  helpers: ReturnType<typeof createSectionTimingHelpers>
): number {
  const { dur, pos } = helpers

  const appearDur = opts.appearDurMs ?? BRAND_DURATIONS.standard
  const exitDur = opts.skipExit ? 0 : (opts.exitDurMs ?? BRAND_DURATIONS.micro)
  const zoomDur = opts.hasPortalZoom ? BRAND_DURATIONS.cinematic : 0

  // Appear (lock-on)
  tl.fromTo(target,
    { opacity: 0, scale: 0.96 },
    {
      opacity: 1,
      scale: 1,
      duration: dur(appearDur),
      ease: BRAND_EASING.lockOn
    },
    pos(opts.appearAtMs)
  )

  // Portal zoom if applicable
  if (opts.hasPortalZoom) {
    tl.to(target, {
      scale: 1.04,
      duration: dur(zoomDur),
      ease: BRAND_EASING.lockOn,
    }, pos(opts.appearAtMs + appearDur + opts.viewingDurMs))
  }

  // Exit (release)
  if (!opts.skipExit) {
    const exitStart = opts.appearAtMs + appearDur + opts.viewingDurMs + zoomDur
    tl.to(target, {
      opacity: 0,
      duration: dur(exitDur),
      ease: BRAND_EASING.release,
    }, pos(exitStart))
  }

  return opts.appearAtMs + appearDur + opts.viewingDurMs + zoomDur + exitDur
}
```

### Example: Film Section Timeline

```typescript
// src/lib/motion/timelines/film.ts

export function buildFilmTimeline(
  container: HTMLElement,
  cards: { peaks: Element; k2Winter: Element; k2Summit: Element }
): gsap.core.Timeline {
  const tl = gsap.timeline()
  const helpers = createSectionTimingHelpers('film')

  // Start after transition-in
  let cursor = BRAND_DURATIONS.cinematic

  // Card 1: 14 Peaks
  cursor = addBeatLifecycle(tl, cards.peaks, {
    appearAtMs: cursor,
    viewingDurMs: 2400,
    hasPortalZoom: true,  // iris transition to next card
  }, helpers)

  // Card 2: K2 Winter
  cursor = addBeatLifecycle(tl, cards.k2Winter, {
    appearAtMs: cursor,
    viewingDurMs: 2400,
    hasPortalZoom: true,
  }, helpers)

  // Card 3: K2 Summit (no portal zoom - section exit handles it)
  cursor = addBeatLifecycle(tl, cards.k2Summit, {
    appearAtMs: cursor,
    viewingDurMs: 2000,
    skipExit: true,  // section transition handles exit
  }, helpers)

  return tl
}
```

---

## Implementation Checklist

### New Files

- [ ] `src/lib/motion/timing.ts` - Core constants, durations, easing, conversion functions
- [ ] `src/lib/motion/scroll-config.ts` - Device multipliers, scroll height calculation
- [ ] `src/lib/motion/scroll-lerp.ts` - Velocity smoothing for scroll start/stop
- [ ] `src/lib/motion/section-definitions.ts` - Section and beat definitions from Framework
- [ ] `src/lib/motion/timeline-helpers.ts` - `createSectionTimingHelpers`, `addBeatLifecycle`

### Modified Files

- [ ] `src/lib/motion/orchestrator.ts` - Integrate scroll lerp, use derived section regions
- [ ] Section `.motion.ts` files - Migrate to time-based helpers

### Migration Strategy

**Phase 1: Foundation**
- Create timing constants and helpers
- Add section definitions matching Framework docs
- Keep existing scroll regions temporarily (parallel systems)

**Phase 2: Scroll Lerp**
- Implement velocity smoothing
- Integrate with ScrollTrigger
- Test start/stop feel on all devices

**Phase 3: Section Migration**
- Migrate one section at a time (start with Hero)
- Use new timing helpers alongside old approach
- Verify feel matches Framework intent

**Phase 4: Derived Regions**
- Switch to derived `sectionScrollRegions`
- Update scroll container sizing per device
- Remove hardcoded percentages

**Phase 5: Polish**
- Tune viewing times based on real usage
- Adjust lerp factors for feel
- Document any manual overrides

---

## Key Formulas Reference

| Concept | Formula |
|---------|---------|
| Viewing time (simple) | `800ms` |
| Viewing time (moderate) | `800 + 400 = 1200ms` |
| Viewing time (rich) | `800 + 800 = 1600ms` |
| Time → scroll | `(ms / 1000) / 120` |
| Scroll distance | `120s × 55px/s = 6600px` |
| Device multiplier | Desktop: 1.0, Tablet: 0.8, Mobile: 0.65 |
| Lerp accelerate | `0.12` |
| Lerp decelerate | `0.08` |

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| 120s perfect duration | Full portfolio viewing with breathing room |
| 55px/s scroll speed | Slightly faster than reading—viewing visual content |
| 800ms base visibility | Minimum dwell time to register any visual |
| Device multipliers | Mobile swipes faster; compensate with shorter scroll |
| Lerp smoothing | Prevents jarring start/stop on scroll |
