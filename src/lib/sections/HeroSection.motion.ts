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
  markMetadataDetached
} from '$lib/motion/metadata';

interface HeroTimelineOptions {
  root: HTMLElement;
  media: HTMLVideoElement;
  slab: HTMLElement;
  lens: HTMLElement;
  lensMedia: HTMLVideoElement | null;
  logoRail: HTMLElement;
  netflixLogo: HTMLElement | null;
  halo: HTMLElement;
  copyLines: Array<HTMLElement | null>;
  orchestrator?: ScrollOrchestrator;
}

export function initHeroTimelines(options: HeroTimelineOptions) {
  if (typeof window === 'undefined') {
    return;
  }

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
    'hasLogoRail',
    Boolean(options.logoRail),
    'copyCount',
    options.copyLines.filter(Boolean).length
  );
  const missingTargets: string[] = [];
  if (!options.root) missingTargets.push('root');
  if (!options.media) missingTargets.push('media');
  if (!options.lens) missingTargets.push('lens');
  if (!options.logoRail) missingTargets.push('logoRail');
  if (missingTargets.length) {
    console.warn('[hero-motion] missing targets -> skipping', missingTargets.join(', '));
    return () => {};
  }

  const heroSegment = registerLensSegment('hero', (tl, proxy, emit) => {
    // NOTE: opacity is NOT tweened here - it's controlled by morphTl at 95%
    // This prevents the Svelte reactive binding from showing lens early
    tl.to(proxy, {
      xPercent: -12,
      yPercent: -38,
      scale: 0.74,
      // opacity removed - controlled directly by GSAP in morphTl
      duration: 1,
      onUpdate: emit
    });
  });

  const copyTargets = options.copyLines.filter((node): node is HTMLElement => Boolean(node));

  const restoreHeroState = () => {
    markMetadataDetached(false);
    markLensElementDetached(false);
    attachLensToSection('hero');
    // Reset lens opacity back to hidden
    gsap.set(options.lens, { opacity: 0 });
    // Reset logo rail opacity
    gsap.set(options.logoRail, { opacity: 1 });
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
      // Note: Lens badge stays hidden (opacity: 0) until hero exit portal
      // It will be revealed when hero shrinks into it at ~92% scroll
      .from(options.logoRail, { y: 20, opacity: 0, duration: 0.4 }, '-=0.25');

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
      restoreHeroState();
    }

    // Handle enter/leave callbacks
    if (isActive && !wasActive) {
      console.debug('[hero-morph] onEnter');
    } else if (!isActive && wasActive && progress >= 0.95) {
      console.debug('[hero-morph] onLeave');
    } else if (!isActive && wasActive && progress <= 0.05) {
      restoreHeroState();
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

  // DEBUG: Log initial lens state
  console.log('[hero-morph] INIT lens element:', options.lens);
  console.log('[hero-morph] INIT lens opacity:', window.getComputedStyle(options.lens).opacity);
  gsap.set(options.lens, { opacity: 0 }); // Ensure lens starts hidden
  console.log('[hero-morph] INIT lens opacity after set:', window.getComputedStyle(options.lens).opacity);

  // Track if we've transitioned metadata from logos to credentials
  // (uses metadataTransitionedToCredentials declared earlier)

  // Helper to get lens badge center position for portal shrink target
  const getLensCenter = () => {
    const lensRect = options.lens.getBoundingClientRect();
    const cx = (lensRect.left + lensRect.width / 2) / window.innerWidth * 100;
    const cy = (lensRect.top + lensRect.height / 2) / window.innerHeight * 100;
    const radius = Math.max(lensRect.width, lensRect.height) / 2;
    return { cx, cy, radius };
  };

  // ============================================================
  // PHASE 1: 0-85% - Logo rail visible, idle state
  // ============================================================
  morphTl.to({}, { duration: 0.85 }); // Hold for first 85%

  // ============================================================
  // PHASE 2: 85-100% - Dual Portal Exit
  // Hero shrinks into lens badge position, lens fades in
  // ============================================================

  // 85-90%: Begin hero contraction and darkening
  morphTl
    .to(options.root, {
      scale: 0.92,
      filter: 'brightness(0.75)',
      duration: 0.05,
      ease: brandEase
    }, 0.85);

  // 90-98%: Hero shrinks via clip-path toward lens position
  morphTl.to(options.root, {
    clipPath: () => {
      const { cx, cy, radius } = getLensCenter();
      return `circle(${radius}px at ${cx}% ${cy}%)`;
    },
    scale: 0.85,
    filter: 'brightness(0.6)',
    duration: 0.08,
    ease: brandEase
  }, 0.90);

  // 95-98%: Lens badge appears as hero shrinks into it (tighter timing)
  morphTl
    .call(() => {
      console.log('[hero-morph] 0.95: LENS REVEAL START');
      console.log('[hero-morph] 0.95: lens opacity before:', window.getComputedStyle(options.lens).opacity);
    }, [], 0.95)
    .to(options.lens, {
      opacity: 1,
      duration: 0.03,
      ease: brandEase,
      onComplete: () => {
        console.log('[hero-morph] 0.98: LENS REVEAL COMPLETE, opacity:', window.getComputedStyle(options.lens).opacity);
      }
    }, 0.95);

  // Lens media zooms out to show more content
  if (options.lensMedia) {
    morphTl.to(options.lensMedia, { scale: 1.0, duration: 0.03 }, 0.95);
  }

  // 96-100%: Final hero clip to nothing, hand off to logos section
  morphTl
    .call(() => {
      console.log('[hero-morph] 0.96: HERO CLIP TO 0% START');
      console.log('[hero-morph] 0.96: root clipPath:', window.getComputedStyle(options.root).clipPath);
    }, [], 0.96)
    .to(options.root, {
      clipPath: 'circle(0% at 50% 50%)',
      opacity: 0,
      duration: 0.04,
      onComplete: () => {
        console.log('[hero-morph] 1.00: HERO DISAPPEARED');
        console.log('[hero-morph] 1.00: root opacity:', window.getComputedStyle(options.root).opacity);
        console.log('[hero-morph] 1.00: root clipPath:', window.getComputedStyle(options.root).clipPath);
      }
    }, 0.96)
    .call(() => {
      console.log('[hero-morph] 0.98: HANDOFF TO LOGOS');
      // Hand off to logos section
      markMetadataDetached(true);
      markLensElementDetached(true);
      attachLensToSection('logos');
      console.log('[hero-morph] 0.98: metadataDetached=true, lensDetached=true, lensAttachment=logos');
    }, [], 0.98);

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
  };
}
