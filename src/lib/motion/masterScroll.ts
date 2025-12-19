import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { gsap, ScrollTrigger, brandEase } from '$lib/motion';
import {
  getSectionRoles,
  applySectionZIndex,
  ZOOM_OUT_TRANSITIONS,
  isZoomOutSection,
  buildZoomOutSegment,
  initSectionForZoomOut,
  resetSectionMask,
  setSectionToRemnant,
  hideSectionMask,
  getTorusMask,
  applyZoomOutProgress,
  type SectionRole,
  type ZoomOutSectionRefs
} from './zoomOutTransition';
import { SECTION_SEGMENTS, TOTAL_SCROLL_VH, type SectionName } from './sectionConfig';
import { SECTION_VISIBILITY, Z_INDEX_LAYERS } from './visibilityConfig';

// Re-export from sectionConfig for backwards compatibility
export { SECTION_SEGMENTS, TOTAL_SCROLL_VH, type SectionName } from './sectionConfig';

/**
 * Master Scroll Controller
 *
 * Manages a single pinned container where all sections are stacked (position: absolute)
 * and controlled by segment-based progress mapping. No individual section pinning.
 *
 * Scroll distance is consumed by the master pin, creating the illusion of
 * lens-zoom transitions between sections without visible scrollbar movement.
 *
 * Integrates with zoomOutTransition.ts for contracting circle reveals between:
 * - BigFilm → FilmStories
 * - FilmStories → PhotoStats
 * - PhotoStats → About
 */

export interface SectionSegment {
  name: SectionName;
  start: number;
  duration: number;
  element: HTMLElement | null;
  timeline: gsap.core.Timeline | null;
}

export interface MasterScrollState {
  progress: number;           // 0-1 global progress
  currentSection: SectionName | null;
  sectionProgress: number;    // 0-1 within current section
  scrollY: number;            // Actual scroll position
}

type SectionProgressCallback = (progress: number, isActive: boolean) => void;

interface MasterScrollController {
  // State stores
  state: Writable<MasterScrollState>;
  currentSection: Readable<SectionName | null>;
  globalProgress: Readable<number>;

  // Registration
  registerSection: (name: SectionName, element: HTMLElement, timeline?: gsap.core.Timeline) => () => void;
  registerParallaxTargets: (name: SectionName, targets: HTMLElement[]) => () => void;
  registerLensBug: (element: HTMLElement) => () => void;
  onSectionProgress: (name: SectionName, callback: SectionProgressCallback) => () => void;

  // Control
  buildMasterTimeline: (container: HTMLElement, spacer: HTMLElement) => () => void;
  buildZoomOutTransitions: () => () => void;

  // Utilities
  getSectionProgress: (name: SectionName) => number;
  getSectionByProgress: (progress: number) => SectionName | null;
  shouldSectionBeVisible: (name: SectionName) => boolean;

  // Lens bug control (Framework 3 §3.5 - subtle blip on story transitions)
  triggerLensBlip: () => void;
}

const sections = new Map<SectionName, SectionSegment>();
const progressCallbacks = new Map<SectionName, Set<SectionProgressCallback>>();
let masterTrigger: ScrollTrigger | null = null;

// Create reactive stores
const stateStore = writable<MasterScrollState>({
  progress: 0,
  currentSection: null,
  sectionProgress: 0,
  scrollY: 0
});

const currentSectionStore = derived(stateStore, $s => $s.currentSection);
const globalProgressStore = derived(stateStore, $s => $s.progress);

// Section roles store for zoom-out transition system
const sectionRolesStore = writable<Map<SectionName, SectionRole>>(new Map());

// Section element registry for z-index management
const sectionElements = new Map<SectionName, HTMLElement>();

// Parallax targets registry for zoom-out transitions
const parallaxTargets = new Map<SectionName, HTMLElement[]>();

// Lens bug reference for zoom-out blip animation
let lensBugElement: HTMLElement | null = null;

// Zoom-out transition timelines
let zoomOutTimelines: Map<string, gsap.core.Timeline> = new Map();

/**
 * Get section name for a given global progress value
 */
function getSectionByProgress(progress: number): SectionName | null {
  const scrollVH = progress * TOTAL_SCROLL_VH;

  for (const [name, config] of Object.entries(SECTION_SEGMENTS)) {
    const end = config.start + config.duration;
    if (scrollVH >= config.start && scrollVH < end) {
      return name as SectionName;
    }
  }

  // At the very end, return finalContact
  if (progress >= 0.99) {
    return 'finalContact';
  }

  return null;
}

/**
 * Calculate local progress (0-1) within a section
 */
function getSectionProgress(name: SectionName): number {
  const state = getState();
  const config = SECTION_SEGMENTS[name];
  const scrollVH = state.progress * TOTAL_SCROLL_VH;

  if (scrollVH < config.start) return 0;
  if (scrollVH >= config.start + config.duration) return 1;

  return (scrollVH - config.start) / config.duration;
}

/**
 * Check if a section should be visible based on current scroll position.
 * Uses actual scrollY to determine if we've scrolled to or past the section's start.
 * This prevents sections from revealing on page load when scroll is at 0.
 */
function shouldSectionBeVisible(name: SectionName): boolean {
  const config = SECTION_SEGMENTS[name];
  const scrollVH = window.scrollY / (window.innerHeight / 100);
  // Allow a small buffer (5vh) before the section starts to account for portal transitions
  return scrollVH >= config.start - 5;
}

function getState(): MasterScrollState {
  let current: MasterScrollState = {
    progress: 0,
    currentSection: null,
    sectionProgress: 0,
    scrollY: 0
  };
  stateStore.subscribe(s => { current = s; })();
  return current;
}

/**
 * Register a section element and optional timeline
 */
function registerSection(
  name: SectionName,
  element: HTMLElement,
  timeline?: gsap.core.Timeline
): () => void {
  const existing = sections.get(name);

  const segment: SectionSegment = {
    name,
    start: SECTION_SEGMENTS[name].start,
    duration: SECTION_SEGMENTS[name].duration,
    element,
    timeline: timeline ?? existing?.timeline ?? null
  };

  sections.set(name, segment);

  // Register ALL sections for visibility control (not just zoom-out)
  sectionElements.set(name, element);

  // Set initial visibility state based on config
  // This prevents "flash of all content" on page load
  const visConfig = SECTION_VISIBILITY[name];
  gsap.set(element, {
    autoAlpha: visConfig.initialVisible ? 1 : 0,
    zIndex: visConfig.initialVisible ? Z_INDEX_LAYERS.current : Z_INDEX_LAYERS.inactive
  });

  console.debug('[master-scroll] registerSection', name, {
    start: segment.start,
    duration: segment.duration,
    hasTimeline: Boolean(segment.timeline),
    isZoomOut: isZoomOutSection(name),
    initialVisible: visConfig.initialVisible
  });

  return () => {
    sections.delete(name);
    sectionElements.delete(name);
  };
}

/**
 * Register parallax targets for a section (zoom-out transitions)
 */
function registerParallaxTargets(name: SectionName, targets: HTMLElement[]): () => void {
  parallaxTargets.set(name, targets);
  console.debug('[master-scroll] registerParallaxTargets', name, targets.length);

  return () => {
    parallaxTargets.delete(name);
  };
}

/**
 * Register the lens bug element for transition blips
 */
function registerLensBug(element: HTMLElement): () => void {
  lensBugElement = element;
  console.debug('[master-scroll] registerLensBug');

  return () => {
    lensBugElement = null;
  };
}

/**
 * Trigger a subtle lens blip animation
 * Framework 3 §3.5: Lens bug does subtle 5–10° rotation or 1–2% scale blip
 * when crossing story boundaries within a section
 */
function triggerLensBlip(): void {
  if (!lensBugElement) {
    console.debug('[master-scroll] triggerLensBlip: no lens bug registered');
    return;
  }

  // Check for reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  console.debug('[master-scroll] triggerLensBlip');

  // Subtle blip: 7° rotation + 1.02 scale, then back
  gsap.timeline()
    .to(lensBugElement, {
      rotation: 7,
      scale: 1.02,
      duration: 0.12,
      ease: brandEase
    })
    .to(lensBugElement, {
      rotation: 0,
      scale: 1,
      duration: 0.18,
      ease: brandEase
    });
}

/**
 * Build zoom-out transition timelines.
 * Called after sections are registered with their parallax targets.
 */
function buildZoomOutTransitions(): () => void {
  // Kill existing timelines
  for (const tl of zoomOutTimelines.values()) {
    tl.kill();
  }
  zoomOutTimelines.clear();

  for (const transition of ZOOM_OUT_TRANSITIONS) {
    const fromElement = sectionElements.get(transition.from);
    const toElement = sectionElements.get(transition.to);

    if (!fromElement || !toElement) {
      console.debug('[master-scroll] skipping zoom-out transition', transition.from, '→', transition.to, 'missing elements');
      continue;
    }

    // Calculate transition zone (last 15% of from section)
    const fromConfig = SECTION_SEGMENTS[transition.from];
    const transitionStart = fromConfig.start + fromConfig.duration * 0.85;
    const transitionEnd = fromConfig.start + fromConfig.duration;

    const config = {
      from: transition.from,
      to: transition.to,
      exitingSection: {
        root: fromElement,
        parallaxTargets: parallaxTargets.get(transition.from) ?? []
      },
      incomingSection: {
        root: toElement,
        parallaxTargets: parallaxTargets.get(transition.to) ?? []
      },
      remnantSection: null as ZoomOutSectionRefs | null,
      lensBug: lensBugElement
    };

    // Find remnant section (the one before 'from' in the chain)
    const fromIndex = ZOOM_OUT_TRANSITIONS.findIndex(t => t.from === transition.from);
    if (fromIndex > 0) {
      const prevTransition = ZOOM_OUT_TRANSITIONS[fromIndex - 1];
      const remnantElement = sectionElements.get(prevTransition.from);
      if (remnantElement) {
        config.remnantSection = {
          root: remnantElement,
          parallaxTargets: []
        };
      }
    }

    const tl = buildZoomOutSegment(config, {
      start: transitionStart,
      end: transitionEnd
    });

    // Add timeline labels for debugging (Framework 2 spec)
    tl.addLabel(`${transition.from}-exit`, 0);
    tl.addLabel(`${transition.to}-parallax`, 0.1);
    if (fromIndex > 0) {
      tl.addLabel(`${ZOOM_OUT_TRANSITIONS[fromIndex - 1].from}-remnant-gone`, 0.4);
    }

    // Create ScrollTrigger for this transition
    const transitionKey = `${transition.from}->${transition.to}`;
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: () => `${transitionStart}vh top`,
      end: () => `${transitionEnd}vh top`,
      scrub: true,
      animation: tl,
      onEnter: () => console.debug('[zoom-out] enter', transitionKey),
      onLeave: () => console.debug('[zoom-out] leave', transitionKey)
    });

    zoomOutTimelines.set(transitionKey, tl);
    console.debug('[master-scroll] built zoom-out transition', transitionKey, {
      start: transitionStart,
      end: transitionEnd
    });
  }

  return () => {
    for (const tl of zoomOutTimelines.values()) {
      tl.kill();
    }
    zoomOutTimelines.clear();
  };
}

/**
 * Subscribe to section progress updates
 */
function onSectionProgress(
  name: SectionName,
  callback: SectionProgressCallback
): () => void {
  if (!progressCallbacks.has(name)) {
    progressCallbacks.set(name, new Set());
  }

  progressCallbacks.get(name)!.add(callback);

  return () => {
    progressCallbacks.get(name)?.delete(callback);
  };
}

/**
 * Notify all callbacks for a section
 */
function notifySection(name: SectionName, progress: number, isActive: boolean) {
  const callbacks = progressCallbacks.get(name);
  if (!callbacks) return;

  for (const cb of callbacks) {
    try {
      cb(progress, isActive);
    } catch (err) {
      console.error('[master-scroll] callback error', name, err);
    }
  }

  // Also drive the section's timeline if registered
  const segment = sections.get(name);
  if (segment?.timeline) {
    segment.timeline.progress(progress);
  }
}

// Track visibility logging to avoid spam
let lastVisibilityLogChunk = -1;

/**
 * Apply section visibility based on scroll position.
 *
 * SINGLE SOURCE OF TRUTH: Uses explicit scroll ranges from SECTION_VISIBILITY.
 * This replaces the previous mixed role-based and position-based logic that
 * caused race conditions and premature section reveals.
 *
 * Visibility: Determined purely by scroll position within each section's range.
 * Z-index: Determined by role (for stacking during zoom-out transitions).
 *
 * Z-index layering (from Z_INDEX_LAYERS):
 * - 10: Lens badge (always on top)
 * - 5: Hero (when active)
 * - 4: Logos (during its segment)
 * - 3: Remnant section (zoom-out)
 * - 2: Current section
 * - 1: Incoming section
 * - 0: Inactive sections
 */
function applySectionVisibility(
  scrollVH: number,
  roles: Map<SectionName, SectionRole>
): void {
  // Debug logging every 50vh to diagnose visibility issues
  const logChunk = Math.floor(scrollVH / 50);
  if (logChunk !== lastVisibilityLogChunk) {
    lastVisibilityLogChunk = logChunk;
    console.debug('[master-scroll] visibility check', {
      scrollVH: Math.round(scrollVH),
      registeredSections: Array.from(sectionElements.keys()),
      roles: Object.fromEntries(roles)
    });
  }

  for (const [name, element] of sectionElements) {
    const visConfig = SECTION_VISIBILITY[name];

    // SINGLE SOURCE OF TRUTH: Pure scroll-range visibility
    const shouldBeVisible = scrollVH >= visConfig.start && scrollVH < visConfig.end;

    // Z-index based on role for proper stacking during transitions
    let zIndex: number;
    const role = roles.get(name) || 'inactive';

    if (name === 'hero' && scrollVH < SECTION_SEGMENTS.logos.start) {
      zIndex = Z_INDEX_LAYERS.hero;
    } else if (name === 'logos' && scrollVH < SECTION_SEGMENTS.bigFilm.start) {
      zIndex = Z_INDEX_LAYERS.logos;
    } else if (role === 'remnant') {
      zIndex = Z_INDEX_LAYERS.remnant;
    } else if (role === 'current') {
      zIndex = Z_INDEX_LAYERS.current;
    } else if (role === 'incoming') {
      zIndex = Z_INDEX_LAYERS.incoming;
    } else {
      zIndex = Z_INDEX_LAYERS.inactive;
    }

    // Use GSAP autoAlpha for proper visibility management
    gsap.set(element, { autoAlpha: shouldBeVisible ? 1 : 0, zIndex });

    // DESIGN SPEC: Apply mask-image for zoom-out sections
    // Uses torus (donut) mask with inner radius shrinking faster than outer
    // This creates the "camera pulling back" depth effect
    if (isZoomOutSection(name)) {
      // Check each transition to see if this section is involved
      let maskApplied = false;

      for (const transition of ZOOM_OUT_TRANSITIONS) {
        const config = SECTION_SEGMENTS[transition.from];
        const zoneStart = config.start + config.duration * 0.85;
        const zoneEnd = config.start + config.duration;
        const zoneDuration = zoneEnd - zoneStart;

        if (transition.from === name && scrollVH >= zoneStart && scrollVH < zoneEnd) {
          // This section is exiting - apply zoom-out contraction
          const progress = (scrollVH - zoneStart) / zoneDuration;
          applyZoomOutProgress(element, progress, 'exiting');
          maskApplied = true;
          break;
        }

        // Check if this section is a remnant from a previous transition
        const fromIndex = ZOOM_OUT_TRANSITIONS.findIndex(t => t.from === name);
        if (fromIndex >= 0 && fromIndex < ZOOM_OUT_TRANSITIONS.indexOf(transition)) {
          // This section exited in a previous transition
          // Check if the next transition's zone is active (remnant shrinking)
          if (scrollVH >= zoneStart && scrollVH < zoneStart + zoneDuration * 0.4) {
            // Remnant is shrinking during first 40% of next transition
            const remnantProgress = (scrollVH - zoneStart) / (zoneDuration * 0.4);
            applyZoomOutProgress(element, remnantProgress, 'remnant');
            maskApplied = true;
            break;
          } else if (scrollVH >= zoneStart + zoneDuration * 0.4) {
            // Remnant has fully disappeared
            hideSectionMask(element);
            maskApplied = true;
            break;
          } else if (scrollVH >= SECTION_SEGMENTS[transition.from].start) {
            // Between transitions - show as remnant
            setSectionToRemnant(element);
            maskApplied = true;
            break;
          }
        }
      }

      // If no transition applies, set default mask based on visibility
      if (!maskApplied) {
        if (shouldBeVisible) {
          if (role === 'remnant') {
            setSectionToRemnant(element);
          } else {
            // Full visibility
            resetSectionMask(element);
          }
        } else {
          hideSectionMask(element);
        }
      }
    }
  }
}

/**
 * Update all sections based on current global progress
 */
function updateSections(globalProgress: number) {
  const scrollVH = globalProgress * TOTAL_SCROLL_VH;
  let activeSection: SectionName | null = null;
  let activeSectionProgress = 0;

  for (const name of Object.keys(SECTION_SEGMENTS) as SectionName[]) {
    const config = SECTION_SEGMENTS[name];
    const end = config.start + config.duration;

    let localProgress: number;
    let isActive: boolean;

    if (scrollVH < config.start) {
      // Before this section
      localProgress = 0;
      isActive = false;
    } else if (scrollVH >= end) {
      // After this section
      localProgress = 1;
      isActive = false;
    } else {
      // Within this section
      localProgress = (scrollVH - config.start) / config.duration;
      isActive = true;
      activeSection = name;
      activeSectionProgress = localProgress;
    }

    notifySection(name, localProgress, isActive);
  }

  // Update section roles for zoom-out transitions
  const roles = getSectionRoles(scrollVH);
  sectionRolesStore.set(roles);

  // SINGLE SOURCE OF TRUTH: Apply visibility AND z-index based on scroll position
  // (z-index is now handled inside applySectionVisibility using roles for stacking)
  applySectionVisibility(scrollVH, roles);

  stateStore.set({
    progress: globalProgress,
    currentSection: activeSection,
    sectionProgress: activeSectionProgress,
    scrollY: globalProgress * TOTAL_SCROLL_VH * (window.innerHeight / 100)
  });
}

/**
 * Build the master ScrollTrigger for the entire page
 */
function buildMasterTimeline(
  container: HTMLElement,
  spacer: HTMLElement
): () => void {
  // Kill existing trigger
  if (masterTrigger) {
    masterTrigger.kill();
    masterTrigger = null;
  }

  // Set spacer height to consume all scroll distance
  gsap.set(spacer, { height: `${TOTAL_SCROLL_VH}vh` });

  // Create the master trigger - pins the container and tracks progress
  masterTrigger = ScrollTrigger.create({
    trigger: spacer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      updateSections(self.progress);
    },
    onRefresh: () => {
      console.debug('[master-scroll] ScrollTrigger refresh', {
        totalVH: TOTAL_SCROLL_VH,
        sections: sections.size
      });
    }
  });

  console.debug('[master-scroll] buildMasterTimeline', {
    totalVH: TOTAL_SCROLL_VH,
    spacerHeight: `${TOTAL_SCROLL_VH}vh`
  });

  return () => {
    if (masterTrigger) {
      masterTrigger.kill();
      masterTrigger = null;
    }
  };
}

/**
 * The master scroll controller singleton
 */
export const masterScrollController: MasterScrollController = {
  state: stateStore,
  currentSection: currentSectionStore,
  globalProgress: globalProgressStore,
  registerSection,
  registerParallaxTargets,
  registerLensBug,
  onSectionProgress,
  buildMasterTimeline,
  buildZoomOutTransitions,
  getSectionProgress,
  getSectionByProgress,
  shouldSectionBeVisible,
  triggerLensBlip
};

// Convenience exports
export const masterState = stateStore;
export const masterProgress = globalProgressStore;
export const masterCurrentSection = currentSectionStore;
export const masterSectionRoles = sectionRolesStore;

// Re-export zoom-out types and constants
export { ZOOM_OUT_TRANSITIONS, isZoomOutSection, type SectionRole } from './zoomOutTransition';
