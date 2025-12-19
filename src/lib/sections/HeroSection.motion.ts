import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
import {
  registerLensSegment,
  setLensSegmentProgress,
  tweenLensProxy,
  lensDefaultState,
  markLensElementDetached,
  attachLensToSection
} from '$lib/motion/lensTimeline';
import {
  HERO_METADATA,
  LOGOS_METADATA,
  markMetadataDetached,
  popMetadataState,
  pushMetadataState,
  setCurrentMetadata
} from '$lib/motion/metadata';

interface HeroTimelineOptions {
  root: HTMLElement;
  media: HTMLVideoElement;
  slab: HTMLElement;
  lens: HTMLElement;
  lensMedia: HTMLVideoElement | null;
  metadata: HTMLElement;
  halo: HTMLElement;
  strips: Array<HTMLVideoElement | null>;
  copyLines: Array<HTMLElement | null>;
  orchestrator?: ScrollOrchestrator;
}

export function initHeroTimelines(options: HeroTimelineOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  setCurrentMetadata(HERO_METADATA);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations: gsap.core.Animation[] = [];
  const triggers: ScrollTrigger[] = [];
  console.debug(
    '[hero-motion] init',
    'hasRoot',
    Boolean(options.root),
    'hasMedia',
    Boolean(options.media),
    'hasLens',
    Boolean(options.lens),
    'hasMetadata',
    Boolean(options.metadata),
    'stripCount',
    options.strips.filter(Boolean).length,
    'copyCount',
    options.copyLines.filter(Boolean).length
  );
  const missingTargets: string[] = [];
  if (!options.root) missingTargets.push('root');
  if (!options.media) missingTargets.push('media');
  if (!options.lens) missingTargets.push('lens');
  if (!options.metadata) missingTargets.push('metadata');
  if (missingTargets.length) {
    console.warn('[hero-motion] missing targets -> skipping', missingTargets.join(', '));
    return () => {};
  }

  const heroSegment = registerLensSegment('hero', (tl, proxy, emit) => {
    tl.to(proxy, {
      xPercent: -12,
      yPercent: -38,
      scale: 0.74,
      opacity: 0.68,
      duration: 1,
      onUpdate: emit
    });
  });

  const sliceElements = options.strips.filter(Boolean);

  const copyTargets = options.copyLines.filter((node): node is HTMLElement => Boolean(node));

  let logosMetadataActive = false;

  const restoreHeroMetadata = () => {
    if (logosMetadataActive) {
      popMetadataState('logos');
      logosMetadataActive = false;
    } else {
      setCurrentMetadata(HERO_METADATA);
    }
    markMetadataDetached(false);
    markLensElementDetached(false);
    attachLensToSection('hero');
    gsap.set(options.metadata, {
      clearProps: 'transform,backgroundColor,color,borderColor,letterSpacing,paddingTop,paddingBottom,opacity'
    });
  };

  let introTl: gsap.core.Timeline | null = null;
  const ctx = gsap.context(() => {
    introTl = gsap.timeline({ defaults: { ease: brandEase } });

    introTl
      .from(options.media, { opacity: 0, scale: 1.02, duration: 0.8 })
      .fromTo(
        options.slab,
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: 0.6 },
        '-=0.45'
      )
      .from(options.lens, { scale: 0.8, opacity: 0, duration: 0.4 }, '-=0.35')
      .from(options.metadata, { y: 20, opacity: 0, duration: 0.4 }, '-=0.25');

    // Set lens media to initial zoomed-in state for later zoom-out during portal
    if (options.lensMedia) {
      gsap.set(options.lensMedia, { scale: 1.1 });
    }

    if (copyTargets.length > 0) {
      introTl.from(
        copyTargets,
        { yPercent: 15, opacity: 0, duration: 0.35, stagger: 0.05 },
        '-=0.15'
      );
    }
  }, options.root);

  const heroTimelineDisposers: Array<() => void> = [];

  const registerAnimation = (name: string, animation: gsap.core.Animation) => {
    animations.push(animation);
    if (options.orchestrator) {
      heroTimelineDisposers.push(
        options.orchestrator.registerSectionTimeline(name, () => animation)
      );
    }
  };

  if (introTl) {
    registerAnimation('hero:intro', introTl);
  }

  // Create paused timeline - controlled by master scroll controller
  const morphTl = gsap.timeline({
    defaults: { ease: brandEase },
    paused: true
  });

  // Track active state for callbacks
  let wasActive = false;

  // Register with master scroll controller for progress updates
  const unsubscribeMaster = masterScrollController.onSectionProgress('hero', (progress, isActive) => {
    morphTl.progress(progress);
    setLensSegmentProgress(heroSegment, progress);

    if (progress <= 0.05) {
      restoreHeroMetadata();
    }

    // Handle enter/leave callbacks
    if (isActive && !wasActive) {
      console.debug('[hero-morph] onEnter');
    } else if (!isActive && wasActive && progress >= 0.95) {
      console.debug('[hero-morph] onLeave');
    } else if (!isActive && wasActive && progress <= 0.05) {
      restoreHeroMetadata();
      console.debug('[hero-morph] onLeaveBack');
    }
    wasActive = isActive;

    console.debug(
      '[hero-morph] update',
      'progress',
      Number(progress.toFixed(3)),
      'isActive',
      isActive
    );
  });

  // Register section element with master controller
  const unregisterSection = masterScrollController.registerSection('hero', options.root, morphTl);

  console.debug('[hero-morph] timeline created (paused, master-controlled)');

  // Set initial clip-path for circular contraction animation
  gsap.set(options.root, { clipPath: 'circle(100% at 50% 50%)' });

  morphTl
    .to({}, { duration: 0.25 })
    .to(
      options.root,
      {
        scale: 0.9,
        filter: 'brightness(0.72)',
        clipPath: 'circle(35% at 50% 50%)',  // Contract simultaneously with scale/darken
        transformOrigin: 'center center'
      },
      '-=0.02'
    )
    // Halo expands outward from lens during portal transition, then fades
    .to(options.halo, { opacity: 0.6, scale: 1.8, duration: 0.3 }, '<')
    .to(options.halo, { opacity: 0.9, scale: 2.4, duration: 0.25 }, '>')
    .to(options.lensMedia, { scale: 1.0, duration: 0.5 }, '<-0.3')
    .to(
      options.metadata,
      {
        yPercent: -240,
        backgroundColor: 'var(--colors-blackPearl)',
        color: 'var(--colors-eggToast)',
        borderColor: 'var(--colors-eggToast)',
        letterSpacing: '0.18em'
      },
      '>-0.05'
    )
    .to(
      options.metadata,
      {
        paddingTop: '0.75rem',
        paddingBottom: '0.5rem'
      },
      0
    )
    .to(options.metadata, { opacity: 0, duration: 0.2 }, '>-0.05')
    .call(() => {
      if (!logosMetadataActive) {
        pushMetadataState({ id: 'logos', text: LOGOS_METADATA });
        logosMetadataActive = true;
      } else {
        setCurrentMetadata(LOGOS_METADATA);
      }
      markMetadataDetached(true);
      markLensElementDetached(true);
      attachLensToSection('logos');
    })
    .to(options.metadata, { opacity: 1, duration: 0.2 }, '>-0.05')
    .to(options.halo, { opacity: 0, duration: 0.2 }, '>-0.1')
    // Final clip-path shrink to nothing
    .to(options.root, {
      clipPath: 'circle(0% at 50% 50%)',
      opacity: 0,
      duration: 0.25
    }, '>');

  registerAnimation('hero:morph', morphTl);

  if (!prefersReducedMotion) {
    // Add parallax animations to morphTl (all progress-driven, no individual ScrollTriggers)

    // Slab parallax - add to timeline with relative position
    morphTl.to(options.slab, {
      yPercent: -4,
      ease: 'none',
      duration: 1
    }, 0);

    // Lens parallax - integrated with morphTl progress
    morphTl.to({}, {
      duration: 0.8,
      onUpdate: function() {
        const progress = this.progress();
        Object.assign(lensDefaultState, { idleOffset: -6 * progress });
      }
    }, 0);

    // Circular strip masks parallax - each strip drifts at different speeds during progress
    sliceElements.forEach((slice, index) => {
      const depthMultiplier = 1 + index * 0.5;
      morphTl.to(slice, {
        yPercent: -15 * depthMultiplier,
        xPercent: (index % 2 ? 8 : -6) * depthMultiplier,
        rotation: index % 2 ? 12 : -10,
        ease: 'none',
        duration: 1
      }, 0);
    });

    // Media drift - standalone continuous animation (not scroll-driven)
    const mediaDrift = gsap.to(options.media, {
      scale: 1.04,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
    registerAnimation('hero:mediaDrift', mediaDrift);
  } else {
    Object.assign(lensDefaultState, { idleOffset: 0 });
  }

  return () => {
    // Clean up master scroll subscriptions
    unsubscribeMaster();
    unregisterSection();

    ctx.revert();
    heroTimelineDisposers.forEach((dispose) => dispose());
    heroTimelineDisposers.length = 0;
    triggers.forEach((trigger) => trigger.kill());
    animations.forEach((animation) => animation.kill());
    if (logosMetadataActive) {
      popMetadataState('logos');
      logosMetadataActive = false;
    }
  };
}
