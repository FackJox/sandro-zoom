# Sandro Zoom

High-altitude cinematography portfolio built with SvelteKit, GSAP, and Panda CSS. The project now ships a shared motion shell so scroll-driven sections plug into a single GSAP orchestrator instead of scattering timelines across components.

## Getting Started

```sh
npm install
npm run dev
```

Useful scripts:

- `npm run dev` – start Vite in dev mode.
- `npm run build` / `npm run preview` – production build + preview.
- `npm run check` – typecheck and validate Svelte components.
- `npm run lint:motion` – aliases `svelte-check` for motion-centric edits (documented below).

## Motion Shell Docs

`docs/architecture/motion-shell.md` covers:

- Scroll orchestrator API (`registerSectionTimeline`, ScrollSmoother lifecycle).
- Shared element stores (lens badge, metadata strip, portal mask).
- Integration checklist for new sections.
- Feature-flagging guidelines and verification commands.

Read that file before adjusting motion code so new sections stay aligned with the orchestration layer.

## Feature Flags

Framework 2+ sections are disabled by default to keep experimentation isolated. Append `?framework2=1` to the URL (or set the `framework2Enabled` store) to render the additional scenes.

## Verification

- `npm run check` – project-wide type check.
- `npm run lint:motion` – lightweight alias used in the motion shell QA checklist.
