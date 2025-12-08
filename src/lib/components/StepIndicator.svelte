<script lang="ts">
  import { css } from '$styled-system/css';
  import { stepIndicatorItem, stepIndicatorBase, stepIndicatorActive } from '$lib/styles/recipes';
  import { gsap, brandEase } from '$lib/motion';
  import { onMount, afterUpdate } from 'svelte';

  export let steps: string[] = [];
  export let activeIndex = 0;

  let activeOverlays: HTMLElement[] = [];
  let prevActiveIndex = -1;

  const wrapper = css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  });

  // Animate mask wipe when activeIndex changes
  function animateMaskWipe(fromIndex: number, toIndex: number) {
    // Reset all overlays to hidden
    activeOverlays.forEach((overlay, idx) => {
      if (idx !== toIndex && overlay) {
        gsap.set(overlay, { clipPath: 'inset(0 100% 0 0)' });
      }
    });

    // Animate the new active overlay with a hard mask wipe
    const targetOverlay = activeOverlays[toIndex];
    if (targetOverlay) {
      gsap.fromTo(
        targetOverlay,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.25,
          ease: brandEase
        }
      );
    }

    // Animate the old overlay out (wipe left-to-right reveal of inactive)
    if (fromIndex >= 0 && fromIndex !== toIndex) {
      const oldOverlay = activeOverlays[fromIndex];
      if (oldOverlay) {
        gsap.to(oldOverlay, {
          clipPath: 'inset(0 0% 0 100%)',
          duration: 0.2,
          ease: brandEase
        });
      }
    }
  }

  onMount(() => {
    // Set initial state - active overlay visible for initial index
    activeOverlays.forEach((overlay, idx) => {
      if (overlay) {
        gsap.set(overlay, {
          clipPath: idx === activeIndex ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)'
        });
      }
    });
    prevActiveIndex = activeIndex;
  });

  afterUpdate(() => {
    if (prevActiveIndex !== activeIndex && prevActiveIndex !== -1) {
      animateMaskWipe(prevActiveIndex, activeIndex);
    }
    prevActiveIndex = activeIndex;
  });
</script>

<div class={wrapper} role="list" aria-label="Scroll progress">
  {#each steps as label, index}
    <span
      class={stepIndicatorItem()}
      role="listitem"
      aria-current={index === activeIndex ? 'step' : undefined}
    >
      <!-- Base layer (inactive appearance) -->
      <span class={stepIndicatorBase()}>{label}</span>
      <!-- Active overlay (clips in with mask wipe) -->
      <span
        class={stepIndicatorActive()}
        bind:this={activeOverlays[index]}
        aria-hidden="true"
      >{label}</span>
    </span>
  {/each}
</div>
