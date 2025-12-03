# Hero + Logos QA — 2025-12-02

## Checklist Summary

| Item | Status | Notes |
| --- | --- | --- |
| Hero layering (media / slab / metadata) | ✅ | HeroSection stacks full-bleed video, Egg Toast slab, LensBadge, and MetadataStrip per Framework 1 (§3.1). |
| On-load motion (video fade/push, slab mask, lens scale, copy stagger) | ✅ | `HeroSection.motion.ts` drives each element with brandEnter easing plus text-line stagger (40–60 ms). |
| Idle depth (BG drift, strip masks, lens/slab parallax) | ✅ | Continuous GSAP tween on video, scroll-linked parallax on slab/lens, three circular strip masks moving at different rates. |
| Metadata → logos morph | ✅ | MetadataStrip stays anchored in Hero until the ScrollTrigger morph sequence fades it, updates copy, marks as detached, then Logos re-parents it into the band. |
| Logos rail layout + pan | ✅ | Single-row text logos with responsive gaps, scroll-linked horizontal pan defined in `LogosSection.motion.ts`. |
| Lens continuity + halo | ✅ | Shared lens timeline keeps badge visible across Hero and Logos, halo pulses during detachment, Logos renders secondary lens chip. |
| Netflix portal zoom | ✅ | Circle locks to Netflix logo, scales 0.2→22, fades rail to black, dispatches `portal:film-ready` event for FILM entry. |

## Visual Notes

- Hero metadata strip remains visible within the hero slab until ~75 % scroll, then animates upward and crossfades into the logos band.
- Lens badge halo pulses as it detaches, and the strip masks reveal more of the showreel while the hero scales down.
- Logos band inherits the metadata element, adds the REC lens chip, slowly pans logos, and the Netflix portal iris expands smoothly into the FILM transition.
