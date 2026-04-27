#!/usr/bin/env node
/**
 * Test redesigned modal: title above container, buttons floating outside to the right.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8765';
const OUTPUT_DIR = join(process.cwd(), 'screenshots-test');

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const report = [];

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Click Card Spread
    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(400);
    const card = page.locator('.example-card[data-title="Card Spread"]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await card.click();

    await page.waitForSelector('.modal-overlay.open', { timeout: 3000 });
    await page.waitForTimeout(600);

    // Screenshot 1: Opened modal
    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-v2-01-opened.png'), fullPage: false });
    report.push('=== Step 3: Opened modal screenshot ===');

    // Layout checks
    const hasSidebar = (await page.locator('.modal-sidebar').count()) > 0;
    const hasActions = (await page.locator('.modal-actions').count()) > 0;
    const wrapper = page.locator('.modal-wrapper');
    const container = page.locator('.modal-container');
    const titleEl = page.locator('.modal-title');

    const titleRect = await titleEl.boundingBox();
    const containerRect = await container.boundingBox();
    const actionsRect = await page.locator('.modal-actions').boundingBox();

    const titleAboveContainer = titleRect && containerRect && titleRect.bottom <= containerRect.top + 5;
    const buttonsOutside = actionsRect && containerRect && actionsRect.left >= containerRect.right - 10;

    report.push(`- Has sidebar (old design): ${hasSidebar}`);
    report.push(`- Has modal-actions (new design): ${hasActions}`);
    report.push(`- Title above container: ${titleAboveContainer}`);
    report.push(`- Buttons outside/right of container: ${buttonsOutside}`);

    // Click code toggle
    await page.locator('.modal-btn-code').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-v2-02-code-view.png'), fullPage: false });
    report.push('');
    report.push('=== Step 5: Code view screenshot ===');
    const codeVisible = await page.locator('.modal-code.visible').isVisible();
    report.push(`- Code view visible: ${codeVisible}`);

    // Toggle back to preview
    await page.locator('.modal-btn-code').click();
    await page.waitForTimeout(400);
    report.push('');
    report.push('=== Step 6: Back to preview ===');

    // Close
    await page.locator('.modal-btn-close').click();
    await page.waitForTimeout(450);
    report.push('=== Step 7: Modal closed ===');

  } catch (err) {
    report.push(`ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(OUTPUT_DIR, 'modal-v2-error.png'), fullPage: false });
    } catch (_) {}
  } finally {
    await browser.close();
  }

  const reportText = report.join('\n');
  writeFileSync(join(OUTPUT_DIR, 'modal-v2-report.txt'), reportText);
  console.log(reportText);
}

main();
