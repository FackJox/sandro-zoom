<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
  import { attachLensToSection } from '$lib/motion/lensTimeline';
  import { CameraRevealScene } from '$lib/components/camera';
  import { contactInfo } from '$lib/data/contact';
  import DebugOverlay from '$lib/components/DebugOverlay.svelte';
  import { debugMode, DEBUG_COLORS } from '$lib/stores/debug';

  // Camera transform state for idle animation and pointer parallax
  let cameraTransformOffset = $state({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  let idleTimeline: gsap.core.Timeline | null = null;

  /**
   * FinalContactSection - 3D Camera Reveal
   *
   * Framework 5 design:
   * - 3D camera model with LCD showing services credits
   * - Scenic mountain background
   * - Contact text overlay
   */

  let root: HTMLElement;
  let contactBlock: HTMLElement;
  let portalMask: HTMLDivElement | null = null;
  let portalTimeline: gsap.core.Timeline | null = null;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;
  let wasActive = false;

  export function receivePortalIntro(detail?: { focusRect?: DOMRect }) {
    if (!portalMask) return;
    // NOTE: Section visibility is controlled by masterScrollController.applySectionVisibility()
    // No manual gsap.set(root, { autoAlpha: 1 }) needed here
    portalTimeline?.kill();

    const fallbackRect = contactBlock?.getBoundingClientRect();
    if (!fallbackRect) return;

    const startRect = detail?.focusRect ?? fallbackRect;
    const start = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2
    };
    const targetRect = fallbackRect;
    const target = {
      x: targetRect.left + targetRect.width / 2,
      y: targetRect.top + targetRect.height / 2
    };

    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });
    portalTimeline
      .set(portalMask, { opacity: 1, width: 40, height: 40, left: start.x, top: start.y })
      .to(portalMask, { left: target.x, top: target.y, duration: 0.45 })
      .to(portalMask, { width: targetRect.width * 1.4, height: targetRect.width * 1.4, duration: 0.4 }, '>-0.2')
      .to(portalMask, { width: '160vw', height: '160vw', duration: 0.6 }, '>-0.1')
      .to(portalMask, { opacity: 0, duration: 0.3 }, '>-0.15');
  }

  /**
   * Setup camera idle animation (Framework 5 §4.3)
   * Subtle breathing motion - slow vertical bob
   */
  function setupIdleAnimation() {
    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    idleTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    idleTimeline.to(cameraTransformOffset, {
      y: 8,
      rotateX: 0.5,
      duration: 3,
      ease: 'sine.inOut'
    });
  }

  /**
   * Handle pointer parallax for camera (Framework 5 §4.3)
   * Camera moves slightly with mouse position on desktop
   */
  function handlePointerMove(event: MouseEvent) {
    if (typeof window === 'undefined') return;

    // Only apply parallax on desktop
    if (window.innerWidth < 768) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate offset from center (-1 to 1)
    const offsetX = (event.clientX - centerX) / centerX;
    const offsetY = (event.clientY - centerY) / centerY;

    // Apply subtle parallax (few degrees of rotation)
    gsap.to(cameraTransformOffset, {
      rotateY: offsetX * 3,  // ±3 degrees
      rotateX: -offsetY * 2, // ±2 degrees (inverted for natural feel)
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  onMount(async () => {
    await tick();

    timeline?.kill();
    timelineDisposer?.();
    timelineDisposer = null;

    if (!root || !contactBlock) return;

    // Create paused timeline - controlled by master scroll controller
    const tl = gsap.timeline({
      defaults: { ease: brandEase },
      paused: true
    });

    // Register with master scroll controller for progress updates
    const unsubscribeMaster = masterScrollController.onSectionProgress('finalContact', (progress, isActive) => {
      tl.progress(progress);

      // Handle lens attachment based on active state
      if (isActive && !wasActive) {
        console.debug('[finalContact] enter');
        attachLensToSection('finalContact');
        // Start idle animation when section becomes active
        if (!idleTimeline) {
          setupIdleAnimation();
        }
      } else if (!isActive && wasActive && progress <= 0.05) {
        console.debug('[finalContact] leaveBack → services');
        attachLensToSection('services');
      }
      // No leave case - this is the final section
      wasActive = isActive;
    });

    // Register section element with master controller
    const unregisterSection = masterScrollController.registerSection('finalContact', root, tl);

    // Store cleanup
    (tl as any).__masterCleanup = () => {
      unsubscribeMaster();
      unregisterSection();
    };

    // Contact text fade in 0→1 with rise (+10px→0) per Framework 5 §4.3
    tl.fromTo(
      contactBlock,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: brandEase },
      0.2
    );

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('final-contact', () => tl);
    }

    // Add pointer parallax listener
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handlePointerMove);
    }
  });

  onDestroy(() => {
    (timeline as any)?.__masterCleanup?.();
    timeline?.kill();
    timeline = null;
    timelineDisposer?.();
    timelineDisposer = null;
    portalTimeline?.kill();
    portalTimeline = null;
    idleTimeline?.kill();
    idleTimeline = null;

    // Remove pointer parallax listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handlePointerMove);
    }
  });

  // Styles
  const sectionClass = css({
    position: 'absolute',
    inset: 0,
    backgroundColor: 'blackStallion',
    color: 'text',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    visibility: 'hidden'
  });

  const sceneContainerClass = css({
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    transformStyle: 'preserve-3d',
    transition: 'transform 0.1s ease-out'
  });

  // Compute scene container style with idle + parallax transforms
  const sceneContainerStyle = $derived(
    `transform: translateY(${cameraTransformOffset.y}px) rotateX(${cameraTransformOffset.rotateX}deg) rotateY(${cameraTransformOffset.rotateY}deg);`
  );

  const contactClass = css({
    position: 'relative',
    zIndex: 2,
    maxWidth: '36rem',
    textAlign: 'center',
    px: { base: layout.safeX.base, md: layout.safeX.md },
    py: { base: '4rem', md: '5rem' }
  });

  const headingClass = cx(
    heading({ size: 'md' }),
    css({
      color: 'text',
      marginBottom: '2rem',
      lineHeight: 1.4
    })
  );

  const contactLineClass = cx(
    body({ tone: 'standard' }),
    css({
      mt: '0.75rem',
      color: 'eggToast',
      letterSpacing: '0.1em'
    })
  );

  const portalMaskClass = css({
    position: 'fixed',
    width: '50px',
    height: '50px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    opacity: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    zIndex: 20,
    transform: 'translate(-50%, -50%)'
  });

</script>

<section bind:this={root} class={sectionClass} id="final-contact">
  {#if $debugMode}
    <DebugOverlay label="finalContact" color={DEBUG_COLORS.finalContact.color} index={DEBUG_COLORS.finalContact.index} />
  {/if}
  <!-- 3D Camera Scene with LCD overlay (transforms for idle + parallax) -->
  <div class={sceneContainerClass} style={sceneContainerStyle}>
    <CameraRevealScene />
  </div>

  <!-- Contact content -->
  <div class={contactClass} bind:this={contactBlock}>
    <h2 class={headingClass}>{contactInfo.heading}</h2>
    <p class={contactLineClass}>{contactInfo.phone}</p>
    <p class={contactLineClass}>{contactInfo.email}</p>
  </div>

  <!-- Portal mask for transition -->
  <div class={portalMaskClass} bind:this={portalMask} aria-hidden="true"></div>
</section>
