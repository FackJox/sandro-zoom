import { gsap, brandEase } from '$lib/motion';

/**
 * Services → FinalContact Transition (Placeholder)
 *
 * Simplified version: portal mask expansion only.
 *
 * TODO: Future implementation per Framework 5 §3
 * - Services content becomes 3D plane
 * - Animates with perspective (rotateX, rotateY, translateZ)
 * - Shrinks and drifts down-right
 * - Becomes camera LCD screen
 * - 3D camera body reveals around it
 * - Scenic background appears behind camera
 */

type ServicesToFinalContactOptions = {
  servicesTimeline: gsap.core.Timeline;
  finalContactTimeline: gsap.core.Timeline;
  servicesRoot: HTMLElement;
  ctaElement: HTMLElement;
  contactBlock?: HTMLElement;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
};

/**
 * Attach simplified portal transition from Services to FinalContact
 *
 * This is a placeholder implementation. The full Framework 5 design
 * includes a 3D camera zoom-out effect where the services section
 * shrinks into a camera LCD screen.
 */
export function attachServicesToFinalContactTransition(options: ServicesToFinalContactOptions) {
  const exitStart = 0.85;

  // Simple transition: just notify callbacks
  options.servicesTimeline.call(
    () => options.onTransitionStart?.(),
    undefined,
    exitStart
  );

  // Entrance animation for FinalContact
  const entranceStart = 0.1;

  // Contact block fades in (if provided)
  if (options.contactBlock) {
    options.finalContactTimeline.fromTo(
      options.contactBlock,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.5, ease: brandEase },
      entranceStart
    );
  }

  // Transition complete callback
  options.finalContactTimeline.call(
    () => options.onTransitionComplete?.(),
    undefined,
    entranceStart + 0.5
  );

  return () => {
    // Cleanup if needed
  };
}
