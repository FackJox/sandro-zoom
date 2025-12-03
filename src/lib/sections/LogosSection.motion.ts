import { gsap, brandEase, type ScrollOrchestrator } from '$lib/motion';
import { registerLensSegment, setLensSegmentProgress } from '$lib/motion/lensTimeline';
import type { PortalContext, PortalTimelineHandle } from '$lib/motion/portalStore';

interface LogosTimelineOptions {
  root: HTMLElement;
  rail: HTMLElement;
  netflixLogo: HTMLElement | null;
  portal: HTMLElement;
  metadata?: HTMLElement | null;
  portalLogo?: HTMLElement | null;
  portalVideo?: HTMLVideoElement | null;
  onPortalReady?: () => void;
  orchestrator?: ScrollOrchestrator;
  portalContext?: PortalContext;
}

export function initLogosTimelines(options: LogosTimelineOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  const animations: gsap.core.Animation[] = [];
  const timelineDisposers: Array<() => void> = [];
  console.debug(
    '[logos-motion] init',
    'hasRoot',
    Boolean(options.root),
    'hasRail',
    Boolean(options.rail),
    'hasMetadata',
    Boolean(options.metadata),
    'hasPortal',
    Boolean(options.portal),
    'hasNetflixLogo',
    Boolean(options.netflixLogo),
    'orchestrator',
    Boolean(options.orchestrator)
  );

  const logosSegment = registerLensSegment('logos', (tl, proxy, emit) => {
    tl.to(proxy, {
      xPercent: -6,
      yPercent: -55,
      scale: 0.6,
      opacity: 0.55,
      duration: 1,
      onUpdate: emit
    });
  });

  const registerAnimation = (name: string, animation: gsap.core.Animation) => {
    animations.push(animation);
    if (options.orchestrator) {
      timelineDisposers.push(
        options.orchestrator.registerSectionTimeline(name, () => animation)
      );
    }
  };

  const masterTimeline = gsap.timeline({
    defaults: { ease: brandEase },
    scrollTrigger: {
      trigger: options.root,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate(self) {
        setLensSegmentProgress(logosSegment, self.progress);
      }
    }
  });

  masterTimeline.to({}, { duration: 1 });
  registerAnimation('logos:master', masterTimeline);

  const railDrift = gsap.to(options.rail, {
    xPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: options.root,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });
  registerAnimation('logos:rail-drift', railDrift);

  const railEntry = gsap
    .timeline({
      defaults: { ease: brandEase },
      scrollTrigger: {
        trigger: options.root,
        start: 'top bottom',
        toggleActions: 'play none none reverse'
      }
    })
    .from(options.rail, { y: 50, opacity: 0, duration: 0.6 });
  registerAnimation('logos:rail-entry', railEntry);

  const portalCircle = options.portal;
  const portalLogoClone = options.portalLogo;
  const portalVideo = options.portalVideo;
  const netflix = options.netflixLogo;

  if (portalLogoClone && netflix) {
    portalLogoClone.textContent = netflix.textContent ?? '';
  }

  let portalHandle: PortalTimelineHandle | null = null;
  const repositionPortal = () => {
    if (portalHandle) {
      portalHandle.updatePosition();
      return;
    }
    if (!portalCircle || !netflix) return;
    const rect = netflix.getBoundingClientRect();
    portalCircle.style.left = `${rect.left + rect.width / 2}px`;
    portalCircle.style.top = `${rect.top + rect.height / 2}px`;
  };

  const portalTl = gsap.timeline({
    scrollTrigger: {
      trigger: options.root,
      start: 'top+=60% top',
      end: 'bottom top',
      scrub: true,
      onUpdate: () => repositionPortal()
    },
    defaults: { ease: brandEase }
  });

  if (options.portalContext) {
    portalHandle = options.portalContext.buildPortalTimeline({
      timeline: portalTl,
      getTargetRect: () => options.netflixLogo?.getBoundingClientRect() ?? null,
      textTarget: portalLogoClone ?? undefined,
      videoTarget: portalVideo ?? undefined,
      onReveal: options.onPortalReady
    });
  } else {
    portalTl
      .set(portalCircle, {
        opacity: 0,
        width: 48,
        height: 48,
        borderRadius: '999px'
      })
      .to(portalCircle, { opacity: 1, duration: 0.2 }, 0)
      .to(portalCircle, { width: '85vw', height: '48vw', duration: 0.9 }, 0.3)
      .to(portalCircle, { borderRadius: '24px', duration: 0.4 }, 0.5)
      .call(() => options.onPortalReady?.(), undefined, '>-0.05')
      .to(portalCircle, { opacity: 0, duration: 0.3 }, '+=0.1');

    if (portalLogoClone) {
      portalTl.to(portalLogoClone, { opacity: 0, duration: 0.3 }, 0.35);
    }

    if (portalVideo) {
      portalTl.set(portalVideo, { opacity: 0 });
      portalTl.to(portalVideo, { opacity: 1, duration: 0.4 }, 0.45);
    }
  }

  portalTl.to(options.root, { backgroundColor: 'var(--colors-blackStallion)' }, 0.3);
  portalTl.to(options.rail, { opacity: 0 }, 0.3);
  repositionPortal();

  registerAnimation('logos:portal', portalTl);

  // Continue animating the same MetadataStrip element that originated in Hero so the
  // shared-element morph feels seamless between sections.
  if (options.metadata) {
    const metadataTl = gsap.timeline({
      scrollTrigger: {
        trigger: options.root,
        start: 'top top',
        end: '+=120%',
        scrub: true
      }
    });

    metadataTl
      .set(options.metadata, {
        width: '100%',
        left: '0',
        position: 'relative'
      })
      .to(
        options.metadata,
        {
          yPercent: -10,
          backgroundColor: 'var(--colors-blackPearl)',
          borderColor: 'var(--colors-eggToast)'
        },
        0
      );
    registerAnimation('logos:metadata', metadataTl);
  }

  return () => {
    timelineDisposers.forEach((dispose) => dispose());
    timelineDisposers.length = 0;
    animations.forEach((animation) => animation.kill());
    portalHandle?.cleanup();
  };
}
