<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { css } from '$styled-system/css';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator, masterScrollController } from '$lib/motion';
  import { attachLensToSection } from '$lib/motion/lensTimeline';
  import SectionLabel from './SectionLabel.svelte';
  import StepIndicator from './StepIndicator.svelte';
  import { getVideoSources } from '$lib/utils/video';
  import { filmStories } from '$lib/data/film-stories';
  import { attachFilmStoriesExitPortal } from '$lib/sections/FilmStoriesExit';
  import {
    filmStoryViewport,
    filmStoryCard,
    filmStoryMedia,
    filmStoryTitle,
    filmStoryBody,
    filmStoryFocusRing,
    filmStoryTransitionStrip,
    filmStoryTransitionFrame,
    filmStoryTransitionFrameMedia
  } from '$lib/styles/recipes';

  type StoryCard = {
    title: string;
    src: string;
    body: string;
    ref: HTMLElement | null;
    mediaRef: HTMLElement | null;
  };

  const stories: StoryCard[] = filmStories.map((story) => ({ ...story, ref: null, mediaRef: null }));

  let root: HTMLElement;
  let viewport: HTMLElement;
  let contentGrid: HTMLElement;
  let infoPanel: HTMLElement;
  let focusRing: HTMLDivElement | null = null;
  let transitionStrip: HTMLDivElement | null = null;
  let activeIndex = 0;
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;
  let sectionCleanup: (() => void) | null = null;
  let exitPortalCleanup: (() => void) | null = null;
  let wasActive = false;

  // Text element refs for GSAP animation
  let mobileTitleRef: HTMLElement | null = null;
  let mobileBodyRef: HTMLElement | null = null;
  let desktopTitleRef: HTMLElement | null = null;
  let desktopBodyRef: HTMLElement | null = null;

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  const steps = stories.map((story, idx) => `${idx + 1}. ${story.title.split('/')[0].trim()}`);

  // Current story content (updated via animation)
  let displayTitle = stories[0]?.title ?? '';
  let displayBody = stories[0]?.body ?? '';

  // Animate title/body crossfade with slide (§3.5)
  const TEXT_STAGGER_MS = 0.06;
  function animateTextTransition(newIndex: number) {
    const newStory = stories[newIndex];
    if (!newStory) return;

    const titleEls = [mobileTitleRef, desktopTitleRef].filter((el): el is HTMLElement => el !== null);
    const bodyEls = [mobileBodyRef, desktopBodyRef].filter((el): el is HTMLElement => el !== null);
    const allEls = [...titleEls, ...bodyEls];

    if (!allEls.length) {
      // Fallback: just update text if no refs
      displayTitle = newStory.title;
      displayBody = newStory.body;
      return;
    }

    // Crossfade out + slide up, then update text, then slide in
    gsap.timeline()
      // Fade out and slide up current text
      .to(allEls, {
        yPercent: -12,
        autoAlpha: 0,
        duration: 0.2,
        stagger: TEXT_STAGGER_MS,
        ease: brandEase
      })
      // Update text content
      .call(() => {
        displayTitle = newStory.title;
        displayBody = newStory.body;
      })
      // Reset position below
      .set(allEls, { yPercent: 12 })
      // Slide in from below with stagger
      .to(allEls, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.3,
        stagger: TEXT_STAGGER_MS,
        ease: brandEase
      });
  }

  function syncFocusRing(index: number, immediate = false) {
    const media = stories[index]?.mediaRef;
    if (!media || !focusRing || !viewport) return;
    const mediaRect = media.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const targetX = mediaRect.left - viewportRect.left + mediaRect.width * 0.5;
    const targetY = mediaRect.top - viewportRect.top + mediaRect.height * 0.5;
    gsap.to(focusRing, {
      x: targetX,
      y: targetY,
      opacity: 1,
      duration: immediate ? 0 : 0.35,
      ease: brandEase
    });
  }

  async function initTimeline() {
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;

    await tick();
    if (!root || !viewport || stories.some((story) => !story.ref || !story.mediaRef)) {
      return;
    }

    // Initialize: first story visible with full circle, others hidden
    stories.forEach((story, index) => {
      if (!story.ref) return;
      gsap.set(story.ref, {
        autoAlpha: index === 0 ? 1 : 0,
        clipPath: index === 0 ? 'circle(100% at 50% 50%)' : 'circle(0% at 50% 50%)',
        xPercent: 0
      });
    });
    activeIndex = 0;
    syncFocusRing(0, true);

    // Framework 3 §3.5: Initialize transition strip (hidden, centered on first story)
    if (transitionStrip) {
      gsap.set(transitionStrip, { opacity: 0, xPercent: 0 });
    }

    // Create paused timeline - controlled by master scroll controller
    const tl = gsap.timeline({
      defaults: { ease: brandEase },
      paused: true
    });

    // Register with master scroll controller for progress updates
    const unsubscribeMaster = masterScrollController.onSectionProgress('filmStories', (progress, isActive) => {
      tl.progress(progress);

      // Handle lens attachment based on active state
      if (isActive && !wasActive) {
        console.debug('[film-stories] enter');
        attachLensToSection('filmStories');
      } else if (!isActive && wasActive && progress >= 0.95) {
        console.debug('[film-stories] leave → photoStats');
        attachLensToSection('photoStats');
      } else if (!isActive && wasActive && progress <= 0.05) {
        console.debug('[film-stories] leaveBack → film');
        attachLensToSection('film');
      }
      wasActive = isActive;
    });

    // Register section element with master controller
    const unregisterSection = masterScrollController.registerSection('filmStories', root, tl);

    // Store cleanup functions
    const masterCleanup = () => {
      unsubscribeMaster();
      unregisterSection();
    };

    // Build circular iris transitions between stories (§3.5)
    stories.forEach((_, index) => {
      const current = stories[index]?.ref;
      const next = stories[index + 1]?.ref;
      if (!current || !next) return;

      // Each story gets ~1/3 of the timeline
      const storyDuration = 1 / stories.length;
      const transitionStart = (index + 0.85) * storyDuration;
      const transitionDuration = 0.15 * storyDuration;

      // Framework 3 §3.5: Calculate strip offset for dolly pan effect
      // Strip shows 3 frames and pans left as we progress through stories
      const stripOffset = (index + 1) * -33.33; // -33.33% per story transition

      // Circular iris transition with horizontal strip behind:
      // 1. Strip appears and pans to show upcoming story
      // 2. Focus ring appears and tightens
      // 3. Current video iris closes (circle shrinks)
      // 4. Next video iris opens (circle expands)
      // 5. Strip fades, focus ring lifts away
      tl
        // Framework 3 §3.5: Show transition strip behind (lens pan effect)
        .to(
          transitionStrip,
          {
            opacity: 0.85,
            duration: transitionDuration * 0.2
          },
          transitionStart
        )
        // Pan the strip left to center on upcoming story
        .to(
          transitionStrip,
          {
            xPercent: stripOffset,
            duration: transitionDuration * 0.6,
            ease: 'power2.inOut'
          },
          transitionStart
        )
        // Focus ring appears and scales up (preparing for incoming)
        .to(
          focusRing,
          {
            opacity: 1,
            scale: 1.15,
            duration: transitionDuration * 0.3
          },
          transitionStart
        )
        // Current video: iris closes (circle mask shrinks to 0%)
        .to(
          current,
          {
            clipPath: 'circle(0% at 50% 50%)',
            autoAlpha: 0,
            duration: transitionDuration * 0.5,
            ease: 'power2.in'
          },
          transitionStart
        )
        // Slight dolly shift during transition for lens pan feel
        .to(
          current,
          {
            xPercent: -15,
            duration: transitionDuration * 0.5,
            ease: 'power2.inOut'
          },
          transitionStart
        )
        // Focus ring tightens (shrinks) as it focuses on incoming
        .to(
          focusRing,
          {
            scale: 0.9,
            duration: transitionDuration * 0.25,
            ease: 'power2.in'
          },
          transitionStart + transitionDuration * 0.3
        )
        // Next video: iris opens (circle mask expands from 0% to 100%)
        .fromTo(
          next,
          {
            clipPath: 'circle(0% at 50% 50%)',
            autoAlpha: 0,
            xPercent: 10
          },
          {
            clipPath: 'circle(100% at 50% 50%)',
            autoAlpha: 1,
            xPercent: 0,
            duration: transitionDuration * 0.6,
            ease: 'power2.out'
          },
          transitionStart + transitionDuration * 0.4
        )
        // Hide transition strip as iris expands
        .to(
          transitionStrip,
          {
            opacity: 0,
            duration: transitionDuration * 0.25
          },
          transitionStart + transitionDuration * 0.7
        )
        // Focus ring lifts away (scales up and fades) as frame fills viewport
        .to(
          focusRing,
          {
            scale: 1.3,
            opacity: 0.6,
            duration: transitionDuration * 0.3,
            ease: 'power2.out'
          },
          transitionStart + transitionDuration * 0.7
        )
        // Reset focus ring for next transition
        .to(
          focusRing,
          {
            scale: 1,
            opacity: 0,
            duration: transitionDuration * 0.1
          },
          transitionStart + transitionDuration * 0.95
        )
        // Update active index and animate text
        .call(
          (i: number) => {
            activeIndex = i;
            syncFocusRing(i, true);
            animateTextTransition(i);
            // Framework 3 §3.5: Subtle lens blip when crossing story boundaries
            masterScrollController.triggerLensBlip();
          },
          [index + 1],
          transitionStart + transitionDuration * 0.5
        );
    });

    timeline = tl;

    // Attach exit portal (Framework 3 §3.6) - concentric rings, vertical strip, stats preview
    const storyCards = stories.map(s => s.ref).filter(Boolean) as HTMLElement[];
    exitPortalCleanup = attachFilmStoriesExitPortal({
      timeline: tl,
      storyCards,
      viewport,
      onPortalReady: (detail) => {
        console.debug('[film-stories] exit portal ready', detail.focusRect);
      }
    });

    // Register parallax targets for zoom-out transitions
    const parallaxTargets = [viewport, infoPanel, mobileTitleRef, desktopTitleRef, mobileBodyRef, desktopBodyRef].filter(Boolean) as HTMLElement[];
    const unregisterParallax = masterScrollController.registerParallaxTargets('filmStories', parallaxTargets);

    // Store cleanup for master scroll
    sectionCleanup = () => {
      masterCleanup();
      unregisterParallax();
    };

    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('film-stories', () => tl);
    }
  }

  onMount(() => {
    initTimeline();
  });

  onDestroy(() => {
    // Clean up master scroll subscriptions
    sectionCleanup?.();
    sectionCleanup = null;
    // Clean up exit portal DOM elements
    exitPortalCleanup?.();
    exitPortalCleanup = null;
    timeline?.kill();
    timelineDisposer?.();
    timeline = null;
    timelineDisposer = null;
  });

  // Styles
  const sectionClass = css({
    position: 'absolute',
    inset: 0,
    color: 'text',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    py: { base: '3rem', md: '4rem' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    opacity: 0,
    visibility: 'hidden',
    // Zoom-out transition: starts full, contracts to center on exit
    clipPath: 'circle(150% at 50% 50%)'
  });

  const contentGridClass = css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', lg: '1.4fr 1fr' },
    gap: { base: '0', lg: '2rem' },
    alignItems: 'center',
    marginTop: '1.5rem'
  });

  const viewportWrapperClass = css({
    position: 'relative'
  });

  const indicatorWrap = css({
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center'
  });

  // Info panel styles for mobile layout
  const infoPanelMobileClass = css({
    display: { base: 'flex', lg: 'none' },
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1.25rem',
    padding: '1.25rem',
    backgroundColor: 'rgba(15, 23, 26, 0.85)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'coverOfNight',
    borderRadius: '4px'
  });

  // Info panel styles for desktop layout
  const infoPanelDesktopClass = css({
    display: { base: 'none', lg: 'flex' },
    flexDirection: 'column',
    gap: '1rem',
    padding: '2rem',
    backgroundColor: 'rgba(15, 23, 26, 0.85)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'coverOfNight',
    borderRadius: '4px',
    alignSelf: 'center'
  });
</script>

<section bind:this={root} class={sectionClass} id="film-stories">
  <SectionLabel prefix="Film" title="Field Stories" />

  <div class={contentGridClass} bind:this={contentGrid}>
    <!-- Video Viewport -->
    <div class={viewportWrapperClass}>
      <div class={filmStoryViewport()} bind:this={viewport}>
        <!-- Framework 3 §3.5: Transition strip - shows 3 frames as horizontal strip during transitions -->
        <div class={filmStoryTransitionStrip()} bind:this={transitionStrip} aria-hidden="true">
          {#each stories as story, idx}
            <div class={filmStoryTransitionFrame({ active: idx === activeIndex })}>
              <video class={filmStoryTransitionFrameMedia()} autoplay muted loop playsinline>
                {#each getVideoSources(story.src) as source}
                  <source src={source.src} type={source.type} />
                {/each}
              </video>
            </div>
          {/each}
        </div>

        {#each stories as story, index}
          <article class={filmStoryCard()} bind:this={story.ref}>
            <div bind:this={story.mediaRef} style="width: 100%; height: 100%;">
              <video class={filmStoryMedia()} autoplay muted loop playsinline>
                {#each getVideoSources(story.src) as source}
                  <source src={source.src} type={source.type} />
                {/each}
              </video>
            </div>
          </article>
        {/each}

        <div class={filmStoryFocusRing()} bind:this={focusRing}></div>
      </div>

      <!-- Mobile info panel (below video) -->
      <div class={infoPanelMobileClass} bind:this={infoPanel}>
        <h2 class={filmStoryTitle()} bind:this={mobileTitleRef}>{displayTitle}</h2>
        <p class={filmStoryBody()} bind:this={mobileBodyRef}>{displayBody}</p>
      </div>
    </div>

    <!-- Desktop info panel (right side) -->
    <div class={infoPanelDesktopClass}>
      <h2 class={filmStoryTitle({ size: 'lg' })} bind:this={desktopTitleRef}>{displayTitle}</h2>
      <p class={filmStoryBody()} bind:this={desktopBodyRef}>{displayBody}</p>
    </div>
  </div>

  <div class={indicatorWrap}>
    <StepIndicator steps={steps} activeIndex={activeIndex} />
  </div>
</section>
