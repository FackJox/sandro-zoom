import { gsap, brandEase } from '$lib/motion';

/**
 * Grid Flip Transition: ABOUT → SERVICES
 *
 * Creates a 4x4 grid that captures the viewport, then flips tiles
 * center-out to reveal the services video underneath.
 *
 * Tile grid layout:
 *  0  1  2  3
 *  4  5  6  7
 *  8  9 10 11
 * 12 13 14 15
 *
 * Flip groups (center-out stagger):
 * - Group 1 (center): [5, 6, 9, 10]
 * - Group 2 (inner ring): [1, 2, 4, 7, 8, 11, 13, 14]
 * - Group 3 (corners): [0, 3, 12, 15]
 */

export const TILE_GROUPS = {
  center: [5, 6, 9, 10],
  innerRing: [1, 2, 4, 7, 8, 11, 13, 14],
  corners: [0, 3, 12, 15]
} as const;

export type GridFlipElements = {
  tiles: HTMLElement[];
  gridLines: HTMLElement[];
  container: HTMLElement;
};

export type GridFlipOptions = {
  elements: GridFlipElements;
  onFlipStart?: () => void;
  onFlipComplete?: () => void;
};

/**
 * Build the grid flip timeline (paused, driven by progress 0-1)
 *
 * Timeline breakdown:
 * 0.00-0.08: Freeze (micro-beat)
 * 0.08-0.15: Grid lines slam in
 * 0.15-0.45: Center tiles flip
 * 0.30-0.55: Inner ring flips
 * 0.45-0.70: Corners flip
 * 0.70-0.85: Grid lines fade out
 * 0.85-1.00: Container fades out
 */
export function buildGridFlipTimeline(options: GridFlipOptions): gsap.core.Timeline {
  const { tiles, gridLines, container } = options.elements;

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: brandEase }
  });

  // Initial state: tiles visible (front face), grid lines invisible
  // NOTE: Container visibility is controlled by handleProgress() in GridFlipOverlay.svelte
  // which reveals the container when About section progress >= 0.85
  gsap.set(tiles, {
    rotateY: 0,
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden'
  });
  gsap.set(gridLines, { scaleX: 0, scaleY: 0, opacity: 1 });
  // Container stays hidden (CSS autoAlpha: 0) until scroll handler reveals it

  // 0.00-0.08: Micro-beat freeze (just hold)
  tl.addLabel('freeze', 0);

  // 0.08-0.15: Grid lines slam in
  tl.addLabel('gridSlam', 0.08);
  tl.to(
    gridLines.filter((_, i) => i < 3), // vertical lines
    { scaleY: 1, duration: 0.07, stagger: 0.01, ease: 'power2.out' },
    'gridSlam'
  );
  tl.to(
    gridLines.filter((_, i) => i >= 3), // horizontal lines
    { scaleX: 1, duration: 0.07, stagger: 0.01, ease: 'power2.out' },
    'gridSlam+=0.02'
  );

  // Callback at grid slam complete
  tl.call(() => options.onFlipStart?.(), undefined, 0.15);

  // 0.15-0.45: Center tiles flip
  tl.addLabel('centerFlip', 0.15);
  const centerTiles = TILE_GROUPS.center.map((i) => tiles[i]).filter(Boolean);
  tl.to(
    centerTiles,
    { rotateY: 180, duration: 0.3, stagger: 0.03 },
    'centerFlip'
  );

  // 0.30-0.55: Inner ring tiles flip
  tl.addLabel('innerFlip', 0.30);
  const innerTiles = TILE_GROUPS.innerRing.map((i) => tiles[i]).filter(Boolean);
  tl.to(
    innerTiles,
    { rotateY: 180, duration: 0.25, stagger: 0.02 },
    'innerFlip'
  );

  // 0.45-0.70: Corner tiles flip
  tl.addLabel('cornerFlip', 0.45);
  const cornerTiles = TILE_GROUPS.corners.map((i) => tiles[i]).filter(Boolean);
  tl.to(
    cornerTiles,
    { rotateY: 180, duration: 0.25, stagger: 0.02 },
    'cornerFlip'
  );

  // 0.70-0.85: Grid lines fade out
  tl.addLabel('gridFade', 0.70);
  tl.to(gridLines, { opacity: 0, duration: 0.15 }, 'gridFade');

  // 0.85-1.00: Container fades out completely
  tl.addLabel('containerFade', 0.85);
  tl.to(container, { opacity: 0, duration: 0.15 }, 'containerFade');
  tl.set(container, { pointerEvents: 'none' }, 1);

  // Final callback
  tl.call(() => options.onFlipComplete?.(), undefined, 1);

  return tl;
}

/**
 * Calculate tile position (row, col) from index
 */
export function getTilePosition(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 4),
    col: index % 4
  };
}

/**
 * Calculate clip-path for a tile based on its position
 * Returns inset percentages for clipping the viewport
 */
export function getTileClipPath(index: number): string {
  const { row, col } = getTilePosition(index);
  const tileWidth = 25; // 100% / 4 columns
  const tileHeight = 25; // 100% / 4 rows

  const left = col * tileWidth;
  const top = row * tileHeight;
  const right = 100 - left - tileWidth;
  const bottom = 100 - top - tileHeight;

  return `inset(${top}% ${right}% ${bottom}% ${left}%)`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
