import { gsap, brandEase, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
import { registerLensSegment, setLensSegmentProgress, attachLensToSection } from '$lib/motion/lensTimeline';

interface LogosTimelineOptions {
  root: HTMLElement;
  orchestrator?: ScrollOrchestrator;
}

export function initLogosTimelines(options: LogosTimelineOptions) {
  if (typeof window === 'undefined') {
    return;
  }

  const animations: gsap.core.Animation[] = [];
  const timelineDisposers: Array<() => void> = [];
  console.debug(
    '[logos-motion] init',
    'hasRoot',
    Boolean(options.root),
    'orchestrator',
    Boolean(options.orchestrator)
  );

  if (!options.root) {
    console.warn('[logos-motion] missing root -> skipping');
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

  // Minimal timeline - just holds position for lens segment
  masterTimeline.to({}, { duration: 1 });

  registerAnimation('logos:master', masterTimeline);

  // Track active state for lens attachment
  let wasActive = false;

  // Register with master scroll controller for progress updates
  const unsubscribeMaster = masterScrollController.onSectionProgress('logos', (progress, isActive) => {
    masterTimeline.progress(progress);
    setLensSegmentProgress(logosSegment, progress);

    // DEBUG: Log all progress updates
    console.log('[logos-motion] progress:', progress.toFixed(3), 'isActive:', isActive, 'wasActive:', wasActive);

    // Handle lens attachment based on active state
    if (isActive && !wasActive) {
      console.log('[logos-motion] ENTER - attaching lens to logos');
      attachLensToSection('logos');
    } else if (!isActive && wasActive && progress >= 0.95) {
      console.log('[logos-motion] LEAVE → bigFilm at progress:', progress.toFixed(3));
      attachLensToSection('film');
    } else if (!isActive && wasActive && progress <= 0.05) {
      console.log('[logos-motion] LEAVE BACK → hero at progress:', progress.toFixed(3));
      attachLensToSection('hero');
    }
    wasActive = isActive;
  });

  // Register section with master controller
  masterScrollController.registerSection('logos', options.root, masterTimeline);

  console.debug('[logos-motion] timeline created (paused, master-controlled)');

  return () => {
    unsubscribeMaster();
    timelineDisposers.forEach((dispose) => dispose());
    timelineDisposers.length = 0;
    animations.forEach((animation) => animation.kill());
  };
}
