<script lang="ts">
  import { css } from '$styled-system/css';
  import { heading, body } from '$styled-system/recipes';
  import { serviceCredits, servicesHeading } from '$lib/data/services';

  /**
   * LCDOverlay - CSS 3D positioned overlay for camera LCD screen
   *
   * Renders a frozen snapshot of the services credits content,
   * positioned via CSS 3D transforms to align with the camera's LCD.
   *
   * Transform props are exposed for debug adjustment.
   * Uses centralized data from $lib/data/services.ts to avoid content drift.
   */

  interface Props {
    // 3D position offset from container center
    x?: number;
    y?: number;
    z?: number;
    // 3D rotation in degrees
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    // Scale factor
    scale?: number;
    // Visibility
    visible?: boolean;
  }

  let {
    x = 0,
    y = 0,
    z = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    scale = 1,
    visible = true
  }: Props = $props();

  // Format credits from centralized data source (matches ServicesSection layout)
  const credits = serviceCredits.map((credit) =>
    credit.subtitle
      ? `${credit.label} (${credit.subtitle})`.toUpperCase()
      : credit.label.toUpperCase()
  );

  const containerClass = css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformStyle: 'preserve-3d',
    pointerEvents: 'none',
    // Will be transformed via inline style
  });

  const lcdFrameClass = css({
    backgroundColor: 'blackStallion',
    border: '2px solid',
    borderColor: 'eggToast/30',
    borderRadius: '4px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    // LCD screen glow effect
    boxShadow: '0 0 20px rgba(246, 198, 5, 0.15), inset 0 0 30px rgba(15, 23, 26, 0.8)',
  });

  const labelClass = css({
    fontSize: '0.5rem',
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: 'eggToast',
    borderBottom: '1px solid',
    borderColor: 'eggToast/50',
    paddingBottom: '0.25rem',
    marginBottom: '0.25rem',
  });

  const creditClass = css({
    fontSize: '0.6rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'silverplate',
    lineHeight: 1.4,
    textAlign: 'center',
  });
</script>

{#if visible}
  <div
    class={containerClass}
    style="
      transform:
        translate(-50%, -50%)
        translate3d({x}px, {y}px, {z}px)
        rotateX({rotateX}deg)
        rotateY({rotateY}deg)
        rotateZ({rotateZ}deg)
        scale({scale});
    "
  >
    <div class={lcdFrameClass}>
      <span class={labelClass}>{servicesHeading}</span>
      {#each credits as credit}
        <p class={creditClass}>{credit}</p>
      {/each}
    </div>
  </div>
{/if}
