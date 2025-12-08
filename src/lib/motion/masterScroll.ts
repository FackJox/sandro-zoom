import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { gsap, ScrollTrigger, brandEase } from '$lib/motion';
import {
  getSectionRoles,
  applySectionZIndex,
  ZOOM_OUT_TRANSITIONS,
  isZoomOutSection,
  buildZoomOutSegment,
  initSectionForZoomOut,
  type SectionRole,
  type ZoomOutSectionRefs
} from './zoomOutTransition';
import { SECTION_SEGMENTS, TOTAL_SCROLL_VH, type SectionName } from './sectionConfig';

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

  console.debug('[master-scroll] registerSection', name, {
    start: segment.start,
    duration: segment.duration,
    hasTimeline: Boolean(segment.timeline),
    isZoomOut: isZoomOutSection(name)
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
 * This is the SINGLE SOURCE OF TRUTH for section visibility.
 *
 * Visibility rules:
 * - Hero: Always visible until it fully contracts (end of Hero segment)
 * - Logos: Visible when Hero starts transitioning (last 25% of Hero) through end of Logos
 * - BigFilm: Visible during Logos exit (last 15%) and throughout its section
 * - Zoom-out sections: Visible based on role (current/incoming/remnant)
 * - Other sections: Visible when scroll reaches them
 *
 * Z-index layering (higher = on top):
 * - 5: Hero (when active)
 * - 4: Logos (during its segment)
 * - 3: Remnant section
 * - 2: Current section
 * - 1: Incoming section / other sections
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
    let shouldBeVisible = false;
    let zIndex = 0;

    if (name === 'hero') {
      // Hero visible from start until Logos section ends (contracts during exit)
      const logosEnd = SECTION_SEGMENTS.logos.start + SECTION_SEGMENTS.logos.duration;
      shouldBeVisible = scrollVH < logosEnd;
      // Hero z-index: on top until Logos starts, then behind
      zIndex = scrollVH < SECTION_SEGMENTS.logos.start ? 5 : 0;
    } else if (name === 'logos') {
      // Logos: visible when Hero starts transitioning out (last 25% of Hero)
      // This ensures Logos appears BEFORE metadata detaches
      const heroTransitionStart = SECTION_SEGMENTS.hero.start + SECTION_SEGMENTS.hero.duration * 0.75;
      const logosEnd = SECTION_SEGMENTS.logos.start + SECTION_SEGMENTS.logos.duration;
      shouldBeVisible = scrollVH >= heroTransitionStart && scrollVH < logosEnd + 50;
      zIndex = 4; // Above BigFilm during portal transition
    } else if (name === 'bigFilm') {
      // BigFilm: visible during Logos exit (last 15%) and throughout its section
      // This handles the Logos → BigFilm portal zoom transition
      const logosExitStart = SECTION_SEGMENTS.logos.start + SECTION_SEGMENTS.logos.duration * 0.85;
      const role = roles.get(name) || 'inactive';
      shouldBeVisible = scrollVH >= logosExitStart || role !== 'inactive';
      const logosEnd = SECTION_SEGMENTS.logos.start + SECTION_SEGMENTS.logos.duration;
      zIndex = scrollVH < logosEnd ? 1 : 2; // Behind Logos during portal, then in front
    } else if (isZoomOutSection(name)) {
      // Zoom-out sections: visible based on role
      const role = roles.get(name) || 'inactive';
      shouldBeVisible = role !== 'inactive';
      // Z-index based on role: remnant=3, current=2, incoming=1
      zIndex = role === 'remnant' ? 3 : role === 'current' ? 2 : role === 'incoming' ? 1 : 0;
    } else {
      // Non-zoom-out sections: visible when scroll reaches them
      // Use a small buffer (10vh) before section start for smooth transitions
      const config = SECTION_SEGMENTS[name];
      shouldBeVisible = scrollVH >= config.start - 10;
      zIndex = 1;
    }

    gsap.set(element, { autoAlpha: shouldBeVisible ? 1 : 0, zIndex });
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

  // Update section roles and z-index for zoom-out transitions
  const roles = getSectionRoles(scrollVH);
  sectionRolesStore.set(roles);
  applySectionZIndex(sectionElements, roles);

  // SINGLE SOURCE OF TRUTH: Apply visibility based on scroll position
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
  shouldSectionBeVisible
};

// Convenience exports
export const masterState = stateStore;
export const masterProgress = globalProgressStore;
export const masterCurrentSection = currentSectionStore;
export const masterSectionRoles = sectionRolesStore;

// Re-export zoom-out types and constants
export { ZOOM_OUT_TRANSITIONS, isZoomOutSection, type SectionRole } from './zoomOutTransition';
