<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Pane } from 'tweakpane';
  import { css } from '$styled-system/css';

  /**
   * CameraDebugPanel - Tweakpane controls for positioning camera + LCD overlay
   *
   * Provides real-time adjustment of:
   * - Camera model position/rotation/scale
   * - LCD overlay position/rotation/scale
   * - Viewer camera FOV/position
   *
   * Includes "Export Values" button to copy current config to clipboard.
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
    cameraTransform: CameraTransform;
    lcdTransform: LCDTransform;
    viewerFov: number;
    viewerPosition: [number, number, number];
    debug: boolean;
    onUpdate: (updates: {
      cameraTransform?: CameraTransform;
      lcdTransform?: LCDTransform;
      viewerFov?: number;
      viewerPosition?: [number, number, number];
      debug?: boolean;
    }) => void;
  }

  let {
    cameraTransform,
    lcdTransform,
    viewerFov,
    viewerPosition,
    debug,
    onUpdate
  }: Props = $props();

  let container: HTMLDivElement;
  let pane: Pane | null = null;

  // Internal state objects for Tweakpane binding
  let cameraParams = $state({
    posX: cameraTransform.position[0],
    posY: cameraTransform.position[1],
    posZ: cameraTransform.position[2],
    rotX: cameraTransform.rotation[0],
    rotY: cameraTransform.rotation[1],
    rotZ: cameraTransform.rotation[2],
    scale: cameraTransform.scale
  });

  let lcdParams = $state({
    x: lcdTransform.x,
    y: lcdTransform.y,
    z: lcdTransform.z,
    rotateX: lcdTransform.rotateX,
    rotateY: lcdTransform.rotateY,
    rotateZ: lcdTransform.rotateZ,
    scale: lcdTransform.scale
  });

  let viewerParams = $state({
    fov: viewerFov,
    posX: viewerPosition[0],
    posY: viewerPosition[1],
    posZ: viewerPosition[2]
  });

  let showDebug = $state(debug);

  function exportValues() {
    const config = {
      cameraTransform: {
        position: [cameraParams.posX, cameraParams.posY, cameraParams.posZ],
        rotation: [cameraParams.rotX, cameraParams.rotY, cameraParams.rotZ],
        scale: cameraParams.scale
      },
      lcdTransform: {
        x: lcdParams.x,
        y: lcdParams.y,
        z: lcdParams.z,
        rotateX: lcdParams.rotateX,
        rotateY: lcdParams.rotateY,
        rotateZ: lcdParams.rotateZ,
        scale: lcdParams.scale
      },
      viewerFov: viewerParams.fov,
      viewerPosition: [viewerParams.posX, viewerParams.posY, viewerParams.posZ]
    };

    const code = `// Camera Reveal Configuration
const cameraTransform = {
  position: [${config.cameraTransform.position.join(', ')}],
  rotation: [${config.cameraTransform.rotation.join(', ')}],
  scale: ${config.cameraTransform.scale}
};

const lcdTransform = {
  x: ${config.lcdTransform.x},
  y: ${config.lcdTransform.y},
  z: ${config.lcdTransform.z},
  rotateX: ${config.lcdTransform.rotateX},
  rotateY: ${config.lcdTransform.rotateY},
  rotateZ: ${config.lcdTransform.rotateZ},
  scale: ${config.lcdTransform.scale}
};

const viewerFov = ${config.viewerFov};
const viewerPosition = [${config.viewerPosition.join(', ')}];`;

    navigator.clipboard.writeText(code).then(() => {
      alert('Configuration copied to clipboard!');
    });
  }

  onMount(() => {
    pane = new Pane({ container, title: 'Camera Reveal Debug' });

    // Camera Model folder
    const cameraFolder = pane.addFolder({ title: '📷 Camera Model' });
    cameraFolder.addBinding(cameraParams, 'posX', { min: -50, max: 50, step: 0.05, label: 'Position X' });
    cameraFolder.addBinding(cameraParams, 'posY', { min: -50, max: 50, step: 0.05, label: 'Position Y' });
    cameraFolder.addBinding(cameraParams, 'posZ', { min: -50, max: 50, step: 0.05, label: 'Position Z' });
    cameraFolder.addBinding(cameraParams, 'rotX', { min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X' });
    cameraFolder.addBinding(cameraParams, 'rotY', { min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y' });
    cameraFolder.addBinding(cameraParams, 'rotZ', { min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' });
    cameraFolder.addBinding(cameraParams, 'scale', { min: 0.001, max: 2, step: 0.001, label: 'Scale' });

    // LCD Overlay folder
    const lcdFolder = pane.addFolder({ title: '📺 LCD Overlay' });
    lcdFolder.addBinding(lcdParams, 'x', { min: -1000, max: 1000, step: 1, label: 'X (px)' });
    lcdFolder.addBinding(lcdParams, 'y', { min: -1000, max: 1000, step: 1, label: 'Y (px)' });
    lcdFolder.addBinding(lcdParams, 'z', { min: -1000, max: 1000, step: 1, label: 'Z (px)' });
    lcdFolder.addBinding(lcdParams, 'rotateX', { min: -90, max: 90, step: 0.5, label: 'Rotate X (deg)' });
    lcdFolder.addBinding(lcdParams, 'rotateY', { min: -90, max: 90, step: 0.5, label: 'Rotate Y (deg)' });
    lcdFolder.addBinding(lcdParams, 'rotateZ', { min: -90, max: 90, step: 0.5, label: 'Rotate Z (deg)' });
    lcdFolder.addBinding(lcdParams, 'scale', { min: 0.1, max: 10, step: 0.1, label: 'Scale' });

    // Viewer Camera folder
    const viewerFolder = pane.addFolder({ title: '👁 Viewer Camera' });
    viewerFolder.addBinding(viewerParams, 'fov', { min: 10, max: 150, step: 1, label: 'FOV' });
    viewerFolder.addBinding(viewerParams, 'posX', { min: -50, max: 50, step: 0.5, label: 'Position X' });
    viewerFolder.addBinding(viewerParams, 'posY', { min: -50, max: 50, step: 0.5, label: 'Position Y' });
    viewerFolder.addBinding(viewerParams, 'posZ', { min: 0, max: 100, step: 0.5, label: 'Position Z' });

    // Debug toggle
    const debugParams = { debug: showDebug };
    pane.addBinding(debugParams, 'debug', { label: 'Show Helpers' }).on('change', (ev) => {
      showDebug = ev.value;
    });

    // Export button
    pane.addButton({ title: '📋 Export Values' }).on('click', exportValues);

    // Listen for changes and propagate
    pane.on('change', () => {
      onUpdate({
        cameraTransform: {
          position: [cameraParams.posX, cameraParams.posY, cameraParams.posZ],
          rotation: [cameraParams.rotX, cameraParams.rotY, cameraParams.rotZ],
          scale: cameraParams.scale
        },
        lcdTransform: {
          x: lcdParams.x,
          y: lcdParams.y,
          z: lcdParams.z,
          rotateX: lcdParams.rotateX,
          rotateY: lcdParams.rotateY,
          rotateZ: lcdParams.rotateZ,
          scale: lcdParams.scale
        },
        viewerFov: viewerParams.fov,
        viewerPosition: [viewerParams.posX, viewerParams.posY, viewerParams.posZ],
        debug: showDebug
      });
    });
  });

  onDestroy(() => {
    pane?.dispose();
  });

  const panelClass = css({
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
    maxHeight: 'calc(100vh - 2rem)',
    overflowY: 'auto',
  });
</script>

<div class={panelClass} bind:this={container}></div>
