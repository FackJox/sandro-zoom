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
