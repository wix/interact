#!/usr/bin/env node
/**
 * Manually trigger code view by adding visible class to verify CodeMirror/Reset UI.
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
    await page.waitForTimeout(500);

    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(500);
    await page.locator('.example-card').first().click();

    await page.waitForSelector('.modal-overlay.open', { timeout: 5000 });
    await page.waitForTimeout(2000); // fetch htmlSource

    // Manually switch to code view by simulating the toggle logic
    await page.evaluate(() => {
      const codePanel = document.querySelector('.modal-code');
      const previewPanel = document.querySelector('.modal-preview');
      const codeBtn = document.querySelector('.modal-btn-code');
      if (codePanel) codePanel.classList.add('visible');
      if (previewPanel) previewPanel.classList.add('hidden');
      if (codeBtn) codeBtn.classList.add('active');

      // Also need to init CodeMirror and set value - the modal module's toggle does this
      // We'll just add visible and see if CM exists from a prior attempt
      const cmWrap = document.querySelector('.code-editor-wrap');
      if (cmWrap && !cmWrap.querySelector('.CodeMirror') && typeof CodeMirror !== 'undefined') {
        const cm = CodeMirror(cmWrap, {
          value: document.querySelector('.modal-preview iframe')?.src ? '// Loading...' : '',
          mode: 'htmlmixed',
          theme: 'material-darker',
          lineNumbers: true,
          lineWrapping: false,
          tabSize: 2,
        });
        // We don't have htmlSource here - modal module keeps it private
      }
    });

    await page.waitForTimeout(800);

    // Check state
    const hasVisible = await page.locator('.modal-code.visible').count() > 0;
    const hasLineNums = await page.locator('.CodeMirror-gutters, .CodeMirror-linenumber').count() > 0;
    const hasReset = await page.locator('.code-reset-btn, button:has-text("Reset")').count() > 0;
    const cmSpans = await page.locator('.CodeMirror-code span[class*="cm-"]').count();

    report.push(`Manual switch: .visible=${hasVisible}, line nums=${hasLineNums}, reset btn=${hasReset}, syntax spans=${cmSpans}`);

    await page.screenshot({ path: join(OUTPUT_DIR, 'editor-manual.png'), fullPage: false });
    report.push('Screenshot saved');

  } catch (err) {
    report.push(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUTPUT_DIR, 'editor-manual-report.txt'), report.join('\n'));
  console.log(report.join('\n'));
}

main();
