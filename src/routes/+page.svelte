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
  type FilmStoriesInstance = InstanceType<typeof FilmStoriesSection>;
  type AboutInstance = InstanceType<typeof AboutSection>;
  type FinalContactInstance = InstanceType<typeof FinalContactSection>;
  let filmStoriesRef: FilmStoriesInstance | null = null;
  let aboutRef: AboutInstance | null = null;
  let finalContactRef: FinalContactInstance | null = null;

  function handleFilmPortal() {
    console.debug('[framework2] film portal ready event received');
    filmPortalReady = true;
  }

  function handleFilmExit(event: CustomEvent<{ focusRect: DOMRect }>) {
    filmStoriesRef?.receivePortalIntro(event.detail);
  }

  $: console.debug('[framework2] enabled', $framework2Enabled);

  function handleStatsExit(event: CustomEvent<{ focusRect: DOMRect }>) {
    aboutRef?.receivePortalIntro(event.detail);
  }

  function handleServicesExit(event: CustomEvent<{ focusRect: DOMRect }>) {
    finalContactRef?.receivePortalIntro(event.detail);
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
    <BigFilmSection filmPortalReady={filmPortalReady} on:film:exit={handleFilmExit} />
    <FilmStoriesSection bind:this={filmStoriesRef} />
    <PhotoStatsSection on:stats:exit={handleStatsExit} />
    <AboutSection bind:this={aboutRef} />
    <ServicesSection on:services:exit={handleServicesExit} />
    <FinalContactSection bind:this={finalContactRef} />
  {:else}
    <p class={gateMessage}>
      Framework 2 content disabled — append ?framework2=1 to preview upcoming scenes.
    </p>
  {/if}
</MainScroll>
