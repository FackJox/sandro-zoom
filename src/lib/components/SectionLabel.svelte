<script lang="ts">
  import { css, cx } from '$styled-system/css';
  import { heading } from '$styled-system/recipes';

  export let prefix: string;
  export let title: string;

  const band = css({
    width: '100%',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderColor: 'coverOfNight',
    paddingBottom: '0.85rem'
  });
  const labelRow = css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.65rem'
  });
  const divider = css({
    width: '1.5rem',
    height: '1px',
    backgroundColor: 'coverOfNight',
    flexShrink: 0
  });
  const titleClass = cx(
    heading({ size: 'sm' }),
    css({
      color: 'text'
    })
  );
  const slotClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'plex',
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'muted'
  });
</script>

<div class={band}>
  <div class={labelRow}>
    <span class={heading({ size: 'sm' })}>{prefix}</span>
    <span class={divider} aria-hidden="true"></span>
    <span class={titleClass}>{title}</span>
    <slot class={slotClass}></slot>
  </div>
</div>
