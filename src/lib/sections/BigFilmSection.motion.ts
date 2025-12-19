import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
import { attachLensToSection } from '$lib/motion/lensTimeline';
import { attachFilmExitPortal } from './FilmExitPortal';
import { playFilmStoriesEntry, createStoryFrames, type ReelFrame } from './FilmStoriesEntry';

type BigFilmMotionOptions = {
  root: HTMLElement;
  viewport: HTMLElement;
  slab: HTMLElement;
  slabLines?: HTMLElement[];
  mediaNodes: HTMLElement[];
  labelElement?: HTMLElement | null;
  previewStories?: Array<{ title: string; src: string }>;
  // Framework 3 §3.2: Film cards data for entry reel strip
  filmCards?: Array<{ title: string; media: { src: string; type: 'video' | 'image' } }>;
  orchestrator?: ScrollOrchestrator;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  onPortalReady?: (detail: { focusRect: DOMRect }) => void;
  // Framework 2 §3.2: Lens barrel overlay callbacks
  onLensBarrelShow?: (label: string) => void;
  onLensBarrelHide?: () => void;
  // Framework 2 §3.6: Concentric circles callbacks
  onConcentricShow?: (scale: number) => void;
  onConcentricHide?: () => void;
  // Framework 2 §3.5 §C: Lens bug blip during card transitions
  onLensBugBlip?: () => void;
};

export function initBigFilmMotion(options: BigFilmMotionOptions) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const animations: gsap.core.Animation[] = [];
  const timelineDisposers: Array<() => void> = [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  console.debug(
    '[big-film-motion] init',
    'mediaCount',
    options.mediaNodes.length,
    'prefersReducedMotion',
    prefersReducedMotion,
    'hasRoot',
    Boolean(options.root),
    'hasViewport',
    Boolean(options.viewport)
  );

  if (!options.root || !options.viewport || !options.slab || options.mediaNodes.length === 0) {
    console.warn('[big-film] missing targets, skipping motion setup');
    return () => {};
  }

  const registerAnimation = (name: string, animation: gsap.core.Animation) => {
    console.debug('[big-film-motion] register animation', name);
    animations.push(animation);
    if (options.orchestrator) {
      timelineDisposers.push(
        options.orchestrator.registerSectionTimeline(name, () => animation)
      );
    }
  };

  options.mediaNodes.forEach((node, index) => {
    gsap.set(node, {
      autoAlpha: index === 0 ? 1 : 0,
      clipPath: index === 0 ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
      zIndex: options.mediaNodes.length - index
    });
  });
  options.onStepChange?.(0);

  if (prefersReducedMotion) {
    const staticTimeline = gsap.timeline();
    registerAnimation('big-film:static', staticTimeline);
    const lensTrigger = ScrollTrigger.create({
      trigger: options.root,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => attachLensToSection('film'),
      onLeave: () => attachLensToSection('filmStories'),
      onEnterBack: () => attachLensToSection('film'),
      onLeaveBack: () => attachLensToSection('logos')
    });
    const exitTrigger = ScrollTrigger.create({
      trigger: options.root,
      start: 'bottom top',
      onEnter: () => options.onComplete?.()
    });

    const focusRect = options.mediaNodes[0]?.getBoundingClientRect();
    if (focusRect) {
      options.onPortalReady?.({ focusRect });
    }

    return () => {
      timelineDisposers.forEach((dispose) => dispose());
      timelineDisposers.length = 0;
      animations.forEach((animation) => animation.kill());
      lensTrigger.kill();
      exitTrigger.kill();
      attachLensToSection(null);
    };
  }

  // Create paused timeline - controlled by master scroll controller
  const timeline = gsap.timeline({
    defaults: { ease: brandEase },
    paused: true
  });

  // Track active state for lens attachment
  let wasActive = false;
  let lastProgressChunk = -1;

  // Register with master scroll controller for progress updates
  const unsubscribeMaster = masterScrollController.onSectionProgress('bigFilm', (progress, isActive) => {
    timeline.progress(progress);

    const chunk = Math.floor(progress * 10);
    if (chunk !== lastProgressChunk) {
      lastProgressChunk = chunk;
      console.debug(
        '[big-film-motion] progress update',
        'progress',
        Number(progress.toFixed(2)),
        'isActive',
        isActive
      );
    }

    // Handle lens attachment based on active state
    if (isActive && !wasActive) {
      console.debug('[big-film-motion] enter');
      attachLensToSection('film');
    } else if (!isActive && wasActive && progress >= 0.95) {
      console.debug('[big-film-motion] leave → filmStories');
      attachLensToSection('filmStories');
    } else if (!isActive && wasActive && progress <= 0.05) {
      console.debug('[big-film-motion] leaveBack');
      attachLensToSection('logos');
    }
    wasActive = isActive;
  });

  // Register section element with master controller
  const unregisterSection = masterScrollController.registerSection('bigFilm', options.root, timeline);

  console.debug('[big-film-motion] timeline created (paused, master-controlled)');

  // Design spec: 50-80ms stagger between text lines
  const TEXT_STAGGER_MS = 0.06; // 60ms (middle of 50-80ms range)
  const slabLines = options.slabLines ?? [];

  // Card labels for lens barrel overlay (Framework 2 §3.2)
  const cardLabels = [
    '14 PEAKS / NETFLIX',
    'K2 WINTER / EXPEDITION',
    'K2 SUMMIT / 2022'
  ];

  const stops = [0.30, 0.65];
  stops.forEach((stop, index) => {
    const current = options.mediaNodes[index];
    const next = options.mediaNodes[index + 1];
    if (!current || !next) return;
    console.debug('[big-film-motion] stop configured', 'index', index, 'stop', stop);

    // Framework 2 §3.2: Show lens barrel at transition start
    timeline.call(
      () => options.onLensBarrelShow?.(cardLabels[index + 1] || ''),
      undefined,
      stop - 0.02
    );

    // Framework 2 §3.5 §C: Lens bug blip at transition start
    timeline.call(
      () => options.onLensBugBlip?.(),
      undefined,
      stop
    );

    // Framework 2 §3.5: Card transitions with iris/lens zoom effect (220-260ms total)
    // Phase 1: Zoom-out effect - circle shrinks + scale down (shows "wider framing")
    // Both cards visible simultaneously for inside-circle crossfade
    timeline
      .to(
        current,
        {
          clipPath: 'circle(80% at 50% 50%)', // Shrink circle to 80%
          scale: 0.92, // Scale down (zoom out effect - sees wider framing)
          autoAlpha: 0.6, // Partial fade for crossfade effect
          duration: 0.12 // 120ms (first half)
        },
        stop
      )
      // SIMULTANEOUS: next card starts as current is mid-transition (inside-circle crossfade)
      .fromTo(
        next,
        { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0, scale: 1 },
        {
          clipPath: 'circle(80% at 50% 50%)',
          autoAlpha: 0.8,
          duration: 0.12 // Same timing = inside-circle crossfade
        },
        stop // Same position = simultaneous
      )
      // Phase 2: Snap open - current continues fading out, next snaps to full
      .to(
        current,
        {
          clipPath: 'circle(0% at 50% 50%)',
          autoAlpha: 0,
          scale: 0.88,
          duration: 0.12,
          ease: 'power2.in' // Accelerate out
        },
        stop + 0.12
      )
      .to(
        next,
        {
          clipPath: 'circle(150% at 50% 50%)',
          autoAlpha: 1,
          scale: 1,
          duration: 0.14,
          ease: 'power2.out' // Quick snap open (like iris snapping open)
        },
        stop + 0.12
      )
      .call(() => options.onStepChange?.(index + 1), undefined, stop + 0.12);

    // Framework 2 §3.2: Hide lens barrel after transition completes
    timeline.call(
      () => options.onLensBarrelHide?.(),
      undefined,
      stop + 0.26
    );

    // Animate slab text lines with stagger per Framework 2 spec
    // Starts after Phase 2 begins (snap open phase)
    if (slabLines.length > 0) {
      timeline.fromTo(
        slabLines,
        { yPercent: 12, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.3,
          stagger: TEXT_STAGGER_MS,
          ease: brandEase
        },
        stop + 0.14
      );
    } else {
      // Fallback: animate whole slab if no lines provided
      timeline.fromTo(
        options.slab,
        { yPercent: 6, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.35 },
        stop + 0.14
      );
    }
  });

  const detachExitPortal = attachFilmExitPortal({
    timeline,
    cards: options.mediaNodes,
    viewport: options.viewport,
    previewStories: options.previewStories,
    labelElement: options.labelElement,
    onPortalReady: options.onPortalReady,
    // Framework 2 §3.6: Concentric circles callbacks
    onConcentricShow: options.onConcentricShow,
    onConcentricHide: options.onConcentricHide
  });

  // Framework 3 §3.2: Film Stories entry reel strip animation
  // Plays after BigFilm exit to show K2→Sasha focus ring pan
  let entryCleanup: (() => void) | null = null;
  let entryTriggered = false;

  if (options.filmCards && options.previewStories) {
    // Create film frames from BigFilm cards
    const filmFrames: ReelFrame[] = options.filmCards.map((card) => ({
      title: card.title,
      src: card.media.src,
      type: card.media.type
    }));

    // Create story frames from preview stories
    const storyFrames = createStoryFrames(options.previewStories);

    // Trigger entry animation at 92% progress (after concentric rings, before preview strip fades out)
    timeline.call(
      () => {
        if (entryTriggered || prefersReducedMotion) return;
        entryTriggered = true;

        console.debug('[big-film-motion] triggering FilmStoriesEntry');

        // Create overlay container (fixed position, removed on cleanup)
        const overlayContainer = document.createElement('div');
        overlayContainer.style.cssText = 'position: fixed; inset: 0; z-index: 25; pointer-events: none;';
        document.body.appendChild(overlayContainer);

        entryCleanup = playFilmStoriesEntry({
          container: overlayContainer,
          targetMedia: options.viewport, // Use viewport as reference
          filmFrames,
          storyFrames,
          onComplete: () => {
            console.debug('[big-film-motion] FilmStoriesEntry complete');
            // Remove overlay container after animation
            setTimeout(() => overlayContainer.remove(), 100);
          }
        });
      },
      undefined,
      0.92
    );
  }

  timeline.call(() => options.onComplete?.(), undefined, '+=0.2');
  registerAnimation('big-film:pin', timeline);
  console.debug('[big-film-motion] timeline ready', 'duration', timeline.duration());

  return () => {
    // Clean up master scroll subscriptions
    unsubscribeMaster();
    unregisterSection();

    timelineDisposers.forEach((dispose) => dispose());
    timelineDisposers.length = 0;
    animations.forEach((animation) => animation.kill());
    attachLensToSection(null);
    detachExitPortal();
    entryCleanup?.();
  };
}
