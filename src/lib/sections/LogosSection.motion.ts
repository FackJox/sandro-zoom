import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
import { registerLensSegment, setLensSegmentProgress, attachLensToSection } from '$lib/motion/lensTimeline';

interface LogosTimelineOptions {
  root: HTMLElement;
  rail: HTMLElement;
  metadata?: HTMLElement | null;
  orchestrator?: ScrollOrchestrator;
}

export function initLogosTimelines(options: LogosTimelineOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations: gsap.core.Animation[] = [];
  const timelineDisposers: Array<() => void> = [];
  console.debug(
    '[logos-motion] init',
    'hasRoot',
    Boolean(options.root),
    'hasRail',
    Boolean(options.rail),
    'hasMetadata',
    Boolean(options.metadata),
    'orchestrator',
    Boolean(options.orchestrator)
  );

  const missingTargets: string[] = [];
  if (!options.root) missingTargets.push('root');
  if (!options.rail) missingTargets.push('rail');
  if (!options.metadata) missingTargets.push('metadata');
  if (missingTargets.length) {
    console.warn('[logos-motion] missing targets -> skipping', missingTargets.join(', '));
    return () => {};
  }

  const logosSegment = registerLensSegment('logos', (tl, proxy, emit) => {
    tl.to(proxy, {
      xPercent: -6,
      yPercent: -55,
      scale: 0.6,
      opacity: 0.55,
      duration: 1,
      onUpdate: emit
    });
  });

  const registerAnimation = (name: string, animation: gsap.core.Animation) => {
    animations.push(animation);
    if (options.orchestrator) {
      timelineDisposers.push(
        options.orchestrator.registerSectionTimeline(name, () => animation)
      );
    }
  };

  // Create paused timeline - controlled by master scroll controller
  const masterTimeline = gsap.timeline({
    defaults: { ease: brandEase },
    paused: true
  });

  // Add all animations to the master timeline
  masterTimeline.to({}, { duration: 1 });

  // Rail drift animation - integrated into master timeline (skip if reduced motion)
  if (!reduceMotion) {
    masterTimeline.to(options.rail, {
      xPercent: -25,
      ease: 'none',
      duration: 1
    }, 0);
  }

  // Metadata animation - integrated into master timeline
  if (options.metadata) {
    masterTimeline
      .set(options.metadata, {
        width: '100%',
        left: '0',
        position: 'relative'
      }, 0)
      .to(
        options.metadata,
        {
          yPercent: -10,
          backgroundColor: 'var(--colors-blackPearl)',
          borderColor: 'var(--colors-eggToast)',
          duration: 0.6
        },
        0
      );
  }

  registerAnimation('logos:master', masterTimeline);

  // Track active state for lens attachment
  let wasActive = false;

  // Register with master scroll controller for progress updates
  const unsubscribeMaster = masterScrollController.onSectionProgress('logos', (progress, isActive) => {
    masterTimeline.progress(progress);
    setLensSegmentProgress(logosSegment, progress);

    // Handle lens attachment based on active state
    if (isActive && !wasActive) {
      console.debug('[logos-motion] enter');
      attachLensToSection('logos');
    } else if (!isActive && wasActive && progress >= 0.95) {
      console.debug('[logos-motion] leave → bigFilm');
      attachLensToSection('film');
    } else if (!isActive && wasActive && progress <= 0.05) {
      console.debug('[logos-motion] leaveBack → hero');
      attachLensToSection('hero');
    }
    wasActive = isActive;

    // Only log periodically to avoid spam
    if (Math.floor(progress * 20) !== Math.floor((progress - 0.05) * 20)) {
      console.debug(
        '[logos-morph] update',
        'progress',
        Number(progress.toFixed(3)),
        'isActive',
        isActive
      );
    }
  });

  // NOTE: Section element is registered in LogosSection.svelte onMount for immediate visibility control
  // Here we just update the timeline reference for the already-registered section
  masterScrollController.registerSection('logos', options.root, masterTimeline);

  console.debug('[logos-motion] timeline created (paused, master-controlled)');

  return () => {
    // Clean up master scroll subscriptions
    // NOTE: Section element cleanup is handled by LogosSection.svelte onDestroy
    unsubscribeMaster();

    timelineDisposers.forEach((dispose) => dispose());
    timelineDisposers.length = 0;
    animations.forEach((animation) => animation.kill());
  };
}
