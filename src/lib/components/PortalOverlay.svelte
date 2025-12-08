<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { css } from '$styled-system/css';
  import { gsap, brandEase } from '$lib/motion';
  import { writable } from 'svelte/store';

  // Portal state store for external control
  export const portalState = writable<{
    active: boolean;
    position: { x: number; y: number };
    size: number;
    targetPosition?: { x: number; y: number };
    targetSize?: number;
  }>({
    active: false,
    position: { x: 0, y: 0 },
    size: 48
  });

  let portalMask: HTMLDivElement | null = null;
  let portalTimeline: gsap.core.Timeline | null = null;

  const portalMaskClass = css({
    position: 'fixed',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    opacity: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    zIndex: 100,
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(15, 23, 26, 0.5)'
  });

  /**
   * Animate the portal from one position/size to another
   */
  export function animatePortal(options: {
    from: { x: number; y: number; size: number };
    to: { x: number; y: number; size: number };
    duration?: number;
    onComplete?: () => void;
  }) {
    if (!portalMask) return;

    portalTimeline?.kill();
    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });

    portalTimeline
      .set(portalMask, {
        opacity: 1,
        width: options.from.size,
        height: options.from.size,
        left: options.from.x,
        top: options.from.y
      })
      .to(portalMask, {
        left: options.to.x,
        top: options.to.y,
        duration: options.duration ?? 0.45
      })
      .to(
        portalMask,
        {
          width: options.to.size,
          height: options.to.size,
          duration: (options.duration ?? 0.45) * 1.1
        },
        '<0.1'
      )
      .to(portalMask, { opacity: 0, duration: 0.3 }, '>-0.15')
      .call(() => options.onComplete?.());
  }

  /**
   * Expand the portal from a point to fill the viewport
   */
  export function expandPortal(options: {
    from: { x: number; y: number; size?: number };
    duration?: number;
    onComplete?: () => void;
  }) {
    if (!portalMask) return;

    const viewportSize = Math.max(window.innerWidth, window.innerHeight) * 1.6;

    portalTimeline?.kill();
    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });

    portalTimeline
      .set(portalMask, {
        opacity: 1,
        width: options.from.size ?? 48,
        height: options.from.size ?? 48,
        left: options.from.x,
        top: options.from.y
      })
      .to(portalMask, {
        width: viewportSize,
        height: viewportSize,
        duration: options.duration ?? 0.6
      })
      .to(portalMask, { opacity: 0, duration: 0.3 }, '>-0.15')
      .call(() => options.onComplete?.());
  }

  /**
   * Collapse the portal from viewport to a point
   */
  export function collapsePortal(options: {
    to: { x: number; y: number; size?: number };
    duration?: number;
    onComplete?: () => void;
  }) {
    if (!portalMask) return;

    const viewportSize = Math.max(window.innerWidth, window.innerHeight) * 1.6;

    portalTimeline?.kill();
    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });

    portalTimeline
      .set(portalMask, {
        opacity: 1,
        width: viewportSize,
        height: viewportSize,
        left: window.innerWidth / 2,
        top: window.innerHeight / 2
      })
      .to(portalMask, {
        width: options.to.size ?? 48,
        height: options.to.size ?? 48,
        left: options.to.x,
        top: options.to.y,
        duration: options.duration ?? 0.6
      })
      .to(portalMask, { opacity: 0, duration: 0.3 }, '>-0.1')
      .call(() => options.onComplete?.());
  }

  /**
   * Reset the portal to hidden state
   */
  export function resetPortal() {
    portalTimeline?.kill();
    if (portalMask) {
      gsap.set(portalMask, { opacity: 0 });
    }
  }

  onDestroy(() => {
    portalTimeline?.kill();
    portalTimeline = null;
  });
</script>

<div class={portalMaskClass} bind:this={portalMask} aria-hidden="true"></div>
