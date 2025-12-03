<script lang="ts">
  import { css } from '$styled-system/css';
  import { stepIndicator } from '$lib/styles/recipes';

  export let steps: string[] = [];
  export let activeIndex = 0;

  const wrapper = css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  });
</script>

<div class={wrapper} role="list" aria-label="Scroll progress">
  {#each steps as label, index}
    <span
      class={stepIndicator({ active: index === activeIndex })}
      role="listitem"
      aria-current={index === activeIndex ? 'step' : undefined}
    >
      {label}
    </span>
  {/each}
</div>
