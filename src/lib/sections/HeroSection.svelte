<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';
  import { css } from '$styled-system/css';
  import { layout } from '$design/system';
  import LensBadge from '$lib/components/LensBadge.svelte';
  import MetadataStrip from '$lib/components/MetadataStrip.svelte';
  import {
    lensState as lensStore,
    lensDefaultState,
    setLensElement,
    setLensHome,
    markLensElementDetached,
    attachLensToSection
  } from '$lib/motion/lensTimeline';
  import {
    metadataText,
    setMetadataElement,
    markMetadataDetached,
    setMetadataHome
  } from '$lib/motion/metadata';
  import {
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    type ScrollOrchestrator
  } from '$lib/motion';
  import { initHeroTimelines } from './HeroSection.motion';

  const heroVideoSrc = '/videos/showreel.mp4';

  let root: HTMLElement;
  let bgVideo: HTMLVideoElement;
  let slab: HTMLElement;
  let lensHome: HTMLDivElement;
  let lensMotion: HTMLDivElement;
  let metadataDock: HTMLDivElement | null = null;
  let metadata: HTMLDivElement;
  let titleEl: HTMLElement;
  let subtitleEl: HTMLElement;
  let bodyEl: HTMLElement;
  let footerEl: HTMLElement;
  let halo: HTMLDivElement;
  const strips: (HTMLVideoElement | null)[] = [];

  let destroy: (() => void) | undefined;
  let reduceMotion = false;
  let allowHover = false;
  let lensHover = false;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  let lensSnapshot = lensDefaultState;
  $: lensSnapshot = $lensStore;

  $: lensY = lensSnapshot.yPercent + lensSnapshot.idleOffset;
  $: hoverScale = lensHover && allowHover && !reduceMotion ? 1.02 : 1;
  $: lensTransform = `translate3d(${lensSnapshot.xPercent}%, ${lensY}%, 0) scale(${lensSnapshot.scale * hoverScale})`;
  $: lensOpacity = lensSnapshot.opacity;

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    allowHover = window.matchMedia('(hover: hover)').matches;

    setLensHome(lensHome);
    setLensElement(lensMotion);
    markMetadataDetached(false);
    markLensElementDetached(false);
    attachLensToSection('hero');
    if (metadataDock) {
      setMetadataHome(metadataDock);
    }

    console.debug('[hero] onMount', {
      hasMetadataDock: Boolean(metadataDock),
      hasMetadata: Boolean(metadata)
    });
    destroy = initHeroTimelines({
      root,
      media: bgVideo,
      slab,
      lens: lensMotion,
      metadata,
      halo,
      strips,
      copyLines: [titleEl, subtitleEl, bodyEl, footerEl],
      orchestrator
    });
  });

  onDestroy(() => {
    destroy?.();
    setMetadataElement(null);
    markMetadataDetached(false);
    setLensElement(null);
    setLensHome(null);
    markLensElementDetached(false);
    attachLensToSection(null);
    setMetadataHome(null);
  });

  $: if (metadata) {
    console.debug('[hero] metadata ref assigned', Boolean(metadata));
    setMetadataElement(metadata);
  }

  $: if (metadataDock) {
    setMetadataHome(metadataDock);
  }

  function handleLensEnter() {
    if (!allowHover || reduceMotion) return;
    lensHover = true;
  }

  function handleLensLeave() {
    lensHover = false;
  }

  const hero = css({
    position: 'relative',
    minHeight: '100vh',
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
    position: 'relative',
    boxShadow: '0 30px 70px rgba(0,0,0,0.45)'
  });

  const lensWrap = css({
    position: 'absolute',
    top: '-28px',
    left: '1.25rem'
  });

  const lensMotionClass = css({
    willChange: 'transform',
    transition: 'transform 0.22s var(--animation-brandEnter)',
    display: 'inline-flex'
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

  const stripField = css({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden'
  });

  const stripVideoClass = css({
    position: 'absolute',
    borderRadius: '50%',
    overflow: 'hidden',
    opacity: 0.35,
    mixBlendMode: 'screen',
    filter: 'grayscale(1)',
    clipPath: 'circle(60% at 50% 50%)',
    maskImage: 'radial-gradient(circle at center, transparent 60%, black 70%, black 78%, transparent 88%)',
    WebkitMaskImage:
      'radial-gradient(circle at center, transparent 60%, black 70%, black 78%, transparent 88%)'
  });

  const stripConfigs = [
    { size: 38, left: 12, top: 2 },
    { size: 46, left: 0, top: 6 },
    { size: 54, left: 18, top: 10 }
  ];

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

  const body = css({
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

  const metadataDockClass = css({
    width: '100%'
  });
</script>

<section class={hero} bind:this={root} id="hero">
  <video
    class={media}
    bind:this={bgVideo}
    src={heroVideoSrc}
    autoplay
    muted
    playsinline
    loop
  >
    Your browser does not support the video tag.
  </video>

  <div class={content}>
    <article class={slabClass} bind:this={slab}>
      <div class={lensWrap} bind:this={lensHome}>
        <div
          class={lensMotionClass}
          bind:this={lensMotion}
          style={`transform:${lensTransform};opacity:${lensOpacity};`}
          role="presentation"
          on:mouseenter={handleLensEnter}
          on:mouseleave={handleLensLeave}
        >
          <div class={haloClass} bind:this={halo}></div>
          <LensBadge mediaSrc={heroVideoSrc} label="ALT ▲ 8,000m" />
        </div>
      </div>

      <h1 class={title} bind:this={titleEl}>sandrogh</h1>
      <p class={subtitle} bind:this={subtitleEl}>High Altitude &amp; Hostile Environment</p>
      <p class={body} bind:this={bodyEl}>
        Over the past decade I've documented some of the biggest stories from the world of high altitude
        mountaineering.
      </p>
      <p class={slabFooter} bind:this={footerEl}>Field Notes — 2014 → 2024</p>
    </article>

    <div class={metadataDockClass} bind:this={metadataDock}>
      <MetadataStrip bind:ref={metadata} text={$metadataText} />
    </div>

    <p class={scrollHint}>Scroll</p>
  </div>

  <div class={stripField} aria-hidden="true">
    {#each stripConfigs as cfg, idx}
      <video
        class={stripVideoClass}
        bind:this={strips[idx]}
        autoplay
        muted
        playsinline
        loop
        src={heroVideoSrc}
        style={`width:${cfg.size}vw;height:${cfg.size}vw;left:${cfg.left}%;top:${cfg.top}%;`}
      ></video>
    {/each}
  </div>
</section>
