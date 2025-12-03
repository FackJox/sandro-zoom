import type ScrollSmoother from 'gsap/ScrollSmoother';
import { gsap, registerGsap, ScrollTrigger } from './gsapRegistry';

export const SCROLL_ORCHESTRATOR_CONTEXT_KEY = Symbol('scroll-orchestrator');

interface SectionTimelineContext {
  gsap: typeof gsap;
}

export interface SectionTimelineConfig {
  name: string;
  build: (ctx: SectionTimelineContext) => gsap.core.Animation;
}

export type SectionTimelineHandle = {
  name: string;
  animation: gsap.core.Animation;
  dispose: () => void;
  registeredAt: number;
};

const timelineRegistry = new Map<string, SectionTimelineHandle>();
let smootherInstance: ScrollSmoother | null = null;
let fallbackTickerCleanup: (() => void) | null = null;
let shellIdCounter = 0;
let activeShellId: number | null = null;

type ScrollSmootherConstructor = typeof import('gsap/ScrollSmoother')['default'];
type ScrollSmootherModuleShape = {
  default?: ScrollSmootherConstructor;
  ScrollSmoother?: ScrollSmootherConstructor;
};

let scrollSmootherCtorPromise: Promise<ScrollSmootherConstructor | null> | null =
  null;

function buildContext(): SectionTimelineContext {
  // Always register GSAP plugins before building timelines.
  registerGsap();
  return { gsap };
}

export function registerSectionTimeline(
  name: string,
  build: (ctx: SectionTimelineContext) => gsap.core.Animation
): () => void {
  const context = buildContext();
  const animation = build(context);
  const dispose = () => {
    cleanupSectionTimeline(name);
  };

  const handle: SectionTimelineHandle = {
    name,
    animation,
    dispose,
    registeredAt:
      typeof performance !== 'undefined' ? performance.now() : Date.now()
  };

  // Replace existing section timelines so hot reloads do not stack animations.
  cleanupSectionTimeline(name);
  timelineRegistry.set(name, handle);

  return dispose;
}

export function cleanupSectionTimeline(name: string) {
  const handle = timelineRegistry.get(name);
  if (!handle) return;

  // Kill timeline to detach ScrollTrigger hooks and observers.
  handle.animation.kill();
  timelineRegistry.delete(name);
}

export function getTimeline(name: string): gsap.core.Animation | undefined {
  return timelineRegistry.get(name)?.animation;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function cleanupScrollShellResources() {
  if (smootherInstance) {
    smootherInstance.kill();
    smootherInstance = null;
  }

  if (fallbackTickerCleanup) {
    fallbackTickerCleanup();
    fallbackTickerCleanup = null;
  }
}

function startFallbackTicker() {
  const tick = () => ScrollTrigger.update();
  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
  };
}

async function loadScrollSmootherConstructor(): Promise<ScrollSmootherConstructor | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!scrollSmootherCtorPromise) {
    scrollSmootherCtorPromise = import('gsap/ScrollSmoother')
      .then((module) => {
        const shape = module as ScrollSmootherModuleShape;
        const ctor = shape.default ?? shape.ScrollSmoother;
        if (ctor) {
          gsap.registerPlugin(ctor);
          return ctor;
        }
        return null;
      })
      .catch((error) => {
        console.warn('[motion] Failed to load ScrollSmoother, falling back', error);
        return null;
      });
  }

  return scrollSmootherCtorPromise ?? Promise.resolve(null);
}

export type ScrollOrchestrator = {
  registerSectionTimeline: typeof registerSectionTimeline;
  getTimeline: typeof getTimeline;
  cleanupSectionTimeline: typeof cleanupSectionTimeline;
  getSmoother: () => ScrollSmoother | null;
};

export function getSmoother() {
  return smootherInstance;
}

export function initScrollShell(
  wrapper: HTMLElement,
  content?: HTMLElement
): () => void {
  registerGsap();
  const shellId = ++shellIdCounter;
  activeShellId = shellId;
  const resolvedContent = content ?? wrapper;

  cleanupScrollShellResources();

  const reducedMotion = prefersReducedMotion();
  console.debug(
    '[motion] initScrollShell',
    'shellId',
    shellId,
    'hasWrapper',
    Boolean(wrapper),
    'hasContent',
    Boolean(resolvedContent),
    'reducedMotion',
    reducedMotion
  );
  if (reducedMotion) {
    console.info('[motion] prefers-reduced-motion detected, skipping ScrollSmoother');
    fallbackTickerCleanup = startFallbackTicker();
    return () => {
      if (activeShellId === shellId) {
        cleanupScrollShellResources();
        activeShellId = null;
      }
    };
  }

  void loadScrollSmootherConstructor().then((ctor) => {
    if (activeShellId !== shellId) {
      return;
    }

    if (!ctor) {
      fallbackTickerCleanup = startFallbackTicker();
      return;
    }

    try {
      smootherInstance = ctor.create({
        wrapper,
        content: resolvedContent,
        smooth: 1.2,
        normalizeScroll: true,
        effects: true
      });
    } catch (error) {
      console.warn('[motion] ScrollSmoother initialization failed, using ticker fallback', error);
      smootherInstance = null;
      fallbackTickerCleanup = startFallbackTicker();
    }
  });

  return () => {
    if (activeShellId === shellId) {
      cleanupScrollShellResources();
      activeShellId = null;
    }
  };
}

export const scrollOrchestrator: ScrollOrchestrator = {
  registerSectionTimeline,
  getTimeline,
  cleanupSectionTimeline,
  getSmoother
};
