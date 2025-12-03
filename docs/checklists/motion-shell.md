# Motion Shell QA Checklist

Run through these steps before claiming motion work is complete:

1. `npm run lint:motion`
2. Load the page without query params, scroll Hero → Logos. Verify the metadata strip detaches at the correct moment and reattaches when scrolling back up.
3. Confirm the lens badge moves from Hero to Logos and returns with no “double lens” flashes.
4. Trigger the Netflix portal handoff and ensure the circle mask aligns with the Netflix logo before expanding, then emits the `portal:film-ready` event.
5. Toggle `prefers-reduced-motion` in dev tools. Reload; ScrollSmoother should skip and GSAP ticker fallback should keep progress synchronized (lens should still move smoothly).
6. Append `?framework2=1` to the URL to enable Framework 2 sections. Scroll through the entire stack and confirm Framework 1 timelines still clean up.
