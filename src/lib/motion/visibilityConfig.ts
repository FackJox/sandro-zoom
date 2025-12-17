/**
 * Visibility Configuration
 *
 * SINGLE SOURCE OF TRUTH: Scroll position determines visibility.
 * This replaces the mixed role-based and position-based logic that caused
 * race conditions and premature section reveals.
 *
 * Each section has explicit start/end visibility ranges in vh units.
 * Transition buffers are calculated from the 85% progress point of the
 * preceding section (when zoom-out/portal transitions begin).
 */

import type { SectionName } from './sectionConfig';

export interface VisibilityRange {
  /** Scroll position (vh) when section becomes visible */
  start: number;
  /** Scroll position (vh) when section becomes invisible */
  end: number;
  /** Whether section is visible on initial page load */
  initialVisible: boolean;
}

/**
 * Explicit visibility ranges for each section.
 *
 * Calculation notes:
 * - Transition start = section.start + section.duration * 0.85 (last 15%)
 * - End buffer = section.end + 15vh (smooth transition clearance)
 *
 * Section ranges from sectionConfig.ts:
 * - hero:         0-240vh
 * - logos:        240-440vh
 * - bigFilm:      440-740vh
 * - filmStories:  740-1000vh
 * - photoStats:   1000-1160vh
 * - about:        1160-1460vh
 * - services:     1460-1760vh
 * - finalContact: 1760-1960vh
 */
export const SECTION_VISIBILITY: Record<SectionName, VisibilityRange> = {
  hero: {
    start: 0,
    end: 440,  // Visible through entire Logos section (contracts during exit)
    initialVisible: true
  },
  logos: {
    start: 180,  // Hero at 75% (240 * 0.75) - metadata detach point
    end: 450,    // 10vh buffer after logos ends (440 + 10)
    initialVisible: false
  },
  bigFilm: {
    start: 410,  // Logos at 85% (240 + 200*0.85 = 410) - portal starts
    end: 755,    // 15vh buffer after bigFilm ends (740 + 15)
    initialVisible: false
  },
  filmStories: {
    start: 695,  // BigFilm at 85% (440 + 300*0.85 = 695)
    end: 1015,   // 15vh buffer (1000 + 15)
    initialVisible: false
  },
  photoStats: {
    start: 961,  // FilmStories at 85% (740 + 260*0.85 = 961)
    end: 1175,   // 15vh buffer (1160 + 15)
    initialVisible: false
  },
  about: {
    start: 1136, // PhotoStats at 85% (1000 + 160*0.85 = 1136)
    end: 1475,   // 15vh buffer (1460 + 15)
    initialVisible: false
  },
  services: {
    start: 1460, // Match About section end exactly - no premature visibility
    end: 1775,   // 15vh buffer (1760 + 15)
    initialVisible: false
  },
  finalContact: {
    start: 1715, // Services at 85% (1460 + 300*0.85 = 1715)
    end: 2100,   // Beyond total scroll (always visible once reached)
    initialVisible: false
  }
} as const;

/**
 * Z-index layering constants.
 * Higher values = on top.
 *
 * Used for:
 * - Initial state when sections register
 * - Stacking order during zoom-out transitions
 * - Lens badge persistent layer
 */
export const Z_INDEX_LAYERS = {
  lens: 10,        // Lens badge (always on top of everything)
  hero: 5,         // Hero during intro sequence
  logos: 4,        // Logos above BigFilm during portal transition
  remnant: 3,      // Previous section's shrinking circle (zoom-out)
  current: 2,      // Active/current section
  incoming: 1,     // Next section parallaxing in (zoom-out)
  inactive: 0      // Hidden/inactive sections
} as const;

export type ZIndexLayer = keyof typeof Z_INDEX_LAYERS;
