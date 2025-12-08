<script lang="ts">
  import { css } from '$styled-system/css';
  import type { Object3D } from 'three';
  import { CameraRevealScene, CameraDebugPanel } from '$lib/components/camera';

  /**
   * /dev/camera - Development route for camera positioning
   *
   * Use this page to:
   * 1. Adjust camera model position/rotation/scale
   * 2. Align LCD overlay with camera screen
   * 3. Export final values when satisfied
   *
   * The exported values will be used in FinalContactSection.
   */

  // Scene state - will be adjusted via debug panel
  let cameraTransform = $state({
    position: [4.35, -11.95, -50] as [number, number, number],
    rotation: [0.07, -1.57, 0.2] as [number, number, number],
    scale: 0.153
  });

  let lcdTransform = $state({
    x: -50,
    y: 245,
    z: 0,
    rotateX: 8,
    rotateY: 0,
    rotateZ: 0,
    scale: 2.5
  });

  let viewerFov = $state(50);
  let viewerPosition = $state([0, 0, 5] as [number, number, number]);
  let debug = $state(true);

  function handleUpdate(updates: {
    cameraTransform?: typeof cameraTransform;
    lcdTransform?: typeof lcdTransform;
    viewerFov?: number;
    viewerPosition?: [number, number, number];
    debug?: boolean;
  }) {
    if (updates.cameraTransform) cameraTransform = updates.cameraTransform;
    if (updates.lcdTransform) lcdTransform = updates.lcdTransform;
    if (updates.viewerFov !== undefined) viewerFov = updates.viewerFov;
    if (updates.viewerPosition) viewerPosition = updates.viewerPosition;
    if (updates.debug !== undefined) debug = updates.debug;
  }

  function handleModelLoad(nodes: Record<string, Object3D>) {
    console.log('[DevCamera] Camera model loaded with nodes:', Object.keys(nodes));
    // Log each node's type for debugging
    Object.entries(nodes).forEach(([name, node]) => {
      console.log(`  - ${name}: ${node.type}`);
    });
  }

  const pageClass = css({
    width: '100vw',
    height: '100vh',
    backgroundColor: 'blackStallion',
    overflow: 'hidden',
  });

  const infoClass = css({
    position: 'fixed',
    bottom: '1rem',
    left: '1rem',
    zIndex: 100,
    padding: '1rem',
    backgroundColor: 'blackStallion/80',
    border: '1px solid',
    borderColor: 'eggToast/30',
    borderRadius: '8px',
    color: 'silverplate',
    fontSize: '0.75rem',
    maxWidth: '300px',
  });

  const headingClass = css({
    color: 'eggToast',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  });

  const listClass = css({
    listStyle: 'decimal',
    paddingLeft: '1.25rem',
    lineHeight: 1.6,
  });
</script>

<div class={pageClass}>
  <CameraRevealScene
    {cameraTransform}
    {lcdTransform}
    {viewerFov}
    {viewerPosition}
    {debug}
    onModelLoad={handleModelLoad}
  />

  <CameraDebugPanel
    {cameraTransform}
    {lcdTransform}
    {viewerFov}
    {viewerPosition}
    {debug}
    onUpdate={handleUpdate}
  />

  <div class={infoClass}>
    <p class={headingClass}>Camera Positioning Workflow</p>
    <ol class={listClass}>
      <li>Adjust <strong>Camera Model</strong> position/rotation until model is framed correctly</li>
      <li>Adjust <strong>LCD Overlay</strong> transforms to align with camera's screen</li>
      <li>Fine-tune <strong>Viewer Camera</strong> FOV and position for best composition</li>
      <li>Click <strong>Export Values</strong> to copy configuration</li>
      <li>Paste values into FinalContactSection.svelte</li>
    </ol>
  </div>
</div>
