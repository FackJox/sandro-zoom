# Motion Shell Architecture

The motion shell centralizes every scroll-linked animation so Framework sections no longer instantiate GSAP timelines in isolation. This document describes the moving pieces and how new sections should plug into them.

## Modules

- `src/lib/motion/orchestrator.ts`
  - Registers ScrollTrigger + ScrollSmoother (or the ticker fallback when `prefers-reduced-motion` is enabled or the plugin cannot load).
  - Exposes `registerSectionTimeline(name, build)` and `cleanupSectionTimeline(name)` APIs. Each call stores a disposer so hot reload and navigation clean up their GSAP timelines.
  - Provides `SCROLL_ORCHESTRATOR_CONTEXT_KEY` so `<MainScroll>` can publish the orchestrator via Svelte context. Sections retrieve it with `getContext` and register their timelines instead of creating detached instances.
  - ScrollSmoother runs by default (GSAP plugin now bundled). Set `VITE_ENABLE_SCROLL_SMOOTHER=false` if you need to temporarily fall back to native scrolling. Reduced-motion users are automatically routed to the fallback path.

- `src/lib/motion/lensTimeline.ts`
  - Ships `createLensController(id)` for sections that need independent lens behavior.
  - Keeps backwards-compatible exports (`lensState`, `setLensElement`, etc.) bound to the default `hero` controller.
  - Provides helpers for shared state such as `lensAttachment`. Sections must call `attachLensToSection('hero' | 'logos' | …)` whenever they take ownership of the badge so everyone else can detect conflicts and avoid double-rendering.

- `src/lib/motion/metadata.ts`
  - Maintains a stack of metadata states. Sections call `pushMetadataState({ id, text })` when taking over the strip, `setCurrentMetadata()` for inline updates, and `popMetadataState(id)` to revert.
  - `metadataText`, `metadataNode`, and other stores still work as before but now mirror the stack.

- `src/lib/motion/portalStore.ts`
  - Manages circular mask portals (Netflix handoff, future transitions).
  - Sections call `createPortalContext('logos')` and then `buildPortalTimeline` to receive a GSAP timeline handle that can be registered with the orchestrator.

## Lifecycle

1. `<MainScroll>` sets up `initScrollShell()` on mount, runs ScrollSmoother (or fallback), and puts the orchestrator in context.
2. Sections call `getContext(SCROLL_ORCHESTRATOR_CONTEXT_KEY)` to get the orchestrator if they need it.
3. During `initSectionMotion`, every GSAP animation (timeline **and** tween) is wrapped in `registerSectionTimeline('section:segment', () => animation)` so destruction is centralized.
4. Shared elements (Lens badge, Metadata strip, Portal mask) subscribe to their stores rather than manually moving DOM nodes.

## Feature Flags

Rendering past Framework 1 is gated behind the `framework2Enabled` store in `src/lib/stores/features.ts`. It reads `?framework2=1` from the URL so designers can explicitly opt in. Additional flags should follow the same pattern (store + query parameter).

## Verification

Use the dedicated motion lint script any time you touch motion code:

```sh
npm run lint:motion
```

It runs `svelte-check` with the project’s tsconfig and ensures the orchestrator/lifecycle types stay aligned.
