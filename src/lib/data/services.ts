/**
 * Services Section Content
 * Framework 5 §2: Credits-style services on black
 */

export type ServiceCredit = {
  label: string;
  /** Optional subtitle (e.g., platform name) */
  subtitle?: string;
};

/** Services per docs/copy.md §7 */
export const serviceCredits: ServiceCredit[] = [
  { label: 'Mountain DOP' },
  { label: 'Exped & Product Photography' },
  { label: 'Aerial Cinematography' },
  { label: 'Stock Footage', subtitle: 'Available on Shutterstock' }
];

/** Section heading */
export const servicesHeading = 'Services / Credits';

/** CTA copy for scroll prompt */
export const servicesCta = {
  line1: 'One more shot ↓',
  line2: 'Scroll for final contact'
};
