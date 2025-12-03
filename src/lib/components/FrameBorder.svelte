<script lang="ts">
  import { css, cx } from '$styled-system/css';

  type FrameVariant = 'full' | 'horizontal';
  type FrameTone = 'accent' | 'border';

  export let variant: FrameVariant = 'full';
  export let tone: FrameTone = 'border';
  export let className: string | undefined = undefined;

  const base = css({
    borderStyle: 'solid',
    display: 'block',
    padding: { base: '0.5rem', md: '0.75rem' }
  });

  const fullBorder = css({ borderWidth: '1px' });
  const horizontalBorder = css({ borderWidth: '1px 0' });
  const accentColor = css({ borderColor: 'accent' });
  const defaultColor = css({ borderColor: 'border' });
</script>

<div
  class={cx(
    base,
    variant === 'horizontal' ? horizontalBorder : fullBorder,
    tone === 'accent' ? accentColor : defaultColor,
    className
  )}
  {...$$restProps}
>
  <slot />
</div>
