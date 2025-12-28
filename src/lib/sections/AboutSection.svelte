<script lang="ts">
  import { createEventDispatcher, getContext, onDestroy, onMount, tick } from 'svelte';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator, gsap, masterScrollController } from '$lib/motion';
  import SectionLabel from '$lib/components/SectionLabel.svelte';
  import StepIndicator from '$lib/components/StepIndicator.svelte';
  import DebugOverlay from '$lib/components/DebugOverlay.svelte';
  import { debugMode, DEBUG_COLORS } from '$lib/stores/debug';
  import { getVideoSources } from '$lib/utils/video';
  import { aboutBeats, aboutSteps, valuesStaggerLines, servicesGhostLabels, type Beat } from '$lib/data/about-beats';
  import {
    initAboutTimeline,
    moveRing,
    type BeatRefs
  } from '$lib/sections/AboutSection.motion';

  // ─────────────────────────────────────────────────────────────────
  // Types & Data
  // ─────────────────────────────────────────────────────────────────

  type BeatWithRefs = Beat & BeatRefs;

  // Create content array with refs from imported data
  const content: BeatWithRefs[] = aboutBeats.map(beat => ({
    ...beat,
    ref: null,
    bgRef: null,
    mediaRef: null,
    textRef: null
  }));

  const dispatch = createEventDispatcher<{ 'about:exit': { focusRect: DOMRect } }>();

  // ─────────────────────────────────────────────────────────────────
  // Refs
  // ─────────────────────────────────────────────────────────────────

  let root: HTMLElement;
  let focusRing: HTMLDivElement | null = null;
  let activeIndex = 0;

  // Exit portal elements (kept for grid flip transition)
  let exitFocusRing: HTMLDivElement | null = null;
  let servicesGhostGrid: HTMLDivElement | null = null;

  // Beat 3 staggered line refs (Framework 4 §5.3)
  let valuesLine1: HTMLParagraphElement | null = null;
  let valuesLine2: HTMLParagraphElement | null = null;

  // Timeline state
  let timelineCleanup: (() => void) | null = null;
  let sectionCleanup: (() => void) | null = null;

  // Video refs for resource management
  let videoRefs: HTMLVideoElement[] = [];

  const orchestrator = getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);

  // Scroll hint text based on active beat
  $: scrollHintText = activeIndex < 2 ? 'Next story' : 'Services';

  // ─────────────────────────────────────────────────────────────────
  // CSS Classes - Layout
  // ─────────────────────────────────────────────────────────────────

  const sectionClass = css({
    position: 'absolute',
    inset: 0,
    color: 'text',
    overflow: 'hidden',
    opacity: 0,
    visibility: 'hidden'
    // DESIGN SPEC: Zoom-out uses mask-image with torus pattern (not clipPath)
    // mask-image is applied dynamically via zoomOutTransition.ts
  });

  const headerRow = css({
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    pt: { base: '1.5rem', md: '2rem' }
  });

  // Beat container - full viewport, stacked
  // Note: visibility controlled by mask-image in AboutSection.motion.ts (Framework 4 §5.2)
  const beatContainer = css({
    position: 'absolute',
    inset: 0,
    opacity: 0
  });

  // Background layer for mobile (full-bleed)
  const beatBgMobile = css({
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: { base: 'block', lg: 'none' }
  });

  const bgOverlay = css({
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, {colors.bg/15} 0%, {colors.bg/90} 70%)'
  });

  // Content grid (flex on mobile, grid on desktop)
  const beatGrid = css({
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    px: { base: layout.safeX.base, md: layout.safeX.md, lg: layout.safeX.lg },
    pb: { base: '7rem', md: '6rem', lg: '4rem' },
    pt: { base: '5rem', lg: '7rem' },
    lg: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center'
    }
  });

  // Media column (desktop only)
  const mediaColumn = css({
    display: { base: 'none', lg: 'block' },
    position: 'relative',
    height: 'calc(100vh - 16rem)',
    maxHeight: '600px',
    borderRadius: '4px',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '25%',
      background: 'linear-gradient(90deg, {colors.bg/70} 0%, transparent 100%)',
      zIndex: 1,
      pointerEvents: 'none'
    }
  });

  const mediaFill = css({
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  });

  // Text column
  const textColumn = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    justifyContent: { lg: 'center' }
  });

  // Text panel card (visible card on mobile, transparent on desktop)
  const beatPanel = css({
    backgroundColor: { base: 'bg/90', lg: 'transparent' },
    borderWidth: { base: '1px', lg: '0' },
    borderColor: 'border',
    borderRadius: '4px',
    p: { base: '1.5rem', md: '2rem', lg: '0' },
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  });

  const headingClass = cx(heading({ size: 'md' }), css({ color: 'text', display: { base: 'block', lg: 'none' } }));
  const bodyClass = cx(body({ tone: 'standard' }), css({ whiteSpace: 'pre-line' }));

  // Beat 3 stagger line (slides up from below)
  const staggerLineClass = css({
    opacity: 0,
    transform: 'translateY(30px)'
  });

  // Scroll hint (mobile only)
  const scrollHint = css({
    position: 'absolute',
    bottom: '4.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'plex',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'muted',
    display: { base: 'block', lg: 'none' },
    zIndex: 2
  });

  // Indicator wrapper - pinned bottom center
  const indicatorWrap = css({
    position: 'absolute',
    bottom: { base: '1.5rem', md: '2rem' },
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 3
  });

  // ─────────────────────────────────────────────────────────────────
  // CSS Classes - Portal Elements
  // ─────────────────────────────────────────────────────────────────

  const focusRingClass = css({
    position: 'absolute',
    width: '90px',
    height: '90px',
    borderRadius: '999px',
    borderWidth: '2px',
    borderColor: 'accent',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    top: 0,
    left: 0,
    transform: 'translate(-50%, -50%)',
    zIndex: 4
  });

  const exitRingClass = css({
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '999px',
    borderWidth: '1px',
    borderColor: 'accent',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0,
    zIndex: 5
  });

  const ghostGridClass = css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 4
  });

  const ghostLabelClass = css({
    fontFamily: 'trade',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'muted',
    padding: '0.75rem 1rem',
    borderWidth: '1px',
    borderColor: 'border',
    borderRadius: '4px',
    backgroundColor: 'bg/60',
    whiteSpace: 'nowrap'
  });

  // ─────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────

  onMount(async () => {
    await tick();

    timelineCleanup?.();
    timelineCleanup = null;

    // Initialize timeline with extracted motion module
    timelineCleanup = initAboutTimeline({
      root,
      beats: content.map(beat => ({
        ref: beat.ref,
        bgRef: beat.bgRef,
        mediaRef: beat.mediaRef,
        textRef: beat.textRef
      })),
      focusRing,
      exitFocusRing,
      servicesGhostGrid,
      valuesLine1,
      valuesLine2,
      orchestrator,
      onActiveIndexChange: (index) => {
        // Pause videos from previous beat, play current beat's video
        videoRefs.forEach((video, i) => {
          if (!video) return;
          if (i === index) {
            video.play().catch(() => {/* Autoplay may be blocked */});
          } else {
            video.pause();
          }
        });
        activeIndex = index;
      },
      onExitDispatch: (focusRect) => {
        dispatch('about:exit', { focusRect });
      }
    });

    // Register section and parallax targets for zoom-out transitions
    const beatRefs = content.map(b => b.ref).filter(Boolean) as HTMLElement[];
    const textRefs = content.map(b => b.textRef).filter(Boolean) as HTMLElement[];
    const unregisterSection = masterScrollController.registerSection('about', root);
    const unregisterParallax = masterScrollController.registerParallaxTargets('about', [
      ...beatRefs,
      ...textRefs,
      focusRing
    ].filter(Boolean) as HTMLElement[]);

    sectionCleanup = () => {
      unregisterSection();
      unregisterParallax();
    };
  });

  onDestroy(() => {
    timelineCleanup?.();
    timelineCleanup = null;
    sectionCleanup?.();
    sectionCleanup = null;
  });
</script>

<section bind:this={root} class={sectionClass} id="about">
  {#if $debugMode}
    <DebugOverlay label="about" color={DEBUG_COLORS.about.color} index={DEBUG_COLORS.about.index} />
  {/if}
  <!-- Header row -->
  <header class={headerRow}>
    <SectionLabel prefix="About me" title={content[activeIndex]?.title ?? 'Story'} />
  </header>

  <!-- Beat panels -->
  {#each content as beat, index}
    <article class={beatContainer} bind:this={beat.ref}>
      <!-- Mobile: Full-bleed background -->
      <div
        class={beatBgMobile}
        style={`background-image: url('${beat.background.mobile}')`}
        bind:this={beat.bgRef}
      >
        <div class={bgOverlay}></div>
      </div>

      <!-- Content grid (responsive) -->
      <div class={beatGrid}>
        <!-- Left: Media column (desktop only) -->
        <div class={mediaColumn}>
          {#if beat.background.video}
            <video
              class={mediaFill}
              bind:this={beat.mediaRef}
              on:loadeddata={() => { videoRefs[index] = beat.mediaRef as unknown as HTMLVideoElement; }}
              autoplay={index === 0}
              muted
              loop
              playsinline
            >
              {#each getVideoSources(beat.background.video) as source}
                <source src={source.src} type={source.type} />
              {/each}
            </video>
          {:else}
            <img
              class={mediaFill}
              bind:this={beat.mediaRef}
              src={beat.background.desktop || beat.background.mobile}
              alt=""
              loading="lazy"
            />
          {/if}
        </div>

        <!-- Right: Text column -->
        <div class={textColumn}>
          <div class={beatPanel} bind:this={beat.textRef}>
            <h2 class={headingClass}>{beat.title}</h2>
            {#if index === 2}
              <!-- Beat 3: Special staggered animation (Framework 4 §5.3) -->
              <p class={bodyClass}>{beat.body[0]}</p>
              <p class={bodyClass} bind:this={valuesLine1}>{valuesStaggerLines.line1}</p>
              <p class={cx(bodyClass, staggerLineClass)} bind:this={valuesLine2}>{valuesStaggerLines.line2}</p>
            {:else}
              {#each beat.body as paragraph}
                <p class={bodyClass}>{paragraph}</p>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </article>
  {/each}

  <!-- Scroll hint (mobile) -->
  <div class={scrollHint}>{scrollHintText}</div>

  <!-- Step indicator -->
  <div class={indicatorWrap}>
    <StepIndicator steps={aboutSteps} {activeIndex} />
  </div>

  <!-- Focus ring -->
  <div class={focusRingClass} bind:this={focusRing} aria-hidden="true"></div>

  <!-- Exit portal elements (for grid flip transition to Services) -->
  <div class={exitRingClass} bind:this={exitFocusRing} aria-hidden="true"></div>
  <div class={ghostGridClass} bind:this={servicesGhostGrid}>
    {#each servicesGhostLabels as label}
      <span class={ghostLabelClass}>{label}</span>
    {/each}
  </div>
</section>
