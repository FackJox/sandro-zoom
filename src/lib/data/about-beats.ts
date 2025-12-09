/**
 * About Section Beat Data
 * Framework 4 §1: Three narrative beats for the About Me section
 */

import { serviceCredits } from './services';

export type BeatBackground = {
  mobile: string;
  desktop?: string;
  video?: string;
};

export type Beat = {
  title: string;
  stepLabel: string;
  body: string[];
  background: BeatBackground;
};

/**
 * Beat content per Framework 4 design spec §1 and docs/copy.md §6
 * - Beat 1: Front-line Perspective
 * - Beat 2: Origin Story
 * - Beat 3: Values & Work
 */
export const aboutBeats: Beat[] = [
  {
    title: 'Front-line Perspective',
    stepLabel: 'Front-line',
    body: [
      "Over the past decade I've documented some of the biggest stories from the world of high altitude mountaineering. I stood on the highest peak in Afghanistan, Mt Noshaq as the first Afghan woman summited and the highest peak in Pakistan, K2 as the first Pakistani woman summited.",
      'I filmed Nirmal Purja as he set a blazing speed record on the 14 8,000ers and filmed Kristin Harila as she smashed it.'
    ],
    background: {
      mobile: '/pictures/heli rescue (1 of 2).jpg',
      desktop: '/pictures/EVEREST CLEAN (1 of 2).jpg',
      // Framework 4 §3.1: "Still or subtle clip from Everest/K2, or summit shot"
      video: '/videos/showreel.mp4'
    }
  },
  {
    title: 'Origin Story',
    stepLabel: 'Origin',
    body: [
      'A winding path brought me to the mountains. After dropping out of uni I spent 3 years in Birmingham filming raves, music videos and weddings.',
      'Wanting to see more of the world I joined the British army reserve and soon the commando training combined with my passion for story telling provided opportunities to do just that.',
      "I filmed army expeds to Dhaulagiri in 2016 and Everest in 2017, began building a basecamp network and haven't really stopped carrying cameras up mountains since."
    ],
    background: {
      mobile: '/pictures/city-of-glass.avif',
      video: '/videos/documentary-sierra.mp4'
    }
  },
  {
    title: 'Values & Work',
    stepLabel: 'Values',
    body: [
      "With feeling and fortitude I have the experience to bring human stories from the world's most inhumane corners. I believe deeply in representation and hope the projects I've worked on show people what's possible when you look up and believe."
    ],
    background: {
      mobile: '/pictures/Film Himal Sicker 01.jpg',
      desktop: '/pictures/earth puja (21 of 45).JPG',
      // Framework 4 §3.3: "More human shot (camp with people, community, or sunrise)"
      video: '/videos/short-film-harbor.mp4'
    }
  }
];

/** Step labels extracted from beats for indicator component */
export const aboutSteps = aboutBeats.map((beat) => beat.stepLabel);

/** Beat 3 special stagger lines (Framework 4 §5.3) */
export const valuesStaggerLines = {
  line1: 'Stories from the mountains and the people in between',
  line2: 'are slowly being collected on my YouTube channel.'
};

/** Ghost grid labels derived from services data (Framework 4 §6) */
export const servicesGhostLabels = serviceCredits.map(s =>
  s.label.replace('& Product Photography', 'Photography').replace('Cinematography', 'Cinema')
);
