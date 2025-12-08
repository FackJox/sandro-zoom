/**
 * Hero Section Content
 * Framework 1 §3.1: Hero layout with slab + lens badge + metadata strip
 */

export type HeroCopy = {
  /** Primary username/brand */
  title: string;
  /** Tagline - all caps treatment */
  subtitle: string;
  /** Introductory body copy */
  body: string;
  /** Footer note with date range */
  footer: string;
  /** Lens badge label (altitude marker) */
  lensLabel: string;
  /** Scroll hint text */
  scrollHint: string;
};

/** Hero content per Framework 1 design spec §3.1 and docs/copy.md §1 */
export const heroCopy: HeroCopy = {
  title: 'sandrogh',
  subtitle: 'High Altitude & Hostile Environment',
  body: "Over the past decade I've documented some of the biggest stories from the world of high altitude mountaineering.",
  footer: 'Field Notes — 2014 → 2024',
  lensLabel: 'ALT ▲ 8,000m',
  scrollHint: 'Scroll'
};

/** Secondary hero copy for "with feeling and fortitude" tagline */
export const heroTagline =
  "With feeling and fortitude I have the experience to bring human stories from the world's most inhumane corners.";
