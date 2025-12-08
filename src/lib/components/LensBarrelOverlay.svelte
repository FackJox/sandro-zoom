<script lang="ts">
  /**
   * LensBarrelOverlay - Framework 2 §3.2
   * Thin ring UI (like lens barrel) with tick marks and text labels
   * Appears during card transitions to reinforce camera lens metaphor
   */
  import { css } from '$styled-system/css';
  import { token } from '$styled-system/tokens';

  export let visible = false;
  export let label = '';
  export let tickCount = 12;

  // Generate tick positions around the circle
  $: ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360;
    return { angle, isLong: i % 3 === 0 };
  });

  const overlayClass = css({
    position: 'absolute',
    inset: '-8px',
    borderRadius: '999px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&[data-visible="true"]': {
      opacity: 1
    }
  });

  const ringClass = css({
    position: 'absolute',
    inset: 0,
    borderRadius: '999px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'accent'
  });

  const innerRingClass = css({
    position: 'absolute',
    inset: '4px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'coverOfNight'
  });

  const tickClass = css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '1px',
    transformOrigin: 'center center',
    backgroundColor: 'accent'
  });

  const labelClass = css({
    position: 'absolute',
    fontFamily: 'plex',
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: 'accent',
    whiteSpace: 'nowrap'
  });

  const topLabelClass = css({
    top: '6px',
    left: '50%',
    transform: 'translateX(-50%)'
  });

  const bottomLabelClass = css({
    bottom: '6px',
    left: '50%',
    transform: 'translateX(-50%)'
  });
</script>

<div class={overlayClass} data-visible={visible}>
  <!-- Outer ring -->
  <div class={ringClass}></div>

  <!-- Inner ring -->
  <div class={innerRingClass}></div>

  <!-- Tick marks -->
  {#each ticks as tick}
    <div
      class={tickClass}
      style="
        height: {tick.isLong ? '8px' : '4px'};
        transform: rotate({tick.angle}deg) translateY(calc(-50% - {tick.isLong ? '4px' : '2px'})) translateX(-50%);
        margin-top: calc(-50% + 2px);
      "
    ></div>
  {/each}

  <!-- Labels -->
  {#if label}
    {@const parts = label.split(' / ')}
    <span class="{labelClass} {topLabelClass}">{parts[0] || ''}</span>
    {#if parts[1]}
      <span class="{labelClass} {bottomLabelClass}">{parts[1]}</span>
    {/if}
  {/if}
</div>
