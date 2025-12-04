<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import SectionLabel from '$lib/components/SectionLabel.svelte';
  import StepIndicator from '$lib/components/StepIndicator.svelte';
  import { layout } from '$design/system';
  import { filmCards } from '$lib/data/film-cards';
  import { getVideoSources } from '$lib/utils/video';
  import { initBigFilmMotion } from '$lib/sections/BigFilmSection.motion';
  import { lensElement, lensAttachment } from '$lib/motion/lensTimeline';
  import {
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    type ScrollOrchestrator
  } from '$lib/motion';
  import { createEventDispatcher } from 'svelte';

  export let filmPortalReady = false;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  type FilmExitDetail = { focusRect: DOMRect };
  const dispatch = createEventDispatcher<{ 'film:exit': FilmExitDetail }>();

  let root: HTMLElement;
  let viewport: HTMLElement;
  let slab: HTMLElement;
  let hudHost: HTMLElement;
  let mounted = false;
  let initializingMotion = false;
  let motionCleanup: (() => void) | null = null;

  let activeIndex = 0;
  let lastPortalDetail: FilmExitDetail | null = null;
  let mediaNodes: HTMLElement[] = [];
  let videoNodes: Array<HTMLVideoElement | null> = [];

  let lensNode: HTMLElement | null = null;
  let lensOwner: string | null = null;

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

  function handlePortalReady(detail: FilmExitDetail) {
    lastPortalDetail = detail;
    dispatch('film:exit', detail);
  }

  async function bootstrapMotion() {
    if (initializingMotion || motionCleanup || !filmPortalReady) return;
    initializingMotion = true;
    await tick();
    collectMediaNodes();
    if (!mediaNodes.length || !root || !viewport || !slab) {
      initializingMotion = false;
      return;
    }
    resetVideos(0);
    lastPortalDetail = null;
    motionCleanup = initBigFilmMotion({
      root,
      viewport,
      slab,
      mediaNodes,
      orchestrator,
      onStepChange: handleStepChange,
      onComplete: () => {
        if (lastPortalDetail) {
          dispatch('film:exit', lastPortalDetail);
        }
      },
      onPortalReady: handlePortalReady
    });
    initializingMotion = false;
  }

  onMount(() => {
    mounted = true;
    if (filmPortalReady) {
      bootstrapMotion();
    }
  });

  $: if (mounted && filmPortalReady && !motionCleanup) {
    bootstrapMotion();
  }

  onDestroy(() => {
    motionCleanup?.();
    motionCleanup = null;
    lensElementUnsub();
    lensAttachmentUnsub();
  });

  const steps = filmCards.map((card) => card.stepLabel);
  let currentCard = filmCards[0];
  $: currentCard = filmCards[activeIndex] ?? filmCards[0];

  const sectionClass = css({
    position: 'relative',
    minHeight: '100vh',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem', lg: '6rem' },
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
    color: 'text'
  });

  const grid = css({
    display: 'grid',
    gap: { base: '2rem', md: '2.5rem', lg: '3rem' },
    alignItems: 'start',
    gridTemplateColumns: { base: '1fr', lg: '1.15fr 0.85fr' }
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
  <SectionLabel prefix="Film" title="High Altitude Features" />

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
    </div>

    <div class={slabWrap}>
      <article class={slabClass} bind:this={slab}>
        <p class={slabEyebrow}>High altitude features</p>
        <h3 class={slabTitle}>{currentCard.title}</h3>
        <p class={slabBody}>{currentCard.description}</p>

        {#if currentCard.metadata}
          <p class={metaList}>
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
