# Scaffolding Implement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish a shared GSAP orchestration layer (smooth scrolling, master timeline, shared element stores) and refactor the Framework 1 sections to plug into it so transitions stop "scrolling in from bottom" and instead match the cinematic storyboard.

**Architecture:** Introduce a `scrollOrchestrator` module that wires ScrollSmoother (or a custom RAF loop) plus a master GSAP timeline registry. Sections expose `registerSectionTimeline()` hooks so animations are composed centrally. Shared UI (lens badge, metadata strip, portal mask) lives in dedicated stores with lifecycle helpers.

**Tech Stack:** SvelteKit, TypeScript, GSAP (ScrollTrigger, ScrollSmoother, Flip), Panda CSS, Svelte stores.

---

## Architecture Blueprint

1. **Global Motion Shell**
   - Create `src/lib/motion/orchestrator.ts` exporting `registerGsap()`, `initScrollShell(node)`, and store helpers for smooth scrolling + master timeline.
   - Configure `ScrollTrigger` + `ScrollSmoother` (fallback to manual RAF if prefers-reduced-motion).
   - Provide APIs: `registerSectionTimeline(name, build)` returns cleanup + progress store; `setGlobalPlayback(state)` for debugging.

2. **Shared Element Stores**
   - Extend `lensTimeline` + `metadata` to expose `reset`, `detach`, `attachTo(sectionId)` helpers and allow multiple instances (hero, film HUD, etc.).
   - Introduce `portalStore` to coordinate circle mask DOM and timeline segments (Netflix portal, future ones).

3. **Section Controllers**
   - Each section file exports `initSectionMotion({ root, orchestrator })` returning destroy function.
   - Sections register local timelines via orchestrator and subscribe to shared stores for lens/metadata state.

4. **Smooth Scroll Experience**
   - Wrap `<MainScroll>` content in a `SmoothScrollShell` component that instantiates ScrollSmoother (or `gsap.ticker` fallback) and exposes a context for sections to read global progress, disable smoothing, etc.

5. **Verification Hooks**
   - Each section provides `debugMarkers` to visualize timeline start/end while building (toggle via env var or query param).
   - Add `npm` scripts for running lint/check and (optionally) Playwright smoke for scroll interactions when headless is allowed.

---

## Iterative Chunking (Waves → Steps → Micro-steps)

### Wave 1 – Global Orchestrator Skeleton
1. **Step 1:** Scaffold `src/lib/motion/orchestrator.ts` with master timeline map + registration API.
   - Micro-steps:
     - Declare `interface SectionTimelineConfig`.
     - Implement `registerSectionTimeline` storing GSAP timeline + metadata.
     - Add `cleanupSectionTimeline(name)`.
2. **Step 2:** Wire orchestrator into `src/lib/motion.ts` and `src/routes/+page.svelte`.
   - Micro-steps:
     - Export orchestrator singleton.
     - Update `MainScroll` (or new `SmoothScrollShell`) to call `initScrollShell` in `onMount` and cleanup.
3. **Step 3:** Implement ScrollSmoother (with reduced-motion guard) + fallback ticker loop.
   - Micro-steps:
     - Import `ScrollSmoother` (or polyfill) lazily.
     - If user prefers reduced motion, skip smoothing and log.
     - Ensure orchestrator exposes `smoother` reference for sections needing `smoothScrollTo`.

### Wave 2 – Shared Element Stores Upgrade
1. **Step 1:** Extend lens store for multi-segment management.
   - Micro-steps: add `createLensController(id)`, refactor Hero usage, write helper docs.
2. **Step 2:** Expand metadata store to support queueing copy sets + revert on scroll-up.
   - Micro-steps: store stack of `MetadataState`, expose `pushState`, `popState`, update `MetadataStrip` component to subscribe.
3. **Step 3:** Build `portalStore` with DOM refs + GSAP timeline builder for circular mask.
   - Micro-steps: define `createPortalContext()`, allow sections to request portal, ensure cleanup once animation completes.

### Wave 3 – Section Refactors to Use Orchestrator
1. **Step 1:** Hero section registers intro + morph sequences through orchestrator.
   - Micro-steps: replace direct `gsap.timeline` usage with `registerSectionTimeline('hero', ...)`, subscribe to orchestrator progress for debugging.
2. **Step 2:** Logos section rewired to orchestrator + portal store; implement pending entry animation (rail fade/slide) + Netflix portal handoff.
   - Micro-steps: register main timeline; use portal store for mask; ensure metadata state returns to hero when reversing scroll.
3. **Step 3:** Provide placeholder sections for Film/others (or temporarily stub) but ensure they don't run until orchestrator signals Framework 2 flag.
   - Micro-steps: add feature flag store; conditionally render sections.

### Wave 4 – Verification + Tooling
1. **Step 1:** Add `npm run lint:motion` (or reuse `npm run check`) verifying TypeScript + Svelte.
2. **Step 2:** Document orchestration API in `docs/architecture/motion-shell.md` (create directory if needed).
3. **Step 3:** Record manual QA checklist (scroll hero→logos, reduced motion, lens detach restore) in `/docs/checklists/motion-shell.md`.

---

## Code-Generation Prompts (Sequential, incremental)

### Prompt 1 – Orchestrator Skeleton
```text
You are updating a SvelteKit + GSAP project. Create `src/lib/motion/orchestrator.ts` exporting:
- `type SectionTimelineHandle` describing GSAP timeline + cleanup
- `registerSectionTimeline(name: string, build: (ctx) => gsap.core.Timeline)` that stores the timeline and returns a disposer
- `getTimeline(name)` for debugging
- `initScrollShell(wrapper: HTMLElement)` that currently just ensures `registerGsap()` is called and returns a cleanup stub
Do not wire ScrollSmoother yet. Add unitless inline comments explaining intent where non-trivial.
```

### Prompt 2 – Smooth Scroll Wrapper
```text
Using the new orchestrator, update `src/lib/motion/orchestrator.ts` and `src/lib/components/MainScroll.svelte` (or a new `SmoothScrollShell.svelte` if cleaner) so that:
- `initScrollShell` sets up GSAP `ScrollTrigger` + optional `ScrollSmoother` (guard with `prefers-reduced-motion` and try/catch if plugin missing)
- `MainScroll` (or the new wrapper) calls `initScrollShell` in `onMount`, stores the cleanup, and exposes a `<slot />` for page content
- Provide a Svelte context (`setContext('scrollOrchestrator', orchestratorApi)`) so sections can get access later
Keep the API backward-compatible for now.
```

### Prompt 3 – Shared Lens/Metadata Controllers
```text
Refactor `src/lib/motion/lensTimeline.ts` and `src/lib/motion/metadata.ts` so multiple sections can register independent controllers. Steps:
1. Export `createLensController(id: string)` returning `{ state, registerSegment, setProgress, attach(node), detach() }` and keep a default controller for the hero.
2. Update existing hero usage to call the default controller.
3. Extend metadata store to support a stack of states with `pushMetadataState`, `popMetadataState`, `setCurrentMetadata(text)` so hero/logos can push/pop without losing text when scrolling back.
Ensure TypeScript types stay strict and old imports still work.
```

### Prompt 4 – Portal Store + Logos Animation
```text
Create `src/lib/motion/portalStore.ts` with helpers to:
- Register a circular portal mask element
- Position it over a target DOMRect
- Build a GSAP timeline that expands the circle to full viewport, crossfades the target text to video, and emits events when complete
Then update `src/lib/sections/LogosSection.svelte` and `.motion.ts` to use the portal helpers, add the missing logos-entry fade/slide animation, and make sure metadata + lens controllers reattach when scrolling back to the hero. Use the orchestrator registration APIs instead of ad-hoc timelines.
```

### Prompt 5 – Hero Section Integration
```text
Update `src/lib/sections/HeroSection.svelte` and `.motion.ts` so they:
- Retrieve the orchestrator context
- Register the intro + morph timelines via `registerSectionTimeline('hero', ...)` instead of creating GSAP timelines directly
- Use the new lens/metadata controller APIs
- Ensure cleanup calls the disposer returned by the orchestrator
Add any necessary guards for reduced-motion users.
```

### Prompt 6 – Feature Flags + Future Sections Gate
```text
Introduce a simple feature-flag store (e.g., `src/lib/stores/features.ts`) with a boolean `enableFramework2`. Use it inside `src/routes/+page.svelte` to conditionally render the Framework 2+ sections (BigFilmSection, etc.) so that by default only Framework 1 runs. Provide a temporary UI toggle (e.g., query param `?framework2=1`). Update docs to mention the flag.
```

### Prompt 7 – Verification + Docs
```text
Add documentation `docs/architecture/motion-shell.md` describing the orchestrator APIs, smooth scroll behavior, and how sections should register. Include a short QA checklist in `docs/checklists/motion-shell.md`. Update `package.json` with an npm script (e.g., `"lint:motion": "npm run check"`) so developers have a standard verification entry point. Finally, ensure the README references the new architecture docs.
```

---

Plan complete. Preferred execution path: Subagent-driven (per-task review) so each wave can be validated before moving to the next. EOF
