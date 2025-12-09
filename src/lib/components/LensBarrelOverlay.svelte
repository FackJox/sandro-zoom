<script lang="ts">
  /**
   * LensBarrelOverlay - Framework 2 §3.2
   *
   * Lens barrel UI overlay with tick marks that appears during card transitions.
   * Mimics camera lens barrel with small tick marks and label text.
   */
  import { css } from '$styled-system/css';
  import { gsap } from '$lib/motion';
  import { onMount } from 'svelte';

  export let visible = false;
  export let label = '';

  let root: HTMLElement;
  let wasVisible = false;

  $: if (root && visible !== wasVisible) {
    if (visible) {
      gsap.fromTo(
        root,
        { autoAlpha: 0, scale: 0.96 },
        { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'cubic-bezier(0.19, 1, 0.22, 1)' }
      );
    } else {
      gsap.to(root, { autoAlpha: 0, duration: 0.18, ease: 'power2.in' });
    }
    wasVisible = visible;
  }

  // Generate tick marks around the lens barrel (16 ticks)
  const tickCount = 16;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360;
    const isCardinal = i % 4 === 0;
    return { angle, isCardinal };
  });

  const overlay = css({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0,
    visibility: 'hidden'
  });

  const ring = css({
    position: 'absolute',
    inset: '4px',
    borderRadius: '4px',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: 'eggToast',
    opacity: 0.7
  });

  const tickBase = css({
    position: 'absolute',
    width: '1px',
    backgroundColor: 'eggToast',
    transformOrigin: '50% 100%',
    opacity: 0.6
  });

  const tickMajor = css({
    height: '8px',
    opacity: 0.9
  });

  const tickMinor = css({
    height: '5px'
  });

  const labelWrap = css({
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'bg/70',
    paddingInline: '0.5rem',
    paddingBlock: '0.15rem',
    borderRadius: '2px'
  });

  const labelText = css({
    fontFamily: 'trade',
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'eggToast',
    whiteSpace: 'nowrap'
  });
</script>

<div class={overlay} bind:this={root}>
  <!-- Lens barrel ring -->
  <div class={ring}></div>

  <!-- Tick marks around the ring -->
  {#each ticks as tick}
    <div
      class="{tickBase} {tick.isCardinal ? tickMajor : tickMinor}"
      style="
        top: 2px;
        left: calc(50% - 0.5px);
        transform: rotate({tick.angle}deg) translateY(-2px);
      "
    ></div>
  {/each}

  <!-- Label at bottom -->
  {#if label}
    <div class={labelWrap}>
      <span class={labelText}>{label}</span>
    </div>
  {/if}
</div>
