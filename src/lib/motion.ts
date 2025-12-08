export { registerGsap, gsap, ScrollTrigger } from '$lib/motion/gsapRegistry';
export * from '$lib/motion/orchestrator';
export * from '$lib/motion/masterScroll';
export * from '$lib/motion/transitions/gridFlipTransition';
export * from '$lib/motion/transitions/servicesToFinalContact';

export const brandEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

// Context key for master scroll controller
export const MASTER_SCROLL_CONTEXT_KEY = Symbol('master-scroll');
