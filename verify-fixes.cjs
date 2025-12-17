const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';

// Key scroll positions to verify our fixes
const VERIFICATION_POINTS = [
  { name: 'hero', scrollVH: 100, expectLens: true },
  { name: 'logos', scrollVH: 340, expectLens: true },
  { name: 'bigfilm-mid', scrollVH: 550, expectLens: true },
  { name: 'bigfilm-exit', scrollVH: 720, expectLens: true },
  { name: 'filmstories', scrollVH: 850, expectLens: true },
  { name: 'photostats', scrollVH: 1050, expectLens: true },
  { name: 'about-start', scrollVH: 1200, expectLens: true },
  { name: 'about-exit', scrollVH: 1420, expectLens: true },
  { name: 'services', scrollVH: 1550, expectLens: true },
  { name: 'finalcontact', scrollVH: 1850, expectLens: true }
];

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  console.log('='.repeat(80));
  console.log('VERIFICATION: P0 Fixes for Scrollytelling Gaps');
  console.log('='.repeat(80));

  try {
    console.log('Navigating to:', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded, waiting for animations...');

    // Wait for initial animations
    await page.waitForTimeout(3000);

    const viewportHeight = 1080;
    const results = [];

    for (const point of VERIFICATION_POINTS) {
      const scrollPixels = Math.round(point.scrollVH * viewportHeight / 100);

      console.log('-'.repeat(60));
      console.log(`CHECKING: ${point.name} @ ${point.scrollVH}vh (${scrollPixels}px)`);

      // Scroll to position
      await page.evaluate((scrollY) => {
        window.scrollTo({ top: scrollY, behavior: 'instant' });
      }, scrollPixels);

      await page.waitForTimeout(600);

      // Check lens badge visibility
      const lensState = await page.evaluate(() => {
        const lensBadge = document.querySelector('[class*="lens"], [class*="Lens"], [data-lens]');
        if (!lensBadge) return { found: false };

        const rect = lensBadge.getBoundingClientRect();
        const style = getComputedStyle(lensBadge);

        return {
          found: true,
          visible: style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0,
          opacity: style.opacity,
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width)
        };
      });

      // Check for services section visibility (P0.3 fix)
      const servicesVisible = await page.evaluate(() => {
        const servicesSection = document.querySelector('#services, [data-section="services"]');
        if (!servicesSection) return null;
        const style = getComputedStyle(servicesSection);
        return {
          visible: style.visibility !== 'hidden' && style.opacity !== '0',
          opacity: style.opacity,
          zIndex: style.zIndex
        };
      });

      // Check clipPath on sections (P0.2 fix)
      const clipPathInfo = await page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        const clips = [];
        sections.forEach((section) => {
          const style = getComputedStyle(section);
          if (style.clipPath && style.clipPath !== 'none') {
            clips.push({
              id: section.id || 'unknown',
              clipPath: style.clipPath.substring(0, 60)
            });
          }
        });
        return clips;
      });

      const lensOk = lensState.found && lensState.visible;
      const result = {
        position: point.name,
        scrollVH: point.scrollVH,
        lensFound: lensState.found,
        lensVisible: lensState.visible,
        lensOpacity: lensState.opacity,
        servicesVisible: servicesVisible?.visible || false,
        clipPaths: clipPathInfo.length,
        pass: lensOk === point.expectLens
      };

      results.push(result);

      console.log(`  Lens Badge: ${lensOk ? '✅ VISIBLE' : '❌ NOT VISIBLE'} (opacity: ${lensState.opacity || 'N/A'})`);
      console.log(`  Services Section: ${servicesVisible?.visible ? 'visible' : 'hidden'} (z-index: ${servicesVisible?.zIndex || 'N/A'})`);
      console.log(`  ClipPaths active: ${clipPathInfo.length}`);

      // Take screenshot
      await page.screenshot({
        path: `/tmp/verify-${point.name}.png`,
        fullPage: false
      });
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(80));

    const passed = results.filter(r => r.pass).length;
    const failed = results.filter(r => !r.pass).length;

    console.log(`Total checks: ${results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Failed positions:');
      results.filter(r => !r.pass).forEach(r => {
        console.log(`  - ${r.position}: Lens visible=${r.lensVisible}, expected=${true}`);
      });
    } else {
      console.log('\n✅ All lens badge visibility checks passed!');
    }

    // Check P0.3: Services should NOT be visible during About section
    const aboutResults = results.filter(r => r.position.startsWith('about'));
    const servicesLeakDuringAbout = aboutResults.some(r => r.servicesVisible);
    console.log(`\nP0.3 (Services visibility): ${servicesLeakDuringAbout ? '❌ Services visible during About!' : '✅ Services hidden during About'}`);

    console.log('\nScreenshots saved to /tmp/verify-*.png');
    console.log('\nKeeping browser open for 30s for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('Error during verification:', error.message);
    await page.screenshot({ path: '/tmp/verify-error.png' });
  } finally {
    await browser.close();
  }
})();
