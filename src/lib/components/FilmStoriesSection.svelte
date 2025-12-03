<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';

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

  onMount(async () => {
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
  });
</script>

<section bind:this={root} class={sectionClass} id="film-stories">
  <SectionLabel prefix="Film" title="Field Stories" />
  <div class={cardsClass}>
    {#each stories as story}
      <article class={cardClass} bind:this={story.ref}>
        <div class={mediaClass}>
          <video class={videoClass} src={story.src} autoplay muted loop playsinline></video>
        </div>
        <h2 class={titleClass}>{story.title}</h2>
      </article>
    {/each}
  </div>
</section>
