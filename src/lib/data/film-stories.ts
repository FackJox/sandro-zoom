/**
 * Film Stories Section Content
 * Framework 3 §3.1-3.5: Sasha / Grace / Afghanistan stories
 */

export type FilmStory = {
  id: string;
  title: string;
  src: string;
  body: string;
  stepLabel: string;
};

/** Film stories per docs/copy.md §4 */
export const filmStories: FilmStory[] = [
  {
    id: 'sasha',
    title: 'Sasha / No Days Off',
    src: '/videos/short-film-harbor.mp4',
    stepLabel: 'Sasha',
    body: "In 2022 I filmed episode 1 of Sasha DiGiulian's 'No Days Off' series for RedBull TV. During preparation for Petzl's RocTrip Sasha, Alex Megos, Steve McClure & Neil Gresham developed new routes in a remote and undeveloped corner of Greece's mainland."
  },
  {
    id: 'grace',
    title: 'Grace / Mental Health',
    src: '/videos/brand-film-x.mp4',
    stepLabel: 'Grace',
    body: 'I directed, shot and edited the story of Grace, a recovering climber searching for a bigger life. Focusing on mental health and community the film was supported by Montane and played at film festivals world wide.'
  },
  {
    id: 'afghanistan',
    title: 'Afghanistan / Charles Schwab',
    src: '/videos/documentary-sierra.mp4',
    stepLabel: 'Afghanistan',
    body: 'Filmed during one of six trips to Afghanistan this commercial for Charles Schwab bank depicts preparation for our record breaking expedition to Mt Noshaq, the countries highest peak at 7,495m.'
  }
];

/** Section label for Film Stories */
export const filmStoriesLabel = 'Film — Field Stories';
