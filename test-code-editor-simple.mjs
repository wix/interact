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

  const report = [];

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Open modal via Card Spread
    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(500);
    await page.locator('.example-card').first().click();

    await page.waitForSelector('.modal-overlay.open', { timeout: 5000 });
    await page.waitForTimeout(800);

    // Screenshot: modal open (preview)
    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-01-modal-open.png'), fullPage: false });
    report.push('Modal opened');

    // Find and click the code button (</>)
    const codeBtn = page.locator('.modal-btn-code');
    await codeBtn.waitFor({ state: 'visible', timeout: 3000 });
    await codeBtn.click();
    await page.waitForTimeout(1200);

    // Check what's visible
    const hasCodeMirror = await page.locator('.CodeMirror').isVisible().catch(() => false);
    const hasModalCode = await page.locator('.modal-code').isVisible().catch(() => false);
    const hasVisibleClass = await page.locator('.modal-code.visible').isVisible().catch(() => false);
    report.push(`After code click: CodeMirror=${hasCodeMirror}, modal-code=${hasModalCode}, .visible=${hasVisibleClass}`);

    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-02-code-view.png'), fullPage: false });
    report.push('Screenshot 2 captured');

    if (hasCodeMirror) {
      const lineNums = await page.locator('.CodeMirror-gutters, .CodeMirror-linenumber').count();
      const cmSpans = await page.locator('.CodeMirror span[class*="cm-"]').count();
      const resetBtn = await page.locator('.code-reset-btn, button:has-text("Reset")').count();
      report.push(`Line numbers/gutters: ${lineNums}, cm- spans: ${cmSpans}, Reset btn: ${resetBtn}`);
    }

  } catch (err) {
    report.push(`ERROR: ${err.message}`);
    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-err.png'), fullPage: false });
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUTPUT_DIR, 'editor-report.txt'), report.join('\n'));
  console.log(report.join('\n'));
}

main();
