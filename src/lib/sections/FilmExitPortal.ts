import { gsap, brandEase } from '$lib/motion';
import { getVideoSources } from '$lib/utils/video';

type ExitPortalOptions = {
  timeline: gsap.core.Timeline;
  cards: HTMLElement[];
  viewport: HTMLElement;
  previewStories?: Array<{ title: string; src: string }>;
  labelElement?: HTMLElement | null;
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

  let previewStrip: HTMLDivElement | null = null;
  const previewItems: HTMLElement[] = [];
  if (options.previewStories?.length) {
    previewStrip = document.createElement('div');
    previewStrip.style.position = 'absolute';
    previewStrip.style.inset = '0';
    previewStrip.style.display = 'flex';
    previewStrip.style.alignItems = 'center';
    previewStrip.style.justifyContent = 'space-around';
    previewStrip.style.padding = '1rem';
    previewStrip.style.opacity = '0';
    previewStrip.style.pointerEvents = 'none';
    previewStrip.style.gap = '1rem';
    options.viewport.appendChild(previewStrip);

    options.previewStories.forEach((story) => {
      const card = document.createElement('div');
      card.style.width = '28%';
      card.style.aspectRatio = '1 / 0.65';
      card.style.border = '1px solid var(--colors-border)';
      card.style.borderRadius = '4px';
      card.style.overflow = 'hidden';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.backgroundColor = 'rgba(15,23,26,0.8)';
      card.style.position = 'relative';

      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      getVideoSources(story.src).forEach((source) => {
        const sourceNode = document.createElement('source');
        sourceNode.src = source.src;
        sourceNode.type = source.type;
        video.appendChild(sourceNode);
      });

      const label = document.createElement('span');
      label.textContent = story.title;
      label.style.position = 'absolute';
      label.style.left = '0.5rem';
      label.style.right = '0.5rem';
      label.style.bottom = '0.4rem';
      label.style.fontSize = '0.65rem';
      label.style.letterSpacing = '0.14em';
      label.style.textTransform = 'uppercase';
      label.style.color = 'var(--colors-eggToast)';
      label.style.textShadow = '0 0 6px rgba(0,0,0,0.6)';

      card.appendChild(video);
      card.appendChild(label);
      previewStrip?.appendChild(card);
      previewItems.push(card);
    });
  }

  let stickyLabel: HTMLDivElement | null = null;
  if (options.labelElement) {
    stickyLabel = document.createElement('div');
    stickyLabel.textContent = 'Film — Field Stories';
    stickyLabel.style.position = 'absolute';
    stickyLabel.style.top = '1rem';
    stickyLabel.style.left = '1rem';
    stickyLabel.style.textTransform = 'uppercase';
    stickyLabel.style.letterSpacing = '0.2em';
    stickyLabel.style.fontFamily = 'var(--fonts-trade, "Trade Gothic Next", sans-serif)';
    stickyLabel.style.color = 'var(--colors-eggToast)';
    stickyLabel.style.opacity = '0';
    options.viewport.appendChild(stickyLabel);
  }

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

  if (options.labelElement) {
    options.timeline.to(options.labelElement, { opacity: 0, y: -10, duration: 0.3 }, exitStart);
  }
  if (stickyLabel) {
    options.timeline.to(stickyLabel, { opacity: 1, duration: 0.3 }, stripStart);
  }

  if (previewStrip) {
    options.timeline.to(options.cards, { opacity: 0, duration: 0.3 }, stripStart);
    options.timeline.to(previewStrip, { opacity: 1, duration: 0.35 }, stripStart + 0.1);
  }

  options.timeline.call(() => {
    const focusRect = previewItems[0]?.getBoundingClientRect() ?? options.cards[0]?.getBoundingClientRect();
    if (focusRect) {
      options.onPortalReady?.({ focusRect });
    }
  }, undefined, stripStart + 0.5);

  return () => {
    overlays.forEach((overlay) => overlay.remove());
    previewStrip?.remove();
    stickyLabel?.remove();
  };
}
