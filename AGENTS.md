# Repository Guidelines

## Project Structure & Module Organization
- `src/routes` stores page-level Svelte files; `+page.svelte` instances compose sections via the shared motion shell, while `dev/` contains demo routes.
- `src/lib` holds reusable sections, stores, and GSAP helpers; keep new primitives in the closest matching folder to reduce orchestrator imports.
- `src/styled-system` contains Panda CSS tokens and recipes; update `panda.config.ts` alongside any new design tokens.
- Static assets belong under `static/`; long-form notes and motion shell docs live in `docs/architecture`.
- Brand direction, typography, and token rationale live in `docs/Brand Design System.md`; consult it before adjusting visuals, tokens, or motion cues.
- The central Panda CSS design system is defined in `panda.config.ts` and emitted to `src/styled-system`; treat these tokens and recipes as the single source of truth for spacing, typography, and color decisions.

## Build, Test, and Development Commands
- `npm run dev` starts Vite with hot module reloading at `http://localhost:5173`.
- `npm run build` and `npm run preview` create and serve the production bundle.
- `npm run check` runs `svelte-check` with the project `tsconfig` for type + markup validation; use `check:watch` during longer sessions.
- `npm run lint:motion` is the lightweight alias invoked in the motion-shell QA checklist before merging animation changes.

## Coding Style & Naming Conventions
- Use TypeScript and two-space indentation in `.svelte` and `.ts` files; prefer explicit interfaces for exported props/stores.
- Components stay in PascalCase, motion stores in camelCase (e.g., `framework2Enabled`), and CSS utilities use Panda’s `css()` helper.
- Run `svelte-kit sync` (via `npm run prepare`) whenever the Vite plugin config changes so type definitions remain current.
- Use flat console.logs so they don't get truncated.

## Use GSAP for all animations: The full GSAP suite is available (now free)
  - Core library: `gsap` for tweens and timelines
  - **ScrollTrigger**: Scroll-based animations and parallax effects
  - **Flip**: Smooth state transitions and layout animations
  - **ScrollSmoother**: Enhanced smooth scrolling experiences
  - **MotionPath**: Animate along SVG paths
  - **DrawSVG, MorphSVG**: Advanced SVG animations
  - **Draggable**: Interactive drag-and-drop
- Achieve depth via GSAP push-ins and Egg Toast frame-line reveals; Brand Design System cards stay hard-edged, so rely on contrast + motion for separation.
- **Transform for elevation**: Combine GSAP transforms with shadow effects for dynamic lift.
- Focus on high-impact moments: use GSAP timelines for orchestrated page loads with staggered reveals.
Match the zoomed-lens aesthetic by using custom easing/snap values in GSAP (e.g., `brandEase`) and MotionPath tooling for precise parallax paths that feel like camera pulls.
- Simple hover states can still use CSS transitions, but complex sequences should use GSAP.

## Testing Guidelines
- Trusted “tests” are the Svelte compiler and GSAP integration checks: run `npm run check` plus `npm run lint:motion` before opening a PR.
- Snapshot interior layouts manually with `npm run preview`; flag regressions in `docs/architecture/motion-shell.md`.
- For new scroll sequences, verify feature-flagged paths by appending `?framework2=1` and documenting edge cases in the PR notes.

## Commit & Pull Request Guidelines
- Git history favors concise milestone-style subjects (`Framework 1`, `Motion shell fixes`); keep messages short, present-tense, and scoped to one behavior.
- Each PR should link the related issue, summarize visual changes, list verification commands that passed, and attach a short screen recording or GIF for motion updates.
- Mention any new Panda tokens or feature flags directly in the PR body so reviewers can cross-reference configuration changes quickly.

## Feature Flags & Configuration Tips
- Use the `framework2Enabled` store (or query param) to gate experimental sequences; default to `false` so production stays stable.
- Place sensitive credentials in environment files consumed by Vite load order—never inside `src/lib`.
- Update `docs/architecture/motion-shell.md` whenever APIs like `registerSectionTimeline` change; that file doubles as onboarding for future agents.
