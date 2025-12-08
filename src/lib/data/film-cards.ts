export type FilmCardMedia = {
  type: 'video' | 'image';
  src: string;
  alt: string;
};

export type FilmCard = {
  id: string;
  title: string;
  description: string;
  metadata?: string[];
  media: FilmCardMedia;
  stepLabel: string;
};

// Card content per Framework 2 design spec §3.1
export const filmCards: FilmCard[] = [
  {
    id: 'netflix',
    title: 'Netflix / 14 Peaks',
    description:
      "I worked as lead cinematographer on Netflix's smash hit 14 Peaks. I shot most of the drone footage along with key scenes including the intro, Nims visiting his family and the K2 drama.",
    media: {
      type: 'video',
      src: '/videos/wix-video.mp4',
      alt: '14 Peaks trailer frame'
    },
    stepLabel: 'Card 1'
  },
  {
    id: 'k2winter',
    title: 'K2 Winter Expedition',
    description:
      'I then worked as DOP on the first successful K2 winter expedition.',
    media: {
      type: 'video',
      src: '/videos/documentary-sierra.mp4',
      alt: 'K2 winter expedition footage'
    },
    stepLabel: 'Card 2'
  },
  {
    id: 'k2summit',
    title: 'K2 SUMMIT 2022',
    description:
      'Capturing the world\'s most dangerous peak at golden hour. This shot required waiting three days at 7,800m for the perfect light.',
    metadata: ['ALT ▲ 8,611m', '−42°C', '50mm prime'],
    media: {
      type: 'image',
      src: '/pictures/EVEREST CLEAN (1 of 2).jpg',
      alt: 'K2 summit still'
    },
    stepLabel: 'Card 3'
  }
];
