<script lang="ts">
  import { css, cx } from '$styled-system/css';
  import { body } from '$styled-system/recipes';

  export let size = 40;
  export let label: string | null = null;

  const shell = css({
    borderRadius: '999px',
    borderWidth: '2px',
    borderColor: 'accent',
    boxShadow: '0 0 0 1px var(--colors-surface)',
    position: 'relative',
    overflow: 'hidden'
  });

  const labelClass = cx(
    body({ tone: 'muted' }),
    css({
      fontSize: '0.45rem',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    })
  );
</script>

<div class={shell} style={`width:${size}px;height:${size}px;`}>
  {#if label}
    <span class={labelClass}>{label}</span>
  {/if}
</div>
