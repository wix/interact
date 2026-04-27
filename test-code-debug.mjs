#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8765';
const OUTPUT_DIR = join(process.cwd(), 'screenshots-test');

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const logs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('error') || text.includes('Error') || text.includes('CodeMirror')) {
      logs.push(`[${msg.type()}] ${text}`);
    }
  });

  const report = [];

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Check if CodeMirror is loaded on page
    const hasCodeMirror = await page.evaluate(() => typeof CodeMirror !== 'undefined');
    report.push(`CodeMirror loaded on page: ${hasCodeMirror}`);

    // Open modal
    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(500);
    await page.locator('.example-card').first().click();

    await page.waitForSelector('.modal-overlay.open', { timeout: 5000 });
    // Wait for iframe to load (fetch of htmlSource happens in parallel)
    await page.waitForTimeout(2500);

    report.push('Modal opened, waited for load');

    // Click code button via JS to ensure it fires
    await page.evaluate(() => {
      const btn = document.querySelector('.modal-btn-code');
      if (btn) btn.click();
    });
    await page.waitForTimeout(1500);

    const codePanel = page.locator('.modal-code');
    const panelClasses = await codePanel.getAttribute('class').catch(() => '');
    const panelVisible = await codePanel.isVisible();
    const panelDisplay = await codePanel.evaluate((el) => getComputedStyle(el).display);
    const panelOpacity = await codePanel.evaluate((el) => getComputedStyle(el).opacity);
    const panelVisibility = await codePanel.evaluate((el) => getComputedStyle(el).visibility);

    report.push(`Code panel: class="${panelClasses}", visible=${panelVisible}, display=${panelDisplay}, opacity=${panelOpacity}, visibility=${panelVisibility}`);

    const cmExists = await page.locator('.CodeMirror').count();
    report.push(`CodeMirror elements: ${cmExists}`);

    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-debug.png'), fullPage: false });
    report.push('Screenshot saved');

    if (logs.length) report.push('Console: ' + logs.join(' | '));

  } catch (err) {
    report.push(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUTPUT_DIR, 'editor-debug-report.txt'), report.join('\n'));
  console.log(report.join('\n'));
}

main();
