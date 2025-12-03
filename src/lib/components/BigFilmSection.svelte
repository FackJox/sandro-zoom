<script lang="ts">
  import { getContext, onMount, onDestroy, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { body, heading } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';
  import LensBug from './LensBug.svelte';
  import { createEventDispatcher } from 'svelte';

  export let filmPortalReady = false;

  let root: HTMLElement;
  let mounted = false;
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;

  const dispatch = createEventDispatcher<{ 'film:exit': void }>();
  let activeIndex = 0;
  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  type FilmCard = {
    id: string;
    title: string;
    body: string;
    src: string;
    ref: HTMLElement | null;
  };

  const films: FilmCard[] = [
    {
      id: 'netflix',
      title: 'Netflix — 14 Peaks: Nothing Is Impossible',
      body: "Lead cinematographer documenting Nimsdai's historic push across the world's fourteen highest peaks.",
      src: '/videos/wix-video.mp4',
      ref: null
    },
    {
      id: 'k2winter',
      title: 'K2 Winter Expedition',
      body: 'Director of Photography on the first successful K2 winter expedition—operating above 8,000 metres.',
      src: '/videos/documentary-sierra.mp4',
      ref: null
    },
    {
      id: 'k2summit',
      title: 'K2 Summit 2022',
      body: 'Frozen light on the final ridge, captured moments before the summit push.',
      src: '/pictures/EVEREST CLEAN (1 of 2).jpg',
      ref: null
    }
  ];

  const sectionClass = css({
    position: 'relative',
    minHeight: '100vh',
    bg: 'bg',
    color: 'text',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem' }
  });
  const cardsClass = css({ position: 'relative', mt: '2rem', minHeight: '60vh' });
  const cardShell = css({
    position: 'absolute',
    inset: 0,
    opacity: 0,
    clipPath: 'circle(0% at 50% 50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  });
  const mediaFrame = css({
    flex: 1,
    overflow: 'hidden',
    borderWidth: '1px',
    borderColor: 'accent'
  });
  const mediaClass = css({ width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
  const headingClass = cx(heading({ size: 'sm' }), css({ color: 'text' }));
  const bodyClass = body({ tone: 'standard' });

  const lensBugWrap = css({
    position: 'absolute',
    top: '-24px',
    right: { base: '0', md: '2rem' },
    zIndex: 2
  });

  const indicatorWrap = css({
    mt: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'plex',
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  });

  const indicatorDot = css({
    width: '10px',
    height: '10px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s ease, transform 0.2s ease'
  });

  const indicatorDotActive = css({
    backgroundColor: 'accent',
    transform: 'scale(1.1)'
  });

  async function buildTimeline() {
    if (timeline) {
      timeline.kill();
      timeline = null;
      timelineDisposer?.();
      timelineDisposer = null;
    }

    await tick();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=300%',
        scrub: true,
        pin: true
      },
      defaults: { ease: brandEase }
    });

    films.forEach((_, index) => {
      const card = films[index]?.ref;
      const nextCard = films[index + 1]?.ref;

      if (tl && index === 0 && card) {
        tl
          .fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
          .call(() => {
            activeIndex = 0;
          }, undefined, 0.05);
      }

      if (tl && card && nextCard) {
        const start = (index + 0.95) / films.length;
        tl
          .to(
            card,
            {
              clipPath: 'circle(0% at 50% 50%)',
              duration: 0.3
            },
            start
          )
          .fromTo(
            nextCard,
            { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 },
            { clipPath: 'circle(150% at 50% 50%)', autoAlpha: 1, duration: 0.3 },
            start + 0.05
          )
          .call(() => {
            activeIndex = index + 1;
          }, undefined, start + 0.1);
      }
    });

    tl.call(() => {
      dispatch('film:exit');
    }, undefined, '+=0.2');
    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('big-film', () => tl);
    }
  }

  onMount(() => {
    mounted = true;
    if (filmPortalReady) {
      buildTimeline();
    }
  });

  $: if (mounted && filmPortalReady && !timeline) {
    buildTimeline();
  }

  onDestroy(() => {
    timeline?.kill();
    timelineDisposer?.();
    timelineDisposer = null;
  });
</script>

<section bind:this={root} class={sectionClass} id="film">
  <SectionLabel prefix="Film" title="High Altitude Features" />

  <div class={cardsClass}>
    <div class={lensBugWrap}>
      <LensBug size={42} label="HUD" />
    </div>

    {#each films as film}
      <article
        class={cardShell}
        bind:this={film.ref}
      >
        <div class={mediaFrame}>
          {#if film.src.endsWith('.jpg') || film.src.endsWith('.avif')}
            <img class={mediaClass} src={film.src} alt={film.title} loading="lazy" />
          {:else}
            <video class={mediaClass} src={film.src} autoplay muted loop playsinline></video>
          {/if}
        </div>
        <h2 class={headingClass}>{film.title}</h2>
        <p class={bodyClass}>{film.body}</p>
      </article>
    {/each}
  </div>

  <div class={indicatorWrap} aria-label="Film story progress">
    {#each films as film, idx}
      <span
        class={cx(indicatorDot, idx === activeIndex && indicatorDotActive)}
        aria-label={`Step ${idx + 1}: ${film.title}`}
      ></span>
    {/each}
  </div>
</section>
