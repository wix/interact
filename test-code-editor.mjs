#!/usr/bin/env node
/**
 * Test code editor in modal: syntax highlighting, line numbers, reset button, editability.
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

    // Open modal
    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(400);
    const card = page.locator('.example-card[data-title="Card Spread"]').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await card.click();

    await page.waitForSelector('.modal-overlay.open', { timeout: 3000 });
    await page.waitForTimeout(500);

    // Click code toggle
    await page.locator('.modal-btn-code').click();
    await page.waitForSelector('.modal-code.visible', { timeout: 3000 });
    await page.waitForSelector('.CodeMirror', { timeout: 3000 });
    await page.waitForTimeout(500); // CodeMirror render

    // Screenshot 1: Code view
    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-01-code-view.png'), fullPage: false });
    report.push('=== Step 4: Code view screenshot ===');

    // Check for line numbers
    const lineNumbers = page.locator('.CodeMirror-gutters, .CodeMirror-linenumber, [class*="line-number"]');
    const hasLineNumbers = (await lineNumbers.count()) > 0;
    report.push(`- Line numbers visible: ${hasLineNumbers}`);

    // Check for syntax highlighting (colored spans)
    const cmContent = page.locator('.CodeMirror-code');
    const hasCmContent = (await cmContent.count()) > 0;
    const coloredSpans = await page.locator('.CodeMirror-code span[class*="cm-"]').count();
    report.push(`- CodeMirror content: ${hasCmContent}, colored spans (syntax): ${coloredSpans}`);

    // Check for Reset button
    const resetBtn = page.locator('.code-reset-btn, button:has-text("Reset")');
    const hasResetBtn = (await resetBtn.count()) > 0;
    report.push(`- Reset button: ${hasResetBtn}`);

    // Step 5: Try editing - click in editor and type
    const editor = page.locator('.CodeMirror');
    await editor.click();
    await page.keyboard.type(' /* TEST */', { delay: 50 });
    await page.waitForTimeout(300);

    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-02-after-edit.png'), fullPage: false });
    report.push('');
    report.push('- Typed in editor: attempted');

    // Step 6: Click Reset
    await resetBtn.click();
    await page.waitForTimeout(400);

    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-03-after-reset.png'), fullPage: false });
    report.push('');
    report.push('=== Step 6: After Reset screenshot ===');

    const contentAfterReset = await page.evaluate(() => {
      const el = document.querySelector('.CodeMirror');
      if (!el || !el.CodeMirror) return 'N/A';
      return el.CodeMirror.getValue().includes('/* TEST */');
    }).catch(() => 'error');
    report.push(`- "/* TEST */" still present after reset: ${contentAfterReset} (expect false for reset to work)`);

    // Step 7: Close modal
    await page.locator('.modal-btn-close').click();
    await page.waitForTimeout(400);
    report.push('');
    report.push('=== Step 7: Modal closed ===');

  } catch (err) {
    report.push(`ERROR: ${err.message}`);
    try {
      await page.screenshot({ path: join(OUTPUT_DIR, 'editor-error.png'), fullPage: false });
    } catch (_) {}
  } finally {
    await browser.close();
  }

  const reportText = report.join('\n');
  writeFileSync(join(OUTPUT_DIR, 'editor-report.txt'), reportText);
  console.log(reportText);
}

main();
