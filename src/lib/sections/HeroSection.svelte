<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import LensBadge from '$lib/components/LensBadge.svelte';
  import DebugOverlay from '$lib/components/DebugOverlay.svelte';
  import { debugMode, DEBUG_COLORS } from '$lib/stores/debug';
  import { clientLogos } from '$lib/data/logos';
  import {
    lensState as lensStore,
    lensDefaultState,
    setLensElement,
    setLensHome,
    markLensElementDetached,
    attachLensToSection
  } from '$lib/motion/lensTimeline';
  import {
    setMetadataElement,
    markMetadataDetached,
    setMetadataHome
  } from '$lib/motion/metadata';
  import {
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    type ScrollOrchestrator
  } from '$lib/motion';
  import { initHeroTimelines } from './HeroSection.motion';
  import { getVideoSources } from '$lib/utils/video';
  import { heroCopy } from '$lib/data/hero';

  const heroVideoSrc = '/videos/showreel.mp4';
  const heroVideoSources = getVideoSources(heroVideoSrc);

  let root: HTMLElement;
  let bgVideo: HTMLVideoElement;
  let slab: HTMLElement;
  let lensHome: HTMLDivElement;
  let lensMotion: HTMLDivElement;
  let lensMedia: HTMLVideoElement | null = null;
  let logoRailEl: HTMLDivElement;
  let netflixLogoEl: HTMLElement | null = null;

  // Export Netflix logo ref for portal trigger
  export { netflixLogoEl as portalTriggerRef };
  let titleEl: HTMLElement;
  let subtitleEl: HTMLElement;
  let bodyEl: HTMLElement;
  let footerEl: HTMLElement;
  let halo: HTMLDivElement;

let destroy: (() => void) | undefined;
let reduceMotion = false;
let allowHover = false;
let lensHover = false;
let disposed = false;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  let lensSnapshot = lensDefaultState;
  $: lensSnapshot = $lensStore;

  $: lensY = lensSnapshot.yPercent + lensSnapshot.idleOffset;
  $: hoverScale = lensHover && allowHover && !reduceMotion ? 1.04 : 1;
  $: lensTransform = `translate3d(${lensSnapshot.xPercent}%, ${lensY}%, 0) scale(${lensSnapshot.scale * hoverScale})`;
  // NOTE: opacity is NOT bound here - GSAP controls it directly in HeroSection.motion.ts
  // This prevents reactive binding from overriding GSAP's opacity control

onMount(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  allowHover = window.matchMedia('(hover: hover)').matches;

  setLensHome(lensHome);
  setLensElement(lensMotion);
  markMetadataDetached(false);
  markLensElementDetached(false);
  attachLensToSection('hero');

  (async () => {
    await tick();
    if (disposed) return;
    if (!logoRailEl) {
      console.warn('[hero] logoRail ref missing, skipping motion init');
      return;
    }
    destroy = initHeroTimelines({
      root,
      media: bgVideo,
      slab,
      lens: lensMotion,
      lensMedia,
      logoRail: logoRailEl,
      netflixLogo: netflixLogoEl,
      halo,
      copyLines: [titleEl, subtitleEl, bodyEl, footerEl],
      orchestrator
    });
  })();
});

onDestroy(() => {
  disposed = true;
  destroy?.();
    setLensElement(null);
    setLensHome(null);
    markLensElementDetached(false);
    attachLensToSection(null);
  });

  function handleLensEnter() {
    if (!allowHover || reduceMotion) return;
    lensHover = true;
  }

  function handleLensLeave() {
    lensHover = false;
  }

  const hero = css({
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    background: 'blackStallion',
    color: 'silverplate'
  });

  const media = css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'grayscale(1)'
  });

  const content = css({
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '1.5rem', md: '3rem', lg: '4rem' }
  });

  const slabClass = css({
    backgroundColor: 'accent',
    color: 'blackStallion',
    px: { base: '1.2rem', md: '2rem' },
    py: { base: '1.4rem', md: '2rem' },
    maxWidth: layout.slabMax,
    marginX: { base: 'auto', lg: 0 },
    marginTop: { base: '5rem', md: '6rem' },
    position: 'relative'
  });

  const lensWrap = css({
    position: 'absolute',
    top: '-28px',
    left: '1.25rem'
  });

  const lensMotionClass = css({
    willChange: 'transform',
    transition: 'transform 0.22s var(--animation-brandEnter)',
    display: 'inline-flex',
    opacity: 0  // Start hidden - revealed when hero shrinks into it at 95%
  });

  const haloClass = css({
    position: 'absolute',
    inset: '-8px',
    borderRadius: '999px',
    borderWidth: '2px',
    borderColor: 'accent',
    opacity: 0,
    pointerEvents: 'none',
    filter: 'blur(1px)'
  });

  const title = css({
    fontFamily: 'trade',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: { base: '1.6rem', md: '2.2rem' }
  });

  const subtitle = css({
    fontFamily: 'trade',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: { base: '1rem', md: '1.1rem' },
    mt: '0.5rem'
  });

  const copyBody = css({
    mt: '1rem',
    fontFamily: 'plex',
    fontSize: { base: '0.95rem', md: '1rem' },
    lineHeight: '1.6'
  });

  const slabFooter = css({
    mt: '2rem',
    fontFamily: 'plex',
    fontSize: '0.8rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'blackStallion'
  });

  const scrollHint = css({
    mt: '1rem',
    fontSize: '0.7rem',
    letterSpacing: '0.3em',
    textTransform: 'uppercase'
  });

  const logoRailClass = css({
    position: 'fixed',
    bottom: { base: '1.5rem', md: '2rem' },
    left: 0,
    right: 0,
    zIndex: 5,
    display: 'flex',
    gap: { base: '1.5rem', md: '2.5rem' },
    py: '1rem',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    whiteSpace: 'nowrap',
    flexWrap: { base: 'wrap', md: 'nowrap' },
    justifyContent: 'center',
    alignItems: 'center'
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
</script>

<section class={hero} bind:this={root} id="hero">
  {#if $debugMode}
    <DebugOverlay label="hero" color={DEBUG_COLORS.hero.color} index={DEBUG_COLORS.hero.index} />
  {/if}
  <video class={media} bind:this={bgVideo} autoplay muted playsinline loop>
    {#each heroVideoSources as source}
      <source src={source.src} type={source.type} />
    {/each}
    Your browser does not support the video tag.
  </video>

  <div class={content}>
    <article class={slabClass} bind:this={slab}>
      <div class={lensWrap} bind:this={lensHome}>
        <div
          class={lensMotionClass}
          bind:this={lensMotion}
          style={`transform:${lensTransform};`}
          role="presentation"
          on:mouseenter={handleLensEnter}
          on:mouseleave={handleLensLeave}
        >
          <div class={haloClass} bind:this={halo}></div>
          <LensBadge mediaSrc={heroVideoSrc} label={heroCopy.lensLabel} bind:mediaRef={lensMedia} />
        </div>
      </div>

      <h1 class={title} bind:this={titleEl}>{heroCopy.title}</h1>
      <p class={subtitle} bind:this={subtitleEl}>{heroCopy.subtitle}</p>
      <p class={copyBody} bind:this={bodyEl}>{heroCopy.body}</p>
      <p class={slabFooter} bind:this={footerEl}>{heroCopy.footer}</p>
    </article>

    <p class={scrollHint}>{heroCopy.scrollHint}</p>
  </div>
</section>

<!-- Logo rail outside hero section so it's not clipped during shrink -->
<div class={logoRailClass} bind:this={logoRailEl}>
  {#each clientLogos as logo, idx}
    {#if logo.isPortalTrigger}
      <span class={cx(body({}), logoClass)} bind:this={netflixLogoEl}>
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
