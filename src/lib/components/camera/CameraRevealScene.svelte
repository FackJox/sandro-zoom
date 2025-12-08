<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { css } from '$styled-system/css';
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
</div>
