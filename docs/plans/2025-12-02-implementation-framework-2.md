# Implementation Framework 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the FILM / Big Film Story section exactly as described in Framework 2, including the Netflix portal entry, pinned 3-step scrollytelling cards, and the portal zoom exit into the next film stories.

**Architecture:** Compose a dedicated `FilmSection` Svelte component that pins its viewport, swaps Panda-styled card slabs via ScrollTrigger progress, and sequences the iris transitions using GSAP timelines. Shared UI (section label, lens bug, step indicator) reuses Panda recipes to keep typography and spacing consistent with Framework 1.

**Tech Stack:** SvelteKit, Panda CSS, GSAP + ScrollTrigger, TypeScript, Vite video streaming pipeline.

---

### Task 1: Extend Panda recipes for FILM slabs + progress indicators

**Files:**
- Modify: `src/lib/styles/recipes.ts`
- Create: `src/lib/components/SectionLabel.svelte`
- Create: `src/lib/components/StepIndicator.svelte`

**Step 1: Recipe additions**

Add `filmCard` (2.39:1 media wrapper + slab body) and `stepIndicator` recipes with props for active state.

```ts
export const filmCard = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    color: 'silverplate'
  },
  variants: {
    size: {
      mobile: { px: '4', py: '6' },
      desktop: { px: '8', py: '10' }
    }
  }
});
```

**Design Cross-Reference — Framework 2.md**
> ## 3. BIG FILM STORY – Layout
> - This section is a **3-step scrollytelling sequence**
> - Pattern: **Pinned video frame** + **scrolling yellow slab** with copy.
> - The persistent **◯ lens** lives as a **small HUD bug** in a corner.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Section label: `FILM — HIGH ALTITUDE FEATURES`.
> -  **Card viewport** pinned on scroll & card step indicator.

**Step 2: Build `SectionLabel`**

Output Trade Gothic uppercase label with Egg Toast prefix + Silverplate title; include `slot` for optional icons per spec.

**Design Cross-Reference — Framework 2.md**
> ### 3.1 Mobile layout (portrait)
> `| SECTION LABEL BAND                            |`
> `|  FILM                                         |`
> `|  (Egg Toast text, thin frame line)            |`

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Section label: `FILM — HIGH ALTITUDE FEATURES`.

**Step 3: Build `StepIndicator`**

Props: `steps: string[]`, `activeIndex`. Render inline dots/label states needed for “Card 1 / 2 / 3” representation with Panda tokens.

**Design Cross-Reference — Framework 2.md**
> ### 3.1 Mobile layout (portrait)
> `| [SCROLL PROGRESS INDICATOR ]              |`
> `|   • Card 1   ○ Card 2   ○ Card 3            |`

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Card step indicator (`1 / 2 / 3` or dots).

**Step 4: Run check + commit**

```bash
npm run check
git commit -am "feat: add film card & step indicator recipes"
```

**Design Cross-Reference — Framework 2.md**
> ## 3. BIG FILM STORY – Layout diagrams (mobile/tablet/desktop) verifying spacing + hierarchy.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Section label, pinned viewport, card indicator, lens bug — all verified in QA.

---

### Task 2: Implement Netflix portal zoom transition (Logos → Film)

**Files:**
- Create: `src/lib/sections/FilmEntryPortal.ts`
- Modify: `src/lib/sections/LogosSection.svelte`
- Modify: `src/lib/sections/FilmSection.svelte`

**Step 1: Portal helper**

`FilmEntryPortal.ts` should expose `createPortalTimeline({ logoEl, portalMaskEl, onComplete })` that:

- Wraps the Netflix `<span>` with `<span class="logo__portal-target">`.
- Creates a circular `<div>` mask positioned via `getBoundingClientRect`.
- GSAP timeline: logos scale 1 → 0.9, circle scale 1 → 8, crossfade content to first FILM frame, morph circle → rectangle.

**Design Cross-Reference — Framework 2.md**
> ### 4.1 Entry (Logos → FILM)
> 1. Netflix logo wrapped in **circular mask**.
> 2. Logo strip zooms out while circle expands `scale 1.0 → ~6–8`.
> 3. Circle becomes FILM video frame, edges snap to 2.39:1, heading slides in.

**Checklist Reference**
> **Logos → Big Film (FILM)**
> -  Circle grows to cover viewport, crossfade to Netflix footage, fade rest of logos before entering FILM.

**Step 2: Wire to Logos section**

On `ScrollTrigger` enter (`end: 'bottom top'`), call `createPortalTimeline` and dispatch a custom event `portal:film-ready` to inform the FILM section when to start playing the 14 Peaks video.

**Design Cross-Reference — Framework 2.md**
> ### 4.1 Entry (Logos → FILM) details the trigger happening “at end of logos band” with the Netflix mask expanding into the FILM frame.

**Checklist Reference**
> **Logos → Big Film (FILM)** bullet instructing circle to expand over Netflix as hero transitions into FILM.

**Step 3: Receive in Film section**

`FilmSection.svelte` listens for the event (e.g., via `eventBus` store or Svelte `createEventDispatcher`) to reset video playback and step indicator.

**Design Cross-Reference — Framework 2.md**
> ### 4.1 Entry ... Step 3 states “The expanded circle becomes the video frame mask for the FILM hero...”

**Checklist Reference**
> **Logos → Big Film (FILM)** bullet requiring landing with full-screen FILM intro state after portal completes.

**Step 4: QA**

Record Lottie or GIF of portal for design approval.

**Design Cross-Reference — Framework 2.md**
> ### 4.1 Entry storyboard outlines expected timing + visuals for approvals.

**Checklist Reference**
> **Logos → Big Film (FILM)** – verifying iris animation matches spec.

**Step 5: Commit**

`git commit -am "feat: portal zoom transition from logos to film"`

**Design Cross-Reference — Framework 2.md**
> Entry storyboard ensures commit delivers Netflix portal.

**Checklist Reference**
> **Logos → Big Film (FILM)** completion requirement.

---

### Task 3: Build Film section layout + pinned scroll behaviour

**Files:**
- Create: `src/lib/sections/FilmSection.svelte`
- Create: `src/lib/sections/FilmSection.motion.ts`
- Asset refs: `static/videos/film-14-peaks.mp4`, etc.

**Step 1: Layout markup**

Conform exactly to Framework 2 mobile/tablet/desktop diagrams:

```svelte
<section class="film" bind:this={root}>
  <SectionLabel prefix="Film" title="High Altitude Features" />
  <div class="film__viewport" bind:this={viewportRef}>
    <video bind:this={videoRefs[0]} data-card="0" ... />
    <video bind:this={videoRefs[1]} data-card="1" ... />
    <img bind:this={imageRefs[2]} data-card="2" ... />
  </div>
  <article class="film__slab" bind:this={slabRef}>...</article>
  <StepIndicator />
  <LensBadge size={32} class="film__hud" />
</section>
```

Switch layout via CSS grid at `min-width: 960px` to create side-by-side arrangement.

**Additional Requirement: Lens HUD continuity**

Feed the `<LensBadge>` component in this section from the same store-driven GSAP timeline used in Hero/Logos so it gently scales/rotates through each card transition instead of re-rendering per step.

**Design Cross-Reference — Framework 2.md**
> “The persistent ◯ lens now lives as a small HUD bug in a corner – present but not competing.”

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2 — “Small lens bug in corner.”

**Design Cross-Reference — Framework 2.md**
> Sections 3.1–3.3 describe mobile/tablet/desktop layouts with pinned video left and slab right.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2 — Layout bullet list.

**Step 2: ScrollTrigger timeline**

`FilmSection.motion.ts`:

- Pin `root`.
- Map scroll progress to `cardIndex` ranges (0–0.3, 0.3–0.65, 0.65–1).
- For each transition, run iris animation (`clipPath: circle()` or Three mask) + text slab swap per Framework 2 timings.

**Design Cross-Reference — Framework 2.md**
> ### 4.2 Focus (within FILM section – the 3 steps) outlines scroll segments, video crossfades, slab slides, and lens bug behaviour.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2 — Motion bullets describing circular iris transitions, staggered text, and step indicator updates.

**Step 3: Data model**

Store card metadata (title, body, src, type) in `src/lib/data/film-cards.ts`; iterate to render video/still nodes and text.

**Design Cross-Reference — Framework 2.md**
> Card content per step (slab area) lists titles & copy for 14 Peaks, K2 Winter, K2 Summit.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Card 1/2/3 details.

**Step 4: Idle states**

Add `prefers-reduced-motion` guards to pause ScrollTrigger effects when user opts out.

**Design Cross-Reference — Framework 2.md**
> Under 4.2 Step 3 – lens ◯ section: “motion remains Level 1 here (minimal)” — demonstrates expectation for subtle idle behaviour and respect for user comfort.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2
> -  Lens bug (subdued) top-right – implies low-level idle animation only.

**Step 5: Tests & commit**

`npm run check`  
`git commit -am "feat: add Big Film Story section with pinned scrollytelling"`

**Design Cross-Reference — Framework 2.md**
> Focus + layout sections specify deliverables validated by this commit.

**Checklist Reference**
> ## 3. BIG FILM STORY – Netflix 14 Peaks + K2 — ensures card + motion requirements satisfied.

---

### Task 4: Implement exit portal into Film Stories

**Files:**
- Modify: `src/lib/sections/FilmSection.motion.ts`
- Modify: `src/lib/sections/FilmStoriesSection.svelte`
- Create: `src/lib/sections/FilmExitPortal.ts`

**Step 1: Exit timeline**

When ScrollTrigger reaches 100%:

- Scale active card to 0.9, apply concentric circle SVG overlays.
- Arrange cards into a horizontal strip (`gsap.to(cards, { xPercent: [-20,0,20] ... })`).
- Identify next story (Sasha) and animate zoom-in with circle focus as Framework 2 describes.

**Design Cross-Reference — Framework 2.md**
> ### 4.3 Exit (FILM → next FILM stories section) – describes scaling down, forming a strip, revealing next stories, and zooming into Sasha.

**Checklist Reference**
> **Big Film → Film Stories** bullet list covering viewport scale down, strip duplication, hinting next frames, and circle focus leading to Film Stories.

**Optional Enhancement: Brief reel grid**

Before collapsing into the horizontal strip, optionally fan the cards into a 2×N grid with ghosted Sasha/Grace/Afghanistan thumbnails for a few frames to honour the “glimpse other frames” direction.

**Design Cross-Reference — Framework 2.md**
> “You glimpse other frames starting to appear on the strip…”

**Checklist Reference**
> **Big Film → Film Stories** — “Show hint of next 3 frames” bullet.

**Step 2: Prepare Film Stories section**

Ensure `FilmStoriesSection` exposes a `receivePortalIntro()` method to accept the zoom target and kick off its own timeline.

**Design Cross-Reference — Framework 2.md**
> Exit description step 3: “From that grid, we zoom back in on Sasha / No Days Off card... becomes the first card of Section 4.”

**Checklist Reference**
> **Big Film → Film Stories** – Focus ring moves along strip to Sasha frame -> circle expands to full viewport for Film Stories initial state.

**Additional Requirement: Circular portal on entry**

Within `receivePortalIntro`, animate a circular mask that tracks along the reel strip, locks over the Sasha frame, then expands to full-screen before revealing the Film Stories layout; this keeps the lens motif continuous.

**Design Cross-Reference — Framework 2.md**
> “Focus ring moves along strip to Sasha frame… On landing over Sasha: circle expands to full viewport…”

**Checklist Reference**
> **Big Film → Film Stories** bullet referencing focus ring + circle expansion.

**Step 3: Document integration**

Add README snippet describing event flow: Logos portal → Film entry; Film exit → Film Stories entry.

**Design Cross-Reference — Framework 2.md**
> Sections 4.1 & 4.3 describe both entry and exit flows you’re documenting.

**Checklist Reference**
> `checklist.md` — Logos → Big Film (FILM) and Big Film → Film Stories sequences.

**Step 4: Run checks + commit**

`npm run check`  
`git commit -am "feat: add film exit portal into field stories"`

**Design Cross-Reference — Framework 2.md**
> Exit storyboard ensures tests validate the concentric-ring zoom out + Sasha zoom in.

**Checklist Reference**
> **Big Film → Film Stories** completion bullet.

---

### Task 5: Checklist + QA

**Files:**
- Reference: `checklist.md` (Sections 3 & 4 lines)
- Capture: `docs/qa/2025-12-02-film-section.md`

**Steps**

1. Enumerate each Framework 2 requirement (pinned card, iris transition, step indicator, lens bug, exit portal) and tie them to DOM nodes + timeline names.
   
   **Design Cross-Reference — Framework 2.md**
   > Layout + motion sections (3.1–3.3, 4.1–4.3) enumerate these requirements verbatim.
   
   **Checklist Reference**
   > `checklist.md` §3 BIG FILM STORY + §4 FILM STORIES bullets.
2. Paste console output of `ScrollTrigger.getAll()` showing start/end positions for all timelines.
   
   **Design Cross-Reference — Framework 2.md**
   > Motion storyboard describes ScrollTrigger start/end expectations for entry, focus, and exit.
   
   **Checklist Reference**
   > `checklist.md` §3 Motion bullet: “Pin section with ScrollTrigger; map scroll 0–1…”
3. Export 3 viewport screenshots (mobile/tablet/desktop) proving layout parity with ASCII references.
   
   **Design Cross-Reference — Framework 2.md**
   > ASCII diagrams in 3.1–3.3 define what each screenshot must match.
   
   **Checklist Reference**
   > `checklist.md` §3 Layout bullet ensuring pinned viewport + slab representation.
4. Review with creative, gather sign-off, attach to QA doc.
   
   **Design Cross-Reference — Framework 2.md**
   > Motion notation summary lists frames creative expects to see.
   
   **Checklist Reference**
   > `checklist.md` hero/logos + film sections used as sign-off criteria.
5. Close tracking ticket referencing QA doc + commits.
   
   **Design Cross-Reference — Framework 2.md**
   > Entire section describes final deliverable for tracking.
   
   **Checklist Reference**
   > `checklist.md` Section 3 + 4 mark completion.
