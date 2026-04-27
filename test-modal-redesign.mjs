#!/usr/bin/env node
/**
 * Test modal redesign: layout, sidebar buttons, code toggle, close.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8765';
const OUTPUT_DIR = join(process.cwd(), 'screenshots-test');

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const steps = [];

  try {
    // Step 1: Navigate and initial screenshot
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-01-initial.png'), fullPage: false });
    steps.push('1. Initial page screenshot captured');

    // Step 2: Click Card Spread to open modal
    const carouselItem = page.locator('.category-item[data-target="carousel"]');
    await carouselItem.click();
    await page.waitForTimeout(400);

    const card = page.locator('.example-card[data-title="Card Spread"]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await card.click();

    await page.waitForSelector('.modal-overlay.open', { timeout: 3000 });
    await page.waitForTimeout(600); // let modal animate + iframe/fetch start

    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-02-opened.png'), fullPage: false });
    steps.push('2. Modal opened - screenshot captured');

    // Verify modal layout
    const hasHeaderBar = (await page.locator('.modal-overlay .modal-header, .modal-overlay [class*="header"]').count()) > 0;
    const sidebarRight = await page.locator('.modal-sidebar').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement?.getBoundingClientRect();
      if (!parent) return false;
      return rect.right >= parent.right - 5;
    });
    const closeBtn = page.locator('.modal-btn-close');
    const codeBtn = page.locator('.modal-btn-code');
    const hasCloseBtn = (await closeBtn.count()) > 0;
    const hasCodeBtn = (await codeBtn.count()) > 0;
    const titleEl = page.locator('.modal-title');
    const titleText = await titleEl.textContent();
    const hasIframe = (await page.locator('.modal-preview iframe').count()) > 0;

    steps.push(`   Layout check: hasHeaderBar=${hasHeaderBar}, sidebarOnRight=${sidebarRight}, closeBtn=${hasCloseBtn}, codeBtn=${hasCodeBtn}, title="${(titleText || '').trim()}", hasIframe=${hasIframe}`);

    // Step 5: Click code toggle
    await codeBtn.click();
    await page.waitForTimeout(350);

    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-03-code-view.png'), fullPage: false });
    steps.push('3. Code view - screenshot captured');

    const codeTextarea = page.locator('.modal-code textarea');
    const codeVisible = (await codeTextarea.count()) > 0 && await codeTextarea.isVisible();
    const codeContent = codeVisible ? (await codeTextarea.textContent()).slice(0, 100) : '';
    steps.push(`   Code textarea visible: ${codeVisible}, preview: "${codeContent}..."`);

    // Step 7: Click code toggle again to switch back to preview
    await codeBtn.click();
    await page.waitForTimeout(350);

    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-04-preview-back.png'), fullPage: false });
    steps.push('4. Switched back to preview - screenshot captured');

    const iframeVisible = await page.locator('.modal-preview:not(.hidden) iframe').isVisible();
    steps.push(`   Preview iframe visible: ${iframeVisible}`);

    // Step 9: Close modal
    await closeBtn.click();
    await page.waitForTimeout(450);

    await page.screenshot({ path: join(OUTPUT_DIR, 'modal-05-closed.png'), fullPage: false });
    steps.push('5. Modal closed - screenshot captured');

    const modalClosed = !(await page.locator('.modal-overlay.open').count());
    steps.push(`   Modal closed: ${modalClosed}`);

  } catch (err) {
    steps.push(`ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(OUTPUT_DIR, 'modal-error.png'), fullPage: false });
    } catch (_) {}
  } finally {
    await browser.close();
  }

  const report = steps.join('\n');
  writeFileSync(join(OUTPUT_DIR, 'modal-test-report.txt'), report);
  console.log(report);
}

main();
