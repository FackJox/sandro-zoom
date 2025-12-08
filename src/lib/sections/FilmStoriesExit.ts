import { gsap, brandEase } from '$lib/motion';
import {
  filmStoriesExitRing,
  filmStoriesVerticalStrip,
  filmStoriesStripCard,
  filmStoriesStripCardMedia,
  filmStoriesStripLabel,
  filmStoriesStatsPreview,
  filmStoriesStatsHeading,
  filmStoriesStatsLine,
  filmStoriesExitFocusRing
} from '$lib/styles/recipes';
import { successfulClimbs, formatStatLine } from '$lib/data/climbing-stats';

type ExitOptions = {
  timeline: gsap.core.Timeline;
  storyCards: HTMLElement[];
  viewport: HTMLElement;
  onPortalReady?: (detail: { focusRect: DOMRect }) => void;
};

export function attachFilmStoriesExitPortal(options: ExitOptions): () => void {
  const { timeline, storyCards, viewport, onPortalReady } = options;

  if (!storyCards.length) {
    return () => {};
  }

  const exitStart = 0.85;

  // Create concentric ring overlays
  const rings = Array.from({ length: 2 }, (_, idx) => {
    const ring = document.createElement('div');
    ring.className = filmStoriesExitRing();
    ring.style.zIndex = `${20 + idx}`;
    viewport.appendChild(ring);
    return ring;
  });

  // Create vertical strip container
  const verticalStrip = document.createElement('div');
  verticalStrip.className = filmStoriesVerticalStrip();
  viewport.appendChild(verticalStrip);

  // Add mini thumbnails with actual video content for each story to the strip
  storyCards.forEach((storyCard) => {
    const card = document.createElement('div');
    card.className = filmStoriesStripCard();

    // Clone the video from the story card into the thumbnail
    const originalVideo = storyCard.querySelector('video');
    if (originalVideo) {
      const thumbVideo = document.createElement('video');
      thumbVideo.autoplay = true;
      thumbVideo.muted = true;
      thumbVideo.loop = true;
      thumbVideo.playsInline = true;
      thumbVideo.className = filmStoriesStripCardMedia();
      // Copy source elements from original video
      originalVideo.querySelectorAll('source').forEach((source) => {
        const clonedSource = source.cloneNode(true) as HTMLSourceElement;
        thumbVideo.appendChild(clonedSource);
      });
      card.appendChild(thumbVideo);
    }

    verticalStrip.appendChild(card);
  });

  // Add "FILM" label to strip
  const stripLabel = document.createElement('span');
  stripLabel.textContent = 'FILM';
  stripLabel.className = filmStoriesStripLabel();
  verticalStrip.appendChild(stripLabel);

  // Create stats preview block with centralized climbing data
  const statsPreview = document.createElement('div');
  statsPreview.className = filmStoriesStatsPreview();
  const statsLines = successfulClimbs.lines
    .map((line) => `<div class="${filmStoriesStatsLine()}">${formatStatLine(line)}</div>`)
    .join('');
  statsPreview.innerHTML = `
    <div class="${filmStoriesStatsHeading()}">Photo — Altitude Log</div>
    ${statsLines}
  `;
  viewport.appendChild(statsPreview);

  // Create focus ring
  const focusRing = document.createElement('div');
  focusRing.className = filmStoriesExitFocusRing();
  viewport.appendChild(focusRing);

  // Get last story card (Afghanistan) for initial focus
  const lastCard = storyCards[storyCards.length - 1];

  // Phase 1: Zoom out from Afghanistan (0.85-0.90)
  timeline.to(
    lastCard,
    {
      scale: 0.8,
      duration: 0.15,
      ease: brandEase
    },
    exitStart
  );

  // Show concentric rings
  rings.forEach((ring, idx) => {
    timeline.set(ring, { opacity: 0, scale: 0.6 + idx * 0.15 }, exitStart);
    timeline.to(
      ring,
      {
        opacity: 0.4,
        duration: 0.12,
        ease: brandEase
      },
      exitStart + 0.05 + idx * 0.02
    );
    timeline.to(
      ring,
      {
        opacity: 0,
        scale: 1.5 + idx * 0.3,
        duration: 0.25,
        ease: 'power2.out'
      },
      exitStart + 0.12 + idx * 0.03
    );
  });

  // Phase 2: Stories collapse to vertical strip (0.90-0.95)
  const stripStart = exitStart + 0.25;
  storyCards.forEach((card, index) => {
    timeline.to(
      card,
      {
        scale: 0.15,
        xPercent: -180,
        yPercent: (index - 1) * 80,
        opacity: 0.6,
        duration: 0.3,
        ease: 'power2.inOut'
      },
      stripStart
    );
  });

  // Fade in vertical strip
  timeline.to(
    verticalStrip,
    {
      opacity: 1,
      duration: 0.25
    },
    stripStart + 0.1
  );

  // Phase 3: Focus ring moves to stats (0.95-0.98)
  const focusStart = stripStart + 0.25;

  // Position focus ring over vertical strip initially
  timeline.call(() => {
    const stripRect = verticalStrip.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    gsap.set(focusRing, {
      left: stripRect.left - viewportRect.left + stripRect.width / 2,
      top: stripRect.top - viewportRect.top + stripRect.height / 2,
      opacity: 1
    });
  }, undefined, focusStart);

  // Fade in stats preview
  timeline.to(
    statsPreview,
    {
      opacity: 1,
      duration: 0.25
    },
    focusStart
  );

  // Move focus ring to stats
  timeline.to(
    focusRing,
    {
      left: () => {
        const statsRect = statsPreview.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        return statsRect.left - viewportRect.left + statsRect.width / 2;
      },
      top: () => {
        const statsRect = statsPreview.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        return statsRect.top - viewportRect.top + statsRect.height / 2;
      },
      width: '14rem',
      height: '10rem',
      duration: 0.4,
      ease: 'power2.inOut'
    },
    focusStart + 0.15
  );

  // Phase 4: Stats zoom in (0.98-1.0)
  const zoomStart = focusStart + 0.45;

  // Scale up stats preview
  timeline.to(
    statsPreview,
    {
      scale: 1.5,
      duration: 0.25,
      ease: 'power2.in'
    },
    zoomStart
  );

  // Fade out focus ring and strip
  timeline.to(
    [focusRing, verticalStrip],
    {
      opacity: 0,
      duration: 0.2
    },
    zoomStart
  );

  // Fire portal ready event
  timeline.call(() => {
    const statsRect = statsPreview.getBoundingClientRect();
    onPortalReady?.({ focusRect: statsRect });
  }, undefined, zoomStart + 0.2);

  // Cleanup function
  return () => {
    rings.forEach((ring) => ring.remove());
    verticalStrip.remove();
    statsPreview.remove();
    focusRing.remove();
  };
}
