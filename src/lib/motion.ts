import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

let registered = false;

function ensureRegistered() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

// auto-register when module loads in the browser so components using gsap immediately work
ensureRegistered();

export function registerGsap() {
  ensureRegistered();
}

export const brandEase = 'cubic-bezier(0.19, 1, 0.22, 1)';

export { gsap, ScrollTrigger };
