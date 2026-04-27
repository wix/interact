#!/usr/bin/env node
/**
 * Debug code toggle: CodeMirror, onclick handler, console errors.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:8765?t=' + Date.now();
const OUTPUT_DIR = join(process.cwd(), 'screenshots-test');

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  // Use launch with ignoreDefaultArgs to do a "hard" load (clear cache)
  const context = await browser.newContext();
  const page = await context.newPage({ viewport: { width: 1280, height: 900 } });

  const consoleLogs = [];
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const loc = msg.location();
    consoleLogs.push({ type, text, url: loc?.url, line: loc?.lineNumber });
    // Also log to our stdout for visibility
    if (type === 'error') console.error('[CONSOLE]', text);
  });

  const report = [];

  try {
    // 1. Navigate with cache buster (hard refresh sim)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    report.push('Step 1: Navigated to ' + BASE_URL);

    // 2-4. Click Card Spread, wait 2s
    await page.locator('.category-item[data-target="carousel"]').click();
    await page.waitForTimeout(400);
    await page.locator('.example-card[data-title="Card Spread"]').first().click();
    await page.waitForSelector('.modal-overlay.open', { timeout: 5000 });
    await page.waitForTimeout(2000);
    report.push('Steps 2-4: Opened modal, waited 2s');

    // 5. typeof CodeMirror
    const typeofCM = await page.evaluate(() => typeof CodeMirror);
    report.push('');
    report.push('Step 5 - typeof CodeMirror: "' + typeofCM + '"');

    // 6. onclick handler (addEventListener doesn't set .onclick, so it may be null)
    const onclickInfo = await page.evaluate(() => {
      const btn = document.querySelector('.modal-btn-code');
      if (!btn) return 'Button not found';
      return {
        exists: true,
        onclick: btn.onclick,
        hasOnclick: !!btn.onclick,
        disabled: btn.disabled,
        display: getComputedStyle(btn).display,
        visibility: getComputedStyle(btn).visibility,
        pointerEvents: getComputedStyle(btn).pointerEvents,
      };
    }).catch((e) => 'Error: ' + e.message);
    report.push('');
    report.push('Step 6 - modal-btn-code onclick:');
    report.push(JSON.stringify(onclickInfo, null, 2));

    // 7. Click code toggle + capture any thrown errors
    consoleLogs.length = 0;
    const clickResult = await page.evaluate(() => {
      const errors = [];
      const origOnError = window.onerror;
      window.onerror = (msg, url, line, col, err) => {
        errors.push({ msg, url, line, col, err: err && err.message });
        return false;
      };
      try {
        const btn = document.querySelector('.modal-btn-code');
        if (!btn) return { status: 'no button', errors };
        btn.click();
        return { status: 'clicked', errors };
      } catch (e) {
        errors.push({ msg: e.message, stack: e.stack });
        return { status: 'threw', errors };
      } finally {
        window.onerror = origOnError;
      }
    });
    report.push('Click result: ' + JSON.stringify(clickResult, null, 2));
    report.push('');
    report.push('Step 7: Clicked code toggle button');

    await page.waitForTimeout(1500);

    // 8-9. Console errors
    report.push('');
    report.push('Step 8-9 - Console output (all messages):');
    const errors = consoleLogs.filter((l) => l.type === 'error');
    const warnings = consoleLogs.filter((l) => l.type === 'warning');

    if (consoleLogs.length === 0) {
      report.push('  (No console messages captured)');
    } else {
      consoleLogs.forEach((l) => {
        report.push(`  [${l.type}] ${l.text}`);
        if (l.url) report.push(`       at ${l.url}:${l.line || '?'}`);
      });
    }

    if (errors.length) {
      report.push('');
      report.push('--- ERRORS ---');
      errors.forEach((e) => report.push(e.text));
    }

    // Also check if code panel appeared
    const codeVisible = await page.locator('.modal-code.visible').count();
    report.push('');
    report.push('Code panel visible after click: ' + (codeVisible > 0));

    await page.screenshot({ path: join(OUTPUT_DIR, 'debug-toggle.png'), fullPage: false });
    report.push('Screenshot saved to debug-toggle.png');

  } catch (err) {
    report.push('ERROR: ' + err.message);
  } finally {
    await browser.close();
  }

  const text = report.join('\n');
  writeFileSync(join(OUTPUT_DIR, 'debug-toggle-report.txt'), text);
  console.log(text);
}

main();
