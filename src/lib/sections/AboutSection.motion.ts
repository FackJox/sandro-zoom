/**
 * About Section Motion Logic
 * Framework 4 §5-6: Beat transitions and exit portal animations
 *
 * Beat transitions use inside/outside mask separation:
 * - Inside the circle: incoming beat content fades in
 * - Outside the circle: current beat content fades out
 */

import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
import { attachLensToSection } from '$lib/motion/lensTimeline';
import type { Beat } from '$lib/data/about-beats';

// ─────────────────────────────────────────────────────────────────
// Mask Helpers (Framework 4 §5.2 - inside/outside separation)
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a filled circle mask (content visible inside the circle)
 * Used for incoming beat - shows center, hides edges
 */
function getInsideCircleMask(radiusPercent: number): string {
  if (radiusPercent <= 0) {
    return 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)';
  }
  return `radial-gradient(circle at 50% 50%, black 0%, black ${radiusPercent}%, transparent ${radiusPercent}%)`;
}

/**
 * Generate an inverted circle mask (content visible outside the circle)
 * Used for outgoing beat - hides center, shows edges
 */
function getOutsideCircleMask(innerRadius: number, outerRadius: number = 150): string {
  if (innerRadius <= 0) {
    // No hole - fully visible
    return `radial-gradient(circle at 50% 50%, black 0%, black ${outerRadius}%, transparent ${outerRadius}%)`;
  }
  if (innerRadius >= outerRadius) {
    // Fully transparent
    return 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 100%)';
  }
  // Ring mask - transparent center, visible ring, transparent outside
  return `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${innerRadius}%, black ${innerRadius}%, black ${outerRadius}%, transparent ${outerRadius}%)`;
}

/**
 * Apply mask-image with webkit prefix for cross-browser support
 */
function applyMask(element: HTMLElement, mask: string): void {
  element.style.maskImage = mask;
  element.style.webkitMaskImage = mask;
}

/**
 * Clear mask from element
 */
function clearMask(element: HTMLElement): void {
  element.style.maskImage = '';
  element.style.webkitMaskImage = '';
}

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface BeatRefs {
  ref: HTMLElement | null;
  bgRef: HTMLElement | null;
  mediaRef: HTMLElement | null;
  textRef: HTMLElement | null;
}

export interface AboutMotionOptions {
  root: HTMLElement;
  beats: BeatRefs[];
  focusRing: HTMLDivElement | null;
  exitFocusRing: HTMLDivElement | null;
  servicesGhostGrid: HTMLDivElement | null;
  valuesLine1: HTMLParagraphElement | null;
  valuesLine2: HTMLParagraphElement | null;
  orchestrator?: ScrollOrchestrator;
  onActiveIndexChange: (index: number) => void;
  onExitDispatch: (focusRect: DOMRect) => void;
}

export interface PortalIntroOptions {
  portalEntryMask: HTMLDivElement;
  outsideBlur: HTMLDivElement;
  statsTextClone: HTMLSpanElement;
  aboutIntroText: HTMLSpanElement;
  portalBgBasecamp: HTMLDivElement;
  portalBgFrontline: HTMLDivElement;
  targetRef: HTMLElement | null;
  focusRect?: DOMRect;
  statsText?: string;
}

// ─────────────────────────────────────────────────────────────────
// Focus Ring Helper
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate the center position of a target element relative to root
 */
function getRingTargetPosition(
  target: HTMLElement,
  root: HTMLElement
): { x: number; y: number } {
  const rect = target.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  // Position at center-right of the element for better visibility
  return {
    x: rect.left - rootRect.left + rect.width * 0.75,
    y: rect.top - rootRect.top + rect.height * 0.35
  };
}

/**
 * Move focus ring to target element
 */
export function moveRing(
  focusRing: HTMLDivElement | null,
  target: HTMLElement | null,
  root: HTMLElement,
  immediate = false
): void {
  if (!target || !focusRing) return;
  const { x, y } = getRingTargetPosition(target, root);
  gsap.to(focusRing, {
    x,
    y,
    duration: immediate ? 0 : 0.4,
    ease: brandEase
  });
}

/**
 * Animate focus ring traveling from one beat to another (Framework 4 §5.2)
 * Creates a smooth path animation during beat transitions
 */
export function animateRingBetweenBeats(
  focusRing: HTMLDivElement | null,
  fromBeat: HTMLElement | null,
  toBeat: HTMLElement | null,
  root: HTMLElement,
  timeline: gsap.core.Timeline,
  startTime: number,
  duration: number
): void {
  if (!focusRing || !fromBeat || !toBeat) return;

  const fromPos = getRingTargetPosition(fromBeat, root);
  const toPos = getRingTargetPosition(toBeat, root);

  // Animate the ring traveling from current to next beat
  timeline.fromTo(focusRing,
    { x: fromPos.x, y: fromPos.y },
    {
      x: toPos.x,
      y: toPos.y,
      duration: duration,
      ease: brandEase
    },
    startTime
  );
}

// ─────────────────────────────────────────────────────────────────
// Portal Entry Animation (Framework 4 §2)
// ─────────────────────────────────────────────────────────────────

export function createPortalIntroTimeline(options: PortalIntroOptions): gsap.core.Timeline {
  const {
    portalEntryMask,
    outsideBlur,
    statsTextClone,
    aboutIntroText,
    portalBgBasecamp,
    portalBgFrontline,
    targetRef
  } = options;

  const fallbackRect = new DOMRect(window.innerWidth / 2, window.innerHeight * 0.6, 40, 40);
  const startRect = options.focusRect ?? fallbackRect;
  const targetRect = targetRef?.getBoundingClientRect() ?? startRect;

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  // Set stats text for crossfade
  if (statsTextClone && options.statsText) {
    statsTextClone.textContent = options.statsText;
  }

  const tl = gsap.timeline({ defaults: { ease: brandEase } });

  // Phase 1: Position portal at stats card center, init backgrounds
  tl.set(portalEntryMask, {
    opacity: 1,
    clipPath: `circle(60px at ${startX}px ${startY}px)`
  })
    .set(statsTextClone, { opacity: 1, y: 0 })
    .set(aboutIntroText, { opacity: 0, y: 20 })
    .set(portalBgBasecamp, { opacity: 1 })
    .set(portalBgFrontline, { opacity: 0 });

  // Phase 2: Darken/blur outside
  tl.to(outsideBlur, {
    opacity: 1,
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(15, 23, 26, 0.4)',
    duration: 0.25
  }, 0.1);

  // Phase 3: Text crossfade inside circle
  tl.to(statsTextClone, { opacity: 0, y: -20, duration: 0.3 }, 0.3);
  tl.to(aboutIntroText, { opacity: 1, y: 0, duration: 0.35 }, 0.4);

  // Phase 4: Move circle to target and expand
  tl.to(portalEntryMask, {
    clipPath: `circle(80px at ${targetX}px ${targetY}px)`,
    duration: 0.4
  }, 0.5);

  // Phase 4b: Background crossfade - basecamp to frontline (Framework 4 §2.4)
  tl.to(portalBgBasecamp, { opacity: 0, duration: 0.5 }, 0.6);
  tl.to(portalBgFrontline, { opacity: 1, duration: 0.5 }, 0.6);

  tl.to(portalEntryMask, {
    clipPath: 'circle(150% at 50% 50%)',
    duration: 0.5
  }, 0.85);

  // Phase 5: Fade outside blur and entry mask
  tl.to(outsideBlur, {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    duration: 0.3
  }, 1.0);

  tl.to(portalEntryMask, {
    opacity: 0,
    duration: 0.3
  }, 1.1);

  return tl;
}

// ─────────────────────────────────────────────────────────────────
// Main About Timeline (Framework 4 §5-6)
// ─────────────────────────────────────────────────────────────────

export function initAboutTimeline(options: AboutMotionOptions): () => void {
  const {
    root,
    beats,
    focusRing,
    exitFocusRing,
    servicesGhostGrid,
    valuesLine1,
    valuesLine2,
    orchestrator,
    onActiveIndexChange,
    onExitDispatch
  } = options;

  let activeIndex = 0;
  let wasActive = false;

  // Create paused timeline - controlled by master scroll controller
  const tl = gsap.timeline({
    defaults: { ease: brandEase },
    paused: true
  });

  // Register with master scroll controller for progress updates
  const unsubscribeMaster = masterScrollController.onSectionProgress('about', (progress, isActive) => {
    tl.progress(progress);

    // Handle lens attachment based on active state
    if (isActive && !wasActive) {
      console.debug('[about] enter');
      attachLensToSection('about');
    } else if (!isActive && wasActive && progress >= 0.95) {
      console.debug('[about] leave → services');
      attachLensToSection('services');
    } else if (!isActive && wasActive && progress <= 0.05) {
      console.debug('[about] leaveBack → photoStats');
      attachLensToSection('photoStats');
    }
    wasActive = isActive;

    // Update active index based on progress
    const newIndex = Math.min(Math.floor(progress * 3), 2);
    if (newIndex !== activeIndex && isActive) {
      activeIndex = newIndex;
      onActiveIndexChange(activeIndex);
      moveRing(focusRing, beats[activeIndex]?.ref ?? null, root);
    }
  });

  // Register section element with master controller
  const unregisterSection = masterScrollController.registerSection('about', root, tl);

  // Initialize beat states - only reveal if section should be visible based on scroll
  const shouldBeVisible = masterScrollController.shouldSectionBeVisible('about');

  beats.forEach((beat, index) => {
    if (!beat.ref) return;
    // Use mask-image for consistent behavior with transitions
    gsap.set(beat.ref, {
      autoAlpha: shouldBeVisible && index === 0 ? 1 : 0
    });
    // First beat fully visible (no mask), others hidden
    if (index === 0) {
      clearMask(beat.ref);
    } else {
      applyMask(beat.ref, getInsideCircleMask(0));
    }
  });

  // Initial ring position
  moveRing(focusRing, beats[0]?.ref ?? null, root, true);

  // Build beat transitions
  // Progress mapping: 0-0.33 = Beat 1, 0.33-0.66 = Beat 2, 0.66-1.0 = Beat 3
  const beatDuration = 1 / beats.length;

  beats.forEach((beat, i) => {
    const next = beats[i + 1];

    if (beat.ref && next?.ref) {
      // Transition starts at end of current beat's segment
      const transitionStart = (i + 0.85) * beatDuration;
      const softFocusStart = transitionStart - 0.04;
      const transitionDuration = 0.12;

      // Phase 1: Soft focus on current scene (Framework 4 §5.2)
      if (beat.textRef) {
        tl.to(beat.textRef, {
          filter: 'blur(4px)',
          duration: 0.06,
          ease: 'power2.in'
        }, softFocusStart);
      }

      // Mobile background tilt
      if (beat.bgRef) {
        tl.to(beat.bgRef, {
          scale: 1.03,
          x: i % 2 === 0 ? -10 : 10,
          duration: 0.08,
          ease: 'power1.inOut'
        }, softFocusStart);
      }

      // Desktop media tilt/pan (Framework 4 §5.2)
      if (beat.mediaRef) {
        tl.to(beat.mediaRef, {
          scale: 1.05,
          x: i % 2 === 0 ? -15 : 15,
          y: i % 2 === 0 ? -8 : 8,
          duration: 0.08,
          ease: 'power1.inOut'
        }, softFocusStart);
      }

      // Phase 2: Focus ring travels between beats (Framework 4 §5.2)
      if (focusRing && beat.ref && next.ref) {
        // Pulse at start of transition
        tl.to(focusRing, {
          scale: 1.3,
          opacity: 0.9,
          duration: 0.03
        }, transitionStart);

        // Animate ring traveling from current beat to next beat
        animateRingBetweenBeats(
          focusRing,
          beat.ref,
          next.ref,
          root,
          tl,
          transitionStart + 0.03,
          transitionDuration - 0.03
        );

        // Settle ring at destination
        tl.to(focusRing, {
          scale: 1,
          opacity: 0.6,
          duration: 0.04
        }, transitionStart + transitionDuration);
      }

      // Phase 3: Inside/Outside mask transition (Framework 4 §5.2)
      // Current beat: shows OUTSIDE (edges fade out as center grows transparent)
      // Incoming beat: shows INSIDE (center visible, grows to fill)

      // Proxy objects for animating mask radii
      const outgoingMask = { innerRadius: 0, outerRadius: 150 };
      const incomingMask = { radius: 0 };

      // Make incoming beat visible but masked to nothing initially
      tl.set(next.ref, { autoAlpha: 1 }, transitionStart);
      tl.set(next.ref, {
        onComplete: () => applyMask(next.ref!, getInsideCircleMask(0))
      }, transitionStart);

      // Animate outgoing beat: center becomes transparent (ring grows)
      tl.to(outgoingMask, {
        innerRadius: 100,
        outerRadius: 150,
        duration: transitionDuration,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (beat.ref) {
            applyMask(beat.ref, getOutsideCircleMask(outgoingMask.innerRadius, outgoingMask.outerRadius));
          }
        }
      }, transitionStart);

      // Animate incoming beat: visible center grows from 0 to fill
      tl.to(incomingMask, {
        radius: 140,
        duration: transitionDuration,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (next.ref) {
            applyMask(next.ref, getInsideCircleMask(incomingMask.radius));
          }
        }
      }, transitionStart);

      // At transition end: hide outgoing, clear masks
      tl.set(beat.ref, { autoAlpha: 0 }, transitionStart + transitionDuration);
      tl.call(() => {
        if (beat.ref) clearMask(beat.ref);
        if (next.ref) clearMask(next.ref);
      }, undefined, transitionStart + transitionDuration + 0.01);

      // Reset blur and transforms on outgoing elements
      if (beat.textRef) {
        tl.set(beat.textRef, { filter: 'blur(0px)' }, transitionStart + transitionDuration);
      }
      if (beat.bgRef) {
        tl.set(beat.bgRef, { scale: 1, x: 0 }, transitionStart + transitionDuration);
      }
      if (beat.mediaRef) {
        tl.set(beat.mediaRef, { scale: 1, x: 0, y: 0 }, transitionStart + transitionDuration);
      }

    }
  });

  // Beat 3 (Values) special stagger animation (Framework 4 §5.3)
  // Triggers AFTER beat 3 is fully visible, not during transition
  if (valuesLine1 && valuesLine2) {
    gsap.set(valuesLine1, { opacity: 0 });
    gsap.set(valuesLine2, { opacity: 0, y: 30 });

    // Beat 3 starts at 0.66, fully revealed by ~0.72
    // Stagger starts at 0.74 (after beat is settled)
    const valuesRevealStart = 0.74;

    tl.to(valuesLine1, {
      opacity: 1,
      duration: 0.05
    }, valuesRevealStart);

    // Line 2 slides up on "slight downward scroll" (spec)
    tl.to(valuesLine2, {
      opacity: 1,
      y: 0,
      duration: 0.08,
      ease: brandEase
    }, valuesRevealStart + 0.04);
  }

  // Exit transition to Services (Framework 4 §6)
  const exitStart = 0.88;
  const valuesTextRef = beats[2]?.textRef;

  // Step 1: Tighten focus on final lines
  if (valuesLine1 && valuesLine2) {
    tl.to([valuesLine1, valuesLine2], {
      filter: 'brightness(1.15) contrast(1.05)',
      duration: 0.03
    }, exitStart);
  }

  // Step 2: Ring appears around text block
  if (exitFocusRing) {
    tl.to(exitFocusRing, { opacity: 1, scale: 1, duration: 0.03 }, exitStart + 0.02);
  }

  // Step 3: Zoom out
  if (valuesTextRef) {
    tl.to(valuesTextRef, {
      scale: 0.92,
      filter: 'blur(1px)',
      duration: 0.04
    }, exitStart + 0.04);
  }

  if (exitFocusRing) {
    tl.to(exitFocusRing, { scale: 6, duration: 0.04 }, exitStart + 0.04);
  }

  if (servicesGhostGrid) {
    tl.to(servicesGhostGrid, { opacity: 0.4, duration: 0.03 }, exitStart + 0.05);
  }

  // Step 4: Crossfade - "Stories from..." lingers longer
  if (valuesLine2) {
    tl.to(valuesLine2, { opacity: 0, duration: 0.02 }, exitStart + 0.07);
  }
  if (valuesLine1) {
    tl.to(valuesLine1, { opacity: 0, duration: 0.03 }, exitStart + 0.08);
  }
  if (servicesGhostGrid) {
    tl.to(servicesGhostGrid, { opacity: 0.7, duration: 0.02 }, exitStart + 0.08);
  }

  // Step 5: Expand into Services
  if (exitFocusRing) {
    tl.to(exitFocusRing, { scale: 12, opacity: 0, duration: 0.03 }, exitStart + 0.10);
  }

  // Dispatch exit event near the end
  tl.call(() => {
    const rect = valuesTextRef?.getBoundingClientRect() ??
      new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 100, 100);
    onExitDispatch(rect);
  }, undefined, 0.98);

  if (servicesGhostGrid) {
    tl.to(servicesGhostGrid, { opacity: 0, duration: 0.02 }, 0.99);
  }

  // Register with legacy orchestrator if available
  let timelineDisposer: (() => void) | null = null;
  if (orchestrator) {
    timelineDisposer = orchestrator.registerSectionTimeline('about', () => tl);
  }

  // Return cleanup function
  return () => {
    unsubscribeMaster();
    unregisterSection();
    tl.kill();
    timelineDisposer?.();
  };
}
