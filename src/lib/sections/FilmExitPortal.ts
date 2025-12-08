import { gsap, brandEase } from '$lib/motion';
import { getVideoSources } from '$lib/utils/video';
import {
  filmExitOverlay,
  filmExitPreviewStrip,
  filmExitPreviewCard,
  filmExitPreviewVideo,
  filmExitPreviewLabel,
  filmExitStickyLabel
} from '$lib/styles/recipes';

type ExitPortalOptions = {
  timeline: gsap.core.Timeline;
  cards: HTMLElement[];
  viewport: HTMLElement;
  previewStories?: Array<{ title: string; src: string }>;
  labelElement?: HTMLElement | null;
  onPortalReady?: (detail: { focusRect: DOMRect }) => void;
  // Framework 2 §3.6: Concentric circles callbacks
  onConcentricShow?: (scale: number) => void;
  onConcentricHide?: () => void;
};

export function attachFilmExitPortal(options: ExitPortalOptions) {
  if (!options.cards.length) {
    return () => {};
  }

  // Create concentric ring overlays using PandaCSS recipe
  const overlays = Array.from({ length: 2 }, (_, idx) => {
    const overlay = document.createElement('div');
    overlay.className = filmExitOverlay();
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
    previewStrip.className = filmExitPreviewStrip();
    options.viewport.appendChild(previewStrip);

    options.previewStories.forEach((story) => {
      const card = document.createElement('div');
      card.className = filmExitPreviewCard();

      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = filmExitPreviewVideo();
      getVideoSources(story.src).forEach((source) => {
        const sourceNode = document.createElement('source');
        sourceNode.src = source.src;
        sourceNode.type = source.type;
        video.appendChild(sourceNode);
      });

      const label = document.createElement('span');
      label.textContent = story.title;
      label.className = filmExitPreviewLabel();

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
    stickyLabel.className = filmExitStickyLabel();
    options.viewport.appendChild(stickyLabel);
  }

  // Framework 2 §3.6: Show concentric circles at exit start
  options.timeline.call(
    () => options.onConcentricShow?.(1),
    undefined,
    exitStart
  );

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

  // Framework 2 §3.6: First stage - cards scale down dramatically toward center
  const gridStart = exitStart + 0.25;
  options.cards.forEach((card, index) => {
    options.timeline.to(
      card,
      {
        scale: 0.45,  // Scale down significantly (like frames on film strip)
        duration: 0.3,
        ease: brandEase,
        transformOrigin: 'center center'
      },
      gridStart
    );
  });

  // Framework 2 §3.6: Second stage - arrange into horizontal film strip
  const stripStart = gridStart + 0.25;
  options.cards.forEach((card, index) => {
    // Space cards evenly like frames on a film strip
    const stripOffset = (index - centerIndex) * 38;  // % offset from center
    options.timeline.to(
      card,
      {
        xPercent: stripOffset,
        yPercent: 0,
        scale: 0.35,  // Slightly smaller in final strip position
        duration: 0.35,
        ease: brandEase
      },
      stripStart
    );
  });

  // Add film strip border styling effect
  options.timeline.to(
    options.cards,
    {
      borderWidth: '2px',
      borderColor: '#464f4c',  // coverOfNight color
      borderRadius: '2px',
      duration: 0.2
    },
    stripStart
  );

  if (options.labelElement) {
    options.timeline.to(options.labelElement, { opacity: 0, y: -10, duration: 0.3 }, exitStart);
  }
  if (stickyLabel) {
    options.timeline.to(stickyLabel, { opacity: 1, duration: 0.3 }, stripStart);
  }

  // Framework 2 §3.6: Animate concentric circles scale during strip formation
  options.timeline.call(
    () => options.onConcentricShow?.(1.5),
    undefined,
    stripStart
  );

  if (previewStrip) {
    options.timeline.to(options.cards, { opacity: 0, duration: 0.3 }, stripStart);
    options.timeline.to(previewStrip, { opacity: 1, duration: 0.35 }, stripStart + 0.1);
  }

  // Framework 2 §3.6: Hide concentric circles after strip is formed
  options.timeline.call(
    () => options.onConcentricHide?.(),
    undefined,
    stripStart + 0.4
  );

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
