import { gsap, brandEase, type ScrollOrchestrator } from '$lib/motion';
import {
  createPortalContext,
  type PortalContext,
  type PortalTimelineHandle
} from '$lib/motion/portalStore';

type CreatePortalTimelineOptions = {
  root: HTMLElement;
  rail: HTMLElement;
  logoEl: HTMLElement | null;
  portalContext?: PortalContext;
  portalLogoClone?: HTMLElement | null;
  portalVideo?: HTMLVideoElement | null;
  orchestrator?: ScrollOrchestrator;
  onComplete?: () => void;
};

function wrapLogoTarget(logoEl: HTMLElement | null) {
  if (!logoEl) return null;
  const existing = logoEl.querySelector<HTMLElement>('.logo__portal-target');
  if (existing) {
    return existing;
  }

  const wrapper = document.createElement('span');
  wrapper.classList.add('logo__portal-target');
  wrapper.style.display = 'inline-flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.position = 'relative';

  while (logoEl.firstChild) {
    wrapper.appendChild(logoEl.firstChild);
  }

  logoEl.appendChild(wrapper);
  return wrapper;
}

export function createPortalTimeline(options: CreatePortalTimelineOptions) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const context = options.portalContext ?? createPortalContext('logos');
  const target = wrapLogoTarget(options.logoEl);
  if (!options.root || !options.rail || !target) {
    console.warn('[film-portal] missing targets, skipping portal timeline');
    return () => {};
  }

  if (options.portalLogoClone && options.logoEl) {
    options.portalLogoClone.textContent = options.logoEl.textContent ?? '';
  }

  let portalHandle: PortalTimelineHandle | null = null;
  const timeline = gsap.timeline({
    defaults: { ease: brandEase },
    scrollTrigger: {
      trigger: options.root,
      start: 'bottom bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: () => portalHandle?.updatePosition()
    }
  });

  portalHandle = context.buildPortalTimeline({
    timeline,
    getTargetRect: () => target.getBoundingClientRect(),
    textTarget: options.portalLogoClone ?? undefined,
    videoTarget: options.portalVideo ?? undefined,
    onReveal: options.onComplete
  });

  timeline
    .fromTo(
      options.rail,
      { scale: 1, opacity: 1 },
      { scale: 0.9, opacity: 0.25, duration: 0.6 },
      0
    )
    .to(options.rail, { opacity: 0, duration: 0.3 }, '>-0.2')
    .to(options.root, { backgroundColor: 'var(--colors-blackStallion)' }, 0.2)
    .to(options.root, { filter: 'brightness(0.65)' }, 0.35);

  const disposeTimeline = options.orchestrator
    ? options.orchestrator.registerSectionTimeline('logos:portal', () => timeline)
    : () => timeline.kill();

  return () => {
    disposeTimeline();
    portalHandle?.cleanup();
    context.reset();
  };
}
