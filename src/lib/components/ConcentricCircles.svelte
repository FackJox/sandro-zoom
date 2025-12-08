<script lang="ts">
  /**
   * ConcentricCircles - Framework 2 §3.6
   * Series of concentric circles (like lens rings) that appear during exit transitions
   * Thin outlines in Egg Toast / Silverplate
   */
  import { css } from '$styled-system/css';

  export let ringCount = 4;
  export let visible = false;
  export let scale = 1;

  // Generate ring configurations
  $: rings = Array.from({ length: ringCount }, (_, i) => {
    const baseSize = 60 + i * 40; // Rings get progressively larger
    const isAccent = i === 0 || i === ringCount - 1; // First and last are accent color
    return {
      size: baseSize,
      color: isAccent ? 'accent' : 'silverplate',
      opacity: 1 - (i * 0.15), // Outer rings slightly more transparent
      delay: i * 50 // Stagger animation
    };
  });

  const containerClass = css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.4s ease',
    '&[data-visible="true"]': {
      opacity: 1
    }
  });

  const ringClass = css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: '999px',
    borderWidth: '1px',
    borderStyle: 'solid',
    transform: 'translate(-50%, -50%)',
    transition: 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
  });
</script>

<div class={containerClass} data-visible={visible}>
  {#each rings as ring, i}
    <div
      class={ringClass}
      style="
        width: {ring.size * scale}px;
        height: {ring.size * scale}px;
        border-color: var(--colors-{ring.color});
        opacity: {ring.opacity};
        transition-delay: {ring.delay}ms;
      "
    ></div>
  {/each}
</div>
