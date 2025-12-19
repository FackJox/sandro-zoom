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
export function applyMaskImage(element: HTMLElement, mask: string): void {
  element.style.maskImage = mask;
  element.style.webkitMaskImage = mask;
}

/**
 * Calculate the current mask values for a zoom-out transition
 * based on scroll progress within the transition zone.
 *
 * @param progress - 0-1 progress through the transition zone
 * @returns { inner, outer } radius values for torus mask
 */
export function calculateZoomOutMask(progress: number): { inner: number; outer: number } {
  // Clamp progress to 0-1
  const p = Math.max(0, Math.min(1, progress));

  // DESIGN SPEC: Inner shrinks faster than outer → ring thickens
  // Use custom easing to make inner shrink faster (steeper curve)
  const innerProgress = gsap.utils.clamp(0, 1, p * 1.2); // Inner reaches 0 faster
  const outerProgress = p;

  // Interpolate from start to end
  const inner = TORUS_START.inner - (TORUS_START.inner - TORUS_END.inner) * innerProgress;
  const outer = TORUS_START.outer - (TORUS_START.outer - TORUS_REMNANT.outer) * outerProgress;

  return { inner: Math.max(0, inner), outer: Math.max(0, outer) };
}

/**
 * Apply zoom-out mask for a section based on transition progress.
 * Call this from the scroll update loop for smooth animation.
 *
 * @param element - Section element to mask
 * @param progress - 0-1 progress through the transition zone
 * @param role - 'exiting' | 'remnant' | 'full'
 */
export function applyZoomOutProgress(
  element: HTMLElement,
  progress: number,
  role: 'exiting' | 'remnant' | 'full'
): void {
  if (role === 'full') {
    // Full visibility
    applyMaskImage(element, getTorusMask(0, 150));
  } else if (role === 'remnant') {
    // Remnant shrinking (first 40% of next transition)
    // Progress 0 = full remnant (12%), progress 1 = gone (0%)
    const remnantProgress = Math.max(0, Math.min(1, progress));
    const outer = TORUS_REMNANT.outer - (TORUS_REMNANT.outer - TORUS_GONE.outer) * remnantProgress;
    applyMaskImage(element, getTorusMask(0, Math.max(0, outer)));
  } else {
    // Exiting - main zoom-out contraction
    const { inner, outer } = calculateZoomOutMask(progress);
    applyMaskImage(element, getTorusMask(inner, outer));
  }
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
 *
 * DESIGN SPEC (docs/plans/2025-12-07-zoom-out-reveal-design.md):
 * - Uses mask-image with torus (donut) radial-gradient pattern
 * - Inner radius shrinks FASTER than outer → ring thickens as it contracts
 * - Creates "camera pulling back" depth effect
 *
 * Exiting section contracts via torus mask while incoming section parallaxes in.
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
  // Animate torus mask from small circle to fully transparent
  if (remnantSection?.root) {
    // Create proxy object for GSAP to animate
    const remnantMaskState = { inner: TORUS_REMNANT.inner, outer: TORUS_REMNANT.outer };
    const remnantElement = remnantSection.root;

    // Initialize mask-image
    applyMaskImage(remnantElement, getTorusMask(remnantMaskState.inner, remnantMaskState.outer));

    tl.to(
      remnantMaskState,
      {
        inner: TORUS_GONE.inner,
        outer: TORUS_GONE.outer,
        duration: duration * 0.4,
        ease: 'power2.in',
        onUpdate: () => {
          applyMaskImage(remnantElement, getTorusMask(remnantMaskState.inner, remnantMaskState.outer));
        },
        onComplete: () => {
          // Ensure final state is applied
          applyMaskImage(remnantElement, getTorusMask(TORUS_GONE.inner, TORUS_GONE.outer));
        }
      },
      0
    );
  }

  // 2. Current section: contract from full to remnant using torus mask
  // DESIGN SPEC: Inner radius shrinks FASTER than outer → ring thickens
  // This creates the "camera pulling back" depth effect
  //
  // Animation path:
  // - Start: inner=140%, outer=150% (thin ring at edge, content visible)
  // - Mid:   inner=40%,  outer=80%  (thick ring, content shrinking)
  // - End:   inner=0%,   outer=12%  (small filled circle remnant)
  const exitingMaskState = { inner: TORUS_START.inner, outer: TORUS_START.outer };
  const exitingElement = exitingSection.root;

  // Initialize with full visibility (torus at edge)
  applyMaskImage(exitingElement, getTorusMask(exitingMaskState.inner, exitingMaskState.outer));

  // Animate inner radius with steeper curve (shrinks faster)
  // This creates the ring thickening effect
  tl.to(
    exitingMaskState,
    {
      // Inner shrinks faster (steeper curve) → ring thickens
      inner: TORUS_END.inner,
      // Outer shrinks slower → visible area reduces gradually
      outer: TORUS_REMNANT.outer,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        applyMaskImage(exitingElement, getTorusMask(exitingMaskState.inner, exitingMaskState.outer));
      },
      onComplete: () => {
        // Ensure final remnant state
        applyMaskImage(exitingElement, getTorusMask(TORUS_END.inner, TORUS_REMNANT.outer));
      }
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
 * Sets initial mask-image (torus pattern) and visibility
 *
 * DESIGN SPEC: Uses mask-image with radial-gradient for torus effect
 */
export function initSectionForZoomOut(
  section: HTMLElement,
  isInitiallyVisible: boolean
): void {
  // Use full torus mask (content visible through center)
  // Start with inner=0 (filled circle) at full size
  applyMaskImage(section, getTorusMask(0, 150));

  gsap.set(section, {
    autoAlpha: isInitiallyVisible ? 1 : 0
  });
}

/**
 * Reset section mask to full visibility
 * Call this when section becomes the current/active section
 */
export function resetSectionMask(section: HTMLElement): void {
  applyMaskImage(section, getTorusMask(0, 150));
}

/**
 * Set section to remnant state (small circle in center)
 */
export function setSectionToRemnant(section: HTMLElement): void {
  applyMaskImage(section, getTorusMask(TORUS_END.inner, TORUS_REMNANT.outer));
}

/**
 * Hide section completely via mask
 */
export function hideSectionMask(section: HTMLElement): void {
  applyMaskImage(section, getTorusMask(TORUS_GONE.inner, TORUS_GONE.outer));
}

/**
 * Check if a section participates in zoom-out transitions
 */
export function isZoomOutSection(name: SectionName): boolean {
  return ZOOM_OUT_TRANSITIONS.some(t => t.from === name || t.to === name);
}
