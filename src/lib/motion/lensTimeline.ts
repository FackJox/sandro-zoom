import { writable, type Writable } from 'svelte/store';
import { gsap, brandEase } from '$lib/motion';

export interface LensState {
  xPercent: number;
  yPercent: number;
  scale: number;
  opacity: number;
  idleOffset: number;
}

export interface LensSegment {
  name: string;
  start: number;
  end: number;
}

export const lensDefaultState: LensState = {
  xPercent: 0,
  yPercent: 0,
  scale: 1,
  opacity: 0,  // Hidden initially - revealed when hero shrinks into it
  idleOffset: 0
};

export interface LensController {
  id: string;
  state: Writable<LensState>;
  element: Writable<HTMLElement | null>;
  home: Writable<HTMLElement | null>;
  detached: Writable<boolean>;
  attachment: Writable<string | null>;
  registerSegment: (
    name: string,
    build: (tl: gsap.core.Timeline, state: LensState, emit: () => void) => void
  ) => LensSegment;
  setSegmentProgress: (segment: LensSegment, progress: number) => void;
  tweenState: (vars: gsap.TweenVars) => gsap.core.Tween;
  reset: () => void;
  attach: (node: HTMLElement | null) => void;
  attachHome: (node: HTMLElement | null) => void;
  markDetached: (detached: boolean) => void;
  attachToSection: (sectionId: string | null) => void;
}

const controllers = new Map<string, LensController>();

export function createLensController(id: string): LensController {
  const existing = controllers.get(id);
  if (existing) {
    return existing;
  }

  const state = writable<LensState>({ ...lensDefaultState });
  const element = writable<HTMLElement | null>(null);
  const home = writable<HTMLElement | null>(null);
  const detached = writable(false);
  const attachment = writable<string | null>(null);

  let proxy: LensState = { ...lensDefaultState };
  let timeline: gsap.core.Timeline | null = null;
  const segments = new Map<string, LensSegment>();

  const emit = () => state.set({ ...proxy });

  const ensureTimeline = () => {
    if (!timeline) {
      timeline = gsap.timeline({
        paused: true,
        defaults: { ease: brandEase }
      });
    }
    return timeline;
  };

  const registerSegment: LensController['registerSegment'] = (name, build) => {
    const existing = segments.get(name);
    if (existing) {
      return existing;
    }

    const tl = ensureTimeline();
    const start = tl.totalDuration();
    build(tl, proxy, emit);
    const end = tl.totalDuration();
    const segment: LensSegment = { name, start, end };
    segments.set(name, segment);
    return segment;
  };

  const setSegmentProgress: LensController['setSegmentProgress'] = (
    segment,
    progress
  ) => {
    if (!timeline) return;
    const clamped = Math.min(1, Math.max(0, progress));
    const segmentDuration = segment.end - segment.start;
    if (segmentDuration <= 0) return;
    const absolute = segment.start + segmentDuration * clamped;
    const total = timeline.totalDuration();
    if (total === 0) return;
    timeline.totalProgress(absolute / total);
    emit();
  };

  const tweenState: LensController['tweenState'] = (vars) =>
    gsap.to(proxy, { ...vars, onUpdate: emit });

  const reset: LensController['reset'] = () => {
    timeline?.kill();
    timeline = null;
    segments.clear();
    proxy = { ...lensDefaultState };
    emit();
  };

  const attach: LensController['attach'] = (node) => element.set(node);
  const attachHome: LensController['attachHome'] = (node) => home.set(node);
  const markDetached: LensController['markDetached'] = (value) =>
    detached.set(value);
  const attachToSection: LensController['attachToSection'] = (sectionId) =>
    attachment.set(sectionId);

  const controller: LensController = {
    id,
    state,
    element,
    home,
    detached,
    attachment,
    registerSegment,
    setSegmentProgress,
    tweenState,
    reset,
    attach,
    attachHome,
    markDetached,
    attachToSection
  };

  controllers.set(id, controller);
  return controller;
}

const defaultLensController = createLensController('hero');

export function getLensController(id: string) {
  return controllers.get(id) ?? null;
}

export function resetLensTimeline() {
  defaultLensController.reset();
}

export function registerLensSegment(
  name: string,
  build: (tl: gsap.core.Timeline, state: LensState, emit: () => void) => void
): LensSegment {
  return defaultLensController.registerSegment(name, build);
}

export function setLensSegmentProgress(segment: LensSegment, progress: number) {
  defaultLensController.setSegmentProgress(segment, progress);
}

export function tweenLensProxy(vars: gsap.TweenVars) {
  return defaultLensController.tweenState(vars);
}

export function setLensElement(node: HTMLElement | null) {
  defaultLensController.attach(node);
}

export function setLensHome(node: HTMLElement | null) {
  defaultLensController.attachHome(node);
}

export function markLensElementDetached(detached: boolean) {
  defaultLensController.markDetached(detached);
}

export function attachLensToSection(sectionId: string | null) {
  defaultLensController.attachToSection(sectionId);
}

export const lensState = defaultLensController.state;
export const lensElement = defaultLensController.element;
export const lensHome = defaultLensController.home;
export const lensDetached = defaultLensController.detached;
export const lensAttachment = defaultLensController.attachment;
export const heroLensController = defaultLensController;
