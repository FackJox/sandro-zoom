<script lang="ts">
  import { css, cx } from '$styled-system/css';
  import { heading } from '$styled-system/recipes';

  export let prefix: string;
  export let title: string;

  const wrapper = css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  });
  const dash = css({
    opacity: 0.6,
    color: 'accent'
  });
  const titleClass = cx(
    heading({ size: 'sm' }),
    css({
      color: 'text'
    })
  );
</script>

<div class={wrapper}>
  <span class={heading({ size: 'sm' })}>{prefix}</span>
  <span class={dash}>—</span>
  <span class={titleClass}>{title}</span>
</div>
