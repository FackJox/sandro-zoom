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
