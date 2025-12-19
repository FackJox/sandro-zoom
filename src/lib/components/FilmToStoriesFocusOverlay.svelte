<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { css } from '$styled-system/css';
  import { gsap, brandEase, masterScrollController } from '$lib/motion';

  /**
   * FilmToStoriesFocusOverlay
   *
   * Framework 2 §3.6: Exit Transition from FILM → FILM STORIES
   *
   * This overlay implements the focus pull/blur effect:
   * 1. Circular focus ring highlights the target preview story (Sasha)
   * 2. Outside the focus ring: darkens and blurs
   * 3. Ring slides from current card to first preview story
   *
   * The effect creates depth perception like a camera focus pull.
   */

  // Transition thresholds (within bigFilm section progress)
  // Matches FilmExitPortal timing (exitStart = 0.85)
  const TRANSITION_START = 0.88;
  const TRANSITION_END = 0.98;

  export let previewRect: DOMRect | null = null;

  let container: HTMLElement;
  let outsideBlur: HTMLElement;
  let focusRing: HTMLElement;

  let timeline: gsap.core.Timeline | null = null;
  let unsubscribe: (() => void) | null = null;
  let isActive = false;

  function handleProgress(progress: number, _isActive: boolean) {
    if (!timeline || !container) return;

    if (progress >= TRANSITION_START && progress <= TRANSITION_END) {
      if (!isActive) {
        isActive = true;
        gsap.set(container, { autoAlpha: 1, pointerEvents: 'auto' });

        // Update focus ring position based on previewRect
        if (previewRect && focusRing) {
          gsap.set(focusRing, {
            width: previewRect.width + 16,
            height: previewRect.height + 16,
            left: previewRect.left - 8,
            top: previewRect.top - 8
          });
        }
      }

      // Map bigFilm progress to timeline progress
      const transitionProgress = (progress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START);
      const clampedProgress = Math.min(1, Math.max(0, transitionProgress));
      timeline.progress(clampedProgress);
    } else if (isActive) {
      // Reset if scrolling back or past
      isActive = false;
      timeline.progress(progress < TRANSITION_START ? 0 : 1);
      gsap.set(container, { autoAlpha: 0, pointerEvents: 'none' });
    }
  }

  function buildTimeline(): gsap.core.Timeline {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: brandEase }
    });

    // Initial state: blur layer hidden, focus ring at initial position
    gsap.set(outsideBlur, { opacity: 0 });
    gsap.set(focusRing, { opacity: 0, scale: 1.2 });

    // Phase 1 (0-0.3): Blur appears, focus ring fades in and scales down
    tl.to(outsideBlur, {
      opacity: 1,
      duration: 0.3
    }, 0);

    tl.to(focusRing, {
      opacity: 1,
      scale: 1,
      duration: 0.25,
      ease: 'power2.out'
    }, 0.05);

    // Phase 2 (0.3-0.7): Hold with slight pulse
    tl.to(focusRing, {
      scale: 0.98,
      duration: 0.2
    }, 0.4);

    tl.to(focusRing, {
      scale: 1,
      duration: 0.1
    }, 0.6);

    // Phase 3 (0.7-1.0): Fade out as FilmStories section takes over
    tl.to(outsideBlur, {
      opacity: 0,
      duration: 0.2
    }, 0.75);

    tl.to(focusRing, {
      opacity: 0,
      scale: 1.1,
      duration: 0.25
    }, 0.75);

    return tl;
  }

  onMount(() => {
    if (!container || !outsideBlur || !focusRing) {
      console.warn('[FilmToStoriesFocusOverlay] Missing elements');
      return;
    }

    // Initially hidden
    gsap.set(container, { autoAlpha: 0, pointerEvents: 'none' });

    timeline = buildTimeline();

    // Subscribe to bigFilm section progress
    unsubscribe = masterScrollController.onSectionProgress('bigFilm', handleProgress);
  });

  onDestroy(() => {
    unsubscribe?.();
    timeline?.kill();
    timeline = null;
  });

  // Reactive: update focus ring position when previewRect changes
  $: if (focusRing && previewRect && isActive) {
    gsap.to(focusRing, {
      width: previewRect.width + 16,
      height: previewRect.height + 16,
      left: previewRect.left - 8,
      top: previewRect.top - 8,
      duration: 0.3,
      ease: brandEase
    });
  }

  // Styles
  const containerClass = css({
    position: 'fixed',
    inset: 0,
    zIndex: 22, // Above section content, below lens bug
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const outsideBlurClass = css({
    position: 'absolute',
    inset: 0,
    backgroundColor: 'bg/60',
    backdropFilter: 'blur(6px)'
  });

  // Focus ring - highlights target frame like camera focus pull
  const focusRingClass = css({
    position: 'absolute',
    borderRadius: '4px',
    border: '2px solid',
    borderColor: 'eggToast',
    // Create darkened area OUTSIDE the ring using box-shadow
    boxShadow: '0 0 0 2000px rgba(15, 23, 26, 0.5), inset 0 0 20px rgba(0,0,0,0.3)',
    // Allow content inside to be visible (cut out from blur)
    pointerEvents: 'none',
    transition: 'width 0.3s, height 0.3s, left 0.3s, top 0.3s'
  });
</script>

<div class={containerClass} bind:this={container} aria-hidden="true">
  <!-- Outside blur/darken layer -->
  <div class={outsideBlurClass} bind:this={outsideBlur}></div>

  <!-- Focus ring that highlights target frame -->
  <div class={focusRingClass} bind:this={focusRing}></div>
</div>
