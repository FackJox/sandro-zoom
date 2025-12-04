<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';
  import StepIndicator from './StepIndicator.svelte';
  import LensBug from './LensBug.svelte';
  import { getVideoSources } from '$lib/utils/video';

  type StoryCard = {
    title: string;
    src: string;
    ref: HTMLElement | null;
    mediaRef: HTMLElement | null;
  };

  const stories: StoryCard[] = [
    { title: 'Sasha / No Days Off', src: '/videos/short-film-harbor.mp4', ref: null, mediaRef: null },
    { title: 'Grace / Mental Health', src: '/videos/brand-film-x.mp4', ref: null, mediaRef: null },
    { title: 'Afghanistan / Charles Schwab', src: '/videos/documentary-sierra.mp4', ref: null, mediaRef: null }
  ];

  let root: HTMLElement;
  let viewport: HTMLElement;
  let hudHost: HTMLElement;
  let focusRing: HTMLDivElement | null = null;
  let portalMask: HTMLDivElement | null = null;
  let portalTimeline: gsap.core.Timeline | null = null;
  let activeIndex = 0;
  let mounted = false;
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  const steps = stories.map((story, idx) => `${idx + 1}. ${story.title.split('/')[0].trim()}`);

  function syncFocusRing(index: number, immediate = false) {
    const media = stories[index]?.mediaRef;
    if (!media || !focusRing || !viewport) return;
    const mediaRect = media.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const targetX = mediaRect.left - viewportRect.left + mediaRect.width * 0.8;
    const targetY = mediaRect.top - viewportRect.top + mediaRect.height * 0.2;
    gsap.to(focusRing, {
      x: targetX,
      y: targetY,
      duration: immediate ? 0 : 0.45,
      ease: brandEase
    });
  }

  export function receivePortalIntro(detail?: { focusRect?: DOMRect }) {
    if (!portalMask) return;
    portalTimeline?.kill();
    const fallbackRect = new DOMRect(window.innerWidth / 2, window.innerHeight * 0.65, 40, 40);
    const startRect = detail?.focusRect ?? fallbackRect;
    const targetRect = stories[0]?.mediaRef?.getBoundingClientRect() ?? startRect;
    const start = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2
    };
    const target = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };
    const viewportRect = viewport?.getBoundingClientRect();
    if (!viewportRect) return;

    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });
    portalTimeline
      .set(portalMask, {
        opacity: 1,
        width: 48,
        height: 48,
        left: start.x,
        top: start.y
      })
      .to(portalMask, {
        left: target.x,
        top: target.y,
        duration: 0.45
      })
      .to(
        portalMask,
        {
          width: viewportRect.width,
          height: viewportRect.width,
          duration: 0.5
        },
        '>-0.2'
      )
      .to(portalMask, { opacity: 0, duration: 0.3 }, '>-0.15');
  }

  async function initTimeline() {
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;

    await tick();
    if (!root || !viewport || stories.some((story) => !story.ref || !story.mediaRef)) {
      return;
    }

    stories.forEach((story, index) => {
      if (!story.ref) return;
      gsap.set(story.ref, {
        autoAlpha: index === 0 ? 1 : 0,
        clipPath: index === 0 ? 'circle(140% at 50% 50%)' : 'circle(0% at 50% 50%)'
      });
    });
    activeIndex = 0;
    syncFocusRing(0, true);

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

    stories.forEach((_, index) => {
      const current = stories[index]?.ref;
      const next = stories[index + 1]?.ref;
      if (!current || !next) return;
      const start = (index + 0.95) / stories.length;
      tl
        .to(
          current,
          {
            clipPath: 'circle(0% at 50% 50%)',
            autoAlpha: 0,
            duration: 0.35
          },
          start
        )
        .fromTo(
          next,
          { clipPath: 'circle(0% at 50% 50%)', autoAlpha: 0 },
          { clipPath: 'circle(140% at 50% 50%)', autoAlpha: 1, duration: 0.4 },
          start + 0.05
        )
        .call(
          (i: number) => {
            activeIndex = i;
            syncFocusRing(i);
          },
          [index + 1],
          start + 0.08
        );
    });

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('film-stories', () => tl);
    }
  }

  onMount(() => {
    mounted = true;
    initTimeline();
  });

  onDestroy(() => {
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;
    portalTimeline?.kill();
    portalTimeline = null;
  });

  const sectionClass = css({
    minHeight: '100vh',
    color: 'text',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '4rem', md: '5rem' }
  });
  const viewportClass = css({
    position: 'relative',
    width: '100%',
    aspectRatio: '2.05 / 1',
    borderWidth: '1px',
    borderColor: 'accent',
    overflow: 'hidden',
    backgroundColor: 'blackPearl'
  });
  const cardClass = css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1.25rem'
  });
  const mediaClass = css({
    flex: 1,
    borderWidth: '1px',
    borderColor: 'border',
    overflow: 'hidden'
  });
  const videoClass = css({ width: '100%', height: '100%', objectFit: 'cover' });
  const titleClass = cx(
    heading({ size: 'sm' }),
    css({ color: 'text', letterSpacing: '0.12em' })
  );
  const focusRingClass = css({
    position: 'absolute',
    width: '78px',
    height: '78px',
    borderRadius: '999px',
    borderWidth: '2px',
    borderColor: 'accent',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    transform: 'translate(-50%, -50%)'
  });
  const hudHostClass = css({
    position: 'absolute',
    top: '1rem',
    right: '1rem'
  });
  const indicatorWrap = css({
    marginTop: '2rem'
  });
  const portalMaskClass = css({
    position: 'fixed',
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 12,
    transform: 'translate(-50%, -50%)',
    mixBlendMode: 'screen',
    backgroundColor: 'rgba(15, 23, 26, 0.5)'
  });
</script>

<section bind:this={root} class={sectionClass} id="film-stories">
  <SectionLabel prefix="Film" title="Field Stories" />

  <div class={viewportClass} bind:this={viewport}>
    {#each stories as story, index}
      <article class={cardClass} bind:this={story.ref}>
        <div class={mediaClass} bind:this={story.mediaRef}>
          <video class={videoClass} autoplay muted loop playsinline>
            {#each getVideoSources(story.src) as source}
              <source src={source.src} type={source.type} />
            {/each}
          </video>
        </div>
        <h2 class={titleClass}>{story.title}</h2>
      </article>
    {/each}

    <div class={focusRingClass} bind:this={focusRing}></div>
    <div class={hudHostClass} bind:this={hudHost}>
      <LensBug size={42} label="HUD" />
    </div>
  </div>

  <div class={indicatorWrap}>
    <StepIndicator steps={steps} activeIndex={activeIndex} />
  </div>

  <div class={portalMaskClass} bind:this={portalMask} aria-hidden="true"></div>
</section>
