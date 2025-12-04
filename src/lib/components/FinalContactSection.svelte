<script lang="ts">
  import { getContext, onDestroy, onMount, tick } from 'svelte';
  import { Canvas, T } from '@threlte/core';
  import type { Mesh } from 'three';
  import { css, cx } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { layout } from '$design/system';
  import { gsap, brandEase, SCROLL_ORCHESTRATOR_CONTEXT_KEY, type ScrollOrchestrator } from '$lib/motion';

  let root: HTMLElement;
  let contactBlock: HTMLElement;
  let screenMesh: Mesh | undefined;

  const sectionClass = css({
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#000',
    color: 'text',
    overflow: 'hidden'
  });
  const threeClass = css({ position: 'absolute', inset: 0, pointerEvents: 'none' });
  const contactClass = css({
    position: 'relative',
    zIndex: 2,
    maxWidth: '32rem',
    px: { base: layout.safeX.base, md: layout.safeX.md },
    py: { base: '4rem', md: '5rem' }
  });
  const headingClass = heading({ size: 'md' });
  const bodyClass = cx(body({ tone: 'standard' }), css({ mt: '0.75rem' }));

  const orchestrator =
    getContext<ScrollOrchestrator | undefined>(SCROLL_ORCHESTRATOR_CONTEXT_KEY);
  let timeline: gsap.core.Timeline | null = null;
  let timelineDisposer: (() => void) | null = null;

  onMount(async () => {
    await tick();
    if (!screenMesh) return;

    timeline?.kill();
    timelineDisposer?.();
    timelineDisposer = null;

    const tl = gsap.timeline({
      defaults: { ease: brandEase },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=200%',
        scrub: true,
        pin: true
      }
    });

    tl
      .fromTo(
        screenMesh.position,
        { x: 0, y: 0, z: 3 },
        { x: -1.2, y: 0.8, z: 1.5 }
      )
      .fromTo(
        screenMesh.rotation,
        { x: 0, y: 0, z: 0 },
        { x: -0.4, y: 0.6, z: 0.1 },
        0.4
      )
      .fromTo(
        contactBlock,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6 },
        0.6
      );

    timeline = tl;
    if (orchestrator) {
      timelineDisposer = orchestrator.registerSectionTimeline('final-contact', () => tl);
    }
  });

  onDestroy(() => {
    timeline?.kill();
    timeline = null;
    timelineDisposer?.();
    timelineDisposer = null;
  });
</script>

<section bind:this={root} class={sectionClass} id="final-contact">
  <div class={threeClass}>
    <Canvas>
      <T.PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <T.AmbientLight intensity={0.8} />
      <T.DirectionalLight position={[2, 2, 3]} intensity={1} />
      <T.Mesh bind:ref={screenMesh} position={[0, 0, 0]}>
        <T.PlaneGeometry args={[3, 1.8]} />
        <T.MeshBasicMaterial color="#050505" />
      </T.Mesh>
    </Canvas>
  </div>

  <div class={contactClass} bind:this={contactBlock}>
    <h2 class={headingClass}>If you have a story to tell please get in touch.</h2>
    <p class={bodyClass}>+44 7880 352909</p>
    <p class={bodyClass}>sandro.gromen-hayes@live.com</p>
  </div>
</section>
