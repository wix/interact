import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// A3 — `*Scroll` namedEffect presets used with viewProgress MUST declare
// `range: 'in' | 'out' | 'continuous'` (prefer 'continuous').
// Source: viewprogress.md Rule 1 + full-lean.md Animation-Payloads CRITICAL.

describe('scrollPresetRange', () => {
  it('warns (SCROLL_PRESET_MISSING_RANGE) when a scroll preset omits range', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewProgress',
          effects: [
            { namedEffect: { type: 'FadeScroll' }, rangeStart: { name: 'cover' }, fill: 'both' },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === 'SCROLL_PRESET_MISSING_RANGE');
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'namedEffect', 'range']);
    expect(result.valid).toBe(true);
  });

  it('warns (SCROLL_PRESET_BAD_RANGE) when range is not one of in/out/continuous', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewProgress',
          effects: [{ namedEffect: { type: 'FadeScroll', range: 'sideways' }, fill: 'both' }],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === 'SCROLL_PRESET_BAD_RANGE');
    expect(err).toBeDefined();
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'namedEffect', 'range']);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn when a scroll preset declares range: continuous', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ namedEffect: { type: 'FadeScroll', range: 'continuous' }, fill: 'both' }],
          },
        ],
      });
      const scrollCodes = ['SCROLL_PRESET_MISSING_RANGE', 'SCROLL_PRESET_BAD_RANGE'];
      expect(result.errors.filter((e) => scrollCodes.includes(e.code))).toHaveLength(0);
    });

    it('does not warn for ParallaxScroll, which has no range option', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [{ namedEffect: { type: 'ParallaxScroll' }, fill: 'both' }],
          },
        ],
      });
      const scrollCodes = ['SCROLL_PRESET_MISSING_RANGE', 'SCROLL_PRESET_BAD_RANGE'];
      expect(result.errors.filter((e) => scrollCodes.includes(e.code))).toHaveLength(0);
    });

    it('does not warn for a non-scroll preset on viewProgress', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              { namedEffect: { type: 'FadeIn' }, rangeStart: { name: 'cover' }, fill: 'both' },
            ],
          },
        ],
      });
      const scrollCodes = ['SCROLL_PRESET_MISSING_RANGE', 'SCROLL_PRESET_BAD_RANGE'];
      expect(result.errors.filter((e) => scrollCodes.includes(e.code))).toHaveLength(0);
    });
  });
});
