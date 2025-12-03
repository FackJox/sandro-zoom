<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cx, css } from '$styled-system/css';
  import { lensBadge } from '$lib/styles/recipes';

  export let size = 52;
  export let label: string | null = null;
  export let tone: 'solid' | 'ghost' = 'solid';
  export let ref: HTMLDivElement | null = null;
  export let ariaLabel: HTMLAttributes<HTMLDivElement>['aria-label'] | undefined = undefined;
  export let mediaSrc: string | null = null;

  let root: HTMLDivElement;
  let computedAria = ariaLabel ?? label ?? undefined;

  $: computedAria = ariaLabel ?? label ?? undefined;

  $: ref = root;

  onDestroy(() => {
    ref = null;
  });

  const wrapper = css({
    position: 'relative',
    isolation: 'isolate'
  });

  const slice = css({
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    borderWidth: '1px',
    borderStyle: 'solid',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    opacity: 0.6
  });

  const sliceFg = css({
    borderColor: 'eggToast'
  });

  const sliceBg = css({
    borderColor: 'coverOfNight',
    opacity: 0.35,
    transform: 'scale(0.92)'
  });

  const mediaClass = css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    borderRadius: 'inherit',
    objectFit: 'cover',
    mixBlendMode: tone === 'solid' ? 'multiply' : 'screen',
    opacity: 0.85
  });

  const labelClass = css({
    fontWeight: 600,
    letterSpacing: '0.14em',
    position: 'absolute',
    left: '0.35rem',
    right: '0.35rem',
    bottom: '0.2rem',
    borderRadius: '999px',
    backgroundColor: 'rgba(15, 23, 26, 0.65)',
    fontSize: '0.45rem',
    textAlign: 'center',
    paddingInline: '0.25rem'
  });
</script>

<div
  class={cx(wrapper, lensBadge({ tone }))}
  bind:this={root}
  style={`width:${size}px;height:${size}px;`}
  aria-label={computedAria}
  {...$$restProps}
>
  {#if mediaSrc}
    <video class={mediaClass} src={mediaSrc} autoplay muted loop playsinline></video>
  {/if}
  <div class={cx('lens-slice', slice, sliceBg)} data-depth="bg" aria-hidden="true"></div>
  <div class={cx('lens-slice', slice, sliceFg)} data-depth="fg" aria-hidden="true"></div>

  {#if label}
    <span class={labelClass}>{label}</span>
  {:else}
    <slot />
  {/if}
</div>
