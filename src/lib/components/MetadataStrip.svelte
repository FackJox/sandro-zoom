<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cx, css } from '$styled-system/css';
  import { metadataStrip } from '$lib/styles/recipes';

  export let text: string | null = null;
  export let variant: 'hero' | 'logos' = 'hero';
  export let ref: HTMLDivElement | null = null;
  export let ariaLabel: HTMLAttributes<HTMLDivElement>['aria-label'] | undefined = undefined;

  let root: HTMLDivElement;
  let computedAria = ariaLabel ?? text ?? undefined;

  $: computedAria = ariaLabel ?? text ?? undefined;
  $: ref = root;

  onDestroy(() => {
    ref = null;
  });

  const wrapper = css({
    letterSpacing: '0.14em',
    textAlign: 'center'
  });
</script>

<div
  class={cx(wrapper, metadataStrip({ variant }))}
  bind:this={root}
  aria-label={computedAria}
  {...$$restProps}
>
  <slot>{text}</slot>
</div>
