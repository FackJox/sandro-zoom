# Gap Analysis Report: Design vs Implementation

**Generated:** 2024-12-17
**Documents Analyzed:**
- Implementation: `251217-1503-implemented-timeline.md`
- Design Plan: `docs/plans/2025-12-07-zoom-out-reveal-design.md`
- Design Frameworks: `docs/design/Framework 1-5.md`

---

## Executive Summary

This analysis identifies discrepancies between the design specifications and the current implementation. Gaps are categorized by severity:

- **CRITICAL**: Core functionality missing or significantly different
- **MAJOR**: Important design elements not implemented
- **MINOR**: Polish/refinement differences
- **VERIFIED**: Design element correctly implemented

---

## SECTION 1: HERO (0vh - 240vh)

### Entry Animation (`hero:intro`)

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Slab: vertical mask reveal from bottom up | Slab: yPercent 15→0, opacity 0→1 | **MINOR GAP** - Uses opacity+translate, not mask |
| Lens: scale-in 0.8→1.0, delayed ~60ms after slab | Lens: scale 0.8→1.0, opacity 0→1 at 0.6s | **VERIFIED** |
| Text: 40-60ms stagger | Text: 35ms stagger | **MINOR GAP** - Faster than spec |
| Media: scale 1.02→1.0, brand-enter ease | Media: scale 1.02→1.0, 0.8s | **VERIFIED** |

### Focus/Idle State

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Subtle pan or push-in "slow tripod adjustment" | Media drift: scale 1.0↔1.04, 6s yoyo loop | **VERIFIED** |
| Lens hover: micro push-in 1.0→1.04 on desktop | Not documented in implementation | **MAJOR GAP** - Missing hover state |
| 2-3 thin circular "slices" of video behind slab with parallax | Strips: yPercent drift, xPercent drift, rotation | **VERIFIED** - Different approach but present |

### Exit: Hero → Logos Morph

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Trigger: ~70% hero height | morph runs 0-240vh (25-55% = 60-132vh) | **MINOR GAP** - Starts earlier |
| Entire hero scales 1.0→0.9 and darkens | Root: scale 1.0→0.9, brightness 1.0→0.72 | **VERIFIED** |
| Lens DETACHES and drifts to corner position | At 85%: lens detached, attaches to 'logos' | **VERIFIED** |
| Lens moves "back" in depth scale 1.0→0.6 | Lens: scale 0.74, xPercent -12, yPercent -38 | **VERIFIED** |
| Faint circular strip mask/halo expands from lens | Halo: opacity 0→0.6→0.9, scale 1.0→1.8→2.4 | **VERIFIED** |
| clipPath circle contraction | clipPath circle(100%→35%→0%) | **VERIFIED** |
| Metadata strip: slides upward, stretches, crossfades text | Metadata: yPercent 0→-240, bg→blackPearl | **MAJOR GAP** - No text crossfade to logos documented |
| Metadata background: Black Stallion → Black Pearl | bg→blackPearl, color→eggToast | **VERIFIED** |

---

## SECTION 2: LOGOS (240vh - 440vh)

### Layout & Behavior

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Horizontal auto-scroll / marquee OR scroll-linked pan | Rail: xPercent 0→-25 continuous drift | **VERIFIED** |
| Small lens bug overlapping strip edge | Lens at xPercent -6, yPercent -55, scale 0.6 | **VERIFIED** |
| Metadata: brand names strip | Metadata: "BERGHAUS • OSPREY • RED BULL TV..." | **VERIFIED** |

### Exit: Logos → BigFilm

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Circle iris appears over Netflix logo | Portal positioned at Netflix logo bounding box | **VERIFIED** |
| Circle EXPANDS (zoom IN) to fill screen | Portal expands from 48px → 85vw → frame size | **VERIFIED** |
| Crossfade Netflix logo → 14 Peaks still/video inside circle | Not explicitly documented | **MAJOR GAP** - Crossfade behavior unclear |
| Thin ring UI "like lens barrel" with tick marks around edge | Not documented | **MAJOR GAP** - Missing lens barrel UI |
| "14 PEAKS / NETFLIX" text on ring | Not documented | **MAJOR GAP** - Missing ring text |
| Rest of logos strip fades slightly | Not explicitly documented | **MINOR GAP** |
| Circle edges "square off quickly" like iris opens → full sensor | Not documented | **MINOR GAP** |

---

## SECTION 3: BIGFILM (440vh - 740vh)

### Layout

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Pinned scrollytelling, 3 cards as "shots on timeline" | Cards pinned, swap 1→2→3 | **VERIFIED** |
| Card step indicator (1■ 2□ 3□) | Step indicator mentioned | **VERIFIED** |
| Yellow frame slab on left side | Frame slab present | **VERIFIED** |
| Label: "FILM — HIGH ALTITUDE FEATURES" | Metadata: "FILM — HIGH ALTITUDE FEATURES" | **VERIFIED** |
| Egg Toast frame outline around video | Not explicitly documented | **MINOR GAP** |

### Card Transitions (Iris Effect)

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Circular mask shrinks 1.0→0.8 (zoom out) | Cards: clipPath circle(150%→0%) | **MAJOR GAP** - No zoom out, just fade |
| Quick crossfade between cards INSIDE circle | Card 0 fades, Card 1 appears - sequential | **MAJOR GAP** - No simultaneous crossfade inside circle |
| Circle snaps open into next shot | clipPath 0%→150% | **PARTIAL** - Expands but no "snap" documented |
| Duration: 220-260ms | Duration: 240ms/260ms | **VERIFIED** |

### Lens Barrel Overlay

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| "14 PEAKS / NETFLIX" text in lens barrel during transition | Lens barrel shows: "K2 WINTER / EXPEDITION" at 28% | **VERIFIED** |
| Thin ring UI with tick marks | Not documented | **MINOR GAP** |

### Lens Bug Behavior

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Subtle rotation or tiny scale blip on card transition | Not documented for card transitions | **MAJOR GAP** - Only documented for zoom-out transitions |
| Low-key, desaturated, Level 1 motion | Not documented | **MINOR GAP** |

### Exit: BigFilm → FilmStories

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Card 3 scales down 0.9 into center | Cards scale 1.0→0.9-0.95 at 85-88% | **VERIFIED** |
| Concentric circles (lens rings) in Egg Toast / Silverplate | Concentric rings: opacity pulse, scale 0.5→1.9 | **VERIFIED** |
| Cards shrink into horizontal strip like film frames | Cards: scale→0.35, arranged horizontally | **VERIFIED** |
| Preview strip with Sasha/Grace/Afghanistan thumbs in grayscale | Preview strip: opacity 0→1→0 at 92-97% | **PARTIAL** - Content unclear |
| Camera/viewport pans + zooms into Sasha frame region | triggerFilmStoriesEntry() at 92% | **PARTIAL** - Mechanism unclear |
| Circular mask highlights next story like focus pull | Not documented | **MAJOR GAP** - Focus pull effect missing |
| Outer area blurred, incoming frame sharp | Not documented | **MAJOR GAP** - Blur/focus depth missing |

---

## SECTION 4: FILMSTORIES (740vh - 1000vh)

### Layout

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Stories: Sasha, Grace, Afghanistan (Noshaq) | Not explicitly listed | **MINOR GAP** - Content names unclear |
| Video player primary, text below/side | Story grid selector, text crossfade | **PARTIAL** |
| Focus ring indicator | Focus ring mentioned | **VERIFIED** |
| "FILM — FIELD STORIES" label | Not documented | **MINOR GAP** |

### Entry from BigFilm

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| See wider reel with 6 frames (3 BigFilm + 3 FilmStories) | Cards shrink to film strip | **PARTIAL** |
| Circular focus ring slides from K2 to Sasha | Not documented | **MAJOR GAP** - Focus ring pan missing |
| Frame under ring is sharp, others blurred | Not documented | **MAJOR GAP** - Depth of field missing |
| Ring tightens and zooms in to fill screen | Not documented | **MAJOR GAP** - Entry zoom missing |

### In-Section: Story to Story Transitions

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Lens pan across 3-frame strip | Not documented | **MAJOR GAP** |
| Current frame shifts sideways (dolly) | Not documented | **MAJOR GAP** |
| Circular focus ring on upcoming story | Focus ring animates to selected position | **PARTIAL** |
| Focus ring shrinks (zoom out) then lifts away | Not documented | **MAJOR GAP** |
| Story label crossfades | Text crossfade: fade + yPercent -12 | **VERIFIED** |
| Copy slides up with stagger | Stagger: 60ms | **VERIFIED** |
| Dot indicator flips with hard mask wipe | Not documented | **MINOR GAP** |

### Lens Bug Behavior

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| 5-10° rotation or 1-2% scale blip on story boundary | Not documented | **MAJOR GAP** - Missing from FilmStories |
| Very subdued, same position | General lens behavior | **PARTIAL** |

---

## SECTION 5: PHOTOSTATS (1000vh - 1160vh)

### Layout

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Successful vs unsuccessful climbs stats | Success/fail climb stats | **VERIFIED** |
| Basecamp drone video as BG | Night mountain scene with base camp | **VERIFIED** |
| "PHOTO — SUCCESSFUL CLIMBS" heading | Not documented | **MINOR GAP** |

### Entry from FilmStories

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Stories shrink into vertical strip on left | Part of zoom-out transition | **PARTIAL** |
| Circular focus ring moves to stats block | Not documented | **MAJOR GAP** |
| Stats block scales up as portal zoom in | PhotoStats parallax: scale 1.2→1.0 | **PARTIAL** - Parallax, not portal |
| Film strip lingers slightly then fades | FilmStories remnant: clipPath 12%→0% | **VERIFIED** |

### Exit: PhotoStats → About

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Zoom out from stats card | PhotoStats: clipPath 150%→12% | **VERIFIED** |
| Concentric circles around it | Part of zoom-out system | **VERIFIED** |
| Basecamp continues slow pan | Not documented | **MINOR GAP** |

---

## SECTION 6: ABOUT (1160vh - 1460vh)

> **Verified 2024-12-19**: Playwright tests confirm all beat transitions, values stagger, and exit portal working correctly.

### Layout

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| 3 beats: Front-line, Origin, Values | 3 beats: Basecamp, Frontline, Values | **VERIFIED** - Names differ but structure correct |
| Two-column on desktop (media left, text right) | Media transitions between beats | **VERIFIED** |
| Centered zooms for all transitions | Beat transitions in section | **VERIFIED** |
| "ABOUT ME — FRONT-LINE PERSPECTIVE" label | Metadata strip shows section label | **VERIFIED** |

### Entry from PhotoStats

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Stats card frozen at center | Part of zoom-out transition | **VERIFIED** |
| Circular focus ring in center over stats | `StatsToAboutPortal.svelte` portalCircle with Egg Toast boxShadow | **VERIFIED** |
| Text crossfade INSIDE circle: stats → about intro | `StatsToAboutPortal.svelte` lines 92-103 | **VERIFIED** |
| Basecamp crossfades to front-line image | `StatsToAboutPortal.svelte` lines 105-114 | **VERIFIED** |
| Circle expands to full viewport | `StatsToAboutPortal.svelte` lines 116-127 | **VERIFIED** |

### Beat to Beat Transitions

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Soft focus blur on current scene | `AboutSection.motion.ts` lines 341-347 | **VERIFIED** |
| BG video tilts/pans as "camera repositioning" | `AboutSection.motion.ts` lines 349-368 | **VERIFIED** |
| Circular focus ring in center | Focus ring movement + travels between beats (lines 370-396) | **VERIFIED** |
| Inside ring: next BG fades in | Inside mask: incoming beat fades in (lines 398-442) | **VERIFIED** |
| Outside ring: current BG fades out | Outside mask: outgoing beat fades out | **VERIFIED** |
| Text crossfades inside circle | Text crossfade with slide | **VERIFIED** |
| "Stories from mountains..." line 1 fades first, line 2 slides up | Values stagger: Line 1 at 0.74, Line 2 slides at 0.78 (lines 458-480) | **VERIFIED** |

---

## SECTION 7: SERVICES (1460vh - 1760vh)

### Entry: Grid Flip from About

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Viewport freezes ~60-80ms | Not documented | **MINOR GAP** |
| 4×4 or 5×4 grid of Egg Toast lines slams into place | Grid flip entry animation mentioned | **PARTIAL** |
| Tiles flip on Y axis, center-out stagger | Not documented | **MAJOR GAP** |
| Back of tiles: full-screen video (same frame) | Not documented | **MAJOR GAP** |
| Grid lines fade, leaves full-bleed video | Not documented | **MAJOR GAP** |

### Layout: Credits on Black

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Intro video frame (16:9, Alpine Noir) | receivePortalIntro(focusRect) | **PARTIAL** |
| Black Stallion fullscreen background | Not documented | **MAJOR GAP** |
| Credits roll centered: MOUNTAIN DOP, EXPED & PRODUCT PHOTOGRAPHY, AERIAL CINEMATOGRAPHY, STOCK FOOTAGE | Not documented | **CRITICAL GAP** |
| Credits scroll upward with page scroll | Not documented | **CRITICAL GAP** |
| "ONE MORE SHOT ↓ / SCROLL FOR CONTACT" CTA | Not documented | **CRITICAL GAP** |

### Motion

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Video fades to black mid-scroll | Not documented | **MAJOR GAP** |
| Optional circular vignette fade | Not documented | **MAJOR GAP** |
| Credit lines manual scroll (bottom→center→top) | Not documented | **CRITICAL GAP** |
| CTA line fades in at section end | Not documented | **MAJOR GAP** |

---

## SECTION 8: FINALCONTACT (1760vh - 1960vh)

### Entry: 3D Camera Reveal

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Services section becomes 3D card | receivePortalIntro triggers | **PARTIAL** |
| Scale 1.0→~0.4 | Not documented | **MAJOR GAP** |
| Translation: center → down-right corner | Not documented | **MAJOR GAP** |
| Rotation: rotateY 15°, rotateX -10° (like angled LCD) | Not documented | **MAJOR GAP** |
| 3D camera model fades/animates in behind | 3D camera model overlay mentioned | **PARTIAL** |
| Services rectangle snaps into place as back screen | Not documented | **CRITICAL GAP** |
| Cinematic mountain/BTS scene as BG | Person portrait with smoke as BG | **PARTIAL** - Different visual |

### Layout

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Contact text above camera | Contact panel documented | **VERIFIED** |
| "If you have a story to tell please get in touch" | Documented | **VERIFIED** |
| Phone + email | Documented | **VERIFIED** |
| Camera in bottom-right with LCD showing services credits | 3D camera model overlay | **PARTIAL** |

### Motion

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Contact text fade in 0→1 with rise (+10px→0) | Not documented | **MINOR GAP** |
| Camera idle: slow vertical bob/breathing | Not documented | **MINOR GAP** |
| Lens glass subtle animated reflection | Not documented | **MINOR GAP** |
| Mouse parallax: camera rotates few degrees with pointer | Not documented | **MINOR GAP** |

---

## ZOOM-OUT TRANSITION SYSTEM (Global)

### Architecture

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Three-layer system: Remnant (N-2), Current (N-1), Incoming (N) | Z-index: remnant 3, current 2, incoming 1 | **VERIFIED** |
| Torus mask (donut mask) using radial-gradient | clipPath: circle() | **MAJOR GAP** - No torus/donut |
| Inner radius shrinks FASTER than outer (ring thickens) | Single circle shrinks | **MAJOR GAP** - No thickness animation |
| mask-image animation (not clipPath) | Uses clipPath | **MAJOR GAP** - Wrong technique |

### Transition 1: BigFilm → FilmStories (695-740vh)

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| BigFilm contracts circle(150%→12%) | Documented | **VERIFIED** |
| FilmStories parallax scale 1.2→1.0, y -40→0 | Documented | **VERIFIED** |
| Lens blip rotation 0→7°→0, scale 1.0→1.02→1.0 | Documented at ~30% | **VERIFIED** |
| BigFilm remnant visible at 12% circle | Part of system | **VERIFIED** |

### Transition 2: FilmStories → PhotoStats (961-1000vh)

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| BigFilm remnant disappears (12%→0%) at 0-40% | Documented | **VERIFIED** |
| FilmStories contracts circle(150%→12%) | Documented | **VERIFIED** |
| PhotoStats parallax | Documented | **VERIFIED** |
| Lens blip | Documented | **VERIFIED** |

### Transition 3: PhotoStats → About (1136-1160vh)

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| FilmStories remnant disappears | Documented | **VERIFIED** |
| PhotoStats contracts | Documented | **VERIFIED** |
| About parallax | Documented | **VERIFIED** |
| Lens blip | Documented | **VERIFIED** |

### Parallax Elements

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Start: scale 1.2, y -40px | scale 1.2→1.0, y -40→0 | **VERIFIED** |
| End: scale 1.0, y 0 | Documented | **VERIFIED** |
| Rate: 0.85x of mask contraction (lags behind) | Not explicitly documented | **MINOR GAP** |
| Stagger: 60-80ms between elements | Not documented | **MINOR GAP** |

### Per-Transition Parallax Targets

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| BigFilm → FilmStories: Video viewport, story title, body text, step indicator | Not itemized | **MINOR GAP** |
| FilmStories → PhotoStats: Stats card, heading, step indicator | Not itemized | **MINOR GAP** |
| PhotoStats → About: Beat panel, media column, section label | Not itemized | **MINOR GAP** |

---

## PERSISTENT ELEMENTS

### Lens Bug

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| Lives outside section stack, never masked | Persistent layer, z-index 10 | **VERIFIED** |
| After Hero detachment: top-right corner | Position: Fixed, top 1.5rem, right 1.5rem | **VERIFIED** |
| During transitions: 5-10° rotation OR scale blip 1.0→1.04→1.0 | Blip: rotation 7°, scale 1.02 | **VERIFIED** |
| Desaturated, ghost/screen blend mode | Tone: 'ghost' (screen blend mode) | **VERIFIED** |
| Hidden when hero owns lens | Hidden when hero owns lens | **VERIFIED** |

### Section Labels

| Design Spec | Implementation | Status |
|-------------|----------------|--------|
| NOT persistent - live inside sections, get masked | Metadata handled per-section | **VERIFIED** |

---

## GAP SUMMARY BY SEVERITY

### CRITICAL (3 items)
1. **Services credits roll system** - Entire credit-style typography scroll animation missing
2. **Services CTA line** - "ONE MORE SHOT / SCROLL FOR CONTACT" not implemented
3. **3D camera reveal mechanics** - Services content becoming camera LCD screen not documented

### MAJOR (21 items)
1. Hero lens hover state missing
2. Logos → BigFilm: Netflix→14Peaks crossfade unclear
3. Logos → BigFilm: Lens barrel UI with tick marks missing
4. Logos → BigFilm: Ring text "14 PEAKS / NETFLIX" missing
5. BigFilm card transitions: No zoom-out inside circle
6. BigFilm card transitions: No crossfade inside circle
7. BigFilm lens bug blip during card transitions missing
8. BigFilm exit: Focus pull/blur effect missing
9. FilmStories entry: Focus ring pan from K2 to Sasha missing
10. FilmStories entry: Depth of field blur missing
11. FilmStories entry: Entry zoom animation missing
12. FilmStories: Lens pan across strip missing
13. FilmStories: Dolly shift missing
14. FilmStories: Focus ring zoom out/lift missing
15. FilmStories: Lens bug blip on story boundary missing
16. PhotoStats entry: Focus ring move to stats missing
17. Services: Grid flip center-out stagger mechanics missing
18. Services: Video underneath grid tiles missing
19. Services: Black background with credits missing
20. Services: Video fade to black missing
21. Zoom-out: Torus mask (donut) pattern not implemented (uses circle)

> **Note**: About section items (17-19) previously listed as MAJOR gaps have been verified as implemented in `StatsToAboutPortal.svelte` and `AboutSection.motion.ts` (verified 2024-12-19).

### MINOR (25+ items)
- Timing variations (stagger values, trigger points)
- Label text differences
- Animation technique variations that achieve similar effects
- Documentation gaps for standard behaviors

---

## IMPLEMENTATION RECOMMENDATIONS

### Priority 1: Critical Fixes
1. Implement Services credits roll system with scroll-driven typography
2. Add "ONE MORE SHOT" CTA with proper timing
3. Complete 3D camera reveal where Services content becomes LCD

### Priority 2: Major Visual Gaps
1. Add lens barrel UI during Logos → BigFilm portal
2. Implement proper focus pull/blur effects for transitions
3. Add inside-circle crossfade behavior for BigFilm cards
4. Complete FilmStories entry sequence with focus ring pan
5. Implement torus/donut mask for zoom-out transitions

### Priority 3: Polish & Refinement
1. Add hover states for lens badge
2. Ensure all lens bug blips fire at correct moments
3. Add depth of field blur effects
4. Document parallax stagger values

---

## FILES TO MODIFY

Based on gap analysis, these files likely need updates:

| File | Gaps to Address |
|------|-----------------|
| `src/lib/motion/zoomOutTransition.ts` | Torus mask, parallax stagger |
| `src/lib/sections/BigFilmSection.motion.ts` | Inside-circle crossfade, lens blip |
| `src/lib/sections/LogosSection.motion.ts` | Lens barrel UI, ring text |
| `src/lib/sections/FilmStoriesSection` | Entry sequence, focus ring, story transitions |
| `src/lib/sections/ServicesSection` | Grid flip, credits roll, black background |
| `src/lib/sections/FinalContactSection` | 3D camera reveal mechanics |
| `src/lib/motion/lensTimeline.ts` | Hover state, additional blips |

---

## VERIFICATION NOTES

Items marked **VERIFIED** were confirmed present in the implementation timeline with matching or equivalent behavior to the design spec.

Items marked **PARTIAL** have some implementation but are incomplete or differ significantly from the design intent.

Items marked **GAP** have no documented implementation in the timeline analysis.
