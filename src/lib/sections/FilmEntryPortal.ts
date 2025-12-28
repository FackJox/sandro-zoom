import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
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
  portalFrame?: HTMLElement | null;
  portalHeading?: HTMLElement | null;
  lensBarrelEl?: HTMLElement | null;
  onLensBarrelVisibleChange?: (visible: boolean) => void;
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
  console.log('[film-portal] createPortalTimeline called');

  if (typeof window === 'undefined') {
    return () => {};
  }

  const context = options.portalContext ?? createPortalContext('logos');
  const target = wrapLogoTarget(options.logoEl);

  console.log('[film-portal] targets:', {
    hasRoot: !!options.root,
    hasRail: !!options.rail,
    hasTarget: !!target,
    hasLogoEl: !!options.logoEl,
    logoElRect: options.logoEl?.getBoundingClientRect()
  });

  if (!options.root || !options.rail || !target) {
    console.warn('[film-portal] missing targets, skipping portal timeline');
    return () => {};
  }

  if (options.portalLogoClone && options.logoEl) {
    options.portalLogoClone.textContent = options.logoEl.textContent ?? '';
  }

  let portalHandle: PortalTimelineHandle | null = null;

  // Create paused timeline - will be driven by master scroll controller
  // This coordinates with hero exit: hero shrinks at 90-100%, logos portal expands at 0-20%
  const timeline = gsap.timeline({
    defaults: { ease: brandEase },
    paused: true
  });

  console.log('[film-portal] building portal timeline with context:', context.id);
  console.log('[film-portal] target rect:', target.getBoundingClientRect());

  portalHandle = context.buildPortalTimeline({
    timeline,
    getTargetRect: () => {
      const rect = target.getBoundingClientRect();
      console.log('[film-portal] getTargetRect called, rect:', rect);
      return rect;
    },
    textTarget: options.portalLogoClone ?? undefined,
    videoTarget: options.portalVideo ?? undefined,
    frameElement: options.portalFrame ?? undefined,
    headingElement: options.portalHeading ?? undefined,
    lensBarrelElement: options.lensBarrelEl ?? undefined,
    onLensBarrelVisibleChange: options.onLensBarrelVisibleChange,
    onReveal: () => {
      console.log('[film-portal] onReveal callback fired');
      options.onComplete?.();
    }
  });

  console.log('[film-portal] portal handle created');

  // Framework 2 §3.2: "The rest of the logos strip fades slightly"
  // When the portal circle appears over Netflix, other logos should dim
  timeline
    .fromTo(
      options.rail,
      { scale: 1, opacity: 1 },
      { scale: 0.92, opacity: 0.15, duration: 0.5, ease: 'power2.out' },
      0.1 // Start fading when portal appears
    )
    .to(options.rail, { opacity: 0, scale: 0.85, duration: 0.3 }, 0.5)
    .to(options.root, { filter: 'brightness(0.6)', duration: 0.4 }, 0.1);

  // Register with master scroll controller for progress updates
  // Portal expands during first 25% of logos section (simultaneous with hero shrink at 90-100%)
  const unsubscribeMaster = masterScrollController.onSectionProgress('logos', (progress) => {
    // Map 0-25% logos progress to 0-100% portal timeline progress
    const portalProgress = Math.min(1, progress / 0.25);

    // DEBUG: Log portal progress
    if (portalProgress < 1) {
      console.log('[film-portal] logos progress:', progress.toFixed(3), '-> portal progress:', portalProgress.toFixed(3));
    }

    timeline.progress(portalProgress);

    // Update portal position dynamically
    if (portalProgress > 0 && portalProgress < 1) {
      portalHandle?.updatePosition();
    }
  });

  const disposeTimeline = options.orchestrator
    ? options.orchestrator.registerSectionTimeline('logos:portal', () => timeline)
    : () => timeline.kill();

  return () => {
    unsubscribeMaster();
    disposeTimeline();
    portalHandle?.cleanup();
    context.reset();
  };
}
