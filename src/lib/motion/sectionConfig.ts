/**
 * Section Configuration
 * Shared constants for scroll segments - extracted to avoid circular imports
 */

// Section segment configuration (vh units)
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

// Total scroll distance in vh units
export const TOTAL_SCROLL_VH = Object.values(SECTION_SEGMENTS).reduce(
  (sum, seg) => Math.max(sum, seg.start + seg.duration),
  0
);
