<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';

  let root: HTMLElement;

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
    opacity: 0
  });
  const overlayClass = css({
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(15, 23, 26, 0.1) 0%, rgba(15, 23, 26, 0.85) 100%)'
  });
  const copyClass = css({ position: 'relative', zIndex: 1, p: '2rem' });
  const headingClass = cx(heading({ size: 'md' }), css({ color: 'text' }));
  const bodyClass = cx(body({ tone: 'standard' }), css({ mt: '1rem' }));

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

    content.forEach((_, i) => {
      const beat = content[i]?.ref;
      const next = content[i + 1]?.ref;

      if (i === 0 && beat) {
        tl.fromTo(beat, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0);
      }

      if (beat && next) {
        const t = (i + 0.9) / content.length;
        tl.to(beat, { autoAlpha: 0, scale: 0.96, duration: 0.3 }, t).fromTo(
          next,
          { autoAlpha: 0, scale: 1.04 },
          { autoAlpha: 1, scale: 1, duration: 0.3 },
          t + 0.05
        );
      }
    });
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
</section>
