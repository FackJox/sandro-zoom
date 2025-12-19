/**
 * Client Logos / Social Proof Strip
 * Framework 1 §3.3-3.4: Logos section with horizontal rail
 */

export type ClientLogo = {
  name: string;
  /** Path to logo image in /static/logos/ */
  image?: string;
  /** Triggers portal transition when present */
  isPortalTrigger?: boolean;
};

/** Client logos per docs/copy.md §2 */
export const clientLogos: ClientLogo[] = [
  { name: 'Berghaus', image: '/logos/berghaus.avif' },
  { name: 'Osprey', image: '/logos/osprey.avif' },
  { name: 'Red Bull TV', image: '/logos/redbull.avif' },
  { name: 'Epic TV', image: '/logos/epic.avif' },
  { name: 'Netflix', image: '/logos/netflix.avif', isPortalTrigger: true },
  { name: 'BBC', image: '/logos/bbc.avif' },
  { name: 'The North Face', image: '/logos/northface.avif' },
  { name: 'Black Crows', image: '/logos/black-crows.avif' },
  { name: 'FP', image: '/logos/fp.avif' },
  { name: 'Scarpa', image: '/logos/scarpa.avif' }
];

/** Portal heading shown during Logos → Film transition - Framework 2 §3.2 */
export const logosPortalHeading = '14 PEAKS / NETFLIX';
