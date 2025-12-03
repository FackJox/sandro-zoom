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

    timeline
      .set(
        portal,
        {
          opacity: 0,
          width: 48,
          height: 48,
          borderRadius: '999px',
          transform: 'translate(-50%, -50%)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 10
        },
        0
      )
      .to(portal, { opacity: 1, duration: 0.2 }, 0)
      .to(
        portal,
        {
          width: options.expandWidth ?? '85vw',
          height: options.expandHeight ?? '48vw',
          duration: 0.9
        },
        0.3
      )
      .to(portal, { borderRadius: '24px', duration: 0.4 }, 0.5)
      .call(() => options.onReveal?.(), undefined, '>-0.05')
      .to(portal, { opacity: 0, duration: 0.3 }, '+=0.1');

    if (options.textTarget) {
      timeline.to(options.textTarget, { opacity: 0, duration: 0.3 }, 0.35);
    }

    if (options.videoTarget) {
      timeline.set(options.videoTarget, { opacity: 0 }, 0.3);
      timeline.to(options.videoTarget, { opacity: 1, duration: 0.4 }, 0.45);
    }

    const updatePosition = () => {
      positionOver(options.getTargetRect());
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
