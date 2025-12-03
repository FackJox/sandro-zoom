<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';
  import { getVideoSources } from '$lib/utils/video';

  let root: HTMLElement;

  type StoryCard = {
    title: string;
    src: string;
    ref: HTMLElement | null;
  };

  const stories: StoryCard[] = [
    { title: 'Sasha / No Days Off', src: '/videos/short-film-harbor.mp4', ref: null },
    { title: 'Grace / Mental Health', src: '/videos/brand-film-x.mp4', ref: null },
    { title: 'Afghanistan / Charles Schwab', src: '/videos/documentary-sierra.mp4', ref: null }
  ];

  const sectionClass = css({
    minHeight: '100vh',
    color: 'text',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem' }
  });
  const cardsClass = css({ position: 'relative', mt: '2rem', minHeight: '60vh' });
  const cardClass = css({
    position: 'absolute',
    inset: 0,
    opacity: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  });
  const mediaClass = css({
    flex: 1,
    borderWidth: '1px',
    borderColor: 'accent',
    overflow: 'hidden'
  });
  const videoClass = css({ width: '100%', height: '100%', objectFit: 'cover' });
  const titleClass = cx(heading({ size: 'sm' }), css({ color: 'text' }));
  const portalClass = css({
    position: 'fixed',
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    pointerEvents: 'none',
    opacity: 0,
    zIndex: 15,
    transform: 'translate(-50%, -50%)',
    mixBlendMode: 'screen',
    background: 'rgba(15, 23, 26, 0.55)'
  });

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;
  let portalMask: HTMLDivElement | null = null;
  let portalTimeline: gsap.core.Timeline | null = null;

  export function receivePortalIntro(detail?: { focusRect?: DOMRect }) {
    if (!portalMask) return;
    portalTimeline?.kill();
    const fallbackRect = new DOMRect(
      window.innerWidth / 2,
      window.innerHeight * 0.6,
      40,
      40
    );
    const startRect = detail?.focusRect ?? stories[0]?.ref?.getBoundingClientRect() ?? fallbackRect;
    const targetRect = stories[0]?.ref?.getBoundingClientRect() ?? startRect;
    const start = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2
    };
    const target = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };

    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });
    portalTimeline
      .set(portalMask, {
        opacity: 1,
        width: 48,
        height: 48,
        left: start.x,
        top: start.y
      })
      .to(portalMask, { left: target.x, top: target.y, duration: 0.45 })
      .to(
        stories[0]?.ref,
        {
          scale: 1.02,
          duration: 0.4
        },
        '<'
      )
      .to(
        portalMask,
        {
          width: targetRect.width * 1.5,
          height: targetRect.width * 1.5,
          duration: 0.25
        },
        '>-0.2'
      )
      .to(
        portalMask,
        {
          width: '140vw',
          height: '140vw',
          duration: 0.55
        },
        '>-0.1'
      )
      .to(portalMask, { opacity: 0, duration: 0.25 }, '>-0.15');

    portalTimeline.eventCallback('onComplete', () => {
      if (portalMask) {
        portalMask.style.opacity = '0';
      }
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

    stories.forEach((_, i) => {
      const card = stories[i]?.ref;
      const next = stories[i + 1]?.ref;

      if (i === 0 && card) {
        tl.fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0);
      }

      if (card && next) {
        const t = (i + 0.95) / stories.length;
        tl.to(card, { xPercent: -20, autoAlpha: 0, duration: 0.3 }, t).fromTo(
          next,
          { xPercent: 20, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.3 },
          t + 0.05
        );
      }
    });

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('film-stories', () => tl);
    }
  });

  onDestroy(() => {
    timeline?.kill();
    timeline = null;
    timelineDisposer?.();
    timelineDisposer = null;
    portalTimeline?.kill();
    portalTimeline = null;
  });
</script>

<section bind:this={root} class={sectionClass} id="film-stories">
  <SectionLabel prefix="Film" title="Field Stories" />
  <div class={cardsClass}>
    {#each stories as story}
      <article class={cardClass} bind:this={story.ref}>
        <div class={mediaClass}>
          <video class={videoClass} autoplay muted loop playsinline>
            {#each getVideoSources(story.src) as source}
              <source src={source.src} type={source.type} />
            {/each}
          </video>
        </div>
        <h2 class={titleClass}>{story.title}</h2>
      </article>
    {/each}
  </div>
  <div class={portalClass} bind:this={portalMask} aria-hidden="true"></div>
</section>
