<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { css } from '$styled-system/css';
  import { gsap, brandEase, masterScrollController } from '$lib/motion';
  import {
    buildGridFlipTimeline,
    getTileClipPath,
    prefersReducedMotion,
    type GridFlipElements
  } from '$lib/motion/transitions/gridFlipTransition';
  import { getVideoSources } from '$lib/utils/video';

  /**
   * GridFlipOverlay
   *
   * Renders a 4x4 grid of tiles that flip center-out during
   * the ABOUT → SERVICES transition. Each tile has:
   * - Front face: ABOUT section's final beat background (clipped)
   * - Back face: Services intro video (clipped)
   *
   * The overlay activates when ABOUT progress >= 0.85 and
   * completes as SERVICES begins (ABOUT progress = 1.0).
   */

  // Props for content capture
  const aboutBgImage = '/pictures/earth puja (21 of 45).JPG'; // Beat 3 desktop bg
  const servicesVideoPath = '/videos/brand-film-x.mp4';

  let container: HTMLElement;
  let tiles: HTMLElement[] = [];
  let gridLines: HTMLElement[] = [];
  let videoElement: HTMLVideoElement;

  let timeline: gsap.core.Timeline | null = null;
  let unsubscribe: (() => void) | null = null;
  let isActive = false;

  // Progress thresholds for the transition
  const TRANSITION_START = 0.85; // ABOUT progress when flip begins
  const TRANSITION_END = 1.0;    // ABOUT progress when flip completes

  $: tileIndices = Array.from({ length: 16 }, (_, i) => i);
  $: videoSources = getVideoSources(servicesVideoPath);

  // Styles
  const containerClass = css({
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    pointerEvents: 'none',
    // Hidden by default - revealed by handleProgress() via autoAlpha
    opacity: 0,
    visibility: 'hidden',
    perspective: '1600px',
    perspectiveOrigin: '50% 50%'
  });

  // Tile wrapper - handles 3D transform
  const tileWrapperClass = css({
    position: 'absolute',
    inset: 0,
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'visible'
  });

  // Front face - ABOUT content (visible initially)
  const tileFrontClass = css({
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    // Dark overlay to match ABOUT section's styling
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(15, 23, 26, 0.3) 0%, rgba(15, 23, 26, 0.7) 100%)'
    }
  });

  // Back face - Services video (rotated 180deg on Y axis)
  const tileBackClass = css({
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    overflow: 'hidden'
  });

  // Video element inside back face
  const videoClass = css({
    position: 'absolute',
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    top: 0,
    left: 0
  });

  const gridLineClass = css({
    position: 'absolute',
    backgroundColor: 'eggToast',
    transformOrigin: 'center center',
    zIndex: 2
  });

  const verticalLineClass = css({
    width: '1px',
    top: 0,
    bottom: 0
  });

  const horizontalLineClass = css({
    height: '1px',
    left: 0,
    right: 0
  });

  function getLineStyle(index: number, isVertical: boolean): string {
    if (isVertical) {
      // 3 vertical lines at 25%, 50%, 75%
      const positions = [25, 50, 75];
      return `left: ${positions[index]}%;`;
    } else {
      // 3 horizontal lines at 25%, 50%, 75%
      const positions = [25, 50, 75];
      return `top: ${positions[index]}%;`;
    }
  }

  /**
   * Get the clip-path and position for each tile's video
   * The video needs to be positioned so only the correct portion shows
   */
  function getTileVideoStyle(index: number): string {
    const row = Math.floor(index / 4);
    const col = index % 4;
    // Position the video so the correct 25% portion is visible
    const left = -(col * 25);
    const top = -(row * 25);
    return `transform: translate(${left}vw, ${top}vh);`;
  }

  function handleProgress(progress: number, _isActive: boolean) {
    if (!timeline || !container) return;

    // Map ABOUT progress 0.85-1.0 to timeline progress 0-1
    if (progress >= TRANSITION_START) {
      if (!isActive) {
        isActive = true;
        gsap.set(container, { autoAlpha: 1, pointerEvents: 'auto' });
        // Start video playback when transition begins
        videoElement?.play().catch(() => {});
      }

      const transitionProgress = (progress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START);
      const clampedProgress = Math.min(1, Math.max(0, transitionProgress));

      if (prefersReducedMotion()) {
        // Reduced motion: simple crossfade
        gsap.set(container, { opacity: 1 - clampedProgress });
      } else {
        timeline.progress(clampedProgress);
      }
    } else if (isActive && progress < TRANSITION_START) {
      // Reset if scrolling back before transition
      isActive = false;
      timeline.progress(0);
      gsap.set(container, { autoAlpha: 0, pointerEvents: 'none' });
      videoElement?.pause();
    }
  }

  onMount(() => {
    if (!container || tiles.length !== 16 || gridLines.length !== 6) {
      console.warn('[GridFlipOverlay] Missing elements', {
        container: Boolean(container),
        tiles: tiles.length,
        gridLines: gridLines.length
      });
      return;
    }

    const elements: GridFlipElements = {
      tiles,
      gridLines,
      container
    };

    timeline = buildGridFlipTimeline({
      elements,
      onFlipStart: () => {
        console.debug('[GridFlipOverlay] Flip started');
      },
      onFlipComplete: () => {
        console.debug('[GridFlipOverlay] Flip complete');
        isActive = false;
      }
    });

    // Subscribe to ABOUT section progress
    unsubscribe = masterScrollController.onSectionProgress('about', handleProgress);
  });

  onDestroy(() => {
    unsubscribe?.();
    timeline?.kill();
    timeline = null;
  });
</script>

<div class={containerClass} bind:this={container} aria-hidden="true">
  <!-- Hidden video element for preloading -->
  <video
    bind:this={videoElement}
    class={css({ display: 'none' })}
    muted
    loop
    playsinline
    preload="auto"
  >
    {#each videoSources as source}
      <source src={source.src} type={source.type} />
    {/each}
  </video>

  <!-- 16 tiles (4x4 grid) with front/back faces -->
  {#each tileIndices as index}
    <div
      class={tileWrapperClass}
      style={`clip-path: ${getTileClipPath(index)};`}
      bind:this={tiles[index]}
    >
      <!-- Front face: ABOUT Beat 3 background -->
      <div
        class={tileFrontClass}
        style={`background-image: url('${aboutBgImage}');`}
      ></div>

      <!-- Back face: Services video (clipped portion) -->
      <div class={tileBackClass}>
        <video
          class={videoClass}
          style={getTileVideoStyle(index)}
          muted
          loop
          playsinline
          autoplay
        >
          {#each videoSources as source}
            <source src={source.src} type={source.type} />
          {/each}
        </video>
      </div>
    </div>
  {/each}

  <!-- 6 grid lines: 3 vertical + 3 horizontal -->
  {#each [0, 1, 2] as i}
    <div
      class={`${gridLineClass} ${verticalLineClass}`}
      style={getLineStyle(i, true)}
      bind:this={gridLines[i]}
    ></div>
  {/each}
  {#each [0, 1, 2] as i}
    <div
      class={`${gridLineClass} ${horizontalLineClass}`}
      style={getLineStyle(i, false)}
      bind:this={gridLines[i + 3]}
    ></div>
  {/each}
</div>
