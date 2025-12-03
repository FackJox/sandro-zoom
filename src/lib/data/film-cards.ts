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

export const filmCards: FilmCard[] = [
  {
    id: 'netflix',
    title: 'Netflix / 14 Peaks',
    description:
      "Lead cinematographer on Netflix's 14 Peaks — flying drones through the death zone and capturing Nimsdai's family moments.",
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
      'Director of Photography on the first successful K2 winter expedition—operating above 8,000 metres in minus forty conditions.',
    media: {
      type: 'video',
      src: '/videos/documentary-sierra.mp4',
      alt: 'K2 winter expedition footage'
    },
    stepLabel: 'Card 2'
  },
  {
    id: 'k2summit',
    title: 'K2 Summit – Visual Anchor',
    description: 'Sunset on the K2 winter push captured at camp IV — the calm before the summit drama.',
    metadata: ['ALT ▲ 8,611m', '−42°C', '50mm prime'],
    media: {
      type: 'image',
      src: '/pictures/EVEREST CLEAN (1 of 2).jpg',
      alt: 'K2 summit still'
    },
    stepLabel: 'Card 3'
  }
];
