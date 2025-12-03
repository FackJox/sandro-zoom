import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

let registered = false;

function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

// Auto-register in browser contexts so GSAP helpers are ready for components.
ensureRegistered();

export function registerGsap() {
  ensureRegistered();
}

export { gsap, ScrollTrigger };
