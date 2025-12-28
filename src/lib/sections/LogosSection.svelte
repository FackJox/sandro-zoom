<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import DebugOverlay from '$lib/components/DebugOverlay.svelte';
  import { debugMode, DEBUG_COLORS } from '$lib/stores/debug';
  import { lensElement, lensHome, lensDetached, lensAttachment } from '$lib/motion/lensTimeline';
  import { metadataDetached } from '$lib/motion/metadata';
  import {
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    type ScrollOrchestrator,
    masterScrollController
  } from '$lib/motion';
  import { createPortalContext } from '$lib/motion/portalStore';
  import { createPortalTimeline } from './FilmEntryPortal';
  import { initLogosTimelines } from './LogosSection.motion';
  import { getVideoSources } from '$lib/utils/video';
  import { logosPortalHeading } from '$lib/data/logos';
  import LensBarrelOverlay from '$lib/components/LensBarrelOverlay.svelte';

  // Portal trigger element passed from parent (HeroSection's Netflix logo)
  export let portalTriggerEl: HTMLElement | null = null;

  let root: HTMLElement;
  let portal: HTMLDivElement;
  let lensHost: HTMLDivElement;
  let portalLogoClone: HTMLSpanElement;
  let portalVideo: HTMLVideoElement;
  let portalFrameEl: HTMLDivElement;
  let portalHeadingEl: HTMLDivElement;
  let lensBarrelEl: HTMLDivElement;
  let lensBarrelVisible = false;
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
  const dispatch = createEventDispatcher<{ 'portal:film-ready': { progress: number } }>();
  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  const portalContext = createPortalContext('logos');

  $: portalContext.attachElement(portal ?? null);

  function attachLens() {
    if (!lensNode) return;
    if (lensReady && lensHost && lensOwner === 'logos' && lensNode.parentElement !== lensHost) {
      lensHost.appendChild(lensNode);
    } else if (!lensReady && lensHomeNode && lensNode.parentElement !== lensHomeNode) {
      lensHomeNode.appendChild(lensNode);
    }
  }

  function initPortalTimeline() {
    console.log('[logos-svelte] initPortalTimeline called');
    console.log('[logos-svelte] conditions:', {
      mounted,
      metadataDetachedState,
      hasPortalTimelineCleanup: !!portalTimelineCleanup,
      hasRoot: !!root,
      hasPortalTriggerEl: !!portalTriggerEl,
      hasPortal: !!portal,
      hasPortalLogoClone: !!portalLogoClone,
      hasPortalVideo: !!portalVideo
    });

    if (
      !mounted ||
      !metadataDetachedState ||
      portalTimelineCleanup ||
      !root ||
      !portalTriggerEl ||
      !portal ||
      !portalLogoClone ||
      !portalVideo
    ) {
      console.log('[logos-svelte] initPortalTimeline SKIPPED - missing conditions');
      return;
    }

    console.log('[logos-svelte] initPortalTimeline CREATING portal timeline');
    console.log('[logos-svelte] portalTriggerEl position:', portalTriggerEl.getBoundingClientRect());

    portalTimelineCleanup = createPortalTimeline({
      root,
      rail: root, // Use root as container since we no longer have rail
      logoEl: portalTriggerEl,
      portalContext,
      portalLogoClone,
      portalVideo,
      portalFrame: portalFrameEl,
      portalHeading: portalHeadingEl,
      lensBarrelEl,
      onLensBarrelVisibleChange: (visible) => { lensBarrelVisible = visible; },
      orchestrator,
      onComplete: () => {
        console.log('[logos-svelte] portal:film-ready dispatched');
        dispatch('portal:film-ready', { progress: 1 });
      }
    });

    console.log('[logos-svelte] portal timeline created');
  }

  const detachedUnsub = metadataDetached.subscribe((value) => {
    console.log('[logos-svelte] metadataDetached changed:', value);
    metadataDetachedState = value;
    if (!metadataDetachedState) {
      console.log('[logos-svelte] metadataDetached=false, cleaning up portal timeline');
      portalTimelineCleanup?.();
      portalTimelineCleanup = undefined;
      portalContext.reset();
    } else {
      console.log('[logos-svelte] metadataDetached=true, initiating portal timeline');
      initPortalTimeline();
    }
    attachLens();
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
      });
    }
  }

  onMount(() => {
    mounted = true;
    sectionCleanup = masterScrollController.registerSection('logos', root);
    console.debug('[logos] registered section element for visibility control');

    // Initialize lens segment and timeline
    destroy = initLogosTimelines({ root, orchestrator });

    attachLens();
    portalContext.attachElement(portal ?? null);
    tryPlayPortalVideo();
    initPortalTimeline();
  });

  onDestroy(() => {
    destroy?.();
    portalTimelineCleanup?.();
    sectionCleanup?.();
    detachedUnsub();
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
    alignItems: 'center',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '2.5rem', md: '3rem' },
    backgroundColor: 'bg',
    overflow: 'hidden'
    // NOTE: Visibility controlled by GSAP autoAlpha via masterScrollController
  });

  const lensWrap = css({
    position: 'absolute',
    top: '2rem',
    left: { base: '1rem', md: '1.5rem' }
  });

  const portalClass = css({
    position: 'fixed',
    width: '48px',
    height: '48px',
    borderRadius: '9999px',
    // Border removed - was causing stray yellow ring during animation
    backgroundColor: 'transparent',
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
  {#if $debugMode}
    <DebugOverlay label="logos" color={DEBUG_COLORS.logos.color} index={DEBUG_COLORS.logos.index} />
  {/if}
  <!-- Lens badge host (relocated from hero) -->
  <div class={lensWrap} bind:this={lensHost}></div>

  <!-- Portal overlay for circular iris transition -->
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
    <div bind:this={lensBarrelEl}>
      <LensBarrelOverlay visible={lensBarrelVisible} label={logosPortalHeading} />
    </div>
    <div class={portalFrame} bind:this={portalFrameEl} aria-hidden="true"></div>
    <div class={portalHeading} bind:this={portalHeadingEl}>{logosPortalHeading}</div>
  </div>
</section>
