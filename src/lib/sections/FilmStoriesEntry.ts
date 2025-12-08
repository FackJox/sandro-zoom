import { gsap, brandEase } from '$lib/motion';
import { getVideoSources } from '$lib/utils/video';
import {
  filmStoriesEntryStrip,
  filmStoriesEntryFrame,
  filmStoriesEntryMedia,
  filmStoriesEntryFocusRing,
  filmStoriesEntryDivider
} from '$lib/styles/recipes';

export type ReelFrame = {
  title: string;
  src: string;
  type: 'video' | 'image';
};

type FilmStoriesEntryOptions = {
  container: HTMLElement;
  targetMedia: HTMLElement;
  focusRect?: DOMRect;
  filmFrames: ReelFrame[];
  storyFrames: ReelFrame[];
  onComplete?: () => void;
};

export function playFilmStoriesEntry(options: FilmStoriesEntryOptions): () => void {
  const { container, targetMedia, focusRect, filmFrames, storyFrames, onComplete } = options;

  // Create reel strip container
  const reelStrip = document.createElement('div');
  reelStrip.className = filmStoriesEntryStrip();
  container.appendChild(reelStrip);

  // Create film frames (left side - K2/14 Peaks)
  const filmElements: HTMLElement[] = [];
  filmFrames.forEach((frame) => {
    const frameEl = document.createElement('div');
    frameEl.className = filmStoriesEntryFrame();

    if (frame.type === 'video') {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = filmStoriesEntryMedia();
      getVideoSources(frame.src).forEach((source) => {
        const sourceNode = document.createElement('source');
        sourceNode.src = source.src;
        sourceNode.type = source.type;
        video.appendChild(sourceNode);
      });
      frameEl.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = frame.src;
      img.alt = frame.title;
      img.className = filmStoriesEntryMedia();
      frameEl.appendChild(img);
    }

    reelStrip.appendChild(frameEl);
    filmElements.push(frameEl);
  });

  // Add divider
  const divider = document.createElement('div');
  divider.className = filmStoriesEntryDivider();
  reelStrip.appendChild(divider);

  // Create story frames (right side - Film Stories)
  const storyElements: HTMLElement[] = [];
  storyFrames.forEach((frame, index) => {
    const frameEl = document.createElement('div');
    frameEl.className = filmStoriesEntryFrame({ active: index === 0 });

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.className = filmStoriesEntryMedia();
    getVideoSources(frame.src).forEach((source) => {
      const sourceNode = document.createElement('source');
      sourceNode.src = source.src;
      sourceNode.type = source.type;
      video.appendChild(sourceNode);
    });
    frameEl.appendChild(video);

    reelStrip.appendChild(frameEl);
    storyElements.push(frameEl);
  });

  // Create focus ring
  const focusRing = document.createElement('div');
  focusRing.className = filmStoriesEntryFocusRing();
  reelStrip.appendChild(focusRing);

  // Build animation timeline
  const tl = gsap.timeline({
    defaults: { ease: brandEase },
    onComplete: () => {
      cleanup();
      onComplete?.();
    }
  });

  // Get positions for animation
  const lastFilmFrame = filmElements[filmElements.length - 1];
  const firstStoryFrame = storyElements[0];

  // Initial state: last K2 frame is sharp, everything else blurred (§3.2)
  // Set all frames to blurred initially
  filmElements.forEach((el) => {
    gsap.set(el, { filter: 'blur(2px) grayscale(0.5)', opacity: 0.6 });
  });
  storyElements.forEach((el) => {
    gsap.set(el, { filter: 'blur(2px) grayscale(0.5)', opacity: 0.6 });
  });
  // Make last K2 frame sharp (focus starts here)
  if (lastFilmFrame) {
    gsap.set(lastFilmFrame, { filter: 'blur(0) grayscale(0)', opacity: 1 });
  }

  tl
    // Fade in strip
    .to(reelStrip, { opacity: 1, duration: 0.3 })
    // Position focus ring over last K2 frame
    .call(() => {
      if (lastFilmFrame) {
        const rect = lastFilmFrame.getBoundingClientRect();
        const stripRect = reelStrip.getBoundingClientRect();
        gsap.set(focusRing, {
          left: rect.left - stripRect.left + rect.width / 2,
          top: rect.top - stripRect.top + rect.height / 2,
          opacity: 1
        });
      }
    })
    // Short pause
    .to({}, { duration: 0.2 })
    // Slide focus ring to Sasha (first story) - blur/focus follows ring
    .to(focusRing, {
      left: () => {
        if (!firstStoryFrame) return 0;
        const rect = firstStoryFrame.getBoundingClientRect();
        const stripRect = reelStrip.getBoundingClientRect();
        return rect.left - stripRect.left + rect.width / 2;
      },
      duration: 0.5,
      ease: 'power2.inOut'
    })
    // K2 frame blurs as ring leaves it
    .to(lastFilmFrame, {
      filter: 'blur(3px) grayscale(0.6)',
      opacity: 0.4,
      duration: 0.35,
      ease: 'power2.inOut'
    }, '<0.1')
    // Sasha becomes sharp as ring arrives
    .to(firstStoryFrame, {
      filter: 'blur(0) grayscale(0)',
      opacity: 1,
      duration: 0.35,
      ease: 'power2.inOut'
    }, '<0.15')
    // Shrink focus ring (tighten on Sasha)
    .to(focusRing, { scale: 0.9, duration: 0.2 })
    // Expand to full viewport zoom
    .to(focusRing, {
      scale: 15,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in'
    })
    // Fade out strip
    .to(reelStrip, { opacity: 0, duration: 0.3 }, '<0.2');

  function cleanup() {
    tl.kill();
    reelStrip.remove();
  }

  return cleanup;
}

// Helper to create frame data from filmCards
export function createFilmFrames(
  cards: Array<{ title: string; media: { src: string; type: 'video' | 'image' } }>
): ReelFrame[] {
  return cards.map((card) => ({
    title: card.title,
    src: card.media.src,
    type: card.media.type
  }));
}

// Helper to create frame data from filmStories
export function createStoryFrames(
  stories: Array<{ title: string; src: string }>
): ReelFrame[] {
  return stories.map((story) => ({
    title: story.title,
    src: story.src,
    type: 'video' as const
  }));
}
