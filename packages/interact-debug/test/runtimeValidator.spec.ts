import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateRuntime,
  validateKeyRuntime,
  compareExpectedAnimations,
  captureWarnings,
  captureWarningsAsync,
} from '../src/inspect/runtimeValidator';
import type { InteractConfig } from '../src/types';

function makeConfig(interactions: any[], effects: Record<string, any> = {}): InteractConfig {
  return { effects, interactions };
}

function addKeyedElement(key: string, tag = 'div'): HTMLElement {
  const el = document.createElement(tag);
  el.setAttribute('data-interact-key', key);
  document.body.appendChild(el);
  return el;
}

describe('runtimeValidator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('validateRuntime', () => {
    it('passes when all keys have DOM elements', () => {
      addKeyedElement('hero');
      addKeyedElement('panel');
      const config = makeConfig([
        { key: 'hero', trigger: 'viewEnter', effects: [] },
        { key: 'panel', trigger: 'hover', effects: [] },
      ]);

      const results = validateRuntime(config);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.checks.find((c) => c.name === 'dom-element-exists')?.passed)).toBe(true);
    });

    it('fails when a key has no DOM element', () => {
      addKeyedElement('hero');
      const config = makeConfig([
        { key: 'hero', trigger: 'viewEnter', effects: [] },
        { key: 'missing', trigger: 'hover', effects: [] },
      ]);

      const results = validateRuntime(config);
      const missingResult = results.find((r) => r.key === 'missing');
      expect(missingResult?.passed).toBe(false);
      expect(missingResult?.checks.find((c) => c.name === 'dom-element-exists')?.passed).toBe(false);
    });

    it('deduplicates keys (only checks once per key)', () => {
      addKeyedElement('hero');
      const config = makeConfig([
        { key: 'hero', trigger: 'viewEnter', effects: [] },
        { key: 'hero', trigger: 'hover', effects: [] },
      ]);

      const results = validateRuntime(config);
      expect(results).toHaveLength(1);
    });
  });

  describe('validateKeyRuntime', () => {
    it('returns checks for a specific key', () => {
      addKeyedElement('hero');
      const config = makeConfig([
        { key: 'hero', trigger: 'viewEnter', effects: [{ effectId: 'fadeIn' }] },
      ], {
        fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
      });

      const result = validateKeyRuntime(config, 'hero');
      expect(result.key).toBe('hero');
      expect(result.checks.find((c) => c.name === 'dom-element-exists')?.passed).toBe(true);
    });

    it('fails all checks when element is missing', () => {
      const config = makeConfig([
        { key: 'hero', trigger: 'viewEnter', effects: [] },
      ]);

      const result = validateKeyRuntime(config, 'hero');
      expect(result.passed).toBe(false);
      expect(result.checks).toHaveLength(1);
      expect(result.checks[0].name).toBe('dom-element-exists');
    });
  });

  describe('compareExpectedAnimations', () => {
    it('counts expected animation effects for a key', () => {
      addKeyedElement('hero');
      const config = makeConfig([
        {
          key: 'hero', trigger: 'viewEnter',
          effects: [
            { effectId: 'fadeIn' },
            { effectId: 'slideIn' },
          ],
        },
      ], {
        fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
        slideIn: { keyframeEffect: { name: 'slide', keyframes: [{ transform: 'translateX(0)' }] }, duration: 500 },
      });

      const result = compareExpectedAnimations(config, 'hero');
      expect(result.expected).toBe(2);
      expect(result.actual).toBe(0); // no actual animations in jsdom
    });

    it('excludes state effects from expected count', () => {
      addKeyedElement('btn');
      const config = makeConfig([
        {
          key: 'btn', trigger: 'hover',
          effects: [
            { transition: { styleProperties: [{ name: 'color', value: 'red' }] } },
          ],
        },
      ]);

      const result = compareExpectedAnimations(config, 'btn');
      expect(result.expected).toBe(0);
    });

    it('excludes cross-key effects from expected count', () => {
      addKeyedElement('hero');
      const config = makeConfig([
        {
          key: 'hero', trigger: 'viewEnter',
          effects: [
            { effectId: 'fadeIn', key: 'banner' },
          ],
        },
      ], {
        fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
      });

      const result = compareExpectedAnimations(config, 'hero');
      expect(result.expected).toBe(0);
    });

    it('counts effects within sequences', () => {
      addKeyedElement('hero');
      const config = makeConfig([
        {
          key: 'hero', trigger: 'viewEnter',
          sequences: [{ effects: [{ effectId: 'fadeIn' }, { effectId: 'slideIn' }] }],
        },
      ], {
        fadeIn: { keyframeEffect: { name: 'fade', keyframes: [{ opacity: 0 }] }, duration: 500 },
        slideIn: { keyframeEffect: { name: 'slide', keyframes: [{ transform: 'translateX(0)' }] }, duration: 500 },
      });

      const result = compareExpectedAnimations(config, 'hero');
      expect(result.expected).toBe(2);
    });
  });

  describe('captureWarnings', () => {
    it('captures console.warn calls during callback', () => {
      const captured = captureWarnings(() => {
        console.warn('test warning 1');
        console.warn('test warning 2');
      });

      expect(captured).toHaveLength(2);
      expect(captured[0].message).toBe('test warning 1');
      expect(captured[1].message).toBe('test warning 2');
    });

    it('restores console.warn after callback', () => {
      const original = console.warn;
      captureWarnings(() => {});
      expect(console.warn).toBe(original);
    });

    it('restores console.warn even if callback throws', () => {
      const original = console.warn;
      expect(() => {
        captureWarnings(() => { throw new Error('oops'); });
      }).toThrow('oops');
      expect(console.warn).toBe(original);
    });

    it('includes timestamp on captured warnings', () => {
      const before = Date.now();
      const captured = captureWarnings(() => {
        console.warn('test');
      });
      const after = Date.now();

      expect(captured[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(captured[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('captureWarningsAsync', () => {
    it('captures warnings during async callback', async () => {
      const captured = await captureWarningsAsync(async () => {
        console.warn('async warning');
      });

      expect(captured).toHaveLength(1);
      expect(captured[0].message).toBe('async warning');
    });

    it('restores console.warn after async callback', async () => {
      const original = console.warn;
      await captureWarningsAsync(async () => {});
      expect(console.warn).toBe(original);
    });
  });
});
