<script lang="ts">
  import { css } from '$styled-system/css';
  import HeroSection from '$lib/sections/HeroSection.svelte';
  import LogosSection from '$lib/sections/LogosSection.svelte';
  import BigFilmSection from '$lib/components/BigFilmSection.svelte';
  import FilmStoriesSection from '$lib/components/FilmStoriesSection.svelte';
  import PhotoStatsSection from '$lib/components/PhotoStatsSection.svelte';
  import AboutSection from '$lib/components/AboutSection.svelte';
  import ServicesSection from '$lib/components/ServicesSection.svelte';
  import FinalContactSection from '$lib/components/FinalContactSection.svelte';
  import MainScroll from '$lib/components/MainScroll.svelte';
  import { framework2Enabled } from '$lib/stores/features';

  let filmPortalReady = false;

  function handleFilmPortal() {
    filmPortalReady = true;
  }

  const gateMessage = css({
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontSize: { base: '0.8rem', md: '0.95rem' },
    color: 'muted',
    py: { base: '4rem', md: '6rem' }
  });
</script>

<MainScroll>
  <HeroSection />
  <LogosSection on:portal:film-ready={handleFilmPortal} />

  {#if $framework2Enabled}
    <BigFilmSection filmPortalReady={filmPortalReady} />
    <FilmStoriesSection />
    <PhotoStatsSection />
    <AboutSection />
    <ServicesSection />
    <FinalContactSection />
  {:else}
    <p class={gateMessage}>
      Framework 2 content disabled — append ?framework2=1 to preview upcoming scenes.
    </p>
  {/if}
</MainScroll>
