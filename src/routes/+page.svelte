<script lang="ts">
  import HeroSection from '$lib/sections/HeroSection.svelte';
  import LogosSection from '$lib/sections/LogosSection.svelte';
  import BigFilmSection from '$lib/sections/BigFilmSection.svelte';
  import FilmStoriesSection from '$lib/sections/FilmStoriesSection.svelte';
  import PhotoStatsSection from '$lib/sections/PhotoStatsSection.svelte';
  import AboutSection from '$lib/sections/AboutSection.svelte';
  import ServicesSection from '$lib/sections/ServicesSection.svelte';
  import FinalContactSection from '$lib/sections/FinalContactSection.svelte';
  import MainScroll from '$lib/components/MainScroll.svelte';
  import PortalOverlay from '$lib/components/PortalOverlay.svelte';
  import GridFlipOverlay from '$lib/components/GridFlipOverlay.svelte';
  import CameraZoomOutOverlay from '$lib/components/CameraZoomOutOverlay.svelte';
  import StatsToAboutPortal from '$lib/components/StatsToAboutPortal.svelte';

  // Hero → Logos: Netflix logo triggers portal expand
  let heroPortalTrigger: HTMLElement | null = null;

  // Logos → BigFilm: Netflix expand (kept)
  let filmPortalReady = false;
  function handleFilmPortal() {
    filmPortalReady = true;
  }

  // About → Services: Grid flip (kept)
  // Component refs with exported methods
  let servicesRef: { receivePortalIntro: (detail?: { focusRect?: DOMRect }) => void } | null = null;
  let finalContactRef: { receivePortalIntro: (detail?: { focusRect?: DOMRect }) => void } | null = null;

  function handleAboutExit(event: CustomEvent<{ focusRect: DOMRect }>) {
    servicesRef?.receivePortalIntro(event.detail);
  }

  // Services → FinalContact: CTA portal (kept)
  function handleServicesExit(event: CustomEvent<{ focusRect: DOMRect }>) {
    finalContactRef?.receivePortalIntro(event.detail);
  }

  // Zoom-out transitions (BigFilm → FilmStories → PhotoStats → About)
  // are now handled by masterScrollController - no event handlers needed
</script>

<MainScroll>
  <HeroSection bind:portalTriggerRef={heroPortalTrigger} />
  <LogosSection portalTriggerEl={heroPortalTrigger} on:portal:film-ready={handleFilmPortal} />

  <!-- Zoom-out chain: sections transition via contracting circles -->
  <BigFilmSection filmPortalReady={filmPortalReady} />
  <FilmStoriesSection />
  <PhotoStatsSection />
  <AboutSection on:about:exit={handleAboutExit} />

  <!-- Grid flip and CTA portal transitions -->
  <ServicesSection bind:this={servicesRef} on:services:exit={handleServicesExit} />
  <FinalContactSection bind:this={finalContactRef} />
</MainScroll>

<StatsToAboutPortal />
<GridFlipOverlay />
<CameraZoomOutOverlay />
<PortalOverlay />
