#!/usr/bin/env node
/**
 * Test code toggle with explicit timing: 2s load, 2s modal, click center, 1s wait.
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
    // 1. Navigate
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    // 2. Wait 2 seconds for page to fully load
    await page.waitForTimeout(2000);
    report.push('Step 2: Waited 2s after load');

    // 3. Click Card Spread
    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(400);
    const card = page.locator('.example-card[data-title="Card Spread"]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await card.click();
    report.push('Step 3: Clicked Card Spread card');

    // 4. Wait 2 seconds for modal animate + fetch
    await page.waitForSelector('.modal-overlay.open', { timeout: 5000 });
    await page.waitForTimeout(2000);
    report.push('Step 4: Waited 2s for modal + fetch');

    // 5. Screenshot - modal open
    await page.screenshot({ path: join(OUTPUT_DIR, 'toggle-01-modal-open.png'), fullPage: false });
    report.push('Step 5: Screenshot - modal open');

    // 6. Click code toggle precisely in center
    const codeBtn = page.locator('.modal-btn-code');
    await codeBtn.waitFor({ state: 'visible', timeout: 3000 });
    const box = await codeBtn.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      await page.mouse.click(centerX, centerY);
      report.push(`Step 6: Clicked code button center at (${Math.round(centerX)}, ${Math.round(centerY)})`);
    } else {
      await codeBtn.click();
      report.push('Step 6: Clicked code button (no box, used click)');
    }

    // 7. Wait 1 second
    await page.waitForTimeout(1000);
    report.push('Step 7: Waited 1s');

    // 8. Screenshot - code panel?
    await page.screenshot({ path: join(OUTPUT_DIR, 'toggle-02-after-code-click.png'), fullPage: false });
    report.push('Step 8: Screenshot after code click');

    // Verify what's visible
    const codePanelVisible = await page.locator('.modal-code.visible').isVisible().catch(() => false);
    const hasCodeMirror = await page.locator('.CodeMirror').isVisible().catch(() => false);
    const lineNums = await page.locator('.CodeMirror-gutters, .CodeMirror-linenumber').count();
    const resetBtn = await page.locator('.code-reset-btn, button:has-text("Reset")').count();
    const cmSpans = await page.locator('.CodeMirror-code span[class*="cm-"]').count();

    report.push('');
    report.push('After code toggle click:');
    report.push(`  - Code panel (.modal-code.visible): ${codePanelVisible}`);
    report.push(`  - CodeMirror visible: ${hasCodeMirror}`);
    report.push(`  - Line number elements: ${lineNums}`);
    report.push(`  - Reset button: ${resetBtn}`);
    report.push(`  - Syntax-highlight spans (cm-*): ${cmSpans}`);

  } catch (err) {
    report.push(`ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(OUTPUT_DIR, 'toggle-error.png'), fullPage: false });
    } catch (_) {}
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUTPUT_DIR, 'toggle-report.txt'), report.join('\n'));
  console.log(report.join('\n'));
}

main();
