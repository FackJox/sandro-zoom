<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';
  import StepIndicator from './StepIndicator.svelte';

  let root: HTMLElement;
  let focusRing: HTMLDivElement | null = null;
  let activeIndex = 0;

  type Beat = {
    title: string;
    body: string;
    background: string;
    ref: HTMLElement | null;
  };

  const content: Beat[] = [
    {
      title: 'Front-line perspective',
      body: "Over the past decade I've documented Himalayan expeditions, heli rescues and expeditions where each shot is a calculated risk.",
      background: '/pictures/heli rescue (1 of 2).jpg',
      ref: null
    },
    {
      title: 'Origin story',
      body: 'A childhood in the city, a stint in the army, then a one way ticket to high altitude filmmaking. I learned to shoot in the thin air.',
      background: '/pictures/city-of-glass.avif',
      ref: null
    },
    {
      title: 'Values & ongoing work',
      body: "Feeling and fortitude. Whether it's a docu-series, a Red Bull campaign or an NGO rescue piece, craft comes second only to safety.",
      background: '/pictures/Film Himal Sicker 01.jpg',
      ref: null
    }
  ];

  const sectionClass = css({
    minHeight: '100vh',
    position: 'relative',
    color: 'text',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem' }
  });
  const beatClass = css({
    position: 'absolute',
    top: { base: '6rem', md: '6rem' },
    left: { base: '1.5rem', md: '3rem' },
    right: { base: '1.5rem', md: '3rem' },
    bottom: '2rem',
    borderWidth: '1px',
    borderColor: 'surface',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    opacity: 0,
    clipPath: 'circle(0% at 50% 50%)'
  });
  const overlayClass = css({
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(15, 23, 26, 0.1) 0%, rgba(15, 23, 26, 0.85) 100%)'
  });
  const copyClass = css({ position: 'relative', zIndex: 1, p: '2rem' });
  const headingClass = cx(heading({ size: 'md' }), css({ color: 'text' }));
  const bodyClass = cx(body({ tone: 'standard' }), css({ mt: '1rem' }));
  const aboutSteps = content.map((beat) => beat.title);

  const indicatorWrap = css({ mt: '2rem' });
  const focusRingClass = css({
    position: 'absolute',
    width: '90px',
    height: '90px',
    borderRadius: '999px',
    borderWidth: '2px',
    borderColor: 'accent',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    top: 0,
    left: 0,
    transform: 'translate(-50%, -50%)'
  });

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;

  function moveRing(target: HTMLElement | null, immediate = false) {
    if (!target || !focusRing) return;
    const rect = target.getBoundingClientRect();
    const rootRect = root?.getBoundingClientRect();
    if (!rootRect) return;
    const x = rect.left - rootRect.left + rect.width * 0.75;
    const y = rect.top - rootRect.top + rect.height * 0.25;
    gsap.to(focusRing, {
      x,
      y,
      duration: immediate ? 0 : 0.4,
      ease: brandEase
    });
  }

  onMount(async () => {
    await tick();

    timeline?.kill();
    timelineDisposer?.();
    timelineDisposer = null;

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

    content.forEach((beat, index) => {
      const node = beat.ref;
      if (!node) return;
      gsap.set(node, {
        autoAlpha: index === 0 ? 1 : 0,
        clipPath: index === 0 ? 'circle(140% at 50% 50%)' : 'circle(0% at 50% 50%)'
      });
    });
    activeIndex = 0;
    moveRing(content[0]?.ref ?? null, true);

    content.forEach((_, i) => {
      const beat = content[i]?.ref;
      const next = content[i + 1]?.ref;

      if (beat && next) {
        const t = (i + 0.9) / content.length;
        tl
          .to(
            beat,
            {
              clipPath: 'circle(0% at 50% 50%)',
              autoAlpha: 0,
              duration: 0.35
            },
            t
          )
          .fromTo(
            next,
            { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 },
            { clipPath: 'circle(140% at 50% 50%)', autoAlpha: 1, duration: 0.4 },
            t + 0.05
          )
          .call(
            (idx: number) => {
              activeIndex = idx;
              moveRing(content[idx]?.ref ?? null);
            },
            [i + 1],
            t + 0.08
          );
      }
    });

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('about', () => tl);
    }
  });

  onDestroy(() => {
    timeline?.kill();
    timeline = null;
    timelineDisposer?.();
    timelineDisposer = null;
  });
</script>

<section bind:this={root} class={sectionClass} id="about">
  <SectionLabel prefix="About me" title="Story" />

  {#each content as beat}
    <article
      class={beatClass}
      style={`background-image:url('${beat.background}');`}
      bind:this={beat.ref}
    >
      <div class={overlayClass}></div>
      <div class={copyClass}>
        <h2 class={headingClass}>{beat.title}</h2>
        <p class={bodyClass}>{beat.body}</p>
      </div>
    </article>
  {/each}
  <div class={focusRingClass} bind:this={focusRing} aria-hidden="true"></div>
  <div class={indicatorWrap}>
    <StepIndicator steps={aboutSteps} activeIndex={activeIndex} />
  </div>
</section>
