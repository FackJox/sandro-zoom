# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sandro Zoom** - High-altitude cinematography portfolio built with SvelteKit, GSAP, and Panda CSS. Features a centralized motion shell where all scroll-driven sections plug into a single GSAP orchestrator.

**Tech Stack**: SvelteKit 2.48 | Vite 7.2 | Panda CSS 1.6 | GSAP 3.13 | Three.js + Threlte (available for 3D)

## Development Commands

```bash
npm run dev           # Vite dev @ http://localhost:5173
npm run build         # Production bundle
npm run preview       # Serve built output
npm run check         # Type-check + Svelte validation
npm run check:watch   # Continuous type checking
npm run lint:motion   # Motion-focused svelte-check
npm run prepare       # svelte-kit sync (generates types)
```

## Architecture

### Scroll Orchestrator Pattern

All GSAP timelines register through a central orchestrator rather than scattered across components:

```
src/lib/
├── motion/
│   ├── orchestrator.ts    # Central timeline registry + ScrollSmoother init
│   ├── gsapRegistry.ts    # GSAP plugin registration
│   ├── portalStore.ts     # Circular mask transitions between sections
│   ├── lensTimeline.ts    # Lens badge state (position, scale, attachment)
│   └── metadata.ts        # Metadata strip stack for section headings
├── sections/              # Full-page sections with .motion.ts files
├── components/            # UI elements (LensBadge, MetadataStrip, etc.)
├── stores/                # Svelte stores
├── data/                  # Film cards, film stories content
└── design/                # Layout + motion config
```

### Section Registration Flow

1. `<MainScroll>` initializes scroll shell, publishes orchestrator via Svelte context
2. Sections retrieve orchestrator with `getContext(SCROLL_ORCHESTRATOR_CONTEXT_KEY)`
3. Each section calls `registerSectionTimeline(name, buildFn)` to plug into central timeline
4. Shared state (lens badge, metadata strip, portal mask) flows through Svelte stores

### Portal Event Flow

- **Logos → Film**: Netflix logo triggers circular mask expansion → BigFilmSection boots
- **Film → Film Stories**: Final card collapses → `film:exit` dispatches with focus rect → FilmStoriesSection.receivePortalIntro() drives circular zoom

### Shared State Stores

- `lensState`: `{ xPercent, yPercent, scale, opacity, idleOffset }` - lens badge position/visibility
- `lensAttachment`: Which section currently owns the lens
- `metadataText` / `metadataStack`: Current metadata + hierarchical states
- `portalContexts`: Map of portal instances (keyed by ID like 'logos', 'primary')

## GSAP Animation Guidelines

### Use GSAP for all animations - the full suite is available (now free):

- Core library: `gsap` for tweens and timelines
- **ScrollTrigger**: Scroll-based animations and parallax effects
- **Flip**: Smooth state transitions and layout animations
- **ScrollSmoother**: Enhanced smooth scrolling experiences
- **MotionPath**: Animate along SVG paths
- **DrawSVG, MorphSVG**: Advanced SVG animations
- **Draggable**: Interactive drag-and-drop

### Motion Principles

- Achieve depth via GSAP push-ins and Egg Toast frame-line reveals; cards stay hard-edged, rely on contrast + motion for separation
- **Transform for elevation**: Combine GSAP transforms with shadow effects for dynamic lift
- Focus on high-impact moments: use GSAP timelines for orchestrated page loads with staggered reveals
- Match the zoomed-lens aesthetic using custom easing/snap values (e.g., `brandEase = 'cubic-bezier(0.19, 1, 0.22, 1)'`) and MotionPath for precise parallax paths that feel like camera pulls
- Simple hover states can use CSS transitions, but complex sequences must use GSAP

### Reduced Motion Support

Orchestrator checks `prefers-reduced-motion` and falls back to `gsap.ticker` instead of ScrollSmoother. Sections must respect this flag and skip parallax/drift animations.

## Naming Conventions

- Components: PascalCase (`HeroSection`, `BigFilmSection`, `LensBadge`)
- Motion stores: camelCase (`lensState`, `metadataText`)
- Motion timelines: `section:segment` pattern (`hero:intro`, `hero:morph`, `hero:slabParallax`)
- CSS: Panda's `css()` helper with kebab-case recipe names

## Design System

- **Config**: `panda.config.ts` → outputs to `src/styled-system/` (gitignored)
- **Colors**: Black Stallion (dark) → Egg Toast (light accents)
- **Fonts**: Trade Gothic Next (display), IBM Plex Sans (body)
- **Easing**: Brand easing for camera-pull feel
- **Docs**: `docs/Brand Design System.md` for visual direction

Consult Brand Design System before adjusting visuals, tokens, or motion cues.

## Key Documentation

- `docs/architecture/motion-shell.md` - Orchestrator APIs, lifecycle, verification
- `docs/Brand Design System.md` - Visual direction, typography, colors, motion timing
- `docs/design/Framework 1-5.md` - Design explorations for upcoming sections

## Verification Before Merge

1. `npm run check` - project-wide type check
2. `npm run lint:motion` - motion shell QA checklist
3. Attach screen recording/GIF for motion updates in PRs
