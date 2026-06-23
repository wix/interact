import { describe, expect, it } from 'vitest';
import { validateInteractConfig } from '../../src';

// D12 — pointerMove params.axis only applies to keyframeEffect; it is ignored for
// namedEffect/customEffect (which receive the full 2D progress). Source: pointermove.md.

const CODE = 'POINTER_AXIS_IGNORED';

describe('pointerAxis — POINTER_AXIS_IGNORED', () => {
  it('warns when axis is set and the effect uses a namedEffect', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'pointerMove',
          params: { axis: 'x' },
          effects: [{ namedEffect: { type: 'TrackMouse' }, fill: 'both' }],
        },
      ],
    });
    const err = result.errors.find((e) => e.code === CODE);
    expect(err).toBeDefined();
    expect(err?.severity).toBe('warning');
    expect(err?.path).toEqual(['interactions', 0, 'effects', 0]);
  });

  it('warns when axis is set and the effect uses a customEffect', () => {
    const result = validateInteractConfig({
      interactions: [
        {
          key: 'el',
          trigger: 'pointerMove',
          params: { axis: 'y' },
          effects: [{ customEffect: () => {}, fill: 'both' }],
        },
      ],
    });
    expect(result.errors.some((e) => e.code === CODE)).toBe(true);
  });

  describe('no warning for the documented valid patterns', () => {
    it('does not warn when axis is set and the effect uses a keyframeEffect', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            params: { axis: 'x' },
            effects: [
              {
                fill: 'both',
                keyframeEffect: { name: 'tilt', keyframes: [{ transform: 'rotate(0)' }] },
                selector: '.inner',
              },
            ],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });

    it('does not warn for a namedEffect when no axis is set', () => {
      const result = validateInteractConfig({
        interactions: [
          {
            key: 'el',
            trigger: 'pointerMove',
            effects: [{ namedEffect: { type: 'TrackMouse' }, fill: 'both' }],
          },
        ],
      });
      expect(result.errors.filter((e) => e.code === CODE)).toHaveLength(0);
    });
  });
});
