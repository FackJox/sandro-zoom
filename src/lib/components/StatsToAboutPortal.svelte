<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { css } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { gsap, brandEase, masterScrollController } from '$lib/motion';
  import { unsuccessfulClimbs, formatStatLine } from '$lib/data/climbing-stats';
  import { aboutBeats } from '$lib/data/about-beats';

  /**
   * StatsToAboutPortal
   *
   * Framework 4 §2: Entry Transition from PHOTO → ABOUT
   *
   * This overlay implements the sophisticated portal transition:
   * 1. Circular focus ring appears centered over stats card
   * 2. Outside the circle: darkens and blurs
   * 3. Inside the circle: stats text crossfades to About intro text
   * 4. BG crossfades from basecamp (stats) to frontline (About Beat 1)
   * 5. Circle expands to fill viewport, edges snap to rectangle
   */

  // Transition thresholds (within photoStats section progress)
  const TRANSITION_START = 0.85;
  const TRANSITION_END = 1.0;

  // Content from data sources
  const statsTitle = unsuccessfulClimbs.title;
  const statsLines = unsuccessfulClimbs.lines.map(formatStatLine);
  const aboutIntroText = aboutBeats[0].body[0]; // First line of About Beat 1

  // Background images
  const basecampBg = '/videos/documentary-sierra.mp4'; // Stats section BG (video still)
  const frontlineBg = aboutBeats[0].background.desktop || aboutBeats[0].background.mobile;

  let container: HTMLElement;
  let portalCircle: HTMLElement;
  let outsideBlur: HTMLElement;
  let statsContent: HTMLElement;
  let aboutContent: HTMLElement;
  let basecampLayer: HTMLElement;
  let frontlineLayer: HTMLElement;

  let timeline: gsap.core.Timeline | null = null;
  let unsubscribe: (() => void) | null = null;
  let isActive = false;

  function handleProgress(progress: number, _isActive: boolean) {
    if (!timeline || !container) return;

    if (progress >= TRANSITION_START) {
      if (!isActive) {
        isActive = true;
        gsap.set(container, { autoAlpha: 1, pointerEvents: 'auto' });
      }

      // Map photoStats progress 0.85-1.0 to timeline progress 0-1
      const transitionProgress = (progress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START);
      const clampedProgress = Math.min(1, Math.max(0, transitionProgress));
      timeline.progress(clampedProgress);
    } else if (isActive && progress < TRANSITION_START) {
      // Reset if scrolling back
      isActive = false;
      timeline.progress(0);
      gsap.set(container, { autoAlpha: 0, pointerEvents: 'none' });
    }
  }

  function buildTimeline(): gsap.core.Timeline {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: brandEase }
    });

    // Initial state: small circle, stats visible, basecamp bg visible
    gsap.set(portalCircle, {
      width: '120px',
      height: '120px',
      clipPath: 'circle(50% at 50% 50%)'
    });
    gsap.set(outsideBlur, { opacity: 0 });
    gsap.set(statsContent, { opacity: 1, y: 0 });
    gsap.set(aboutContent, { opacity: 0, y: 20 });
    gsap.set(basecampLayer, { opacity: 1 });
    gsap.set(frontlineLayer, { opacity: 0 });

    // Phase 1 (0-0.15): Circle appears, outside darkens/blurs
    tl.to(outsideBlur, {
      opacity: 1,
      duration: 0.15
    }, 0);

    // Phase 2 (0.15-0.45): Text crossfade inside circle
    tl.to(statsContent, {
      opacity: 0,
      y: -15,
      duration: 0.2
    }, 0.15);

    tl.to(aboutContent, {
      opacity: 1,
      y: 0,
      duration: 0.25
    }, 0.25);

    // Phase 3 (0.3-0.6): BG crossfade from basecamp to frontline
    tl.to(basecampLayer, {
      opacity: 0,
      duration: 0.3
    }, 0.3);

    tl.to(frontlineLayer, {
      opacity: 1,
      duration: 0.3
    }, 0.3);

    // Phase 4 (0.45-0.85): Circle grows to medium, then expands to fill
    tl.to(portalCircle, {
      width: '300px',
      height: '300px',
      duration: 0.2
    }, 0.45);

    tl.to(portalCircle, {
      width: '200vmax',
      height: '200vmax',
      duration: 0.35
    }, 0.65);

    // Phase 5 (0.9-1.0): Fade out entire overlay to reveal actual About section
    tl.to(container, {
      autoAlpha: 0,
      duration: 0.1
    }, 0.9);

    return tl;
  }

  onMount(() => {
    if (!container || !portalCircle || !outsideBlur || !statsContent || !aboutContent) {
      console.warn('[StatsToAboutPortal] Missing elements');
      return;
    }

    // Initially hidden
    gsap.set(container, { autoAlpha: 0, pointerEvents: 'none' });

    timeline = buildTimeline();

    // Subscribe to photoStats section progress
    unsubscribe = masterScrollController.onSectionProgress('photoStats', handleProgress);
  });

  onDestroy(() => {
    unsubscribe?.();
    timeline?.kill();
    timeline = null;
  });

  // Styles
  const containerClass = css({
    position: 'fixed',
    inset: 0,
    zIndex: 45, // Below GridFlipOverlay (50), above sections
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const outsideBlurClass = css({
    position: 'absolute',
    inset: 0,
    backgroundColor: 'bg/70',
    backdropFilter: 'blur(8px)'
  });

  // Background layers (inside the portal)
  const bgLayerClass = css({
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  });

  // The circular portal window
  const portalCircleClass = css({
    position: 'relative',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Egg Toast border ring (Framework 4 spec)
    boxShadow: '0 0 0 2px {colors.eggToast}, 0 0 40px 10px rgba(15, 23, 26, 0.8)'
  });

  // Content container inside portal
  const portalContentClass = css({
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '1.5rem',
    maxWidth: '320px'
  });

  // Stats content (fades out)
  const statsContentClass = css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem'
  });

  // About content (fades in)
  const aboutContentClass = css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem'
  });

  const statsHeadingClass = css({
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'eggToast',
    marginBottom: '0.5rem'
  });

  const statsLineClass = css({
    fontSize: '0.65rem',
    color: 'text',
    lineHeight: 1.4
  });

  const aboutTextClass = css({
    fontSize: '0.85rem',
    color: 'text',
    lineHeight: 1.6,
    fontFamily: 'plex'
  });
</script>

<div class={containerClass} bind:this={container} aria-hidden="true">
  <!-- Outside blur/darken layer -->
  <div class={outsideBlurClass} bind:this={outsideBlur}></div>

  <!-- The circular portal -->
  <div class={portalCircleClass} bind:this={portalCircle}>
    <!-- Background layers inside portal -->
    <div
      class={bgLayerClass}
      bind:this={basecampLayer}
      style="background-image: linear-gradient(rgba(15,23,26,0.6), rgba(15,23,26,0.8)), url('/pictures/basecamp-drone.jpg');"
    ></div>
    <div
      class={bgLayerClass}
      bind:this={frontlineLayer}
      style="background-image: linear-gradient(rgba(15,23,26,0.5), rgba(15,23,26,0.7)), url('{frontlineBg}');"
    ></div>

    <!-- Content container -->
    <div class={portalContentClass}>
      <!-- Stats content (visible initially, fades out) -->
      <div class={statsContentClass} bind:this={statsContent}>
        <h3 class={statsHeadingClass}>{statsTitle}</h3>
        {#each statsLines as line}
          <p class={statsLineClass}>{line}</p>
        {/each}
      </div>

      <!-- About intro content (fades in) -->
      <div class={aboutContentClass} bind:this={aboutContent}>
        <p class={aboutTextClass}>{aboutIntroText}</p>
      </div>
    </div>
  </div>
</div>
