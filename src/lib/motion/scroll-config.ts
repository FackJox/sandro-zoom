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
