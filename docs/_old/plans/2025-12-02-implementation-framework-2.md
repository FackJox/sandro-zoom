# Implementation Framework 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Execute Framework 3’s lens-driven Big Film Story experience, including the lens-iris entry from logos, pinned card scrollytelling with circular iris transitions, concentric-ring exit into Film Stories, and persistent HUD elements, all respecting the Panda CSS token system.

**Architecture:** Continue building on the motion shell: timelines register through `scrollOrchestrator`, ScrollSmoother drives scroll physics, the `portalStore` owns circular masks, and shared lens/metadata controllers keep HUD state consistent with Hero/Logos. All Framework 3 work lives behind the `framework2Enabled` feature flag (or future `framework3Enabled` if added) so Framework 1 remains unaffected.

**Tech Stack:** SvelteKit, Panda CSS, GSAP/ScrollTrigger, TypeScript, Panda recipes, native video elements (mp4/hls), optional YouTube iframe API.

**GSAP / Interaction Guidelines**
- All animation work must use the GSAP suite (core, ScrollTrigger, ScrollSmoother, Flip, MotionPath, DrawSVG/MorphSVG, Draggable). Register timelines via the orchestrator so smoothing/reduced-motion fallbacks remain consistent.
- Prioritize cinematic beats (portal zoom, iris transitions, exit sequences) with GSAP timelines and staggered reveals; reserve CSS transitions for trivial hover states only.
- Apply 3D lift through GSAP push-ins and Egg Toast frame highlights (no drop shadows). Cards should feel like they press forward a few pixels, echoing the “camera creep” motion spec from the Brand Design System.
- Keep the zoomed-lens aesthetic tight by leveraging GSAP snap/custom easing and MotionPath helpers wherever precise camera pulls or SVG morphs are required.
---

### Task 1: Data + config scaffolding

**Files:**
- Create: `src/lib/data/big-film-cards.ts`
- Modify: `src/lib/styles/recipes.ts`

**Step 1: Card data module**

```ts
export type FilmCard = {
  id: '14-peaks' | 'k2-winter' | 'k2-summit';
  title: string;
  body: string;
  src: string;
  type: 'video' | 'image';
  metadata: string;
};

export const bigFilmCards: FilmCard[] = [ ... ];
```

Populate text exactly from Framework 3 copy (Netflix body, K2 body, K2 summit metadata).

**Design Cross-Reference — Framework 3.md**
> ## 3.3 FILM Layout – Mobile / Desktop  
> - Card viewport pinned with 14 Peaks / K2 Winter / K2 Summit content.
> - Scroll progress indicator + lens bug placement described.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Cards 1–3 details + body copy requirements.

**Step 2: Panda recipes**

Add `filmViewport`, `filmHud`, and `irisOverlay` recipes describing the pinned video frame, HUD badge, and concentric ring overlays. Ensure tokens align with Framework 1 & 2.

**Design Cross-Reference — Framework 3.md**
> ## 3.5 In-section motion: cards as shots on a timeline — describes circular masks (iris) + HUD behaviour requiring these recipes.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Small lens bug in corner + circular iris transitions.

**Step 3: Commit scaffolding**

`git add src/lib/data/big-film-cards.ts src/lib/styles/recipes.ts`  
`git commit -m "chore: scaffold data/recipes for big film story"`

**Design Cross-Reference — Framework 3.md**
> Layout + motion intent sections specify data/recipe outputs validated by this commit.

**Checklist Reference**
> `checklist.md` §3 BIG FILM STORY bullet list ensures scaffolding lines up with requirements.

---

### Task 2: Entry portal (Logos → Film) refinements per Framework 3

**Files:**
- Modify: `src/lib/sections/LogosSection.svelte`
- Modify: `src/lib/sections/FilmSection.svelte`
- Modify: `src/lib/sections/FilmEntryPortal.ts`

**Steps**

1. Update portal timeline to include (still driven by the shared `portalContext` + orchestrator timeline registration):
   - Egg Toast lens ring with tick marks (`<svg>` overlay) that fades in as circle expands.
   - Quick note overlay “NETFLIX / 14 PEAKS”.
   
   **Design Cross-Reference — Framework 3.md**
   > ## 3.2 Entry Transition – Logos → FILM describes circle iris over Netflix logo with HUD ring + labels.
   
   **Checklist Reference**
   > **Logos → Big Film (FILM)** bullet clarifies iris + text morph requirements.
2. After circle fills viewport, animate edges to `clipPath: inset(...)` to become 2.39:1 rectangle with Egg Toast frame line (`border-image` or pseudo-element).
   
   **Design Cross-Reference — Framework 3.md**
   > Entry transition Step 2–3 describing circle expanding, edges squaring off into FILM layout.
   
   **Checklist Reference**
   > **Logos → Big Film (FILM)** – Land with full-screen FILM intro state.
3. Dispatch `film:entered` custom event for analytics + inter-section coordination (Svelte dispatcher). The orchestrator still owns the GSAP instance so rewinding works with ScrollSmoother.
   
   **Design Cross-Reference — Framework 3.md**
   > Entry transition Step 3 ensures landing triggers FILM layout begin; event enforces same.
   
   **Checklist Reference**
   > `checklist.md` §3 expectation for pinned FILM viewport once portal completes.
4. Verify using Chrome devtools `prefers-reduced-motion` to skip portal for accessibility.
   
   **Design Cross-Reference — Framework 3.md**
   > Entry description emphasises lens zoom as key moment; we still provide accessible variant.
   
   **Checklist Reference**
   > `checklist.md` general motion guidance (Level 3) to respect user comfort.

**Testing**

`npm run check`  
Manual: record MP4 (10 s) showing portal; attach to QA doc later.

**Design Cross-Reference — Framework 3.md**
> Entry transition storyboard defines what the recording should show.

**Checklist Reference**
> **Logos → Big Film (FILM)** bullet verifying iris over Netflix.

**Commit**

`git commit -am "feat: enhance logos→film portal with lens ring + frame morph"`

**Design Cross-Reference — Framework 3.md**
> Entry transition result.

**Checklist Reference**
> `checklist.md` §2–3 transition requirements.

---

### Task 3: Build `BigFilmStory.svelte`

**Files:**
- Create: `src/lib/sections/BigFilmStory.svelte`
- Create: `src/lib/sections/BigFilmStory.motion.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Component layout**

Implement DOM per Framework 3 ASCII:

```svelte
<section class="big-film" bind:this={root}>
  <SectionLabel prefix="Film" title="High Altitude Features" />
  <div class="big-film__viewport" bind:this={viewport}>
    {#each bigFilmCards as card (card.id)}
      <MediaFrame card={card} bind:this={cardRefs[card.id]} />
    {/each}
    <LensBadge ... />
  </div>
  <article class="big-film__slab" bind:this={slabRef}>...</article>
  <StepIndicator ... />
</section>
```

Use Panda responsive utilities to switch from stacked layout (mobile) to split columns (desktop) exactly as described in Framework 3. Media frames share aspect ratio + letterbox borders.

Render this section only when `$framework2Enabled` (or a dedicated Framework 3 flag) is true inside `+page.svelte` so Framework 1 releases stay untouched.

**Design Cross-Reference — Framework 3.md**
> Sections 3.3 (mobile) & 3.4 (desktop) sketch identical DOM structure (pinned viewport, slab, step indicator, lens bug).

**Checklist Reference**
> `checklist.md` §3 Layout bullet list.

**Step 2: Motion implementation**

`BigFilmStory.motion.ts` exports `initBigFilmStory({ root, cards, slab, indicator, lens, orchestrator })` that:

- Pins section (`ScrollTrigger.create({ pin: true, scrub: true, end: '+=300%' })`) and registers all GSAP timelines through `scrollOrchestrator.registerSectionTimeline(...)`.
- For each card boundary:
  - Shrinks `clipPath: circle()` to 0.8, crossfades to next card, re-expands to rectangle (duration 0.25s, `brand-enter`).
  - Animates slab text via `gsap.timeline` (current slides up/out, next slides from bottom with 80 ms text line staggering).
  - Updates step indicator by toggling Panda `data-active` attr (GSAP `to` on CSS variables).
- Maintains persistent lens bug (small scale blip on each transition).
- Lens HUD uses `heroLensController` / `lensTimeline` so detaching from Logos and attaching to Film stays in sync with Hero state.

**Design Cross-Reference — Framework 3.md**
> ## 3.5 In-section motion: cards as shots on a timeline — details the circular iris transitions, slab motion, indicator updates, and lens bug behaviour.

**Checklist Reference**
> `checklist.md` §3 Motion bullet (ScrollTrigger segments, iris transitions, step indicator).

**Step 3: Hook up data**

`<MediaFrame>` handles `card.type === 'video' ? <video> : <img>` plus `playsinline`, `muted`, etc. On `film:entered`, restart Card 1 video from cue point, pause others until they’re active.

**Design Cross-Reference — Framework 3.md**
> Card descriptions (Netflix / K2 Winter / K2 Summit) enumerated under Layout + Step sections.

**Checklist Reference**
> `checklist.md` §3 Layout bullet for Card 1–3.

**Step 4: Accessibility checks**

Add `aria-live="polite"` to slab to announce card change text; ensure buttons have focus outlines using Panda tokens.

**Design Cross-Reference — Framework 3.md**
> Section 3.5 emphasises staggered text reveals and human readability, implying accessibility requirements for narration.

**Checklist Reference**
> `checklist.md` §3 Motion bullet referencing text stagger (y:10→0) to align with accessible updates.

**Step 5: Tests + commit**

`npm run check`  
`git commit -am "feat: implement Big Film Story section with iris transitions"`

**Design Cross-Reference — Framework 3.md**
> Motion + layout sections summarise deliverables validated by this commit.

**Checklist Reference**
> `checklist.md` §3 ensures pinned cards + iris transitions.

---

### Task 4: Exit animation into Film Stories

**Files:**
- Create: `src/lib/sections/BigFilmExit.motion.ts`
- Modify: `src/lib/sections/FilmStoriesSection.svelte`
- Modify: `src/lib/sections/BigFilmStory.motion.ts`

**Step 1: Exit timeline**

On final ScrollTrigger progress ≥ 0.98:

- `gsap.timeline` steps (registered as `big-film:exit` via orchestrator):
  1. `gsap.to(activeCard, { scale: 0.92, duration: 0.3 })`
  2. Add concentric ring overlays (SVG) with `autoAlpha` fade-ins.
  3. Use `gsap.utils.wrap` to position cards as horizontal strip (xPercent of -120, 0, 120).
  4. Trigger `FilmStoriesSection` entry via event or `ScrollTrigger` `onLeave`.

**Design Cross-Reference — Framework 3.md**
> ## 3.6 Exit Transition – FILM → FILM STORIES outlines the zoom-out, concentric rings, horizontal strip, and zoom-in on Sasha.

**Checklist Reference**
> **Big Film → Film Stories** bullets describing scale down, strip formation, focus ring, and final circle expansion.

**Step 2: Film Stories integration**

Add `receivePortalIntro(payload)` to FilmStories, which accepts `initialCardId` (“sasha”) and animates circle highlight + zoom-in.

**Design Cross-Reference — Framework 3.md**
> Exit Transition step 3 describing zoom into Sasha to begin Section 4.

**Checklist Reference**
> **Big Film → Film Stories** bullet: focus ring moves along strip to Sasha frame, circle expands to Film Stories initial state.

**Step 3: Logging + QA**

Console-log timeline states for debugging; capture performance metrics (Chrome FPS meter). Document results in QA doc.

**Design Cross-Reference — Framework 3.md**
> Exit storyboard emphasises concentric-ring + reel shift beats the QA doc must evidence.

**Checklist Reference**
> `checklist.md` §3/4 transition bullets for reference.

**Step 4: Commit**

`git commit -am "feat: add big film exit portal into film stories"`

**Design Cross-Reference — Framework 3.md**
> Exit Transition ensures implementation matches described behaviour.

**Checklist Reference**
> **Big Film → Film Stories** completion bullet.

---

### Task 5: Checklist conformance

**Files:**
- Reference `checklist.md` (Big Film + Film Stories bullet points).
- Output: `docs/qa/2025-12-02-big-film-story.md`

**Steps**

1. Create QA doc containing:
   - Table mapping each Framework 3 requirement to DOM nodes/timeline names.
   - Embedded GIFs for entry portal, card swap, exit portal.
   - ScrollTrigger config dump.
   
   **Design Cross-Reference — Framework 3.md**
   > Entire Phase 3 spec enumerates these requirements; copy them verbatim into QA doc.
   
   **Checklist Reference**
   > `checklist.md` §3 + §4 sections supply canonical requirement list.
2. Have design/PM sign off; log approvals.
   
   **Design Cross-Reference — Framework 3.md**
   > Motion notation summary (frames 1–5) defines review expectations.
   
   **Checklist Reference**
   > `checklist.md` sections for HERO/LOGOS/FILM ensure team signs off on each bullet.
3. Update issue tracker with QA doc link + commit SHAs.
   
   **Design Cross-Reference — Framework 3.md**
   > Recap section emphasises overall lens journey to mention in tracker.
   
   **Checklist Reference**
   > `checklist.md` used as acceptance criteria in tracker.
4. Remove temporary QA assets if policy requires.
   
   **Design Cross-Reference — Framework 3.md**
   > Documentation ensures future readers rely on canonical spec instead of temp assets.
   
   **Checklist Reference**
   > `checklist.md` remains the permanent reference after cleanup.

Done when all checklist bullets marked ✅ and approvals logged.
