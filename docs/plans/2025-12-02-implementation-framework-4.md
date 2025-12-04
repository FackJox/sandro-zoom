# Implementation Framework 4 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the ABOUT ME scrollytelling chapter defined in Framework 4, including the lens-centered transition from Photo Stats, three beat layouts that stay cohesive across breakpoints, scroll-pinned focus pulls between beats, and the grid-flip handoff into Services.

**Architecture:** Keep everything inside the existing motion shell. `PhotoStatsSection`, `AboutSection`, and `ServicesSection` register their GSAP timelines through `scrollOrchestrator` so ScrollSmoother + reduced-motion fallbacks continue working. Lens + metadata interactions use the shared controllers, and portal / grid overlays reuse the shared stores (e.g., `portalStore`) rather than bespoke DOM. Feature gating stays aligned with the Framework 2 flag until a Framework 4 flag is introduced.

**Tech Stack:** SvelteKit, Panda CSS, GSAP + ScrollTrigger, TypeScript, video/image assets hosted in `static/pictures` & `static/videos`.

**GSAP / Interaction Guidelines**
- Route every animation through GSAP (core, ScrollTrigger, ScrollSmoother, Flip, MotionPath, DrawSVG/MorphSVG, Draggable) and register timelines with the orchestrator for consistent lifecycle management.
- Focus on high-impact storytelling beats (Photo→About portal, beat focus pulls, grid flip) using GSAP timelines and staggered reveals; CSS transitions are reserved for very simple hover states.
- Achieve depth via GSAP push-ins and Egg Toast frame-line reveals; rely on contrast + motion instead of persistent drop shadows.
- Maintain the grid-flip aesthetic described in Framework 4 by snapping movements, using custom easing, and employing MotionPath/SVG helpers whenever the spec calls for precise pulls, curves, or tile morphs.
---

### Task 1: Prepare data + recipes

**Files:**
- Create: `src/lib/data/about-beats.ts`
- Modify: `src/lib/styles/recipes.ts`

**Step 1: Data module**

```ts
export type AboutBeat = {
  id: 'frontline' | 'origin' | 'values';
  label: string;
  title: string;
  body: string;
  background: string;
  overlay?: 'dark' | 'warm';
};

export const aboutBeats: AboutBeat[] = [ ... ]; // copy from Framework 4
```

**Design Cross-Reference — Framework 4.md**
> ## 1. Narrative & Motion Intent – ABOUT ME  
> - Beats: Front-line perspective / Origin story / Values & ongoing work.

**Checklist Reference**
> ## 6. ABOUT ME – 3 Beats  
> - 3 beats, each full-screen with BG image/video + text block.

**Step 2: Panda recipes**

Define `beatLayout` (full-viewport absolute panel), `beatCopy`, `beatIndicator`. Add CSS variables for overlays (linear gradients) reusing tokens `black-stallion`, `cover-of-night`.

**Design Cross-Reference — Framework 4.md**
> ## 3. Layout – ABOUT ME (Mobile First) & ## 4. Layout – ABOUT ME (Desktop) detail full-viewport panels, overlays, and indicators.

**Checklist Reference**
> ## 6. ABOUT ME – 3 Beats — Layout bullet describing BG + text block per beat.

**Step 3: Commit**

`git add src/lib/data/about-beats.ts src/lib/styles/recipes.ts`  
`git commit -m "chore: scaffold about section data + recipes"`

**Design Cross-Reference — Framework 4.md**
> Narrative + layout sections summarise deliverables covered by this commit.

**Checklist Reference**
> ## 6. ABOUT ME – 3 Beats bullet list.

---

### Task 2: Build centered lens transition from Photo Stats

**Files:**
- Modify: `src/lib/sections/PhotoStatsSection.svelte`
- Create: `src/lib/sections/PhotoToAboutPortal.ts`
- Modify: `src/lib/sections/AboutSection.svelte`

**Step 1: Portal helper**

`PhotoToAboutPortal.ts` should export `initPhotoAboutPortal({ portalContext, statsCardRef, onComplete })` that leverages `createPortalContext('photo')`:

- Positions an Egg Toast circular mask in the center of `statsCardRef`.
- Animates stats copy fade-out, About copy fade-in inside the circle.
- Expands circle to full viewport while crossfading background from basecamp video to Beat 1 imagery.

**Design Cross-Reference — Framework 4.md**
> ## 2. Entry Transition – PHOTO → ABOUT ME details card freeze, circular focus ring, text crossfade, and lens zoom into Beat 1.

**Checklist Reference**
> **Photo → About** bullet list describing focus ring, copy crossfade, BG swap, and circle expand.

**Step 2: Integrate**

In `PhotoStatsSection`, call portal helper when ScrollTrigger progress > 0.8 (end of unsuccessful climbs). After completion, dispatch event so `AboutSection` pins.

**Design Cross-Reference — Framework 4.md**
> Entry transition Step 1–4 explain this occurs at end of stats (UNSUCCESSFUL CLIMBS) before About pins.

**Checklist Reference**
> **Photo → About** bullet requiring focus ring + text crossfade as stats end.

**Styling Note: Equal hierarchy**

Keep the “Successful” and “Unsuccessful” climb cards visually identical (colors, typography, dwell time) so the narrative doesn’t over-emphasise failed summits; only the centered lens portal differentiates the transition.

**Design Cross-Reference — checklist.md**
> ## 5. PHOTO + CLIMBING CRED – Stats — panels listed without stylistic deviation until the portal triggers.

**Checklist Reference**
> Same section bullet: “Text inside circle crossfades from stats → first ABOUT line… Circle expands to full screen.”

**Step 3: Accessibility**

Add `prefers-reduced-motion` guard: swap to simple fade if user opts out.

**Design Cross-Reference — Framework 4.md**
> Entry transition emphasises cinematic lens zoom; accessibility guard ensures comfortable alternative.

**Checklist Reference**
> `checklist.md` Photo → About bullets referencing circle expand/focus ring (ensuring either animation or fade).

**Step 4: Commit**

`git commit -am "feat: add centered lens portal from photo stats to about"`

**Design Cross-Reference — Framework 4.md**
> Entry transition concluding step ensures commit captures entire effect.

**Checklist Reference**
> **Photo → About** bullet marks completion.

---

### Task 3: Implement About section layout (mobile + desktop)

**Files:**
- Create: `src/lib/sections/AboutSection.svelte`
- Create: `src/lib/sections/AboutSection.motion.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Markup**

```svelte
<section class="about" bind:this={root}>
  <SectionLabel prefix="About me" title="Story" />
  {#each aboutBeats as beat (beat.id)}
    <article class="about__beat" data-beat={beat.id} style={`--beat-bg: url(${beat.background})`}>
      <div class="about__overlay" data-variant={beat.overlay}></div>
      <div class="about__copy">
        <h2>{beat.title}</h2>
        <p>{@html beat.body}</p>
      </div>
    </article>
  {/each}
  <BeatIndicator bind:this={indicatorRef} />
</section>
```

Use Panda responsive utilities to stack copy over background on mobile and split into two columns on desktop (left = BG, right = copy).

Keep the section behind the existing Framework 2 feature flag (or a future Framework 4 one) in `+page.svelte` until sign-off.

**Design Cross-Reference — Framework 4.md**
> ## 3. Layout – ABOUT ME (Mobile) & ## 4. Layout – ABOUT ME (Desktop) provide the exact markup structure.

**Checklist Reference**
> ## 6. ABOUT ME – 3 Beats — Layout bullet list.

**Step 2: Motion logic**

`AboutSection.motion.ts` handles (each GSAP timeline registered through `scrollOrchestrator.registerSectionTimeline('about:*', ...)`):

- Pinning section for ~300% scroll.
- For each beat boundary (0/0.33/0.66/1):
  - Add circular focus ring (SVG) in center.
  - Crossfade backgrounds and text inside ring before expanding to full view.
  - Slide text lines with `brand-enter` easing.
  - Update indicator states.
- Within Beat 3, add micro animation for the two-line quote: line 1 fades in first, line 2 slides up after `+0.15` seconds.

**Design Cross-Reference — Framework 4.md**
> ## 5. In-section motion between the 3 beats outlines pinned scroll ranges, focus rings, crossfades, and the Beat 3 two-line moment.

**Checklist Reference**
> ## 6. ABOUT ME – 3 Beats — Motion bullet list (pin section, center circle, micro-moment).

**Step 3: Hook to Photos portal**

When portal completes, call `startAboutScroll()` to enable ScrollTrigger (avoid double-run).

**Design Cross-Reference — Framework 4.md**
> Entry transition description states the About layout appears immediately after the circle expands, so hooking ensures seamless timing.

**Checklist Reference**
> **Photo → About** bullet ensures About begins after circle expansion.

**Step 4: Tests + commit**

`npm run check`  
`git commit -am "feat: implement about section beats with lens transitions"`

**Design Cross-Reference — Framework 4.md**
> Layout + motion sections summarise expected behaviour.

**Checklist Reference**
> ## 6. ABOUT ME – 3 Beats completion.

---

### Task 4: Grid flip transition into Services

**Files:**
- Create: `src/lib/sections/AboutToServicesGrid.ts`
- Modify: `src/lib/sections/AboutSection.motion.ts`
- Modify: `src/lib/sections/ServicesSection.svelte`

**Step 1: Grid overlay component**

`AboutToServicesGrid.ts` renders a 4×4 CSS grid overlay:

```svelte
<div class="grid-flip" bind:this={gridRef}>
  {#each Array(16) as _, i}
    <div class="grid-tile" style={`--tile-index:${i}`}></div>
  {/each}
</div>
```

Tiles inherit screenshot of underlying DOM via `background` cloning (use Canvas drawImage) or CSS `backdrop-filter`.

**Design Cross-Reference — Framework 4.md**
> ## 7. ABOUT → SERVICES – Grid Flip “BAM” instructs slicing About frame into a grid and flipping tiles center-out.

**Checklist Reference**
> ## 7. ABOUT → SERVICES – Grid Flip “BAM” bullet list.

**Step 2: Timeline**

- Pause scroll (~80 ms), then run center-out `rotateY` flips with `gsap.utils.distribute`.
- On flip complete, fade grid lines out revealing the Services intro video playing behind.
- Dispatch `services:intro` event to start Services timeline.

**Design Cross-Reference — Framework 4.md**
> Grid flip section notes center-out Y-axis flips, tiles revealing Services intro video, and event hand-off.

**Checklist Reference**
> ## 7. ABOUT → SERVICES – Grid Flip “BAM” bullet list describing flip + reveal.

**Additional Requirement: Ghosted service labels**

Before the grid tiles flip fully, fade in low-opacity “MOUNTAIN DOP / EXPED & PRODUCT…” labels behind the About copy so the user glimpses the upcoming services content during the grid-flip buildup.

**Design Cross-Reference — Framework 4.md**
> “As user nears end of Beat 3… Overlay Egg Toast grid lines… convert entire viewport into grid of tiles.”  
> Motion doc note: “Stories… line lingers while service labels fade in as ghosted content.”

**Checklist Reference**
> ## 7. ABOUT → SERVICES – Grid Flip “BAM” — implied preflip cue of upcoming services.

**Step 3: Integration**

`AboutSection` triggers grid timeline when ScrollTrigger progress ≥ 0.98 (end of Beat 3). Services listens for event to autoplay video; both timelines are registered with the orchestrator so rewinds/flags behave predictably.

**Design Cross-Reference — Framework 4.md**
> Section 5 “About → Services” indicates trigger occurs as user nears end of Beat 3 with grid overlay pause.

**Checklist Reference**
> ## 7. ABOUT → SERVICES – Grid Flip “BAM” – “As user nears end of Beat 3” bullet.

**Additional Requirement: Services vignette cue**

Include in the dispatched payload a flag instructing the Services section to fade its intro video via a circular vignette before the black credits roll.

**Design Cross-Reference — Framework 5.md**
> “On scroll past mid-point… Fade video to black (maybe radial/lens vignette).”

**Checklist Reference**
> ## 8. SERVICES – Intro Video → Credits on Black — video → black via lens-style vignette.

**Step 4: Commit**

`git commit -am "feat: add about→services grid flip transition"`

**Design Cross-Reference — Framework 4.md**
> Grid flip description summarises deliverable.

**Checklist Reference**
> ## 7. ABOUT → SERVICES – Grid Flip completion bullet.

---

### Task 5: Checklist verification

**Files:**
- Reference `checklist.md` (About + Services transition bullet points)
- Output: `docs/qa/2025-12-02-about-section.md`

**Steps**

1. Document each Framework 4 requirement (centered lens entry, equal layouts across viewports, 3 beats, focus pulls, grid flip) with screenshots & timeline names.
   
   **Design Cross-Reference — Framework 4.md**
   > Narrative, entry, layout, motion, and grid flip sections enumerate these requirements.
   
   **Checklist Reference**
   > `checklist.md` §§ Photo → About, 6 ABOUT ME, 7 ABOUT → SERVICES.
2. Include GIF of grid flip and the two-line micro animation.
   
   **Design Cross-Reference — Framework 4.md**
   > Grid flip + “Nice micro-moment” bullet under Section 5 highlight these animations.
   
   **Checklist Reference**
   > `checklist.md` §6 (micro-moment) & §7 (grid flip).
3. Confirm `prefers-reduced-motion` fallbacks in QA doc.
   
   **Design Cross-Reference — Framework 4.md**
   > Motion level is set to Level 2; spec implies calmer transitions for accessibility.
   
   **Checklist Reference**
   > `checklist.md` Photo → About bullet emphasising circle expand/fade ensures MR fallback.
4. Gather approvals, update issue tracker, link doc + commit SHAs.
   
   **Design Cross-Reference — Framework 4.md**
   > Entire spec summarises deliverables requiring approval.
   
   **Checklist Reference**
   > `checklist.md` sections used by stakeholders as acceptance criteria.

Done when QA doc shows ✅ for all bullet points.
