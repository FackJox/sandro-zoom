<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';

  let root: HTMLElement;
  let videoEl: HTMLVideoElement;
  let credits: HTMLElement;
  let cta: HTMLElement;

  type ServiceLine = {
    label: string;
    ref: HTMLElement | null;
  };

  const services: ServiceLine[] = [
    { label: 'MOUNTAIN DOP', ref: null },
    { label: 'EXPED & PRODUCT PHOTOGRAPHY', ref: null },
    { label: 'AERIAL CINEMATOGRAPHY', ref: null },
    { label: 'STOCK FOOTAGE (SHUTTERSTOCK)', ref: null }
  ];

  const sectionClass = css({
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: 'bg',
    color: 'accent',
    overflow: 'hidden'
  });
  const videoClass = css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '60vh',
    objectFit: 'cover',
    filter: 'grayscale(1)'
  });
  const creditsClass = css({
    position: 'absolute',
    top: '40vh',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'bg',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    px: { base: layout.safeX.base, md: layout.safeX.md },
    py: '3rem'
  });
  const labelClass = cx(
    heading({ size: 'sm' }),
    css({ letterSpacing: '0.16em', mb: '2rem' })
  );
  const linesClass = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    textAlign: 'center'
  });
  const lineClass = heading({ size: 'md' });
  const ctaClass = cx(
    body({ tone: 'standard' }),
    css({
      mt: '3rem',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      fontSize: '0.8rem'
    })
  );
  const hrClass = css({
    height: '1px',
    width: '8rem',
    backgroundColor: 'border',
    mx: 'auto',
    my: '0.25rem'
  });

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;

  onMount(async () => {
    await tick();

    timeline?.kill();
    timelineDisposer?.();
    timelineDisposer = null;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=250%',
        scrub: true,
        pin: true
      },
      defaults: { ease: brandEase }
    });

    tl.fromTo(videoEl, { opacity: 1 }, { opacity: 0, duration: 0.4 }, 0.15).fromTo(
      credits,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      0.3
    );

    services.forEach((service, i) => {
      const line = service.ref;
      if (!line) return;
      const start = 0.3 + i * 0.3;
      tl.fromTo(
        line,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.3 },
        start
      );
    });

    tl.fromTo(
      cta,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4 },
      '>'
    );

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('services', () => tl);
    }
  });

  onDestroy(() => {
    timeline?.kill();
    timeline = null;
    timelineDisposer?.();
    timelineDisposer = null;
  });
</script>

<section bind:this={root} class={sectionClass} id="services">
  <video bind:this={videoEl} class={videoClass} autoplay muted playsinline loop src="/videos/brand-film-x.mp4"></video>

  <div class={creditsClass} bind:this={credits}>
    <h2 class={labelClass}>Services / Credits</h2>
    <div class={linesClass}>
      {#each services as service}
        <div class={lineClass} bind:this={service.ref}>{service.label}</div>
      {/each}
    </div>
    <div class={ctaClass} bind:this={cta}>
      <div class={hrClass}></div>
      <p>ONE MORE SHOT ↓</p>
      <p>SCROLL FOR FINAL CONTACT</p>
      <div class={hrClass}></div>
    </div>
  </div>
</section>
