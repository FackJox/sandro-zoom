/**
 * About Section Motion Logic
 * Framework 4 §5-6: Beat transitions and exit portal animations
 */

import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
import type { Beat } from '$lib/data/about-beats';

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

export function moveRing(
  focusRing: HTMLDivElement | null,
  target: HTMLElement | null,
  root: HTMLElement,
  immediate = false
): void {
  if (!target || !focusRing) return;
  const rect = target.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const x = rect.left - rootRect.left + rect.width * 0.75;
  const y = rect.top - rootRect.top + rect.height * 0.25;
  gsap.to(focusRing, {
    x,
    y,
    duration: immediate ? 0 : 0.4,
    ease: brandEase
  });
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

  // Create paused timeline - controlled by master scroll controller
  const tl = gsap.timeline({
    defaults: { ease: brandEase },
    paused: true
  });

  // Register with master scroll controller for progress updates
  const unsubscribeMaster = masterScrollController.onSectionProgress('about', (progress, isActive) => {
    tl.progress(progress);

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
    gsap.set(beat.ref, {
      autoAlpha: shouldBeVisible && index === 0 ? 1 : 0,
      clipPath: index === 0 ? 'circle(140% at 50% 50%)' : 'circle(0% at 50% 50%)'
    });
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

      // Phase 2: Focus ring pulses during transition
      if (focusRing) {
        tl.to(focusRing, {
          scale: 1.3,
          opacity: 0.9,
          duration: 0.04
        }, transitionStart);
        tl.to(focusRing, {
          scale: 1,
          opacity: 0.6,
          duration: 0.06
        }, transitionStart + 0.06);
      }

      // Phase 3: Current beat fades out with blur
      tl.to(beat.ref, {
        clipPath: 'circle(0% at 50% 50%)',
        autoAlpha: 0,
        duration: 0.12
      }, transitionStart);

      // Reset blur and transforms on outgoing elements
      if (beat.textRef) {
        tl.set(beat.textRef, { filter: 'blur(0px)' }, transitionStart + 0.12);
      }
      if (beat.bgRef) {
        tl.set(beat.bgRef, { scale: 1, x: 0 }, transitionStart + 0.12);
      }
      if (beat.mediaRef) {
        tl.set(beat.mediaRef, { scale: 1, x: 0, y: 0 }, transitionStart + 0.12);
      }

      // Phase 4: Next beat fades in
      tl.fromTo(next.ref,
        { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 },
        { clipPath: 'circle(140% at 50% 50%)', autoAlpha: 1, duration: 0.15 },
        transitionStart + 0.02
      );

      // Beat 3 (Values) special stagger animation (Framework 4 §5.3)
      if (i === 1 && valuesLine1 && valuesLine2) {
        gsap.set(valuesLine1, { opacity: 0 });
        gsap.set(valuesLine2, { opacity: 0, y: 30 });

        tl.to(valuesLine1, {
          opacity: 1,
          duration: 0.08
        }, transitionStart + 0.10);

        tl.to(valuesLine2, {
          opacity: 1,
          y: 0,
          duration: 0.12,
          ease: brandEase
        }, transitionStart + 0.14);
      }
    }
  });

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
