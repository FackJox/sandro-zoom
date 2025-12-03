<script lang="ts">
  import { css } from '$styled-system/css';
  import LensBadge from '$lib/components/LensBadge.svelte';
  import MetadataStrip from '$lib/components/MetadataStrip.svelte';

  let heroRef: HTMLDivElement;
  let stripRef: HTMLDivElement;

  const page = css({
    minHeight: '100vh',
    backgroundColor: 'blackStallion',
    color: 'silverplate',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    px: { base: '1.25rem', md: '3rem' },
    py: { base: '2rem', md: '4rem' }
  });

  const sectionClass = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    border: '1px solid',
    borderColor: 'coverOfNight',
    padding: '1.5rem'
  });

  const lensDemo = css({
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  });

  const badgeLabel = css({
    fontFamily: 'trade',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontSize: '0.85rem'
  });
</script>

<div class={page}>
  <section class={sectionClass}>
    <p class={badgeLabel}>Lens badge</p>
    <div class={lensDemo}>
      <LensBadge bind:ref={heroRef} size={64} label="ALT ▲ 8,000m" />
      <LensBadge tone="ghost">
        <span>REC</span>
      </LensBadge>
    </div>
  </section>

  <section class={sectionClass}>
    <p class={badgeLabel}>Metadata strip</p>
    <MetadataStrip bind:ref={stripRef} text="ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTOGRAPHY" />
    <MetadataStrip variant="logos">
      BERGHAUS • RED BULL TV • NETFLIX • BBC
    </MetadataStrip>
  </section>
</div>
