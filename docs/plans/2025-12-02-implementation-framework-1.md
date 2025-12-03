# Implementation Framework 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the HERO + LOGOS chapters exactly as defined in Framework 1, including the metadata→logos morph, persistent lens badge, and circular strip masks, all powered by the shared Panda CSS design tokens.

**Architecture:** Author Panda CSS tokens for the Alpine Noir palette + typography, expose them via utility classes, and compose dedicated Svelte sections (`HeroSection`, `LogosSection`) that mount GSAP timelines to drive the entry, idle, and morph animations. Each chapter must register its own `ScrollTrigger` with `pin: true`, `scrub: true`, and `start: 'top top' / end: '+=300%'` so the viewport locks while the lens zoom plays, matching the “one scene at a time” direction (`Framework 1.md — Phase 3 Hero`, `Framework 1.md — Phase 3 Logos`). Shared elements (lens badge, metadata strip) become reusable Panda recipes so measurements/color roles stay consistent, and their transforms feed a single shared `lensTimeline` store so the circle persists Hero → Logos → FILM instead of resetting.

**Tech Stack:** SvelteKit, Panda CSS, TypeScript, GSAP + ScrollTrigger, Vite asset pipeline.

---

### Task 2: Implement shared lens + metadata components using Panda recipes

**Files:**
- Create: `src/lib/components/LensBadge.svelte`
- Create: `src/lib/components/MetadataStrip.svelte`
- Modify: `src/lib/styles/recipes.ts`

**Step 1: Author Panda recipe**

```ts
// src/lib/styles/recipes.ts
export const lensBadge = cva({
  base: {
    borderRadius: 'full',
    borderWidth: '2px',
    borderColor: 'egg-toast',
    boxShadow: '0 0 0 1px token(colors.black-pearl)',
    fontFamily: 'body',
    fontSize: 'xs',
    textTransform: 'uppercase'
  }
});
```

**Design Cross-Reference — Framework 1.md**
> **Circular lens nod:**
> - The ◯ is a bold Egg Toast circle partially overlapping the slab edge – like a lens seal / altitude badge.
> - Inside: small text like `◯ 4,100m` or a record dot.

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens
> -  **Lens badge**: Egg Toast circle overlapping slab.
> -  Lens circle scales from `0.8 → 1.0` (brandEnter).

**Step 2: Build `LensBadge.svelte`**

Bind `size`, `label`, and expose a `ref` prop for GSAP to animate. Ensure markup supports the circular strip masks from Framework 1 (i.e., wrap with `<div class="lens-slice" data-depth="fg">` for parallax offsets).

**Design Cross-Reference — Framework 1.md**
> **Circular lens nod:**
> - The ◯ is a bold Egg Toast circle partially overlapping the slab edge – like a lens seal / altitude badge.
> - Inside: small text like `◯ 4,100m` or a record dot.

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens
> -  **Lens badge**: Egg Toast circle overlapping slab.
> -  Lens circle scales from `0.8 → 1.0` (brandEnter).

**Step 3: Build `MetadataStrip.svelte`**

Props: `text`, `variant` (hero vs logos). Use Panda tokens for border, letter-spacing, uppercase type. Emit a `bind:this` for GSAP timeline to morph to logos.

**Design Cross-Reference — Framework 1.md**
> `| LAYER 3: METADATA STRIP  ⚓                   |`
> `|  [ ALT ▲ 8,000M  •  K2 / EVEREST  •  DOP ]   |`
> `|  (Egg Toast rule above, Silverplate text)    |`

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens
> -  **Metadata strip** anchored to bottom:
>     - `ALT ▲ 8,000M • EVEREST / K2 • DIRECTOR OF PHOTOGRAPHY`.

**Step 4: Snapshot in Storybook/headless test**

If Storybook exists → add stories; otherwise, add `src/routes/dev/lens/+page.svelte` preview route referencing both components.

**Design Cross-Reference — Framework 1.md**
> ### 3.1 One cohesive layout, then scaled
> Think of the hero as **three layers** stacked vertically, same on all viewports:
> 1. **Media layer** – full-bleed video/still
> 2. **Yellow slab & circular lens badge** – foreground UI
> 3. **Metadata strip** – anchored to bottom, later morphs to logos band

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens
> -  Full-bleed container with **video BG** (showreel).
> -  Centered **Egg Toast slab** containing ...  
> -  **Lens badge** ...  
> -  **Metadata strip** anchored to bottom.

**Step 5: Lint + commit**

Run: `npm run check`  
Commit: `git commit -am "feat: add shared lens badge + metadata strip components"`

**Design Cross-Reference — Framework 1.md**
> ### Motion
> **On load**
> -  Video fades in from black + tiny push-in (`scale 1.02 → 1.0`).
> -  Slab masked up from bottom (Y transform + opacity).
> -  Lens circle scales from `0.8 → 1.0` (brandEnter).

**Checklist Reference**
> **Motion**
> -  Video fades in from black + tiny push-in (`scale 1.02 → 1.0`).
> -  Slab masked up from bottom (Y transform + opacity).
> -  Lens circle scales from `0.8 → 1.0` (brandEnter).

---

### Task 3: Implement HERO section per Framework 1 Phase 3

**Files:**
- Create: `src/lib/sections/HeroSection.svelte`
- Create: `src/lib/sections/HeroSection.motion.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Scaffold section markup**

Structure layers exactly as Framework 1’s ASCII diagrams:

```svelte
<section class="hero">
  <video class="hero__bg" src="/videos/showreel.mp4" muted autoplay loop />
  <div class="hero__slab">...</div>
  <MetadataStrip bind:this={metadataRef} text="ALT ▲ 8,000M • ..." />
</section>
```

Use Panda classes for slab padding per viewport breakpoints (mobile stack, tablet/desktop widened).

**Design Cross-Reference — Framework 1.md**
> ### 3.1 One cohesive layout, then scaled
> Think of the hero as **three layers** stacked vertically, same on all viewports:
> 1. **Media layer** – full-bleed video/still
> 2. **Yellow slab & circular lens badge** – foreground UI
> 3. **Metadata strip** – anchored to bottom, later morphs to logos band

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens
> -  Full-bleed container with **video BG**.
> -  Centered **Egg Toast slab** containing hero text.
> -  **Metadata strip** anchored to bottom.

**Step 2: Implement motion module**

`HeroSection.motion.ts` exports `initHeroTimelines` that:

- Fades video in with `scale: 1.02 → 1`.
- Animates slab mask + lens badge scale-in (delayed 60 ms).
- Sets up a pinned `ScrollTrigger` (`pin: true`, `start: 'top top'`, `end: '+=280%'`, `scrub: true`) so the hero stays fixed while the morph plays, keeping with Framework 1’s “one cohesive layout, then scaled” direction.
- Adjusts hero scale, metadata transform, and lens drift exactly as Framework 1 step list.

**Additional Step: Maintain persistent lens timeline**

Drive the hero lens badge, Logos lens chip, and Netflix portal from a shared GSAP timeline (e.g., store-driven tween) so the circle never hard-resets—only scales/translates as scroll progresses toward the FILM portal. This keeps the “leftover circular strip” alive through Sections 1–3.

**Design Cross-Reference — Framework 1.md**
> “Left over circular part of the video from the Circular strip masks remains on screen…”

**Checklist Reference**
> **Hero → Logos (first scroll)** + **Logos → Big Film (FILM)** — circle persists and morphs rather than disappearing.

**Additional Step: Lens hover + idle states**

Implement a low-amplitude hover interaction (desktop) that scales the lens badge ~1.02× with slight noise, and a continuous idle parallax drift (tied to scroll Y offset) while respecting `prefers-reduced-motion`.

**Design Cross-Reference — Framework 1.md**
> “Lens badge and slab: tiny parallax on scroll (Y offset a few px).”

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens — idle parallax + brand easing behaviour.

**Design Cross-Reference — Framework 1.md**
> ### 3.2 HERO motion (with lens + strip-masks)
> **Pillars used:** Easing, Transform/Zoom, Fade, Masking, Parallax, Dimension.
> **On load** ... (same bullet list)
> **Hero → Logos (first scroll)** ... (metadata morph steps)

**Checklist Reference**
> **Hero → Logos (first scroll)**
> -  Create a ScrollTrigger that scales hero, detaches lens circle, and morphs metadata strip into the logos band with scrubbed motion.

**Step 3: Wire into component**

Inside `<script>`, `onMount`, call `initHeroTimelines` with refs to root, slab, lens, metadata.

**Design Cross-Reference — Framework 1.md**
> ### 3.2 HERO motion (with lens + strip-masks)
> - Slab masked up from bottom, lens circle scale-in, metadata strip morph.

**Checklist Reference**
> **Hero → Logos (first scroll)** bullet list describing scaling hero & metadata transformation.

**Step 4: Responsive QA**

Use Chrome DevTools to capture screenshots at 375 px, 744 px, 1280 px verifying stack matches ASCII spec.

**Design Cross-Reference — Framework 1.md**
> Refer to the mobile/tablet/desktop ASCII diagrams under **Phase 3 – HERO** ensuring identical stacking across breakpoints.

**Checklist Reference**
> ## 1. HERO – Showreel + Slab + Lens
> -  Same core composition across **mobile → tablet → desktop**.

**Step 5: Tests + commit**

Run: `npm run check`  
Commit message: `"feat: implement hero section with metadata-to-logos morph"`

**Design Cross-Reference — Framework 1.md**
> **Hero → Logos (first scroll)** block describing portal zoom + metadata strip morph.

**Checklist Reference**
> **Hero → Logos (first scroll)** bullet list (scale hero, detach lens, morph metadata).

---

### Task 4: Implement Logos section with Netflix portal zoom

**Files:**
- Create: `src/lib/sections/LogosSection.svelte`
- Create: `src/lib/sections/LogosSection.motion.ts`
- Modify: `src/routes/+page.svelte`

**Step 1: Layout per Framework**

- Band with Panda borders (top/bottom)
- Logo rail with responsive gap + uppercase type.
- Lens badge reused in corner using `LensBadge`.

**Design Cross-Reference — Framework 1.md**
> ## 4. LOGOS strip
> ```text
> |  [LOGO STRIP CONTAINER ⚓]                    |
> |  +----------------------------------------+  |
> |  |  Berghaus   Osprey   RedBull TV      |  |
> |  |  EPIC TV    Netflix   BBC            |  |
> |  |  TNF        Black Crows  FP  Scarpa  |  |
> |  +----------------------------------------+  |
> ```

**Checklist Reference**
> ## 2. SOCIAL PROOF – Logos Strip
> -  Logos in a single row (wrap for mobile).
> -  Optional small lens chip on left edge of band.

**Step 2: GSAP timelines**

`LogosSection.motion.ts` should:

- Scroll-link horizontal pan for the rail (start top/bottom as spec).
- Build Netflix circle portal:
  - Position circle absolutely via `getBoundingClientRect` on the Netflix `<span>`.
  - Scale 1 → 20 while crossfading logos band to black, prepping for Section 3 entry.

**Design Cross-Reference — Framework 1.md**
> ### Motion
> **Entry (from hero)** ...  
> **Within section** ...  
> **Logos → Big Film (FILM)** ... circle grows around Netflix, fades rest of band.

**Checklist Reference**
> ## 2. SOCIAL PROOF – Logos Strip
> -  Subtle **auto-marquee** or scroll-linked horizontal pan.
> -  Identify Netflix logo and spawn circular mask that grows to cover viewport, crossfading into FILM entry.

**Step 3: Metadata morph continuity**

Consume events from Hero (e.g., via writable store) so metadata text swap occurs seamlessly (hero passes new copy into `MetadataStrip` when ScrollTrigger enters logos). Document this in code comments.

**Design Cross-Reference — Framework 1.md**
> **Hero → Logos (first scroll)** – Metadata strip slides upward, stretches to full width, text crossfades from `ALT ▲ 8,000M ...` into first client names/logos.

**Checklist Reference**
> **Hero → Logos (first scroll)** bullet list referencing metadata text morph.

**Step 4: Accessibility + fallback**

Ensure logos are text (no images), include `aria-label` for decorative circle motion.

**Design Cross-Reference — Framework 1.md**
> ## 4. LOGOS strip — layout description emphasising text logos + optional lens chip.

**Checklist Reference**
> ## 2. SOCIAL PROOF – Logos Strip
> -  Logos in a single row (wrap for mobile).
> -  Optional small lens chip on left edge of band.

**Step 5: Verify + commit**

Run: `npm run check`  
Commit: `"feat: add scrolling logos strip with Netflix portal zoom"`

**Design Cross-Reference — Framework 1.md**
> **Logos → Big Film (FILM)** – Circle grows over Netflix, rail fades, prepping portal into film section.

**Checklist Reference**
> ## 2. SOCIAL PROOF – Logos Strip
> -  Logos → FILM iris over Netflix section describing circle growth + fade.

---

### Task 5: Cross-check against checklist.md

**Files:**
- Reference: `checklist.md`
- Reference: `Brand Design System.md`

**Step 1: Manual verification**

Create a temporary doc `docs/qa/2025-12-02-hero-logos.md` summarizing each checklist bullet (hero layering, lens drift, metadata text, logos pan, portal zoom) with ✅/❌ indicators and screenshots.

**Design Cross-Reference — Framework 1.md**
> Entire Phase 3 HERO + LOGOS descriptions outlining layers, lens drift, metadata morph, and Netflix portal.

**Checklist Reference**
> `checklist.md` Sections 1 & 2 enumerating hero + logos requirements.

**Step 2: Review with design**

Share QA doc + staging link; capture approvals or deltas.

**Design Cross-Reference — Framework 1.md**
> Motion + transition paragraphs describing expected behaviour for approvals.

**Checklist Reference**
> `checklist.md` hero/logos motion bullets.

**Step 3: Remove QA scratch (optional)**

If repo policy prohibits temporary QA docs, delete after review.

**Design Cross-Reference — Framework 1.md**
> Layout + motion specs demonstrating deliverables that QA doc captures.

**Checklist Reference**
> `checklist.md` hero/logos bullet list used for QA.

**Step 4: Final status**

Update issue tracker ticket “Implementation Framework 1” with link to QA doc + commit SHAs.

**Design Cross-Reference — Framework 1.md**
> Summary paragraphs emphasising the hero/logos journey to confirm sign-off.

**Checklist Reference**
> `checklist.md` hero/logos sections to mark as complete.
