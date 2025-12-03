import { writable } from 'svelte/store';
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
  opacity: 1,
  idleOffset: 0
};

const lensState = writable<LensState>({ ...lensDefaultState });

let proxy: LensState = { ...lensDefaultState };
let timeline: gsap.core.Timeline | null = null;
const segments = new Map<string, LensSegment>();
const lensElementStore = writable<HTMLElement | null>(null);
const lensHomeStore = writable<HTMLElement | null>(null);
const lensDetachedStore = writable(false);

function emit() {
  lensState.set({ ...proxy });
}

function ensureTimeline() {
  if (!timeline) {
    timeline = gsap.timeline({
      paused: true,
      defaults: { ease: brandEase }
    });
  }
  return timeline;
}

export function resetLensTimeline() {
  timeline?.kill();
  timeline = null;
  segments.clear();
  proxy = { ...lensDefaultState };
  emit();
}

export function registerLensSegment(
  name: string,
  build: (tl: gsap.core.Timeline, state: LensState, emit: () => void) => void
): LensSegment {
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
}

export function setLensSegmentProgress(segment: LensSegment, progress: number) {
  if (!timeline) return;
  const clamped = Math.min(1, Math.max(0, progress));
  const segmentDuration = segment.end - segment.start;
  if (segmentDuration <= 0) return;
  const absolute = segment.start + segmentDuration * clamped;
  const total = timeline.totalDuration();
  if (total === 0) return;
  timeline.totalProgress(absolute / total);
  emit();
}

export function tweenLensProxy(vars: gsap.TweenVars) {
  return gsap.to(proxy, { ...vars, onUpdate: emit });
}

export function setLensElement(node: HTMLElement | null) {
  lensElementStore.set(node);
}

export function setLensHome(node: HTMLElement | null) {
  lensHomeStore.set(node);
}

export function markLensElementDetached(detached: boolean) {
  lensDetachedStore.set(detached);
}

export { lensState, lensElementStore as lensElement, lensHomeStore as lensHome, lensDetachedStore as lensDetached };
