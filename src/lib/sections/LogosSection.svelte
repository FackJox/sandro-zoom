<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import FrameBorder from '$lib/components/FrameBorder.svelte';
  import { lensElement, lensHome, lensDetached, lensAttachment } from '$lib/motion/lensTimeline';
  import { metadataNode, metadataDetached, metadataHome } from '$lib/motion/metadata';
  import {
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    type ScrollOrchestrator,
    gsap,
    masterScrollController
  } from '$lib/motion';
  import { createPortalContext } from '$lib/motion/portalStore';
  import { initLogosTimelines } from './LogosSection.motion';
  import { createPortalTimeline } from './FilmEntryPortal';
  import { getVideoSources } from '$lib/utils/video';
  import { clientLogos, logosPortalHeading } from '$lib/data/logos';

  let root: HTMLElement;
  let rail: HTMLElement;
  let netflixLogo: HTMLElement | null = null;
  let portal: HTMLDivElement;
  let metadataStrip: HTMLElement | null = null;
  let metadataHost: HTMLDivElement;
  let lensHost: HTMLDivElement;
  let portalLogoClone: HTMLSpanElement;
  let portalVideo: HTMLVideoElement;
  let portalFrameEl: HTMLDivElement;
  let portalHeadingEl: HTMLDivElement;
  const portalVideoSrc = '/videos/wix-video.mp4';
  const portalVideoSources = getVideoSources(portalVideoSrc);

  let destroy: (() => void) | undefined;
  let portalTimelineCleanup: (() => void) | undefined;
  let sectionCleanup: (() => void) | undefined;
  let mounted = false;
  let metadataDetachedState = false;
  let lensReady = false;
  let lensOwner: string | null = null;
  let lensNode: HTMLElement | null = null;
  let lensHomeNode: HTMLElement | null = null;
  let metadataHomeNode: HTMLElement | null = null;
  let railHome: HTMLElement | null = null;
  const dispatch = createEventDispatcher<{ 'portal:film-ready': { progress: number } }>();
  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  const portalContext = createPortalContext('logos');

  $: portalContext.attachElement(portal ?? null);

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
    if (lensReady && lensHost && lensOwner === 'logos' && lensNode.parentElement !== lensHost) {
      lensHost.appendChild(lensNode);
    } else if (!lensReady && lensHomeNode && lensNode.parentElement !== lensHomeNode) {
      lensHomeNode.appendChild(lensNode);
    }
  }

  function initPortalTimeline() {
    if (
      !mounted ||
      !metadataDetachedState ||
      portalTimelineCleanup ||
      !root ||
      !rail ||
      !netflixLogo ||
      !portal ||
      !portalLogoClone ||
      !portalVideo
    ) {
      return;
    }

    portalTimelineCleanup = createPortalTimeline({
      root,
      rail,
      logoEl: netflixLogo,
      portalContext,
      portalLogoClone,
      portalVideo,
      portalFrame: portalFrameEl,
      portalHeading: portalHeadingEl,
      orchestrator,
      onComplete: () => dispatch('portal:film-ready', { progress: 1 })
    });
  }

  function initIfReady() {
    if (!mounted || !metadataStrip || !metadataDetachedState || destroy) return;
    // NOTE: Section visibility is controlled by masterScrollController.applySectionVisibility()
    // No manual gsap.set(root, { autoAlpha: 1 }) needed here
    destroy = initLogosTimelines({
      root,
      rail,
      metadata: metadataStrip,
      orchestrator
    });
    initPortalTimeline();
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
    if (!metadataDetachedState) {
      destroy?.();
      destroy = undefined;
      portalTimelineCleanup?.();
      portalTimelineCleanup = undefined;
      portalContext.reset();
    } else {
      initPortalTimeline();
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

  const lensAttachmentUnsub = lensAttachment.subscribe((owner) => {
    lensOwner = owner;
    attachLens();
  });

  function tryPlayPortalVideo() {
    if (!portalVideo) return;
    const playPromise = portalVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.debug('[logos] Portal video autoplay blocked:', err.message);
        // Video will play when it becomes visible or user interacts
      });
    }
  }

  onMount(() => {
    mounted = true;

    // CRITICAL: Register section element IMMEDIATELY for visibility control
    // This is separate from timeline registration which happens in initIfReady()
    // GSAP best practice: element registration on mount, timeline registration when ready
    sectionCleanup = masterScrollController.registerSection('logos', root);
    console.debug('[logos] registered section element for visibility control');

    attachMetadata();
    attachLens();
    initIfReady();
    portalContext.attachElement(portal ?? null);
    // Attempt to play portal video with error handling
    tryPlayPortalVideo();
  });

  onDestroy(() => {
    destroy?.();
    portalTimelineCleanup?.();
    sectionCleanup?.();
    metadataUnsub();
    detachedUnsub();
    metadataHomeUnsub();
    lensElementUnsub();
    lensHomeUnsub();
    lensDetachedUnsub();
    lensAttachmentUnsub();
    portalContext.reset();
    portalContext.attachElement(null);
  });

  const section = css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '2.5rem', md: '3rem' },
    backgroundColor: 'bg',
    overflow: 'hidden',
    opacity: 0,
    visibility: 'hidden'
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

  const logoImgClass = css({
    height: { base: '1.5rem', md: '2rem' },
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
    opacity: 0.85,
    transition: 'opacity 0.2s ease',
    _hover: {
      opacity: 1
    }
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
  const portalFrame = css({
    position: 'absolute',
    inset: '4%',
    borderWidth: '2px',
    borderColor: 'accent',
    borderStyle: 'solid',
    opacity: 0,
    pointerEvents: 'none'
  });
  const portalHeading = css({
    position: 'absolute',
    left: '1.5rem',
    bottom: '1.25rem',
    fontFamily: 'trade',
    color: 'accent',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    fontSize: '0.9rem',
    opacity: 0
  });
</script>

<section class={section} bind:this={root} id="logos">
  <FrameBorder variant="horizontal" tone="border" className={band}>
    <div class={metadataDock} bind:this={metadataHost}></div>
    <div class={lensWrap} bind:this={lensHost}></div>

    <div class={railClass} bind:this={rail}>
      {#each clientLogos as logo}
        {#if logo.isPortalTrigger}
          <span class={cx(body({}), logoClass)} bind:this={netflixLogo}>
            {#if logo.image}
              <img src={logo.image} alt={logo.name} class={logoImgClass} />
            {:else}
              {logo.name}
            {/if}
          </span>
        {:else}
          <span class={cx(body({}), logoClass)}>
            {#if logo.image}
              <img src={logo.image} alt={logo.name} class={logoImgClass} />
            {:else}
              {logo.name}
            {/if}
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
      autoplay
      muted
      playsinline
      loop
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;"
    >
      {#each portalVideoSources as source}
        <source src={source.src} type={source.type} />
      {/each}
    </video>
    <div class={portalFrame} bind:this={portalFrameEl} aria-hidden="true"></div>
    <div class={portalHeading} bind:this={portalHeadingEl}>{logosPortalHeading}</div>
  </div>
</section>
