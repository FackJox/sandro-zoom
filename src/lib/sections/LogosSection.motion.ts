import { gsap, ScrollTrigger, brandEase } from '$lib/motion';
import { registerLensSegment, setLensSegmentProgress } from '$lib/motion/lensTimeline';

interface LogosTimelineOptions {
  root: HTMLElement;
  rail: HTMLElement;
  netflixLogo: HTMLElement | null;
  portal: HTMLElement;
  metadata?: HTMLElement | null;
  portalLogo?: HTMLElement | null;
  portalVideo?: HTMLVideoElement | null;
  onPortalReady?: () => void;
}

export function initLogosTimelines(options: LogosTimelineOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  const animations: gsap.core.Animation[] = [];
  const triggers: ScrollTrigger[] = [];

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

  const pin = ScrollTrigger.create({
    trigger: options.root,
    start: 'top top',
    end: '+=200%',
    pin: true,
    scrub: true,
    anticipatePin: 1,
    onUpdate(self) {
      setLensSegmentProgress(logosSegment, self.progress);
    }
  });
  triggers.push(pin);

  animations.push(
    gsap.to(options.rail, {
      xPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: options.root,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  );

  const portalCircle = options.portal;
  const portalLogoClone = options.portalLogo;
  const portalVideo = options.portalVideo;
  const netflix = options.netflixLogo;

  if (portalLogoClone && netflix) {
    portalLogoClone.textContent = netflix.textContent ?? '';
  }

  const updateCirclePosition = () => {
    if (!portalCircle || !netflix) return;
    const rect = netflix.getBoundingClientRect();
    portalCircle.style.left = `${rect.left + rect.width / 2}px`;
    portalCircle.style.top = `${rect.top + rect.height / 2}px`;
  };

  const portalTl = gsap
    .timeline({
      scrollTrigger: {
        trigger: options.root,
        start: 'top+=60% top',
        end: 'bottom top',
        scrub: true,
        onUpdate: () => updateCirclePosition()
      },
      defaults: { ease: brandEase }
    })
    .set(portalCircle, { opacity: 0, width: 48, height: 48, borderRadius: '999px' })
    .to(portalCircle, { opacity: 1, duration: 0.2 }, 0)
    .to(options.root, { backgroundColor: 'var(--colors-blackStallion)' }, 0.3)
    .to(options.rail, { opacity: 0 }, 0.3)
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

  updateCirclePosition();

  animations.push(portalTl);

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

    animations.push(metadataTl);
  }

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    animations.forEach((animation) => animation.kill());
  };
}
