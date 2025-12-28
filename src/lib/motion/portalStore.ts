import { writable, get, type Writable } from 'svelte/store';
import { gsap, brandEase } from '$lib/motion';

export interface PortalTimelineOptions {
  getTargetRect: () => DOMRect | null;
  textTarget?: HTMLElement | null;
  videoTarget?: HTMLVideoElement | null;
  onReveal?: () => void;
  timeline?: gsap.core.Timeline;
  expandWidth?: number | string;
  expandHeight?: number | string;
  frameWidth?: number | string;
  frameHeight?: number | string;
  frameElement?: HTMLElement | null;
  headingElement?: HTMLElement | null;
  lensBarrelElement?: HTMLElement | null;
  onLensBarrelVisibleChange?: (visible: boolean) => void;
}

export interface PortalTimelineHandle {
  timeline: gsap.core.Timeline;
  updatePosition: () => void;
  cleanup: () => void;
}

export interface PortalContext {
  id: string;
  element: Writable<HTMLElement | null>;
  content: Writable<HTMLElement | null>;
  attachElement: (node: HTMLElement | null) => void;
  attachContent: (node: HTMLElement | null) => void;
  buildPortalTimeline: (options: PortalTimelineOptions) => PortalTimelineHandle;
  positionOver: (rect: DOMRect | null) => void;
  reset: () => void;
}

const contexts = new Map<string, PortalContext>();

export function createPortalContext(id = 'primary'): PortalContext {
  const existing = contexts.get(id);
  if (existing) return existing;

  const element = writable<HTMLElement | null>(null);
  const content = writable<HTMLElement | null>(null);

  const attachElement = (node: HTMLElement | null) => element.set(node);
  const attachContent = (node: HTMLElement | null) => content.set(node);

  const positionOver = (rect: DOMRect | null) => {
    const portal = get(element);
    if (!portal || !rect) return;
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    portal.style.left = `${x}px`;
    portal.style.top = `${y}px`;
  };

  const buildPortalTimeline = (
    options: PortalTimelineOptions
  ): PortalTimelineHandle => {
    const portal = get(element);
    if (!portal) {
      throw new Error(`[portal:${id}] Portal element not registered`);
    }

    const timeline =
      options.timeline ??
      gsap.timeline({
        defaults: { ease: brandEase }
      });

    // Calculate starting position from target rect (e.g., Netflix logo)
    const getStartClipPath = () => {
      const rect = options.getTargetRect();
      console.log('[portalStore] getStartClipPath - rect:', rect);
      if (!rect) return 'circle(0% at 50% 50%)';
      const cx = (rect.left + rect.width / 2) / window.innerWidth * 100;
      const cy = (rect.top + rect.height / 2) / window.innerHeight * 100;
      const clipPath = `circle(0% at ${cx}% ${cy}%)`;
      console.log('[portalStore] getStartClipPath - clipPath:', clipPath);
      return clipPath;
    };

    console.log('[portalStore] buildPortalTimeline - portal element:', portal);
    console.log('[portalStore] buildPortalTimeline - initial clipPath:', getStartClipPath());

    // Simplified portal animation using only circular clip-path
    // Per Brand Physics: circular iris transitions, no rectangular frames
    timeline
      .set(portal, {
        clipPath: getStartClipPath(),
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',  // Remove yellow border during animation
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        zIndex: 10,
        opacity: 0  // Start hidden until timeline plays
      }, 0)
      // Fade in at start of animation
      .to(portal, { opacity: 1, duration: 0.15 }, 0)
      // Expand circular iris from logo position to full viewport
      .to(portal, {
        clipPath: 'circle(100% at 50% 50%)',
        duration: 0.8,
        ease: brandEase,
        onUpdate: function() {
          if (this.progress() < 0.1 || this.progress() > 0.9) {
            console.log('[portalStore] portal clipPath expanding, progress:', this.progress().toFixed(3));
          }
        }
      }, 0)
      // Show lens barrel during expansion
      .call(() => {
        console.log('[portalStore] 0.2: showing lens barrel');
        options.onLensBarrelVisibleChange?.(true);
      }, undefined, 0.2)
      // Hide lens barrel near end
      .call(() => {
        console.log('[portalStore] 0.7: hiding lens barrel');
        options.onLensBarrelVisibleChange?.(false);
      }, undefined, 0.7)
      // Reveal callback
      .call(() => {
        console.log('[portalStore] 0.75: onReveal callback');
        options.onReveal?.();
      }, undefined, 0.75)
      // Fade out portal overlay (content now visible behind)
      .to(portal, { opacity: 0, duration: 0.3 }, 0.85);

    // Crossfade: Netflix logo → video inside the expanding circle
    if (options.textTarget) {
      timeline.to(options.textTarget, { opacity: 0, duration: 0.3 }, 0.1);
    }

    if (options.videoTarget) {
      timeline.set(options.videoTarget, { opacity: 0 }, 0);
      timeline.to(options.videoTarget, { opacity: 1, duration: 0.4 }, 0.15);
    }

    // Frame and heading elements (if needed for BigFilmSection)
    if (options.frameElement) {
      timeline.set(options.frameElement, { opacity: 0, scale: 1.02 }, 0);
      timeline.to(options.frameElement, { opacity: 1, scale: 1, duration: 0.3 }, 0.6);
    }

    if (options.headingElement) {
      timeline.set(options.headingElement, { opacity: 0, yPercent: 20 }, 0);
      timeline.to(options.headingElement, { opacity: 1, yPercent: 0, duration: 0.3 }, 0.7);
    }

    const updatePosition = () => {
      // Update clip-path center if position changes
      const rect = options.getTargetRect();
      if (rect && portal) {
        const cx = (rect.left + rect.width / 2) / window.innerWidth * 100;
        const cy = (rect.top + rect.height / 2) / window.innerHeight * 100;
        // Only update if timeline hasn't started yet
        if (timeline.progress() === 0) {
          gsap.set(portal, { clipPath: `circle(0% at ${cx}% ${cy}%)` });
        }
      }
    };

    const cleanup = () => reset();

    return { timeline, updatePosition, cleanup };
  };

  const reset = () => {
    const portal = get(element);
    if (portal) {
      gsap.set(portal, { clearProps: 'all' });
    }
  };

  const ctx: PortalContext = {
    id,
    element,
    content,
    attachElement,
    attachContent,
    buildPortalTimeline,
    positionOver: (rect) => positionOver(rect),
    reset
  };

  contexts.set(id, ctx);
  return ctx;
}

export function getPortalContext(id = 'primary') {
  return contexts.get(id) ?? null;
}
