<script lang="ts">
  import { onMount, onDestroy, setContext, tick } from 'svelte';
  import { cx, css } from '$styled-system/css';
  import {
    initScrollShell,
    scrollOrchestrator,
    SCROLL_ORCHESTRATOR_CONTEXT_KEY,
    masterScrollController,
    TOTAL_SCROLL_VH,
    SECTION_SEGMENTS,
    MASTER_SCROLL_CONTEXT_KEY
  } from '$lib/motion';
  import { lensAttachment } from '$lib/motion/lensTimeline';
  import LensBadge from './LensBadge.svelte';

  // Track lens attachment for persistent layer visibility
  // Hero section has its own LensBadge, so hide persistent one when hero owns it
  // Logos section uses portal animation for lens transition, so hide persistent one there too
  let currentAttachment: string | null = null;
  let currentSection: string | null = null;
  let showPersistentLens = false;

  // Only show persistent lens when we're past the hero→logos portal transition
  // Hero has its own lens, Logos uses portal animation - persistent lens shows from Film onwards
  $: {
    // Hide during hero (has its own lens) and logos (uses portal animation)
    const isAfterPortalTransition = currentSection !== null &&
      currentSection !== 'hero' &&
      currentSection !== 'logos';
    showPersistentLens = isAfterPortalTransition;
  }

  const unsubLensAttachment = lensAttachment.subscribe((value) => {
    currentAttachment = value;
  });

  const unsubCurrentSection = masterScrollController.currentSection.subscribe((value) => {
    currentSection = value;
  });

  export let className: string | undefined = undefined;

  // Lens bug ref for master scroll registration
  let lensBugRef: HTMLDivElement | null = null;

  // Provide master scroll controller to all sections
  setContext(MASTER_SCROLL_CONTEXT_KEY, masterScrollController);

  const shell = css({
    position: 'relative',
    // Use 100dvh for mobile Safari, fallback to 100vh
    minHeight: '100dvh',
    backgroundColor: 'bg',
    color: 'text',
    // Hide scrollbar completely
    overflow: 'hidden',
    // Ensure smooth touch scrolling
    touchAction: 'pan-y',
    WebkitOverflowScrolling: 'touch'
  });

  // Invisible scroll spacer - consumes scroll distance
  const scrollSpacer = css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '1px',
    pointerEvents: 'none',
    visibility: 'hidden'
  });

  // Fixed section stack - all sections stacked absolutely
  const sectionStack = css({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    // Use 100dvh for mobile Safari
    height: '100dvh',
    overflow: 'hidden'
  });

  // Persistent layer - outside section stack, never masked
  const persistentLayer = css({
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: 'none'
  });

  // Lens bug positioning within persistent layer
  // Explicit z-index ensures lens badge stays above all sections
  const lensBugSlot = css({
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    pointerEvents: 'auto',
    zIndex: 10
  });

  let rootEl: HTMLElement | null = null;
  let spacerEl: HTMLElement | null = null;
  let stackEl: HTMLElement | null = null;

  // Make orchestrator API available to descendants synchronously.
  setContext(SCROLL_ORCHESTRATOR_CONTEXT_KEY, scrollOrchestrator);

  onMount(() => {
    if (!rootEl || !spacerEl || !stackEl) return;

    // Initialize scroll shell for ScrollSmoother
    const destroyShell = initScrollShell(rootEl, spacerEl);

    // Build master timeline
    const destroyMaster = masterScrollController.buildMasterTimeline(stackEl, spacerEl);

    // Track cleanup functions for async initialization
    let destroyLensBug: (() => void) | undefined;
    let destroyZoomOut: (() => void) | undefined;

    // Async initialization for zoom-out transitions
    (async () => {
      // Wait for sections to register their elements and parallax targets
      await tick();

      // Register lens bug for zoom-out transition blips
      if (lensBugRef) {
        destroyLensBug = masterScrollController.registerLensBug(lensBugRef);
      }

      // Build zoom-out transitions (after all sections are registered)
      await tick();
      destroyZoomOut = masterScrollController.buildZoomOutTransitions();

      console.debug('[MainScroll] initialized', {
        totalVH: TOTAL_SCROLL_VH,
        sections: Object.keys(SECTION_SEGMENTS).length,
        hasLensBug: Boolean(lensBugRef)
      });
    })();

    return () => {
      destroyZoomOut?.();
      destroyLensBug?.();
      destroyMaster();
      destroyShell();
    };
  });

  onDestroy(() => {
    unsubLensAttachment();
    unsubCurrentSection();
  });
</script>

<!-- Global scrollbar hiding -->
<svelte:head>
  {@html `<style>
    html, body {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      display: none;
    }
  </style>`}
</svelte:head>

<main bind:this={rootEl} class={cx(shell, className)} {...$$restProps}>
  <!-- Invisible scroll spacer - creates scroll distance -->
  <div
    bind:this={spacerEl}
    class={scrollSpacer}
    style="height: {TOTAL_SCROLL_VH}vh;"
    aria-hidden="true"
  ></div>

  <!-- Fixed section stack - all sections stacked here -->
  <div bind:this={stackEl} class={sectionStack}>
    <slot />
  </div>

  <!-- Persistent layer - outside section stack, never masked by zoom-out transitions -->
  <div class={persistentLayer}>
    <div
      class={lensBugSlot}
      bind:this={lensBugRef}
      style:opacity={showPersistentLens ? 1 : 0}
      style:visibility={showPersistentLens ? 'visible' : 'hidden'}
    >
      <LensBadge
        size={48}
        tone="ghost"
      />
    </div>
  </div>
</main>
