<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { cx, css } from '$styled-system/css';
  import {
    initScrollShell,
    scrollOrchestrator,
    SCROLL_ORCHESTRATOR_CONTEXT_KEY
  } from '$lib/motion';

  export let className: string | undefined = undefined;

  const shell = css({
    minHeight: '100vh',
    backgroundColor: 'bg',
    color: 'text',
    display: 'flex',
    flexDirection: 'column'
  });
  const contentShell = css({
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column'
  });

  let rootEl: HTMLElement | null = null;
  let contentEl: HTMLElement | null = null;

  // Make orchestrator API available to descendants synchronously.
  setContext(SCROLL_ORCHESTRATOR_CONTEXT_KEY, scrollOrchestrator);

  onMount(() => {
    if (!rootEl) return undefined;
    const destroy = initScrollShell(rootEl, contentEl ?? rootEl);
    return () => {
      destroy();
    };
  });
</script>

<main bind:this={rootEl} class={cx(shell, className)} {...$$restProps}>
  <div bind:this={contentEl} class={contentShell}>
    <slot />
  </div>
</main>
