import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// D13 — a percentage RangeOffset value is 0–100. Source: viewprogress.md "value is 0–100".

const CODE = 'RANGE_OFFSET_OUT_OF_RANGE';

describe('rangeOffset — RANGE_OFFSET_OUT_OF_RANGE', () => {
  it('warns for a percentage rangeStart offset > 100', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewProgress',
          effects: [
            {
              fill: 'both',
              keyframeEffect: { name: 'p', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
              rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 150 } },
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'rangeStart', 'offset', 'value']);
  });

  it('warns for a negative percentage rangeEnd offset', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewProgress',
          effects: [
            {
              fill: 'both',
              keyframeEffect: { name: 'p', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
              rangeEnd: { name: 'cover', offset: { unit: 'percentage', value: -10 } },
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'rangeEnd', 'offset', 'value']);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn for an in-range percentage offset', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                fill: 'both',
                keyframeEffect: { name: 'p', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
                rangeStart: { name: 'cover', offset: { unit: 'percentage', value: 25 } },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a non-percentage (px) offset outside 0–100', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                fill: 'both',
                keyframeEffect: { name: 'p', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
                rangeStart: { name: 'cover', offset: { unit: 'px', value: 500 } },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
