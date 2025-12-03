import { gsap, ScrollTrigger, brandEase, type ScrollOrchestrator } from '$lib/motion';
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
  const heroSegment = registerLensSegment('hero', (tl, proxy, emit) => {
    tl.to(proxy, {
      xPercent: 12,
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
      .from(options.slab, { yPercent: 15, opacity: 0, duration: 0.6 }, '-=0.45')
      .from(options.lens, { scale: 0.8, opacity: 0, duration: 0.4 }, '-=0.35')
      .from(options.metadata, { y: 20, opacity: 0, duration: 0.4 }, '-=0.25');

    if (copyTargets.length > 0) {
      introTl.from(
        copyTargets,
        { yPercent: 15, opacity: 0, duration: 0.35, stagger: 0.08 },
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

  const morphTl = gsap.timeline({
    defaults: { ease: brandEase },
    scrollTrigger: {
      trigger: options.root,
      start: 'top top',
      end: '+=240%',
      scrub: true,
      pin: true,
      anticipatePin: 1,
      onUpdate(self) {
        setLensSegmentProgress(heroSegment, self.progress);
        if (self.progress <= 0.05) {
          restoreHeroMetadata();
        }
      },
      onLeaveBack() {
        restoreHeroMetadata();
      }
    }
  });

  morphTl
    .to({}, { duration: 0.25 })
    .to(
      options.root,
      {
        scale: 0.9,
        filter: 'brightness(0.72)',
        transformOrigin: 'center center'
      },
      '-=0.02'
    )
    .to(options.halo, { opacity: 0.8, scale: 1.2, duration: 0.4 }, '<')
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
    .to(options.halo, { opacity: 0, duration: 0.2 }, '>-0.1');

  if (morphTl.scrollTrigger) {
    triggers.push(morphTl.scrollTrigger);
  }

  registerAnimation('hero:morph', morphTl);

  if (!prefersReducedMotion) {
    const slabParallax = gsap.to(options.slab, {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: options.root,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
    registerAnimation('hero:slabParallax', slabParallax);

    const lensParallax = tweenLensProxy({
      idleOffset: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: options.root,
        start: 'top top',
        end: 'bottom-=20% top',
        scrub: true
      }
    });
    registerAnimation('hero:lensParallax', lensParallax);

    sliceElements.forEach((slice, index) => {
      const stripTween = gsap.to(slice, {
        yPercent: -10 - index * 5,
        xPercent: index * 4,
        rotation: index % 2 ? 10 : -8,
        ease: 'none',
        scrollTrigger: {
          trigger: options.root,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
      registerAnimation(`hero:strip-${index}`, stripTween);
    });

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
