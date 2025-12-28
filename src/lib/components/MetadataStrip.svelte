<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cx, css } from '$styled-system/css';
  import { metadataStrip } from '$lib/styles/recipes';

  export let text: string | null = null;
  export let variant: 'hero' | 'logos' = 'hero';
  export let ref: HTMLDivElement | null = null;
  export let scanLineRef: HTMLDivElement | null = null;
  export let ariaLabel: HTMLAttributes<HTMLDivElement>['aria-label'] | undefined = undefined;

  let root: HTMLDivElement;
  let scanLine: HTMLDivElement;
  let computedAria = ariaLabel ?? text ?? undefined;

  $: computedAria = ariaLabel ?? text ?? undefined;
  $: ref = root;
  $: scanLineRef = scanLine;

  onDestroy(() => {
    ref = null;
    scanLineRef = null;
  });

  const wrapper = css({
    position: 'relative',
    letterSpacing: '0.14em',
    textAlign: 'center',
    overflow: 'hidden'
  });

  const scanLineStyle = css({
    position: 'absolute',
    left: 0,
    top: 0,
    width: '2px',
    height: '100%',
    backgroundColor: 'eggToast',
    transform: 'translateX(-100%)',
    pointerEvents: 'none',
    zIndex: 2,
    opacity: 0
  });
</script>

<div
  class={cx(wrapper, metadataStrip({ variant }))}
  bind:this={root}
  aria-label={computedAria}
  {...$$restProps}
>
  <div class={scanLineStyle} bind:this={scanLine} aria-hidden="true"></div>
  <slot>{text}</slot>
</div>
