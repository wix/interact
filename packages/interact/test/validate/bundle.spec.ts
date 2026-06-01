import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// fileURLToPath + dirname gives us the directory of this test file,
// which works correctly in vitest's jsdom environment.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_BUNDLE = path.resolve(__dirname, '../../dist/es/index.js');
const VALIDATE_BUNDLE = path.resolve(__dirname, '../../dist/es/validate.js');

describe('bundle isolation', () => {
  it('dist/es/index.js does not contain a zod import (zod must be tree-shaken from main bundle)', () => {
    if (!existsSync(INDEX_BUNDLE)) {
      console.warn(
        '[bundle test] dist/es/index.js not found — run `yarn build` first to enable this check',
      );
      return;
    }
    const content = readFileSync(INDEX_BUNDLE, 'utf8');
    // zod should only appear in dist/es/validate.js, never in the main bundle
    expect(content).not.toMatch(/["']zod["']/);
  });

  it('dist/es/validate.js exists after build (validate entry was compiled)', () => {
    if (!existsSync(INDEX_BUNDLE)) {
      console.warn('[bundle test] dist/ not found — run `yarn build` first to enable this check');
      return;
    }
    expect(existsSync(VALIDATE_BUNDLE)).toBe(true);
  });
});
