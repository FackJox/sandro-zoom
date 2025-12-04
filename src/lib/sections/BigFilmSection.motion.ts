import { gsap, ScrollTrigger, brandEase, type ScrollOrchestrator } from '$lib/motion';
import { attachLensToSection } from '$lib/motion/lensTimeline';
import { attachFilmExitPortal } from './FilmExitPortal';

type BigFilmMotionOptions = {
  root: HTMLElement;
  viewport: HTMLElement;
  slab: HTMLElement;
  mediaNodes: HTMLElement[];
  labelElement?: HTMLElement | null;
  previewStories?: Array<{ title: string; src: string }>;
  orchestrator?: ScrollOrchestrator;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  onPortalReady?: (detail: { focusRect: DOMRect }) => void;
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
      onLeave: () => attachLensToSection(null),
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

  const timeline = gsap.timeline({
    defaults: { ease: brandEase },
    scrollTrigger: {
      trigger: options.root,
      start: 'top top',
      end: '+=300%',
      scrub: true,
      pin: true,
      anticipatePin: 1,
      onEnter: () => {
        console.debug('[big-film-motion] scrollTrigger enter');
        attachLensToSection('film');
      },
      onEnterBack: () => {
        console.debug('[big-film-motion] scrollTrigger enterBack');
        attachLensToSection('film');
      },
      onLeave: () => {
        console.debug('[big-film-motion] scrollTrigger leave');
        attachLensToSection(null);
      },
      onLeaveBack: () => {
        console.debug('[big-film-motion] scrollTrigger leaveBack');
        attachLensToSection('logos');
      }
    }
  });

  const stops = [0.32, 0.66];
  stops.forEach((stop, index) => {
    const current = options.mediaNodes[index];
    const next = options.mediaNodes[index + 1];
    if (!current || !next) return;
    console.debug('[big-film-motion] stop configured', 'index', index, 'stop', stop);

    timeline
      .to(
        current,
        {
          clipPath: 'circle(0% at 50% 50%)',
          autoAlpha: 0.35,
          duration: 0.3
        },
        stop
      )
      .fromTo(
        next,
        { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 },
        { clipPath: 'circle(150% at 50% 50%)', autoAlpha: 1, duration: 0.35 },
        stop + 0.05
      )
      .call(() => options.onStepChange?.(index + 1), undefined, stop + 0.02)
      .fromTo(
        options.slab,
        { yPercent: 6, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.35 },
        stop + 0.05
      );
  });

  const detachExitPortal = attachFilmExitPortal({
    timeline,
    cards: options.mediaNodes,
    viewport: options.viewport,
    previewStories: options.previewStories,
    labelElement: options.labelElement,
    onPortalReady: options.onPortalReady
  });

  timeline.call(() => options.onComplete?.(), undefined, '+=0.2');
  registerAnimation('big-film:pin', timeline);
  console.debug('[big-film-motion] timeline ready', 'duration', timeline.duration());

  return () => {
    timelineDisposers.forEach((dispose) => dispose());
    timelineDisposers.length = 0;
    animations.forEach((animation) => animation.kill());
    attachLensToSection(null);
    detachExitPortal();
  };
}
