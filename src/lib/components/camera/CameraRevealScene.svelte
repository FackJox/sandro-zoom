<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { css } from '$styled-system/css';
  import { onMount, onDestroy } from 'svelte';
  import { gsap } from '$lib/motion';
  import type { Object3D } from 'three';
  import CameraModel from './CameraModel.svelte';
  import LCDOverlay from './LCDOverlay.svelte';

  /**
   * CameraRevealScene - Complete 3D camera reveal composition
   *
   * Contains:
   * - Threlte Canvas with camera model
   * - CSS 3D LCD overlay
   * - Scenic background
   * - Lens glass reflection animation (Framework 5 §4.3)
   *
   * All positioning props are exposed for debug adjustment.
   */

  interface CameraTransform {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  }

  interface LCDTransform {
    x: number;
    y: number;
    z: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
  }

  interface Props {
    // 3D camera model transform
    cameraTransform?: CameraTransform;
    // LCD overlay transform
    lcdTransform?: LCDTransform;
    // Scene camera (viewer) settings
    viewerFov?: number;
    viewerPosition?: [number, number, number];
    // Background image
    backgroundImage?: string;
    // Debug mode shows helpers
    debug?: boolean;
    // Callback when model loads
    onModelLoad?: (nodes: Record<string, Object3D>) => void;
  }

  let {
    cameraTransform = {
      position: [4.35, -11.95, -50] as [number, number, number],
      rotation: [0.07, -1.57, 0.2] as [number, number, number],
      scale: 0.153
    },
    lcdTransform = {
      x: -50,
      y: 245,
      z: 0,
      rotateX: 8,
      rotateY: 0,
      rotateZ: 0,
      scale: 2.5
    },
    viewerFov = 50,
    viewerPosition = [0, 0, 5] as [number, number, number],
    backgroundImage = '/pictures/earth puja (21 of 45).JPG',
    debug = false,
    onModelLoad
  }: Props = $props();

  // Lens glass reflection animation (Framework 5 §4.3)
  let lensReflectionElement: HTMLDivElement;
  let reflectionTimeline: gsap.core.Timeline | null = null;

  /**
   * Setup subtle lens glass reflection animation
   * Creates a gentle, slow-moving highlight effect over the camera lens area
   */
  function setupLensReflection() {
    if (!lensReflectionElement) return;

    // Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    reflectionTimeline = gsap.timeline({ repeat: -1, yoyo: true });

    // Subtle position shift simulating light catching glass
    reflectionTimeline
      .to(lensReflectionElement, {
        x: 8,
        y: -5,
        opacity: 0.25,
        duration: 4,
        ease: 'sine.inOut'
      })
      .to(lensReflectionElement, {
        x: -4,
        y: 3,
        opacity: 0.15,
        duration: 3.5,
        ease: 'sine.inOut'
      })
      .to(lensReflectionElement, {
        x: 2,
        y: -2,
        opacity: 0.2,
        duration: 4.5,
        ease: 'sine.inOut'
      });
  }

  onMount(() => {
    setupLensReflection();
  });

  onDestroy(() => {
    reflectionTimeline?.kill();
    reflectionTimeline = null;
  });

  const containerClass = css({
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  });

  const backgroundClass = css({
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
  });

  const canvasContainerClass = css({
    position: 'absolute',
    inset: 0,
    zIndex: 1,
  });

  const overlayContainerClass = css({
    position: 'absolute',
    inset: 0,
    zIndex: 2,
    perspective: '1000px',
    perspectiveOrigin: '50% 50%',
  });

  /**
   * Lens glass reflection overlay
   * Positioned over the camera lens area with subtle animated highlight
   * Framework 5 §4.3: "Lens glass might catch a very subtle animated reflection"
   */
  const lensReflectionClass = css({
    position: 'absolute',
    // Position over the camera lens (bottom-right area where camera is)
    bottom: '38%',
    right: '18%',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    // Subtle white highlight gradient
    background: 'radial-gradient(ellipse at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 70%)',
    opacity: 0.2,
    pointerEvents: 'none',
    mixBlendMode: 'overlay',
    zIndex: 3,
    // Slight blur for soft glass reflection effect
    filter: 'blur(2px)',
  });
</script>

<div class={containerClass}>
  <!-- Scenic background -->
  <div
    class={backgroundClass}
    style="background-image: url('{backgroundImage}');"
  ></div>

  <!-- Threlte 3D canvas -->
  <div class={canvasContainerClass}>
    <Canvas>
      <!-- Viewer camera -->
      <T.PerspectiveCamera
        makeDefault
        fov={viewerFov}
        position={viewerPosition}
        oncreate={(ref) => ref.lookAt(0, 0, 0)}
      />

      <!-- Lighting -->
      <T.AmbientLight intensity={0.4} />
      <T.DirectionalLight
        intensity={0.8}
        position={[5, 5, 5]}
      />

      <!-- Camera model -->
      <CameraModel
        position={cameraTransform.position}
        rotation={cameraTransform.rotation}
        scale={cameraTransform.scale}
        onLoad={onModelLoad}
      />

      <!-- Debug helpers -->
      {#if debug}
        <T.GridHelper args={[10, 10]} />
        <T.AxesHelper args={[2]} />
      {/if}
    </Canvas>
  </div>

  <!-- LCD overlay (CSS 3D) -->
  <div class={overlayContainerClass}>
    <LCDOverlay
      x={lcdTransform.x}
      y={lcdTransform.y}
      z={lcdTransform.z}
      rotateX={lcdTransform.rotateX}
      rotateY={lcdTransform.rotateY}
      rotateZ={lcdTransform.rotateZ}
      scale={lcdTransform.scale}
    />
  </div>

  <!-- Lens glass reflection (Framework 5 §4.3) -->
  <div
    class={lensReflectionClass}
    bind:this={lensReflectionElement}
    aria-hidden="true"
  ></div>
</div>
