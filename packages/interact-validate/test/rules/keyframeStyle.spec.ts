import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// D14 — keyframe property names must be camelCase for WAAPI (e.g. backgroundColor, not
// background-color). CSS custom properties (--*) are allowed. Source: every trigger rule.

const CODE = 'KEYFRAME_PROP_NOT_CAMEL_CASE';

describe('keyframeStyle — KEYFRAME_PROP_NOT_CAMEL_CASE', () => {
  it('warns for a kebab-case keyframe property and suggests the camelCase form', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewEnter',
          effects: [
            {
              duration: 400,
              keyframeEffect: { name: 'bg', keyframes: [{ 'background-color': 'red' }] },
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual([
      'interactions',
      0,
      'effects',
      0,
      'keyframeEffect',
      'keyframes',
      0,
      'background-color',
    ]);
    expect(err?.message).toContain('backgroundColor');
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn for a camelCase property', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                duration: 400,
                keyframeEffect: { name: 'bg', keyframes: [{ backgroundColor: 'red' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a CSS custom property (--*)', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [
              {
                duration: 400,
                keyframeEffect: { name: 'var', keyframes: [{ '--my-var': '1' }] },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
