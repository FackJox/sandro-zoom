<script lang="ts">
  import { T } from '@threlte/core';
  import { useGltf } from '@threlte/extras';
  import type { Object3D } from 'three';

  /**
   * CameraModel - Loads and renders the 3D camera GLB
   *
   * Exposes position/rotation/scale props for debug adjustment.
   * The camera model should have its LCD screen as a named mesh
   * that we can target for overlay alignment.
   */

  interface Props {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    onLoad?: (nodes: Record<string, Object3D>) => void;
  }

  let {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
    onLoad
  }: Props = $props();

  const gltf = useGltf('/camera.glb');

  // Report loaded nodes for debugging mesh names
  $effect(() => {
    if ($gltf?.nodes && onLoad) {
      onLoad($gltf.nodes);
      console.debug('[CameraModel] Loaded nodes:', Object.keys($gltf.nodes));
    }
  });
</script>

{#if $gltf}
  <T.Group
    position={position}
    rotation={rotation}
    scale={[scale, scale, scale]}
  >
    <T is={$gltf.scene} />
  </T.Group>
{/if}
