import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// D10 — recommend `fill: 'both'` for scrubbed effects (viewProgress / pointerMove) and for
// toggling time effects (triggerType alternate/repeat/state). Source: full-lean fill guidance,
// hover.md / click.md CRITICAL.

const CODE = 'RECOMMENDED_FILL_BOTH';

describe('recommendedFill — RECOMMENDED_FILL_BOTH', () => {
  it('warns for a viewProgress effect that omits fill: both', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'viewProgress',
          effects: [
            {
              keyframeEffect: { name: 'p', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
              rangeStart: { name: 'cover' },
            },
          ],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0, 'fill']);
    expect(result.valid).toBe(true);
  });

  it('warns for a hover time effect with triggerType: alternate that omits fill: both', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'hover',
          effects: [{ namedEffect: { type: 'Pulse' }, duration: 300, triggerType: 'alternate' }],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn when fill: both is present on a scrubbed effect', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewProgress',
            effects: [
              {
                fill: 'both',
                keyframeEffect: { name: 'p', keyframes: [{ opacity: '0' }, { opacity: '1' }] },
                rangeStart: { name: 'cover' },
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a triggerType: once entrance effect without fill', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'viewEnter',
            effects: [{ namedEffect: { type: 'FadeIn' }, duration: 400, triggerType: 'once' }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
