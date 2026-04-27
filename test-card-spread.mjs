#!/usr/bin/env node
/**
 * Test Card Spread card: video thumbnail, hover play, unhover pause, play icon overlay.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8765';
const OUTPUT_DIR = join(process.cwd(), 'screenshots-test');

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const report = {
    hasVideoThumbnail: false,
    hoverPlaysVideo: false,
    unhoverPausesVideo: false,
    hasPlayIconOverlay: false,
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 1. Initial screenshot
    await page.screenshot({ path: join(OUTPUT_DIR, '01-initial.png'), fullPage: false });
    console.log('1. Initial page screenshot captured');

    // 2. Scroll to Carousel section and find Card Spread
    const carouselItem = page.locator('.category-item[data-target="carousel"]');
    await carouselItem.click();
    await page.waitForTimeout(500); // let scroll settle

    const cardWrapper = page.locator('.example-card-wrapper:has(.example-label:has-text("Card Spread"))').first();
    await cardWrapper.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.screenshot({ path: join(OUTPUT_DIR, '02-card-spread-paused.png'), fullPage: false });
    console.log('2. Card Spread card screenshot captured');

    // Check for video element vs placeholder
    const card = page.locator('.example-card[data-title="Card Spread"]').first();
    const hasVideo = (await card.locator('video').count()) > 0;
    const hasPlaceholder = (await card.locator('.preview-shapes, .preview-carousel').count()) > 0;
    report.hasVideoThumbnail = hasVideo;
    console.log(`   - Video element: ${hasVideo}, Placeholder shapes: ${hasPlaceholder}`);

    // Check for play icon overlay
    const playIcon = card.locator('[class*="play"], .play-icon, [aria-label*="play"], svg use[href*="play"]');
    report.hasPlayIconOverlay = (await playIcon.count()) > 0;
    console.log(`   - Play icon overlay: ${report.hasPlayIconOverlay}`);

    // 3. Hover over the card
    await card.hover();
    await page.waitForTimeout(600); // allow video to start if it's a video

    await page.screenshot({ path: join(OUTPUT_DIR, '03-card-hovered.png'), fullPage: false });
    console.log('3. Hovered state screenshot captured');

    // Check if video is playing on hover
    const videoOnHover = card.locator('video');
    if ((await videoOnHover.count()) > 0) {
      const playing = await videoOnHover.evaluate((v) => !v.paused && !v.ended);
      report.hoverPlaysVideo = playing;
      console.log(`   - Video playing on hover: ${playing}`);
    } else {
      report.hoverPlaysVideo = false;
      console.log('   - No video to check play state');
    }

    // 4. Move mouse away
    await page.mouse.move(10, 10); // move to top-left corner
    await page.waitForTimeout(600);

    await page.screenshot({ path: join(OUTPUT_DIR, '04-card-unhovered.png'), fullPage: false });
    console.log('4. Unhovered state screenshot captured');

    // Check if video paused on unhover
    const videoAfterUnhover = card.locator('video');
    if ((await videoAfterUnhover.count()) > 0) {
      const paused = await videoAfterUnhover.evaluate((v) => v.paused);
      report.unhoverPausesVideo = paused;
      console.log(`   - Video paused after unhover: ${paused}`);
    } else {
      report.unhoverPausesVideo = false;
    }

    // Write report
    const reportPath = join(OUTPUT_DIR, 'report.txt');
    const reportText = `
Card Spread Card - Test Report
==============================

1. Video thumbnail (first frame) vs placeholder shapes?
   Result: ${report.hasVideoThumbnail ? 'VIDEO thumbnail (first frame)' : 'PLACEHOLDER shapes'}

2. Does hovering make the video play?
   Result: ${report.hoverPlaysVideo ? 'YES' : 'NO'}

3. Does unhovering pause and reset it?
   Result: ${report.unhoverPausesVideo ? 'YES' : 'NO'}

4. Play icon overlay on paused state?
   Result: ${report.hasPlayIconOverlay ? 'YES' : 'NO'}
`;
    const fs = await import('fs');
    fs.writeFileSync(reportPath, reportText);
    console.log('\nReport saved to screenshots-test/report.txt');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
