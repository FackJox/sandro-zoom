<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
  import { attachLensToSection } from '$lib/motion/lensTimeline';
  import SectionLabel from './SectionLabel.svelte';
  import { getVideoSources } from '$lib/utils/video';
  import StepIndicator from './StepIndicator.svelte';
  import { successfulClimbs, unsuccessfulClimbs, formatStatLine } from '$lib/data/climbing-stats';

  let root: HTMLElement;
  let successBlock: HTMLElement;
  let failBlock: HTMLElement;
  let focusRing: HTMLDivElement | null = null;
  let activeIndex = 0;
  let sectionCleanup: (() => void) | null = null;
  let wasActive = false;

  const sectionClass = css({
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    color: 'text',
    opacity: 0,
    visibility: 'hidden',
    // Zoom-out transition: starts full, contracts to center on exit
    clipPath: 'circle(150% at 50% 50%)'
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
    borderRadius: '4px',
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
  const indicatorWrap = css({ mt: '1.5rem' });
  const focusRingClass = css({
    position: 'absolute',
    width: '70px',
    height: '70px',
    borderRadius: '999px',
    borderWidth: '2px',
    borderColor: 'accent',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    top: 0,
    left: 0,
    transform: 'translate(-50%, -50%)'
  });
  const steps = ['Summits', 'Setbacks'];

const orchestrator =
  getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
let timeline: gsap.core.Timeline | null = null;
let timelineDisposer: (() => void) | null = null;
let disposed = false;

function moveRing(target: HTMLElement | null, immediate = false) {
  if (!target || !focusRing) return;
  const rect = target.getBoundingClientRect();
  const parentRect = target.parentElement?.getBoundingClientRect();
  if (!parentRect) return;
  const x = rect.left - parentRect.left + rect.width * 0.7;
  const y = rect.top - parentRect.top + rect.height * 0.3;
  gsap.to(focusRing, {
    x,
    y,
    duration: immediate ? 0 : 0.4,
    ease: brandEase
  });
}

  function cleanupTimeline() {
    // Clean up master scroll subscriptions and parallax registration
    sectionCleanup?.();
    sectionCleanup = null;
    timeline?.kill();
    timeline = null;
    timelineDisposer?.();
    timelineDisposer = null;
  }

  onMount(() => {
    cleanupTimeline();
    (async () => {
      await tick();
      if (disposed) return;
      if (!root || !successBlock || !failBlock) {
        console.warn('[photo-stats] missing refs, skipping motion init');
        return;
      }

      gsap.set(successBlock, { clipPath: 'circle(140% at 50% 50%)', opacity: 1 });
      gsap.set(failBlock, { clipPath: 'circle(0% at 50% 50%)', opacity: 0 });
      moveRing(successBlock, true);

      // Create paused timeline - controlled by master scroll controller
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        paused: true
      });

      // Register with master scroll controller for progress updates
      const unsubscribeMaster = masterScrollController.onSectionProgress('photoStats', (progress, isActive) => {
        tl.progress(progress);

        // Handle lens attachment based on active state
        if (isActive && !wasActive) {
          console.debug('[photo-stats] enter');
          attachLensToSection('photoStats');
        } else if (!isActive && wasActive && progress >= 0.95) {
          console.debug('[photo-stats] leave → about');
          attachLensToSection('about');
        } else if (!isActive && wasActive && progress <= 0.05) {
          console.debug('[photo-stats] leaveBack → filmStories');
          attachLensToSection('filmStories');
        }
        wasActive = isActive;
      });

      // Register section element with master controller
      const unregisterSection = masterScrollController.registerSection('photoStats', root, tl);

      // Store cleanup
      (tl as any).__masterCleanup = () => {
        unsubscribeMaster();
        unregisterSection();
      };

      tl
        .to({}, { duration: 0.5 })
        .to(
          successBlock,
          {
            clipPath: 'circle(0% at 50% 50%)',
            opacity: 0,
            duration: 0.45,
            ease: brandEase
          },
          0.5
        )
        .fromTo(
          failBlock,
          { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
          { clipPath: 'circle(140% at 50% 50%)', opacity: 1, duration: 0.55, ease: brandEase },
          0.7
        )
        .call(() => {
          activeIndex = 1;
          moveRing(failBlock);
        }, undefined, 0.95);

      timeline = tl;

      // Register parallax targets for zoom-out transitions
      const parallaxTargets = [successBlock, failBlock, focusRing].filter(Boolean) as HTMLElement[];
      const unregisterParallax = masterScrollController.registerParallaxTargets('photoStats', parallaxTargets);

      // Store cleanup
      sectionCleanup = () => {
        (tl as any).__masterCleanup?.();
        unregisterParallax();
      };

      if (orchestrator) {
        timelineDisposer = orchestrator.registerSectionTimeline('photo-stats', () => tl);
      }
    })();
  });

  onDestroy(() => {
    disposed = true;
    cleanupTimeline();
  });
</script>

<section bind:this={root} class={sectionClass} id="photo-stats">
  <video class={bgClass} autoplay muted loop playsinline>
    {#each getVideoSources('/videos/documentary-sierra.mp4') as source}
      <source src={source.src} type={source.type} />
    {/each}
  </video>

  <div class={overlayClass}></div>

  <div class={contentClass}>
    <SectionLabel prefix="Photo" title="Altitude Log" />

    <div class={cardClass}>
      <div class={panelClass} bind:this={successBlock}>
        <h2 class={panelHeading}>{successfulClimbs.title}</h2>
        {#each successfulClimbs.lines as line}
          <p class={panelBody}>{formatStatLine(line)}</p>
        {/each}
      </div>
      <div class={cx(panelClass, hiddenPanel)} bind:this={failBlock}>
        <h2 class={panelHeading}>{unsuccessfulClimbs.title}</h2>
        {#each unsuccessfulClimbs.lines as line}
          <p class={panelBody}>{formatStatLine(line)}</p>
        {/each}
      </div>
      <div class={focusRingClass} bind:this={focusRing} aria-hidden="true"></div>
    </div>
    <div class={indicatorWrap}>
      <StepIndicator steps={steps} activeIndex={activeIndex} />
    </div>
  </div>
</section>
