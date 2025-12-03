<script lang="ts">
  import { onMount } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, ScrollTrigger } from '$lib/motion';
  import SectionLabel from './SectionLabel.svelte';

  let root: HTMLElement;
  let successBlock: HTMLElement;
  let failBlock: HTMLElement;

  const sectionClass = css({
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    color: 'text'
  });
  const bgClass = css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'grayscale(1)'
  });
  const overlayClass = css({
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, transparent 0, #0f171a 70%)'
  });
  const contentClass = css({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    px: { base: layout.safeX.base, md: layout.safeX.md },
    py: { base: '4rem', md: '5rem' }
  });
  const cardClass = css({
    mt: '2rem',
    px: '1.5rem',
    py: '1.5rem',
    backgroundColor: 'rgba(15, 23, 26, 0.9)',
    borderWidth: '1px',
    borderColor: 'border',
    maxWidth: '26rem',
    width: '100%',
    position: 'relative',
    minHeight: '12rem'
  });
  const panelClass = css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    transition: 'opacity 0.2s ease'
  });
  const hiddenPanel = css({ opacity: 0 });
  const panelHeading = heading({ size: 'sm' });
  const panelBody = body({ tone: 'standard' });

  onMount(() => {
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: '+=150%',
      scrub: true,
      pin: true,
      onUpdate(self) {
        const p = self.progress;
        const threshold = 0.5;
        const t = gsap.utils.clamp(0, 1, (p - threshold + 0.2) / 0.4);
        gsap.set(successBlock, { opacity: 1 - t });
        gsap.set(failBlock, { opacity: t });
      }
    });

    return () => st.kill();
  });
</script>

<section bind:this={root} class={sectionClass} id="photo-stats">
  <video class={bgClass} src="/videos/documentary-sierra.mp4" autoplay muted loop playsinline></video>

  <div class={overlayClass}></div>

  <div class={contentClass}>
    <SectionLabel prefix="Photo" title="Altitude Log" />

    <div class={cardClass}>
      <div class={panelClass} bind:this={successBlock}>
        <h2 class={panelHeading}>Successful climbs</h2>
        <p class={panelBody}>8000M EVEREST x2 / K2 / MANASLU</p>
        <p class={panelBody}>7000M MT NOSHAQ</p>
        <p class={panelBody}>6000M MERA PEAK</p>
      </div>
      <div class={cx(panelClass, hiddenPanel)} bind:this={failBlock}>
        <h2 class={panelHeading}>Unsuccessful climbs</h2>
        <p class={panelBody}>8000M DHAULAGIRI / K2 WINTER / CHO OYU</p>
        <p class={panelBody}>6000M MT LOGAN</p>
        <p class={panelBody}>5000M KOH E PAMIR</p>
      </div>
    </div>
  </div>
</section>
