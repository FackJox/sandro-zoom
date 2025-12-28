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
