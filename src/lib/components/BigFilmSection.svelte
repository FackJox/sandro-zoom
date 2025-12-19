<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import SectionLabel from '$lib/components/SectionLabel.svelte';
  import StepIndicator from '$lib/components/StepIndicator.svelte';
  import { layout } from '$design/system';
  import { filmCards } from '$lib/data/film-cards';
  import { filmStories } from '$lib/data/film-stories';
  import { getVideoSources } from '$lib/utils/video';
  import { initBigFilmMotion } from '$lib/sections/BigFilmSection.motion';
  import { lensElement, lensAttachment } from '$lib/motion/lensTimeline';
  import LensBarrelOverlay from './LensBarrelOverlay.svelte';
  import ConcentricCircles from './ConcentricCircles.svelte';
  import FilmToStoriesFocusOverlay from './FilmToStoriesFocusOverlay.svelte';
  import {
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    type ScrollOrchestrator,
    gsap,
    brandEase,
    masterScrollController
  } from '$lib/motion';

  export let filmPortalReady = false;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  let root: HTMLElement;
  let viewport: HTMLElement;
  let slab: HTMLElement;
  let hudHost: HTMLElement;
  let labelHost: HTMLDivElement | null = null;
  let mounted = false;
  let initializingMotion = false;
  let motionCleanup: (() => void) | null = null;
  let sectionCleanup: (() => void) | null = null;

  let activeIndex = 0;
  let mediaNodes: HTMLElement[] = [];
  let videoNodes: Array<HTMLVideoElement | null> = [];
  let slabEyebrowEl: HTMLElement;
  let slabTitleEl: HTMLElement;
  let slabBodyEl: HTMLElement;
  let slabMetaEl: HTMLElement;

  let lensNode: HTMLElement | null = null;
  let lensOwner: string | null = null;

  // Lens barrel overlay state (Framework 2 §3.2)
  let lensBarrelVisible = false;
  let lensBarrelLabel = '';

  // Concentric circles for exit transition (Framework 2 §3.6)
  let concentricVisible = false;
  let concentricScale = 1;

  // Focus overlay rect for exit transition (Framework 2 §3.6)
  // Receives rect from FilmExitPortal when portal is ready
  let focusOverlayRect: DOMRect | null = null;

  // Framework 2 §3.5 §C: Lens bug blip animation during card transitions
  // "Subtle rotation or tiny scale blip (like a record light reacting)"
  function triggerLensBugBlip() {
    if (!lensNode) return;

    // Cancel any existing blip animation
    gsap.killTweensOf(lensNode, 'rotation,scale');

    // Subtle blip: 5° rotation + 2% scale, then return
    gsap.to(lensNode, {
      rotation: 5,
      scale: 1.02,
      duration: 0.1,
      ease: brandEase,
      onComplete: () => {
        gsap.to(lensNode, {
          rotation: 0,
          scale: 1,
          duration: 0.15,
          ease: brandEase
        });
      }
    });
  }

  const lensElementUnsub = lensElement.subscribe((node) => {
    lensNode = node;
    syncLensNode();
  });

  const lensAttachmentUnsub = lensAttachment.subscribe((owner) => {
    lensOwner = owner;
    syncLensNode();
  });

  function syncLensNode() {
    if (lensOwner === 'film' && hudHost && lensNode && lensNode.parentElement !== hudHost) {
      hudHost.appendChild(lensNode);
    }
  }

  function collectMediaNodes() {
    if (!viewport) return;
    const nodes = Array.from(
      viewport.querySelectorAll<HTMLElement>('[data-card]')
    ).sort((a, b) => Number(a.dataset.card ?? 0) - Number(b.dataset.card ?? 0));
    mediaNodes = nodes;
    videoNodes = nodes.map((node) => (node instanceof HTMLVideoElement ? node : null));
  }

  function safePlay(video?: HTMLVideoElement | null) {
    if (!video) return;
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => {});
    }
  }

  function resetVideos(targetIndex = 0) {
    activeIndex = targetIndex;
    videoNodes.forEach((video, idx) => {
      if (!video) return;
      try {
        video.currentTime = 0;
      } catch {
        /* media might not be seekable yet */
      }
      if (idx === targetIndex) {
        safePlay(video);
      } else {
        video.pause();
      }
    });
  }

  function handleStepChange(index: number) {
    console.debug('[big-film] step change', index);
    activeIndex = index;
    videoNodes.forEach((video, idx) => {
      if (!video) return;
      if (idx === index) {
        safePlay(video);
      } else {
        video.pause();
      }
    });
  }

  async function bootstrapMotion() {
    if (initializingMotion || motionCleanup || !filmPortalReady) {
      console.debug(
        '[big-film] bootstrap skipped',
        'initializing',
        initializingMotion,
        'hasCleanup',
        Boolean(motionCleanup),
        'filmPortalReady',
        filmPortalReady
      );
      return;
    }
    console.debug('[big-film] bootstrap start');
    initializingMotion = true;
    await tick();
    collectMediaNodes();
    if (!mediaNodes.length || !root || !viewport || !slab) {
      console.warn('[big-film] missing DOM refs for motion', 'mediaNodes', mediaNodes.length, 'hasRoot', Boolean(root), 'hasViewport', Boolean(viewport), 'hasSlab', Boolean(slab));
      initializingMotion = false;
      return;
    }
    // NOTE: Section visibility is controlled by masterScrollController.applySectionVisibility()
    // No manual gsap.set(root, { autoAlpha: 1 }) needed here
    resetVideos(0);
    // Collect slab text lines for staggered animation (Framework 2 spec: 50-80ms stagger)
    const slabLines = [slabEyebrowEl, slabTitleEl, slabBodyEl, slabMetaEl].filter(Boolean);

    motionCleanup = initBigFilmMotion({
      root,
      viewport,
      slab,
      slabLines,
      mediaNodes,
      labelElement: labelHost,
      previewStories: filmStories,
      // Framework 3 §3.2: Film cards for entry reel strip animation
      filmCards,
      orchestrator,
      onStepChange: handleStepChange,
      onComplete: () => {
        console.debug('[big-film] timeline complete');
      },
      // Framework 2 §3.6: Portal ready callback - capture focus rect for overlay
      onPortalReady: (detail) => {
        console.debug('[big-film] portal ready with focusRect', detail.focusRect);
        focusOverlayRect = detail.focusRect;
      },
      // Framework 2 §3.2: Lens barrel callbacks
      onLensBarrelShow: (label: string) => {
        lensBarrelLabel = label;
        lensBarrelVisible = true;
      },
      onLensBarrelHide: () => {
        lensBarrelVisible = false;
      },
      // Framework 2 §3.6: Concentric circles callbacks
      onConcentricShow: (scale: number) => {
        concentricScale = scale;
        concentricVisible = true;
      },
      onConcentricHide: () => {
        concentricVisible = false;
      },
      // Framework 2 §3.5 §C: Lens bug blip during card transitions
      onLensBugBlip: triggerLensBugBlip
    });

    // Register parallax targets for zoom-out transitions
    // NOTE: Section element is registered in onMount for immediate visibility control
    const unregisterParallax = masterScrollController.registerParallaxTargets('bigFilm', [
      viewport,
      slab,
      ...slabLines
    ].filter(Boolean) as HTMLElement[]);

    // Store cleanup for parallax registration
    const prevCleanup = motionCleanup;
    motionCleanup = () => {
      prevCleanup?.();
      unregisterParallax();
    };

    console.debug('[big-film] motion initialized', 'mediaNodes', mediaNodes.length);
    initializingMotion = false;
  }

  onMount(async () => {
    mounted = true;

    // CRITICAL: Register section element IMMEDIATELY for visibility control
    // This is separate from timeline registration which happens in bootstrapMotion()
    // GSAP best practice: element registration on mount, timeline registration when ready
    sectionCleanup = masterScrollController.registerSection('bigFilm', root);
    console.debug('[big-film] registered section element for visibility control');

    // Collect media nodes immediately for visibility fallback
    await tick();
    collectMediaNodes();

    // Initialize first card to visible state immediately (don't wait for portal)
    // This prevents empty DOM when user lands on or scrolls to BigFilm section
    if (mediaNodes.length > 0) {
      gsap.set(mediaNodes[0], { autoAlpha: 1, clipPath: 'circle(150% at 50% 50%)' });
      // Hide subsequent cards
      mediaNodes.slice(1).forEach((node) => {
        gsap.set(node, { autoAlpha: 0, clipPath: 'circle(0% at 50% 50%)' });
      });
      console.debug('[big-film] initialized card visibility fallback');
    }

    // Fallback: if already scrolled into BigFilm range, bootstrap immediately
    // BigFilm visibility starts at 410vh (per visibilityConfig.ts)
    const scrollVH = window.scrollY / (window.innerHeight / 100);
    if (scrollVH >= 410 && !filmPortalReady) {
      console.debug('[big-film] scroll fallback - already in BigFilm range at', scrollVH.toFixed(0), 'vh');
      filmPortalReady = true;
    }

    if (filmPortalReady) {
      bootstrapMotion();
    }
  });

  $: if (mounted && filmPortalReady && !motionCleanup) {
    bootstrapMotion();
  }

  onDestroy(() => {
    motionCleanup?.();
    sectionCleanup?.();
    console.debug('[big-film] destroyed');
    motionCleanup = null;
    sectionCleanup = null;
    lensElementUnsub();
    lensAttachmentUnsub();
  });

  const steps = filmCards.map((card) => card.stepLabel);
  let currentCard = filmCards[0];
  $: currentCard = filmCards[activeIndex] ?? filmCards[0];

  const sectionClass = css({
    position: 'absolute',
    inset: 0,
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem', lg: '6rem' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2.5rem',
    color: 'text',
    overflow: 'hidden',
    opacity: 0,
    visibility: 'hidden'
    // DESIGN SPEC: Zoom-out uses mask-image with torus pattern (not clipPath)
    // mask-image is applied dynamically via zoomOutTransition.ts
  });

  const grid = css({
    display: 'grid',
    gap: { base: '2rem', md: '2.5rem', lg: '3rem' },
    alignItems: 'start',
    gridTemplateColumns: { base: '1fr', lg: '0.95fr 1.05fr' }
  });

  const viewportClass = css({
    position: 'relative',
    width: '100%',
    aspectRatio: '2.39 / 1',
    borderWidth: '1px',
    borderColor: 'accent',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: 'blackPearl',
    isolation: 'isolate'
  });

  const mediaLayer = css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  });

  const hudClass = css({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '56px',
    height: '56px',
    pointerEvents: 'none'
  });

  const slabWrap = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  });

  const slabClass = css({
    backgroundColor: 'accent',
    color: 'blackStallion',
    padding: { base: '1.5rem', md: '2rem' },
    borderRadius: '4px',
    borderWidth: '1px',
    borderColor: 'blackPearl',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '320px'
  });

  const slabEyebrow = css({
    fontFamily: 'trade',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontSize: '0.75rem'
  });

  const slabTitle = cx(
    heading({ size: 'md' }),
    css({
      color: 'blackStallion',
      fontSize: { base: '1.45rem', md: '1.85rem' },
      letterSpacing: '0.08em'
    })
  );

  const slabBody = cx(
    body({ tone: 'standard' }),
    css({
      color: 'blackStallion',
      fontSize: '1rem'
    })
  );

  const metaList = css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    fontFamily: 'plex',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em'
  });

  const indicatorWrap = css({
    display: 'flex',
    justifyContent: 'flex-start'
  });

  const mediaSources = filmCards.map((card) =>
    card.media.type === 'video' ? getVideoSources(card.media.src) : []
  );
</script>

<section bind:this={root} class={sectionClass} id="film">
  <div bind:this={labelHost}>
    <SectionLabel prefix="Film" title="High Altitude Features" />
  </div>

  <div class={grid}>
    <div class={viewportClass} bind:this={viewport}>
      {#each filmCards as card, index}
        {#if card.media.type === 'video'}
          <video
            class={mediaLayer}
            autoplay
            muted
            playsinline
            loop
            data-card={index}
          >
            {#each mediaSources[index] as source}
              <source src={source.src} type={source.type} />
            {/each}
          </video>
        {:else}
          <img
            class={mediaLayer}
            src={card.media.src}
            alt={card.media.alt}
            loading="lazy"
            data-card={index}
          />
        {/if}
      {/each}

      <div class={hudClass} bind:this={hudHost}></div>

      <!-- Framework 2 §3.2: Lens barrel overlay with tick marks -->
      <LensBarrelOverlay visible={lensBarrelVisible} label={lensBarrelLabel} />

      <!-- Framework 2 §3.6: Concentric circles for exit transition -->
      <ConcentricCircles visible={concentricVisible} scale={concentricScale} ringCount={4} />
    </div>

    <div class={slabWrap}>
      <article class={slabClass} bind:this={slab}>
        <p class={slabEyebrow} bind:this={slabEyebrowEl}>High altitude features</p>
        <h3 class={slabTitle} bind:this={slabTitleEl}>{currentCard.title}</h3>
        <p class={slabBody} bind:this={slabBodyEl}>{currentCard.description}</p>

        {#if currentCard.metadata}
          <p class={metaList} bind:this={slabMetaEl}>
            {#each currentCard.metadata as meta}
              <span>{meta}</span>
            {/each}
          </p>
        {/if}
      </article>

      <div class={indicatorWrap}>
        <StepIndicator steps={steps} activeIndex={activeIndex} />
      </div>
    </div>
  </div>
</section>

<!-- Framework 2 §3.6: Focus pull/blur overlay for exit transition -->
<FilmToStoriesFocusOverlay previewRect={focusOverlayRect} />
