<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';

  type ServiceCard = {
    label: string;
    detail: string;
    ref: HTMLElement | null;
  };

  const services: ServiceCard[] = [
    { label: 'Mountain DOP', detail: 'Feature & expedition cinematography', ref: null },
    { label: 'Exped & Product Photography', detail: 'Summit, studio & rescue assets', ref: null },
    { label: 'Aerial Cinematography', detail: 'FPV + heavy-lift platforms', ref: null },
    { label: 'Stock Footage / Editorial', detail: 'Shutterstock, BBC, Netflix delivery', ref: null }
  ];

  let root: HTMLElement;
  let cta: HTMLElement;
  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;

  onMount(async () => {
    await tick();
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;

    const cards = services.map((service) => service.ref).filter(Boolean) as HTMLElement[];
    if (!root || cards.length === 0) return;

    const tl = gsap.timeline({
      defaults: { ease: brandEase },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=260%',
        scrub: true,
        pin: true
      }
    });

    gsap.set(cards, { transformStyle: 'preserve-3d', rotateX: -75, opacity: 0 });

    tl.fromTo(
      cards,
      { rotateX: -75, opacity: 0 },
      { rotateX: 0, opacity: 1, stagger: 0.12 },
      0.1
    )
      .to(
        cards,
        {
          z: (index) => -index * 80,
          y: (index) => index * -30,
          duration: 0.6,
          ease: 'power2.out'
        },
        0.8
      )
      .to(
        cards,
        {
          xPercent: (index) => (index % 2 === 0 ? -20 : 20),
          yPercent: (index) => index * -10,
          scale: 0.9,
          duration: 0.5
        },
        1.2
      )
      .fromTo(
        cta,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        1.35
      );

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('services', () => tl);
    }
  });

  onDestroy(() => {
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;
  });

  const sectionClass = css({
    minHeight: '100vh',
    backgroundColor: 'bg',
    color: 'text',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem' }
  });
  const headingClass = cx(heading({ size: 'sm' }), css({ letterSpacing: '0.18em' }));
  const gridClass = css({
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
    marginTop: '2rem',
    perspective: '1600px'
  });
  const cardClass = css({
    borderWidth: '1px',
    borderColor: 'border',
    borderRadius: '4px',
    padding: '1.5rem',
    minHeight: '10rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: 'rgba(15,23,26,0.85)'
  });
  const cardLabel = heading({ size: 'md' });
  const cardDetail = body({ tone: 'standard' });
  const ctaClass = cx(
    body({ tone: 'standard' }),
    css({
      marginTop: '3rem',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      textAlign: 'center'
    })
  );
</script>

<section bind:this={root} class={sectionClass} id="services">
  <h2 class={headingClass}>Services & Credits</h2>
  <div class={gridClass}>
    {#each services as service}
      <article class={cardClass} bind:this={service.ref}>
        <p class={cardLabel}>{service.label}</p>
        <p class={cardDetail}>{service.detail}</p>
      </article>
    {/each}
  </div>

  <div class={ctaClass} bind:this={cta}>
    <p>One more shot ↓</p>
    <p>Scroll for final contact</p>
  </div>
</section>
