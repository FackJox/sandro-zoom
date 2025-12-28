/**
 * Section Configuration
 *
 * Bridge between old vh-based segments and new time-based system.
 * During migration, both systems coexist.
 */

import { sectionScrollRegions, SECTION_DEFINITIONS, calculateSectionDuration } from './section-definitions';

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
