#!/usr/bin/env node
/**
 * Quick script to capture screenshots of the Examples page for verification.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8765';
const OUTPUT_DIR = join(process.cwd(), 'screenshots-test');

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    // Screenshot 1: Initial page load
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(OUTPUT_DIR, '01-initial.png'), fullPage: false });
    console.log('Screenshot 1: Initial page captured');

    // Find and click "Card Spread" in the Carousel section
    const card = page.locator('.example-card[data-title="Card Spread"]').first();
    const found = (await card.count()) > 0;
    if (found) {
      await card.click();
      await page.waitForSelector('.modal-overlay.open', { timeout: 3000 });
      await page.screenshot({ path: join(OUTPUT_DIR, '02-modal-open.png'), fullPage: false });
      console.log('Screenshot 2: Modal with iframe captured');
    } else {
      console.log('Card Spread card not found');
      const html = await page.content();
      writeFileSync(join(OUTPUT_DIR, 'page-debug.html'), html, 'utf8');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
