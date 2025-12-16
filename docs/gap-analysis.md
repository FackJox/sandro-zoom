# Gap Analysis: Design Docs vs Implementation

**Date:** 2025-12-16
**Analysis Method:** Playwright automation + code exploration

---

## Executive Summary

The scroll orchestration architecture is **correctly implemented** but has a **critical visibility bug** causing all sections to display simultaneously after the Hero. The individual section animations and transitions are defined but cannot be observed due to this visibility issue.

---

## Section-by-Section Gap Analysis

### 1. HERO SECTION (0-240vh)

| Design Spec (Framework 1) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| Full-bleed media with push-in (scale 1.02→1.0) | ✅ Implemented | None |
| Yellow slab with vertical mask reveal | ✅ Visible in screenshot | None |
| Lens badge (◯) overlapping slab edge | ✅ Present at top-right | None |
| Metadata strip at bottom (ALT ▲ 8,000M...) | ❌ NOT FOUND | **MISSING** |
| Circular strip masks (2-3 arcs) parallaxing | ⚠️ Partial - slices visible but unclear if parallaxing | Verify motion |
| Hero exit: clip-path contracts 100%→0% | ❓ Cannot verify - sections break after 0vh | Blocked by visibility bug |
| Metadata → Logos morph on scroll | ❌ Metadata strip not found | **MISSING** |
| Lens detaches and drifts to corner | ❓ Cannot verify | Blocked by visibility bug |

**Hero Gap Summary:**
- Metadata strip component missing entirely
- Hero→Logos morph transition cannot happen without metadata strip
- All exit animations blocked by visibility bug

---

### 2. LOGOS SECTION (240-440vh)

| Design Spec (Framework 1) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| Logo strip container with client logos | ✅ Section exists (id="logos") | None |
| Horizontal auto-scroll/marquee or scroll-linked pan | ❓ Cannot verify | Blocked |
| Small lens chip overlapping strip | ✅ Lens badge present | None |
| Netflix logo acts as portal entry point | ❓ Portal overlay found but cannot test | Blocked |
| Portal zoom: circle expands from Netflix → BigFilm | ❓ Cannot verify | Blocked |

**Logos Gap Summary:**
- Section structure exists but animations cannot be verified

---

### 3. BIG FILM SECTION (440-740vh)

| Design Spec (Framework 2) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| 3 cards stacked (Netflix 14 Peaks, K2 Winter, K2 Summit) | ✅ Section exists (id="film") | Structure OK |
| Pinned scrollytelling with card swaps | ❓ Cannot verify | Blocked |
| Iris transition: clipPath circle contracts/expands | ✅ Code in place, 13 mask elements found | Needs verification |
| Card transitions at 0.30 and 0.65 progress | ❓ Cannot verify | Blocked |
| Lens barrel shows label during transitions | ❓ Cannot verify | Blocked |
| Film Stories entry reel at 0.92 progress | ❓ Cannot verify | Blocked |
| Zoom-out exit: concentric circles to FilmStories | ✅ `zoomOutTransition.ts` implemented | Architecture OK |

**BigFilm Gap Summary:**
- Architecture correct but visibility bug prevents verification

---

### 4. FILM STORIES SECTION (740-1000vh)

| Design Spec (Framework 3) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| 6-story carousel (Sasha, Grace, Afghanistan...) | ✅ Section exists (id="film-stories") | None |
| Focus ring slides along strip between stories | ❓ Cannot verify | Blocked |
| Story crossfade + slide animations | ❓ Cannot verify | Blocked |
| Lens bug: 5-7° rotation + 1.02 scale blip | ✅ Defined in zoomOutTransition.ts | Architecture OK |
| Zoom-out exit to PhotoStats | ✅ Defined in transitions | Architecture OK |

---

### 5. PHOTO STATS SECTION (1000-1160vh)

| Design Spec (Framework 3) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| Dual panel toggle (success/failure) | ✅ Section exists (id="photo-stats") | None |
| Basecamp drone video as BG | ❓ Cannot verify | Blocked |
| Parallax push-in from zoom-out (scale 1.2→1.0) | ✅ Defined in transitions | Architecture OK |
| Zoom-out exit to About | ✅ Defined in transitions | Architecture OK |

---

### 6. ABOUT SECTION (1160-1460vh)

| Design Spec (Framework 4) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| Three-beat narrative (Front-line, Origin, Values) | ✅ Section exists (id="about") | None |
| Beat transitions at 0.33 progress each | ❓ Cannot verify | Blocked |
| Circular focus ring moves between beats | ❓ Cannot verify - no focus ring found in DOM | **POSSIBLY MISSING** |
| Inside/outside mask transitions | ❓ Cannot verify | Blocked |
| Values reveal animation (line 1, then line 2 slides up) | ❓ Cannot verify | Blocked |
| Exit portal with zoom-out to Services | ⚠️ Design says "grid flip" but zoom-out also defined | **CONFLICTING SPECS** |

**About Gap Summary:**
- Focus ring element may be missing
- Framework 4 specifies centered lens transitions
- Framework 5 specifies grid flip transition
- These are conflicting - need clarification

---

### 7. SERVICES SECTION (1460-1760vh)

| Design Spec (Framework 5) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| Grid flip transition from About | ⚠️ No grid flip overlay found | **MISSING or DIFFERENT** |
| Video intro, then fades to black | ✅ Section exists (id="services") | Structure OK |
| Credits-style typography on Black Stallion | ✅ Visible in screenshots | Working |
| Credit lines scroll upward with page scroll | ❓ Cannot verify scroll behavior | Blocked |
| CTA "ONE MORE SHOT ↓ / SCROLL FOR CONTACT" | ❓ Cannot verify | Blocked |

**Services Gap Summary:**
- Grid flip transition may not be implemented
- Credits layout visible and correct in final screenshots

---

### 8. FINAL CONTACT SECTION (1760-1960vh)

| Design Spec (Framework 5) | Implementation Status | Gap |
|---------------------------|----------------------|-----|
| 3D camera reveal (services shrinks to LCD) | ✅ **VISIBLE AND WORKING** | None! |
| Camera in bottom-right with LCD showing services | ✅ Visible in all post-Hero screenshots | Working |
| Contact text above camera | ❓ Text not visible in screenshots | **POSSIBLY MISSING** |
| Scenic mountain background with parallax | ✅ Mountain scene visible | Working |
| Camera idle animation (gentle rotation) | ❓ Cannot verify motion | Blocked |
| Pointer parallax on mouse movement | ❓ Cannot verify | Blocked |

**Final Contact Gap Summary:**
- 3D camera reveal is the only section clearly visible and working
- Contact text (phone/email) may be missing or positioned off-screen

---

## Cross-Section Systems Gap Analysis

### Lens Badge

| Design Spec | Implementation Status | Gap |
|-------------|----------------------|-----|
| Persistent element outside section stack | ⚠️ Found but z-index is "auto" | Should be z-10 |
| Transitions between section attachments | ✅ `lensTimeline.ts` defines segments | Architecture OK |
| Subtle rotation/scale blip on transitions | ✅ Defined in zoomOutTransition.ts | Architecture OK |
| Hero: xPercent -12%, yPercent -38%, scale 0.74 | ❓ Cannot verify | Blocked |
| Logos: xPercent -6%, yPercent -55%, scale 0.6 | ❓ Cannot verify | Blocked |

**Finding:** Lens badge exists but z-index should be fixed to z-10 to ensure it stays above all sections.

---

### Metadata Strip

| Design Spec | Implementation Status | Gap |
|-------------|----------------------|-----|
| Bottom-anchored strip in Hero | ❌ **NOT FOUND** | **CRITICAL MISSING** |
| Morphs to Logos band on scroll | ❌ Cannot happen without strip | **CRITICAL MISSING** |
| Stack-based push/pop system | ✅ `metadata.ts` defines stores | Architecture OK |
| Hero metadata content | ✅ Defined in metadata.ts | Content OK |
| Logos metadata content | ✅ Defined in metadata.ts | Content OK |

**Finding:** Metadata strip component is completely missing from the DOM. The stores and content exist but no visual component renders them.

---

### Zoom-Out Transitions

| Design Spec (2025-12-07 Plan) | Implementation Status | Gap |
|-------------------------------|----------------------|-----|
| Three layers: Remnant, Current, Incoming | ✅ Fully implemented | None |
| Torus mask (donut) with inner/outer radius | ✅ Fully implemented | None |
| Parallax elements (scale 1.2, y -40px) | ✅ Fully implemented | None |
| Z-index: Remnant=3, Current=2, Incoming=1 | ✅ Implemented in `applySectionVisibility` | None |
| BigFilm→FilmStories at 695-740vh | ✅ Defined | Architecture OK |
| FilmStories→PhotoStats at 961-1000vh | ✅ Defined | Architecture OK |
| PhotoStats→About at 1136-1160vh | ✅ Defined | Architecture OK |

**Finding:** Zoom-out transition system is architecturally complete and correct!

---

### Portal Transitions

| Transition | Design Spec | Implementation Status | Gap |
|------------|-------------|----------------------|-----|
| Hero → Logos | Metadata morph + lens detach | ❌ Metadata missing | **BLOCKED** |
| Logos → BigFilm | Netflix logo circle expands | ⚠️ Portal overlay found | Needs verification |
| About → Services | Grid flip (4×4 tiles) | ❌ No grid flip found | **POSSIBLY MISSING** |
| Services → FinalContact | CTA portal expand | ❓ Cannot verify | Blocked |

---

## Root Cause Analysis

### Primary Bug: Visibility Thresholds

**Location:** `masterScroll.ts` lines 411-467 (`applySectionVisibility`)

**Problem:** The visibility logic has:
1. **10vh buffer before each section** - sections appear 10vh early
2. **Transition zone overlaps** - e.g., BigFilm shows at 410vh instead of 440vh
3. **autoAlpha set independently of z-index** - even correctly layered sections are all visible

**Impact:** All sections render with `opacity: 1` simultaneously, making the scroll experience appear broken.

---

## Critical Gaps Summary

| Priority | Gap | Impact |
|----------|-----|--------|
| 🔴 P0 | **Visibility thresholds too permissive** | All sections visible at once - blocks entire experience |
| 🔴 P0 | **Metadata strip component missing** | Hero→Logos morph impossible |
| 🟠 P1 | Lens badge z-index is "auto" not "10" | May get covered by sections |
| 🟠 P1 | Grid flip transition (About→Services) possibly missing | Transition not implemented |
| 🟡 P2 | About section focus ring possibly missing | Beat transitions may lack visual feedback |
| 🟡 P2 | Contact text not visible in Final Contact | Content may be positioned wrong |

---

## What's Working Well

1. ✅ **Section structure** - All 8 sections exist with correct IDs
2. ✅ **Scroll configuration** - 1960vh total, correct segment ranges
3. ✅ **Zoom-out transition architecture** - Torus masks, parallax, z-index all defined
4. ✅ **3D camera reveal** - Final Contact section fully implemented and visible
5. ✅ **Services credits** - Typography and layout correct
6. ✅ **Lens badge** - Component exists and positioned correctly
7. ✅ **Hero visual design** - Yellow slab, mountain background, lens slices visible

---

## Screenshots

Playwright audit screenshots saved to `/tmp/scroll-audit-*.png`:
- `scroll-audit-hero-start.png` - Hero section at 0vh (working)
- `scroll-audit-hero-exit--logos-start-.png` - Shows Final Contact instead of Logos
- `scroll-audit-bigfilm-card-1.png` - Shows Final Contact instead of BigFilm
- All subsequent screenshots show Final Contact section

This confirms the visibility bug causes immediate jump to final section after Hero.
