import { gsap, brandEase } from '$lib/motion';

type ExitPortalOptions = {
  timeline: gsap.core.Timeline;
  cards: HTMLElement[];
  viewport: HTMLElement;
  onPortalReady?: (detail: { focusRect: DOMRect }) => void;
};

export function attachFilmExitPortal(options: ExitPortalOptions) {
  if (!options.cards.length) {
    return () => {};
  }

  const overlays = Array.from({ length: 2 }, (_, idx) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.border = '1px solid var(--colors-eggToast)';
    overlay.style.borderRadius = '999px';
    overlay.style.opacity = '0';
    overlay.style.mixBlendMode = 'screen';
    overlay.style.transformOrigin = 'center center';
    overlay.style.filter = 'blur(1px)';
    overlay.style.zIndex = `${20 + idx}`;
    options.viewport.appendChild(overlay);
    return overlay;
  });

  const exitStart = 0.85;
  const centerIndex = (options.cards.length - 1) / 2;

  options.cards.forEach((card, index) => {
    options.timeline.to(
      card,
      {
        scale: index === centerIndex ? 0.95 : 0.9,
        duration: 0.2
      },
      exitStart + index * 0.03
    );
  });

  overlays.forEach((overlay, idx) => {
    options.timeline.set(
      overlay,
      {
        opacity: 0,
        scale: 0.5 + idx * 0.2
      },
      exitStart + idx * 0.02
    );
    options.timeline.to(
      overlay,
      {
        opacity: 0.35,
        duration: 0.18,
        ease: brandEase
      },
      exitStart + 0.08 + idx * 0.03
    );
    options.timeline.to(
      overlay,
      {
        opacity: 0,
        scale: 1.9 + idx * 0.4,
        duration: 0.4,
        ease: 'power2.out'
      },
      exitStart + 0.18 + idx * 0.05
    );
  });

  const gridStart = exitStart + 0.25;
  options.cards.forEach((card, index) => {
    const column = index % 2 === 0 ? -1 : 1;
    const row = index === 0 ? 0 : 1;
    options.timeline.to(
      card,
      {
        xPercent: column * 12 * (row + 1),
        yPercent: row ? 8 : -6,
        duration: 0.25,
        transformOrigin: 'center center'
      },
      gridStart
    );
  });

  const stripStart = gridStart + 0.25;
  options.cards.forEach((card, index) => {
    const offset = (index - centerIndex) * 55;
    options.timeline.to(
      card,
      {
        xPercent: offset,
        yPercent: 0,
        duration: 0.35,
        ease: brandEase
      },
      stripStart
    );
  });

  options.timeline.call(() => {
    const focusRect = options.cards[0]?.getBoundingClientRect();
    if (focusRect) {
      options.onPortalReady?.({ focusRect });
    }
  }, undefined, stripStart + 0.35);

  return () => {
    overlays.forEach((overlay) => overlay.remove());
  };
}
