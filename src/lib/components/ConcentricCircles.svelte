<script lang="ts">
  /**
   * ConcentricCircles - Framework 2 §3.6
   *
   * Concentric ring overlay that appears during exit transitions.
   * Creates lens ring effect as the viewport zooms out to reveal the reel strip.
   * Uses Egg Toast and Silverplate colors per Brand Design System.
   */
  import { css } from '$styled-system/css';
  import { gsap } from '$lib/motion';

  export let visible = false;
  export let scale = 1;
  export let ringCount = 4;

  let root: HTMLElement;
  let wasVisible = false;

  // Generate ring configurations with alternating colors
  $: rings = Array.from({ length: ringCount }, (_, i) => {
    const index = i + 1;
    // Rings expand outward: 20%, 35%, 50%, 65% of container
    const size = 20 + index * 15;
    // Alternate between eggToast and silverplate
    const color = i % 2 === 0 ? 'eggToast' : 'silverplate';
    // Fade opacity outward
    const opacity = 0.6 - i * 0.1;
    return { size, color, opacity };
  });

  $: if (root && visible !== wasVisible) {
    if (visible) {
      gsap.fromTo(
        root,
        { autoAlpha: 0, scale: 0.9 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.26,
          ease: 'cubic-bezier(0.19, 1, 0.22, 1)'
        }
      );
      // Stagger ring reveals
      const ringEls = root.querySelectorAll('[data-ring]');
      gsap.fromTo(
        ringEls,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: (i) => rings[i]?.opacity ?? 0.4,
          duration: 0.24,
          stagger: 0.06,
          ease: 'cubic-bezier(0.19, 1, 0.22, 1)'
        }
      );
    } else {
      gsap.to(root, { autoAlpha: 0, duration: 0.2, ease: 'power2.in' });
    }
    wasVisible = visible;
  }

  // Update scale when it changes
  $: if (root && visible && scale !== 1) {
    gsap.to(root, {
      scale,
      duration: 0.3,
      ease: 'cubic-bezier(0.19, 1, 0.22, 1)'
    });
  }

  const overlay = css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    opacity: 0,
    visibility: 'hidden'
  });

  const ringBase = css({
    position: 'absolute',
    borderRadius: '50%',
    borderWidth: '1.5px',
    borderStyle: 'solid'
  });

  const ringEggToast = css({
    borderColor: 'eggToast'
  });

  const ringSilverplate = css({
    borderColor: 'silverplate'
  });
</script>

<div class={overlay} bind:this={root}>
  {#each rings as ring, i}
    <div
      class="{ringBase} {ring.color === 'eggToast' ? ringEggToast : ringSilverplate}"
      data-ring={i}
      style="
        width: {ring.size}%;
        height: {ring.size}%;
        opacity: {ring.opacity};
      "
    ></div>
  {/each}
</div>
