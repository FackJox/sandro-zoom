<script lang="ts">
  import { onDestroy, onMount, createEventDispatcher } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import FrameBorder from '$lib/components/FrameBorder.svelte';
  import { lensElement, lensHome, lensDetached } from '$lib/motion/lensTimeline';
  import { metadataNode, metadataDetached, metadataHome } from '$lib/motion/metadata';
  import { initLogosTimelines } from './LogosSection.motion';

  const logos = [
    'Berghaus',
    'Osprey',
    'Red Bull TV',
    'Epic TV',
    'Netflix',
    'BBC',
    'The North Face',
    'Black Crows',
    'FP',
    'Scarpa'
  ];

  let root: HTMLElement;
  let rail: HTMLElement;
  let netflixLogo: HTMLElement | null = null;
  let portal: HTMLDivElement;
  let metadataStrip: HTMLElement | null = null;
  let metadataHost: HTMLDivElement;
  let lensHost: HTMLDivElement;
  let portalLogoClone: HTMLSpanElement;
  let portalVideo: HTMLVideoElement;
  const portalVideoSrc = '/videos/wix-video.mp4';

  let destroy: (() => void) | undefined;
  let mounted = false;
  let metadataDetachedState = false;
  let lensReady = false;
  let lensNode: HTMLElement | null = null;
  let lensHomeNode: HTMLElement | null = null;
  let metadataHomeNode: HTMLElement | null = null;
  let railHome: HTMLElement | null = null;
  const dispatch = createEventDispatcher<{ 'portal:film-ready': { progress: number } }>();

  function attachMetadata() {
    if (!metadataStrip) return;

    const target = metadataDetachedState ? metadataHost : metadataHomeNode;
    if (!target) return;

    if (metadataStrip.parentElement !== target) {
      target.appendChild(metadataStrip);
    }

    if (metadataDetachedState) {
      metadataStrip.style.marginTop = '0';
      metadataStrip.style.paddingBottom = '0.75rem';
    } else {
      metadataStrip.style.marginTop = '';
      metadataStrip.style.paddingBottom = '';
      metadataStrip.style.paddingTop = '';
      metadataStrip.style.backgroundColor = '';
      metadataStrip.style.color = '';
      metadataStrip.style.borderColor = '';
      metadataStrip.style.letterSpacing = '';
    }

    syncRail();
  }

  function syncRail() {
    if (!rail) return;
    if (!railHome && rail.parentElement) {
      railHome = rail.parentElement as HTMLElement;
    }

    if (metadataDetachedState && metadataStrip) {
      if (rail.parentElement !== metadataStrip) {
        metadataStrip.appendChild(rail);
      }
      rail.style.opacity = '1';
    } else if (railHome) {
      if (rail.parentElement !== railHome) {
        railHome.appendChild(rail);
      }
      rail.style.opacity = '0';
    }
  }

  function attachLens() {
    if (!lensNode) return;
    if (lensReady && lensHost && lensNode.parentElement !== lensHost) {
      lensHost.appendChild(lensNode);
    } else if (!lensReady && lensHomeNode && lensNode.parentElement !== lensHomeNode) {
      lensHomeNode.appendChild(lensNode);
    }
  }

  function initIfReady() {
    if (!mounted || !metadataStrip || !metadataDetachedState || destroy) return;
    destroy = initLogosTimelines({
      root,
      rail,
      netflixLogo,
      portal,
      metadata: metadataStrip,
      portalLogo: portalLogoClone,
      portalVideo,
      onPortalReady: () => dispatch('portal:film-ready', { progress: 1 })
    });
  }

  const metadataUnsub = metadataNode.subscribe((node) => {
    metadataStrip = node;
    attachMetadata();
    if (destroy) {
      destroy();
      destroy = undefined;
    }
    initIfReady();
  });

  const detachedUnsub = metadataDetached.subscribe((value) => {
    metadataDetachedState = value;
    if (!metadataDetachedState && destroy) {
      destroy();
      destroy = undefined;
    }
    attachMetadata();
    attachLens();
    syncRail();
    initIfReady();
  });

  const metadataHomeUnsub = metadataHome.subscribe((node) => {
    metadataHomeNode = node;
    attachMetadata();
  });

  const lensElementUnsub = lensElement.subscribe((node) => {
    lensNode = node;
    attachLens();
  });

  const lensHomeUnsub = lensHome.subscribe((node) => {
    lensHomeNode = node;
    attachLens();
  });

  const lensDetachedUnsub = lensDetached.subscribe((value) => {
    lensReady = value;
    attachMetadata();
    attachLens();
  });

  onMount(() => {
    mounted = true;
    attachMetadata();
    attachLens();
    initIfReady();
  });

  onDestroy(() => {
    destroy?.();
    metadataUnsub();
    detachedUnsub();
    metadataHomeUnsub();
    lensElementUnsub();
    lensHomeUnsub();
    lensDetachedUnsub();
  });

  const section = css({
    position: 'relative',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '2.5rem', md: '3rem' },
    backgroundColor: 'bg',
    overflow: 'hidden'
  });

  const band = css({
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'blackPearl',
    borderRadius: '12px',
    minHeight: { base: '35vh', md: '28vh' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    px: { base: '1rem', md: '2rem' }
  });

  const metadataDock = css({
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  });

  const railClass = css({
    display: 'flex',
    gap: { base: '1.5rem', md: '2.5rem' },
    py: '1rem',
    whiteSpace: 'nowrap',
    flexWrap: { base: 'wrap', md: 'nowrap' },
    opacity: 0,
    transition: 'opacity 0.3s ease'
  });

  const logoClass = css({
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: { base: '0.75rem', md: '0.85rem' }
  });

  const lensWrap = css({
    position: 'absolute',
    top: '-18px',
    left: { base: '1rem', md: '1.5rem' }
  });

  const portalClass = css({
    position: 'fixed',
    width: '48px',
    height: '48px',
    borderRadius: '9999px',
    borderWidth: '1px',
    borderColor: 'accent',
    backgroundColor: 'bg',
    pointerEvents: 'none',
    opacity: 0,
    zIndex: 10,
    transformOrigin: 'center center',
    overflow: 'hidden',
    transform: 'translate(-50%, -50%)'
  });
</script>

<section class={section} bind:this={root} id="logos">
  <FrameBorder variant="horizontal" tone="border" className={band}>
    <div class={metadataDock} bind:this={metadataHost}></div>
    <div class={lensWrap} bind:this={lensHost}></div>

    <div class={railClass} bind:this={rail}>
      {#each logos as name}
        {#if name === 'Netflix'}
          <span class={cx(body({}), logoClass)} bind:this={netflixLogo}>
            {name}
          </span>
        {:else}
          <span class={cx(body({}), logoClass)}>
            {name}
          </span>
        {/if}
      {/each}
    </div>
  </FrameBorder>

  <div class={portalClass} bind:this={portal} aria-hidden="true">
    <span
      bind:this={portalLogoClone}
      class={cx(body({}), css({
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.14em'
      }))}
    ></span>
    <video
      bind:this={portalVideo}
      src={portalVideoSrc}
      autoplay
      muted
      playsinline
      loop
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;"
    ></video>
  </div>
</section>
