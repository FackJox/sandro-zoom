import { gsap } from '$lib/motion';
import { brandEase } from '$lib/motion';
import { SECTION_SEGMENTS, type SectionName } from './sectionConfig';
import { Z_INDEX_LAYERS } from './visibilityConfig';

/**
 * Zoom-Out Reveal Transition System
 *
 * Creates depth by having sections appear layered behind the current view,
 * revealed as the camera pulls back (zoom out).
 *
 * Applies to:
 * - BigFilm → FilmStories
 * - FilmStories → PhotoStats
 * - PhotoStats → About
 */

// Transition zone is last 15% of section duration
const TRANSITION_ZONE_PERCENT = 0.15;

// Torus mask settings
// Start: thin ring at edge (inner 140%, outer 150%)
// End: center closed (inner 0%, outer 100%)
const TORUS_START = { inner: 140, outer: 150 };
const TORUS_END = { inner: 0, outer: 100 };
const TORUS_REMNANT = { inner: 0, outer: 12 }; // Small visible circle
const TORUS_GONE = { inner: 0, outer: 0 }; // Completely hidden

// Legacy clipPath values (for non-torus sections)
const CLIP_FULL = 'circle(150% at 50% 50%)';
const CLIP_REMNANT = 'circle(12% at 50% 50%)';
const CLIP_GONE = 'circle(0% at 50% 50%)';

// Parallax settings
const PARALLAX_START_SCALE = 1.2;
const PARALLAX_START_Y = -40;
// Parallax rate multiplier: elements lag behind mask contraction
// Duration is divided by this (not multiplied) so parallax takes longer = lags behind
const PARALLAX_RATE = 0.85;

/**
 * Generate a torus (donut) mask using radial-gradient
 * Content visible in the ring between innerRadius and outerRadius
 */
export function getTorusMask(innerRadius: number, outerRadius: number): string {
  // When both are 0, fully transparent (hidden)
  if (outerRadius <= 0) {
    return 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)';
  }
  // When inner is 0, it's a filled circle (no hole)
  if (innerRadius <= 0) {
    return `radial-gradient(circle at 50% 50%, black 0%, black ${outerRadius}%, transparent ${outerRadius}%)`;
  }
  // Torus: transparent center, visible ring, transparent outside
  return `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${innerRadius}%, black ${innerRadius}%, black ${outerRadius}%, transparent ${outerRadius}%)`;
}

/**
 * Apply mask-image with webkit prefix for cross-browser support
 */
function applyMaskImage(element: HTMLElement, mask: string): void {
  element.style.maskImage = mask;
  element.style.webkitMaskImage = mask;
}

export interface ZoomOutSectionRefs {
  root: HTMLElement;
  parallaxTargets: HTMLElement[];
}

export interface ZoomOutTransitionConfig {
  from: SectionName;
  to: SectionName;
  exitingSection: ZoomOutSectionRefs;
  incomingSection: ZoomOutSectionRefs;
  remnantSection?: ZoomOutSectionRefs | null;
  lensBug?: HTMLElement | null;
}

export type SectionRole = 'remnant' | 'current' | 'incoming' | 'inactive';

/**
 * Zoom-out transition boundaries
 */
export const ZOOM_OUT_TRANSITIONS: Array<{
  from: SectionName;
  to: SectionName;
  scrollVH: number;
}> = [
  { from: 'bigFilm', to: 'filmStories', scrollVH: SECTION_SEGMENTS.bigFilm.start + SECTION_SEGMENTS.bigFilm.duration },
  { from: 'filmStories', to: 'photoStats', scrollVH: SECTION_SEGMENTS.filmStories.start + SECTION_SEGMENTS.filmStories.duration },
  { from: 'photoStats', to: 'about', scrollVH: SECTION_SEGMENTS.photoStats.start + SECTION_SEGMENTS.photoStats.duration }
];

/**
 * Calculate transition zone start (when contraction begins)
 */
function getTransitionZoneStart(sectionName: SectionName): number {
  const segment = SECTION_SEGMENTS[sectionName];
  return segment.start + segment.duration * (1 - TRANSITION_ZONE_PERCENT);
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Build a single zoom-out transition timeline segment
 * Uses clipPath circle for consistency with section visibility.
 * Exiting section contracts to a small remnant circle while incoming section parallaxes in.
 * Respects prefers-reduced-motion by skipping parallax animations.
 */
export function buildZoomOutSegment(
  config: ZoomOutTransitionConfig,
  progress: { start: number; end: number }
): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: brandEase } });
  const duration = progress.end - progress.start;
  const reducedMotion = prefersReducedMotion();

  const { exitingSection, incomingSection, remnantSection, lensBug } = config;

  if (reducedMotion) {
    console.debug('[zoom-out] reduced motion detected, using simplified transitions');
  }

  // 1. Remnant from previous transition shrinks to nothing
  // Uses clipPath for consistency with section visibility
  if (remnantSection?.root) {
    tl.to(
      remnantSection.root,
      {
        clipPath: CLIP_GONE,
        duration: duration * 0.4,
        ease: 'power2.in'
      },
      0
    );
  }

  // 2. Current section: contract from full to remnant circle
  // clipPath provides smoother, more consistent transitions than mask-image
  tl.to(
    exitingSection.root,
    {
      clipPath: CLIP_REMNANT,
      duration: duration,
      ease: 'power2.inOut'
    },
    0
  );

  // 3. Incoming section parallax elements shrink into position
  // They start oversized (behind camera) and settle to normal
  // Skip parallax if reduced motion is preferred (accessibility)
  if (incomingSection.parallaxTargets.length > 0 && !reducedMotion) {
    // Set initial state
    tl.set(
      incomingSection.parallaxTargets,
      {
        scale: PARALLAX_START_SCALE,
        y: PARALLAX_START_Y,
        opacity: 0.7
      },
      0
    );

    // Animate to final position (slightly slower than mask = depth)
    // Divide by PARALLAX_RATE to make duration longer (lags behind mask)
    tl.to(
      incomingSection.parallaxTargets,
      {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: duration / PARALLAX_RATE,
        stagger: 0.06,
        ease: brandEase
      },
      duration * 0.1 // Start slightly after mask begins
    );
  } else if (incomingSection.parallaxTargets.length > 0) {
    // Reduced motion: just fade in without scale/translate
    tl.fromTo(
      incomingSection.parallaxTargets,
      { opacity: 0 },
      { opacity: 1, duration: duration * 0.5 },
      0
    );
  }

  // 4. Lens bug blip (acknowledge the cut)
  // Skip in reduced motion mode (decorative animation)
  if (lensBug && !reducedMotion) {
    tl.to(
      lensBug,
      {
        rotation: 8,
        scale: 1.04,
        duration: 0.15,
        ease: brandEase
      },
      duration * 0.3
    ).to(
      lensBug,
      {
        rotation: 0,
        scale: 1,
        duration: 0.2,
        ease: brandEase
      },
      duration * 0.45
    );
  }

  return tl;
}

/**
 * Determine section roles based on current scroll position
 */
export function getSectionRoles(scrollVH: number): Map<SectionName, SectionRole> {
  const roles = new Map<SectionName, SectionRole>();

  // Default all to inactive
  const allSections: SectionName[] = [
    'hero', 'logos', 'bigFilm', 'filmStories', 'photoStats', 'about', 'services', 'finalContact'
  ];
  allSections.forEach(s => roles.set(s, 'inactive'));

  // Find which transition we're in or near
  let currentSection: SectionName | null = null;
  let incomingSection: SectionName | null = null;
  let remnantSection: SectionName | null = null;

  // Determine current section based on scroll
  for (const [name, segment] of Object.entries(SECTION_SEGMENTS)) {
    const start = segment.start;
    const end = segment.start + segment.duration;
    if (scrollVH >= start && scrollVH < end) {
      currentSection = name as SectionName;
      break;
    }
  }

  if (!currentSection) {
    currentSection = scrollVH >= SECTION_SEGMENTS.finalContact.start ? 'finalContact' : 'hero';
  }

  // Find if we're in a zoom-out transition zone
  const activeTransition = ZOOM_OUT_TRANSITIONS.find(t => {
    const zoneStart = getTransitionZoneStart(t.from);
    return scrollVH >= zoneStart && scrollVH < t.scrollVH;
  });

  if (activeTransition) {
    // We're in a transition
    roles.set(activeTransition.from, 'current');
    roles.set(activeTransition.to, 'incoming');

    // Find remnant (the section before the exiting one in the chain)
    const exitingIndex = ZOOM_OUT_TRANSITIONS.findIndex(t => t.from === activeTransition.from);
    if (exitingIndex > 0) {
      const prevTransition = ZOOM_OUT_TRANSITIONS[exitingIndex - 1];
      roles.set(prevTransition.from, 'remnant');
    }
  } else {
    // Not in transition, just mark current
    roles.set(currentSection, 'current');

    // Check if previous section should be remnant
    const lastCompletedTransition = ZOOM_OUT_TRANSITIONS.filter(t => scrollVH >= t.scrollVH).pop();
    if (lastCompletedTransition) {
      // The 'from' section of last completed transition is now remnant (small circle)
      // unless we've moved past another transition
      const transitionIndex = ZOOM_OUT_TRANSITIONS.indexOf(lastCompletedTransition);
      if (transitionIndex >= 0 && transitionIndex < ZOOM_OUT_TRANSITIONS.length - 1) {
        const nextTransition = ZOOM_OUT_TRANSITIONS[transitionIndex + 1];
        const nextZoneStart = getTransitionZoneStart(nextTransition.from);
        if (scrollVH < nextZoneStart) {
          roles.set(lastCompletedTransition.from, 'remnant');
        }
      } else if (transitionIndex === ZOOM_OUT_TRANSITIONS.length - 1) {
        // Last transition - remnant persists until... well, it stays as remnant
        roles.set(lastCompletedTransition.from, 'remnant');
      }
    }
  }

  return roles;
}

/**
 * Apply z-index based on section roles
 */
export function applySectionZIndex(
  sections: Map<SectionName, HTMLElement>,
  roles: Map<SectionName, SectionRole>
): void {
  for (const [name, element] of sections) {
    const role = roles.get(name) || 'inactive';
    element.style.zIndex = String(Z_INDEX_LAYERS[role]);
  }
}

/**
 * Initialize section for zoom-out system
 * Sets initial clipPath and visibility
 */
export function initSectionForZoomOut(
  section: HTMLElement,
  isInitiallyVisible: boolean
): void {
  // Use full clipPath circle for initial visibility
  gsap.set(section, {
    clipPath: CLIP_FULL,
    autoAlpha: isInitiallyVisible ? 1 : 0
  });
}

/**
 * Check if a section participates in zoom-out transitions
 */
export function isZoomOutSection(name: SectionName): boolean {
  return ZOOM_OUT_TRANSITIONS.some(t => t.from === name || t.to === name);
}
