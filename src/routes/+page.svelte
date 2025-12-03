<script lang="ts">
  import { onMount } from 'svelte';
  import { registerGsap } from '$lib/motion';

  import HeroSection from '$lib/sections/HeroSection.svelte';
  import LogosSection from '$lib/sections/LogosSection.svelte';
  import BigFilmSection from '$lib/components/BigFilmSection.svelte';
  import FilmStoriesSection from '$lib/components/FilmStoriesSection.svelte';
  import PhotoStatsSection from '$lib/components/PhotoStatsSection.svelte';
  import AboutSection from '$lib/components/AboutSection.svelte';
  import ServicesSection from '$lib/components/ServicesSection.svelte';
  import FinalContactSection from '$lib/components/FinalContactSection.svelte';
  import MainScroll from '$lib/components/MainScroll.svelte';

  onMount(() => {
    registerGsap();
  });

let filmPortalReady = false;

function handleFilmPortal() {
  filmPortalReady = true;
}
</script>

<MainScroll>
  <HeroSection />
  <LogosSection on:portal:film-ready={handleFilmPortal} />
  <BigFilmSection filmPortalReady={filmPortalReady} />
  <FilmStoriesSection />
  <PhotoStatsSection />
  <AboutSection />
  <ServicesSection />
  <FinalContactSection />
</MainScroll>
