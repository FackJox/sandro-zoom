import { gsap, brandEase } from '$lib/motion';

/**
 * Services → FinalContact Transition
 *
 * This module provides supplementary animation utilities for the Services → FinalContact transition.
 * The main 3D camera zoom-out effect is implemented in CameraZoomOutOverlay.svelte.
 *
 * Framework 5 §3 implementation:
 * - CameraZoomOutOverlay handles the 3D plane animation (scale, rotate, translate)
 * - Services content shrinks into camera LCD position
 * - Camera body and scenic background are revealed
 * - This module handles the final contact text entrance animation
 *
 * @see src/lib/components/CameraZoomOutOverlay.svelte for the main 3D transition
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
 * Attach entrance animation for FinalContact section
 *
 * Called when Services section completes. Works in coordination with
 * CameraZoomOutOverlay which handles the 3D camera reveal animation.
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
