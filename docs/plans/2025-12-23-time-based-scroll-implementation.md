# Time-Based Scroll Timing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace arbitrary vh-based scroll segments with time-based durations that derive scroll positions, enabling consistent "perfect pace" experience across devices.

**Architecture:** Create a timing layer that converts millisecond durations to scroll proportions. Section definitions derive scroll regions from content needs. Scroll lerp smooths start/stop velocity. Existing animation sequences preserved, just normalized to the new timing system.

**Tech Stack:** SvelteKit, GSAP 3.13, ScrollTrigger, TypeScript

---

## Task 1: Create Core Timing Constants

**Files:**
- Create: `src/lib/motion/timing.ts`
- Test: Manual verification in browser console

**Step 1: Create the timing constants file**

```typescript
// src/lib/motion/timing.ts

/**
 * Time-Based Scroll Timing
 *
 * All animation durations defined in milliseconds, converted to scroll proportions
 * via a single conversion layer. This enables:
 * - Design tokens that match spec (150ms, 315ms, 550ms)
 * - Device-normalized scroll distances
 * - Consistent "perfect pace" experience
 */

// ============== PERFECT PACE ==============
// The canonical viewing experience at comfortable scroll speed
// If user scrolled at constant pace, full experience takes this long
export const PERFECT_DURATION_SECONDS = 120;  // 2 minutes for full portfolio

// Comfortable scroll speed (research: 50-80px/s for reading)
// Slightly faster for visual content - we're viewing, not reading
const COMFORTABLE_SCROLL_SPEED = 55;  // px/s

// ============== BRAND DURATION TOKENS ==============
export const BRAND_DURATIONS = {
  // Micro (focus snap, state changes) - 150-200ms range
  micro: 175,

  // Standard (the workhorse - lens badge, metadata) - 280-350ms range
  standard: 315,

  // Cinematic (section transitions, portal zooms) - 500-600ms range
  cinematic: 550,
} as const;

export type BrandDuration = keyof typeof BRAND_DURATIONS;

// ============== EASING TOKENS ==============
export const BRAND_EASING = {
  // Fast acquisition, smooth settle - like a gimbal locking on
  lockOn: 'cubic-bezier(0.19, 1.0, 0.22, 1.0)',

  // Gentler departure - like releasing a subject
  release: 'cubic-bezier(0.25, 0.0, 0.35, 1.0)',
} as const;

export type BrandEasing = keyof typeof BRAND_EASING;

// ============== VIEWING TIME ==============
// Base visibility for any visual element
const VIEWING_BASE_MS = 800;

// Additional time based on content complexity
const VIEWING_COMPLEXITY = {
  simple: 0,        // Logo, single element
  moderate: 400,    // Film card with title
  rich: 800,        // Full video frame with context
} as const;

export type ViewingComplexity = keyof typeof VIEWING_COMPLEXITY;

export function calculateViewingTime(complexity: ViewingComplexity): number {
  return VIEWING_BASE_MS + VIEWING_COMPLEXITY[complexity];
}

// ============== CORE CONVERSION ==============
/**
 * Convert milliseconds to scroll proportion (0-1)
 * Based on perfect pace: 120 seconds for full experience
 */
export function timeToScroll(ms: number): number {
  return (ms / 1000) / PERFECT_DURATION_SECONDS;
}

/**
 * Convert scroll proportion back to milliseconds
 */
export function scrollToTime(proportion: number): number {
  return proportion * PERFECT_DURATION_SECONDS * 1000;
}

// Target scroll distance for the full experience (before device multiplier)
export const TARGET_SCROLL_DISTANCE = PERFECT_DURATION_SECONDS * COMFORTABLE_SCROLL_SPEED;
// = 120 * 55 = 6600px total scroll
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors related to timing.ts

**Step 3: Commit**

```bash
git add src/lib/motion/timing.ts
git commit -m "feat(motion): add time-based timing constants and conversion"
```

---

## Task 2: Create Device Normalization

**Files:**
- Create: `src/lib/motion/scroll-config.ts`
- Test: Manual verification in browser console

**Step 1: Create the scroll config file**

```typescript
// src/lib/motion/scroll-config.ts

import { TARGET_SCROLL_DISTANCE } from './timing';

/**
 * Device-Normalized Scroll Configuration
 *
 * Different devices have different scroll behaviors:
 * - Mobile: faster swipes, need shorter scroll distance
 * - Tablet: moderate adjustment
 * - Desktop: baseline experience
 */

// ============== DEVICE MULTIPLIERS ==============
const DEVICE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

const DEVICE_MULTIPLIERS = {
  mobile: 0.65,   // 6600 × 0.65 = 4290px
  tablet: 0.8,    // 6600 × 0.80 = 5280px
  desktop: 1.0,   // 6600 × 1.00 = 6600px
} as const;

/**
 * Get the scroll multiplier for current device
 * Returns 1 on server (SSR safe)
 */
export function getDeviceScrollMultiplier(): number {
  if (typeof window === 'undefined') return DEVICE_MULTIPLIERS.desktop;

  const width = window.innerWidth;

  if (width < DEVICE_BREAKPOINTS.mobile) return DEVICE_MULTIPLIERS.mobile;
  if (width < DEVICE_BREAKPOINTS.tablet) return DEVICE_MULTIPLIERS.tablet;
  return DEVICE_MULTIPLIERS.desktop;
}

/**
 * Get the total scroll height for current device
 */
export function getScrollHeight(): number {
  return TARGET_SCROLL_DISTANCE * getDeviceScrollMultiplier();
}

/**
 * Get scroll height in vh units for CSS
 * @param viewportHeight - Current viewport height in pixels
 */
export function getScrollHeightVh(viewportHeight: number): number {
  const targetPx = getScrollHeight();
  return (targetPx / viewportHeight) * 100;
}

/**
 * Get current device type for debugging
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < DEVICE_BREAKPOINTS.mobile) return 'mobile';
  if (width < DEVICE_BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors related to scroll-config.ts

**Step 3: Commit**

```bash
git add src/lib/motion/scroll-config.ts
git commit -m "feat(motion): add device-normalized scroll configuration"
```

---

## Task 3: Create Scroll Velocity Lerp

**Files:**
- Create: `src/lib/motion/scroll-lerp.ts`
- Test: Manual verification in browser console

**Step 1: Create the scroll lerp file**

```typescript
// src/lib/motion/scroll-lerp.ts

/**
 * Scroll Velocity Lerp
 *
 * Smooths scroll velocity so animations don't jerk on start/stop.
 * Uses different lerp factors for acceleration vs deceleration
 * to create a natural feel.
 */

interface ScrollLerpState {
  currentVelocity: number;
  targetVelocity: number;
  smoothedProgress: number;
}

const LERP_FACTORS = {
  // How quickly velocity ramps up when scroll starts
  accelerate: 0.12,

  // How quickly velocity decays when scroll stops
  decelerate: 0.08,
} as const;

// Threshold below which we consider velocity "stopped"
const VELOCITY_THRESHOLD = 0.01;
const SETTLING_THRESHOLD = 0.001;

export interface ScrollLerpResult {
  progress: number;
  velocity: number;
  isSettling: boolean;
}

export interface ScrollLerp {
  update: (rawProgress: number, rawVelocity: number) => ScrollLerpResult;
  reset: () => void;
  getState: () => Readonly<ScrollLerpState>;
}

/**
 * Create a scroll lerp instance
 * Call update() on each scroll event with raw progress and velocity
 */
export function createScrollLerp(): ScrollLerp {
  let state: ScrollLerpState = {
    currentVelocity: 0,
    targetVelocity: 0,
    smoothedProgress: 0,
  };

  return {
    update(rawProgress: number, rawVelocity: number): ScrollLerpResult {
      state.targetVelocity = rawVelocity;

      // Lerp toward target velocity with different factors for accel/decel
      const lerpFactor = Math.abs(rawVelocity) > Math.abs(state.currentVelocity)
        ? LERP_FACTORS.accelerate
        : LERP_FACTORS.decelerate;

      state.currentVelocity += (state.targetVelocity - state.currentVelocity) * lerpFactor;

      // Apply smoothed velocity to progress
      state.smoothedProgress = rawProgress;

      // Check if we're settling (target stopped but current still moving)
      const isSettling =
        Math.abs(state.targetVelocity) < VELOCITY_THRESHOLD &&
        Math.abs(state.currentVelocity) > SETTLING_THRESHOLD;

      return {
        progress: state.smoothedProgress,
        velocity: state.currentVelocity,
        isSettling,
      };
    },

    reset() {
      state = {
        currentVelocity: 0,
        targetVelocity: 0,
        smoothedProgress: 0,
      };
    },

    getState() {
      return { ...state };
    },
  };
}
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors related to scroll-lerp.ts

**Step 3: Commit**

```bash
git add src/lib/motion/scroll-lerp.ts
git commit -m "feat(motion): add scroll velocity lerp for smooth start/stop"
```

---

## Task 4: Create Section Definitions

**Files:**
- Create: `src/lib/motion/section-definitions.ts`
- Test: Manual verification that derived regions sum to 1.0

**Step 1: Create the section definitions file**

```typescript
// src/lib/motion/section-definitions.ts

import { BRAND_DURATIONS, type BrandDuration, timeToScroll } from './timing';

/**
 * Section Definitions
 *
 * Maps Framework sections to time-based durations.
 * Scroll regions are DERIVED from content needs, not hardcoded.
 */

// ============== TYPES ==============
export interface BeatDefinition {
  id: string;
  viewingTime: number;        // ms - how long this beat is prominent
  hasPortalZoom?: boolean;    // adds cinematic duration
  holdAfter?: number;         // ms - breathing room before next beat
}

export interface SectionDefinition {
  id: string;
  name: string;
  transitionIn: BrandDuration;    // from previous section
  transitionOut: BrandDuration;   // to next section
  beats: BeatDefinition[];        // internal content beats
}

export interface SectionScrollRegion {
  start: number;  // 0-1
  end: number;    // 0-1
}

// ============== SECTION DEFINITIONS ==============
// NOTE: Logos section REMOVED - absorbed into Hero
// Social proof now appears immediately in Hero strip, morphs to metadata
export const SECTION_DEFINITIONS: SectionDefinition[] = [
  {
    id: 'hero',
    name: 'Hero',
    transitionIn: 'cinematic',     // page load entry
    transitionOut: 'cinematic',    // portal zoom to Film (via Netflix logo)
    beats: [
      // Metadata: "BERGHAUS • OSPREY • REDBULL TV • NETFLIX • BBC" (logos strip)
      { id: 'hero:intro', viewingTime: 1600, holdAfter: 400 },
      // Scan line wipe (550ms): logos → "ALT ▲ 8,000M • K2 / EVEREST • HIGH ALTITUDE DOP"
      { id: 'hero:logos-to-metadata', viewingTime: 550 },
      // Metadata visible: credentials idle state
      { id: 'hero:idle', viewingTime: 2000 },
      // Netflix logo portal zoom → Film section entry
      { id: 'hero:exit', viewingTime: 800, hasPortalZoom: true },
    ]
  },
  {
    id: 'bigFilm',
    name: 'Big Film (Netflix/K2)',
    transitionIn: 'cinematic',
    transitionOut: 'cinematic',
    // Shutter blink on entry, metadata: "FILM — HIGH ALTITUDE FEATURES"
    beats: [
      // Metadata: "14 PEAKS • NETFLIX • 2021"
      { id: 'film:14peaks', viewingTime: 2400, holdAfter: 300 },
      // Metadata crossfade: "K2 WINTER • DISCOVERY • 2020"
      { id: 'film:k2-winter', viewingTime: 2400, holdAfter: 300 },
      // Metadata crossfade: "K2 SUMMIT • BBC • 2019"
      { id: 'film:k2-summit', viewingTime: 2000 },
    ]
  },
  {
    id: 'filmStories',
    name: 'Film Stories',
    transitionIn: 'cinematic',
    transitionOut: 'cinematic',
    // Shutter blink on entry, metadata updates per story
    beats: [
      // Metadata: "SASHA / NO DAYS OFF • REDBULL TV"
      { id: 'stories:sasha', viewingTime: 2000, holdAfter: 200 },
      // Metadata crossfade: "GRACE / SPEED RECORD • REDBULL TV"
      { id: 'stories:grace', viewingTime: 2000, holdAfter: 200 },
      // Metadata crossfade: "AFGHANISTAN / FRONTIER • BBC"
      { id: 'stories:afghanistan', viewingTime: 2000 },
    ]
  },
  {
    id: 'photoStats',
    name: 'Photo + Climbing Cred',
    transitionIn: 'cinematic',
    transitionOut: 'standard',
    // Shutter blink on entry, metadata: "SUCCESSFUL CLIMBS: 12 • UNSUCCESSFUL: 4"
    beats: [
      // Metadata stays static during photo section
      { id: 'photo:successful', viewingTime: 1800 },
      { id: 'photo:unsuccessful', viewingTime: 1800 },
    ]
  },
  {
    id: 'about',
    name: 'About Me',
    transitionIn: 'cinematic',
    transitionOut: 'cinematic',
    // Shutter blink on entry, metadata: "FRONT-LINE PERSPECTIVE • 10+ YEARS"
    beats: [
      // Metadata stays static during about section
      { id: 'about:frontline', viewingTime: 2200, holdAfter: 200 },
      { id: 'about:origin', viewingTime: 2200, holdAfter: 200 },
      { id: 'about:values', viewingTime: 2000 },
    ]
  },
  {
    id: 'services',
    name: 'Services',
    transitionIn: 'cinematic',
    transitionOut: 'cinematic',
    // Shutter blink on entry, metadata: "MOUNTAIN DOP • AERIAL • STOCK"
    beats: [
      // Metadata stays static during services section
      { id: 'services:video', viewingTime: 1400 },
      { id: 'services:credits', viewingTime: 2400 },
      { id: 'services:cta', viewingTime: 800 },
    ]
  },
  {
    id: 'finalContact',
    name: 'Final Contact',
    transitionIn: 'cinematic',
    transitionOut: 'standard',
    // Shutter blink on entry, metadata: "+44 7880 352909 • GET IN TOUCH"
    beats: [
      // Metadata stays as CTA during contact section
      { id: 'contact:reveal', viewingTime: 1600 },
      { id: 'contact:hold', viewingTime: 2000 },
    ]
  },
];

// ============== DURATION CALCULATION ==============
function calculateBeatDuration(beat: BeatDefinition): number {
  let duration = beat.viewingTime;

  if (beat.hasPortalZoom) {
    duration += BRAND_DURATIONS.cinematic;
  }

  duration += beat.holdAfter ?? 0;

  return duration;
}

export function calculateSectionDuration(section: SectionDefinition): number {
  const transIn = BRAND_DURATIONS[section.transitionIn];
  const transOut = BRAND_DURATIONS[section.transitionOut];
  const beatsDuration = section.beats.reduce(
    (sum, beat) => sum + calculateBeatDuration(beat),
    0
  );

  return transIn + beatsDuration + transOut;
}

// ============== SCROLL REGION DERIVATION ==============
export function deriveSectionScrollRegions(): Record<string, SectionScrollRegion> {
  const durationsMs = SECTION_DEFINITIONS.map(calculateSectionDuration);
  const totalMs = durationsMs.reduce((a, b) => a + b, 0);

  const regions: Record<string, SectionScrollRegion> = {};
  let cursor = 0;

  SECTION_DEFINITIONS.forEach((section, i) => {
    const proportion = durationsMs[i] / totalMs;
    regions[section.id] = { start: cursor, end: cursor + proportion };
    cursor += proportion;
  });

  return regions;
}

// Derived scroll regions - replaces hardcoded SECTION_SEGMENTS
export const sectionScrollRegions = deriveSectionScrollRegions();

// ============== DEBUG HELPERS ==============
export function logSectionTimings(): void {
  console.group('[motion] Section Timings');

  let totalMs = 0;
  SECTION_DEFINITIONS.forEach((section) => {
    const durationMs = calculateSectionDuration(section);
    const region = sectionScrollRegions[section.id];
    totalMs += durationMs;

    console.log(
      `${section.id}: ${durationMs}ms (${((region.end - region.start) * 100).toFixed(1)}%)`,
      `scroll: ${region.start.toFixed(3)} - ${region.end.toFixed(3)}`
    );
  });

  console.log(`Total: ${totalMs}ms (${(totalMs / 1000).toFixed(1)}s)`);
  console.groupEnd();
}
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors related to section-definitions.ts

**Step 3: Commit**

```bash
git add src/lib/motion/section-definitions.ts
git commit -m "feat(motion): add section definitions with derived scroll regions"
```

---

## Task 5: Create Timeline Helpers

**Files:**
- Create: `src/lib/motion/timeline-helpers.ts`
- Test: Manual verification with a test timeline

**Step 1: Create the timeline helpers file**

```typescript
// src/lib/motion/timeline-helpers.ts

import { gsap } from './gsapRegistry';
import { BRAND_DURATIONS, BRAND_EASING, timeToScroll, type BrandDuration } from './timing';
import { sectionScrollRegions, type SectionScrollRegion } from './section-definitions';

/**
 * Timeline Helpers
 *
 * Convert time-based values to scroll positions within each section's timeline.
 * Provides standardized patterns for beat lifecycles.
 */

// ============== SECTION TIMING HELPERS ==============
export interface SectionTimingHelpers {
  /** Convert ms duration to section-relative scroll proportion */
  dur: (ms: number) => number;

  /** Position within section (0-1) from cumulative ms offset */
  pos: (cumulativeMs: number) => number;

  /** Section boundaries */
  region: SectionScrollRegion;

  /** Section scroll span (end - start) */
  sectionScrollSpan: number;
}

export function createSectionTimingHelpers(sectionId: string): SectionTimingHelpers {
  const region = sectionScrollRegions[sectionId];

  if (!region) {
    throw new Error(`[motion] Unknown section: ${sectionId}`);
  }

  const sectionScrollSpan = region.end - region.start;

  return {
    dur(ms: number): number {
      const globalProportion = timeToScroll(ms);
      return globalProportion / sectionScrollSpan;
    },

    pos(cumulativeMs: number): number {
      return timeToScroll(cumulativeMs) / sectionScrollSpan;
    },

    region,
    sectionScrollSpan,
  };
}

// ============== BEAT LIFECYCLE ==============
export interface BeatLifecycleOptions {
  /** Cumulative ms from section start */
  appearAtMs: number;

  /** Override appear duration (default: BRAND_DURATIONS.standard) */
  appearDurMs?: number;

  /** Time beat stays prominent */
  viewingDurMs: number;

  /** Override exit duration (default: BRAND_DURATIONS.micro) */
  exitDurMs?: number;

  /** Adds portal zoom animation */
  hasPortalZoom?: boolean;

  /** Skip exit animation (for beats that persist) */
  skipExit?: boolean;

  /** Initial scale (default: 0.96) */
  initialScale?: number;

  /** Portal zoom scale (default: 1.04) */
  zoomScale?: number;
}

/**
 * Add standard beat lifecycle to a timeline
 * Returns the end time in ms for sequencing the next beat
 */
export function addBeatLifecycle(
  tl: gsap.core.Timeline,
  target: Element | string,
  opts: BeatLifecycleOptions,
  helpers: SectionTimingHelpers
): number {
  const { dur, pos } = helpers;

  const appearDur = opts.appearDurMs ?? BRAND_DURATIONS.standard;
  const exitDur = opts.skipExit ? 0 : (opts.exitDurMs ?? BRAND_DURATIONS.micro);
  const zoomDur = opts.hasPortalZoom ? BRAND_DURATIONS.cinematic : 0;
  const initialScale = opts.initialScale ?? 0.96;
  const zoomScale = opts.zoomScale ?? 1.04;

  // Appear (lock-on)
  tl.fromTo(target,
    { opacity: 0, scale: initialScale },
    {
      opacity: 1,
      scale: 1,
      duration: dur(appearDur),
      ease: BRAND_EASING.lockOn,
    },
    pos(opts.appearAtMs)
  );

  // Portal zoom if applicable
  if (opts.hasPortalZoom) {
    tl.to(target, {
      scale: zoomScale,
      duration: dur(zoomDur),
      ease: BRAND_EASING.lockOn,
    }, pos(opts.appearAtMs + appearDur + opts.viewingDurMs));
  }

  // Exit (release)
  if (!opts.skipExit) {
    const exitStart = opts.appearAtMs + appearDur + opts.viewingDurMs + zoomDur;
    tl.to(target, {
      opacity: 0,
      duration: dur(exitDur),
      ease: BRAND_EASING.release,
    }, pos(exitStart));
  }

  return opts.appearAtMs + appearDur + opts.viewingDurMs + zoomDur + exitDur;
}

// ============== SIMPLE ANIMATIONS ==============
/**
 * Add a simple fade in animation
 */
export function addFadeIn(
  tl: gsap.core.Timeline,
  target: Element | string,
  atMs: number,
  helpers: SectionTimingHelpers,
  durationMs: number = BRAND_DURATIONS.standard
): void {
  const { dur, pos } = helpers;

  tl.fromTo(target,
    { opacity: 0 },
    {
      opacity: 1,
      duration: dur(durationMs),
      ease: BRAND_EASING.lockOn,
    },
    pos(atMs)
  );
}

/**
 * Add a simple fade out animation
 */
export function addFadeOut(
  tl: gsap.core.Timeline,
  target: Element | string,
  atMs: number,
  helpers: SectionTimingHelpers,
  durationMs: number = BRAND_DURATIONS.micro
): void {
  const { dur, pos } = helpers;

  tl.to(target, {
    opacity: 0,
    duration: dur(durationMs),
    ease: BRAND_EASING.release,
  }, pos(atMs));
}

/**
 * Add a zoom animation (push-in or pull-out)
 */
export function addZoom(
  tl: gsap.core.Timeline,
  target: Element | string,
  atMs: number,
  helpers: SectionTimingHelpers,
  fromScale: number,
  toScale: number,
  durationMs: number = BRAND_DURATIONS.cinematic
): void {
  const { dur, pos } = helpers;

  tl.fromTo(target,
    { scale: fromScale },
    {
      scale: toScale,
      duration: dur(durationMs),
      ease: BRAND_EASING.lockOn,
    },
    pos(atMs)
  );
}
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors related to timeline-helpers.ts

**Step 3: Commit**

```bash
git add src/lib/motion/timeline-helpers.ts
git commit -m "feat(motion): add timeline helpers for time-based animations"
```

---

## Task 6: Create Barrel Export

**Files:**
- Create: `src/lib/motion/index.ts`
- Test: Import verification

**Step 1: Create the barrel export file**

```typescript
// src/lib/motion/index.ts

/**
 * Motion System Barrel Export
 *
 * Central export for all motion-related utilities.
 */

// Core timing
export {
  PERFECT_DURATION_SECONDS,
  BRAND_DURATIONS,
  BRAND_EASING,
  calculateViewingTime,
  timeToScroll,
  scrollToTime,
  TARGET_SCROLL_DISTANCE,
  type BrandDuration,
  type BrandEasing,
  type ViewingComplexity,
} from './timing';

// Scroll configuration
export {
  getDeviceScrollMultiplier,
  getScrollHeight,
  getScrollHeightVh,
  getDeviceType,
} from './scroll-config';

// Scroll lerp
export {
  createScrollLerp,
  type ScrollLerp,
  type ScrollLerpResult,
} from './scroll-lerp';

// Section definitions
export {
  SECTION_DEFINITIONS,
  sectionScrollRegions,
  calculateSectionDuration,
  deriveSectionScrollRegions,
  logSectionTimings,
  type SectionDefinition,
  type BeatDefinition,
  type SectionScrollRegion,
} from './section-definitions';

// Timeline helpers
export {
  createSectionTimingHelpers,
  addBeatLifecycle,
  addFadeIn,
  addFadeOut,
  addZoom,
  type SectionTimingHelpers,
  type BeatLifecycleOptions,
} from './timeline-helpers';

// Existing exports (preserve backwards compatibility)
export * from './orchestrator';
export * from './gsapRegistry';
export * from './portalStore';
export * from './lensTimeline';
export * from './metadata';
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors related to index.ts

**Step 3: Commit**

```bash
git add src/lib/motion/index.ts
git commit -m "feat(motion): add barrel export for motion system"
```

---

## Task 7: Integrate Scroll Lerp into Orchestrator

**Files:**
- Modify: `src/lib/motion/orchestrator.ts`
- Test: Manual verification in browser

**Step 1: Add scroll lerp import and integration**

Add these imports at the top of `src/lib/motion/orchestrator.ts`:

```typescript
import { createScrollLerp, type ScrollLerp } from './scroll-lerp';
import { getScrollHeight } from './scroll-config';
```

**Step 2: Add scroll lerp state**

After the existing state variables (around line 26), add:

```typescript
let scrollLerpInstance: ScrollLerp | null = null;
```

**Step 3: Update initScrollShell to use scroll lerp**

In the `initScrollShell` function, after creating the ScrollSmoother instance (around line 235), add scroll lerp initialization:

```typescript
// Initialize scroll lerp for velocity smoothing
scrollLerpInstance = createScrollLerp();
```

**Step 4: Update cleanup to reset scroll lerp**

In `cleanupScrollShellResources` function, add:

```typescript
if (scrollLerpInstance) {
  scrollLerpInstance.reset();
  scrollLerpInstance = null;
}
```

**Step 5: Export scroll lerp accessor**

Add to the ScrollOrchestrator type and export:

```typescript
export type ScrollOrchestrator = {
  registerSectionTimeline: typeof registerSectionTimeline;
  getTimeline: typeof getTimeline;
  cleanupSectionTimeline: typeof cleanupSectionTimeline;
  getSmoother: () => ScrollSmoother | null;
  getScrollLerp: () => ScrollLerp | null;
};

export function getScrollLerp() {
  return scrollLerpInstance;
}

export const scrollOrchestrator: ScrollOrchestrator = {
  registerSectionTimeline,
  getTimeline,
  cleanupSectionTimeline,
  getSmoother,
  getScrollLerp,
};
```

**Step 6: Verify file compiles**

Run: `npm run check`
Expected: No errors

**Step 7: Commit**

```bash
git add src/lib/motion/orchestrator.ts
git commit -m "feat(motion): integrate scroll lerp into orchestrator"
```

---

## Task 8: Update sectionConfig to Use Derived Regions

**Files:**
- Modify: `src/lib/motion/sectionConfig.ts`
- Test: Verify existing functionality still works

**Step 1: Update sectionConfig.ts to bridge old and new systems**

Replace the contents of `src/lib/motion/sectionConfig.ts` with:

```typescript
/**
 * Section Configuration
 *
 * Bridge between old vh-based segments and new time-based system.
 * During migration, both systems coexist.
 */

import { sectionScrollRegions, SECTION_DEFINITIONS, calculateSectionDuration } from './section-definitions';
import { getScrollHeightVh } from './scroll-config';

// ============== LEGACY: VH-BASED SEGMENTS ==============
// Kept for backwards compatibility during migration
export const SECTION_SEGMENTS = {
  hero:         { start: 0,    duration: 240 },
  logos:        { start: 240,  duration: 200 },
  bigFilm:      { start: 440,  duration: 300 },
  filmStories:  { start: 740,  duration: 260 },
  photoStats:   { start: 1000, duration: 160 },
  about:        { start: 1160, duration: 300 },
  services:     { start: 1460, duration: 300 },
  finalContact: { start: 1760, duration: 200 }
} as const;

export type SectionName = keyof typeof SECTION_SEGMENTS;

// Total scroll distance in vh units (legacy)
export const TOTAL_SCROLL_VH = Object.values(SECTION_SEGMENTS).reduce(
  (sum, seg) => Math.max(sum, seg.start + seg.duration),
  0
);

// ============== NEW: TIME-BASED REGIONS ==============
// Re-export from section-definitions for easy access
export { sectionScrollRegions } from './section-definitions';

/**
 * Convert time-based region to vh-based segment
 * Used during migration to maintain compatibility
 */
export function regionToVhSegment(
  sectionId: string,
  totalVh: number = TOTAL_SCROLL_VH
): { start: number; duration: number } {
  const region = sectionScrollRegions[sectionId];
  if (!region) {
    throw new Error(`Unknown section: ${sectionId}`);
  }

  const start = region.start * totalVh;
  const duration = (region.end - region.start) * totalVh;

  return { start, duration };
}

/**
 * Get section duration in milliseconds
 */
export function getSectionDurationMs(sectionId: string): number {
  const section = SECTION_DEFINITIONS.find(s => s.id === sectionId);
  if (!section) {
    throw new Error(`Unknown section: ${sectionId}`);
  }
  return calculateSectionDuration(section);
}
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/motion/sectionConfig.ts
git commit -m "refactor(motion): bridge legacy vh-based and new time-based systems"
```

---

## Task 9: Add Debug Logging

**Files:**
- Modify: `src/lib/motion/orchestrator.ts`
- Test: Check browser console for timing logs

**Step 1: Add debug logging on shell init**

In `initScrollShell`, after the shell is created, add debug logging:

```typescript
// Log section timings in development
if (import.meta.env.DEV) {
  const { logSectionTimings } = await import('./section-definitions');
  logSectionTimings();

  console.debug('[motion] Scroll config:', {
    deviceType: (await import('./scroll-config')).getDeviceType(),
    scrollHeight: (await import('./scroll-config')).getScrollHeight(),
    multiplier: (await import('./scroll-config')).getDeviceScrollMultiplier(),
  });
}
```

**Step 2: Verify file compiles**

Run: `npm run check`
Expected: No errors

**Step 3: Test in browser**

Run: `npm run dev`
Open browser console, verify section timing logs appear

**Step 4: Commit**

```bash
git add src/lib/motion/orchestrator.ts
git commit -m "feat(motion): add debug logging for timing system"
```

---

## Task 10: Verify Full Build

**Files:**
- None (verification only)
- Test: Full type check and build

**Step 1: Run type check**

Run: `npm run check`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Test in dev mode**

Run: `npm run dev`
Expected:
- No console errors
- Section timing logs visible in console
- Existing animations still work

**Step 4: Final commit with all changes**

```bash
git add -A
git commit -m "feat(motion): complete time-based scroll timing foundation

- Add core timing constants (BRAND_DURATIONS, BRAND_EASING)
- Add device-normalized scroll configuration
- Add scroll velocity lerp for smooth start/stop
- Add section definitions with derived scroll regions
- Add timeline helpers for time-based animations
- Bridge legacy vh-based and new time-based systems
- Add debug logging for development

This establishes the foundation for migrating existing animations
to the time-based system while maintaining backwards compatibility."
```

---

## Summary

This plan creates the foundation for time-based scroll timing:

| File | Purpose |
|------|---------|
| `timing.ts` | Core constants, durations, easing, conversion |
| `scroll-config.ts` | Device multipliers, scroll height |
| `scroll-lerp.ts` | Velocity smoothing for start/stop |
| `section-definitions.ts` | Section and beat definitions |
| `timeline-helpers.ts` | Helper functions for timelines |
| `index.ts` | Barrel export |
| `sectionConfig.ts` | Bridge between old and new systems |
| `orchestrator.ts` | Integration with scroll lerp |

**Next steps after this plan:**
1. Migrate individual sections to use new timing helpers
2. Update scroll container sizing to use derived values
3. Remove legacy vh-based segments once migration complete
4. Tune viewing times based on real usage

---

Plan complete and saved to `docs/plans/2025-12-23-time-based-scroll-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
