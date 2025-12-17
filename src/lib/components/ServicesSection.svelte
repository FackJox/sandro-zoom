<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
  import { attachLensToSection } from '$lib/motion/lensTimeline';
  import { getVideoSources } from '$lib/utils/video';
  import { serviceCredits, servicesHeading, servicesCta } from '$lib/data/services';

  /**
   * ServicesSection - "Credits on Black"
   *
   * Framework 5 design:
   * - Video intro frame (full-bleed, fades with lens vignette on scroll)
   * - Black Stallion background revealed as video fades
   * - Credits-style centered typography (all caps Trade Gothic)
   * - Service lines scroll through "hero line" center position
   * - CTA: "ONE MORE SHOT ↓ / SCROLL FOR FINAL CONTACT"
   */

  // Timeline progress markers (extracted for clarity)
  const TIMELINE = {
    VIDEO_HOLD_END: 0.15,
    VIDEO_FADE_START: 0.15,
    VIDEO_FADE_END: 0.35,
    LABEL_IN_START: 0.35,
    LABEL_IN_END: 0.45,
    CREDITS_START: 0.45,
    CREDITS_END: 0.80,
    CTA_START: 0.80,
    CTA_END: 0.90,
    PORTAL_START: 0.92
  } as const;

  type CreditLine = {
    label: string;
    ref: HTMLElement | null;
  };

  // Derive credits from data file with ref slots for GSAP animation
  const credits: CreditLine[] = serviceCredits.map((credit) => ({
    label: credit.subtitle
      ? `${credit.label} (${credit.subtitle})`.toUpperCase()
      : credit.label.toUpperCase(),
    ref: null
  }));

  let root: HTMLElement;
  let videoLayer: HTMLVideoElement;
  let vignetteOverlay: HTMLDivElement;
  let creditsLabel: HTMLElement;
  let creditsContainer: HTMLElement;
  let cta: HTMLElement;
  let portalMask: HTMLDivElement | null = null;

  const dispatch = createEventDispatcher<{ 'services:exit': { focusRect: DOMRect } }>();

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;
  let portalTimeline: gsap.core.Timeline | null = null;
  let wasActive = false;

  // Entry portal from AboutSection
  export function receivePortalIntro(detail?: { focusRect?: DOMRect }) {
    if (!portalMask) return;
    // NOTE: Section visibility is controlled by masterScrollController.applySectionVisibility()
    // No manual gsap.set(root, { autoAlpha: 1 }) needed here
    portalTimeline?.kill();

    const fallbackRect = new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 100, 100);
    const startRect = detail?.focusRect ?? fallbackRect;
    const targetRect = creditsContainer?.getBoundingClientRect() ?? startRect;

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    portalTimeline = gsap.timeline({ defaults: { ease: brandEase } });
    portalTimeline
      .set(portalMask, {
        opacity: 1,
        width: startRect.width || 60,
        height: startRect.width || 60,
        left: startX,
        top: startY
      })
      .to(portalMask, {
        left: targetX,
        top: targetY,
        duration: 0.4
      })
      .to(portalMask, {
        width: window.innerWidth * 1.6,
        height: window.innerWidth * 1.6,
        duration: 0.5
      }, '>-0.2')
      .to(portalMask, {
        opacity: 0,
        duration: 0.3
      }, '>-0.15');
  }

  onMount(async () => {
    await tick();
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;

    const creditLines = credits.map((c) => c.ref).filter(Boolean) as HTMLElement[];
    if (!root || !videoLayer || !creditsContainer || !cta || !vignetteOverlay) return;

    // Create paused timeline - controlled by master scroll controller
    const tl = gsap.timeline({
      defaults: { ease: brandEase },
      paused: true
    });

    // Register with master scroll controller for progress updates
    const unsubscribeMaster = masterScrollController.onSectionProgress('services', (progress, isActive) => {
      tl.progress(progress);

      // Handle lens attachment based on active state
      if (isActive && !wasActive) {
        console.debug('[services] enter');
        attachLensToSection('services');
      } else if (!isActive && wasActive && progress >= 0.95) {
        console.debug('[services] leave → finalContact');
        attachLensToSection('finalContact');
      } else if (!isActive && wasActive && progress <= 0.05) {
        console.debug('[services] leaveBack → about');
        attachLensToSection('about');
      }
      wasActive = isActive;
    });

    // Register section element with master controller
    const unregisterSection = masterScrollController.registerSection('services', root, tl);

    // Store cleanup
    (tl as any).__masterCleanup = () => {
      unsubscribeMaster();
      unregisterSection();
    };

    // Initial states
    gsap.set(videoLayer, { opacity: 1 });
    gsap.set(vignetteOverlay, { opacity: 0 });
    gsap.set(creditsLabel, { autoAlpha: 0, y: 20 });
    // Credits start below viewport center
    gsap.set(creditLines, { autoAlpha: 0, yPercent: 100 });
    gsap.set(cta, { autoAlpha: 0, y: 40 });

    /**
     * Timeline structure per Framework 5:
     * 0.00-0.15: Video visible at full opacity
     * 0.15-0.35: Video fades with lens vignette effect
     * 0.35-0.45: "SERVICES / CREDITS" label fades in
     * 0.45-0.80: Credit lines scroll through "hero line" center
     * 0.80-0.90: CTA fades in
     * 0.90-1.00: Portal mask exit
     */

    // 0.00-0.15: Video visible (no animation needed, just hold)
    tl.addLabel('videoHold', 0);

    // 0.15-0.35: Video fades with lens vignette closing effect
    tl.addLabel('videoFade', TIMELINE.VIDEO_FADE_START);
    // Vignette closes in (lens closing effect)
    tl.to(vignetteOverlay, {
      opacity: 1,
      duration: 0.2,
      ease: 'power2.inOut'
    }, 'videoFade');
    // Video fades out behind vignette
    tl.to(videoLayer, {
      opacity: 0,
      duration: 0.2
    }, 'videoFade+=0.05');

    // 0.35-0.45: Credits label fades in
    tl.addLabel('labelIn', TIMELINE.LABEL_IN_START);
    tl.to(creditsLabel, { autoAlpha: 1, y: 0, duration: 0.1 }, 'labelIn');

    // 0.45-0.80: Credit lines scroll through "hero line" center
    // Each line: rises from below → holds at center (hero position) → continues upward
    tl.addLabel('creditsRoll', TIMELINE.CREDITS_START);

    const creditDuration = (TIMELINE.CREDITS_END - TIMELINE.CREDITS_START) / creditLines.length;
    const heroHoldDuration = creditDuration * 0.4; // 40% of each line's time is spent at center
    const enterDuration = creditDuration * 0.35;   // Time to enter from below
    const exitDuration = creditDuration * 0.25;    // Time to exit upward

    creditLines.forEach((line, i) => {
      const lineStart = TIMELINE.CREDITS_START + i * creditDuration;

      // Phase 1: Enter from below to center (hero position)
      tl.to(line, {
        autoAlpha: 1,
        yPercent: 0,
        duration: enterDuration,
        ease: brandEase
      }, lineStart);

      // Phase 2: Hold at center (hero line)
      // No animation needed - just a pause at yPercent: 0

      // Phase 3: Exit upward and slightly fade
      const exitStart = lineStart + enterDuration + heroHoldDuration;

      // Don't exit the last line - it stays visible with CTA
      if (i < creditLines.length - 1) {
        tl.to(line, {
          yPercent: -80,
          autoAlpha: 0.3,
          duration: exitDuration,
          ease: 'power1.in'
        }, exitStart);
      }
    });

    // 0.80-0.90: CTA fades in with subtle rise
    tl.addLabel('ctaIn', TIMELINE.CTA_START);
    tl.to(cta, { autoAlpha: 1, y: 0, duration: 0.1 }, 'ctaIn');

    // 0.90-1.00: Portal mask exit animation
    tl.addLabel('portalExit', TIMELINE.PORTAL_START);
    tl.call(() => {
      const rect = cta?.getBoundingClientRect();
      if (!rect || !portalMask) return;

      gsap.set(portalMask, {
        opacity: 1,
        width: 36,
        height: 36,
        left: rect.left + rect.width / 2,
        top: rect.top + rect.height / 2
      });

      gsap.to(portalMask, {
        width: rect.width * 1.8,
        height: rect.width * 1.8,
        duration: 0.5,
        ease: brandEase,
        onComplete: () => {
          portalMask && gsap.set(portalMask, { opacity: 0 });
          dispatch('services:exit', { focusRect: rect });
        }
      });
    }, undefined, 'portalExit');

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('services', () => tl);
    }
  });

  onDestroy(() => {
    (timeline as any)?.__masterCleanup?.();
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    visibility: 'hidden'
  });

  const videoClass = css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1
  });

  // Lens vignette overlay - radial gradient that closes in like a lens
  const vignetteClass = css({
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'none',
    background: `radial-gradient(
      ellipse 80% 80% at 50% 50%,
      transparent 0%,
      transparent 30%,
      rgba(15, 23, 26, 0.3) 50%,
      rgba(15, 23, 26, 0.7) 70%,
      rgba(15, 23, 26, 1) 100%
    )`
  });

  const creditsContainerClass = css({
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    textAlign: 'center',
    px: { base: layout.safeX.base, md: layout.safeX.md },
    py: '2rem',
    minHeight: '50vh'
  });

  const creditsLabelClass = cx(
    heading({ size: 'sm' }),
    css({
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
      color: 'eggToast',
      borderBottomWidth: '1px',
      borderColor: 'eggToast',
      paddingBottom: '0.75rem',
      marginBottom: '1rem'
    })
  );

  const creditLineClass = cx(
    heading({ size: 'md' }),
    css({
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'silverplate',
      lineHeight: 1.4,
      // Credit lines should be positioned for "hero line" effect
      position: 'relative'
    })
  );

  const ctaContainerClass = css({
    position: 'absolute',
    bottom: { base: '3rem', md: '4rem' },
    left: 0,
    right: 0,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem'
  });

  const ctaLineClass = cx(
    body({ tone: 'standard' }),
    css({
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      textAlign: 'center',
      color: 'eggToast'
    })
  );

  const ctaDividerClass = css({
    width: '4rem',
    height: '1px',
    backgroundColor: 'eggToast',
    opacity: 0.5,
    my: '0.5rem'
  });

  const portalMaskClass = css({
    position: 'fixed',
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    opacity: 0,
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    backgroundColor: 'rgba(15,23,26,0.5)',
    zIndex: 14,
    transform: 'translate(-50%, -50%)'
  });

  const videoSources = getVideoSources('/videos/brand-film-x.mp4');
</script>

<section bind:this={root} class={sectionClass} id="services">
  <!-- Video intro layer (fades out on scroll) -->
  <video
    class={videoClass}
    bind:this={videoLayer}
    autoplay
    muted
    loop
    playsinline
  >
    {#each videoSources as source}
      <source src={source.src} type={source.type} />
    {/each}
  </video>

  <!-- Lens vignette overlay (fades in as video fades out) -->
  <div class={vignetteClass} bind:this={vignetteOverlay}></div>

  <!-- Credits content (centered on black) -->
  <div class={creditsContainerClass} bind:this={creditsContainer}>
    <h2 class={creditsLabelClass} bind:this={creditsLabel}>{servicesHeading}</h2>

    {#each credits as credit}
      <p class={creditLineClass} bind:this={credit.ref}>{credit.label}</p>
    {/each}
  </div>

  <!-- CTA at bottom -->
  <div class={ctaContainerClass} bind:this={cta}>
    <div class={ctaDividerClass}></div>
    <p class={ctaLineClass}>{servicesCta.line1}</p>
    <p class={ctaLineClass}>{servicesCta.line2}</p>
    <div class={ctaDividerClass}></div>
  </div>

  <!-- Portal mask for transition -->
  <div class={portalMaskClass} bind:this={portalMask} aria-hidden="true"></div>
</section>
