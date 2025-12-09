<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { css } from '$styled-system/css';
  import { heading } from '$styled-system/recipes';
  import { gsap, brandEase, masterScrollController } from '$lib/motion';
  import { serviceCredits, servicesHeading } from '$lib/data/services';

  /**
   * CameraZoomOutOverlay
   *
   * Framework 5 §3: 3D Camera Zoom-Out Transition
   *
   * When Services section reaches ~92% progress, this overlay activates and:
   * 1. Displays a frozen snapshot of the services credits as a 3D plane
   * 2. Animates the plane: scale 1.0 → 0.4, translate to bottom-right, rotate
   * 3. Reveals a camera body around the shrinking plane
   * 4. Shows a scenic background behind everything
   *
   * The shrinking services plane becomes the camera's LCD screen.
   */

  // Animation configuration per Framework 5 spec
  const CONFIG = {
    // Transition triggers at 92% of services section
    TRANSITION_START: 0.92,
    TRANSITION_END: 1.0,

    // Target transform values (plane becomes camera LCD)
    TARGET_SCALE: 0.35,
    TARGET_X_PERCENT: 35,  // % from center toward right
    TARGET_Y_PERCENT: 40,  // % from center toward bottom
    TARGET_ROTATE_Y: 15,   // degrees
    TARGET_ROTATE_X: -10,  // degrees

    // Camera reveal timing (0-1 within transition)
    CAMERA_FADE_START: 0.3,
    CAMERA_FADE_END: 0.8,

    // Background reveal timing
    BG_FADE_START: 0.1,
    BG_FADE_END: 0.5
  } as const;

  let container: HTMLElement;
  let servicesPlane: HTMLElement;
  let cameraLayer: HTMLElement;
  let backgroundLayer: HTMLElement;

  let timeline: gsap.core.Timeline | null = null;
  let unsubscribe: (() => void) | null = null;
  let isActive = false;

  // Format credits for display (matches ServicesSection styling)
  const formattedCredits = serviceCredits.map((credit) =>
    credit.subtitle
      ? `${credit.label} (${credit.subtitle})`.toUpperCase()
      : credit.label.toUpperCase()
  );

  // Background image (same as FinalContactSection)
  const backgroundImage = '/pictures/earth puja (21 of 45).JPG';

  function handleProgress(progress: number) {
    if (!timeline || !container) return;

    if (progress >= CONFIG.TRANSITION_START) {
      if (!isActive) {
        isActive = true;
        gsap.set(container, { autoAlpha: 1, pointerEvents: 'auto' });
      }

      // Map services progress 0.92-1.0 to timeline progress 0-1
      const transitionProgress =
        (progress - CONFIG.TRANSITION_START) /
        (CONFIG.TRANSITION_END - CONFIG.TRANSITION_START);
      const clampedProgress = Math.min(1, Math.max(0, transitionProgress));

      timeline.progress(clampedProgress);
    } else if (isActive && progress < CONFIG.TRANSITION_START) {
      // Reset if scrolling back before transition
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

    // Initial state: services plane full screen, camera and bg hidden
    gsap.set(servicesPlane, {
      scale: 1,
      xPercent: 0,
      yPercent: 0,
      rotateX: 0,
      rotateY: 0
    });
    gsap.set(cameraLayer, { autoAlpha: 0 });
    gsap.set(backgroundLayer, { autoAlpha: 0 });

    // Background fades in first (creates depth)
    tl.to(backgroundLayer, {
      autoAlpha: 1,
      duration: CONFIG.BG_FADE_END - CONFIG.BG_FADE_START
    }, CONFIG.BG_FADE_START);

    // Services plane transforms: shrinks and moves to bottom-right
    tl.to(servicesPlane, {
      scale: CONFIG.TARGET_SCALE,
      xPercent: CONFIG.TARGET_X_PERCENT,
      yPercent: CONFIG.TARGET_Y_PERCENT,
      rotateX: CONFIG.TARGET_ROTATE_X,
      rotateY: CONFIG.TARGET_ROTATE_Y,
      duration: 1,
      ease: brandEase
    }, 0);

    // Camera body fades in as plane shrinks
    tl.to(cameraLayer, {
      autoAlpha: 1,
      duration: CONFIG.CAMERA_FADE_END - CONFIG.CAMERA_FADE_START
    }, CONFIG.CAMERA_FADE_START);

    // At end, fade out entire overlay to reveal actual FinalContactSection
    tl.to(container, {
      autoAlpha: 0,
      duration: 0.15
    }, 0.9);

    return tl;
  }

  onMount(() => {
    if (!container || !servicesPlane || !cameraLayer || !backgroundLayer) {
      console.warn('[CameraZoomOutOverlay] Missing elements');
      return;
    }

    // Initially hidden
    gsap.set(container, { autoAlpha: 0, pointerEvents: 'none' });

    timeline = buildTimeline();

    // Subscribe to services section progress
    unsubscribe = masterScrollController.onSectionProgress('services', handleProgress);
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
    zIndex: 60,  // Above GridFlipOverlay (50)
    pointerEvents: 'none',
    perspective: '1200px',
    perspectiveOrigin: '50% 50%'
  });

  const backgroundClass = css({
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0
  });

  const cameraLayerClass = css({
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: '2rem',
    pointerEvents: 'none'
  });

  // Camera body silhouette (simplified SVG-based representation)
  const cameraBodyClass = css({
    width: '400px',
    height: '280px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    border: '3px solid #333',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.05)',
    // Position to frame around the LCD
    transform: 'translate(-10%, -10%)'
  });

  // Camera lens representation
  const cameraLensClass = css({
    position: 'absolute',
    left: '-80px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)',
    border: '4px solid #444',
    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: '15px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a1a3a 0%, #0a0a1a 100%)',
      border: '2px solid #333'
    }
  });

  // LCD screen cutout (where the services plane aligns)
  const lcdCutoutClass = css({
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '180px',
    height: '120px',
    backgroundColor: '#0f171a',
    borderRadius: '4px',
    border: '2px solid rgba(246, 198, 5, 0.3)'
  });

  // Services plane (the element that shrinks into LCD)
  const servicesPlaneClass = css({
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    backgroundColor: 'blackStallion',
    transformStyle: 'preserve-3d',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    transformOrigin: '50% 50%'
  });

  const creditsLabelClass = css({
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: 'eggToast',
    borderBottomWidth: '1px',
    borderColor: 'eggToast',
    paddingBottom: '0.75rem',
    fontSize: { base: '0.875rem', md: '1rem' }
  });

  const creditLineClass = css({
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'silverplate',
    lineHeight: 1.4,
    fontSize: { base: '1.25rem', md: '1.5rem' },
    textAlign: 'center'
  });
</script>

<div class={containerClass} bind:this={container} aria-hidden="true">
  <!-- Background scene (revealed first) -->
  <div
    class={backgroundClass}
    bind:this={backgroundLayer}
    style="background-image: url('{backgroundImage}');"
  ></div>

  <!-- Camera body layer (fades in as plane shrinks) -->
  <div class={cameraLayerClass} bind:this={cameraLayer}>
    <div class={cameraBodyClass}>
      <div class={cameraLensClass}></div>
      <div class={lcdCutoutClass}></div>
    </div>
  </div>

  <!-- Services content plane (transforms into LCD) -->
  <div class={servicesPlaneClass} bind:this={servicesPlane}>
    <h2 class={`${heading({ size: 'sm' })} ${creditsLabelClass}`}>{servicesHeading}</h2>
    {#each formattedCredits as credit}
      <p class={creditLineClass}>{credit}</p>
    {/each}
  </div>
</div>
