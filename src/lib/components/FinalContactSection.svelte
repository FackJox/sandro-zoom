<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
  import { CameraRevealScene } from '$lib/components/camera';
  import { contactInfo } from '$lib/data/contact';

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
    });

    // Register section element with master controller
    const unregisterSection = masterScrollController.registerSection('finalContact', root, tl);

    // Store cleanup
    (tl as any).__masterCleanup = () => {
      unsubscribeMaster();
      unregisterSection();
    };

    // Simple fade-in animation for contact block
    tl.fromTo(
      contactBlock,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.2
    );

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('final-contact', () => tl);
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
    zIndex: 0
  });

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
  <!-- 3D Camera Scene with LCD overlay -->
  <div class={sceneContainerClass}>
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
