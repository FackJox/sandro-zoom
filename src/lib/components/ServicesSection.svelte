<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';
  import { getVideoSources } from '$lib/utils/video';

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

  const rollEntries = [...services, ...services];

  let root: HTMLElement;
  let rollTrack: HTMLElement;
  let cta: HTMLElement;
  let portalMask: HTMLDivElement | null = null;
  const dispatch = createEventDispatcher<{ 'services:exit': { focusRect: DOMRect } }>();

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
    if (!root || cards.length === 0 || !rollTrack) return;

    const tl = gsap.timeline({
      defaults: { ease: brandEase },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=300%',
        scrub: true,
        pin: true
      }
    });

    gsap.set(cards, { transformStyle: 'preserve-3d', rotateX: -90, opacity: 0 });

    tl.fromTo(
      cards,
      { rotateX: -90, opacity: 0 },
      { rotateX: 0, opacity: 1, stagger: 0.08 },
      0.1
    )
      .to(
        cards,
        {
          rotateY: (index) => (index % 2 === 0 ? -12 : 12),
          z: -100,
          y: (index) => index * -20,
          duration: 0.6
        },
        0.7
      )
      .to(
        cards,
        {
          opacity: 0,
          duration: 0.3
        },
        1.1
      )
      .fromTo(
        rollTrack,
        { yPercent: 0 },
        { yPercent: -50, duration: 1.4, ease: 'none' },
        1.2
      )
      .fromTo(
        cta,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        2
      )
      .call(() => {
        const rect = cta?.getBoundingClientRect();
        if (!rect || !portalMask) return;
        gsap.set(portalMask, {
          opacity: 1,
          width: 36,
          height: 36,
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height / 2
        });
        gsap.to(portalMask, {
          width: rect.width * 1.8,
          height: rect.width * 1.8,
          duration: 0.5,
          ease: brandEase,
          onComplete: () => {
            portalMask && gsap.set(portalMask, { opacity: 0 });
            dispatch('services:exit', { focusRect: rect });
          }
        });
      }, undefined, 2.2);

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
    py: { base: '4rem', md: '5rem' },
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  });
  const videoClass = css({
    width: '100%',
    height: '40vh',
    objectFit: 'cover',
    borderWidth: '1px',
    borderColor: 'border'
  });
  const headingClass = cx(heading({ size: 'sm' }), css({ letterSpacing: '0.18em' }));
  const gridClass = css({
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
    perspective: '1600px'
  });
  const cardClass = css({
    borderWidth: '1px',
    borderColor: 'border',
    borderRadius: '4px',
    padding: '1.25rem',
    minHeight: '9rem',
    backgroundColor: 'rgba(15,23,26,0.85)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  });
  const cardLabel = heading({ size: 'md' });
  const cardDetail = body({ tone: 'standard' });
  const rollShell = css({
    overflow: 'hidden',
    borderWidth: '1px',
    borderColor: 'border',
    borderRadius: '4px',
    height: '10rem'
  });
  const rollTrackClass = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem'
  });
  const rollLine = css({
    display: 'flex',
    justifyContent: 'space-between',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontSize: '0.85rem'
  });
  const ctaClass = cx(
    body({ tone: 'standard' }),
    css({
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      textAlign: 'center'
    })
  );
  const portalMaskClass = css({
    position: 'fixed',
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    opacity: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    backgroundColor: 'rgba(15,23,26,0.5)',
    zIndex: 14,
    transform: 'translate(-50%, -50%)'
  });

  const videoSources = getVideoSources('/videos/brand-film-x.mp4');
</script>

<section bind:this={root} class={sectionClass} id="services">
  <video class={videoClass} autoplay muted loop playsinline>
    {#each videoSources as source}
      <source src={source.src} type={source.type} />
    {/each}
  </video>

  <h2 class={headingClass}>Services & Credits</h2>
  <div class={gridClass}>
    {#each services as service}
      <article class={cardClass} bind:this={service.ref}>
        <p class={cardLabel}>{service.label}</p>
        <p class={cardDetail}>{service.detail}</p>
      </article>
    {/each}
  </div>

  <div class={rollShell}>
    <div class={rollTrackClass} bind:this={rollTrack}>
      {#each rollEntries as entry}
        <div class={rollLine}>
          <span>{entry.label}</span>
          <span>{entry.detail}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class={ctaClass} bind:this={cta}>
    <p>One more shot ↓</p>
    <p>Scroll for final contact</p>
  </div>

  <div class={portalMaskClass} bind:this={portalMask} aria-hidden="true"></div>
</section>
