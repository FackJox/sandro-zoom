<script lang="ts">
  import { cx, css } from '$styled-system/css';

  export let className: string | undefined = undefined;

  const shell = css({
    minHeight: '100vh',
    backgroundColor: 'bg',
    color: 'text',
    display: 'flex',
    flexDirection: 'column'
  });
</script>

<main class={cx(shell, className)} {...$$restProps}>
  <slot />
</main>
