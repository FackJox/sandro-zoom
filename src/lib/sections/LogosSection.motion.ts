import { gsap, brandEase, type ScrollOrchestrator } from '$lib/motion';
import { registerLensSegment, setLensSegmentProgress } from '$lib/motion/lensTimeline';

interface LogosTimelineOptions {
  root: HTMLElement;
  rail: HTMLElement;
  metadata?: HTMLElement | null;
  orchestrator?: ScrollOrchestrator;
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
    'orchestrator',
    Boolean(options.orchestrator)
  );

  const missingTargets: string[] = [];
  if (!options.root) missingTargets.push('root');
  if (!options.rail) missingTargets.push('rail');
  if (!options.metadata) missingTargets.push('metadata');
  if (missingTargets.length) {
    console.warn('[logos-motion] missing targets -> skipping', missingTargets.join(', '));
    return () => {};
  }

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
  };
}
